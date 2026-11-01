import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home         from './pages/Home';
import Schemes      from './pages/Schemes';
import SchemeDetail from './pages/SchemeDetail';
import Eligibility  from './pages/Eligibility';
import AdminLogin   from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import SchemeForm   from './pages/admin/SchemeForm';

function ProtectedRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/schemes"    element={<Schemes />} />
          <Route path="/schemes/:slug" element={<SchemeDetail />} />
          <Route path="/eligibility"   element={<Eligibility />} />
          <Route path="/admin/login"   element={<AdminLogin />} />

          <Route path="/admin" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/schemes/new" element={
            <ProtectedRoute><SchemeForm /></ProtectedRoute>
          } />
          <Route path="/admin/schemes/:slug/edit" element={
            <ProtectedRoute><SchemeForm /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <p style={{ fontSize: '3rem' }}>🌾</p>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page not found</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        <a href="/" style={{ color: 'var(--color-green-dark)', fontWeight: 600 }}>Go home</a>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
