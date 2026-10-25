import { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuth, setAuth } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getAuth());

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth-expired', onExpired);
    return () => window.removeEventListener('auth-expired', onExpired);
  }, []);

  const finish = (data) => { setAuth(data); setUser(data); return data; };
  const login = async (email, password) =>
    finish(await api('/api/auth/login', { method: 'POST', body: { email, password } }));
  const register = async (name, email, password) =>
    finish(await api('/api/auth/register', { method: 'POST', body: { name, email, password } }));
  const logout = () => { setAuth(null); setUser(null); };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
