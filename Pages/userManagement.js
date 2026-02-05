import React, { useState, useEffect } from 'react';
import { ironroot } from '@/lib/ironrootClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail, Shield, Search, Building, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const orgMap = orgs.reduce((acc, orgItem) => {
    acc[orgItem.id] = orgItem.name;
    return acc;
  }, {});

  const groupMap = groups.reduce((acc, groupItem) => {
    acc[groupItem.id] = groupItem.name;
    return acc;
  }, {});

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-red-500" />
            User Management
          </h1>
          <p className="text-gray-400 mt-2">Manage users, roles, and permissions</p>
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

            <div className="grid md:grid-cols-2 gap-4">
              {orgs.map((org) => (
                <div key={org.id} className="bg-gray-900/60 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-white font-semibold">{org.name}</h4>
                  <p className="text-xs text-gray-500">{org.industry} • {org.size}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <Badge className={org.plan === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {org.plan}
                    </Badge>
                    <span className="text-gray-500">Org ID: {org.id}</span>
                  </div>
                </div>
              ))}
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
            <div className="grid md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="bg-gray-900/60 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-white font-semibold">{group.name}</h4>
                  <p className="text-xs text-gray-500">{group.description}</p>
                  <div className="mt-2 text-xs text-gray-500">Group ID: {group.id}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Access Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adminRequests.length === 0 ? (
              <p className="text-sm text-gray-400">No pending admin requests.</p>
            ) : (
              <div className="space-y-3">
                {adminRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{req.email}</p>
                      <p className="text-xs text-gray-500">{req.reason}</p>
                      <Badge className={req.status === 'approved' ? 'bg-green-500' : req.status === 'denied' ? 'bg-red-500' : 'bg-yellow-500'}>
                        {req.status || 'pending'}
                      </Badge>
                    </div>
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
                  </div>
                ))}
                {!canManageAdmins && (
                  <p className="text-xs text-gray-500">Only the owner can approve admin access.</p>
                )}
              </div>
            )}
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
            <div className="space-y-3">
              {filteredUsers.map((u, index) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                      {u.full_name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{u.full_name || 'No name'}</h4>
                      <p className="text-sm text-gray-400">{u.email}</p>
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(u.created_date).toLocaleDateString()}
                      </p>
                      {u.orgId && (
                        <p className="text-xs text-gray-500">
                          Org: {orgMap[u.orgId] || u.orgId}
                        </p>
                      )}
                      {u.groupId && (
                        <p className="text-xs text-gray-500">
                          Group: {groupMap[u.groupId] || u.groupId}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      className="select"
                      value={u.groupId || ''}
                      onChange={(e) =>
                        updateUserGroupMutation.mutate({ userId: u.id, groupId: e.target.value })
                      }
                    >
                      <option value="">No group</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="select"
                      value={u.orgId || ''}
                      onChange={(e) =>
                        updateUserOrgMutation.mutate({ userId: u.id, orgId: e.target.value })
                      }
                    >
                      <option value="">No org</option>
                      {orgs.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="select"
                      value={u.role}
                      onChange={(e) =>
                        updateUserRoleMutation.mutate({ userId: u.id, newRole: e.target.value })
                      }
                      disabled={!canManageAdmins || u.role === 'owner'}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      {u.role === 'owner' && <option value="owner">Owner</option>}
                    </select>
                    <Badge className={u.role === 'admin' ? 'bg-red-500' : u.role === 'owner' ? 'bg-purple-500' : 'bg-blue-500'}>
                      {u.role}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
