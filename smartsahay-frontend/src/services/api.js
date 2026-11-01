const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/smartsahay';

function getToken() {
  return sessionStorage.getItem('ss_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    throw new ApiError(msg, res.status);
  }
  return data;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// ─── Health ──────────────────────────────────────────────────────────────────
export const getHealth = () => request('/api/health');

// ─── Schemes (public) ────────────────────────────────────────────────────────
export function getSchemes({ category, state, level, lang } = {}) {
  const p = new URLSearchParams();
  if (category) p.set('category', category);
  if (state)    p.set('state', state);
  if (level)    p.set('level', level);
  if (lang && lang !== 'en') p.set('lang', lang);
  const qs = p.toString();
  return request(`/api/schemes${qs ? `?${qs}` : ''}`);
}

export const getScheme = (slug, lang) => {
  const qs = lang && lang !== 'en' ? `?lang=${lang}` : '';
  return request(`/api/schemes/${slug}${qs}`);
};

// ─── Eligibility ─────────────────────────────────────────────────────────────
export const checkEligibility = (body) =>
  request('/api/eligibility', { method: 'POST', body: JSON.stringify(body) });

// ─── Admin auth ──────────────────────────────────────────────────────────────
export const adminLogin = (username, password) =>
  request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const adminSession = () => request('/api/admin/session');

// ─── Admin scheme CRUD ───────────────────────────────────────────────────────
export const createScheme = (body) =>
  request('/api/schemes', { method: 'POST', body: JSON.stringify(body) });

export const updateScheme = (slug, body) =>
  request(`/api/schemes/${slug}`, { method: 'PUT', body: JSON.stringify(body) });

export const deactivateScheme = (slug) =>
  request(`/api/schemes/${slug}`, { method: 'DELETE' });
