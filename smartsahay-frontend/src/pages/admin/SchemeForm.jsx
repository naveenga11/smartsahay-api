import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getScheme, createScheme, updateScheme } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import './SchemeForm.css';

const LEVELS      = ['Central', 'State'];
const MODES       = ['Online', 'Offline', 'Both'];
const CATEGORIES  = [
  'Financial Assistance', 'Crop Insurance', 'Agricultural Credit',
  'Irrigation Subsidy', 'Equipment Subsidy', 'Organic Farming',
  'Renewable Energy', 'Sustainable Farming', 'Agricultural Extension',
  'Natural Farming', 'Education', 'Crop Promotion',
  'Irrigation and Infrastructure', 'Irrigation',
  'Agricultural Infrastructure & Promotion',
];

const EMPTY_RULES = {
  requiresLand: false, minLandHectares: '', maxLandHectares: '',
  maxAnnualIncome: '', minAge: '', maxAge: '',
  karnatakaOnly: false, allowedCategories: '', allowedCrops: '',
};

const EMPTY = {
  slug: '', name: '', category: '', level: 'Central', state: 'All India',
  description: '', applicationMode: 'Online',
  whereToApply: '', officialLink: '', lastDate: '', contactInfo: '', lastVerified: '',
  benefits: [''], eligibility: [''], documents: [''], steps: [''],
  rules: { ...EMPTY_RULES },
};

function toForm(scheme) {
  return {
    slug:            scheme.slug || '',
    name:            scheme.name || '',
    category:        scheme.category || '',
    level:           scheme.level || 'Central',
    state:           scheme.state || 'All India',
    description:     scheme.description || '',
    applicationMode: scheme.applicationMode || 'Online',
    whereToApply:    scheme.whereToApply || '',
    officialLink:    scheme.officialLink || '',
    lastDate:        scheme.lastDate || '',
    contactInfo:     scheme.contactInfo || '',
    lastVerified:    scheme.lastVerified || '',
    benefits:        scheme.benefits?.length  ? scheme.benefits  : [''],
    eligibility:     scheme.eligibility?.length ? scheme.eligibility : [''],
    documents:       scheme.documents?.length ? scheme.documents : [''],
    steps:           scheme.steps?.length     ? scheme.steps     : [''],
    rules:           { ...EMPTY_RULES },
  };
}

export default function SchemeForm() {
  const { slug } = useParams();           // undefined → create mode
  const isEdit   = Boolean(slug);
  const navigate = useNavigate();

  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess]   = useState(null);

  // Load existing scheme for edit
  useEffect(() => {
    if (!isEdit) return;
    getScheme(slug)
      .then(s => setForm(toForm(s)))
      .catch(e => setApiError(e.message))
      .finally(() => setLoading(false));
  }, [slug, isEdit]);

  // ── Generic field setter ──────────────────────────────────────────────────
  function set(key, value) {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  }

  function setRule(key, value) {
    setForm(p => ({ ...p, rules: { ...p.rules, [key]: value } }));
  }

  // ── List helpers (benefits / eligibility / documents / steps) ─────────────
  function listChange(field, idx, value) {
    setForm(p => {
      const arr = [...p[field]];
      arr[idx] = value;
      return { ...p, [field]: arr };
    });
  }

  function listAdd(field) {
    setForm(p => ({ ...p, [field]: [...p[field], ''] }));
  }

  function listRemove(field, idx) {
    setForm(p => {
      const arr = p[field].filter((_, i) => i !== idx);
      return { ...p, [field]: arr.length ? arr : [''] };
    });
  }

  // ── Client-side validation ────────────────────────────────────────────────
  function validate() {
    const e = {};
    if (!isEdit && !form.slug.trim()) e.slug = 'Slug is required';
    if (!form.name.trim())            e.name = 'Name is required';
    if (!form.category.trim())        e.category = 'Category is required';
    if (!form.state.trim())           e.state = 'State is required';
    if (!form.description.trim())     e.description = 'Description is required';
    if (form.officialLink && !/^https?:\/\//i.test(form.officialLink))
      e.officialLink = 'Must start with http:// or https://';
    if (form.lastVerified && !/^\d{4}-\d{2}-\d{2}$/.test(form.lastVerified))
      e.lastVerified = 'Format: YYYY-MM-DD';
    ['benefits', 'eligibility', 'documents', 'steps'].forEach(f => {
      if (form[f].every(v => !v.trim())) e[f] = `At least one ${f} item is required`;
    });
    return e;
  }

  // ── Build payload ─────────────────────────────────────────────────────────
  function buildPayload() {
    const clean = arr => arr.filter(v => v.trim());
    const num   = v  => v === '' || v === null ? null : Number(v);
    const rules = {
      requiresLand:      form.rules.requiresLand,
      karnatakaOnly:     form.rules.karnatakaOnly,
      minLandHectares:   num(form.rules.minLandHectares),
      maxLandHectares:   num(form.rules.maxLandHectares),
      maxAnnualIncome:   num(form.rules.maxAnnualIncome),
      minAge:            num(form.rules.minAge),
      maxAge:            num(form.rules.maxAge),
      allowedCategories: form.rules.allowedCategories.trim() || null,
      allowedCrops:      form.rules.allowedCrops.trim() || null,
    };
    return {
      slug:            form.slug.trim() || undefined,
      name:            form.name.trim(),
      category:        form.category.trim(),
      level:           form.level,
      state:           form.state.trim(),
      description:     form.description.trim(),
      applicationMode: form.applicationMode,
      whereToApply:    form.whereToApply.trim() || null,
      officialLink:    form.officialLink.trim() || null,
      lastDate:        form.lastDate.trim() || null,
      contactInfo:     form.contactInfo.trim() || null,
      lastVerified:    form.lastVerified.trim() || null,
      benefits:        clean(form.benefits),
      eligibility:     clean(form.eligibility),
      documents:       clean(form.documents),
      steps:           clean(form.steps),
      rules,
    };
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    setSaving(true);
    setApiError(null);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await updateScheme(slug, payload);
        setSuccess('Scheme updated successfully.');
      } else {
        const created = await createScheme(payload);
        setSuccess(`Scheme "${created.name}" created!`);
        setTimeout(() => navigate(`/admin`), 1500);
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner text="Loading scheme…" />;

  return (
    <div className="scheme-form-page">
      <div className="form-page-header">
        <button className="back-btn" onClick={() => navigate('/admin')}>← Back to dashboard</button>
        <h1>{isEdit ? `Edit: ${form.name || slug}` : 'New Scheme'}</h1>
      </div>

      {success  && <div className="form-success" role="status">✅ {success}</div>}
      {apiError && <div className="form-api-error" role="alert">⚠ {apiError}</div>}
      {Object.keys(errors).length > 0 && (
        <div className="form-api-error" role="alert">Please fix the highlighted fields below.</div>
      )}

      <form onSubmit={handleSubmit} noValidate className="sf">

        {/* ── Basic info ── */}
        <section className="sf-section">
          <h2 className="sf-section-title">Basic information</h2>

          {!isEdit && (
            <Field label="Slug *" error={errors.slug} hint="Lowercase letters, digits, hyphens. e.g. my-new-scheme">
              <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="my-new-scheme" />
            </Field>
          )}

          <Field label="Name *" error={errors.name}>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full scheme name" />
          </Field>

          <div className="sf-row">
            <Field label="Category *" error={errors.category}>
              <input list="category-list" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Financial Assistance" />
              <datalist id="category-list">
                {CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </Field>

            <Field label="Level *" error={errors.level}>
              <select value={form.level} onChange={e => set('level', e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>

          <div className="sf-row">
            <Field label="State *" error={errors.state}>
              <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="All India or Karnataka" />
            </Field>

            <Field label="Application mode *">
              <select value={form.applicationMode} onChange={e => set('applicationMode', e.target.value)}>
                {MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Description *" error={errors.description}>
            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed scheme description…" />
          </Field>
        </section>

        {/* ── Links & contact ── */}
        <section className="sf-section">
          <h2 className="sf-section-title">Links &amp; contact</h2>

          <Field label="Official link" error={errors.officialLink}>
            <input type="url" value={form.officialLink} onChange={e => set('officialLink', e.target.value)} placeholder="https://…" />
          </Field>

          <div className="sf-row">
            <Field label="Where to apply">
              <input value={form.whereToApply} onChange={e => set('whereToApply', e.target.value)} placeholder="Portal, bank, CSC…" />
            </Field>
            <Field label="Last date / deadline">
              <input value={form.lastDate} onChange={e => set('lastDate', e.target.value)} placeholder="Open throughout the year" />
            </Field>
          </div>

          <div className="sf-row">
            <Field label="Contact info">
              <input value={form.contactInfo} onChange={e => set('contactInfo', e.target.value)} placeholder="Phone / helpline" />
            </Field>
            <Field label="Last verified (YYYY-MM-DD)" error={errors.lastVerified}>
              <input value={form.lastVerified} onChange={e => set('lastVerified', e.target.value)} placeholder="2026-10-01" />
            </Field>
          </div>
        </section>

        {/* ── Lists ── */}
        {[
          { key: 'benefits',    label: 'Benefits *',              placeholder: 'Farmers receive ₹6,000 annually.' },
          { key: 'eligibility', label: 'Eligibility criteria *',  placeholder: 'Must own cultivable land.' },
          { key: 'documents',   label: 'Required documents *',    placeholder: 'Aadhaar Card' },
          { key: 'steps',       label: 'Application steps *',     placeholder: 'Visit the official portal.' },
        ].map(({ key, label, placeholder }) => (
          <section className="sf-section" key={key}>
            <h2 className="sf-section-title">{label}</h2>
            {errors[key] && <p className="field-error">{errors[key]}</p>}
            {form[key].map((item, i) => (
              <div key={i} className="list-row">
                <span className="list-index">{i + 1}</span>
                <input
                  value={item}
                  onChange={e => listChange(key, i, e.target.value)}
                  placeholder={placeholder}
                />
                <button type="button" className="list-remove" onClick={() => listRemove(key, i)}
                  aria-label={`Remove item ${i + 1}`} disabled={form[key].length === 1}>✕</button>
              </div>
            ))}
            <button type="button" className="list-add" onClick={() => listAdd(key)}>+ Add item</button>
          </section>
        ))}

        {/* ── Eligibility rules ── */}
        <section className="sf-section">
          <h2 className="sf-section-title">Eligibility rules <span className="optional-label">(optional)</span></h2>
          <p className="sf-hint">Leave fields blank for no restriction.</p>

          <div className="sf-row">
            <CheckField label="Requires owning land" checked={form.rules.requiresLand}
              onChange={v => setRule('requiresLand', v)} />
            <CheckField label="Karnataka only" checked={form.rules.karnatakaOnly}
              onChange={v => setRule('karnatakaOnly', v)} />
          </div>

          <div className="sf-row">
            <Field label="Min land (hectares)">
              <input type="number" min="0" step="0.01" value={form.rules.minLandHectares}
                onChange={e => setRule('minLandHectares', e.target.value)} placeholder="e.g. 0.41" />
            </Field>
            <Field label="Max land (hectares)">
              <input type="number" min="0" step="0.01" value={form.rules.maxLandHectares}
                onChange={e => setRule('maxLandHectares', e.target.value)} placeholder="e.g. 5" />
            </Field>
          </div>

          <div className="sf-row">
            <Field label="Min age">
              <input type="number" min="0" max="120" value={form.rules.minAge}
                onChange={e => setRule('minAge', e.target.value)} placeholder="e.g. 18" />
            </Field>
            <Field label="Max age">
              <input type="number" min="0" max="120" value={form.rules.maxAge}
                onChange={e => setRule('maxAge', e.target.value)} placeholder="e.g. 75" />
            </Field>
          </div>

          <Field label="Max annual income (₹)">
            <input type="number" min="0" value={form.rules.maxAnnualIncome}
              onChange={e => setRule('maxAnnualIncome', e.target.value)} placeholder="e.g. 600000" />
          </Field>

          <Field label="Allowed categories" hint="Comma-separated: SC,ST,OBC,MINORITY — blank = all">
            <input value={form.rules.allowedCategories}
              onChange={e => setRule('allowedCategories', e.target.value)}
              placeholder="SC,ST,OBC,MINORITY" />
          </Field>

          <Field label="Allowed crops" hint="Comma-separated e.g. MILLET,WHEAT — blank = any">
            <input value={form.rules.allowedCrops}
              onChange={e => setRule('allowedCrops', e.target.value)}
              placeholder="MILLET" />
          </Field>
        </section>

        {/* ── Footer actions ── */}
        <div className="sf-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create scheme'}
          </button>
          <button type="button" className="btn-cancel" onClick={() => navigate('/admin')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Reusable sub-components ── */
function Field({ label, error, hint, children }) {
  return (
    <div className="sf-field">
      <label className="sf-label">{label}</label>
      {children}
      {hint  && <p className="sf-hint-text">{hint}</p>}
      {error && <p className="sf-error">{error}</p>}
    </div>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <label className="sf-check-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
