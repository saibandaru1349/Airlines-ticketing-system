import { useCallback, useEffect, useState } from 'react';
import { api, money } from '../api.js';

export default function Admin() {
  const [airports, setAirports] = useState([]);
  const [aircrafts, setAircrafts] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [ap, setAp] = useState({ code: '', name: '', city: '' });
  const [ac, setAc] = useState({ model: '', economySeats: 150, businessSeats: 12 });
  const [fl, setFl] = useState({ flightNumber: '', sourceCode: '', destinationCode: '', aircraftId: '', departureTime: '', arrivalTime: '', basePrice: '' });

  const refresh = useCallback(async () => {
    try {
      const [a, c, r] = await Promise.all([api('/api/airports'), api('/api/admin/aircrafts'), api('/api/admin/reports/revenue')]);
      setAirports(a); setAircrafts(c); setRevenue(r);
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const submit = (path, body, reset, okText) => async (e) => {
    e.preventDefault(); setError(''); setMsg('');
    try { await api(path, { method: 'POST', body }); setMsg(okText); reset(); refresh(); }
    catch (err) { setError(err.message); }
  };
  const iso = (v) => (v && v.length === 16 ? v + ':00' : v);

  return (
    <>
      <h2>Admin</h2>
      {error && <div className="alert error">{error}</div>}
      {msg && <div className="alert ok">{msg}</div>}

      <div className="grid3">
        <form className="card stack" onSubmit={submit('/api/admin/airports', ap, () => setAp({ code: '', name: '', city: '' }), 'Airport added.')}>
          <h3>Add airport</h3>
          <input placeholder="Code (e.g. MAA)" maxLength={3} value={ap.code} onChange={(e) => setAp({ ...ap, code: e.target.value.toUpperCase() })} required />
          <input placeholder="Name" value={ap.name} onChange={(e) => setAp({ ...ap, name: e.target.value })} required />
          <input placeholder="City" value={ap.city} onChange={(e) => setAp({ ...ap, city: e.target.value })} required />
          <button className="btn primary">Add airport</button>
          <small className="muted">{airports.length} airports: {airports.map((a) => a.code).join(', ')}</small>
        </form>

        <form className="card stack" onSubmit={submit('/api/admin/aircrafts', { ...ac, economySeats: Number(ac.economySeats), businessSeats: Number(ac.businessSeats) }, () => setAc({ model: '', economySeats: 150, businessSeats: 12 }), 'Aircraft added.')}>
          <h3>Add aircraft</h3>
          <input placeholder="Model" value={ac.model} onChange={(e) => setAc({ ...ac, model: e.target.value })} required />
          <label>Economy seats<input type="number" min="0" value={ac.economySeats} onChange={(e) => setAc({ ...ac, economySeats: e.target.value })} /></label>
          <label>Business seats<input type="number" min="0" value={ac.businessSeats} onChange={(e) => setAc({ ...ac, businessSeats: e.target.value })} /></label>
          <button className="btn primary">Add aircraft</button>
        </form>

        <form className="card stack" onSubmit={submit('/api/admin/flights', { ...fl, aircraftId: Number(fl.aircraftId), basePrice: Number(fl.basePrice), departureTime: iso(fl.departureTime), arrivalTime: iso(fl.arrivalTime) }, () => setFl({ ...fl, flightNumber: '' }), 'Flight created with seats.')}>
          <h3>Add flight</h3>
          <input placeholder="Flight no. (AI-401)" value={fl.flightNumber} onChange={(e) => setFl({ ...fl, flightNumber: e.target.value })} required />
          <select value={fl.sourceCode} onChange={(e) => setFl({ ...fl, sourceCode: e.target.value })} required>
            <option value="">From…</option>{airports.map((a) => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
          </select>
          <select value={fl.destinationCode} onChange={(e) => setFl({ ...fl, destinationCode: e.target.value })} required>
            <option value="">To…</option>{airports.map((a) => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
          </select>
          <select value={fl.aircraftId} onChange={(e) => setFl({ ...fl, aircraftId: e.target.value })} required>
            <option value="">Aircraft…</option>{aircrafts.map((a) => <option key={a.id} value={a.id}>{a.model} ({a.economySeats + a.businessSeats} seats)</option>)}
          </select>
          <label>Departs<input type="datetime-local" value={fl.departureTime} onChange={(e) => setFl({ ...fl, departureTime: e.target.value })} required /></label>
          <label>Arrives<input type="datetime-local" value={fl.arrivalTime} onChange={(e) => setFl({ ...fl, arrivalTime: e.target.value })} required /></label>
          <input type="number" min="1" step="0.01" placeholder="Base price (₹)" value={fl.basePrice} onChange={(e) => setFl({ ...fl, basePrice: e.target.value })} required />
          <button className="btn primary">Create flight</button>
        </form>
      </div>

      <div className="card">
        <h3>Revenue per flight</h3>
        <table className="table">
          <thead><tr><th>Flight</th><th>Confirmed bookings</th><th>Revenue</th></tr></thead>
          <tbody>
            {revenue.map((r) => <tr key={r.flightNumber + r.revenue}><td>{r.flightNumber}</td><td>{r.confirmedBookings}</td><td>{money(r.revenue)}</td></tr>)}
            {revenue.length === 0 && <tr><td colSpan="3" className="muted">No data yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
