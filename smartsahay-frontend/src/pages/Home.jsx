import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHealth } from '../services/api';
import './Home.css';

const FEATURES = [
  { icon: '🔍', title: 'Browse Schemes',  desc: 'Explore 17 Central & Karnataka agricultural schemes with full details, benefits, documents and application steps.', to: '/schemes' },
  { icon: '✅', title: 'Check Eligibility', desc: 'Enter your land, income, age, state and crop to instantly know which schemes you qualify for — and why.', to: '/eligibility' },
  { icon: '🌐', title: 'Multilingual',      desc: 'Read scheme names and descriptions in English, Hindi or Kannada.', to: '/schemes' },
  { icon: '🛡️', title: 'Admin Portal',      desc: 'Authorised officials can add, update or deactivate schemes through a secure token-protected admin panel.', to: '/admin/login' },
];

const CATEGORIES = [
  'Financial Assistance', 'Crop Insurance', 'Agricultural Credit',
  'Irrigation Subsidy', 'Equipment Subsidy', 'Organic Farming',
  'Renewable Energy', 'Natural Farming',
];

export default function Home() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'UNKNOWN' }));
  }, []);

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">Digital Farmer Assistance System</span>
          <h1 className="hero-title">Find the right government scheme for your farm</h1>
          <p className="hero-sub">
            SmartSahay aggregates 17 Central and Karnataka agricultural schemes and helps
            farmers discover what they're entitled to — in seconds.
          </p>
          <div className="hero-cta">
            <Link to="/eligibility" className="btn btn-primary">Check My Eligibility</Link>
            <Link to="/schemes"     className="btn btn-secondary">Browse All Schemes</Link>
          </div>

          {health && (
            <p className={`api-status ${health.status === 'UP' ? 'up' : 'down'}`}>
              {health.status === 'UP'
                ? `✔ API connected · ${health.schemesCount} schemes loaded`
                : '⚠ API unavailable — showing cached data'}
            </p>
          )}
        </div>
        <div className="hero-art" aria-hidden="true">🌾</div>
      </section>

      {/* ── Features ── */}
      <section className="section">
        <h2 className="section-title">What SmartSahay does</h2>
        <div className="features-grid">
          {FEATURES.map(f => (
            <Link to={f.to} key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section section-alt">
        <h2 className="section-title">Scheme categories covered</h2>
        <div className="category-chips">
          {CATEGORIES.map(c => (
            <Link key={c} to={`/schemes?category=${encodeURIComponent(c)}`} className="chip">{c}</Link>
          ))}
        </div>
      </section>

      {/* ── Eligibility CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to find your schemes?</h2>
          <p>Enter a few details about your farm and get a personalised eligibility report instantly.</p>
          <Link to="/eligibility" className="btn btn-primary btn-large">Get Started →</Link>
        </div>
      </section>
    </div>
  );
}
