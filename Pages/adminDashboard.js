import React, { useState, useEffect } from 'react';
import { ironroot } from '@/lib/ironrootClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Clock, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await ironroot.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = '/login';
        }
        setUser(currentUser);
        const currentOrg = await ironroot.auth.currentOrg();
        setOrg(currentOrg);
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

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            {org && <p className="text-xs text-gray-500 mt-1">Organization: {org.name}</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/userManagement'}>
              User Management
            </Button>
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

        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Trial Requests</h2>
            <div className="space-y-4">
              {trialRequests.map((request) => (
                <Card key={request.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white">{request.fullName}</h3>
                        <p className="text-sm text-gray-400">{request.email}</p>
                        {request.companyName && (
                          <p className="text-sm text-gray-500">{request.companyName}</p>
                        )}
                      </div>
                      <Badge className={getStatusBadge(request.status).color}>
                        {getStatusBadge(request.status).label}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400">
                        <span className="font-medium">Interested in:</span> {request.interestedIn?.replace('_', ' ')}
                      </p>
                      {request.companySize && (
                        <p className="text-gray-400">
                          <span className="font-medium">Company size:</span> {request.companySize}
                        </p>
                      )}
                      {request.message && (
                        <p className="text-gray-400">
                          <span className="font-medium">Message:</span> {request.message}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
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
                    </div>
                  </CardContent>
                </Card>
              ))}
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
