import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AuthGate from '@/components/AuthGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ironroot } from '@/lib/ironrootClient';
import { useAuth } from '@/lib/useAuth';
import {
  base64ToBytes,
  bytesToBase64,
  sha256Hex,
} from '@/lib/forensicWatermark';

const shortHash = (hash) => (hash ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : '—');

const downloadBytes = ({ bytes, filename, mimeType }) => {
  const blob = new Blob([bytes], { type: mimeType || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

const classifyFileRisk = ({ filename, mimeType }) => {
  const lower = (filename || '').toLowerCase();
  const mime = (mimeType || '').toLowerCase();
  const executableExt = ['.exe', '.dll', '.app', '.dmg', '.pkg', '.msi', '.jar', '.bat', '.cmd', '.ps1', '.sh'];
  const macroExt = ['.docm', '.xlsm', '.pptm'];

  if (executableExt.some((ext) => lower.endsWith(ext))) {
    return { risk: 'high', reason: 'Executable or script file type.' };
  }
  if (macroExt.some((ext) => lower.endsWith(ext))) {
    return { risk: 'high', reason: 'Macro-enabled Office document.' };
  }
  if (mime.includes('pdf') || lower.endsWith('.pdf')) {
    return { risk: 'medium', reason: 'PDF documents can embed active content; sandbox recommended.' };
  }
  if (mime.startsWith('text/')) {
    return { risk: 'low', reason: 'Text-based document.' };
  }
  return { risk: 'medium', reason: 'Unknown or binary document type.' };
};

export default function DocumentVaultPage() {
  const { user, org } = useAuth();
  const queryClient = useQueryClient();
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [verifyState, setVerifyState] = useState({ status: 'idle', message: '', details: null });

  const isOwner = user?.role === 'owner' || (org?.ownerEmail && user?.email === org.ownerEmail);
  const isAdmin = user?.role === 'admin' || isOwner;
  const watermarkFeatureEnabled = !!org?.features?.forensicWatermarking;

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', org?.id],
    queryFn: () => ironroot.integrations.Vault.listDocuments({ orgId: org?.id }),
    enabled: !!user && !!org?.id,
  });

  const { data: watermarkConfig } = useQuery({
    queryKey: ['watermarkConfig', org?.id],
    queryFn: () => ironroot.integrations.Forensics.getConfig({ orgId: org?.id, ownerEmail: org?.ownerEmail }),
    enabled: !!user && !!org?.id,
  });

  const { data: watermarkEvents = [] } = useQuery({
    queryKey: ['watermarkEvents', org?.id],
    queryFn: () => ironroot.integrations.Forensics.events({ orgId: org?.id }),
    enabled: !!user && isAdmin && !!org?.id,
  });

  const { data: verificationRequests = [] } = useQuery({
    queryKey: ['wmVerificationRequests', org?.id],
    queryFn: () => ironroot.integrations.Forensics.requests.list({ orgId: org?.id }),
    enabled: !!user && isOwner && !!org?.id,
  });

  const downloadsByDoc = useMemo(() => {
    const map = {};
    watermarkEvents.forEach((event) => {
      if (!event.documentId) return;
      map[event.documentId] = map[event.documentId] || { count: 0, last: null };
      map[event.documentId].count += 1;
      if (!map[event.documentId].last || (event.downloadedAt || '') > (map[event.documentId].last || '')) {
        map[event.documentId].last = event.downloadedAt || null;
      }
    });
    return map;
  }, [watermarkEvents]);

  const watermarkingEnabled = watermarkFeatureEnabled && watermarkConfig?.forensicWatermarkingEnabled;

  const sandboxEnrich = async ({ docId, docHash, filename, mimeType }) => {
    const heuristic = classifyFileRisk({ filename, mimeType });
    const startedAt = new Date().toISOString();
    await ironroot.integrations.Vault.updateDocument({
      id: docId,
      orgId: org?.id,
      updates: { sandbox: { status: 'scanning', startedAt, heuristic } },
    });

    let vt = null;
    let vtMode = 'off';
    try {
      const response = await ironroot.integrations.External.query({
        provider: 'virustotal',
        path: `v3/files/${docHash}`,
      });
      if (response?.ok) {
        vt = response.data;
        vtMode = response.demo ? 'demo' : 'live';
      }
    } catch {
      vt = null;
    }

    const vtEntry = Array.isArray(vt?.data) ? vt.data[0] : vt?.data;
    const stats = vtEntry?.attributes?.last_analysis_stats || null;
    const malicious = stats?.malicious || 0;
    const suspicious = stats?.suspicious || 0;
    const verdict = malicious > 0 ? 'malicious' : suspicious > 0 ? 'suspicious' : 'clean';

    const finishedAt = new Date().toISOString();
    await ironroot.integrations.Vault.updateDocument({
      id: docId,
      orgId: org?.id,
      updates: {
        quarantined: verdict === 'malicious',
        sandbox: {
          status: 'complete',
          startedAt,
          finishedAt,
          heuristic,
          vt: stats
            ? { provider: 'virustotal', mode: vtMode, stats }
            : { provider: 'virustotal', mode: vtMode, stats: null },
          verdict,
        },
      },
    });
  };

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploadBusy(true);
    setUploadError('');
    try {
      for (const file of fileList) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const docHash = await sha256Hex(bytes);
        const contentBase64 = bytesToBase64(bytes);

        const record = await ironroot.integrations.Vault.createDocument({
          orgId: org?.id,
          ownerEmail: org?.ownerEmail,
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          contentBase64,
          createdByEmail: user?.email || 'unknown',
        });

        if (record && isAdmin) {
          await ironroot.entities.ActivityLog.create({
            userEmail: user?.email || 'system',
            action: 'document_uploaded',
            details: { documentId: record.id, filename: record.filename, size: record.size, docHash: record.docHash || docHash },
            timestamp: new Date().toISOString(),
          });
        }

        if (record) {
          sandboxEnrich({
            docId: record.id,
            docHash: record.docHash || docHash,
            filename: record.filename,
            mimeType: record.mimeType,
          }).catch(() => {});
        }
      }
      queryClient.invalidateQueries({ queryKey: ['documents', org?.id] });
    } catch (err) {
      setUploadError(err?.message || 'Upload failed.');
    } finally {
      setUploadBusy(false);
    }
  };

  const handleDownload = async (doc, { watermark = false } = {}) => {
    if (!doc?.contentBase64) return;
    if (!org?.id) {
      setVerifyState({ status: 'error', message: 'Organization context is missing.', details: null });
      return;
    }
    if (doc.quarantined) {
      setVerifyState({ status: 'error', message: 'This document is quarantined by sandbox policy.', details: null });
      return;
    }
    const bytes = base64ToBytes(doc.contentBase64);

    if (!watermark) {
      downloadBytes({ bytes, filename: doc.filename, mimeType: doc.mimeType });
      return;
    }

    if (!watermarkFeatureEnabled) {
      setVerifyState({ status: 'error', message: 'Forensic watermarking is not enabled for your plan.', details: null });
      return;
    }

    if (!watermarkingEnabled) {
      setVerifyState({ status: 'error', message: 'Forensic watermarking is not enabled by the owner yet.', details: null });
      return;
    }

    const result = await ironroot.integrations.Forensics.embed({
      orgId: org?.id,
      ownerEmail: org?.ownerEmail,
      featureEnabled: watermarkFeatureEnabled,
      user: {
        id: user?.id || null,
        email: user?.email || 'unknown',
        fullName: user?.fullName || '',
        role: user?.role || 'user',
      },
      document: {
        id: doc.id,
        filename: doc.filename,
        mimeType: doc.mimeType,
        contentBase64: doc.contentBase64,
        docHash: doc.docHash,
      },
    });

    if (!result?.ok) {
      setVerifyState({ status: 'error', message: result?.error || 'Watermarking failed.', details: null });
      return;
    }

    const watermarked = result.watermarked;

    if (isAdmin) {
      await ironroot.entities.ActivityLog.create({
        userEmail: user?.email || 'system',
        action: 'document_download_watermarked',
        details: { documentId: doc.id, watermarkId: result?.event?.watermarkId, forensicId: result?.event?.forensicId },
        timestamp: new Date().toISOString(),
      });
    }

    queryClient.invalidateQueries({ queryKey: ['watermarkEvents', org?.id] });
    downloadBytes({
      bytes: base64ToBytes(watermarked.contentBase64),
      filename: watermarked.filename,
      mimeType: watermarked.mimeType,
    });
  };

  const handleVerifyFile = async (file) => {
    if (!file) return;
    if (!org?.id) {
      setVerifyState({ status: 'error', message: 'Organization context is missing.', details: null });
      return;
    }
    setVerifyState({ status: 'working', message: 'Analyzing file…', details: null });

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      if (!isOwner) {
        const fileHash = await sha256Hex(bytes);
        await ironroot.integrations.Forensics.requests.create({
          orgId: org?.id,
          requesterEmail: user?.email || 'unknown',
          filename: file.name,
          fileHash,
        });
        setVerifyState({
          status: 'error',
          message: 'Verification requires owner approval. A request has been submitted to the owner.',
          details: null,
        });
        queryClient.invalidateQueries({ queryKey: ['wmVerificationRequests', org?.id] });
        return;
      }

      const result = await ironroot.integrations.Forensics.verify({
        orgId: org?.id,
        ownerEmail: org?.ownerEmail,
        requesterEmail: user?.email || 'owner',
        filename: file.name,
        contentBase64: bytesToBase64(bytes),
      });

      if (!result?.ok) {
        setVerifyState({ status: 'error', message: result?.error || 'Verification failed.', details: null });
        return;
      }

      setVerifyState({
        status: 'ok',
        message: result?.result?.signatureValid ? 'Watermark verified.' : 'Watermark found but signature is invalid (possible tampering).',
        details: result?.result || null,
      });
    } catch (err) {
      setVerifyState({ status: 'error', message: err?.message || 'Verification failed.', details: null });
    }
  };

  const pendingForensics = useMemo(
    () => (verificationRequests || []).filter((item) => item.status === 'pending'),
    [verificationRequests]
  );

  const approveRequest = async (request) => {
    await ironroot.integrations.Forensics.requests.update({
      id: request.id,
      status: 'approved',
      approvedBy: user?.email || 'owner',
    });
    await ironroot.entities.Notification.create({
      title: 'Forensics request approved',
      message: 'The owner approved your forensic verification request. Please contact the owner to run verification.',
      isRead: false,
      type: 'success',
      userEmail: request.requesterEmail,
      orgId: request.orgId || org?.id || null,
    });
    queryClient.invalidateQueries({ queryKey: ['wmVerificationRequests', org?.id] });
  };

  const denyRequest = async (request) => {
    await ironroot.integrations.Forensics.requests.update({
      id: request.id,
      status: 'denied',
      approvedBy: user?.email || 'owner',
    });
    await ironroot.entities.Notification.create({
      title: 'Forensics request denied',
      message: 'The owner denied your forensic verification request.',
      isRead: false,
      type: 'warning',
      userEmail: request.requesterEmail,
      orgId: request.orgId || org?.id || null,
    });
    queryClient.invalidateQueries({ queryKey: ['wmVerificationRequests', org?.id] });
  };

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h1 className="title-lg">Document Vault &amp; Leak Forensics</h1>
          <p className="text-lead">
            Sandbox documents, control downloads, and optionally apply per-download forensic watermarks for “who did it” investigations.
          </p>
        </div>

        <AuthGate
          title="Document Vault requires sign-in"
          description="Log in to upload files, sandbox them, and manage controlled downloads."
          feature="documentVault"
        >
          <div className="grid" style={{ gap: '18px' }}>
            <Card className="card--glass">
              <CardHeader className="card__header">
                <CardTitle className="card__title">Upload &amp; Sandbox</CardTitle>
              </CardHeader>
              <CardContent className="card__content">
                <div style={{ display: 'grid', gap: '12px' }}>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => handleUpload(Array.from(e.target.files || []))}
                    disabled={uploadBusy}
                  />
                  {uploadError && <div className="alert">{uploadError}</div>}
                  <p className="card__meta">
                    Files are hashed locally (SHA-256). If VirusTotal is configured, we enrich by hash lookup only (no file upload).
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card--glass">
              <CardHeader className="card__header">
                <CardTitle className="card__title">Vault Documents</CardTitle>
              </CardHeader>
              <CardContent className="card__content">
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-compact">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Type</th>
                        <th>SHA-256</th>
                        <th>Sandbox</th>
                        <th>Downloads</th>
                        <th>Last Download</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => {
                        const downloads = downloadsByDoc[doc.id] || { count: 0, last: null };
                        const verdict = doc?.sandbox?.verdict || doc?.sandbox?.status || '—';
                        const badgeClass =
                          verdict === 'malicious'
                            ? 'badge badge--warning'
                            : verdict === 'suspicious'
                              ? 'badge badge--warning'
                              : 'badge';
                        const quarantined = !!doc.quarantined;

                        return (
                          <tr key={doc.id}>
                            <td>
                              <div style={{ display: 'grid', gap: '4px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{doc.filename}</span>
                                <span className="card__meta">{doc.size ? `${Math.round(doc.size / 1024)} KB` : '—'}</span>
                              </div>
                            </td>
                            <td className="card__meta">{doc.mimeType || '—'}</td>
                            <td className="card__meta" title={doc.docHash}>{shortHash(doc.docHash)}</td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                <span className={badgeClass}>{verdict}</span>
                                {quarantined && <span className="badge badge--warning">quarantined</span>}
                              </div>
                            </td>
                            <td className="card__meta">{isAdmin ? downloads.count : '—'}</td>
                            <td className="card__meta">{isAdmin && downloads.last ? new Date(downloads.last).toLocaleString() : '—'}</td>
                            <td>
                              <div className="table__actions">
                                <Button
                                  variant="ghost"
                                  onClick={() => handleDownload(doc, { watermark: false })}
                                  disabled={quarantined}
                                  title={quarantined ? 'Quarantined by sandbox policy' : 'Download'}
                                >
                                  Download
                                </Button>
                                <Button
                                  variant="primary"
                                  onClick={() => handleDownload(doc, { watermark: true })}
                                  disabled={!watermarkingEnabled || quarantined}
                                  title={
                                    quarantined
                                      ? 'Quarantined by sandbox policy'
                                      : watermarkingEnabled
                                        ? 'Download with forensic watermark'
                                        : 'Enable Forensic Watermarking in Control Center'
                                  }
                                >
                                  Watermarked
                                </Button>
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    onClick={() => sandboxEnrich({ docId: doc.id, docHash: doc.docHash, filename: doc.filename, mimeType: doc.mimeType })}
                                  >
                                    Re-sandbox
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {documents.length === 0 && (
                        <tr>
                          <td colSpan={7} className="card__meta">
                            No documents uploaded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="card--glass">
              <CardHeader className="card__header">
                <CardTitle className="card__title">Who Did It (Owner Verification)</CardTitle>
              </CardHeader>
              <CardContent className="card__content">
                <div style={{ display: 'grid', gap: '12px' }}>
                  <p className="card__meta">
                    Upload a downloaded document to extract the forensic watermark and resolve the responsible user, timestamp, and forensic ID.
                  </p>
                  <Input type="file" onChange={(e) => handleVerifyFile(e.target.files?.[0])} />
                  {verifyState.status !== 'idle' && (
                    <div className={verifyState.status === 'ok' ? 'alert' : 'alert'}>
                      <strong>{verifyState.message}</strong>
                      {verifyState.details && (
                        <div style={{ marginTop: '10px', overflowX: 'auto' }}>
                          <table className="table table-compact">
                            <tbody>
                              {Object.entries(verifyState.details).map(([key, value]) => (
                                <tr key={key}>
                                  <td className="card__meta" style={{ fontWeight: 700 }}>{key}</td>
                                  <td className="card__meta">{String(value)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                  {!isOwner && (
                    <p className="card__meta">
                      Only the organization owner can verify forensic watermarks. Uploading a file will create a verification request for owner approval.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {isOwner && (
              <Card className="card--glass">
                <CardHeader className="card__header">
                  <CardTitle className="card__title">Pending Forensics Requests</CardTitle>
                </CardHeader>
                <CardContent className="card__content">
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table table-compact">
                      <thead>
                        <tr>
                          <th>Requester</th>
                          <th>File</th>
                          <th>Status</th>
                          <th>Requested</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingForensics.map((req) => (
                          <tr key={req.id}>
                            <td className="card__meta">{req.requesterEmail}</td>
                            <td className="card__meta">{req.filename || '—'}</td>
                            <td>
                              <Badge>{req.status}</Badge>
                            </td>
                            <td className="card__meta">{req.created_date ? new Date(req.created_date).toLocaleString() : '—'}</td>
                            <td>
                              <div className="table__actions">
                                <Button variant="primary" onClick={() => approveRequest(req)}>
                                  Approve
                                </Button>
                                <Button variant="ghost" onClick={() => denyRequest(req)}>
                                  Deny
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {pendingForensics.length === 0 && (
                          <tr>
                            <td colSpan={5} className="card__meta">No pending requests.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="card--glass">
              <CardHeader className="card__header">
                <CardTitle className="card__title">Watermarking Status</CardTitle>
              </CardHeader>
              <CardContent className="card__content">
                <div className="grid grid-3" style={{ gap: '12px' }}>
                  <div className="stat-card">
                    <div className="stat-card__label">Plan Feature</div>
                    <div className="stat-card__value" style={{ fontSize: '1.35rem' }}>
                      {watermarkFeatureEnabled ? 'Available' : 'Unavailable'}
                    </div>
                    <div className="stat-card__meta">
                      Controls whether your org can use forensic watermarking.
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card__label">Owner Enablement</div>
                    <div className="stat-card__value" style={{ fontSize: '1.35rem' }}>
                      {watermarkingEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                    <div className="stat-card__meta">
                      Only the owner can enable server-side signing.
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card__label">Signing Secret</div>
                    <div className="stat-card__value" style={{ fontSize: '1.35rem' }}>
                      {watermarkConfig?.secretConfigured ? 'Configured' : 'Missing'}
                    </div>
                    <div className="stat-card__meta">
                      Stored server-side to prevent forgery.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AuthGate>
      </div>
    </div>
  );
}
