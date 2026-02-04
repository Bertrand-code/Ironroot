import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main>{children}</main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}
