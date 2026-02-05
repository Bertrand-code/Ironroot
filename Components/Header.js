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
  const authedLinks = [];
  if (isAuthed) {
    authedLinks.push({ name: 'Assets', href: createPageUrl('AssetInventory'), isPage: true });
    authedLinks.push({ name: 'Risk Register', href: createPageUrl('RiskRegister'), isPage: true });
  }
  if (isOwner) {
    authedLinks.push({ name: 'Control Center', href: createPageUrl('ControlCenter'), isPage: true });
  }
  const navLinks = [
    { name: 'Home', href: createPageUrl('Home'), isPage: true },
    { name: 'Scanner', href: createPageUrl('CodeScanner'), isPage: true },
    { name: 'Threat Intel', href: createPageUrl('ThreatIntelligence'), isPage: true },
    { name: 'Auto-Fix', href: createPageUrl('AutoRemediation'), isPage: true },
    { name: 'Training', href: createPageUrl('SecurityTraining'), isPage: true },
    { name: 'Reports', href: createPageUrl('ReportCenter'), isPage: true },
    ...authedLinks,
    { name: 'Contact', href: `${createPageUrl('Home')}#contact` },
  ];

  return (
    <header className="header">
      <div className="container header__inner">
        <a href={createPageUrl('Home')} className="brand">
          <Logo className="brand__logo" />
          <span>Ironroot</span>
        </a>
        <nav className="nav">
          {navLinks.map((link) => (
            <NavItem key={link.name} href={link.href}>
              {link.name}
            </NavItem>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {org && isAuthed && <span className="card__meta">{org.name}</span>}
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
