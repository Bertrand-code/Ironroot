import React, { useState, useEffect } from 'react';
import { secpro } from '@/lib/secproClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Mail, Shield, Search, Trash2, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserManagement() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await secpro.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
        }
        setUser(currentUser);
      } catch {
        window.location.href = '/';
      }
    };
    checkAuth();
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => secpro.entities.User.list('-created_date'),
    enabled: !!user,
  });

  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      await secpro.users.inviteUser(email, role);
      await secpro.entities.ActivityLog.create({
        userEmail: user.email,
        action: 'user_invited',
        details: { invitedEmail: email, role },
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setInviteEmail('');
      setInviteRole('user');
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }) => 
      secpro.entities.User.update(userId, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
                    {users.filter(u => u.role === 'admin').length}
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
            <div className="flex gap-4">
              <Input
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                type="email"
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
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
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={u.role}
                      onValueChange={(newRole) => 
                        updateUserRoleMutation.mutate({ userId: u.id, newRole })
                      }
                    >
                      <SelectTrigger className="bg-gray-900 border-gray-700 text-white w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge className={u.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}>
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