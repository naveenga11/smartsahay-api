import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getScheme } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './SchemeDetail.css';

const LANGS = [
  { value: 'en', label: 'English' },
  { value: 'kn', label: 'ಕನ್ನಡ' },
  { value: 'hi', label: 'हिंदी' },
];

const LEVEL_BADGE = { Central: 'badge-blue', State: 'badge-orange' };
const MODE_ICON   = { Online: '🌐', Offline: '🏢', Both: '🌐🏢' };

export default function SchemeDetail() {
  const { slug } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(null);
  const [lang, setLang]     = useState('en');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  async function load(l) {
    setLoading(true);
    setError(null);
    try {
      const data = await getScheme(slug, l);
      setScheme(data);
    } catch (e) {
      setError(e.status === 404 ? 'Scheme not found.' : e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(lang); }, [slug, lang]); // eslint-disable-line

  if (loading) return <LoadingSpinner text="Loading scheme…" />;
  if (error)   return (
    <div className="detail-page">
      <ErrorMessage message={error} onRetry={() => load(lang)} />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/schemes" className="back-link">← Back to schemes</Link>
      </div>
    </div>
  );

  return (
    <div className="detail-page">
      {/* ── Breadcrumb ── */}
      <nav className="breadcrumb" aria-label="breadcrumb">
        <Link to="/schemes">Schemes</Link>
        <span aria-hidden="true">›</span>
        <span>{scheme.name}</span>
      </nav>

      {/* ── Header ── */}
      <div className="detail-header">
        <div className="detail-badges">
          <span className={`badge ${LEVEL_BADGE[scheme.level] || 'badge-blue'}`}>{scheme.level}</span>
          <span className="badge badge-gray">{scheme.state}</span>
          <span className="badge badge-green">{scheme.category}</span>
        </div>

        <div className="detail-title-row">
          <h1 className="detail-title">{scheme.name}</h1>

          <div className="lang-toggle">
            {LANGS.map(l => (
              <button
                key={l.value}
                className={`lang-btn ${lang === l.value ? 'active' : ''}`}
                onClick={() => setLang(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <p className="detail-desc">{scheme.description}</p>

        {/* ── Meta cards ── */}
        <div className="meta-grid">
          <MetaItem icon="🌐" label="Application mode" value={`${MODE_ICON[scheme.applicationMode]} ${scheme.applicationMode}`} />
          {scheme.whereToApply  && <MetaItem icon="📍" label="Where to apply"   value={scheme.whereToApply} />}
          {scheme.lastDate      && <MetaItem icon="📅" label="Deadline"          value={scheme.lastDate} />}
          {scheme.contactInfo   && <MetaItem icon="📞" label="Contact"            value={scheme.contactInfo} />}
          {scheme.lastVerified  && <MetaItem icon="✔"  label="Last verified"     value={scheme.lastVerified} />}
        </div>

        <div className="detail-actions">
          {scheme.officialLink && (
            <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary-green">
              Apply on official portal ↗
            </a>
          )}
          <Link to="/eligibility" className="btn btn-outline-green">Check my eligibility</Link>
          {isAdmin && (
            <button className="btn btn-outline-admin" onClick={() => navigate(`/admin/schemes/${slug}/edit`)}>
              ✏ Edit scheme
            </button>
          )}
        </div>
      </div>

      {/* ── Detail sections ── */}
      <div className="detail-body">
        <DetailSection title="Benefits" icon="🎁" items={scheme.benefits} />
        <DetailSection title="Eligibility criteria" icon="✅" items={scheme.eligibility} />
        <DetailSection title="Required documents" icon="📄" items={scheme.documents} />
        <DetailSection title="How to apply" icon="🪜" items={scheme.steps} ordered />
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="meta-item">
      <span className="meta-icon">{icon}</span>
      <div>
        <p className="meta-label">{label}</p>
        <p className="meta-value">{value}</p>
      </div>
    </div>
  );
}

function DetailSection({ title, icon, items, ordered = false }) {
  if (!items || items.length === 0) return null;
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <section className="detail-section">
      <h2 className="detail-section-title">{icon} {title}</h2>
      <Tag className={`detail-list ${ordered ? 'ordered' : ''}`}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </Tag>
    </section>
  );
}
