import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import AuthGate from '@/components/AuthGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Activity, Clock } from 'lucide-react';
import { ironroot } from '@/lib/ironrootClient';
import { useAuth } from '@/lib/useAuth';

const statusBadge = {
  Active: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  Draft: 'bg-gray-700 text-gray-200 border border-gray-600',
  Testing: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
};

const severityBadge = {
  critical: 'bg-red-500/10 text-red-300 border border-red-500/30',
  high: 'bg-orange-500/10 text-orange-300 border border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30',
  low: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
};

export default function SocPlaybooks() {
  const { user } = useAuth();
  const { data: playbooks = [] } = useQuery({
    queryKey: ['playbooks'],
    queryFn: () => ironroot.entities.Playbook.list('name'),
    enabled: !!user,
  });
  const { data: runs = [] } = useQuery({
    queryKey: ['playbookRuns'],
    queryFn: () => ironroot.entities.PlaybookRun.list('-startedAt'),
    enabled: !!user,
  });

  const playbookMap = useMemo(() => {
    return playbooks.reduce((acc, pb) => {
      acc[pb.id] = pb;
      return acc;
    }, {});
  }, [playbooks]);

  const stats = useMemo(() => {
    const active = playbooks.filter((pb) => pb.status === 'Active').length;
    const inProgress = runs.filter((run) => run.status !== 'closed' && run.status !== 'resolved').length;
    const atRisk = runs.filter((run) => run.slaStatus === 'at_risk').length;
    const avgSla = playbooks.length
      ? Math.round(playbooks.reduce((sum, pb) => sum + (pb.slaHours || 0), 0) / playbooks.length)
      : 0;
    return { total: playbooks.length, active, inProgress, atRisk, avgSla };
  }, [playbooks, runs]);

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <AuthGate
          title="Sign in to access SOC playbooks"
          description="SOC playbooks are available to paid organizations with admin access."
          plans={['paid']}
          roles={['admin', 'owner']}
          feature="socPlaybooks"
        >
          <div className="admin-hero" style={{ marginBottom: '28px' }}>
            <div>
              <span className="eyebrow">Incident Response</span>
              <h1 className="title-lg">SOC Playbooks</h1>
              <p className="text-lead">
                Runbook-driven response workflows with SLAs, ownership, and live incident tracking.
              </p>
              <div className="admin-hero__actions">
                <Button variant="outline" onClick={() => (window.location.href = '/adminDashboard')}>Admin Dashboard</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/riskRegister')}>Risk Register</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/reportCenter')}>Report Center</Button>
              </div>
            </div>
            <div className="admin-hero__stats">
              {[
                { label: 'Total Playbooks', value: stats.total, meta: 'Active coverage' },
                { label: 'Active Playbooks', value: stats.active, meta: 'Running procedures' },
                { label: 'Incidents In Progress', value: stats.inProgress, meta: 'Open runs' },
                { label: 'At-Risk SLAs', value: stats.atRisk, meta: 'Need escalation' },
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
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">SLA Benchmarks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Average SLA</span>
                  <span className="text-sm text-white">{stats.avgSla} hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">At-risk incidents</span>
                  <span className="text-sm text-red-300">{stats.atRisk}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Coverage status</span>
                  <span className="text-sm text-emerald-300">{stats.active} active</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Response Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield className="h-4 w-4 text-emerald-400" /> Credential theft containment
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <AlertTriangle className="h-4 w-4 text-orange-400" /> Ransomware escalation paths
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Activity className="h-4 w-4 text-blue-400" /> Cloud access anomaly response
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="h-4 w-4 text-purple-400" /> SLA-based task sequencing
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Automation Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">Playbook steps map to response automation and evidence capture.</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Auto containment</span>
                    <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Evidence logging</span>
                    <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Executive notifications</span>
                    <Badge className="bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">Manual</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Playbook Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="table w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Playbook</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Owner</th>
                      <th className="py-3 pr-4">SLA</th>
                      <th className="py-3 pr-4">Last Updated</th>
                      <th className="py-3 pr-4">Steps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {playbooks.map((pb) => (
                      <tr key={pb.id}>
                        <td className="py-3 pr-4 text-white">
                          <div className="font-semibold">{pb.name}</div>
                          <div className="text-xs text-gray-500">{pb.summary}</div>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{pb.category}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${statusBadge[pb.status] || statusBadge.Draft}`}>
                            {pb.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{pb.ownerTeam}</td>
                        <td className="py-3 pr-4 text-gray-400">{pb.slaHours} hrs</td>
                        <td className="py-3 pr-4 text-gray-400">
                          {pb.lastUpdated ? new Date(pb.lastUpdated).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{pb.steps?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {playbooks.length === 0 && <p className="text-sm text-gray-500 mt-4">No playbooks configured.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Active Incident Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="table w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Incident</th>
                      <th className="py-3 pr-4">Playbook</th>
                      <th className="py-3 pr-4">Severity</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Owner</th>
                      <th className="py-3 pr-4">Started</th>
                      <th className="py-3 pr-4">SLA</th>
                      <th className="py-3 pr-4">Asset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {runs.map((run) => (
                      <tr key={run.id}>
                        <td className="py-3 pr-4 text-white">{run.incidentId}</td>
                        <td className="py-3 pr-4 text-gray-400">{playbookMap[run.playbookId]?.name || '—'}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${severityBadge[run.severity] || severityBadge.medium}`}>
                            {run.severity}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{run.status?.replace('_', ' ')}</td>
                        <td className="py-3 pr-4 text-gray-400">{run.owner}</td>
                        <td className="py-3 pr-4 text-gray-400">{run.startedAt ? new Date(run.startedAt).toLocaleString() : '—'}</td>
                        <td className="py-3 pr-4 text-gray-400">{run.slaStatus?.replace('_', ' ')}</td>
                        <td className="py-3 pr-4 text-gray-400">{run.affectedAsset}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {runs.length === 0 && <p className="text-sm text-gray-500 mt-4">No active incidents.</p>}
              </div>
            </CardContent>
          </Card>
        </AuthGate>
      </div>
    </div>
  );
}
