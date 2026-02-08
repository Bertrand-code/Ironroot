import React, { useState, useEffect, useMemo } from 'react';
import { ironroot } from '@/lib/ironrootClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail, Shield, Search, Building, Layers } from 'lucide-react';

export default function UserManagement() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviteOrgId, setInviteOrgId] = useState('');
  const [inviteGroupId, setInviteGroupId] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [orgForm, setOrgForm] = useState({
    name: '',
    industry: 'Security',
    size: '1-50',
    plan: 'paid',
  });
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
  });
  const [requestFilter, setRequestFilter] = useState('pending');
  const queryClient = useQueryClient();
  const canManageAdmins = user?.role === 'owner';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await ironroot.auth.me();
        if (!['admin', 'owner'].includes(currentUser.role)) {
          window.location.href = '/login';
        }
        setUser(currentUser);
      } catch {
        window.location.href = '/login';
      }
    };
    checkAuth();
  }, []);

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

  const { data: adminRequests = [] } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: () => ironroot.entities.AdminRequest.list('-created_date'),
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => ironroot.entities.Session.list('-lastSeen'),
    enabled: !!user,
  });

  const orgMap = orgs.reduce((acc, orgItem) => {
    acc[orgItem.id] = orgItem.name;
    return acc;
  }, {});

  const groupMap = groups.reduce((acc, groupItem) => {
    acc[groupItem.id] = groupItem.name;
    return acc;
  }, {});

  const orgUserCounts = useMemo(() => {
    return users.reduce((acc, item) => {
      if (!item.orgId) return acc;
      acc[item.orgId] = (acc[item.orgId] || 0) + 1;
      return acc;
    }, {});
  }, [users]);

  const groupUserCounts = useMemo(() => {
    return users.reduce((acc, item) => {
      if (!item.groupId) return acc;
      acc[item.groupId] = (acc[item.groupId] || 0) + 1;
      return acc;
    }, {});
  }, [users]);

  useEffect(() => {
    if (!inviteOrgId && user?.orgId) {
      setInviteOrgId(user.orgId);
    }
  }, [inviteOrgId, user]);

  useEffect(() => {
    if (!inviteGroupId && groups.length > 0) {
      setInviteGroupId(groups[0].id);
    }
  }, [inviteGroupId, groups]);

  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      await ironroot.users.inviteUser(email, role, inviteOrgId || null, inviteGroupId || null);
      if (invitePassword) {
        await ironroot.users.setPassword({ email, password: invitePassword });
      }
      await ironroot.entities.ActivityLog.create({
        userEmail: user.email,
        action: 'user_invited',
        details: { invitedEmail: email, role, orgId: inviteOrgId || null, groupId: inviteGroupId || null },
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setInviteEmail('');
      setInviteRole('user');
      setInvitePassword('');
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      await ironroot.entities.Group.create({
        name: groupForm.name,
        description: groupForm.description,
      });
      await ironroot.entities.ActivityLog.create({
        userEmail: user.email,
        action: 'group_created',
        details: { groupName: groupForm.name },
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setGroupForm({ name: '', description: '' });
    },
  });
  const createOrgMutation = useMutation({
    mutationFn: async () => {
      await ironroot.entities.Organization.create({
        name: orgForm.name,
        slug: orgForm.name.toLowerCase().replace(/\s+/g, '-'),
        industry: orgForm.industry,
        size: orgForm.size,
        plan: orgForm.plan,
      });
      await ironroot.entities.ActivityLog.create({
        userEmail: user.email,
        action: 'org_created',
        details: { orgName: orgForm.name },
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] });
      setOrgForm({ name: '', industry: 'Security', size: '1-50', plan: 'paid' });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }) =>
      ironroot.users.assignRole({ userId, role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserOrgMutation = useMutation({
    mutationFn: ({ userId, orgId }) =>
      ironroot.entities.User.update(userId, { orgId: orgId || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserGroupMutation = useMutation({
    mutationFn: ({ userId, groupId }) =>
      ironroot.entities.User.update(userId, { groupId: groupId || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const approveAdminRequestMutation = useMutation({
    mutationFn: async (request) => {
      if (user.role !== 'owner') {
        throw new Error('Owner approval required.');
      }
      const userRecord = await ironroot.users.inviteUser(request.email, 'admin', user?.orgId || null);
      await ironroot.entities.AdminRequest.update(request.id, { status: 'approved' });
      await ironroot.entities.ActivityLog.create({
        userEmail: user.email,
        action: 'admin_request_approved',
        details: { email: request.email, userId: userRecord.id },
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const denyAdminRequestMutation = useMutation({
    mutationFn: async (request) => {
      await ironroot.entities.AdminRequest.update(request.id, { status: 'denied' });
      await ironroot.entities.ActivityLog.create({
        userEmail: user.email,
        action: 'admin_request_denied',
        details: { email: request.email },
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
    },
  });

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const latestSessionByUser = sessions.reduce((acc, session) => {
    if (!session?.userId) return acc;
    if (!acc[session.userId]) {
      acc[session.userId] = session;
    }
    return acc;
  }, {});

  const filteredRequests = adminRequests.filter((request) => {
    if (requestFilter === 'all') return true;
    return (request.status || 'pending') === requestFilter;
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['orgs'] });
    queryClient.invalidateQueries({ queryKey: ['groups'] });
    queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="admin-hero" style={{ marginBottom: '28px' }}>
          <div>
            <span className="eyebrow">Identity & Access</span>
            <h1 className="title-lg">User Management</h1>
            <p className="text-lead">Control roles, group access, and org assignments from one panel.</p>
            <div className="admin-hero__actions">
              <Button variant="outline" onClick={() => (window.location.href = '/adminDashboard')}>Admin Dashboard</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/controlCenter')}>Owner Control</Button>
            </div>
          </div>
          <div className="admin-hero__stats">
            <div className="admin-kpi">
              <div className="admin-kpi__label">Owner Mode</div>
              <div className="admin-kpi__value">{canManageAdmins ? 'Enabled' : 'Restricted'}</div>
              <div className="card__meta">Admin approvals {canManageAdmins ? 'available' : 'locked'}</div>
            </div>
            <div className="admin-kpi">
              <div className="admin-kpi__label">Users</div>
              <div className="admin-kpi__value">{users.length}</div>
              <div className="card__meta">Active identities</div>
            </div>
            <div className="admin-kpi">
              <div className="admin-kpi__label">Admins</div>
              <div className="admin-kpi__value">{users.filter((u) => ['admin', 'owner'].includes(u.role)).length}</div>
              <div className="card__meta">Privileged staff</div>
            </div>
            <div className="admin-kpi">
              <div className="admin-kpi__label">Groups</div>
              <div className="admin-kpi__value">{groups.length}</div>
              <div className="card__meta">Access tiers</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Admins</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => ['admin', 'owner'].includes(u.role)).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Regular Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.role === 'user').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite User */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite New User
            </CardTitle>
            <div className="admin-toolbar">
              <Button variant="outline" onClick={refreshData}>Refresh Data</Button>
              <span className="card__meta">Admin requests: {adminRequests.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-6 gap-4">
              <Input
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                type="email"
              />
              <Input
                placeholder="Temporary password"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                type="password"
              />
              <p className="text-xs text-gray-500 md:col-span-6">
                Temporary passwords must be 10+ characters with 1 uppercase letter and 1 number.
              </p>
              <select
                className="select"
                value={inviteOrgId}
                onChange={(e) => setInviteOrgId(e.target.value)}
              >
                <option value="">Assign org (optional)</option>
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
              <select
                className="select"
                value={inviteGroupId}
                onChange={(e) => setInviteGroupId(e.target.value)}
              >
                <option value="">Assign group (optional)</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <select
                className="select"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                disabled={!canManageAdmins}
              >
                <option value="user">User</option>
                {canManageAdmins && <option value="admin">Admin</option>}
              </select>
              <Button
                onClick={() => inviteUserMutation.mutate({ email: inviteEmail, role: inviteRole })}
                disabled={!inviteEmail || inviteUserMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Organizations */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organization Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4 mb-6">
              <Input
                placeholder="Organization Name"
                value={orgForm.name}
                onChange={(e) => setOrgForm((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <Input
                placeholder="Industry"
                value={orgForm.industry}
                onChange={(e) => setOrgForm((prev) => ({ ...prev, industry: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <select
                className="select"
                value={orgForm.size}
                onChange={(e) => setOrgForm((prev) => ({ ...prev, size: e.target.value }))}
              >
                <option value="1-50">1-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-1000">201-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
              <select
                className="select"
                value={orgForm.plan}
                onChange={(e) => setOrgForm((prev) => ({ ...prev, plan: e.target.value }))}
              >
                <option value="paid">Paid</option>
                <option value="trial">Trial</option>
              </select>
              <Button
                onClick={() => createOrgMutation.mutate()}
                disabled={!orgForm.name || createOrgMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Org
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                  <tr>
                    <th className="py-3 pr-4">Organization</th>
                    <th className="py-3 pr-4">Industry</th>
                    <th className="py-3 pr-4">Size</th>
                    <th className="py-3 pr-4">Plan</th>
                    <th className="py-3 pr-4">Users</th>
                    <th className="py-3 pr-4">Org ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {orgs.map((org) => (
                    <tr key={org.id}>
                      <td className="py-3 pr-4 text-white">{org.name}</td>
                      <td className="py-3 pr-4 text-gray-400">{org.industry || '—'}</td>
                      <td className="py-3 pr-4 text-gray-400">{org.size || '—'}</td>
                      <td className="py-3 pr-4">
                        <Badge className={org.plan === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {org.plan}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{orgUserCounts[org.id] || 0}</td>
                      <td className="py-3 pr-4 text-gray-400">{org.id}</td>
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

        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Group Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Input
                placeholder="Group name"
                value={groupForm.name}
                onChange={(e) => setGroupForm((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <Input
                placeholder="Description"
                value={groupForm.description}
                onChange={(e) => setGroupForm((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <Button
                onClick={() => createGroupMutation.mutate()}
                disabled={!groupForm.name || createGroupMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Group
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                  <tr>
                    <th className="py-3 pr-4">Group</th>
                    <th className="py-3 pr-4">Description</th>
                    <th className="py-3 pr-4">Members</th>
                    <th className="py-3 pr-4">Group ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {groups.map((group) => (
                    <tr key={group.id}>
                      <td className="py-3 pr-4 text-white">{group.name}</td>
                      <td className="py-3 pr-4 text-gray-400">{group.description || '—'}</td>
                      <td className="py-3 pr-4 text-gray-400">{groupUserCounts[group.id] || 0}</td>
                      <td className="py-3 pr-4 text-gray-400">{group.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {groups.length === 0 && (
                <p className="text-sm text-gray-500 mt-4">No groups created yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Access Requests
              </CardTitle>
              <select
                className="select"
                value={requestFilter}
                onChange={(e) => setRequestFilter(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="all">All</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                  <tr>
                    <th className="py-3 pr-4">Requester</th>
                    <th className="py-3 pr-4">Reason</th>
                    <th className="py-3 pr-4">Org</th>
                    <th className="py-3 pr-4">Requested By</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Requested</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="py-3 pr-4 text-white">{req.email}</td>
                      <td className="py-3 pr-4 text-gray-400">{req.reason || '—'}</td>
                      <td className="py-3 pr-4 text-gray-400">{orgMap[req.orgId] || 'Unassigned'}</td>
                      <td className="py-3 pr-4 text-gray-400">{req.requestedBy || '—'}</td>
                      <td className="py-3 pr-4">
                        <Badge className={req.status === 'approved' ? 'bg-green-500' : req.status === 'denied' ? 'bg-red-500' : 'bg-yellow-500'}>
                          {req.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-400">
                        {req.created_date ? new Date(req.created_date).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2">
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            disabled={!canManageAdmins || req.status !== 'pending'}
                            onClick={() => approveAdminRequestMutation.mutate(req)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={!canManageAdmins || req.status !== 'pending'}
                            onClick={() => denyAdminRequestMutation.mutate(req)}
                          >
                            Deny
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRequests.length === 0 && (
                <p className="text-sm text-gray-500 mt-4">No admin requests in this view.</p>
              )}
              {!canManageAdmins && (
                <p className="text-xs text-gray-500 mt-3">Only the owner can approve admin access.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">All Users</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                  <tr>
                    <th className="py-3 pr-4">User</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Org</th>
                    <th className="py-3 pr-4">Last Login</th>
                    <th className="py-3 pr-4">IP</th>
                    <th className="py-3 pr-4">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map((u) => {
                    const session = latestSessionByUser[u.id];
                    return (
                      <tr key={u.id}>
                        <td className="py-3 pr-4">
                          <div className="text-white">{u.email}</div>
                          <div className="text-xs text-gray-500">{u.full_name || u.fullName || 'No name'}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className={u.role === 'admin' ? 'bg-red-500' : u.role === 'owner' ? 'bg-purple-500' : 'bg-blue-500'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{orgMap[u.orgId] || 'Unassigned'}</td>
                        <td className="py-3 pr-4 text-gray-400">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{session?.ip || u.lastLoginIp || '—'}</td>
                        <td className="py-3 pr-4 text-gray-400">{session?.location || u.lastLoginLocation || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <p className="text-sm text-gray-500 mt-4">No users match the current filter.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
