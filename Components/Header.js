import React from 'react';
import Logo from './Logo';
import { createPageUrl } from '../utils';

const NavItem = ({ children, href }) => (
  <a
    href={href}
    className="nav__link"
  >
    {children}
  </a>
);

export default function Header() {
  const navLinks = [
    { name: 'Home', href: createPageUrl('Home'), isPage: true },
    { name: 'Scanner', href: createPageUrl('CodeScanner'), isPage: true },
    { name: 'Threat Intel', href: createPageUrl('ThreatIntelligence'), isPage: true },
    { name: 'Auto-Fix', href: createPageUrl('AutoRemediation'), isPage: true },
    { name: 'Training', href: createPageUrl('SecurityTraining'), isPage: true },
    { name: 'Reports', href: createPageUrl('ReportCenter'), isPage: true },
    { name: 'Contact', href: `${createPageUrl('Home')}#contact` },
  ];

  return (
    <header className="header">
      <div className="container header__inner">
        <a href={createPageUrl('Home')} className="brand">
          <Logo className="brand__logo" />
          <span>SecPro</span>
        </a>
        <nav className="nav">
          {navLinks.map((link) => (
            <NavItem key={link.name} href={link.href}>
              {link.name}
            </NavItem>
          ))}
        </nav>
        <a href={`${createPageUrl('Home')}#trial`} className="btn btn--primary">Start Free Trial</a>
      </div>
    </header>
  );
}
