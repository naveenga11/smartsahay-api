import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSchemes, deactivateScheme } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminDashboard.css';

const LEVEL_BADGE = { Central: 'badge-blue', State: 'badge-orange' };

export default function AdminDashboard() {
  const [schemes, setSchemes]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [deactivating, setDeact]  = useState(null);  // slug being deactivated
  const [toast, setToast]         = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchemes();
      setSchemes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDeactivate(slug, name) {
    if (!window.confirm(`Deactivate "${name}"?\n\nThe scheme will be hidden from the public view. This cannot be undone from the UI.`)) return;
    setDeact(slug);
    try {
      await deactivateScheme(slug);
      showToast(`"${name}" deactivated.`, 'success');
      setSchemes(prev => prev.filter(s => s.slug !== slug));
    } catch (e) {
      showToast(`Failed: ${e.message}`, 'error');
    } finally {
      setDeact(null);
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const displayed = schemes.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`} role="status">
          {toast.type === 'success' ? '✅' : '⚠'} {toast.msg}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-sub">{schemes.length} scheme{schemes.length !== 1 ? 's' : ''} · manage below</p>
        </div>
        <Link to="/admin/schemes/new" className="btn-new">+ New scheme</Link>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search by name or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search schemes"
        />
      </div>

      {loading && <LoadingSpinner text="Loading schemes…" />}
      {error   && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && displayed.length === 0 && (
        <p className="empty-admin">No schemes found. <Link to="/admin/schemes/new">Add the first one.</Link></p>
      )}

      {!loading && !error && displayed.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Level</th>
                <th>State</th>
                <th>Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(s => (
                <tr key={s.slug}>
                  <td>
                    <Link to={`/schemes/${s.slug}`} className="scheme-name-link">{s.name}</Link>
                    <span className="slug-text">{s.slug}</span>
                  </td>
                  <td><span className="category-text">{s.category}</span></td>
                  <td><span className={`badge ${LEVEL_BADGE[s.level] || 'badge-blue'}`}>{s.level}</span></td>
                  <td>{s.state}</td>
                  <td>{s.applicationMode}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-action edit"
                      onClick={() => navigate(`/admin/schemes/${s.slug}/edit`)}
                      title="Edit scheme"
                    >
                      ✏ Edit
                    </button>
                    <button
                      className="btn-action deactivate"
                      onClick={() => handleDeactivate(s.slug, s.name)}
                      disabled={deactivating === s.slug}
                      title="Deactivate scheme"
                    >
                      {deactivating === s.slug ? '…' : '🗑 Deactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
