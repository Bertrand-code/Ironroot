import React, { useState, useEffect } from 'react';
import { ironroot } from '@/lib/ironrootClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Clock, Shield, Building, Layers, Activity, Database, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [ownerEmail, setOwnerEmail] = useState('');
  const queryClient = useQueryClient();
  const isOwner = user?.role === 'owner';

  useEffect(() => {
        const checkAuth = async () => {
          try {
            const currentUser = await ironroot.auth.me();
            if (!['admin', 'owner'].includes(currentUser.role)) {
              window.location.href = '/login';
            }
            setUser(currentUser);
            const currentOrg = await ironroot.auth.currentOrg();
            setOrg(currentOrg);
            setOwnerEmail(currentOrg?.ownerEmail || '');
          } catch {
            window.location.href = '/login';
          }
        };
    checkAuth();
  }, []);

  const { data: trialRequests = [], refetch } = useQuery({
    queryKey: ['trialRequests'],
    queryFn: () => ironroot.entities.TrialRequest.list('-created_date'),
    enabled: !!user,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => ironroot.entities.Lead.list('-created_date'),
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

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => ironroot.entities.Group.list('name'),
    enabled: !!user,
  });

  const { data: visitors = [] } = useQuery({
    queryKey: ['visitors'],
    queryFn: () => ironroot.entities.Visitor.list('-lastVisit'),
    enabled: !!user,
  });

  const { data: scanHistory = [] } = useQuery({
    queryKey: ['scanHistory'],
    queryFn: () => ironroot.entities.ScanHistory.list('-created_date'),
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => ironroot.entities.Session.list('-lastSeen'),
    enabled: !!user,
  });

  const { data: adminRequests = [] } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: () => ironroot.entities.AdminRequest.list('-created_date'),
    enabled: !!user,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', org?.id],
    queryFn: () => ironroot.integrations.Vault.listDocuments({ orgId: org?.id }),
    enabled: !!user && !!org?.id,
  });

  const { data: watermarkEvents = [] } = useQuery({
    queryKey: ['watermarkEvents', org?.id],
    queryFn: () => ironroot.integrations.Forensics.events({ orgId: org?.id, limit: 20 }),
    enabled: !!user && !!org?.id,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => ironroot.entities.Asset.list('-lastSeen'),
    enabled: !!user,
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => ironroot.entities.Risk.list('-created_date'),
    enabled: !!user,
  });

  const { data: activityLog = [] } = useQuery({
    queryKey: ['activityLog'],
    queryFn: () => ironroot.entities.ActivityLog.list('-timestamp', 12),
    enabled: !!user,
  });

  const { data: auditEvents = [] } = useQuery({
    queryKey: ['auditEvents', org?.id],
    queryFn: () => ironroot.integrations.Audit.events({ orgId: org?.id, limit: 12 }),
    enabled: !!user && !!org?.id,
  });

  const orgMap = orgs.reduce((acc, orgItem) => {
    acc[orgItem.id] = orgItem.name;
    return acc;
  }, {});

  const groupMap = groups.reduce((acc, groupItem) => {
    acc[groupItem.id] = groupItem.name;
    return acc;
  }, {});

  const documentMap = documents.reduce((acc, doc) => {
    acc[doc.id] = doc.filename;
    return acc;
  }, {});

  const quarantinedDocs = documents.filter((doc) => doc.quarantined);

  const activeSessions = sessions.filter((session) => session.status === 'active');
  const orgUserCounts = users.reduce((acc, userItem) => {
    if (!userItem.orgId) return acc;
    acc[userItem.orgId] = (acc[userItem.orgId] || 0) + 1;
    return acc;
  }, {});

  const criticalRisks = risks.filter((risk) => risk.severity === 'critical').length;
  const openRisks = risks.filter((risk) => risk.status === 'open').length;
  const publicAssets = assets.filter((asset) => asset.exposure === 'public').length;
  const pendingAdminRequests = adminRequests.filter((request) => request.status === 'pending').length;

  const timeAgo = (value) => {
    if (!value) return 'just now';
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const updateTrialStatus = async (id, status, request) => {
    const now = new Date();
    const updateData = { status };
    
    // If approved, set trial dates (15 days)
    if (status === 'approved' || status === 'trial_active') {
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 15);
      
      updateData.status = 'trial_active';
      updateData.trialStartDate = now.toISOString();
      updateData.trialEndDate = trialEnd.toISOString();
      updateData.approvedBy = user.email;
      updateData.approvalDate = now.toISOString();
    }
    
    await ironroot.entities.TrialRequest.update(id, updateData);
    
    // Log the action
    await ironroot.entities.ActivityLog.create({
      userEmail: user.email,
      action: 'trial_approved',
      details: {
        requestId: id,
        userEmail: request.email,
        service: request.interestedIn,
        newStatus: status
      },
      timestamp: now.toISOString()
    });
    
    // If approved, invite the user and send welcome email
    if (status === 'trial_active' || status === 'approved') {
      try {
        await ironroot.users.inviteUser(request.email, 'user');
        await ironroot.integrations.Core.SendEmail({
          from_name: 'Ironroot Security Platform',
          to: request.email,
          subject: 'Welcome to Ironroot - Your Trial Access is Approved!',
          body: `Dear ${request.fullName},

Great news! Your trial request for Ironroot has been approved.

You can now access our platform with the following credentials:
- Email: ${request.email}
- Service Access: ${request.interestedIn?.replace('_', ' ').toUpperCase()}

To get started:
1. Visit our platform
2. Check your email for the invitation link
3. Set up your password
4. Start exploring our comprehensive security solutions

Your 15-day trial includes full access to:
${request.interestedIn === 'defensive_security' ? '- Real-time threat detection and monitoring\n- SOC operations dashboard\n- Incident response tools' : ''}
${request.interestedIn === 'offensive_security' ? '- Penetration testing tools\n- Red team operations\n- Vulnerability assessments' : ''}
${request.interestedIn === 'code_scanning' ? '- AI-powered code security scanning\n- Vulnerability detection\n- Automated fix recommendations' : ''}
${request.interestedIn === 'grc_services' ? '- Compliance assessments (PCI DSS, SOC 2)\n- Risk quantification\n- Board-ready reports' : ''}
${request.interestedIn === 'full_platform' ? '- Complete access to all Ironroot features\n- Defensive & Offensive Security\n- Code Scanning & GRC Services' : ''}

Need help? Our team is here to support you.

Best regards,
The Ironroot Team

---
Ironroot Security Platform
622 Rainier Ave S, Seattle, WA 98144
contact@ironroot.com`
        });
      } catch (error) {
        console.error('Error inviting user:', error);
      }
    }
    
    refetch();
  };

  const approveAdminRequest = async (request) => {
    if (user?.role !== 'owner') return;
    const userRecord = await ironroot.users.inviteUser(request.email, 'admin', user?.orgId || null);
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

  const denyAdminRequest = async (request) => {
    await ironroot.entities.AdminRequest.update(request.id, { status: 'denied' });
    await ironroot.entities.ActivityLog.create({
      userEmail: user.email,
      action: 'admin_request_denied',
      details: { email: request.email },
      timestamp: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-500', label: 'Pending' },
      approved: { color: 'bg-blue-500', label: 'Approved' },
      trial_active: { color: 'bg-green-500', label: 'Active' },
      converted: { color: 'bg-purple-500', label: 'Converted' },
      rejected: { color: 'bg-red-500', label: 'Rejected' },
    };
    return config[status] || config.pending;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const ownerDisplay = ownerEmail || org?.ownerEmail || user?.email || 'owner@ironroot.ai';
  const statCards = [
    { label: 'Pending Requests', value: pendingAdminRequests, meta: 'Awaiting response', accent: 'text-yellow-300' },
    { label: 'Total Users', value: users.length, meta: 'Across all orgs', accent: 'text-green-300' },
    { label: 'Active Sessions', value: activeSessions.length, meta: 'Logged in now', accent: 'text-blue-300' },
    { label: 'Critical Risks', value: criticalRisks, meta: 'Need attention', accent: 'text-red-300' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="admin-nav">
          <div>
            <span className="admin-pill">Owner: {ownerDisplay}</span>
          </div>
          <div className="admin-nav__actions">
            <Button variant="outline" onClick={() => (window.location.href = '/adminDashboard')}>
              Admin Dashboard
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = '/userManagement')}>
              User Management
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = '/assetInventory')}>
              Asset Inventory
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = '/riskRegister')}>
              Risk Register
            </Button>
          </div>
        </div>

        <div className="stat-row">
          {statCards.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-card__label">{card.label}</div>
              <div className="stat-card__value">{card.value}</div>
              <p className="stat-card__meta">
                <span className={card.accent}>{card.meta}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="admin-hero" style={{ marginBottom: '28px' }}>
          <div>
            <span className="eyebrow">Operations Command</span>
            <h1 className="title-lg">Admin Command Center</h1>
            <p className="text-lead">
              Orchestrate trials, manage users, and track security performance in real time.
            </p>
            {org && (
              <div className="admin-pill" style={{ marginTop: '12px' }}>
                Organization: {org.name} · Plan: {org.plan || 'paid'}
              </div>
            )}
            <div className="admin-hero__actions">
              <Button variant="outline" onClick={() => window.location.href = '/userManagement'}>
                User Management
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/assetInventory'}>
                Asset Inventory
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/riskRegister'}>
                Risk Register
              </Button>
              {isOwner && (
                <Button variant="outline" onClick={() => window.location.href = '/controlCenter'}>
                  Owner Control
                </Button>
              )}
              <Button variant="outline" onClick={() => window.location.href = '/adminNotepad'}>
                Notepad
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/secDocumentation'}>
                Security Docs
              </Button>
              <Button variant="outline" onClick={() => ironroot.auth.logout()}>
                Logout
              </Button>
            </div>
          </div>
          <div className="admin-hero__stats">
            <div className="admin-kpi">
              <div className="admin-kpi__label">Active Sessions</div>
              <div className="admin-kpi__value">{activeSessions.length}</div>
              <div className="card__meta">Users online now</div>
            </div>
            <div className="admin-kpi">
              <div className="admin-kpi__label">Public Assets</div>
              <div className="admin-kpi__value">{publicAssets}</div>
              <div className="card__meta">Exposed services tracked</div>
            </div>
            <div className="admin-kpi">
              <div className="admin-kpi__label">Critical Risks</div>
              <div className="admin-kpi__value">{criticalRisks}</div>
              <div className="card__meta">Require executive response</div>
            </div>
            <div className="admin-kpi">
              <div className="admin-kpi__label">Open Risks</div>
              <div className="admin-kpi__value">{openRisks}</div>
              <div className="card__meta">Mitigation in progress</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Trial Requests</CardTitle>
              <UserCheck className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{trialRequests.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                {trialRequests.filter(t => t.status === 'pending').length} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Contact Leads</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{leads.length}</div>
              <p className="text-xs text-gray-500 mt-1">Total inquiries</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Visitors</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{visitors.length}</div>
              <p className="text-xs text-gray-500 mt-1">Tracked visitors</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Code Scans</CardTitle>
              <Shield className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{scanHistory.length}</div>
              <p className="text-xs text-gray-500 mt-1">Security scans performed</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Assets</CardTitle>
              <Database className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{assets.length}</div>
              <p className="text-xs text-gray-500 mt-1">{publicAssets} public exposures</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Open Risks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{openRisks}</div>
              <p className="text-xs text-gray-500 mt-1">{criticalRisks} critical</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Companies</CardTitle>
              <Building className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{orgs.length}</div>
              <p className="text-xs text-gray-500 mt-1">Active organizations</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeSessions.length}</div>
              <p className="text-xs text-gray-500 mt-1">Currently logged in</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Groups</CardTitle>
              <Layers className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{groups.length}</div>
              <p className="text-xs text-gray-500 mt-1">Access groups</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Companies & Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="table w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Company</th>
                      <th className="py-3 pr-4">Industry</th>
                      <th className="py-3 pr-4">Size</th>
                      <th className="py-3 pr-4">Plan</th>
                      <th className="py-3 pr-4">Owner</th>
                      <th className="py-3 pr-4">Users</th>
                      <th className="py-3 pr-4">Org ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orgs.map((orgItem) => (
                      <tr key={orgItem.id}>
                        <td className="py-3 pr-4 text-white">{orgItem.name}</td>
                        <td className="py-3 pr-4 text-gray-400">{orgItem.industry || '—'}</td>
                        <td className="py-3 pr-4 text-gray-400">{orgItem.size || '—'}</td>
                        <td className="py-3 pr-4">
                          <Badge className={orgItem.plan === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {orgItem.plan}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{orgItem.ownerEmail || '—'}</td>
                        <td className="py-3 pr-4 text-gray-400">{orgUserCounts[orgItem.id] || 0}</td>
                        <td className="py-3 pr-4 text-gray-400">{orgItem.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orgs.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">No organizations yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div key={session.id} className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-white">{session.email}</p>
                        <p className="text-xs text-gray-500">Org: {orgMap[session.orgId] || 'Unassigned'}</p>
                      </div>
                      <span className="text-xs text-green-400">Active</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Last seen {timeAgo(session.lastSeen)}</p>
                  </div>
                ))}
                {activeSessions.length === 0 && (
                  <p className="text-sm text-gray-500">No active sessions.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Admin Access Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="table w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Requester</th>
                      <th className="py-3 pr-4">Reason</th>
                      <th className="py-3 pr-4">Requested By</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Requested</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {adminRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="py-3 pr-4 text-white">{request.email}</td>
                        <td className="py-3 pr-4 text-gray-400">{request.reason || '—'}</td>
                        <td className="py-3 pr-4 text-gray-400">{request.requestedBy || '—'}</td>
                        <td className="py-3 pr-4">
                          <Badge className={request.status === 'approved' ? 'bg-green-500' : request.status === 'denied' ? 'bg-red-500' : 'bg-yellow-500'}>
                            {request.status || 'pending'}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">
                          {request.created_date ? new Date(request.created_date).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex gap-2">
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              disabled={request.status !== 'pending'}
                              onClick={() => approveAdminRequest(request)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              disabled={request.status !== 'pending'}
                              onClick={() => denyAdminRequest(request)}
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
                  <p className="text-sm text-gray-500 mt-4">No admin requests.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Current Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.slice(0, 8).map((userItem) => (
                  <div key={userItem.id} className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-white">{userItem.email}</p>
                        <p className="text-xs text-gray-500">
                          Org: {orgMap[userItem.orgId] || 'Unassigned'} • Group: {groupMap[userItem.groupId] || 'None'}
                        </p>
                      </div>
                      <Badge className={userItem.role === 'admin' ? 'bg-red-500' : userItem.role === 'owner' ? 'bg-purple-500' : 'bg-blue-500'}>
                        {userItem.role}
                      </Badge>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-gray-500">No users yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Time</th>
                      <th className="py-3 pr-4">Action</th>
                      <th className="py-3 pr-4">User</th>
                      <th className="py-3 pr-4">Location</th>
                      <th className="py-3 pr-4">IP</th>
                      <th className="py-3 pr-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {activityLog.map((event) => {
                      const session = sessions.find((s) => s.email === event.userEmail);
                      const details = event.details
                        ? Array.isArray(event.details)
                          ? event.details.join(', ')
                          : typeof event.details === 'object'
                          ? Object.entries(event.details)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join('; ')
                          : event.details
                        : '—';
                      return (
                        <tr key={event.id}>
                          <td className="py-3 pr-4 text-gray-400">{event.timestamp ? new Date(event.timestamp).toLocaleString() : '—'}</td>
                          <td className="py-3 pr-4 text-white">{event.action?.replace(/_/g, ' ')}</td>
                          <td className="py-3 pr-4 text-gray-400">{event.userEmail}</td>
                          <td className="py-3 pr-4 text-gray-400">{session?.location || 'Local'}</td>
                          <td className="py-3 pr-4 text-gray-400">{session?.ip || '127.0.0.1'}</td>
                          <td className="py-3 pr-4 text-gray-400">{details}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {activityLog.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">No activity yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800 border-gray-700 mb-10">
          <CardHeader>
            <CardTitle className="text-white">Immutable Security Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                  <tr>
                    <th className="py-3 pr-4">Time</th>
                    <th className="py-3 pr-4">Actor</th>
                    <th className="py-3 pr-4">Action</th>
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3 pr-4">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {auditEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="py-3 pr-4 text-gray-400">
                        {event.timestamp ? new Date(event.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{event.actorEmail || '—'}</td>
                      <td className="py-3 pr-4 text-white">{event.action?.replace(/_/g, ' ')}</td>
                      <td className="py-3 pr-4 text-gray-400">{event.source || 'ui'}</td>
                      <td className="py-3 pr-4 text-gray-400" title={event.hash}>
                        {event.hash ? `${event.hash.slice(0, 12)}…` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditEvents.length === 0 && (
                <p className="text-sm text-gray-500 mt-4">No immutable events yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Forensic Watermark Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Time</th>
                      <th className="py-3 pr-4">Forensic ID</th>
                      <th className="py-3 pr-4">Document</th>
                      <th className="py-3 pr-4">User</th>
                      <th className="py-3 pr-4">Org</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {watermarkEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="py-3 pr-4 text-gray-400">
                          {event.downloadedAt ? new Date(event.downloadedAt).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 pr-4 text-white">
                          <a className="underline" href="/documentVault" title={event.watermarkId}>
                            {event.forensicId || '—'}
                          </a>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">
                          {documentMap[event.documentId] || '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{event.userEmail || '—'}</td>
                        <td className="py-3 pr-4 text-gray-400">{orgMap[event.orgId] || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {watermarkEvents.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">No watermarked downloads yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quarantined Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Document</th>
                      <th className="py-3 pr-4">Verdict</th>
                      <th className="py-3 pr-4">SHA-256</th>
                      <th className="py-3 pr-4">Owner</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {quarantinedDocs.slice(0, 8).map((doc) => (
                      <tr key={doc.id}>
                        <td className="py-3 pr-4 text-white">{doc.filename}</td>
                        <td className="py-3 pr-4">
                          <Badge className="bg-red-500">quarantined</Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-400" title={doc.docHash}>
                          {doc.docHash ? `${doc.docHash.slice(0, 10)}…${doc.docHash.slice(-8)}` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{doc.createdByEmail || '—'}</td>
                        <td className="py-3 pr-4">
                          <Button variant="ghost" onClick={() => (window.location.href = '/documentVault')}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {quarantinedDocs.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">No quarantined documents.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Trial Requests</h2>
            <div className="overflow-x-auto">
              <table className="table w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                  <tr>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Company</th>
                    <th className="py-3 pr-4">Interested In</th>
                    <th className="py-3 pr-4">Size</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {trialRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="py-3 pr-4 text-white">{request.fullName || '—'}</td>
                      <td className="py-3 pr-4 text-gray-400">{request.email || '—'}</td>
                      <td className="py-3 pr-4 text-gray-400">{request.companyName || '—'}</td>
                      <td className="py-3 pr-4 text-gray-400" title={request.message || ''}>
                        {request.interestedIn?.replace('_', ' ') || '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{request.companySize || '—'}</td>
                      <td className="py-3 pr-4">
                        <Badge className={getStatusBadge(request.status).color}>
                          {getStatusBadge(request.status).label}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Select onValueChange={(value) => updateTrialStatus(request.id, value, request)}>
                          <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approve & Send Invite</SelectItem>
                            <SelectItem value="trial_active">Start Trial</SelectItem>
                            <SelectItem value="converted">Mark Converted</SelectItem>
                            <SelectItem value="rejected">Reject</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trialRequests.length === 0 && (
                <p className="text-sm text-gray-500 mt-4">No trial requests.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Leads</h2>
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="mb-2">
                      <h3 className="font-bold text-white">{lead.fullName}</h3>
                      <p className="text-sm text-gray-400">{lead.workEmail}</p>
                      {lead.companyName && (
                        <p className="text-sm text-gray-500">{lead.companyName}</p>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">
                        <span className="font-medium">Service:</span> {lead.service?.replace('_', ' ')}
                      </p>
                      {lead.phone && (
                        <p className="text-gray-400">
                          <span className="font-medium">Phone:</span> {lead.phone}
                        </p>
                      )}
                      {lead.message && (
                        <p className="text-gray-400 mt-2">{lead.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Security Scan History</h2>
            <div className="space-y-4">
              {scanHistory.map((scan) => (
                <Card key={scan.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-white">{scan.targetName}</h3>
                        <p className="text-sm text-gray-400">{scan.scannedBy}</p>
                        <p className="text-xs text-gray-500">{new Date(scan.scanDate || scan.created_date).toLocaleString()}</p>
                      </div>
                      <Badge className="bg-gray-700 text-white">
                        {scan.scanType === 'file_upload' ? 'File' : 'GitHub'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      <div className="bg-red-500/10 p-2 rounded border border-red-500/30">
                        <div className="font-bold text-red-400">{scan.summary?.critical || 0}</div>
                        <div className="text-gray-500">Critical</div>
                      </div>
                      <div className="bg-orange-500/10 p-2 rounded border border-orange-500/30">
                        <div className="font-bold text-orange-400">{scan.summary?.high || 0}</div>
                        <div className="text-gray-500">High</div>
                      </div>
                      <div className="bg-yellow-500/10 p-2 rounded border border-yellow-500/30">
                        <div className="font-bold text-yellow-400">{scan.summary?.medium || 0}</div>
                        <div className="text-gray-500">Medium</div>
                      </div>
                      <div className="bg-blue-500/10 p-2 rounded border border-blue-500/30">
                        <div className="font-bold text-blue-400">{scan.summary?.low || 0}</div>
                        <div className="text-gray-500">Low</div>
                      </div>
                      <div className="bg-gray-700/50 p-2 rounded border border-gray-600">
                        <div className="font-bold text-white">{scan.summary?.total || 0}</div>
                        <div className="text-gray-500">Total</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
