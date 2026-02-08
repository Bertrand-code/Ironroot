import React from 'react';
import Logo from './Logo';
import { createPageUrl } from '../utils';
import { useAuth } from '@/lib/useAuth';
import { ironroot } from '@/lib/ironrootClient';

const NavItem = ({ children, href }) => (
  <a
    href={href}
    className="nav__link"
  >
    {children}
  </a>
);

export default function Header() {
  const { user, org } = useAuth();
  const isAuthed = user && user.role !== 'guest';
  const isOwner = user?.role === 'owner';

  const navGroups = [
    {
      label: 'Explore',
      links: [
        { name: 'Home', href: createPageUrl('Home'), isPage: true },
        { name: 'Platform', href: createPageUrl('Platform'), isPage: true },
        { name: 'Careers', href: createPageUrl('Careers'), isPage: true },
        { name: 'Contact', href: `${createPageUrl('Home')}#contact` },
      ],
    },
    {
      label: 'Detect',
      links: [
        { name: 'Scanner', href: createPageUrl('CodeScanner'), isPage: true },
        { name: 'Threat Intel', href: createPageUrl('ThreatIntelligence'), isPage: true },
        { name: 'AI Pentest', href: createPageUrl('OffensiveDashboard'), isPage: true },
        { name: 'API Security', href: createPageUrl('ApiSecurity'), isPage: true },
      ],
    },
    {
      label: 'Protect',
      links: [
        { name: 'Auto-Fix', href: createPageUrl('AutoRemediation'), isPage: true },
        { name: 'Vault', href: createPageUrl('DocumentVault'), isPage: true, gated: true },
        { name: 'Assets', href: createPageUrl('AssetInventory'), isPage: true, gated: true },
        { name: 'Risk Register', href: createPageUrl('RiskRegister'), isPage: true, gated: true },
        { name: 'Training', href: createPageUrl('SecurityTraining'), isPage: true, gated: true },
      ],
    },
    {
      label: 'Respond',
      links: [
        { name: 'Reports', href: createPageUrl('ReportCenter'), isPage: true },
        { name: 'Defense Ops', href: createPageUrl('DefensiveDashboard'), isPage: true },
        { name: 'AI Assistant', href: createPageUrl('AiAssistant'), isPage: true },
      ],
    },
    {
      label: 'Admin',
      links: [
        { name: 'Control Center', href: createPageUrl('ControlCenter'), isPage: true, ownerOnly: true },
        { name: 'User Mgmt', href: createPageUrl('UserManagement'), isPage: true, gated: true },
        { name: 'Admin Dash', href: createPageUrl('AdminDashboard'), isPage: true, gated: true },
      ],
    },
  ];

  return (
    <header className="header">
      <div className="container header__inner">
        <a href={createPageUrl('Home')} className="brand">
          <Logo className="brand__logo" />
          <span>Ironroot</span>
        </a>
        <nav className="nav nav--grouped">
          {navGroups.map((group) => (
            <div key={group.label} className="nav__group">
              <span className="nav__group-title">{group.label}</span>
              <div className="nav__group-links">
                {group.links
                  .filter((link) => {
                    if (link.ownerOnly && !isOwner) return false;
                    if (link.gated && !isAuthed) return false;
                    return true;
                  })
                  .map((link) => (
                    <NavItem key={link.name} href={link.href}>
                      {link.name}
                    </NavItem>
                  ))}
              </div>
            </div>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {org && isAuthed && (
            <>
              <span className="card__meta">{org.name}</span>
              {isOwner && <span className="badge">Owner</span>}
            </>
          )}
          {isAuthed ? (
            <button className="btn btn--ghost" onClick={() => ironroot.auth.logout()}>
              Log out
            </button>
          ) : (
            <a className="btn btn--ghost" href="/login">Log in</a>
          )}
          <a href={`${createPageUrl('Home')}#trial`} className="btn btn--primary">Start Free Trial</a>
        </div>
      </div>
    </header>
  );
}
