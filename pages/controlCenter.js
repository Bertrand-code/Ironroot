import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, UserCheck, Settings, Lock } from 'lucide-react';
import AuthGate from '@/components/AuthGate';
import { ironroot } from '@/lib/ironrootClient';
import { useAuth } from '@/lib/useAuth';

const featureCatalog = [
  {
    key: 'advancedPentest',
    label: 'AI Penetration Testing',
    description: 'Continuous adversary simulation with exploit validation.',
  },
  {
    key: 'threatIntelLive',
    label: 'Live Threat Intelligence Feeds',
    description: 'External intel enrichment, IOC tracking, and CVE live lookups.',
  },
  {
    key: 'codeScannerPro',
    label: 'Enterprise Code Scanning',
    description: 'Advanced SAST, secrets scanning, and repo-wide insights.',
  },
  {
    key: 'reportExports',
    label: 'Executive Report Exports',
    description: 'PDF-ready reporting for leadership and compliance.',
  },
  {
    key: 'attackSurfaceMonitoring',
    label: 'Attack Surface Monitoring',
    description: 'Asset inventory, exposure tracking, and ASM workflows.',
  },
  {
    key: 'riskRegister',
    label: 'Risk Register',
    description: 'Business risk governance and mitigation tracking.',
  },
  {
    key: 'complianceAutomation',
    label: 'Compliance Automation',
    description: 'Policy mapping and evidence capture for audits.',
  },
  {
    key: 'documentVault',
    label: 'Secure Document Vault',
    description: 'Sandbox uploads, control downloads, and retain forensic audit trails.',
  },
  {
    key: 'forensicWatermarking',
    label: 'Forensic Watermarking',
    description: 'Per-download watermarking with “who did it” verification for leak investigations.',
  },
  {
    key: 'securityTraining',
    label: 'Security Awareness Training',
    description: 'Phishing simulations, policy training, and user risk scoring.',
  },
];

export default function ControlCenter() {
  const { user, org } = useAuth();
  const queryClient = useQueryClient();
  const [orgState, setOrgState] = useState(null);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [securityForm, setSecurityForm] = useState({
    sessionTimeoutMins: 45,
    aiRequestsPerMin: 30,
    screenWatermarkingEnabled: false,
    captureSignalsEnabled: false,
    secureViewMode: false,
  });

  useEffect(() => {
    if (org) {
      setOrgState(org);
      setOwnerEmail(org.ownerEmail || '');
      setSecurityForm({
        sessionTimeoutMins: org.security?.sessionTimeoutMins || 45,
        aiRequestsPerMin: org.security?.aiRequestsPerMin || 30,
        screenWatermarkingEnabled: !!org.security?.screenWatermarkingEnabled,
        captureSignalsEnabled: !!org.security?.captureSignalsEnabled,
        secureViewMode: !!org.security?.secureViewMode,
      });
    }
  }, [org]);

  const { data: adminRequests = [] } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: () => ironroot.entities.AdminRequest.list('-created_date'),
    enabled: !!user,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => ironroot.entities.User.list('-created_date'),
    enabled: !!user,
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['orgs'],
    queryFn: () => ironroot.entities.Organization.list('name'),
    enabled: !!user,
  });

  const { data: forensicsConfig } = useQuery({
    queryKey: ['forensicsConfig', org?.id],
    queryFn: () => ironroot.integrations.Forensics.getConfig({ orgId: org?.id, ownerEmail: ownerEmail || org?.ownerEmail }),
    enabled: !!user && !!org?.id,
  });

  const adminUsers = useMemo(() => users.filter((item) => ['admin', 'owner'].includes(item.role)), [users]);
  const pendingAdminRequests = useMemo(
    () => adminRequests.filter((request) => request.status === 'pending').length,
    [adminRequests]
  );
  const orgMap = useMemo(
    () => orgs.reduce((acc, orgItem) => {
      acc[orgItem.id] = orgItem.name;
      return acc;
    }, {}),
    [orgs]
  );
  const orgUserCounts = useMemo(() => {
    return users.reduce((acc, item) => {
      if (!item.orgId) return acc;
      acc[item.orgId] = (acc[item.orgId] || 0) + 1;
      return acc;
    }, {});
  }, [users]);

  const toggleFeature = async (key) => {
    if (!orgState) return;
    const next = { ...orgState.features, [key]: !orgState.features?.[key] };
    const updated = await ironroot.entities.Organization.update(orgState.id, { features: next });
    setOrgState(updated);
    queryClient.invalidateQueries({ queryKey: ['orgs'] });
    if (key === 'forensicWatermarking') {
      await ironroot.integrations.Forensics.updateConfig({
        orgId: orgState.id,
        ownerEmail: ownerEmail || orgState.ownerEmail,
        enable: next.forensicWatermarking,
      });
    }
  };

  const saveOwnerEmail = async () => {
    if (!orgState) return;
    const updated = await ironroot.entities.Organization.update(orgState.id, { ownerEmail });
    setOrgState(updated);
  };

  const saveSecurity = async () => {
    if (!orgState) return;
    const security = {
      sessionTimeoutMins: Number(securityForm.sessionTimeoutMins) || 45,
      aiRequestsPerMin: Number(securityForm.aiRequestsPerMin) || 30,
      screenWatermarkingEnabled: !!securityForm.screenWatermarkingEnabled,
      captureSignalsEnabled: !!securityForm.captureSignalsEnabled,
      secureViewMode: !!securityForm.secureViewMode,
    };
    const updated = await ironroot.entities.Organization.update(orgState.id, { security });
    setOrgState(updated);
    await ironroot.entities.ActivityLog.create({
      userEmail: user.email,
      action: 'security_policy_updated',
      details: security,
      timestamp: new Date().toISOString(),
    });
  };

  const toggleAdminForensics = async () => {
    if (!orgState) return;
    const next = !forensicsConfig?.allowAdminVerify;
    await ironroot.integrations.Forensics.updateConfig({
      orgId: orgState.id,
      ownerEmail: ownerEmail || orgState.ownerEmail,
      allowAdminVerify: next,
    });
    queryClient.invalidateQueries({ queryKey: ['forensicsConfig', orgState.id] });
    await ironroot.entities.ActivityLog.create({
      userEmail: user.email,
      action: 'forensics_admin_access_updated',
      details: { allowAdminVerify: next },
      timestamp: new Date().toISOString(),
    });
  };

  const approveAdmin = async (request) => {
    const userRecord = await ironroot.users.inviteUser(request.email, 'admin', orgState?.id || null);
    await ironroot.entities.AdminRequest.update(request.id, { status: 'approved' });
    await ironroot.entities.ActivityLog.create({
      userEmail: user.email,
      action: 'admin_request_approved',
      details: { email: request.email, userId: userRecord.id },
      timestamp: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const denyAdmin = async (request) => {
    await ironroot.entities.AdminRequest.update(request.id, { status: 'denied' });
    await ironroot.entities.ActivityLog.create({
      userEmail: user.email,
      action: 'admin_request_denied',
      details: { email: request.email },
      timestamp: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
  };

  const revokeAdmin = async (target) => {
    if (target.role === 'owner') return;
    await ironroot.users.assignRole({ userId: target.id, role: 'user' });
    await ironroot.entities.ActivityLog.create({
      userEmail: user.email,
      action: 'admin_revoked',
      details: { email: target.email },
      timestamp: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <AuthGate
          title="Owner control required"
          description="Only the platform owner can manage global access, feature flags, and security policies."
          ownerOnly
        >
          <div className="admin-hero" style={{ marginBottom: '28px' }}>
            <div>
              <span className="eyebrow">Owner Control</span>
              <h1 className="title-lg">Owner Control Center</h1>
              <p className="text-lead">
                Govern access, feature flags, and security policies across every tenant from a single console.
              </p>
              <div className="admin-pill" style={{ marginTop: '12px' }}>
                Owner: {ownerEmail || orgState?.ownerEmail || user?.email}
              </div>
              <div className="admin-hero__actions">
                <Button variant="outline" onClick={() => (window.location.href = '/adminDashboard')}>Admin Dashboard</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/userManagement')}>User Management</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/documentVault')}>Document Vault</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/assetInventory')}>Asset Inventory</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/riskRegister')}>Risk Register</Button>
              </div>
            </div>
            <div className="admin-hero__stats">
              <div className="admin-kpi">
                <div className="admin-kpi__label">Organizations</div>
                <div className="admin-kpi__value">{orgs.length}</div>
                <div className="card__meta">Active company accounts</div>
              </div>
              <div className="admin-kpi">
                <div className="admin-kpi__label">Admins</div>
                <div className="admin-kpi__value">{adminUsers.length}</div>
                <div className="card__meta">Privileged operators</div>
              </div>
              <div className="admin-kpi">
                <div className="admin-kpi__label">Pending Requests</div>
                <div className="admin-kpi__value">{pendingAdminRequests}</div>
                <div className="card__meta">Awaiting approval</div>
              </div>
              <div className="admin-kpi">
                <div className="admin-kpi__label">Total Users</div>
                <div className="admin-kpi__value">{users.length}</div>
                <div className="card__meta">Across all orgs</div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 mb-8">
            <Card className="card--glass">
              <CardHeader>
                <CardTitle>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                    <UserCheck size={18} />
                    Ownership &amp; Policies
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table w-full text-sm text-left text-gray-300 table-fixed">
                    <colgroup>
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '32%' }} />
                      <col style={{ width: '40%' }} />
                    </colgroup>
                    <thead className="text-xs uppercase text-gray-500 border-b border-gray-800">
                      <tr>
                        <th className="py-3 pr-4">Policy</th>
                        <th className="py-3 pr-4">Current</th>
                        <th className="py-3 pr-4">Configure</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 pr-4">
                          <div style={{ display: 'grid', gap: '6px' }}>
                            <span className="field-chip">Forensics Access</span>
                            <span className="card__meta" style={{ whiteSpace: 'normal' }}>
                              Allow trusted admins to verify forensic watermarks.
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 card__meta" style={{ whiteSpace: 'normal' }}>
                          Admin verification: {forensicsConfig?.allowAdminVerify ? 'Allowed' : 'Owner only'}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="table__actions" style={{ flexWrap: 'wrap' }}>
                            <Button variant="ghost" onClick={toggleAdminForensics}>
                              {forensicsConfig?.allowAdminVerify ? 'Restrict to Owner' : 'Allow Admin Verification'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4">
                          <div style={{ display: 'grid', gap: '6px' }}>
                            <span className="field-chip">Owner</span>
                            <span className="card__meta" style={{ whiteSpace: 'normal' }}>
                              Email responsible for approvals and privileged actions.
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 card__meta" style={{ whiteSpace: 'normal' }}>
                          {ownerEmail || orgState?.ownerEmail || user?.email}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="table__actions" style={{ flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ flex: 1, minWidth: '220px' }}>
                              <Input
                                value={ownerEmail}
                                onChange={(e) => setOwnerEmail(e.target.value)}
                                placeholder="owner@company.com"
                              />
                            </div>
                            <Button onClick={saveOwnerEmail}>Update Owner</Button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4">
                          <div style={{ display: 'grid', gap: '6px' }}>
                            <span className="field-chip">Security</span>
                            <span className="card__meta" style={{ whiteSpace: 'normal' }}>
                              Session TTL and AI request throttling.
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 card__meta" style={{ whiteSpace: 'normal' }}>
                          Session timeout: {orgState?.security?.sessionTimeoutMins || securityForm.sessionTimeoutMins}m
                          <br />
                          AI requests/min: {orgState?.security?.aiRequestsPerMin || securityForm.aiRequestsPerMin}
                          <br />
                          Screen watermark: {orgState?.security?.screenWatermarkingEnabled ? 'Enabled' : 'Disabled'}
                          <br />
                          Capture signals: {orgState?.security?.captureSignalsEnabled ? 'Enabled' : 'Disabled'}
                          <br />
                          Secure view mode: {orgState?.security?.secureViewMode ? 'Enabled' : 'Disabled'}
                        </td>
                        <td className="py-3 pr-4">
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                              gap: '12px',
                              alignItems: 'end',
                            }}
                          >
                            <div>
                              <label className="card__meta">Session timeout (mins)</label>
                              <Input
                                type="number"
                                value={securityForm.sessionTimeoutMins}
                                onChange={(e) => setSecurityForm((prev) => ({ ...prev, sessionTimeoutMins: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="card__meta">AI requests / min</label>
                              <Input
                                type="number"
                                value={securityForm.aiRequestsPerMin}
                                onChange={(e) => setSecurityForm((prev) => ({ ...prev, aiRequestsPerMin: e.target.value }))}
                              />
                            </div>
                            <div style={{ display: 'grid', gap: '6px' }}>
                              <label className="card__meta">Screen watermark</label>
                              <label className="card__meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={securityForm.screenWatermarkingEnabled}
                                  onChange={(e) =>
                                    setSecurityForm((prev) => ({ ...prev, screenWatermarkingEnabled: e.target.checked }))
                                  }
                                />
                                Enable watermark overlay
                              </label>
                            </div>
                            <div style={{ display: 'grid', gap: '6px' }}>
                              <label className="card__meta">Capture signals</label>
                              <label className="card__meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={securityForm.captureSignalsEnabled}
                                  onChange={(e) =>
                                    setSecurityForm((prev) => ({ ...prev, captureSignalsEnabled: e.target.checked }))
                                  }
                                />
                                Log screen-capture signals
                              </label>
                            </div>
                            <div style={{ display: 'grid', gap: '6px' }}>
                              <label className="card__meta">Secure view</label>
                              <label className="card__meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={securityForm.secureViewMode}
                                  onChange={(e) =>
                                    setSecurityForm((prev) => ({ ...prev, secureViewMode: e.target.checked }))
                                  }
                                />
                                Reduce copy risk
                              </label>
                            </div>
                            <div>
                              <Button onClick={saveSecurity}>Save Policy</Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4">
                          <div style={{ display: 'grid', gap: '6px' }}>
                            <span className="field-chip">Organization</span>
                            <span className="card__meta" style={{ whiteSpace: 'normal' }}>
                              Snapshot view of the active tenant.
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 card__meta" style={{ whiteSpace: 'normal' }}>
                          {orgState?.name || 'Unknown'}
                          <br />
                          Plan: {orgState?.plan || 'N/A'} · Users: {users.length} · Admins: {adminUsers.length}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="table__actions" style={{ flexWrap: 'wrap' }}>
                            <Button variant="ghost" onClick={() => (window.location.href = '/documentVault')}>
                              Open Vault
                            </Button>
                            <Button variant="ghost" onClick={() => (window.location.href = '/adminDashboard')}>
                              Open Admin
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="card__meta" style={{ marginTop: '12px' }}>
                  Owner email is required for admin approvals. Policy changes apply immediately.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Feature Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Feature</th>
                        <th className="py-3 pr-4">Description</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {featureCatalog.map((feature) => (
                      <tr key={feature.key}>
                        <td className="py-3 pr-4 text-white">{feature.label}</td>
                        <td className="py-3 pr-4 text-gray-400">{feature.description}</td>
                        <td className="py-3 pr-4 text-gray-400">
                          {orgState?.features?.[feature.key] ? 'Enabled' : 'Disabled'}
                        </td>
                        <td className="py-3 pr-4">
                          <Button variant="ghost" onClick={() => toggleFeature(feature.key)}>
                            {orgState?.features?.[feature.key] ? 'Disable' : 'Enable'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Access Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                      <tr>
                        <th className="py-3 pr-4">Requester</th>
                        <th className="py-3 pr-4">Reason</th>
                        <th className="py-3 pr-4">Requested By</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {adminRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="py-3 pr-4 text-white">
                            <a href={`/userManagement?query=${encodeURIComponent(request.email)}`} className="underline">
                              {request.email}
                            </a>
                          </td>
                          <td className="py-3 pr-4 text-gray-400">{request.reason || '—'}</td>
                          <td className="py-3 pr-4 text-gray-400">{request.requestedBy || '—'}</td>
                          <td className="py-3 pr-4">
                            <Badge className={request.status === 'approved' ? 'bg-green-500' : request.status === 'denied' ? 'bg-red-500' : 'bg-yellow-500'}>
                              {request.status || 'pending'}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex gap-2">
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                disabled={request.status !== 'pending'}
                                onClick={() => approveAdmin(request)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                disabled={request.status !== 'pending'}
                                onClick={() => denyAdmin(request)}
                              >
                                Deny
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {adminRequests.length === 0 && (
                    <p className="text-sm text-gray-500 mt-4">No requests available.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                      <tr>
                        <th className="py-3 pr-4">Admin</th>
                        <th className="py-3 pr-4">Role</th>
                        <th className="py-3 pr-4">Org</th>
                        <th className="py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {adminUsers.map((admin) => (
                        <tr key={admin.id}>
                          <td className="py-3 pr-4 text-white">{admin.email}</td>
                          <td className="py-3 pr-4 text-gray-400">{admin.role}</td>
                          <td className="py-3 pr-4 text-gray-400">{orgMap[admin.orgId] || '—'}</td>
                          <td className="py-3 pr-4">
                            <Button
                              variant="ghost"
                              disabled={admin.role === 'owner'}
                              onClick={() => revokeAdmin(admin)}
                            >
                              Revoke
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {adminUsers.length === 0 && (
                    <p className="text-sm text-gray-500 mt-4">No admin users found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Company Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Company</th>
                      <th className="py-3 pr-4">Plan</th>
                      <th className="py-3 pr-4">Owner</th>
                      <th className="py-3 pr-4">Users</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orgs.map((company) => (
                      <tr key={company.id}>
                        <td className="py-3 pr-4 text-white">{company.name}</td>
                        <td className="py-3 pr-4 text-gray-400">{company.plan}</td>
                        <td className="py-3 pr-4 text-gray-400">{company.ownerEmail || 'Unassigned'}</td>
                        <td className="py-3 pr-4 text-gray-400">{orgUserCounts[company.id] || 0}</td>
                        <td className="py-3 pr-4">
                          <Button variant="ghost" onClick={() => (window.location.href = `/userManagement?org=${company.id}`)}>
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </AuthGate>
      </div>
    </div>
  );
}
