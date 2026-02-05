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
];

export default function ControlCenter() {
  const { user, org } = useAuth();
  const queryClient = useQueryClient();
  const [orgState, setOrgState] = useState(null);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [securityForm, setSecurityForm] = useState({
    sessionTimeoutMins: 45,
    aiRequestsPerMin: 30,
  });

  useEffect(() => {
    if (org) {
      setOrgState(org);
      setOwnerEmail(org.ownerEmail || '');
      setSecurityForm({
        sessionTimeoutMins: org.security?.sessionTimeoutMins || 45,
        aiRequestsPerMin: org.security?.aiRequestsPerMin || 30,
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

  const adminUsers = useMemo(() => users.filter((item) => ['admin', 'owner'].includes(item.role)), [users]);
  const pendingAdminRequests = useMemo(
    () => adminRequests.filter((request) => request.status === 'pending').length,
    [adminRequests]
  );

  const toggleFeature = async (key) => {
    if (!orgState) return;
    const next = { ...orgState.features, [key]: !orgState.features?.[key] };
    const updated = await ironroot.entities.Organization.update(orgState.id, { features: next });
    setOrgState(updated);
    queryClient.invalidateQueries({ queryKey: ['orgs'] });
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

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Ownership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="Owner email"
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Button onClick={saveOwnerEmail} className="bg-red-600 hover:bg-red-700">Update Owner Email</Button>
                <p className="text-xs text-gray-500">Only this address can approve admin access requests.</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Security Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  type="number"
                  value={securityForm.sessionTimeoutMins}
                  onChange={(e) => setSecurityForm((prev) => ({ ...prev, sessionTimeoutMins: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="Session timeout (minutes)"
                />
                <Input
                  type="number"
                  value={securityForm.aiRequestsPerMin}
                  onChange={(e) => setSecurityForm((prev) => ({ ...prev, aiRequestsPerMin: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="AI requests per minute"
                />
                <Button onClick={saveSecurity} className="bg-red-600 hover:bg-red-700">Save Security Policy</Button>
                <p className="text-xs text-gray-500">Changes apply to new sessions immediately after save.</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Organization Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-300">Org: {orgState?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-300">Plan: {orgState?.plan || 'N/A'}</p>
                <p className="text-sm text-gray-300">Users: {users.length}</p>
                <p className="text-sm text-gray-300">Admins: {adminUsers.length}</p>
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
            <CardContent className="grid md:grid-cols-2 gap-4">
              {featureCatalog.map((feature) => (
                <div key={feature.key} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{feature.label}</p>
                      <p className="text-xs text-gray-500">{feature.description}</p>
                    </div>
                    <Button variant="ghost" onClick={() => toggleFeature(feature.key)}>
                      {orgState?.features?.[feature.key] ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Access Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminRequests.length === 0 && (
                  <p className="text-sm text-gray-500">No pending admin access requests.</p>
                )}
                {adminRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">{request.email}</p>
                        <p className="text-xs text-gray-500">{request.reason}</p>
                      </div>
                      <Badge className={request.status === 'approved' ? 'bg-green-500' : request.status === 'denied' ? 'bg-red-500' : 'bg-yellow-500'}>
                        {request.status || 'pending'}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
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
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Roster</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminUsers.map((admin) => (
                  <div key={admin.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{admin.email}</p>
                      <p className="text-xs text-gray-500">Role: {admin.role}</p>
                    </div>
                    <Button
                      variant="ghost"
                      disabled={admin.role === 'owner'}
                      onClick={() => revokeAdmin(admin)}
                    >
                      Revoke
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Company Accounts</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              {orgs.map((company) => (
                <div key={company.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <p className="text-white font-semibold">{company.name}</p>
                  <p className="text-xs text-gray-500">Plan: {company.plan}</p>
                  <p className="text-xs text-gray-500">Owner: {company.ownerEmail || 'Unassigned'}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AuthGate>
      </div>
    </div>
  );
}
