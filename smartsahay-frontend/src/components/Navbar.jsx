import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <span className="brand-icon">🌾</span>
        <span className="brand-text">SmartSahay</span>
      </NavLink>

      <ul className="navbar-links">
        <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
        <li><NavLink to="/schemes" className={({ isActive }) => isActive ? 'active' : ''}>Schemes</NavLink></li>
        <li><NavLink to="/eligibility" className={({ isActive }) => isActive ? 'active' : ''}>Check Eligibility</NavLink></li>
        {isAdmin ? (
          <>
            <li><NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>Admin</NavLink></li>
            <li><button className="btn-logout" onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <li><NavLink to="/admin/login" className={({ isActive }) => isActive ? 'active' : ''}>Admin</NavLink></li>
        )}
      </ul>
    </nav>
  );
}
