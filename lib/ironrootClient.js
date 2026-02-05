const STORE_VERSION = 2;
const STORE_KEY = 'ironroot:store:v2';
const SESSION_KEY = 'ironroot:session';
const LOGIN_ATTEMPTS_KEY = 'ironroot:loginAttempts';
const SESSION_TTL_MS = 1000 * 60 * 45; // 45 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 1000 * 60 * 10; // 10 minutes

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
      created_date: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      id: 'org_002',
      name: 'Northwind Capital',
      slug: 'northwind',
      industry: 'Financial Services',
      size: '201-1000',
      plan: 'trial',
      created_date: new Date(Date.now() - 120 * 86400000).toISOString(),
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
      return parsed;
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

const touchSession = () => {
  const session = getSession();
  if (!session) return;
  const next = { ...session, expiresAt: Date.now() + SESSION_TTL_MS };
  setSession(next);
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
  if (user?.role === 'admin') return items;
  if (!user?.orgId) return items;
  return items.filter((item) => !item.orgId || item.orgId === user.orgId);
};

const entityPermissions = {
  Organization: { read: ['admin'], create: ['admin'], update: ['admin'], delete: ['admin'] },
  User: { read: ['admin'], create: ['admin'], update: ['admin'], delete: ['admin'] },
  AdminNote: { read: ['admin'], create: ['admin'], update: ['admin'], delete: ['admin'] },
  ActivityLog: { read: ['admin'], create: ['admin'], update: ['admin'], delete: ['admin'] },
  Visitor: { read: ['admin'], create: ['admin'], update: ['admin'], delete: ['admin'] },
  Lead: { read: ['admin'], create: ['admin', 'user', 'guest'], update: ['admin'], delete: ['admin'] },
  TrialRequest: { read: ['admin', 'user'], create: ['admin', 'user', 'guest'], update: ['admin'], delete: ['admin'], ownerField: 'email' },
  Notification: { read: ['admin', 'user'], create: ['admin'], update: ['admin', 'user'], delete: ['admin', 'user'], ownerField: 'userEmail' },
  ScanHistory: { read: ['admin', 'user'], create: ['admin', 'user'], update: ['admin'], delete: ['admin'], ownerField: 'scannedBy' },
  ScheduledScan: { read: ['admin', 'user'], create: ['admin', 'user'], update: ['admin', 'user'], delete: ['admin'], ownerField: 'userEmail' },
  AdminRequest: { read: ['admin'], create: ['admin', 'user', 'guest'], update: ['admin'], delete: ['admin'] },
  default: { read: ['admin', 'user'], create: ['admin', 'user'], update: ['admin'], delete: ['admin'] },
};

const canPerform = (entityName, action, record) => {
  const user = getUser();
  const rules = entityPermissions[entityName] || entityPermissions.default;
  const allowed = rules[action] || [];
  if (!allowed.includes(user?.role)) return false;
  if (rules.ownerField && record && user?.role !== 'admin') {
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
    return !(store.User || []).some((u) => u.role === 'admin' && u.passwordHash);
  },
  bootstrapAdmin: async ({ email, password, orgName, plan = 'paid' }) => {
    validatePassword(password);
    const store = loadStore();
    if ((store.User || []).some((u) => u.role === 'admin' && u.passwordHash)) {
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
      created_date: new Date().toISOString(),
    };
    const adminUser = {
      id: uuid(),
      fullName: 'Org Owner',
      email,
      role: 'admin',
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
    setSession({ userId: adminUser.id, expiresAt: Date.now() + SESSION_TTL_MS });
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
    setSession({ userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS });
    return user;
  },
  logout: async () => {
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
  touchSession,
  currentOrg: async () => {
    const store = loadStore();
    const user = getUser();
    return (store.Organization || []).find((org) => org.id === user.orgId) || null;
  },
  requireRole: (user, roles = []) => {
    if (!user) return false;
    if (!roles.length) return user.role !== 'guest';
    return roles.includes(user.role);
  },
};

const users = {
  inviteUser: async (email, role = 'user', orgId = null) => {
    const store = loadStore();
    const existing = (store.User || []).find((u) => u.email === email);
    if (existing) return existing;
    const currentUser = getUser();
    const newUser = {
      id: uuid(),
      fullName: email.split('@')[0],
      email,
      role,
      orgId: orgId || currentUser?.orgId || null,
      created_date: new Date().toISOString(),
    };
    store.User = [...(store.User || []), newUser];
    saveStore(store);
    return newUser;
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
    const request = {
      id: uuid(),
      email,
      reason: reason || 'Requesting admin access.',
      status: 'pending',
      created_date: new Date().toISOString(),
      orgId: null,
    };
    store.AdminRequest = [...(store.AdminRequest || []), request];
    const admins = (store.User || []).filter((u) => u.role === 'admin');
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

const createRateLimiter = ({ limit, windowMs }) => {
  let count = 0;
  let windowStart = Date.now();
  return {
    allow: () => {
      const now = Date.now();
      if (now - windowStart > windowMs) {
        windowStart = now;
        count = 0;
      }
      if (count >= limit) return false;
      count += 1;
      return true;
    },
  };
};

const llmLimiter = createRateLimiter({ limit: 30, windowMs: 60000 });

const mockLLM = (prompt) => {
  if (!prompt) {
    return 'Ironroot Sentinel is ready. Ask about risk posture, scanning coverage, or compliance insights.';
  }
  const text = prompt.toLowerCase();
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
  if (text.includes('report') || text.includes('pdf') || text.includes('export')) {
    return 'Threat Intel reports can be exported from the report view with a PDF-style layout for executive and SOC audiences.';
  }
  if (text.includes('pentest') || text.includes('offensive')) {
    return 'Our AI pentest service runs continuous adversary simulations, validates exploitability, and maps blast radius across cloud, API, and app layers.';
  }
  return 'Here’s a focused security response: prioritize high-risk findings, verify exploitability, and schedule automated retests. Want a deeper breakdown or remediation plan?';
};

const externalIntegrations = {
  shodan: { label: 'Shodan', category: 'Attack Surface', enabled: !!process.env.NEXT_PUBLIC_SHODAN_KEY },
  censys: { label: 'Censys', category: 'Attack Surface', enabled: !!process.env.NEXT_PUBLIC_CENSYS_ID },
  virustotal: { label: 'VirusTotal', category: 'Malware & IOC', enabled: !!process.env.NEXT_PUBLIC_VT_KEY },
  otx: { label: 'AlienVault OTX', category: 'Threat Intel', enabled: !!process.env.NEXT_PUBLIC_OTX_KEY },
  securitytrails: { label: 'SecurityTrails', category: 'DNS & ASM', enabled: !!process.env.NEXT_PUBLIC_SECURITYTRAILS_KEY },
  binaryedge: { label: 'BinaryEdge', category: 'Attack Surface', enabled: !!process.env.NEXT_PUBLIC_BINARYEDGE_KEY },
  exploitdb: { label: 'Exploit DB', category: 'Exploit Intel', enabled: true },
  nvd: { label: 'NVD CVE Feed', category: 'CVE Intelligence', enabled: true },
  github: { label: 'GitHub', category: 'Repo Intel', enabled: !!process.env.NEXT_PUBLIC_GITHUB_TOKEN },
  semgrep: { label: 'Semgrep Cloud', category: 'SAST', enabled: !!process.env.NEXT_PUBLIC_SEMGREP_TOKEN },
  snyk: { label: 'Snyk', category: 'SCA', enabled: !!process.env.NEXT_PUBLIC_SNYK_TOKEN },
};

const integrations = {
  Core: {
    InvokeLLM: async ({ prompt }) => {
      if (!llmLimiter.allow()) {
        throw new Error('Rate limit exceeded. Try again shortly.');
      }
      return mockLLM(prompt);
    },
    UploadFile: async ({ file }) => {
      if (isBrowser() && file) {
        return { file_url: URL.createObjectURL(file) };
      }
      return { file_url: '' };
    },
    SendEmail: async () => ({ status: 'queued' }),
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
    status: () => Object.entries(externalIntegrations).map(([id, item]) => ({ id, ...item })),
  },
};

export const ironroot = {
  entities,
  auth,
  users,
  integrations,
};
