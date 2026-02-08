import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, BookOpen, AlertTriangle, Eye, Pencil, Sparkles, Upload, UserPlus, Calendar } from 'lucide-react';
import AuthGate from '@/components/AuthGate';
import { ironroot } from '@/lib/ironrootClient';
import { useAuth } from '@/lib/useAuth';

const learningPaths = [
  { id: 'lp-001', title: 'Phishing Resistance Fundamentals', duration: '12 min', completion: 72, audience: 'All Users' },
  { id: 'lp-002', title: 'Secure Credentials & MFA Hygiene', duration: '18 min', completion: 61, audience: 'Admins & Developers' },
  { id: 'lp-003', title: 'Incident Reporting Playbook', duration: '9 min', completion: 84, audience: 'All Users' },
];

const statusBadge = {
  Active: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  Scheduled: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
  Completed: 'bg-gray-700 text-gray-200 border border-gray-600',
};

const eventStatusBadge = {
  delivered: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
  opened: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  clicked: 'bg-red-500/10 text-red-300 border border-red-500/30',
  reported: 'bg-purple-500/10 text-purple-300 border border-purple-500/30',
  unknown: 'bg-gray-700 text-gray-200 border border-gray-600',
};

const trainingStatusList = ['Enrolled', 'In Progress', 'Overdue', 'Completed'];

const formatTimestamp = (value) => (value ? new Date(value).toLocaleString() : '—');

const getEventStatus = (event) => {
  if (event.status) return event.status;
  if (event.reportedAt) return 'reported';
  if (event.clickedAt) return 'clicked';
  if (event.openedAt) return 'opened';
  if (event.deliveredAt) return 'delivered';
  return 'unknown';
};

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    return row;
  });
};

export default function SecurityTraining() {
  const { user, org } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [eventSearch, setEventSearch] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateDraft, setTemplateDraft] = useState(null);
  const [saveState, setSaveState] = useState('');
  const [campaignDraft, setCampaignDraft] = useState({
    name: '',
    templateId: '',
    targetGroupId: '',
    startAt: '',
    endAt: '',
  });
  const [aiForm, setAiForm] = useState({
    scenario: 'credential verification',
    brand: 'Ironroot',
    tone: 'urgent but professional',
    difficulty: 'Medium',
    vector: 'Email',
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [manualUser, setManualUser] = useState({
    name: '',
    email: '',
    role: 'user',
    orgId: '',
    groupId: '',
  });
  const [importStatus, setImportStatus] = useState('');

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

  const { data: templates = [] } = useQuery({
    queryKey: ['trainingTemplates'],
    queryFn: () => ironroot.entities.TrainingTemplate.list('name'),
    enabled: !!user,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['trainingCampaigns'],
    queryFn: () => ironroot.entities.TrainingCampaign.list('-created_date'),
    enabled: !!user,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['trainingEvents'],
    queryFn: () => ironroot.entities.TrainingEvent.list('-created_date'),
    enabled: !!user,
  });

  const orgMap = useMemo(() => orgs.reduce((acc, item) => ({ ...acc, [item.id]: item.name }), {}), [orgs]);
  const groupMap = useMemo(() => groups.reduce((acc, item) => ({ ...acc, [item.id]: item.name }), {}), [groups]);
  const templateMap = useMemo(() => templates.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}), [templates]);

  useEffect(() => {
    if (!selectedCampaignId && campaigns.length) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  useEffect(() => {
    if (!selectedTemplateId && templates.length) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    const selected = templates.find((template) => template.id === selectedTemplateId);
    if (selected) {
      setTemplateDraft({ ...selected });
      setSaveState('');
    }
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    if (!campaignDraft.templateId && templates.length) {
      setCampaignDraft((prev) => ({ ...prev, templateId: templates[0].id }));
    }
  }, [templates, campaignDraft.templateId]);

  useEffect(() => {
    if (!manualUser.orgId && orgs.length) {
      setManualUser((prev) => ({ ...prev, orgId: org?.id || orgs[0].id }));
    }
  }, [orgs, manualUser.orgId, org]);

  const campaignRows = useMemo(() => {
    return campaigns.map((campaign) => {
      const template = templateMap[campaign.templateId];
      const target = campaign.targetGroupId ? groupMap[campaign.targetGroupId] : 'All Staff';
      const relatedEvents = events.filter((event) => event.campaignId === campaign.id);
      const delivered = relatedEvents.filter((event) => !!event.deliveredAt || ['delivered', 'opened', 'clicked', 'reported'].includes(getEventStatus(event))).length;
      const opened = relatedEvents.filter((event) => !!event.openedAt || ['opened', 'clicked', 'reported'].includes(getEventStatus(event))).length;
      const clicked = relatedEvents.filter((event) => !!event.clickedAt || ['clicked', 'reported'].includes(getEventStatus(event))).length;
      const reported = relatedEvents.filter((event) => !!event.reportedAt || getEventStatus(event) === 'reported').length;
      const openRate = delivered ? `${Math.round((opened / delivered) * 100)}%` : '—';
      const clickRate = delivered ? `${Math.round((clicked / delivered) * 100)}%` : '—';
      const reportRate = delivered ? `${Math.round((reported / delivered) * 100)}%` : '—';
      return {
        ...campaign,
        templateName: template?.name || campaign.templateName || 'Template',
        target,
        startAt: campaign.startAt || campaign.launchDate || '—',
        endAt: campaign.endAt || '—',
        openRate,
        clickRate,
        reportRate,
      };
    });
  }, [campaigns, templateMap, groupMap, events]);

  const eventRows = useMemo(() => {
    const searchValue = eventSearch.trim().toLowerCase();
    return events
      .filter((event) => !selectedCampaignId || event.campaignId === selectedCampaignId)
      .filter((event) => eventFilter === 'all' || getEventStatus(event) === eventFilter)
      .filter((event) => {
        if (!searchValue) return true;
        const name = event.userName?.toLowerCase() || '';
        const email = event.userEmail?.toLowerCase() || '';
        return name.includes(searchValue) || email.includes(searchValue);
      })
      .map((event) => {
        const campaign = campaigns.find((item) => item.id === event.campaignId);
        const template = campaign ? templateMap[campaign.templateId] : null;
        return {
          ...event,
          status: getEventStatus(event),
          campaignName: campaign?.name || 'Campaign',
          templateName: template?.name || 'Template',
        };
      });
  }, [events, selectedCampaignId, eventFilter, eventSearch, campaigns, templateMap]);

  const clickedUsers = useMemo(() => {
    return eventRows.filter((event) => event.status === 'clicked').slice(0, 6);
  }, [eventRows]);

  const eventStatsByEmail = useMemo(() => {
    const stats = {};
    events.forEach((event) => {
      if (!event.userEmail) return;
      const email = event.userEmail.toLowerCase();
      if (!stats[email]) {
        stats[email] = {
          delivered: 0,
          clicked: 0,
          lastActionAt: null,
          lastIp: event.ip,
          lastLocation: event.location,
        };
      }
      stats[email].delivered += 1;
      if (getEventStatus(event) === 'clicked') stats[email].clicked += 1;
      const timestamps = [event.reportedAt, event.clickedAt, event.openedAt, event.deliveredAt]
        .filter(Boolean)
        .map((ts) => new Date(ts).getTime());
      const latest = timestamps.length ? Math.max(...timestamps) : null;
      if (latest && (!stats[email].lastActionAt || latest > stats[email].lastActionAt)) {
        stats[email].lastActionAt = latest;
        stats[email].lastIp = event.ip;
        stats[email].lastLocation = event.location;
      }
    });
    return stats;
  }, [events]);

  const directoryRows = useMemo(() => {
    const filtered = users.filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));
    return filtered.map((u, idx) => {
      const status = trainingStatusList[idx % trainingStatusList.length];
      const riskScore = Math.max(45, 95 - ((idx * 7) % 40));
      const stats = eventStatsByEmail[u.email?.toLowerCase() || ''] || {};
      const clickRate = stats.delivered ? `${Math.round((stats.clicked / stats.delivered) * 100)}%` : '—';
      return {
        id: u.id,
        name: u.fullName || u.full_name || u.email?.split('@')[0],
        email: u.email,
        role: u.role,
        org: orgMap[u.orgId] || 'Unassigned',
        group: groupMap[u.groupId] || 'None',
        status,
        riskScore,
        phishFail: clickRate,
        lastCompleted: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—',
        lastIp: u.lastLoginIp || stats.lastIp || '—',
        location: u.lastLoginLocation || stats.lastLocation || '—',
        lastPhish: stats.lastActionAt ? new Date(stats.lastActionAt).toLocaleString() : '—',
      };
    });
  }, [users, search, orgMap, groupMap, eventStatsByEmail]);

  const orgDirectory = useMemo(() => {
    return orgs.map((orgItem, idx) => {
      const orgUsers = users.filter((u) => u.orgId === orgItem.id);
      const completed = orgUsers.filter((u, uIdx) => trainingStatusList[uIdx % trainingStatusList.length] === 'Completed').length;
      const completionRate = orgUsers.length ? Math.round((completed / orgUsers.length) * 100) : 0;
      const riskScore = Math.max(50, 92 - (idx * 6));
      return {
        id: orgItem.id,
        name: orgItem.name,
        users: orgUsers.length,
        completionRate: `${completionRate}%`,
        riskScore,
        plan: orgItem.plan,
      };
    });
  }, [orgs, users]);

  const handleTemplateSave = async () => {
    if (!templateDraft) return;
    setSaveState('Saving...');
    const existing = templates.find((item) => item.id === templateDraft.id);
    if (existing) {
      await ironroot.entities.TrainingTemplate.update(templateDraft.id, {
        ...templateDraft,
        updated: new Date().toISOString().slice(0, 10),
      });
      setSaveState('Saved');
      queryClient.invalidateQueries({ queryKey: ['trainingTemplates'] });
      return;
    }
    const { id, ...payload } = templateDraft;
    const created = await ironroot.entities.TrainingTemplate.create({
      ...payload,
      updated: new Date().toISOString().slice(0, 10),
    });
    setSaveState('Saved');
    setSelectedTemplateId(created.id);
    queryClient.invalidateQueries({ queryKey: ['trainingTemplates'] });
  };

  const handleGenerateTemplate = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/training/generateTemplate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiForm),
      });
      const data = await response.json();
      if (!response.ok || !data?.template) {
        throw new Error(data?.error || 'Unable to generate template');
      }
      setTemplateDraft({
        ...data.template,
        id: null,
      });
      setSelectedTemplateId('');
      setSaveState('Generated');
    } catch (error) {
      setAiError(error.message || 'Failed to generate template');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCampaignLaunch = async () => {
    if (!campaignDraft.name.trim()) return;
    if (!campaignDraft.templateId) return;
    const startAt = campaignDraft.startAt ? new Date(campaignDraft.startAt).toISOString() : null;
    const endAt = campaignDraft.endAt ? new Date(campaignDraft.endAt).toISOString() : null;
    const status = startAt && new Date(startAt) > new Date() ? 'Scheduled' : 'Active';
    await ironroot.entities.TrainingCampaign.create({
      name: campaignDraft.name,
      templateId: campaignDraft.templateId,
      targetGroupId: campaignDraft.targetGroupId || null,
      startAt,
      endAt,
      status,
      launchDate: startAt ? startAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      ownerEmail: user?.email,
    });
    setCampaignDraft({ name: '', templateId: campaignDraft.templateId, targetGroupId: '', startAt: '', endAt: '' });
    queryClient.invalidateQueries({ queryKey: ['trainingCampaigns'] });
  };

  const handleAddUser = async () => {
    if (!manualUser.email.trim()) return;
    await ironroot.entities.User.create({
      fullName: manualUser.name,
      email: manualUser.email,
      role: manualUser.role || 'user',
      orgId: manualUser.orgId || org?.id || null,
      groupId: manualUser.groupId || null,
    });
    setManualUser({ name: '', email: '', role: 'user', orgId: manualUser.orgId, groupId: '' });
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const handleCsvUpload = async (file) => {
    if (!file) return;
    setImportStatus('Importing...');
    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) {
      setImportStatus('No valid rows found in CSV.');
      return;
    }
    for (const row of rows) {
      const email = row.email || row.mail || row.user || '';
      if (!email) continue;
      const orgName = row.org || row.company || '';
      const groupName = row.group || row.team || '';
      const orgId = orgs.find((orgItem) => orgItem.name.toLowerCase() === orgName.toLowerCase())?.id || manualUser.orgId || org?.id || null;
      const groupId = groups.find((group) => group.name.toLowerCase() === groupName.toLowerCase())?.id || null;
      await ironroot.entities.User.create({
        fullName: row.name || row.fullname || row.full_name || '',
        email,
        role: row.role || 'user',
        orgId,
        groupId,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['users'] });
    setImportStatus(`Imported ${rows.length} user record(s).`);
  };

  const handleDownloadTemplate = () => {
    const csv = 'email,name,role,org,group\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ironroot-training-import.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summaryStats = useMemo(() => {
    const totalEvents = events.length;
    const clickedCount = events.filter((event) => getEventStatus(event) === 'clicked').length;
    const reportCount = events.filter((event) => getEventStatus(event) === 'reported').length;
    const clickRate = totalEvents ? `${Math.round((clickedCount / totalEvents) * 100)}%` : '—';
    const reportRate = totalEvents ? `${Math.round((reportCount / totalEvents) * 100)}%` : '—';
    return { totalEvents, clickRate, reportRate };
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <AuthGate
          title="Sign in to access Training"
          description="Security awareness campaigns are available to paid organizations."
          roles={['owner', 'admin']}
          plans={['paid']}
          feature="securityTraining"
        >
          <div className="admin-hero" style={{ marginBottom: '28px' }}>
            <div>
              <span className="eyebrow">Awareness & Simulation</span>
              <h1 className="title-lg">Security Training Command Center</h1>
              <p className="text-lead">
                Run phishing simulations, micro-learning paths, and compliance attestations with enterprise-ready templates.
              </p>
              <div className="admin-hero__actions">
                <Button variant="outline" onClick={() => setActiveTab('campaigns')}>Campaigns</Button>
                <Button variant="outline" onClick={() => setActiveTab('templates')}>Template Library</Button>
                <Button variant="outline" onClick={() => setActiveTab('directory')}>Directory</Button>
              </div>
            </div>
            <div className="admin-hero__stats">
              {[
                { label: 'Active Campaigns', value: campaignRows.filter((c) => c.status === 'Active').length, meta: 'Running now' },
                { label: 'Completion Rate', value: '78%', meta: 'Last 30 days' },
                { label: 'Click Rate', value: summaryStats.clickRate, meta: 'Exposure rate' },
                { label: 'Report Rate', value: summaryStats.reportRate, meta: 'User vigilance' },
              ].map((item) => (
                <div key={item.label} className="admin-kpi">
                  <div className="admin-kpi__label">{item.label}</div>
                  <div className="admin-kpi__value">{item.value}</div>
                  <div className="card__meta">{item.meta}</div>
                </div>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="directory">Directory</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              <div className="grid lg:grid-cols-3 gap-6 mt-6">
                <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white">Campaign Pipeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="table w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                          <tr>
                            <th className="py-3 pr-4">Campaign</th>
                            <th className="py-3 pr-4">Template</th>
                            <th className="py-3 pr-4">Target</th>
                            <th className="py-3 pr-4">Status</th>
                            <th className="py-3 pr-4">Start</th>
                            <th className="py-3 pr-4">End</th>
                            <th className="py-3 pr-4">Open Rate</th>
                            <th className="py-3 pr-4">Click Rate</th>
                            <th className="py-3 pr-4">Report Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {campaignRows.map((campaign) => (
                            <tr key={campaign.id}>
                              <td className="py-3 pr-4 text-white">{campaign.name}</td>
                              <td className="py-3 pr-4 text-gray-400">{campaign.templateName}</td>
                              <td className="py-3 pr-4 text-gray-400">{campaign.target}</td>
                              <td className="py-3 pr-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${statusBadge[campaign.status] || 'bg-gray-700 text-gray-200'}`}>
                                  {campaign.status}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-gray-400">{campaign.startAt ? formatTimestamp(campaign.startAt) : '—'}</td>
                              <td className="py-3 pr-4 text-gray-400">{campaign.endAt ? formatTimestamp(campaign.endAt) : '—'}</td>
                              <td className="py-3 pr-4 text-gray-400">{campaign.openRate}</td>
                              <td className="py-3 pr-4 text-gray-400">{campaign.clickRate}</td>
                              <td className="py-3 pr-4 text-gray-400">{campaign.reportRate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Campaign Builder</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="card__meta">
                      Launch new simulations with Gophish-style templates and multi-stage follow-ups.
                    </p>
                    <Input
                      placeholder="Campaign name"
                      value={campaignDraft.name}
                      onChange={(e) => setCampaignDraft((prev) => ({ ...prev, name: e.target.value }))}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                    <select
                      className="select"
                      value={campaignDraft.templateId}
                      onChange={(e) => setCampaignDraft((prev) => ({ ...prev, templateId: e.target.value }))}
                    >
                      <option>Choose template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                    <select
                      className="select"
                      value={campaignDraft.targetGroupId}
                      onChange={(e) => setCampaignDraft((prev) => ({ ...prev, targetGroupId: e.target.value }))}
                    >
                      <option value="">Target group</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                      <option value="">All Staff</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Start time</label>
                        <Input
                          type="datetime-local"
                          value={campaignDraft.startAt}
                          onChange={(e) => setCampaignDraft((prev) => ({ ...prev, startAt: e.target.value }))}
                          className="bg-gray-900 border-gray-700 text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">End time</label>
                        <Input
                          type="datetime-local"
                          value={campaignDraft.endAt}
                          onChange={(e) => setCampaignDraft((prev) => ({ ...prev, endAt: e.target.value }))}
                          className="bg-gray-900 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={handleCampaignLaunch}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Campaign
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mt-6">
                <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white">Delivery & Click Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <select
                        value={selectedCampaignId}
                        onChange={(e) => setSelectedCampaignId(e.target.value)}
                        className="select"
                      >
                        {campaigns.map((campaign) => (
                          <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                        ))}
                      </select>
                      <select
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        className="select"
                      >
                        <option value="all">All statuses</option>
                        <option value="delivered">Delivered</option>
                        <option value="opened">Opened</option>
                        <option value="clicked">Clicked</option>
                        <option value="reported">Reported</option>
                      </select>
                      <Input
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        placeholder="Search recipient"
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="table w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                          <tr>
                            <th className="py-3 pr-4">Recipient</th>
                            <th className="py-3 pr-4">Email</th>
                            <th className="py-3 pr-4">Status</th>
                            <th className="py-3 pr-4">Delivered</th>
                            <th className="py-3 pr-4">Opened</th>
                            <th className="py-3 pr-4">Clicked</th>
                            <th className="py-3 pr-4">Reported</th>
                            <th className="py-3 pr-4">IP</th>
                            <th className="py-3 pr-4">Location</th>
                            <th className="py-3 pr-4">Device</th>
                            <th className="py-3 pr-4">User Agent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {eventRows.map((event) => (
                            <tr key={event.id}>
                              <td className="py-3 pr-4 text-white">{event.userName || '—'}</td>
                              <td className="py-3 pr-4 text-gray-400">
                                {event.userEmail ? (
                                  <a className="text-blue-300 hover:underline" href={`mailto:${event.userEmail}`}>
                                    {event.userEmail}
                                  </a>
                                ) : '—'}
                              </td>
                              <td className="py-3 pr-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${eventStatusBadge[event.status] || eventStatusBadge.unknown}`}>
                                  {event.status}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-gray-400">{formatTimestamp(event.deliveredAt)}</td>
                              <td className="py-3 pr-4 text-gray-400">{formatTimestamp(event.openedAt)}</td>
                              <td className="py-3 pr-4 text-gray-400">{formatTimestamp(event.clickedAt)}</td>
                              <td className="py-3 pr-4 text-gray-400">{formatTimestamp(event.reportedAt)}</td>
                              <td className="py-3 pr-4 text-gray-400">{event.ip || '—'}</td>
                              <td className="py-3 pr-4 text-gray-400">{event.location || '—'}</td>
                              <td className="py-3 pr-4 text-gray-400">{event.device || '—'}</td>
                              <td className="py-3 pr-4 text-gray-400">{event.userAgent || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {eventRows.length === 0 && (
                        <p className="text-sm text-gray-500 mt-4">No campaign events match the current filters.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Clicked Users</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="card__meta">Recipients who interacted with the training email.</p>
                    {clickedUsers.length === 0 && (
                      <p className="text-sm text-gray-500">No clicks recorded for this campaign.</p>
                    )}
                    {clickedUsers.map((event) => (
                      <div key={event.id} className="p-3 bg-gray-900/60 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold">{event.userName || 'Unknown recipient'}</div>
                            <div className="text-xs text-gray-500">{event.userEmail || 'No email on record'}</div>
                          </div>
                          <Badge className="bg-red-500/10 text-red-300 border border-red-500/30">Clicked</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">{event.location || 'Location unknown'} • {event.ip || 'IP unknown'}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <div className="grid lg:grid-cols-3 gap-6 mt-6">
                <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white">Template Library</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="table w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                          <tr>
                            <th className="py-3 pr-4">Template</th>
                            <th className="py-3 pr-4">Category</th>
                            <th className="py-3 pr-4">Vector</th>
                            <th className="py-3 pr-4">Difficulty</th>
                            <th className="py-3 pr-4">Last Updated</th>
                            <th className="py-3 pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {templates.map((template) => (
                            <tr key={template.id}>
                              <td className="py-3 pr-4 text-white">{template.name}</td>
                              <td className="py-3 pr-4 text-gray-400">{template.category}</td>
                              <td className="py-3 pr-4 text-gray-400">{template.vector}</td>
                              <td className="py-3 pr-4 text-gray-400">{template.difficulty}</td>
                              <td className="py-3 pr-4 text-gray-400">{template.updated}</td>
                              <td className="py-3 pr-4">
                                <div className="flex gap-2">
                                  <Button variant="ghost" onClick={() => setSelectedTemplateId(template.id)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                  </Button>
                                  <Button variant="ghost" onClick={() => setSelectedTemplateId(template.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">AI Template Studio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="card__meta">Generate sophisticated templates using Gemini, then edit and preview before saving.</p>
                      <Input
                        value={aiForm.scenario}
                        onChange={(e) => setAiForm((prev) => ({ ...prev, scenario: e.target.value }))}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="Scenario"
                      />
                      <Input
                        value={aiForm.brand}
                        onChange={(e) => setAiForm((prev) => ({ ...prev, brand: e.target.value }))}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="Brand style"
                      />
                      <Input
                        value={aiForm.tone}
                        onChange={(e) => setAiForm((prev) => ({ ...prev, tone: e.target.value }))}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="Tone"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="select"
                          value={aiForm.difficulty}
                          onChange={(e) => setAiForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                        <select
                          className="select"
                          value={aiForm.vector}
                          onChange={(e) => setAiForm((prev) => ({ ...prev, vector: e.target.value }))}
                        >
                          <option>Email</option>
                          <option>Email + SMS</option>
                        </select>
                      </div>
                      {aiError && <div className="text-xs text-red-400">{aiError}</div>}
                      <Button className="bg-red-600 hover:bg-red-700" onClick={handleGenerateTemplate} disabled={aiLoading}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {aiLoading ? 'Generating...' : 'Generate Template'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Template Editor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {templateDraft ? (
                        <>
                          <Input
                            value={templateDraft.name || ''}
                            onChange={(e) => setTemplateDraft((prev) => ({ ...prev, name: e.target.value }))}
                            className="bg-gray-900 border-gray-700 text-white"
                            placeholder="Template name"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={templateDraft.fromName || ''}
                              onChange={(e) => setTemplateDraft((prev) => ({ ...prev, fromName: e.target.value }))}
                              className="bg-gray-900 border-gray-700 text-white"
                              placeholder="From name"
                            />
                            <Input
                              value={templateDraft.fromEmail || ''}
                              onChange={(e) => setTemplateDraft((prev) => ({ ...prev, fromEmail: e.target.value }))}
                              className="bg-gray-900 border-gray-700 text-white"
                              placeholder="From email"
                            />
                          </div>
                          <Input
                            value={templateDraft.subject || ''}
                            onChange={(e) => setTemplateDraft((prev) => ({ ...prev, subject: e.target.value }))}
                            className="bg-gray-900 border-gray-700 text-white"
                            placeholder="Subject line"
                          />
                          <Input
                            value={templateDraft.landingPage || ''}
                            onChange={(e) => setTemplateDraft((prev) => ({ ...prev, landingPage: e.target.value }))}
                            className="bg-gray-900 border-gray-700 text-white"
                            placeholder="Landing page label"
                          />
                          <textarea
                            value={templateDraft.htmlBody || ''}
                            onChange={(e) => setTemplateDraft((prev) => ({ ...prev, htmlBody: e.target.value }))}
                            className="w-full min-h-[200px] bg-gray-900 border border-gray-700 text-white rounded-lg p-3 text-sm"
                            placeholder="Template HTML"
                          />
                          <div className="flex items-center gap-3">
                            <Button className="bg-red-600 hover:bg-red-700" onClick={handleTemplateSave}>
                              Save Template
                            </Button>
                            {saveState && <span className="text-xs text-gray-400">{saveState}</span>}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">Select a template to edit and preview.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Live Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {templateDraft ? (
                        <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-4 text-sm text-gray-200" dangerouslySetInnerHTML={{ __html: templateDraft.htmlBody || '<p>No preview available.</p>' }} />
                      ) : (
                        <p className="text-sm text-gray-500">Preview updates as you edit a template.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="programs">
              <div className="grid lg:grid-cols-2 gap-6 mt-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Learning Paths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {learningPaths.map((path) => (
                        <div key={path.id} className="p-4 bg-gray-900/60 rounded-lg border border-gray-700">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-white font-semibold">{path.title}</h4>
                              <p className="text-xs text-gray-500">{path.duration} • {path.audience}</p>
                            </div>
                            <Badge className="bg-blue-500/10 text-blue-300 border border-blue-500/30">
                              {path.completion}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Policy Attestations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="card__meta">
                      Track policy acknowledgements for MFA, acceptable use, and data handling.
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-emerald-400" />
                      <div>
                        <div className="text-white font-semibold">MFA Enforcement Policy</div>
                        <div className="text-xs text-gray-500">92% acknowledged</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-6 w-6 text-blue-400" />
                      <div>
                        <div className="text-white font-semibold">Acceptable Use Policy</div>
                        <div className="text-xs text-gray-500">88% acknowledged</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-yellow-400" />
                      <div>
                        <div className="text-white font-semibold">Incident Reporting Policy</div>
                        <div className="text-xs text-gray-500">81% acknowledged</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="directory">
              <div className="grid lg:grid-cols-3 gap-6 mt-6">
                <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white">Active Directory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users or emails"
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="table w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                          <tr>
                            <th className="py-3 pr-4">User</th>
                            <th className="py-3 pr-4">Role</th>
                            <th className="py-3 pr-4">Org</th>
                            <th className="py-3 pr-4">Group</th>
                            <th className="py-3 pr-4">Training Status</th>
                            <th className="py-3 pr-4">Risk Score</th>
                            <th className="py-3 pr-4">Phish Fail</th>
                            <th className="py-3 pr-4">Last Phish Event</th>
                            <th className="py-3 pr-4">Last IP</th>
                            <th className="py-3 pr-4">Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {directoryRows.map((row) => (
                            <tr key={row.id}>
                              <td className="py-3 pr-4 text-white">{row.name}</td>
                              <td className="py-3 pr-4 text-gray-400">{row.role}</td>
                              <td className="py-3 pr-4 text-gray-400">{row.org}</td>
                              <td className="py-3 pr-4 text-gray-400">{row.group}</td>
                              <td className="py-3 pr-4 text-gray-400">{row.status}</td>
                              <td className="py-3 pr-4 text-gray-400">{row.riskScore}</td>
                              <td className="py-3 pr-4 text-gray-400">{row.phishFail}</td>
                              <td className="py-3 pr-4 text-gray-400">{row.lastPhish}</td>
                              <td className="py-3 pr-4 text-gray-400">{row.lastIp}</td>
                              <td className="py-3 pr-4 text-gray-400">{row.location}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {directoryRows.length === 0 && (
                        <p className="text-sm text-gray-500 mt-4">No users match the current search.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Add User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Full name"
                        value={manualUser.name}
                        onChange={(e) => setManualUser((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                      <Input
                        placeholder="Email"
                        value={manualUser.email}
                        onChange={(e) => setManualUser((prev) => ({ ...prev, email: e.target.value }))}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                      <select
                        className="select"
                        value={manualUser.role}
                        onChange={(e) => setManualUser((prev) => ({ ...prev, role: e.target.value }))}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <select
                        className="select"
                        value={manualUser.orgId}
                        onChange={(e) => setManualUser((prev) => ({ ...prev, orgId: e.target.value }))}
                      >
                        {orgs.map((orgItem) => (
                          <option key={orgItem.id} value={orgItem.id}>{orgItem.name}</option>
                        ))}
                      </select>
                      <select
                        className="select"
                        value={manualUser.groupId}
                        onChange={(e) => setManualUser((prev) => ({ ...prev, groupId: e.target.value }))}
                      >
                        <option value="">Group (optional)</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                      </select>
                      <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddUser}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Bulk Upload</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="card__meta">Upload CSV with headers: email,name,role,org,group</p>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleCsvUpload(e.target.files?.[0])}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                      {importStatus && <div className="text-xs text-gray-400">{importStatus}</div>}
                      <Button variant="outline" onClick={handleDownloadTemplate}>
                        <Upload className="mr-2 h-4 w-4" />
                        Download CSV Template
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Company Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="table w-full text-sm text-left text-gray-300">
                          <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                            <tr>
                              <th className="py-3 pr-4">Company</th>
                              <th className="py-3 pr-4">Plan</th>
                              <th className="py-3 pr-4">Users</th>
                              <th className="py-3 pr-4">Completion</th>
                              <th className="py-3 pr-4">Risk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {orgDirectory.map((orgRow) => (
                              <tr key={orgRow.id}>
                                <td className="py-3 pr-4 text-white">{orgRow.name}</td>
                                <td className="py-3 pr-4 text-gray-400">{orgRow.plan}</td>
                                <td className="py-3 pr-4 text-gray-400">{orgRow.users}</td>
                                <td className="py-3 pr-4 text-gray-400">{orgRow.completionRate}</td>
                                <td className="py-3 pr-4 text-gray-400">{orgRow.riskScore}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </AuthGate>
      </div>
    </div>
  );
}
