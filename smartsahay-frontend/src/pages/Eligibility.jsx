import { useState } from 'react';
import { Link } from 'react-router-dom';
import { checkEligibility } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Eligibility.css';

const CATEGORIES = ['GENERAL', 'SC', 'ST', 'OBC', 'MINORITY'];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir',
  'Ladakh','Lakshadweep','Puducherry',
];

const INITIAL = {
  landHectares: '', landAcres: '', landUnit: 'hectares',
  annualIncome: '', age: '', state: '', category: '', crop: '',
};

export default function Eligibility() {
  const [form, setForm]       = useState(INITIAL);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState(null);

  function set(key, value) {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  }

  function validate() {
    const e = {};
    const land = parseFloat(form.landUnit === 'hectares' ? form.landHectares : form.landAcres);
    if (!form.landHectares && !form.landAcres) e.land = 'Enter your land size';
    else if (isNaN(land) || land < 0) e.land = 'Land must be a positive number';
    if (!form.annualIncome) e.annualIncome = 'Annual income is required';
    else if (isNaN(Number(form.annualIncome)) || Number(form.annualIncome) < 0) e.annualIncome = 'Enter a valid income';
    if (!form.age) e.age = 'Age is required';
    else if (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120) e.age = 'Age must be 1–120';
    if (!form.state) e.state = 'Select your state';
    if (!form.category) e.category = 'Select your category';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const body = {
      annualIncome: Number(form.annualIncome),
      age:          Number(form.age),
      state:        form.state,
      category:     form.category,
    };
    if (form.landUnit === 'hectares') body.landHectares = parseFloat(form.landHectares);
    else                              body.landAcres    = parseFloat(form.landAcres);
    if (form.crop.trim()) body.crop = form.crop.trim().toUpperCase();

    setLoading(true);
    setApiError(null);
    setResult(null);
    try {
      const data = await checkEligibility(body);
      setResult(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() { setForm(INITIAL); setResult(null); setErrors({}); setApiError(null); }

  return (
    <div className="elig-page">
      <div className="elig-container">
        {/* ── Form panel ── */}
        <div className="elig-form-panel">
          <h1 className="elig-title">Eligibility Checker</h1>
          <p className="elig-sub">Enter your details to see which agricultural schemes you qualify for.</p>

          <form onSubmit={handleSubmit} noValidate className="elig-form">
            {/* Land */}
            <fieldset className="form-group">
              <legend className="form-label">Land size <span className="required">*</span></legend>
              <div className="land-row">
                <div className="unit-toggle">
                  <button type="button" className={form.landUnit === 'hectares' ? 'active' : ''} onClick={() => set('landUnit', 'hectares')}>Hectares</button>
                  <button type="button" className={form.landUnit === 'acres'    ? 'active' : ''} onClick={() => set('landUnit', 'acres')}>Acres</button>
                </div>
                {form.landUnit === 'hectares' ? (
                  <input type="number" min="0" step="0.01" placeholder="e.g. 1.5" value={form.landHectares}
                    onChange={e => set('landHectares', e.target.value)} aria-label="Land in hectares" />
                ) : (
                  <input type="number" min="0" step="0.01" placeholder="e.g. 3.7" value={form.landAcres}
                    onChange={e => set('landAcres', e.target.value)} aria-label="Land in acres" />
                )}
              </div>
              {errors.land && <p className="field-error">{errors.land}</p>}
            </fieldset>

            {/* Income */}
            <div className="form-group">
              <label className="form-label" htmlFor="income">Annual income (₹) <span className="required">*</span></label>
              <input id="income" type="number" min="0" placeholder="e.g. 400000"
                value={form.annualIncome} onChange={e => set('annualIncome', e.target.value)} />
              {errors.annualIncome && <p className="field-error">{errors.annualIncome}</p>}
            </div>

            {/* Age */}
            <div className="form-group">
              <label className="form-label" htmlFor="age">Age <span className="required">*</span></label>
              <input id="age" type="number" min="1" max="120" placeholder="e.g. 35"
                value={form.age} onChange={e => set('age', e.target.value)} />
              {errors.age && <p className="field-error">{errors.age}</p>}
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label" htmlFor="state">State <span className="required">*</span></label>
              <select id="state" value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select your state…</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="field-error">{errors.state}</p>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="category">Social category <span className="required">*</span></label>
              <select id="category" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="field-error">{errors.category}</p>}
            </div>

            {/* Crop (optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="crop">Primary crop <span className="optional">(optional)</span></label>
              <input id="crop" type="text" placeholder="e.g. MILLET, WHEAT, RICE"
                value={form.crop} onChange={e => set('crop', e.target.value)} />
              <p className="field-hint">Needed only for crop-specific schemes like Siri Dhanya.</p>
            </div>

            {apiError && <p className="api-error-msg">⚠ {apiError}</p>}

            <div className="form-actions">
              <button type="submit" className="btn-check" disabled={loading}>
                {loading ? 'Checking…' : 'Check Eligibility'}
              </button>
              {result && <button type="button" className="btn-reset" onClick={reset}>Start over</button>}
            </div>
          </form>
        </div>

        {/* ── Results panel ── */}
        <div className="elig-results-panel">
          {loading && <LoadingSpinner text="Checking eligibility…" />}

          {!loading && !result && (
            <div className="results-placeholder">
              <span className="placeholder-icon">🧑‍🌾</span>
              <p>Fill in the form and click <strong>Check Eligibility</strong> to see your results.</p>
            </div>
          )}

          {!loading && result && (
            <EligibilityResults result={result} />
          )}
        </div>
      </div>
    </div>
  );
}

function EligibilityResults({ result }) {
  const [tab, setTab] = useState('eligible');

  return (
    <div className="results">
      {/* Summary */}
      <div className="results-summary">
        <div className="summary-card eligible">
          <span className="summary-count">{result.eligibleCount}</span>
          <span className="summary-label">Eligible</span>
        </div>
        <div className="summary-card not-eligible">
          <span className="summary-count">{result.notEligibleCount}</span>
          <span className="summary-label">Not eligible</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="results-tabs">
        <button className={tab === 'eligible' ? 'active' : ''} onClick={() => setTab('eligible')}>
          ✅ Eligible ({result.eligibleCount})
        </button>
        <button className={tab === 'not' ? 'active' : ''} onClick={() => setTab('not')}>
          ❌ Not eligible ({result.notEligibleCount})
        </button>
      </div>

      {/* Eligible list */}
      {tab === 'eligible' && (
        result.eligible.length === 0
          ? <p className="no-results">No schemes matched your profile.</p>
          : <ul className="result-list">
              {result.eligible.map(s => (
                <li key={s.slug} className="result-item eligible-item">
                  <div className="result-item-header">
                    <span className="result-name">{s.name}</span>
                    <span className="badge badge-green">Eligible ✓</span>
                  </div>
                  <p className="result-category">{s.category} · {s.level} · {s.state}</p>
                  <Link to={`/schemes/${s.slug}`} className="result-link">View details →</Link>
                </li>
              ))}
            </ul>
      )}

      {/* Not eligible list */}
      {tab === 'not' && (
        result.notEligible.length === 0
          ? <p className="no-results">You are eligible for all schemes!</p>
          : <ul className="result-list">
              {result.notEligible.map(({ scheme: s, reasons }) => (
                <li key={s.slug} className="result-item not-eligible-item">
                  <div className="result-item-header">
                    <span className="result-name">{s.name}</span>
                    <span className="badge badge-red">Not eligible</span>
                  </div>
                  <p className="result-category">{s.category} · {s.level} · {s.state}</p>
                  <ul className="reasons-list">
                    {reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                  <Link to={`/schemes/${s.slug}`} className="result-link">View details →</Link>
                </li>
              ))}
            </ul>
      )}

      <p className="disclaimer">{result.disclaimer}</p>
    </div>
  );
}
