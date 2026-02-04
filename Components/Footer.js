import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="grid grid-3">
          <div>
            <a href="#" className="brand">
              <Logo className="brand__logo" />
              <span>SecPro</span>
            </a>
            <p className="text-lead" style={{ marginTop: '12px' }}>
              Enterprise security that unifies AI scanning, offensive testing, and GRC intelligence.
            </p>
            <p className="card__meta" style={{ marginTop: '12px' }}>
              &copy; {new Date().getFullYear()} SecPro. All Rights Reserved.
            </p>
          </div>
          
          <div>
            <h3 className="card__title">Contact Information</h3>
            <div className="grid" style={{ gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin className="brand__logo" size={16} />
                <div className="card__meta">
                  <div>622 Rainier Ave S</div>
                  <div>Seattle, WA 98144</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone className="brand__logo" size={16} />
                <span className="card__meta">(206) 555-0199</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail className="brand__logo" size={16} />
                <span className="card__meta">contact@secpro.com</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="card__title">Services</h3>
            <ul className="grid" style={{ gap: '10px' }}>
              <li><a className="nav__link" href="#platform">AI Security</a></li>
              <li><a className="nav__link" href="#codescanning">Code Scanning</a></li>
              <li><a className="nav__link" href="#api">API Security</a></li>
              <li><a className="nav__link" href="#grc">GRC & Compliance</a></li>
              <li><a className="nav__link" href="#services">Offensive Security</a></li>
              <li><a className="nav__link" href="#services">Defensive Security</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
