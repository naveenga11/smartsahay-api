import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSchemes } from '../services/api';
import SchemeCard from '../components/SchemeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './Schemes.css';

const CATEGORIES = [
  'Financial Assistance', 'Crop Insurance', 'Agricultural Credit',
  'Irrigation Subsidy', 'Equipment Subsidy', 'Organic Farming',
  'Renewable Energy', 'Sustainable Farming', 'Agricultural Extension',
  'Natural Farming', 'Education', 'Crop Promotion',
  'Irrigation and Infrastructure', 'Irrigation',
  'Agricultural Infrastructure & Promotion',
];

const STATES  = ['All India', 'Karnataka'];
const LEVELS  = ['Central', 'State'];
const LANGS   = [{ value: 'en', label: 'English' }, { value: 'kn', label: 'ಕನ್ನಡ' }, { value: 'hi', label: 'हिंदी' }];

export default function Schemes() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    state:    searchParams.get('state')    || '',
    level:    searchParams.get('level')    || '',
    lang:     searchParams.get('lang')     || 'en',
  });

  const [schemes, setSchemes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');

  const fetchSchemes = useCallback(async (f) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchemes(f);
      setSchemes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchemes(filters);
    // sync URL
    const p = {};
    if (filters.category) p.category = filters.category;
    if (filters.state)    p.state    = filters.state;
    if (filters.level)    p.level    = filters.level;
    if (filters.lang && filters.lang !== 'en') p.lang = filters.lang;
    setSearchParams(p, { replace: true });
  }, [filters, fetchSchemes, setSearchParams]);

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({ category: '', state: '', level: '', lang: 'en' });
    setSearch('');
  }

  const displayed = schemes.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const activeFilterCount = [filters.category, filters.state, filters.level]
    .filter(Boolean).length;

  return (
    <div className="schemes-page">
      <div className="schemes-header">
        <div>
          <h1>Agricultural Schemes</h1>
          <p className="schemes-sub">
            {loading ? 'Loading…' : `${schemes.length} scheme${schemes.length !== 1 ? 's' : ''} found`}
            {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
          </p>
        </div>

        {/* Language toggle */}
        <div className="lang-toggle">
          {LANGS.map(l => (
            <button
              key={l.value}
              className={`lang-btn ${filters.lang === l.value ? 'active' : ''}`}
              onClick={() => updateFilter('lang', l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters bar ── */}
      <div className="filters-bar">
        <input
          className="search-input"
          type="search"
          placeholder="Search schemes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search schemes"
        />

        <select value={filters.category} onChange={e => updateFilter('category', e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={filters.state} onChange={e => updateFilter('state', e.target.value)} aria-label="Filter by state">
          <option value="">All states</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={filters.level} onChange={e => updateFilter('level', e.target.value)} aria-label="Filter by level">
          <option value="">All levels</option>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        {(activeFilterCount > 0 || search) && (
          <button className="btn-clear" onClick={clearFilters}>✕ Clear</button>
        )}
      </div>

      {/* ── Results ── */}
      {loading && <LoadingSpinner text="Loading schemes…" />}
      {error   && <ErrorMessage message={error} onRetry={() => fetchSchemes(filters)} />}

      {!loading && !error && displayed.length === 0 && (
        <div className="empty-state">
          <p>🌾 No schemes match your filters.</p>
          <button className="btn-clear" onClick={clearFilters}>Clear filters</button>
        </div>
      )}

      {!loading && !error && displayed.length > 0 && (
        <div className="schemes-grid">
          {displayed.map(s => <SchemeCard key={s.slug} scheme={s} />)}
        </div>
      )}
    </div>
  );
}
