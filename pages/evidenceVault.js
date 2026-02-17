import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AuthGate from '@/components/AuthGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Upload } from 'lucide-react';
import { ironroot } from '@/lib/ironrootClient';
import { useAuth } from '@/lib/useAuth';

const statusBadge = {
  Ready: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  'Needs Update': 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30',
  Expired: 'bg-red-500/10 text-red-300 border border-red-500/30',
};

export default function EvidenceVault() {
  const { user, org } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ framework: 'all', status: 'all' });
  const [form, setForm] = useState({
    name: '',
    framework: 'SOC 2',
    control: '',
    owner: user?.email || '',
    status: 'Ready',
    expiresAt: '',
    source: 'manual',
    tags: '',
  });

  const { data: evidenceItems = [] } = useQuery({
    queryKey: ['evidenceItems'],
    queryFn: () => ironroot.entities.EvidenceItem.list('-collectedAt'),
    enabled: !!user,
  });

  const filteredEvidence = useMemo(() => {
    return evidenceItems.filter((item) => {
      const frameworkOk = filters.framework === 'all' || item.framework === filters.framework;
      const statusOk = filters.status === 'all' || item.status === filters.status;
      return frameworkOk && statusOk;
    });
  }, [evidenceItems, filters]);

  const stats = useMemo(() => {
    const ready = evidenceItems.filter((item) => item.status === 'Ready').length;
    const needsUpdate = evidenceItems.filter((item) => item.status === 'Needs Update').length;
    const expired = evidenceItems.filter((item) => item.status === 'Expired').length;
    return { total: evidenceItems.length, ready, needsUpdate, expired };
  }, [evidenceItems]);

  const addEvidence = async () => {
    if (!form.name.trim()) return;
    await ironroot.entities.EvidenceItem.create({
      name: form.name.trim(),
      framework: form.framework,
      control: form.control,
      owner: form.owner,
      status: form.status,
      source: form.source,
      collectedAt: new Date().toISOString(),
      expiresAt: form.expiresAt || null,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      orgId: org?.id || null,
    });
    setForm({ ...form, name: '', control: '', tags: '' });
    queryClient.invalidateQueries({ queryKey: ['evidenceItems'] });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <AuthGate
          title="Sign in to access the Evidence Vault"
          description="Evidence collection is available to paid organizations with admin access."
          plans={['paid']}
          roles={['admin', 'owner']}
          feature="evidenceVault"
        >
          <div className="admin-hero" style={{ marginBottom: '28px' }}>
            <div>
              <span className="eyebrow">Compliance Operations</span>
              <h1 className="title-lg">Evidence Vault</h1>
              <p className="text-lead">Centralize audit evidence, map it to controls, and keep retention SLAs on track.</p>
              <div className="admin-hero__actions">
                <Button variant="outline" onClick={() => (window.location.href = '/reportCenter')}>Report Center</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/policyAttestations')}>Policy Attestations</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/controlCenter')}>Control Center</Button>
              </div>
            </div>
            <div className="admin-hero__stats">
              {[
                { label: 'Total Evidence', value: stats.total, meta: 'Tracked items' },
                { label: 'Ready', value: stats.ready, meta: 'Audit ready' },
                { label: 'Needs Update', value: stats.needsUpdate, meta: 'Refresh required' },
                { label: 'Expired', value: stats.expired, meta: 'Immediate action' },
              ].map((item) => (
                <div key={item.label} className="admin-kpi">
                  <div className="admin-kpi__label">{item.label}</div>
                  <div className="admin-kpi__value">{item.value}</div>
                  <div className="card__meta">{item.meta}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Evidence Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-4">
                  <select
                    className="select"
                    value={filters.framework}
                    onChange={(e) => setFilters((prev) => ({ ...prev, framework: e.target.value }))}
                  >
                    <option value="all">All frameworks</option>
                    <option value="SOC 2">SOC 2</option>
                    <option value="ISO 27001">ISO 27001</option>
                    <option value="PCI DSS">PCI DSS</option>
                  </select>
                  <select
                    className="select"
                    value={filters.status}
                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="all">All status</option>
                    <option value="Ready">Ready</option>
                    <option value="Needs Update">Needs Update</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                      <tr>
                        <th className="py-3 pr-4">Evidence</th>
                        <th className="py-3 pr-4">Framework</th>
                        <th className="py-3 pr-4">Control</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4">Owner</th>
                        <th className="py-3 pr-4">Collected</th>
                        <th className="py-3 pr-4">Expires</th>
                        <th className="py-3 pr-4">Source</th>
                        <th className="py-3 pr-4">Tags</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredEvidence.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 pr-4 text-white">
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-xs text-gray-500">ID: {item.id}</div>
                          </td>
                          <td className="py-3 pr-4 text-gray-400">{item.framework}</td>
                          <td className="py-3 pr-4 text-gray-400">{item.control || '—'}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs px-2 py-1 rounded-full border ${statusBadge[item.status] || statusBadge.Ready}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-400">{item.owner || '—'}</td>
                          <td className="py-3 pr-4 text-gray-400">
                            {item.collectedAt ? new Date(item.collectedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 pr-4 text-gray-400">
                            {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 pr-4 text-gray-400">{item.source}</td>
                          <td className="py-3 pr-4 text-gray-400">
                            {(item.tags || []).join(', ') || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredEvidence.length === 0 && (
                    <p className="text-sm text-gray-500 mt-4">No evidence matches the current filters.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Add Evidence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Evidence name"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <Input
                    value={form.control}
                    onChange={(e) => setForm((prev) => ({ ...prev, control: e.target.value }))}
                    placeholder="Control mapping"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <Input
                    value={form.owner}
                    onChange={(e) => setForm((prev) => ({ ...prev, owner: e.target.value }))}
                    placeholder="Owner"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <Input
                    value={form.expiresAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                    placeholder="Expiry date (YYYY-MM-DD)"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="Tags (comma separated)"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <select
                    className="select"
                    value={form.framework}
                    onChange={(e) => setForm((prev) => ({ ...prev, framework: e.target.value }))}
                  >
                    <option value="SOC 2">SOC 2</option>
                    <option value="ISO 27001">ISO 27001</option>
                    <option value="PCI DSS">PCI DSS</option>
                  </select>
                  <select
                    className="select"
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Ready">Ready</option>
                    <option value="Needs Update">Needs Update</option>
                    <option value="Expired">Expired</option>
                  </select>
                  <Button onClick={addEvidence}>Add Evidence</Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Evidence Intake</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    Upload artifacts from audits or security tools. Metadata is captured for retention and control mapping.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" /> Upload Evidence
                    </Button>
                    <Badge className="bg-gray-700 text-gray-200">Manual intake</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="h-4 w-4" /> Evidence stored with immutable audit logs.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </AuthGate>
      </div>
    </div>
  );
}
