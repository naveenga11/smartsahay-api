import { createContext, useContext, useState, useCallback } from 'react';
import { adminLogin, adminSession, ApiError } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('ss_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminLogin(username, password);
      sessionStorage.setItem('ss_token', data.token);
      setToken(data.token);
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('ss_token');
    setToken(null);
  }, []);

  const checkSession = useCallback(async () => {
    if (!sessionStorage.getItem('ss_token')) return false;
    try {
      await adminSession();
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, loading, error, login, logout, checkSession, isAdmin: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
