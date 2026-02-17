import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Radar, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__layout">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="eyebrow">Real-Time Security Command</span>
          <h1 className="title-xl">
            Defend every release with AI-driven security that moves at your pace.
          </h1>
          <p className="text-lead">
            Ironroot unifies code scanning, offensive testing, GRC compliance, and
            board-ready reporting into a single intelligence layer. Replace point
            tools with a security operating system built for enterprise velocity.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
            <a className="btn btn--primary btn--lg" href="#trial">
              Start Free Trial <ArrowRight size={18} />
            </a>
            <Link className="btn btn--ghost btn--lg" href="/codeScanner">
              View Live Demo
            </Link>
          </div>
          <div className="stat-grid" style={{ marginTop: '32px' }}>
            <div className="stat">
              <div className="stat__value">92%</div>
              <div className="card__meta">Reduction in mean time to detect</div>
            </div>
            <div className="stat">
              <div className="stat__value">48 hrs</div>
              <div className="card__meta">Average remediation turnaround</div>
            </div>
            <div className="stat">
              <div className="stat__value">15+</div>
              <div className="card__meta">Compliance frameworks automated</div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="hero__card"
        >
          <div className="badge">Threat Pulse</div>
          <h3 className="card__title" style={{ marginTop: '12px' }}>
            Live posture across cloud, API, and code.
          </h3>
          <p className="card__meta">
            Prioritize risks by business impact and automate response playbooks.
          </p>
          <div className="grid" style={{ marginTop: '20px' }}>
            <div className="card card--glass">
              <ShieldCheck size={20} />
              <strong style={{ display: 'block', marginTop: '8px' }}>Adaptive Controls</strong>
              <span className="card__meta">Policies tuned per environment.</span>
            </div>
            <div className="card card--glass">
              <Radar size={20} />
              <strong style={{ display: 'block', marginTop: '8px' }}>Signal Fusion</strong>
              <span className="card__meta">AI scoring across telemetry.</span>
            </div>
            <div className="card card--glass">
              <Zap size={20} />
              <strong style={{ display: 'block', marginTop: '8px' }}>Auto-Remediate</strong>
              <span className="card__meta">Push fixes in minutes.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
