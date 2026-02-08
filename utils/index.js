const pageMap = {
  Home: '/',
  CodeScanner: '/codeScanner',
  ThreatIntelligence: '/threatIntelligence',
  AutoRemediation: '/autoRemediation',
  ReportCenter: '/reportCenter',
  SecurityTraining: '/secTraining',
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
  AssetInventory: '/assetInventory',
  RiskRegister: '/riskRegister',
  ControlCenter: '/controlCenter',
  DocumentVault: '/documentVault',
  Platform: '/platform',
  Careers: '/careers',
};

export const createPageUrl = (pageName) => {
  if (!pageName) return '/';
  return pageMap[pageName] || `/${pageName.charAt(0).toLowerCase()}${pageName.slice(1)}`;
};
