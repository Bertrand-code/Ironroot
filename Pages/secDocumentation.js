import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Users, Key, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityDocumentation() {
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="h-8 w-8 text-red-500" />
            Security Configuration Documentation
          </h1>
          <p className="text-gray-400 mt-2">Best practices for admin and user security management</p>
        </div>

        <div className="space-y-6">
          {/* Admin Security */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Admin Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Admin Security Rules
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✅ <strong>Row-Level Security (RLS):</strong> All entities have admin-only access for sensitive operations</li>
                  <li>✅ <strong>Role-Based Access Control:</strong> Only users with <code className="bg-gray-900 px-2 py-1 rounded text-red-400">role === 'admin'</code> can access admin features</li>
                  <li>✅ <strong>Email Verification:</strong> All users must verify their email before accessing the platform</li>
                  <li>✅ <strong>Session Management:</strong> Secure JWT tokens with automatic expiration</li>
                  <li>✅ <strong>API Key Rotation:</strong> Rotate API keys every 90 days for security compliance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-3">Admin Permissions & Capabilities</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
                    <h4 className="font-semibold text-green-400 mb-2">Admin Can:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• View all users, trial requests, and scan history</li>
                      <li>• Invite new users (admin or regular users)</li>
                      <li>• Approve/reject trial requests</li>
                      <li>• Update user roles (user ↔ admin)</li>
                      <li>• Access all security dashboards</li>
                      <li>• Generate reports for any user's scans</li>
                      <li>• View activity logs and audit trails</li>
                      <li>• Manage API access requests</li>
                    </ul>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <Lock className="h-5 w-5 text-red-500 mb-2" />
                    <h4 className="font-semibold text-red-400 mb-2">Admin Cannot:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• Directly modify built-in User attributes (id, email, full_name, role) via code</li>
                      <li>• Bypass Row-Level Security (RLS) rules</li>
                      <li>• Delete system activity logs</li>
                      <li>• Access users' passwords (hashed & secure)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">Code Example: Admin Check</h3>
                <pre className="bg-gray-900 p-3 rounded text-sm text-gray-300 overflow-x-auto">
{`// Protecting admin-only pages
useEffect(() => {
  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin') {
        window.location.href = '/'; // Redirect non-admins
      }
      setUser(currentUser);
    } catch {
      window.location.href = '/'; // Redirect unauthenticated users
    }
  };
  checkAuth();
}, []);`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* User Security */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                User Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-white mb-3">Regular User Permissions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
                    <h4 className="font-semibold text-green-400 mb-2">Users Can:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• Access code scanning features (trial/paid)</li>
                      <li>• View their own scan history</li>
                      <li>• Schedule automated scans</li>
                      <li>• Generate reports for their scans</li>
                      <li>• Request API access</li>
                      <li>• Update their own profile information</li>
                      <li>• Receive notifications for scan results</li>
                    </ul>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <Lock className="h-5 w-5 text-red-500 mb-2" />
                    <h4 className="font-semibold text-red-400 mb-2">Users Cannot:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• View other users' scan history</li>
                      <li>• Access admin dashboard</li>
                      <li>• Invite new users to the platform</li>
                      <li>• Modify other users' data</li>
                      <li>• View system activity logs</li>
                      <li>• Bypass trial/payment restrictions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="font-bold text-yellow-400 mb-2">Trial Access Control</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Users with active trials have limited-time access to scan features. The system automatically checks trial status before allowing scans.
                </p>
                <pre className="bg-gray-900 p-3 rounded text-sm text-gray-300 overflow-x-auto">
{`// Check user access before scanning
const trials = await base44.entities.TrialRequest.filter({ 
  email: user.email,
  status: 'trial_active'
});

if (trials.length > 0) {
  const trial = trials[0];
  const now = new Date();
  const endDate = new Date(trial.trialEndDate);
  
  if (now <= endDate) {
    setHasAccess(true); // Allow access
  } else {
    setAccessStatus({ type: 'expired', message: 'Trial expired' });
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* RLS Rules */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-500" />
                Row-Level Security (RLS) Implementation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                All entities in SecPro enforce Row-Level Security to ensure data isolation and access control.
              </p>

              <div className="space-y-3">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">ScanHistory Entity RLS</h4>
                  <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
{`"security": {
  "create": "auth.role == 'user' || auth.role == 'admin'",
  "read": "record.scannedBy == auth.email || auth.role == 'admin'",
  "update": "auth.role == 'admin'",
  "delete": "auth.role == 'admin'"
}`}
                  </pre>
                  <p className="text-sm text-gray-400 mt-2">
                    Users can only read their own scan history. Admins can read, update, and delete all records.
                  </p>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">TrialRequest Entity RLS</h4>
                  <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
{`"security": {
  "create": "auth.role == 'user' || auth.role == 'admin'",
  "read": "record.email == auth.email || auth.role == 'admin'",
  "update": "auth.role == 'admin'",
  "delete": "auth.role == 'admin'"
}`}
                  </pre>
                  <p className="text-sm text-gray-400 mt-2">
                    Users can view their own trial requests. Only admins can approve/update trials.
                  </p>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Notification Entity RLS</h4>
                  <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
{`"security": {
  "create": "auth.role == 'user' || auth.role == 'admin'",
  "read": "record.userEmail == auth.email || auth.role == 'admin'",
  "update": "record.userEmail == auth.email || auth.role == 'admin'",
  "delete": "auth.role == 'admin'"
}`}
                  </pre>
                  <p className="text-sm text-gray-400 mt-2">
                    Users can read and mark their own notifications as read. Admins have full access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Security */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-500" />
                API Key & Secret Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <h3 className="font-bold text-purple-400 mb-2">Best Practices</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>🔐 <strong>Never hardcode API keys</strong> in source code - use environment variables</li>
                  <li>🔄 <strong>Rotate keys regularly</strong> - recommended every 90 days</li>
                  <li>🔒 <strong>Store secrets securely</strong> - use secrets management systems</li>
                  <li>📊 <strong>Monitor API usage</strong> - track and audit all API calls</li>
                  <li>🚫 <strong>Revoke compromised keys immediately</strong> - generate new ones if exposed</li>
                  <li>✅ <strong>Use read-only tokens</strong> where possible for limited operations</li>
                </ul>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Environment Variable Setup</h4>
                <pre className="bg-gray-900 p-3 rounded text-sm text-gray-300 overflow-x-auto">
{`# .env file (NEVER commit this to version control)
SECPRO_API_KEY=your_api_key_here
SECPRO_SECRET_KEY=your_secret_key_here

# In CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins)
# Store as encrypted secrets/environment variables`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Compliance & Auditing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">✅ Compliant Features</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• OWASP Top 10 compliance</li>
                    <li>• GDPR data protection (user data isolation)</li>
                    <li>• SOC 2 audit trail (activity logs)</li>
                    <li>• PCI DSS data encryption</li>
                    <li>• HIPAA-compliant access controls</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">📊 Activity Logging</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• All admin actions are logged</li>
                    <li>• Trial approvals tracked</li>
                    <li>• User invitations recorded</li>
                    <li>• Scan activities timestamped</li>
                    <li>• Login attempts monitored</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}