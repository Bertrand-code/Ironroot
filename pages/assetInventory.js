import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, Globe, Server, Link2 } from 'lucide-react';
import AuthGate from '@/components/AuthGate';
import { ironroot } from '@/lib/ironrootClient';
import { useAuth } from '@/lib/useAuth';

const assetTypes = [
  { value: 'domain', label: 'Domain', icon: Globe },
  { value: 'api', label: 'API', icon: Link2 },
  { value: 'ip', label: 'IP Address', icon: Server },
  { value: 'repo', label: 'Repository', icon: Shield },
  { value: 'saas', label: 'SaaS', icon: Shield },
];

const criticalityColors = {
  critical: 'bg-red-500/20 text-red-300',
  high: 'bg-orange-500/20 text-orange-300',
  medium: 'bg-yellow-500/20 text-yellow-300',
  low: 'bg-green-500/20 text-green-300',
};

export default function AssetInventory() {
  const { user, org } = useAuth();
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ type: 'all', exposure: 'all' });
  const [form, setForm] = useState({
    name: '',
    type: 'domain',
    environment: 'production',
    criticality: 'high',
    exposure: 'public',
    tags: '',
  });
  const [dataSources, setDataSources] = useState([]);

  const loadAssets = async () => {
    try {
      const data = await ironroot.entities.Asset.list('-lastSeen');
      setAssets(data);
    } catch (err) {
      setAssets([]);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    const loadSources = async () => {
      const sources = await ironroot.integrations.External.status();
      setDataSources(sources);
    };
    loadSources();
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = searchQuery
        ? asset.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesType = filters.type === 'all' ? true : asset.type === filters.type;
      const matchesExposure = filters.exposure === 'all' ? true : asset.exposure === filters.exposure;
      return matchesSearch && matchesType && matchesExposure;
    });
  }, [assets, searchQuery, filters]);

  const stats = useMemo(() => {
    const total = assets.length;
    const critical = assets.filter((asset) => asset.criticality === 'critical').length;
    const publicExposure = assets.filter((asset) => asset.exposure === 'public').length;
    const prod = assets.filter((asset) => asset.environment === 'production').length;
    return { total, critical, publicExposure, prod };
  }, [assets]);

  const addAsset = async () => {
    if (!form.name.trim()) return;
    await ironroot.entities.Asset.create({
      name: form.name.trim(),
      type: form.type,
      environment: form.environment,
      criticality: form.criticality,
      exposure: form.exposure,
      lastSeen: new Date().toISOString(),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      orgId: org?.id || null,
    });
    setForm({ ...form, name: '', tags: '' });
    loadAssets();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <AuthGate
          title="Sign in to access Asset Inventory"
          description="Attack surface monitoring and asset intelligence are available to paid organizations."
          plans={['paid']}
          feature="attackSurfaceMonitoring"
        >
          <div className="admin-hero" style={{ marginBottom: '28px' }}>
            <div>
              <span className="eyebrow">Attack Surface</span>
              <h1 className="title-lg">Asset Inventory</h1>
              <p className="text-lead">Unified visibility across domains, APIs, repos, and cloud infrastructure.</p>
              <div className="admin-hero__actions">
                <Button variant="outline" onClick={() => (window.location.href = '/riskRegister')}>Risk Register</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/threatIntelligence')}>Threat Intel</Button>
                <Button variant="outline" onClick={() => (window.location.href = '/adminDashboard')}>Admin Dashboard</Button>
              </div>
            </div>
            <div className="admin-hero__stats">
              {[
                { label: 'Total Assets', value: stats.total, meta: 'Tracked items' },
                { label: 'Critical Assets', value: stats.critical, meta: 'High impact' },
                { label: 'Public Exposure', value: stats.publicExposure, meta: 'Internet facing' },
                { label: 'Production Assets', value: stats.prod, meta: 'Live systems' },
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
                <CardTitle className="text-white">Asset Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search assets"
                      className="pl-10 bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <select
                    className="select"
                    value={filters.type}
                    onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="all">All types</option>
                    {assetTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <select
                    className="select"
                    value={filters.exposure}
                    onChange={(e) => setFilters((prev) => ({ ...prev, exposure: e.target.value }))}
                  >
                    <option value="all">All exposure</option>
                    <option value="public">Public</option>
                    <option value="internal">Internal</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                      <tr>
                        <th className="py-3 pr-4">Asset</th>
                        <th className="py-3 pr-4">Type</th>
                        <th className="py-3 pr-4">Environment</th>
                        <th className="py-3 pr-4">Exposure</th>
                        <th className="py-3 pr-4">Criticality</th>
                        <th className="py-3 pr-4">Tags</th>
                        <th className="py-3 pr-4">Last Seen</th>
                        <th className="py-3 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredAssets.map((asset) => {
                        const typeLabel =
                          assetTypes.find((type) => type.value === asset.type)?.label || asset.type || 'Unknown';
                        const statusLabel = asset.status || 'active';
                        return (
                          <tr key={asset.id}>
                            <td className="py-3 pr-4">
                              <div className="text-white font-semibold">{asset.name}</div>
                              <div className="text-xs text-gray-500">ID: {asset.id}</div>
                            </td>
                            <td className="py-3 pr-4 text-gray-400">{typeLabel}</td>
                            <td className="py-3 pr-4 text-gray-400">{asset.environment || '—'}</td>
                            <td className="py-3 pr-4 text-gray-400">{asset.exposure || '—'}</td>
                            <td className="py-3 pr-4">
                              <Badge className={criticalityColors[asset.criticality] || 'bg-gray-700 text-gray-200'}>
                                {asset.criticality || 'medium'}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">
                              {asset.tags?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {asset.tags.map((tag) => (
                                    <Badge key={tag} className="bg-gray-700 text-gray-200">{tag}</Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-gray-400">
                              {asset.lastSeen ? new Date(asset.lastSeen).toLocaleString() : '—'}
                            </td>
                            <td className="py-3 pr-4">
                              <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                {statusLabel}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredAssets.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-sm text-gray-500 py-6">
                            No assets match your filters yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Register New Asset</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Asset name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <select
                    className="select"
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    {assetTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <select
                    className="select"
                    value={form.environment}
                    onChange={(e) => setForm((prev) => ({ ...prev, environment: e.target.value }))}
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                  <select
                    className="select"
                    value={form.criticality}
                    onChange={(e) => setForm((prev) => ({ ...prev, criticality: e.target.value }))}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    className="select"
                    value={form.exposure}
                    onChange={(e) => setForm((prev) => ({ ...prev, exposure: e.target.value }))}
                  >
                    <option value="public">Public</option>
                    <option value="internal">Internal</option>
                    <option value="restricted">Restricted</option>
                  </select>
                  <Input
                    placeholder="Tags (comma separated)"
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <Button onClick={addAsset} className="bg-red-600 hover:bg-red-700">
                    Add Asset
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Live Data Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dataSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between text-sm text-gray-300">
                      <span>{source.label}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        source.enabled ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {source.enabled ? (source.mode === 'demo' ? 'Demo' : 'Connected') : 'Not Configured'}
                      </span>
                    </div>
                  ))}
                  {dataSources.length === 0 && (
                    <p className="text-xs text-gray-500">Connect external APIs to enrich asset discovery.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </AuthGate>
      </div>
    </div>
  );
}
