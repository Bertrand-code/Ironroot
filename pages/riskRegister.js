import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AuthGate from '@/components/AuthGate';
import { ironroot } from '@/lib/ironrootClient';
import { useAuth } from '@/lib/useAuth';

const severityStyles = {
  critical: 'bg-red-500/20 text-red-300',
  high: 'bg-orange-500/20 text-orange-300',
  medium: 'bg-yellow-500/20 text-yellow-300',
  low: 'bg-green-500/20 text-green-300',
};

const statusStyles = {
  open: 'bg-gray-700 text-gray-200',
  mitigating: 'bg-blue-500/20 text-blue-300',
  accepted: 'bg-purple-500/20 text-purple-300',
  closed: 'bg-green-500/20 text-green-300',
};

export default function RiskRegister() {
  const { user } = useAuth();
  const [risks, setRisks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '',
    severity: 'high',
    status: 'open',
    owner: '',
    businessImpact: '',
    mitigation: '',
    dueDate: '',
  });

  const loadRisks = async () => {
    try {
      const data = await ironroot.entities.Risk.list('-created_date');
      setRisks(data);
    } catch (err) {
      setRisks([]);
    }
  };

  useEffect(() => {
    loadRisks();
  }, []);

  const filteredRisks = useMemo(() => {
    if (filter === 'all') return risks;
    return risks.filter((risk) => risk.severity === filter);
  }, [risks, filter]);

  const createRisk = async () => {
    if (!form.title.trim()) return;
    await ironroot.entities.Risk.create({
      ...form,
      title: form.title.trim(),
      created_date: new Date().toISOString(),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    });
    setForm({
      title: '',
      severity: 'high',
      status: 'open',
      owner: '',
      businessImpact: '',
      mitigation: '',
      dueDate: '',
    });
    loadRisks();
  };

  const updateStatus = async (risk, nextStatus) => {
    if (nextStatus === 'accepted' && user?.role !== 'owner') {
      return;
    }
    await ironroot.entities.Risk.update(risk.id, { status: nextStatus });
    loadRisks();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <AuthGate
          title="Sign in to access the Risk Register"
          description="Risk governance and executive tracking are available to paid organizations."
          plans={['paid']}
          feature="riskRegister"
        >
          <div className="admin-hero" style={{ marginBottom: '28px' }}>
            <div>
              <span className="eyebrow">Governance</span>
              <h1 className="title-lg">Risk Register</h1>
              <p className="text-lead">Track business risk, mitigation status, and ownership across the org.</p>
              <div className="admin-hero__actions">
                <Button variant="outline" onClick={() => (window.location.href = '/assetInventory')}>Asset Inventory</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/reportCenter')}>Report Center</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/adminDashboard')}>Admin Dashboard</Button>
              </div>
            </div>
            <div className="admin-hero__stats">
              <div className="admin-kpi">
                <div className="admin-kpi__label">Total Risks</div>
                <div className="admin-kpi__value">{risks.length}</div>
                <div className="card__meta">Tracked items</div>
              </div>
              <div className="admin-kpi">
                <div className="admin-kpi__label">Critical</div>
                <div className="admin-kpi__value">{risks.filter((r) => r.severity === 'critical').length}</div>
                <div className="card__meta">Executive priority</div>
              </div>
              <div className="admin-kpi">
                <div className="admin-kpi__label">Open</div>
                <div className="admin-kpi__value">{risks.filter((r) => r.status === 'open').length}</div>
                <div className="card__meta">Needs mitigation</div>
              </div>
              <div className="admin-kpi">
                <div className="admin-kpi__label">Mitigating</div>
                <div className="admin-kpi__value">{risks.filter((r) => r.status === 'mitigating').length}</div>
                <div className="card__meta">In progress</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Active Risks</CardTitle>
                <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                      <tr>
                        <th className="py-3 pr-4">Risk</th>
                        <th className="py-3 pr-4">Owner</th>
                        <th className="py-3 pr-4">Due</th>
                        <th className="py-3 pr-4">Severity</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4">Impact</th>
                        <th className="py-3 pr-4">Mitigation</th>
                        <th className="py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredRisks.map((risk) => (
                        <tr key={risk.id}>
                          <td className="py-3 pr-4 text-white">{risk.title}</td>
                          <td className="py-3 pr-4 text-gray-400">{risk.owner || 'Unassigned'}</td>
                          <td className="py-3 pr-4 text-gray-400">
                            {risk.dueDate ? new Date(risk.dueDate).toLocaleDateString() : 'Not set'}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge className={severityStyles[risk.severity] || 'bg-gray-700 text-gray-200'}>
                              {risk.severity}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge className={statusStyles[risk.status] || 'bg-gray-700 text-gray-200'}>
                              {risk.status}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-gray-400" title={risk.businessImpact || ''} style={{ maxWidth: '220px' }}>
                            {risk.businessImpact || '—'}
                          </td>
                          <td className="py-3 pr-4 text-gray-400" title={risk.mitigation || ''} style={{ maxWidth: '220px' }}>
                            {risk.mitigation || '—'}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap gap-2">
                              {['open', 'mitigating', 'accepted', 'closed'].map((status) => (
                                <Button
                                  key={status}
                                  variant="ghost"
                                  onClick={() => updateStatus(risk, status)}
                                  disabled={risk.status === status || (status === 'accepted' && user?.role !== 'owner')}
                                >
                                  {status}
                                </Button>
                              ))}
                            </div>
                            {user?.role !== 'owner' && (
                              <span className="text-xs text-gray-500">Owner approval required for acceptance.</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredRisks.length === 0 && (
                    <p className="text-sm text-gray-500 mt-4">No risks match the current filter.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Create New Risk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Risk title"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  placeholder="Business owner"
                  value={form.owner}
                  onChange={(e) => setForm((prev) => ({ ...prev, owner: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <select
                  className="select"
                  value={form.severity}
                  onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  className="select"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="open">Open</option>
                  <option value="mitigating">Mitigating</option>
                  <option value="accepted">Accepted</option>
                  <option value="closed">Closed</option>
                </select>
                <Input
                  placeholder="Business impact"
                  value={form.businessImpact}
                  onChange={(e) => setForm((prev) => ({ ...prev, businessImpact: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  placeholder="Mitigation plan"
                  value={form.mitigation}
                  onChange={(e) => setForm((prev) => ({ ...prev, mitigation: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Button onClick={createRisk} className="bg-red-600 hover:bg-red-700">
                  Add Risk
                </Button>
              </CardContent>
            </Card>
          </div>
        </AuthGate>
      </div>
    </div>
  );
}
