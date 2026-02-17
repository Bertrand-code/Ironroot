import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AuthGate from '@/components/AuthGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Clock } from 'lucide-react';
import { ironroot } from '@/lib/ironrootClient';
import { useAuth } from '@/lib/useAuth';

const statusBadge = {
  pending: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30',
  attested: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  overdue: 'bg-red-500/10 text-red-300 border border-red-500/30',
};

export default function PolicyAttestations() {
  const { user, org } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [search, setSearch] = useState('');

  const { data: policies = [] } = useQuery({
    queryKey: ['policies'],
    queryFn: () => ironroot.entities.Policy.list('-lastUpdated'),
    enabled: !!user,
  });

  const { data: attestations = [] } = useQuery({
    queryKey: ['policyAttestations'],
    queryFn: () => ironroot.entities.PolicyAttestation.list('-created_date'),
    enabled: !!user,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['policyUsers'],
    queryFn: () => ironroot.entities.User.list('email'),
    enabled: !!user,
  });

  useEffect(() => {
    if (!selectedPolicyId && policies.length) {
      setSelectedPolicyId(policies[0].id);
    }
  }, [policies, selectedPolicyId]);

  const policyMap = useMemo(() => {
    return policies.reduce((acc, policy) => {
      acc[policy.id] = policy;
      return acc;
    }, {});
  }, [policies]);

  const filteredAttestations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return attestations
      .filter((att) => !selectedPolicyId || att.policyId === selectedPolicyId)
      .filter((att) => {
        if (!query) return true;
        return [att.userName, att.userEmail, att.status].join(' ').toLowerCase().includes(query);
      });
  }, [attestations, selectedPolicyId, search]);

  const policyStats = useMemo(() => {
    const counts = attestations.reduce(
      (acc, att) => {
        acc.total += 1;
        if (att.status === 'attested') acc.attested += 1;
        if (att.status === 'pending') acc.pending += 1;
        if (att.status === 'overdue') acc.overdue += 1;
        return acc;
      },
      { total: 0, attested: 0, pending: 0, overdue: 0 }
    );
    return counts;
  }, [attestations]);

  const sendAttestations = async () => {
    if (!selectedPolicyId || !org?.id) return;
    const existingEmails = attestations
      .filter((att) => att.policyId === selectedPolicyId)
      .map((att) => att.userEmail);
    const orgUsers = users.filter((item) => item.orgId === org.id);
    const dueDate = new Date(Date.now() + 14 * 86400000).toISOString();

    await Promise.all(
      orgUsers
        .filter((item) => !existingEmails.includes(item.email))
        .map((item) =>
          ironroot.entities.PolicyAttestation.create({
            policyId: selectedPolicyId,
            userName: item.fullName || item.email.split('@')[0],
            userEmail: item.email,
            status: 'pending',
            dueDate,
            signedAt: null,
            orgId: org.id,
          })
        )
    );
    queryClient.invalidateQueries({ queryKey: ['policyAttestations'] });
  };

  const markAttested = async (att) => {
    await ironroot.entities.PolicyAttestation.update(att.id, {
      status: 'attested',
      signedAt: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['policyAttestations'] });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <AuthGate
          title="Sign in to access policy attestations"
          description="Policy attestations are available to paid organizations with admin access."
          plans={['paid']}
          roles={['admin', 'owner']}
          feature="policyAttestations"
        >
          <div className="admin-hero" style={{ marginBottom: '28px' }}>
            <div>
              <span className="eyebrow">Governance</span>
              <h1 className="title-lg">Policy Attestations</h1>
              <p className="text-lead">Track acknowledgements, reduce audit friction, and capture attestations at scale.</p>
              <div className="admin-hero__actions">
                <Button variant="outline" onClick={() => (window.location.href = '/evidenceVault')}>Evidence Vault</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/reportCenter')}>Report Center</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/controlCenter')}>Control Center</Button>
              </div>
            </div>
            <div className="admin-hero__stats">
              {[
                { label: 'Total Attestations', value: policyStats.total, meta: 'Across policies' },
                { label: 'Attested', value: policyStats.attested, meta: 'Completed' },
                { label: 'Pending', value: policyStats.pending, meta: 'Needs response' },
                { label: 'Overdue', value: policyStats.overdue, meta: 'Escalate' },
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
                <CardTitle className="text-white">Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                      <tr>
                        <th className="py-3 pr-4">Policy</th>
                        <th className="py-3 pr-4">Version</th>
                        <th className="py-3 pr-4">Owner</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4">Last Updated</th>
                        <th className="py-3 pr-4">Attestations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {policies.map((policy) => {
                        const count = attestations.filter((att) => att.policyId === policy.id).length;
                        return (
                          <tr key={policy.id}>
                            <td className="py-3 pr-4 text-white">
                              <div className="font-semibold">{policy.name}</div>
                              <div className="text-xs text-gray-500">{policy.description}</div>
                            </td>
                            <td className="py-3 pr-4 text-gray-400">{policy.version}</td>
                            <td className="py-3 pr-4 text-gray-400">{policy.owner}</td>
                            <td className="py-3 pr-4 text-gray-400">{policy.status}</td>
                            <td className="py-3 pr-4 text-gray-400">
                              {policy.lastUpdated ? new Date(policy.lastUpdated).toLocaleDateString() : '—'}
                            </td>
                            <td className="py-3 pr-4 text-gray-400">
                              <button
                                className="text-blue-300 hover:underline"
                                onClick={() => setSelectedPolicyId(policy.id)}
                              >
                                {count} attestations
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {policies.length === 0 && (
                    <p className="text-sm text-gray-500 mt-4">No policies available.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Attestation Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-400">Selected policy</div>
                <div className="text-white font-semibold">{policyMap[selectedPolicyId]?.name || 'Select a policy'}</div>
                <Button onClick={sendAttestations} disabled={!selectedPolicyId}>
                  Send Attestations
                </Button>
                <div className="text-xs text-gray-500">
                  Sends attestations to all users in the current organization.
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Attestation Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-4">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search recipient or status"
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Badge className="bg-gray-700 text-gray-200">
                  Policy: {policyMap[selectedPolicyId]?.name || 'All'}
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="table w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Recipient</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Due</th>
                      <th className="py-3 pr-4">Signed</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredAttestations.map((att) => (
                      <tr key={att.id}>
                        <td className="py-3 pr-4 text-white">{att.userName || '—'}</td>
                        <td className="py-3 pr-4 text-gray-400">
                          {att.userEmail ? (
                            <a className="text-blue-300 hover:underline" href={`mailto:${att.userEmail}`}>
                              {att.userEmail}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${statusBadge[att.status] || statusBadge.pending}`}>
                            {att.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">
                          {att.dueDate ? new Date(att.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-400">
                          {att.signedAt ? new Date(att.signedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <Button
                            variant="ghost"
                            disabled={att.status === 'attested'}
                            onClick={() => markAttested(att)}
                          >
                            {att.status === 'attested' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAttestations.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">No attestations found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </AuthGate>
      </div>
    </div>
  );
}
