const STORE_VERSION = 5;
const STORE_KEY = 'ironroot:store:v5';
const SESSION_KEY = 'ironroot:session';
const LOGIN_ATTEMPTS_KEY = 'ironroot:loginAttempts';
const SESSION_TTL_MS = 1000 * 60 * 45; // 45 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 1000 * 60 * 10; // 10 minutes
const PRIVILEGED_ROLES = ['owner', 'admin'];
const INVITE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const defaultFeatures = {
  advancedPentest: true,
  threatIntelLive: true,
  codeScannerPro: true,
  reportExports: true,
  attackSurfaceMonitoring: true,
  riskRegister: true,
  complianceAutomation: true,
  documentVault: true,
  forensicWatermarking: false,
  securityTraining: true,
  socPlaybooks: true,
  evidenceVault: true,
  policyAttestations: true,
};

const trialFeatures = {
  advancedPentest: false,
  threatIntelLive: false,
  codeScannerPro: true,
  reportExports: false,
  attackSurfaceMonitoring: false,
  riskRegister: false,
  complianceAutomation: false,
  documentVault: true,
  forensicWatermarking: false,
  securityTraining: false,
  socPlaybooks: false,
  evidenceVault: false,
  policyAttestations: false,
};

const defaultSecurity = {
  sessionTimeoutMins: 45,
  aiRequestsPerMin: 30,
  screenWatermarkingEnabled: true,
  captureSignalsEnabled: true,
  secureViewMode: false,
};

const memoryStore = { data: {}, user: null };

const seedData = {
  meta: { version: STORE_VERSION },
  Organization: [
    {
      id: 'org_001',
      name: 'Ironroot Labs',
      slug: 'ironroot',
      industry: 'Security',
      size: '1-50',
      plan: 'paid',
      ownerEmail: 'owner@ironroot.local',
      features: { ...defaultFeatures },
      security: { ...defaultSecurity },
      created_date: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      id: 'org_002',
      name: 'Northwind Capital',
      slug: 'northwind',
      industry: 'Financial Services',
      size: '201-1000',
      plan: 'trial',
      ownerEmail: 'security@northwind.com',
      features: { ...trialFeatures },
      security: { ...defaultSecurity, sessionTimeoutMins: 30 },
      created_date: new Date(Date.now() - 120 * 86400000).toISOString(),
    },
  ],
  Group: [
    {
      id: 'group_001',
      name: 'Executive',
      description: 'Board-ready reporting and enterprise visibility',
      orgId: 'org_001',
      created_date: new Date(Date.now() - 40 * 86400000).toISOString(),
    },
    {
      id: 'group_002',
      name: 'Security Operations',
      description: 'SOC workflows, incident response, and detection engineering',
      orgId: 'org_001',
      created_date: new Date(Date.now() - 32 * 86400000).toISOString(),
    },
    {
      id: 'group_003',
      name: 'Engineering',
      description: 'Application security, secure SDLC, and remediation',
      orgId: 'org_001',
      created_date: new Date(Date.now() - 28 * 86400000).toISOString(),
    },
  ],
  TrainingTemplate: [
    {
      id: 'tmpl_1001',
      name: 'SSO Password Reset',
      category: 'Credential Harvest',
      difficulty: 'High',
      vector: 'Email',
      updated: '2026-02-01',
      subject: 'Action required: reset your SSO password',
      fromName: 'IT Service Desk',
      fromEmail: 'servicedesk@ironroot.ai',
      landingPage: 'SSO Reset Portal',
      htmlBody: `<h2>Security Notice</h2>
<p>We detected an issue with your SSO account. Please reset your password within 24 hours to avoid access disruption.</p>
<p><strong>Action required:</strong> Click the button below to complete your reset.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;">Reset SSO Password</a>
<p style="margin-top:16px;color:#9ca3af;">If you did not request this, contact the service desk immediately.</p>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1002',
      name: 'Expense Report Review',
      category: 'Attachment',
      difficulty: 'Medium',
      vector: 'Email',
      updated: '2026-01-18',
      subject: 'Expense report requires your approval',
      fromName: 'Finance Operations',
      fromEmail: 'finance@ironroot.ai',
      landingPage: 'Expense Review Portal',
      htmlBody: `<h2>Expense Review Required</h2>
<p>Your approval is needed for an expense report submitted this morning.</p>
<p>Please review the report summary and confirm within 48 hours.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Review Report</a>
<p style="margin-top:16px;color:#9ca3af;">If this wasn’t intended for you, notify Finance Ops.</p>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1003',
      name: 'Security Policy Update',
      category: 'Awareness',
      difficulty: 'Low',
      vector: 'Email',
      updated: '2026-01-24',
      subject: 'Security policy update and acknowledgment required',
      fromName: 'Security Awareness',
      fromEmail: 'security@ironroot.ai',
      landingPage: 'Policy Acknowledgment',
      htmlBody: `<h2>Security Policy Update</h2>
<p>We updated our acceptable use and data handling policies. Please acknowledge by end of week.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;">Review Policy</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 18 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1004',
      name: 'MFA Re-Enrollment',
      category: 'Credential Harvest',
      difficulty: 'High',
      vector: 'Email + SMS',
      updated: '2026-01-30',
      subject: 'Action required: re-enroll MFA device',
      fromName: 'Identity Security',
      fromEmail: 'identity@ironroot.ai',
      landingPage: 'MFA Enrollment Portal',
      htmlBody: `<h2>MFA Re-Enrollment</h2>
<p>Your MFA device needs re-enrollment due to a security upgrade.</p>
<p>Click below to complete the process.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;">Enroll MFA</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 16 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1005',
      name: 'Shared Drive Access',
      category: 'Link Click',
      difficulty: 'Medium',
      vector: 'Email',
      updated: '2026-02-02',
      subject: 'You were granted access to a shared drive',
      fromName: 'Collaboration Services',
      fromEmail: 'collab@ironroot.ai',
      landingPage: 'Shared Drive',
      htmlBody: `<h2>Shared Drive Access</h2>
<p>You have been granted access to the Q1 Strategic Plan drive.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;">Open Drive</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1006',
      name: 'Cloud Storage Access Request',
      category: 'Link Click',
      difficulty: 'Medium',
      vector: 'Email',
      updated: '2026-02-03',
      subject: 'Shared folder access request pending',
      fromName: 'Cloud Storage',
      fromEmail: 'share@ironroot.ai',
      landingPage: 'Shared Folder Request',
      htmlBody: `<h2>Shared Folder Access</h2>
<p>A partner requested access to your shared folder.</p>
<p>Review and approve access if this is expected.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;">Review Request</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 11 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1007',
      name: 'Payroll Update Required',
      category: 'Credential Harvest',
      difficulty: 'High',
      vector: 'Email',
      updated: '2026-02-03',
      subject: 'Payroll system requires verification',
      fromName: 'Payroll Operations',
      fromEmail: 'payroll@ironroot.ai',
      landingPage: 'Payroll Verification',
      htmlBody: `<h2>Payroll Verification</h2>
<p>We detected a change request on your payroll profile.</p>
<p>Please verify your details to avoid payment delays.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;">Verify Payroll</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1008',
      name: 'Device Compliance Check',
      category: 'Awareness',
      difficulty: 'Low',
      vector: 'Email',
      updated: '2026-02-04',
      subject: 'Device compliance scan required',
      fromName: 'Endpoint Security',
      fromEmail: 'endpoint@ironroot.ai',
      landingPage: 'Compliance Scan',
      htmlBody: `<h2>Device Compliance Check</h2>
<p>Your device needs a quick compliance scan to remain protected.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#22c55e;color:#fff;text-decoration:none;border-radius:8px;">Start Scan</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1009',
      name: 'Unusual Login Alert',
      category: 'Credential Harvest',
      difficulty: 'High',
      vector: 'Email',
      updated: '2026-02-04',
      subject: 'Unusual login detected on your account',
      fromName: 'Security Alerts',
      fromEmail: 'alerts@ironroot.ai',
      landingPage: 'Account Verification',
      htmlBody: `<h2>Unusual Login Detected</h2>
<p>We detected a login attempt from a new location.</p>
<p>Please verify your account activity immediately.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;">Verify Account</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1010',
      name: 'Vendor Contract Review',
      category: 'Attachment',
      difficulty: 'Medium',
      vector: 'Email',
      updated: '2026-02-05',
      subject: 'Vendor contract requires review',
      fromName: 'Legal Operations',
      fromEmail: 'legal@ironroot.ai',
      landingPage: 'Contract Review',
      htmlBody: `<h2>Contract Review Request</h2>
<p>The updated vendor contract is ready for your review.</p>
<p>Please confirm the changes by end of week.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Review Contract</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1011',
      name: 'Travel Reimbursement',
      category: 'Attachment',
      difficulty: 'Medium',
      vector: 'Email',
      updated: '2026-02-05',
      subject: 'Travel reimbursement pending approval',
      fromName: 'Travel Desk',
      fromEmail: 'travel@ironroot.ai',
      landingPage: 'Reimbursement Portal',
      htmlBody: `<h2>Travel Reimbursement</h2>
<p>Your reimbursement request is ready for approval.</p>
<p>Please review the itemized report.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Review Request</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1012',
      name: 'HR Benefits Update',
      category: 'Awareness',
      difficulty: 'Low',
      vector: 'Email',
      updated: '2026-02-05',
      subject: 'Benefits enrollment changes available',
      fromName: 'HR Benefits',
      fromEmail: 'benefits@ironroot.ai',
      landingPage: 'Benefits Portal',
      htmlBody: `<h2>Benefits Update</h2>
<p>New benefit options are available for review.</p>
<p>Please confirm your selections.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;">Review Benefits</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1013',
      name: 'Critical Patch Required',
      category: 'Awareness',
      difficulty: 'Low',
      vector: 'Email',
      updated: '2026-02-06',
      subject: 'Critical patch required for device compliance',
      fromName: 'IT Operations',
      fromEmail: 'itops@ironroot.ai',
      landingPage: 'Patch Management',
      htmlBody: `<h2>Critical Patch Required</h2>
<p>Install the latest security patch to remain compliant.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#22c55e;color:#fff;text-decoration:none;border-radius:8px;">Install Patch</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1014',
      name: 'Okta Session Expired',
      category: 'Credential Harvest',
      difficulty: 'High',
      vector: 'Email',
      updated: '2026-02-06',
      subject: 'Session expired: sign in to continue',
      fromName: 'Identity Platform',
      fromEmail: 'no-reply@ironroot.ai',
      landingPage: 'SSO Sign-In',
      htmlBody: `<h2>Session Expired</h2>
<p>Your session has expired due to inactivity.</p>
<p>Sign in to continue working securely.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;">Sign In</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1015',
      name: 'Zoom Recording Shared',
      category: 'Link Click',
      difficulty: 'Medium',
      vector: 'Email',
      updated: '2026-02-06',
      subject: 'Meeting recording shared with you',
      fromName: 'Video Collaboration',
      fromEmail: 'video@ironroot.ai',
      landingPage: 'Recording Viewer',
      htmlBody: `<h2>Meeting Recording</h2>
<p>A recording from today’s meeting is ready.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;">View Recording</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1016',
      name: 'GitHub Security Advisory',
      category: 'Awareness',
      difficulty: 'Low',
      vector: 'Email',
      updated: '2026-02-07',
      subject: 'Security advisory requires review',
      fromName: 'Developer Security',
      fromEmail: 'devsec@ironroot.ai',
      landingPage: 'Advisory Review',
      htmlBody: `<h2>Security Advisory</h2>
<p>A new advisory affects one of your repositories.</p>
<p>Please review mitigation guidance.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;">Review Advisory</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1017',
      name: 'Expense Policy Reminder',
      category: 'Awareness',
      difficulty: 'Low',
      vector: 'Email',
      updated: '2026-02-07',
      subject: 'Expense policy reminder',
      fromName: 'Finance Compliance',
      fromEmail: 'compliance@ironroot.ai',
      landingPage: 'Expense Policy',
      htmlBody: `<h2>Expense Policy Reminder</h2>
<p>Please review the updated expense policy guidelines.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;">Review Policy</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1018',
      name: 'W-2 Access Notice',
      category: 'Credential Harvest',
      difficulty: 'High',
      vector: 'Email',
      updated: '2026-02-07',
      subject: 'Your W-2 is now available',
      fromName: 'HR Payroll',
      fromEmail: 'hr@ironroot.ai',
      landingPage: 'W-2 Portal',
      htmlBody: `<h2>W-2 Available</h2>
<p>Your annual W-2 form is ready for download.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;">Access W-2</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1019',
      name: 'SaaS Billing Change',
      category: 'Attachment',
      difficulty: 'Medium',
      vector: 'Email',
      updated: '2026-02-08',
      subject: 'Billing update requires confirmation',
      fromName: 'Billing Operations',
      fromEmail: 'billing@ironroot.ai',
      landingPage: 'Billing Portal',
      htmlBody: `<h2>Billing Update</h2>
<p>Your subscription billing information needs confirmation.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Confirm Billing</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'tmpl_1020',
      name: 'VPN Certificate Renewal',
      category: 'Awareness',
      difficulty: 'Low',
      vector: 'Email',
      updated: '2026-02-08',
      subject: 'VPN certificate renewal required',
      fromName: 'Network Access',
      fromEmail: 'network@ironroot.ai',
      landingPage: 'VPN Renewal',
      htmlBody: `<h2>VPN Certificate Renewal</h2>
<p>Your VPN certificate expires soon. Please renew to retain access.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#22c55e;color:#fff;text-decoration:none;border-radius:8px;">Renew Certificate</a>`,
      orgId: 'org_001',
      created_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
  TrainingCampaign: [
    {
      id: 'camp_1001',
      name: 'Q1 Credential Resilience',
      templateId: 'tmpl_1001',
      targetGroupId: 'group_003',
      status: 'Active',
      launchDate: '2026-02-01',
      startAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      endAt: new Date(Date.now() + 12 * 86400000).toISOString(),
      ownerEmail: 'owner@ironroot.local',
      orgId: 'org_001',
      created_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'camp_1002',
      name: 'Finance Invoice Drill',
      templateId: 'tmpl_1002',
      targetGroupId: 'group_002',
      status: 'Scheduled',
      launchDate: '2026-02-12',
      startAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      endAt: new Date(Date.now() + 18 * 86400000).toISOString(),
      ownerEmail: 'owner@ironroot.local',
      orgId: 'org_001',
      created_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'camp_1003',
      name: 'Org-wide Awareness',
      templateId: 'tmpl_1003',
      targetGroupId: null,
      status: 'Completed',
      launchDate: '2026-01-10',
      startAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      endAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      ownerEmail: 'owner@ironroot.local',
      orgId: 'org_001',
      created_date: new Date(Date.now() - 28 * 86400000).toISOString(),
    },
  ],
  TrainingEvent: [
    {
      id: 'te_2001',
      campaignId: 'camp_1001',
      userName: 'Vansh Kumar',
      userEmail: 'vansh@ironroot.ai',
      status: 'clicked',
      ip: '203.0.113.24',
      location: 'San Francisco, CA',
      userAgent: 'Chrome 121 / macOS',
      device: 'MacBook Pro 14',
      mailbox: 'Google Workspace',
      deliveredAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      openedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      clickedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      orgId: 'org_001',
      created_date: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: 'te_2002',
      campaignId: 'camp_1001',
      userName: 'Amira Patel',
      userEmail: 'amira@ironroot.ai',
      status: 'reported',
      ip: '198.51.100.83',
      location: 'Seattle, WA',
      userAgent: 'Edge 120 / Windows 11',
      device: 'Dell Latitude',
      mailbox: 'Microsoft 365',
      deliveredAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      openedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      reportedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      orgId: 'org_001',
      created_date: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 'te_2003',
      campaignId: 'camp_1001',
      userName: 'Jordan Reese',
      userEmail: 'jordan@ironroot.ai',
      status: 'opened',
      ip: '198.51.100.54',
      location: 'Boston, MA',
      userAgent: 'Chrome 121 / Windows 11',
      device: 'Lenovo ThinkPad',
      mailbox: 'Google Workspace',
      deliveredAt: new Date(Date.now() - 7 * 3600000).toISOString(),
      openedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      orgId: 'org_001',
      created_date: new Date(Date.now() - 7 * 3600000).toISOString(),
    },
    {
      id: 'te_2004',
      campaignId: 'camp_1002',
      userName: 'Chris Wu',
      userEmail: 'chris@northwind.com',
      status: 'delivered',
      ip: '203.0.113.62',
      location: 'Chicago, IL',
      userAgent: 'Outlook Desktop',
      device: 'Surface Laptop',
      mailbox: 'Microsoft 365',
      deliveredAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      orgId: 'org_002',
      created_date: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'te_2005',
      campaignId: 'camp_1003',
      userName: 'Nora Blake',
      userEmail: 'nora@ironroot.ai',
      status: 'clicked',
      ip: '203.0.113.94',
      location: 'Austin, TX',
      userAgent: 'Safari 17 / macOS',
      device: 'MacBook Air',
      mailbox: 'Google Workspace',
      deliveredAt: new Date(Date.now() - 25 * 3600000).toISOString(),
      openedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      clickedAt: new Date(Date.now() - 23 * 3600000).toISOString(),
      orgId: 'org_001',
      created_date: new Date(Date.now() - 25 * 3600000).toISOString(),
    },
  ],
  TrialRequest: [
    {
      id: 'tr_1001',
      fullName: 'Jordan Reese',
      companyName: 'Northwind Capital',
      email: 'jordan@northwind.com',
      orgId: 'org_002',
      interestedIn: 'full_platform',
      companySize: '201-1000',
      status: 'trial_active',
      trialStartDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      trialEndDate: new Date(Date.now() + 12 * 86400000).toISOString(),
      created_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'tr_1002',
      fullName: 'Amira Patel',
      companyName: 'Skyline Health',
      email: 'amira@skylinehealth.io',
      orgId: 'org_001',
      interestedIn: 'api_security',
      companySize: '51-200',
      status: 'pending',
      created_date: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  Lead: [
    {
      id: 'lead_2001',
      fullName: 'Chris Wu',
      companyName: 'Forge Analytics',
      email: 'chris@forge.ai',
      orgId: 'org_001',
      interestedIn: 'code_scanning',
      created_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
  Visitor: [
    {
      id: 'visitor_3001',
      ip: '198.51.100.22',
      page: '/codeScanner',
      location: 'Seattle, WA',
      lastVisit: new Date(Date.now() - 2 * 3600000).toISOString(),
      orgId: 'org_001',
    },
  ],
  ScanHistory: [
    {
      id: 'scan_4001',
      scanType: 'SAST',
      target: 'payments-service',
      status: 'completed',
      severity: 'high',
      findingsCount: 12,
      created_date: new Date(Date.now() - 3 * 3600000).toISOString(),
      orgId: 'org_001',
    },
    {
      id: 'scan_4002',
      scanType: 'DAST',
      target: 'api-gateway',
      status: 'completed',
      severity: 'medium',
      findingsCount: 6,
      created_date: new Date(Date.now() - 28 * 3600000).toISOString(),
      orgId: 'org_001',
    },
  ],
  Notification: [
    {
      id: 'notif_5001',
      title: 'Critical auth bypass fixed',
      message: 'Auto-remediation applied to auth-service and regression tests passed.',
      isRead: false,
      created_date: new Date(Date.now() - 3600000).toISOString(),
      userEmail: 'owner@ironroot.local',
      orgId: 'org_001',
    },
  ],
  AdminNote: [
    {
      id: 'note_6001',
      title: 'Q1 launch checklist',
      content: 'Finalize SOC2 mapping, confirm red-team schedule, update board report templates.',
      priority: 'high',
      created_date: new Date(Date.now() - 6 * 86400000).toISOString(),
      orgId: 'org_001',
    },
  ],
  ActivityLog: [
    {
      id: 'log_7001',
      userEmail: 'owner@ironroot.local',
      action: 'trial_approved',
      details: { requestId: 'tr_1001' },
      timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
      orgId: 'org_001',
    },
  ],
  AdminRequest: [],
  Session: [],
  User: [],
  ScheduledScan: [
    {
      id: 'sched_9001',
      name: 'Weekly API gateway scan',
      target: 'https://api.ironroot.ai',
      cadence: 'weekly',
      userEmail: 'owner@ironroot.local',
      orgId: 'org_001',
      created_date: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
  ],
  Asset: [
    {
      id: 'asset_1001',
      name: 'app.ironroot.ai',
      type: 'domain',
      environment: 'production',
      criticality: 'critical',
      exposure: 'public',
      lastSeen: new Date(Date.now() - 3 * 3600000).toISOString(),
      tags: ['customer-facing', 'auth'],
      orgId: 'org_001',
    },
    {
      id: 'asset_1002',
      name: 'api.ironroot.ai',
      type: 'api',
      environment: 'production',
      criticality: 'high',
      exposure: 'public',
      lastSeen: new Date(Date.now() - 5 * 3600000).toISOString(),
      tags: ['gateway', 'payments'],
      orgId: 'org_001',
    },
    {
      id: 'asset_1003',
      name: 'github.com/ironroot/core',
      type: 'repo',
      environment: 'production',
      criticality: 'high',
      exposure: 'internal',
      lastSeen: new Date(Date.now() - 2 * 3600000).toISOString(),
      tags: ['supply-chain', 'ci'],
      orgId: 'org_001',
    },
  ],
  Risk: [
    {
      id: 'risk_2001',
      title: 'API token leakage exposure',
      severity: 'critical',
      status: 'mitigating',
      businessImpact: 'Potential account takeover and data exfiltration',
      owner: 'Security Ops',
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      mitigation: 'Rotate secrets, enforce PKCE, monitor anomalous token use.',
      orgId: 'org_001',
      created_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'risk_2002',
      title: 'Third-party dependency drift',
      severity: 'high',
      status: 'open',
      businessImpact: 'Supply-chain exposure and delayed patch adoption',
      owner: 'Platform Engineering',
      dueDate: new Date(Date.now() + 21 * 86400000).toISOString(),
      mitigation: 'Automate SBOM verification and enforce patch SLAs.',
      orgId: 'org_001',
      created_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
  Playbook: [
    {
      id: 'pb_1001',
      name: 'Credential Theft Response',
      category: 'Account Security',
      status: 'Active',
      ownerTeam: 'SOC',
      slaHours: 4,
      lastUpdated: new Date(Date.now() - 3 * 86400000).toISOString(),
      summary: 'Rapid containment and credential rotation workflow for suspected credential theft.',
      steps: [
        'Identify impacted identities and revoke tokens',
        'Force MFA reset and password rotation',
        'Hunt for anomalous access patterns',
        'Notify stakeholders and capture evidence',
      ],
      orgId: 'org_001',
      created_date: new Date(Date.now() - 40 * 86400000).toISOString(),
    },
    {
      id: 'pb_1002',
      name: 'Ransomware Containment',
      category: 'Incident Response',
      status: 'Active',
      ownerTeam: 'IR',
      slaHours: 2,
      lastUpdated: new Date(Date.now() - 7 * 86400000).toISOString(),
      summary: 'Containment playbook focused on isolating assets and preserving evidence.',
      steps: [
        'Isolate infected endpoints from network',
        'Trigger backup verification',
        'Collect forensic artifacts and memory snapshots',
        'Engage legal and communications response',
      ],
      orgId: 'org_001',
      created_date: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: 'pb_1003',
      name: 'Suspicious Cloud Access',
      category: 'Cloud Security',
      status: 'Draft',
      ownerTeam: 'CloudSec',
      slaHours: 6,
      lastUpdated: new Date(Date.now() - 1 * 86400000).toISOString(),
      summary: 'Investigate anomalous cloud login signals and enforce token revocation.',
      steps: [
        'Validate identity provider logs',
        'Rotate cloud access keys',
        'Review role assignments and permissions',
      ],
      orgId: 'org_001',
      created_date: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ],
  PlaybookRun: [
    {
      id: 'run_2001',
      playbookId: 'pb_1001',
      incidentId: 'INC-2026-0142',
      severity: 'high',
      status: 'in_progress',
      startedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      owner: 'SOC Analyst',
      affectedAsset: 'auth.ironroot.ai',
      slaStatus: 'on_track',
      orgId: 'org_001',
    },
    {
      id: 'run_2002',
      playbookId: 'pb_1002',
      incidentId: 'INC-2026-0137',
      severity: 'critical',
      status: 'containment',
      startedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      owner: 'IR Lead',
      affectedAsset: 'finance-fileshare',
      slaStatus: 'at_risk',
      orgId: 'org_001',
    },
  ],
  EvidenceItem: [
    {
      id: 'evid_3001',
      name: 'SOC2 Access Review Q4',
      framework: 'SOC 2',
      control: 'CC6.2',
      status: 'Ready',
      owner: 'GRC',
      source: 'manual',
      collectedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 70 * 86400000).toISOString(),
      tags: ['access', 'review'],
      orgId: 'org_001',
    },
    {
      id: 'evid_3002',
      name: 'Vendor Risk Assessment',
      framework: 'ISO 27001',
      control: 'A.15.1',
      status: 'Needs Update',
      owner: 'Security',
      source: 'upload',
      collectedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      expiresAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      tags: ['vendor', 'risk'],
      orgId: 'org_001',
    },
  ],
  Policy: [
    {
      id: 'pol_4001',
      name: 'Acceptable Use Policy',
      version: '3.2',
      owner: 'Security',
      status: 'Active',
      lastUpdated: new Date(Date.now() - 18 * 86400000).toISOString(),
      description: 'Guidelines for responsible access and data handling.',
      ackRequired: true,
      orgId: 'org_001',
    },
    {
      id: 'pol_4002',
      name: 'Incident Response Policy',
      version: '2.1',
      owner: 'GRC',
      status: 'Active',
      lastUpdated: new Date(Date.now() - 33 * 86400000).toISOString(),
      description: 'Defines incident classification, escalation, and communication.',
      ackRequired: true,
      orgId: 'org_001',
    },
  ],
  PolicyAttestation: [
    {
      id: 'att_5001',
      policyId: 'pol_4001',
      userName: 'Jamie Lin',
      userEmail: 'jamie@ironroot.ai',
      status: 'attested',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      signedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      orgId: 'org_001',
    },
    {
      id: 'att_5002',
      policyId: 'pol_4001',
      userName: 'Avery Cole',
      userEmail: 'avery@ironroot.ai',
      status: 'pending',
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      signedAt: null,
      orgId: 'org_001',
    },
  ],
  Invitation: [],
  EmailLog: [],
  Document: [],
  WatermarkEvent: [],
  WatermarkVerificationRequest: [],
};

const isBrowser = () => typeof window !== 'undefined';

const resetStore = () => {
  const seeded = JSON.parse(JSON.stringify(seedData));
  if (isBrowser() && window.localStorage) {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  }
  memoryStore.data = seeded;
  return seeded;
};

const loadStore = () => {
  if (isBrowser() && window.localStorage) {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed?.meta?.version || parsed.meta.version !== STORE_VERSION) {
        return resetStore();
      }
      let changed = false;
      const next = { ...parsed };
      Object.keys(seedData).forEach((key) => {
        if (next[key] === undefined) {
          next[key] = JSON.parse(JSON.stringify(seedData[key]));
          changed = true;
        }
      });
      if (!next.meta) {
        next.meta = { version: STORE_VERSION };
        changed = true;
      }
      if (Array.isArray(next.Organization)) {
        next.Organization = next.Organization.map((org) => {
          const baseFeatures = org.plan === 'trial' ? trialFeatures : defaultFeatures;
          const mergedFeatures = { ...baseFeatures, ...(org.features || {}) };
          const mergedSecurity = { ...defaultSecurity, ...(org.security || {}) };
          const missingFeatures = Object.keys(baseFeatures).some((key) => org.features?.[key] === undefined);
          const missingSecurity = Object.keys(defaultSecurity).some((key) => org.security?.[key] === undefined);
          if (missingFeatures || missingSecurity) {
            changed = true;
            return { ...org, features: mergedFeatures, security: mergedSecurity };
          }
          return org;
        });
      }
      if (Array.isArray(next.TrainingTemplate)) {
        const mergedTemplates = mergeById(next.TrainingTemplate, seedData.TrainingTemplate);
        if (mergedTemplates.length !== next.TrainingTemplate.length) {
          next.TrainingTemplate = mergedTemplates;
          changed = true;
        }
      }
      if (changed) {
        saveStore(next);
      }
      return next;
    }
    return resetStore();
  }
  if (!memoryStore.data || Object.keys(memoryStore.data).length === 0) {
    memoryStore.data = JSON.parse(JSON.stringify(seedData));
  }
  return memoryStore.data;
};

const saveStore = (data) => {
  if (isBrowser() && window.localStorage) {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } else {
    memoryStore.data = data;
  }
};

const bufferToHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const getCrypto = () => (typeof crypto !== 'undefined' ? crypto : null);

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3002';
};

const generateToken = () => {
  const cryptoObj = getCrypto();
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    return bufferToHex(bytes);
  }
  return `tok_${Math.random().toString(36).slice(2, 12)}`;
};

const validatePassword = (password) => {
  if (!password || password.length < 10) {
    throw new Error('Password must be at least 10 characters.');
  }
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('Password must include at least one uppercase letter and one number.');
  }
};

const generateSalt = () => {
  const cryptoObj = getCrypto();
  if (!cryptoObj) return Math.random().toString(36).slice(2, 12);
  const bytes = new Uint8Array(16);
  cryptoObj.getRandomValues(bytes);
  return bufferToHex(bytes);
};

const mergeById = (current = [], seed = []) => {
  const existing = new Set(current.map((item) => item?.id).filter(Boolean));
  const additions = seed.filter((item) => item?.id && !existing.has(item.id));
  return additions.length ? [...current, ...additions] : current;
};

const hashPassword = async (password, salt) => {
  const cryptoObj = getCrypto();
  if (!cryptoObj?.subtle) {
    return `${password}::${salt}`;
  }
  const encoder = new TextEncoder();
  const keyMaterial = await cryptoObj.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await cryptoObj.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return bufferToHex(bits);
};

const verifyPassword = async (password, salt, expectedHash) => {
  const hash = await hashPassword(password, salt);
  return hash === expectedHash;
};

const getSession = () => {
  if (isBrowser() && window.localStorage) {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  return memoryStore.user ? { userId: memoryStore.user.id, expiresAt: memoryStore.user.expiresAt } : null;
};

const setSession = (session) => {
  if (isBrowser() && window.localStorage) {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }
  memoryStore.user = session ? { id: session.userId, expiresAt: session.expiresAt } : null;
};

const getOrgById = (store, orgId) => (store.Organization || []).find((org) => org.id === orgId) || null;

const getSessionTTLForUser = (user) => {
  if (!user || user.role === 'guest') return SESSION_TTL_MS;
  const store = loadStore();
  const org = getOrgById(store, user.orgId);
  const minutes = org?.security?.sessionTimeoutMins;
  if (!minutes || Number.isNaN(Number(minutes))) return SESSION_TTL_MS;
  return Math.max(5, Number(minutes)) * 60 * 1000;
};

const touchSession = () => {
  const session = getSession();
  if (!session) return;
  const store = loadStore();
  const user = (store.User || []).find((item) => item.id === session.userId);
  const next = { ...session, expiresAt: Date.now() + getSessionTTLForUser(user) };
  setSession(next);
};

const upsertSessionRecord = (user) => {
  if (!user || user.role === 'guest') return null;
  const store = loadStore();
  const now = new Date().toISOString();
  const sessions = store.Session || [];
  const clientContext = {
    ip: '127.0.0.1',
    location: 'Local',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };
  const activeIndex = sessions.findIndex(
    (item) => item.userId === user.id && item.status === 'active'
  );
  if (activeIndex >= 0) {
    sessions[activeIndex] = { ...sessions[activeIndex], lastSeen: now };
  } else {
    sessions.unshift({
      id: uuid(),
      userId: user.id,
      email: user.email,
      orgId: user.orgId || null,
      status: 'active',
      created_date: now,
      lastSeen: now,
      ip: clientContext.ip,
      location: clientContext.location,
      userAgent: clientContext.userAgent,
    });
  }
  store.Session = sessions;
  saveStore(store);
  return activeIndex >= 0 ? sessions[activeIndex] : sessions[0];
};

const endActiveSessions = (user) => {
  if (!user || user.role === 'guest') return;
  const store = loadStore();
  const now = new Date().toISOString();
  store.Session = (store.Session || []).map((session) =>
    session.userId === user.id && session.status === 'active'
      ? { ...session, status: 'ended', endedAt: now }
      : session
  );
  saveStore(store);
};

const guestUser = {
  id: 'guest',
  fullName: 'Guest',
  email: 'guest@ironroot.ai',
  role: 'guest',
  orgId: null,
};

const getUser = () => {
  const store = loadStore();
  const session = getSession();
  if (!session) return guestUser;
  if (session.expiresAt && session.expiresAt < Date.now()) {
    setSession(null);
    return guestUser;
  }
  const user = (store.User || []).find((item) => item.id === session.userId);
  return user || guestUser;
};

const uuid = () => {
  const cryptoObj = getCrypto();
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2, 10)}`;
};

const sortData = (items, sortKey) => {
  if (!sortKey) return items;
  const isDesc = sortKey.startsWith('-');
  const key = isDesc ? sortKey.slice(1) : sortKey;
  return [...items].sort((a, b) => {
    const av = a?.[key];
    const bv = b?.[key];
    if (av === bv) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return isDesc ? (av < bv ? 1 : -1) : (av < bv ? -1 : 1);
  });
};

const filterData = (items, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) return items;
  return items.filter((item) =>
    Object.entries(filter).every(([key, value]) => item?.[key] === value)
  );
};

const scopeToOrg = (items) => {
  const user = getUser();
  if (user?.role === 'guest') return [];
  if (PRIVILEGED_ROLES.includes(user?.role)) return items;
  if (!user?.orgId) return items;
  return items.filter((item) => !item.orgId || item.orgId === user.orgId);
};

const entityPermissions = {
  Organization: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  Group: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  TrainingTemplate: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  TrainingCampaign: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  TrainingEvent: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  User: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  AdminNote: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  ActivityLog: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  Visitor: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  Lead: { read: ['owner', 'admin'], create: ['owner', 'admin', 'user', 'guest'], update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  TrialRequest: { read: ['owner', 'admin', 'user'], create: ['owner', 'admin', 'user', 'guest'], update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES, ownerField: 'email' },
  Notification: { read: ['owner', 'admin', 'user'], create: PRIVILEGED_ROLES, update: ['owner', 'admin', 'user'], delete: ['owner', 'admin', 'user'], ownerField: 'userEmail' },
  ScanHistory: { read: ['owner', 'admin', 'user'], create: ['owner', 'admin', 'user'], update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES, ownerField: 'scannedBy' },
  ScheduledScan: { read: ['owner', 'admin', 'user'], create: ['owner', 'admin', 'user'], update: ['owner', 'admin', 'user'], delete: PRIVILEGED_ROLES, ownerField: 'userEmail' },
  AdminRequest: { read: PRIVILEGED_ROLES, create: ['owner', 'admin', 'user', 'guest'], update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  Session: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  Asset: { read: ['owner', 'admin', 'user'], create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  Risk: { read: ['owner', 'admin', 'user'], create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  Playbook: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  PlaybookRun: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  EvidenceItem: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  Policy: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  PolicyAttestation: { read: PRIVILEGED_ROLES, create: PRIVILEGED_ROLES, update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  Document: { read: ['owner', 'admin', 'user'], create: ['owner', 'admin', 'user'], update: ['owner', 'admin', 'user'], delete: PRIVILEGED_ROLES, ownerField: 'createdByEmail' },
  WatermarkEvent: { read: PRIVILEGED_ROLES, create: ['owner', 'admin', 'user'], update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
  WatermarkVerificationRequest: { read: ['owner'], create: ['owner', 'admin', 'user'], update: ['owner'], delete: ['owner'] },
  default: { read: ['owner', 'admin', 'user'], create: ['owner', 'admin', 'user'], update: PRIVILEGED_ROLES, delete: PRIVILEGED_ROLES },
};

const canPerform = (entityName, action, record) => {
  const user = getUser();
  const rules = entityPermissions[entityName] || entityPermissions.default;
  const allowed = rules[action] || [];
  if (!allowed.includes(user?.role)) return false;
  if (rules.ownerField && record && !PRIVILEGED_ROLES.includes(user?.role)) {
    const ownerValue = record?.[rules.ownerField];
    if (ownerValue && ownerValue !== user.email) return false;
  }
  return true;
};

const entityApi = (entityName) => ({
  list: async (sortKey, limit) => {
    if (!canPerform(entityName, 'read')) throw new Error('Access denied');
    const store = loadStore();
    const items = scopeToOrg(store[entityName] || []);
    const sorted = sortData(items, sortKey);
    return limit ? sorted.slice(0, limit) : sorted;
  },
  filter: async (filter, sortKey, limit) => {
    if (!canPerform(entityName, 'read')) throw new Error('Access denied');
    const store = loadStore();
    const items = scopeToOrg(store[entityName] || []);
    const filtered = filterData(items, filter);
    const sorted = sortData(filtered, sortKey);
    return limit ? sorted.slice(0, limit) : sorted;
  },
  create: async (data) => {
    if (!canPerform(entityName, 'create')) throw new Error('Access denied');
    const store = loadStore();
    const user = getUser();
    const record = {
      id: uuid(),
      created_date: new Date().toISOString(),
      orgId: data?.orgId || user?.orgId || null,
      ...data,
    };
    store[entityName] = [...(store[entityName] || []), record];
    saveStore(store);
    return record;
  },
  update: async (id, updates) => {
    const store = loadStore();
    const items = store[entityName] || [];
    const target = items.find((item) => item.id === id);
    if (!canPerform(entityName, 'update', target)) throw new Error('Access denied');
    const next = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    store[entityName] = next;
    saveStore(store);
    return next.find((item) => item.id === id);
  },
  delete: async (id) => {
    const store = loadStore();
    const items = store[entityName] || [];
    const target = items.find((item) => item.id === id);
    if (!canPerform(entityName, 'delete', target)) throw new Error('Access denied');
    store[entityName] = (store[entityName] || []).filter((item) => item.id !== id);
    saveStore(store);
    return { id };
  },
});

const entities = {
  Organization: entityApi('Organization'),
  Group: entityApi('Group'),
  TrainingTemplate: entityApi('TrainingTemplate'),
  TrainingCampaign: entityApi('TrainingCampaign'),
  TrainingEvent: entityApi('TrainingEvent'),
  TrialRequest: entityApi('TrialRequest'),
  Lead: entityApi('Lead'),
  Visitor: entityApi('Visitor'),
  ScanHistory: entityApi('ScanHistory'),
  Notification: entityApi('Notification'),
  AdminNote: entityApi('AdminNote'),
  ActivityLog: entityApi('ActivityLog'),
  User: entityApi('User'),
  ScheduledScan: entityApi('ScheduledScan'),
  AdminRequest: entityApi('AdminRequest'),
  Session: entityApi('Session'),
  Asset: entityApi('Asset'),
  Risk: entityApi('Risk'),
  Playbook: entityApi('Playbook'),
  PlaybookRun: entityApi('PlaybookRun'),
  EvidenceItem: entityApi('EvidenceItem'),
  Policy: entityApi('Policy'),
  PolicyAttestation: entityApi('PolicyAttestation'),
  Invitation: entityApi('Invitation'),
  EmailLog: entityApi('EmailLog'),
  Document: entityApi('Document'),
  WatermarkEvent: entityApi('WatermarkEvent'),
  WatermarkVerificationRequest: entityApi('WatermarkVerificationRequest'),
};

const getLoginAttempts = () => {
  if (isBrowser() && window.localStorage) {
    const raw = window.localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lockUntil: 0 };
  }
  return memoryStore.loginAttempts || { count: 0, lockUntil: 0 };
};

const setLoginAttempts = (value) => {
  if (isBrowser() && window.localStorage) {
    window.localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(value));
  } else {
    memoryStore.loginAttempts = value;
  }
};

const auth = {
  me: async () => getUser(),
  needsSetup: async () => {
    const store = loadStore();
    return !(store.User || []).some((u) => PRIVILEGED_ROLES.includes(u.role) && u.passwordHash);
  },
  bootstrapAdmin: async ({ email, password, orgName, plan = 'paid' }) => {
    validatePassword(password);
    const store = loadStore();
    if ((store.User || []).some((u) => PRIVILEGED_ROLES.includes(u.role) && u.passwordHash)) {
      throw new Error('Admin already exists');
    }
    const orgId = uuid();
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const org = {
      id: orgId,
      name: orgName || 'Primary Org',
      slug: (orgName || 'primary').toLowerCase().replace(/\s+/g, '-'),
      industry: 'Security',
      size: '1-50',
      plan,
      ownerEmail: email,
      features: plan === 'trial' ? { ...trialFeatures } : { ...defaultFeatures },
      security: { ...defaultSecurity },
      created_date: new Date().toISOString(),
    };
    const adminUser = {
      id: uuid(),
      fullName: 'Org Owner',
      email,
      role: 'owner',
      orgId,
      passwordHash,
      passwordSalt: salt,
      created_date: new Date().toISOString(),
    };
    const welcomeNotice = {
      id: uuid(),
      title: 'Admin access ready',
      message: 'Your organization is configured. Visit User Management to invite teammates and assign roles.',
      isRead: false,
      type: 'success',
      created_date: new Date().toISOString(),
      userEmail: email,
      orgId,
    };
    store.Organization = [org, ...(store.Organization || [])];
    store.User = [adminUser, ...(store.User || [])];
    store.Notification = [welcomeNotice, ...(store.Notification || [])];
    saveStore(store);
    setSession({ userId: adminUser.id, expiresAt: Date.now() + getSessionTTLForUser(adminUser) });
    upsertSessionRecord(adminUser);
    return adminUser;
  },
  login: async ({ email, password }) => {
    const attempt = getLoginAttempts();
    if (attempt.lockUntil && attempt.lockUntil > Date.now()) {
      throw new Error('Too many attempts. Try again later.');
    }
    const store = loadStore();
    const user = (store.User || []).find(
      (item) => item.email?.toLowerCase() === email.toLowerCase()
    );
    if (!user || !user.passwordHash) {
      setLoginAttempts({ count: attempt.count + 1, lockUntil: attempt.count + 1 >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0 });
      throw new Error('Invalid credentials');
    }
    const ok = await verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!ok) {
      setLoginAttempts({ count: attempt.count + 1, lockUntil: attempt.count + 1 >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0 });
      throw new Error('Invalid credentials');
    }
    setLoginAttempts({ count: 0, lockUntil: 0 });
    const loginMeta = {
      lastLoginAt: new Date().toISOString(),
      lastLoginIp: '127.0.0.1',
      lastLoginLocation: 'Local',
    };
    store.User = (store.User || []).map((item) => (item.id === user.id ? { ...item, ...loginMeta } : item));
    saveStore(store);
    setSession({ userId: user.id, expiresAt: Date.now() + getSessionTTLForUser(user) });
    upsertSessionRecord(user);
    return user;
  },
  logout: async () => {
    const currentUser = getUser();
    endActiveSessions(currentUser);
    setSession(null);
    if (isBrowser()) {
      window.location.href = '/login';
    }
  },
  resetDemo: async () => {
    resetStore();
    setSession(null);
    setLoginAttempts({ count: 0, lockUntil: 0 });
  },
  touchSession: () => {
    touchSession();
    const currentUser = getUser();
    upsertSessionRecord(currentUser);
  },
  currentOrg: async () => {
    const store = loadStore();
    const user = getUser();
    return (store.Organization || []).find((org) => org.id === user.orgId) || null;
  },
  requireRole: (user, roles = []) => {
    if (!user) return false;
    if (!roles.length) return user.role !== 'guest';
    if (roles.includes('admin') && user.role === 'owner') return true;
    return roles.includes(user.role);
  },
};

const users = {
  inviteUser: async (email, role = 'user', orgId = null, groupId = null) => {
    const store = loadStore();
    const existing = (store.User || []).find((u) => u.email === email);
    if (existing) {
      if (!existing.passwordHash) {
        await users.createInvite({ email, role: existing.role, orgId: existing.orgId, groupId: existing.groupId });
      }
      return existing;
    }
    const currentUser = getUser();
    if ((role === 'admin' || role === 'owner') && currentUser.role !== 'owner') {
      throw new Error('Only owners can grant admin access.');
    }
    const newUser = {
      id: uuid(),
      fullName: email.split('@')[0],
      email,
      role,
      orgId: orgId || currentUser?.orgId || null,
      groupId: groupId || null,
      created_date: new Date().toISOString(),
    };
    store.User = [...(store.User || []), newUser];
    saveStore(store);
    await users.createInvite({ email, role, orgId: newUser.orgId, groupId: newUser.groupId });
    return newUser;
  },
  createInvite: async ({ email, role = 'user', orgId = null, groupId = null }) => {
    const store = loadStore();
    const token = generateToken();
    const expiresAt = Date.now() + INVITE_TTL_MS;
    const invite = {
      id: uuid(),
      email,
      role,
      orgId,
      groupId,
      token,
      status: 'pending',
      expiresAt,
      created_date: new Date().toISOString(),
      requestedBy: getUser()?.email || 'system',
    };
    store.Invitation = [invite, ...(store.Invitation || [])];
    saveStore(store);

    const link = `${getBaseUrl()}/invite?token=${token}`;
    const message = `You have been invited to Ironroot.\n\nLogin link (expires in 10 minutes): ${link}\n\nCreate a strong password (10+ chars, 1 uppercase, 1 number).`;
    await integrations.Core.SendEmail({
      to: email,
      subject: 'Your Ironroot access link',
      body: message,
    });
    await entities.ActivityLog.create({
      userEmail: getUser()?.email || 'system',
      action: 'invite_created',
      details: { email, role, expiresAt },
      timestamp: new Date().toISOString(),
    });
    return invite;
  },
  getInviteByToken: async (token) => {
    const store = loadStore();
    const invite = (store.Invitation || []).find((item) => item.token === token);
    if (!invite) return null;
    if (invite.status !== 'pending') return { ...invite, invalid: true };
    if (invite.expiresAt && invite.expiresAt < Date.now()) {
      invite.status = 'expired';
      saveStore(store);
      return { ...invite, expired: true };
    }
    return invite;
  },
  acceptInvite: async ({ token, password }) => {
    validatePassword(password);
    const store = loadStore();
    const invite = (store.Invitation || []).find((item) => item.token === token);
    if (!invite) throw new Error('Invite not found');
    if (invite.status !== 'pending') throw new Error('Invite already used');
    if (invite.expiresAt && invite.expiresAt < Date.now()) {
      invite.status = 'expired';
      saveStore(store);
      throw new Error('Invite expired');
    }
    const user = (store.User || []).find((u) => u.email === invite.email);
    if (!user) throw new Error('User not found');
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    user.passwordSalt = salt;
    user.passwordHash = passwordHash;
    invite.status = 'used';
    invite.usedAt = new Date().toISOString();
    saveStore(store);
    await entities.ActivityLog.create({
      userEmail: user.email,
      action: 'invite_accepted',
      details: { role: user.role },
      timestamp: new Date().toISOString(),
    });
    return user;
  },
  assignRole: async ({ userId, role }) => {
    const store = loadStore();
    const currentUser = getUser();
    if ((role === 'admin' || role === 'owner') && currentUser.role !== 'owner') {
      throw new Error('Only owners can grant admin access.');
    }
    const user = (store.User || []).find((item) => item.id === userId);
    if (!user) throw new Error('User not found');
    user.role = role;
    saveStore(store);
    return user;
  },
  setPassword: async ({ email, password }) => {
    validatePassword(password);
    const store = loadStore();
    const user = (store.User || []).find((u) => u.email === email);
    if (!user) throw new Error('User not found');
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    user.passwordSalt = salt;
    user.passwordHash = passwordHash;
    saveStore(store);
    return user;
  },
  requestAdminAccess: async ({ email, reason }) => {
    const store = loadStore();
    const orgId = store.Organization?.length === 1 ? store.Organization[0].id : null;
    const request = {
      id: uuid(),
      email,
      reason: reason || 'Requesting admin access.',
      requestedBy: getUser()?.email || email,
      status: 'pending',
      created_date: new Date().toISOString(),
      orgId,
    };
    store.AdminRequest = [...(store.AdminRequest || []), request];
    const admins = (store.User || []).filter((u) => PRIVILEGED_ROLES.includes(u.role));
    const notices = admins.map((admin) => ({
      id: uuid(),
      title: 'Admin access request',
      message: `${email} requested admin access.`,
      isRead: false,
      type: 'warning',
      created_date: new Date().toISOString(),
      userEmail: admin.email,
      orgId: admin.orgId,
    }));
    store.Notification = [...notices, ...(store.Notification || [])];
    saveStore(store);
    return request;
  },
};

const llmBuckets = new Map();

const allowLLM = (user) => {
  const store = loadStore();
  const org = getOrgById(store, user?.orgId);
  const limit = Math.max(5, Number(org?.security?.aiRequestsPerMin || 30));
  const windowMs = 60000;
  const key = org?.id || 'global';
  const now = Date.now();
  const bucket = llmBuckets.get(key) || { count: 0, start: now };
  if (now - bucket.start > windowMs) {
    llmBuckets.set(key, { count: 1, start: now });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  llmBuckets.set(key, bucket);
  return true;
};

const extractUserPrompt = (prompt) => {
  if (!prompt) return '';
  const lines = String(prompt).split('\n').map((line) => line.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (line.toLowerCase().startsWith('user question:')) {
      return line.replace(/user question:/i, '').trim();
    }
    if (line.toLowerCase().startsWith('user:')) {
      return line.replace(/user:/i, '').trim();
    }
  }
  return String(prompt).slice(-400).trim();
};

const mockLLM = (prompt) => {
  if (!prompt) {
    return 'Vansh is ready. Ask about risk posture, scanning coverage, or compliance insights.';
  }
  const text = extractUserPrompt(prompt).toLowerCase();
  if (text.includes('pricing') || text.includes('trial')) {
    return 'We offer a free trial with full access to scanning, threat intel, and reporting. Start a trial from the homepage or contact our team for enterprise pricing.';
  }
  if (text.includes('code') || text.includes('scan')) {
    return 'Ironroot Code Scanning covers SAST, SCA, secrets detection, IaC misconfigs, and API security. Findings are prioritized by severity with remediation guidance and secure code examples.';
  }
  if (text.includes('login') || text.includes('admin') || text.includes('owner')) {
    return 'Admins can create the first account from the login page and then manage users, orgs, and roles in the User Management console. Advanced features are gated to paid orgs and admins.';
  }
  if (text.includes('threat') || text.includes('intel')) {
    return 'Threat Intelligence aggregates CVEs, actor activity, MITRE ATT&CK mapping, and IOC monitoring. It links external intel to your assets with response playbooks.';
  }
  if (text.includes('log4j') || text.includes('log4shell')) {
    return 'Log4Shell (CVE-2021-44228) is a critical RCE in Log4j. Upgrade to a fixed version, disable message lookups, and monitor for JNDI-based exploit traffic.';
  }
  if (text.includes('report') || text.includes('pdf') || text.includes('export')) {
    return 'Threat Intel reports can be exported from the report view with a PDF-style layout for executive and SOC audiences.';
  }
  if (text.includes('pentest') || text.includes('offensive')) {
    return 'Our AI pentest service runs continuous adversary simulations, validates exploitability, and maps blast radius across cloud, API, and app layers.';
  }
  return 'Here’s a focused security response: prioritize high-risk findings, verify exploitability, and schedule automated retests. Want a deeper breakdown or remediation plan?';
};

const fetchJson = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: { error: error.message } };
  }
};

const integrations = {
  Core: {
    InvokeLLM: async ({ prompt }) => {
      const user = getUser();
      if (!allowLLM(user)) {
        throw new Error('Rate limit exceeded. Try again shortly.');
      }
      const response = await fetchJson('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      if (response.ok && response.data?.text) {
        return response.data.text;
      }
      return mockLLM(prompt);
    },
    UploadFile: async ({ file }) => {
      if (isBrowser() && file) {
        return { file_url: URL.createObjectURL(file) };
      }
      return { file_url: '' };
    },
    SendEmail: async ({ to, subject, body }) => {
      const store = loadStore();
      const emailLog = {
        id: uuid(),
        to,
        subject,
        body,
        created_date: new Date().toISOString(),
      };
      store.EmailLog = [emailLog, ...(store.EmailLog || [])];
      if (to) {
        const notice = {
          id: uuid(),
          title: subject || 'New message from Ironroot',
          message: body || 'You have a new message.',
          isRead: false,
          type: 'email',
          created_date: new Date().toISOString(),
          userEmail: to,
          orgId: null,
        };
        store.Notification = [notice, ...(store.Notification || [])];
      }
      saveStore(store);
      return { status: 'queued', id: emailLog.id };
    },
  },
  Forensics: {
    getConfig: async ({ orgId, ownerEmail }) => {
      if (!orgId) return null;
      const params = new URLSearchParams({ orgId });
      if (ownerEmail) params.set('ownerEmail', ownerEmail);
      const response = await fetchJson(`/api/forensics/config?${params.toString()}`);
      return response.ok ? response.data.config : null;
    },
    updateConfig: async ({ orgId, ownerEmail, enable, allowAdminVerify }) => {
      const response = await fetchJson('/api/forensics/config', {
        method: 'POST',
        body: JSON.stringify({ orgId, ownerEmail, enable, allowAdminVerify }),
      });
      return response.ok ? response.data.config : null;
    },
    embed: async (payload) => {
      const response = await fetchJson('/api/forensics/embed', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        return { ok: false, error: response.data?.error || 'Watermarking failed.' };
      }
      return { ok: true, ...response.data };
    },
    verify: async (payload) => {
      const response = await fetchJson('/api/forensics/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        return { ok: false, error: response.data?.error || 'Verification failed.' };
      }
      return { ok: true, ...response.data };
    },
    events: async ({ orgId, limit }) => {
      if (!orgId) return [];
      const params = new URLSearchParams({ orgId });
      if (limit) params.set('limit', String(limit));
      const response = await fetchJson(`/api/forensics/events?${params.toString()}`);
      return response.ok ? response.data.events || [] : [];
    },
    requests: {
      list: async ({ orgId, status }) => {
        if (!orgId) return [];
        const params = new URLSearchParams({ orgId });
        if (status) params.set('status', status);
        const response = await fetchJson(`/api/forensics/requests?${params.toString()}`);
        return response.ok ? response.data.requests || [] : [];
      },
      create: async ({ orgId, ownerEmail, requesterEmail, filename, fileHash }) => {
        const response = await fetchJson('/api/forensics/requests', {
          method: 'POST',
          body: JSON.stringify({ orgId, ownerEmail, requesterEmail, filename, fileHash }),
        });
        return response.ok ? response.data.request : null;
      },
      update: async ({ id, status, approvedBy }) => {
        const response = await fetchJson('/api/forensics/requests', {
          method: 'PUT',
          body: JSON.stringify({ id, status, approvedBy }),
        });
        return response.ok ? response.data.request : null;
      },
    },
  },
  Audit: {
    log: async ({ orgId, actorEmail, action, metadata, severity, source }) => {
      const response = await fetchJson('/api/audit/events', {
        method: 'POST',
        body: JSON.stringify({ orgId, actorEmail, action, metadata, severity, source }),
      });
      return response.ok ? response.data.event : null;
    },
    events: async ({ orgId, limit }) => {
      if (!orgId) return [];
      const params = new URLSearchParams({ orgId });
      if (limit) params.set('limit', String(limit));
      const response = await fetchJson(`/api/audit/events?${params.toString()}`);
      return response.ok ? response.data.events || [] : [];
    },
  },
  Vault: {
    listDocuments: async ({ orgId }) => {
      if (!orgId) return [];
      const params = new URLSearchParams({ orgId });
      const response = await fetchJson(`/api/vault/documents?${params.toString()}`);
      return response.ok ? response.data.documents || [] : [];
    },
    createDocument: async ({ orgId, ownerEmail, filename, mimeType, size, contentBase64, createdByEmail }) => {
      const response = await fetchJson('/api/vault/documents', {
        method: 'POST',
        body: JSON.stringify({ orgId, ownerEmail, filename, mimeType, size, contentBase64, createdByEmail }),
      });
      return response.ok ? response.data.document : null;
    },
    updateDocument: async ({ id, orgId, updates }) => {
      const response = await fetchJson('/api/vault/documents', {
        method: 'PUT',
        body: JSON.stringify({ id, orgId, updates }),
      });
      return response.ok ? response.data.document : null;
    },
  },
  Pentest: {
    run: async ({ target }) => {
      return {
        target: target || 'internet-facing assets',
        startedAt: new Date().toISOString(),
        coverage: ['Web', 'API', 'Cloud', 'Identity', 'Supply Chain'],
        attackPaths: 12,
        exploitabilityScore: 8.9,
        killChain: [
          { stage: 'Recon', status: 'complete' },
          { stage: 'Initial Access', status: 'complete' },
          { stage: 'Privilege Escalation', status: 'active' },
          { stage: 'Lateral Movement', status: 'queued' },
          { stage: 'Impact', status: 'queued' },
        ],
        highlights: [
          'Privilege escalation possible via misconfigured IAM roles.',
          'OAuth refresh tokens exposed in logs for 2 services.',
          'Critical API rate limits missing on auth endpoints.',
        ],
        recommendedActions: [
          'Lock down IAM role trust policies and rotate access keys.',
          'Sanitize auth logs and invalidate leaked tokens.',
          'Enable adaptive rate limiting + MFA for privileged accounts.',
        ],
      };
    },
  },
  External: {
    status: async () => {
      if (typeof window === 'undefined') return [];
      try {
        const response = await fetch('/api/integrations/status');
        if (!response.ok) throw new Error('Status failed');
        return await response.json();
      } catch (err) {
        return [];
      }
    },
    query: async ({ provider, path, params = {} }) => {
      if (typeof window === 'undefined') return { ok: false, error: 'Client only' };
      const search = new URLSearchParams({ provider, path, ...params }).toString();
      const response = await fetch(`/api/integrations/query?${search}`);
      return response.json();
    },
  },
  ThreatIntelAI: {
    query: async ({ query }) => {
      const response = await fetchJson('/api/threatIntel/ai', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      return response.ok ? response.data.result : null;
    },
    status: async () => {
      const response = await fetchJson('/api/ai/status');
      return response.ok ? response.data : { ok: false, geminiConfigured: false, model: '' };
    },
  },
};

export const ironroot = {
  entities,
  auth,
  users,
  integrations,
};
