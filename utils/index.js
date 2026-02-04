const pageMap = {
  Home: '/',
  CodeScanner: '/codeScanner',
  ThreatIntelligence: '/threatIntelligence',
  AutoRemediation: '/autoRemediation',
  SecurityTraining: '/secTraining',
  ReportCenter: '/reportCenter',
  CourseLab: '/courseLab',
  AdminDashboard: '/adminDashboard',
  AdminNotepad: '/adminNotepad',
  UserManagement: '/userManagement',
  ApiSecurity: '/apiSecurity',
  SecDocumentation: '/secDocumentation',
  CiCdIntegration: '/CiCdIntegration',
  DefensiveDashboard: '/defensiveDashboard',
  OffensiveDashboard: '/offensiveDashboard',
  AiAssistant: '/aiAssistant',
};

export const createPageUrl = (pageName) => {
  if (!pageName) return '/';
  return pageMap[pageName] || `/${pageName.charAt(0).toLowerCase()}${pageName.slice(1)}`;
};
