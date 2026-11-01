import { Link } from 'react-router-dom';
import './SchemeCard.css';

const LEVEL_BADGE = { Central: 'badge-blue', State: 'badge-orange' };
const MODE_ICON   = { Online: '🌐', Offline: '🏢', Both: '🌐🏢' };

export default function SchemeCard({ scheme }) {
  return (
    <article className="scheme-card">
      <div className="card-header">
        <span className={`badge ${LEVEL_BADGE[scheme.level] || 'badge-blue'}`}>{scheme.level}</span>
        <span className="badge badge-gray">{scheme.state}</span>
      </div>

      <h3 className="card-title">
        <Link to={`/schemes/${scheme.slug}`}>{scheme.name}</Link>
      </h3>

      <p className="card-category">{scheme.category}</p>
      <p className="card-desc">{scheme.description}</p>

      <div className="card-footer">
        <span className="card-mode">{MODE_ICON[scheme.applicationMode]} {scheme.applicationMode}</span>
        {scheme.lastDate && <span className="card-date">📅 {scheme.lastDate}</span>}
        <Link to={`/schemes/${scheme.slug}`} className="card-link">View details →</Link>
      </div>
    </article>
  );
}
