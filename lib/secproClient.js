const STORE_KEY = 'secpro:store:v1';
const USER_KEY = 'secpro:user';

const memoryStore = { data: {}, user: null };

const seedData = {
  TrialRequest: [
    {
      id: 'tr_1001',
      fullName: 'Jordan Reese',
      companyName: 'Northwind Capital',
      email: 'jordan@northwind.com',
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
    },
    {
      id: 'scan_4002',
      scanType: 'DAST',
      target: 'api-gateway',
      status: 'completed',
      severity: 'medium',
      findingsCount: 6,
      created_date: new Date(Date.now() - 28 * 3600000).toISOString(),
    },
  ],
  Notification: [
    {
      id: 'notif_5001',
      title: 'Critical auth bypass fixed',
      message: 'Auto-remediation applied to auth-service and regression tests passed.',
      isRead: false,
      created_date: new Date(Date.now() - 3600000).toISOString(),
      userEmail: 'btuyisenge40@gmail.com',
    },
  ],
  AdminNote: [
    {
      id: 'note_6001',
      title: 'Q1 launch checklist',
      content: 'Finalize SOC2 mapping, confirm red-team schedule, update board report templates.',
      priority: 'high',
      created_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
  ],
  ActivityLog: [
    {
      id: 'log_7001',
      userEmail: 'btuyisenge40@gmail.com',
      action: 'trial_approved',
      details: { requestId: 'tr_1001' },
      timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ],
  User: [
    {
      id: 'user_8001',
      fullName: 'Demo Admin',
      email: 'btuyisenge40@gmail.com',
      role: 'admin',
      created_date: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ],
  ScheduledScan: [
    {
      id: 'sched_9001',
      name: 'Weekly API gateway scan',
      target: 'https://api.secpro.ai',
      cadence: 'weekly',
      userEmail: 'btuyisenge40@gmail.com',
      created_date: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
  ],
};

const isBrowser = () => typeof window !== 'undefined';

const loadStore = () => {
  if (isBrowser() && window.localStorage) {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    const seeded = JSON.parse(JSON.stringify(seedData));
    window.localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
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

const getUser = () => {
  if (isBrowser() && window.localStorage) {
    const raw = window.localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
    const defaultUser = {
      id: 'user_8001',
      fullName: 'SecPro Owner',
      email: 'btuyisenge40@gmail.com',
      role: 'admin',
    };
    window.localStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  }
  if (!memoryStore.user) {
    memoryStore.user = {
      id: 'user_8001',
      fullName: 'SecPro Owner',
      email: 'btuyisenge40@gmail.com',
      role: 'admin',
    };
  }
  return memoryStore.user;
};

const uuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
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

const entityApi = (entityName) => ({
  list: async (sortKey, limit) => {
    const store = loadStore();
    const items = store[entityName] || [];
    const sorted = sortData(items, sortKey);
    return limit ? sorted.slice(0, limit) : sorted;
  },
  filter: async (filter, sortKey, limit) => {
    const store = loadStore();
    const items = store[entityName] || [];
    const filtered = filterData(items, filter);
    const sorted = sortData(filtered, sortKey);
    return limit ? sorted.slice(0, limit) : sorted;
  },
  create: async (data) => {
    const store = loadStore();
    const record = {
      id: uuid(),
      created_date: new Date().toISOString(),
      ...data,
    };
    store[entityName] = [...(store[entityName] || []), record];
    saveStore(store);
    return record;
  },
  update: async (id, updates) => {
    const store = loadStore();
    const items = store[entityName] || [];
    const next = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    store[entityName] = next;
    saveStore(store);
    return next.find((item) => item.id === id);
  },
  delete: async (id) => {
    const store = loadStore();
    store[entityName] = (store[entityName] || []).filter((item) => item.id !== id);
    saveStore(store);
    return { id };
  },
});

const entities = {
  TrialRequest: entityApi('TrialRequest'),
  Lead: entityApi('Lead'),
  Visitor: entityApi('Visitor'),
  ScanHistory: entityApi('ScanHistory'),
  Notification: entityApi('Notification'),
  AdminNote: entityApi('AdminNote'),
  ActivityLog: entityApi('ActivityLog'),
  User: entityApi('User'),
  ScheduledScan: entityApi('ScheduledScan'),
};

const auth = {
  me: async () => getUser(),
  logout: async () => {
    if (isBrowser() && window.localStorage) {
      window.localStorage.removeItem(USER_KEY);
      window.location.href = '/';
    }
  },
};

const users = {
  inviteUser: async (email, role = 'user') => {
    const store = loadStore();
    const existing = (store.User || []).find((u) => u.email === email);
    if (existing) return existing;
    const newUser = {
      id: uuid(),
      fullName: email.split('@')[0],
      email,
      role,
      created_date: new Date().toISOString(),
    };
    store.User = [...(store.User || []), newUser];
    saveStore(store);
    return newUser;
  },
};

const mockLLM = (prompt) => {
  if (!prompt) {
    return 'SecBot is ready. Ask about risk posture, scanning coverage, or compliance insights.';
  }
  if (prompt.toLowerCase().includes('vulnerability')) {
    return 'Top risks detected: authentication bypass, secrets exposure, and insufficient rate limiting. Recommended: rotate keys, add authz checks, and deploy WAF rules for critical endpoints.';
  }
  return 'Here’s a focused security response: prioritize high-risk findings, verify exploitability, and schedule automated retests. Want a deeper breakdown or remediation plan?';
};

const integrations = {
  Core: {
    InvokeLLM: async ({ prompt }) => mockLLM(prompt),
    UploadFile: async ({ file }) => {
      if (isBrowser() && file) {
        return { file_url: URL.createObjectURL(file) };
      }
      return { file_url: '' };
    },
    SendEmail: async () => ({ status: 'queued' }),
  },
};

export const secpro = {
  entities,
  auth,
  users,
  integrations,
};
