import React, { useState, useEffect } from 'react';
import { ironroot } from '@/lib/ironrootClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Trash2 } from 'lucide-react';
const formatDateTime = (value) => {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function ScanScheduler() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    targetUrl: '',
    scanType: 'github_repository',
    frequency: 'once',
    scheduledDate: '',
    notifications: true
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await ironroot.auth.me();
        setUser(currentUser);
      } catch (err) {
        console.error('Failed to get user:', err);
      }
    };
    getUser();
  }, []);

  const { data: scheduledScans = [] } = useQuery({
    queryKey: ['scheduledScans', user?.email],
    queryFn: () => ironroot.entities.ScheduledScan.filter({ userEmail: user.email }, '-created_date'),
    enabled: !!user,
  });

  const createScanMutation = useMutation({
    mutationFn: (data) => ironroot.entities.ScheduledScan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledScans'] });
      setFormData({
        targetUrl: '',
        scanType: 'github_repository',
        frequency: 'once',
        scheduledDate: '',
        notifications: true
      });
    },
  });

  const deleteScanMutation = useMutation({
    mutationFn: (id) => ironroot.entities.ScheduledScan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledScans'] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    await createScanMutation.mutateAsync({
      userEmail: user.email,
      ...formData,
      nextRun: formData.scheduledDate,
      status: 'active'
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule New Scan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Target URL</label>
              <Input
                placeholder="https://github.com/user/repo or https://example.com"
                value={formData.targetUrl}
                onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Scan Type</label>
                <Select 
                  value={formData.scanType} 
                  onValueChange={(value) => setFormData({ ...formData, scanType: value })}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github_repository">GitHub Repository</SelectItem>
                    <SelectItem value="website_infrastructure">Website Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Frequency</label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Schedule Date & Time</label>
              <Input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
              Schedule Scan
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Scheduled Scans</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledScans.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No scheduled scans yet</p>
          ) : (
            <div className="space-y-3">
              {scheduledScans.map((scan) => (
                <div key={scan.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{scan.targetUrl}</h4>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>Type: {scan.scanType}</span>
                      <span>Frequency: {scan.frequency}</span>
                      <span className={`font-medium ${
                        scan.status === 'active' ? 'text-green-500' :
                        scan.status === 'paused' ? 'text-yellow-500' :
                        scan.status === 'failed' ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {scan.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      Next run: {formatDateTime(scan.nextRun)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteScanMutation.mutate(scan.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
