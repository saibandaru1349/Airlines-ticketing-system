const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const KEY = 'skybook_auth';

export const getAuth = () => {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
};
export const setAuth = (a) => (a ? localStorage.setItem(KEY, JSON.stringify(a)) : localStorage.removeItem(KEY));

function messageFrom(data) {
  if (!data) return null;
  if (data.message) return data.message;
  if (data.errors) return Object.entries(data.errors).map(([f, m]) => `${f}: ${m}`).join(', ');
  return null;
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  const auth = getAuth();
  if (body) headers['Content-Type'] = 'application/json';
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Please check that the backend is running.');
  }
  if (res.status === 401 && auth) {
    setAuth(null);
    window.dispatchEvent(new Event('auth-expired'));
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON body */ }
  if (!res.ok) {
    throw new Error(messageFrom(data) || (res.status === 401 ? 'Please log in again.' : `Request failed (${res.status})`));
  }
  return data;
}

// ---------- formatting helpers ----------
export const money = (n) => '₹' + Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const fmtDateTime = (s) =>
  new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const fmtTime = (s) => new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
export const duration = (a, b) => {
  const mins = Math.round((new Date(b) - new Date(a)) / 60000);
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
};
export const localDate = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
