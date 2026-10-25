import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmtDateTime, money } from '../api.js';

export const StatusBadge = ({ status }) => <span className={`badge ${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>;

export default function Booking() {
  const { pnr } = useParams();
  const [b, setB] = useState(null);
  const [secs, setSecs] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const apply = (data) => { setB(data); setSecs(data.holdSecondsRemaining ?? null); };
  const load = useCallback(() => api(`/api/bookings/${pnr}`).then(apply).catch((e) => setError(e.message)), [pnr]);
  useEffect(() => { load(); }, [load]);

  // countdown for the seat hold
  useEffect(() => {
    if (secs === null) return undefined;
    if (secs <= 0) { load(); return undefined; }
    const t = setTimeout(() => setSecs((s) => (s === null ? s : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [secs, load]);

  const act = async (action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true); setError(''); setMsg('');
    try {
      apply(await api(`/api/bookings/${pnr}/${action}`, { method: 'POST' }));
      setMsg(action === 'pay' ? 'Payment successful. Your booking is confirmed! ✅' : 'Booking cancelled.');
    } catch (e) { setError(e.message); load(); }
    finally { setBusy(false); }
  };

  if (!b) return error ? <div className="alert error">{error}</div> : <p className="muted">Loading booking…</p>;
  const mm = secs === null ? '' : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <>
      <Link to="/bookings" className="back">← My bookings</Link>
      {error && <div className="alert error">{error}</div>}
      {msg && <div className="alert ok">{msg}</div>}

      <div className="card">
        <div className="booking-top">
          <div>
            <div className="muted small">PNR</div>
            <div className="pnr">{b.pnr}</div>
          </div>
          <StatusBadge status={b.status} />
        </div>
        <h3>{b.flightNumber}: {b.source} → {b.destination}</h3>
        <p className="muted">Departs {fmtDateTime(b.departureTime)}</p>

        <table className="table">
          <thead><tr><th>Passenger</th><th>Age</th><th>Gender</th><th>Seat</th><th>Class</th></tr></thead>
          <tbody>
            {b.passengers.map((p) => (
              <tr key={p.seatNumber}><td>{p.name}</td><td>{p.age}</td><td>{p.gender}</td><td>{p.seatNumber}</td><td>{p.seatClass.toLowerCase()}</td></tr>
            ))}
          </tbody>
        </table>

        <div className="total"><span>Total</span><strong>{money(b.totalAmount)}</strong></div>
        {b.paymentStatus && <p className="muted small">Payment: {b.paymentStatus.toLowerCase()}</p>}

        {b.status === 'PENDING_PAYMENT' && (
          <div className="hold">
            <div>⏳ Seats held for <strong>{mm}</strong></div>
            <div className="actions">
              <button className="btn primary" disabled={busy || secs === 0} onClick={() => act('pay')}>Pay {money(b.totalAmount)} (demo)</button>
              <button className="btn ghost" disabled={busy} onClick={() => act('cancel', 'Cancel this booking?')}>Cancel</button>
            </div>
            <p className="muted small">This is a demo: no real payment is taken.</p>
          </div>
        )}
        {b.status === 'CONFIRMED' && (
          <div className="actions">
            <button className="btn ghost" disabled={busy} onClick={() => act('cancel', 'Cancel this booking? Your payment will be refunded.')}>Cancel booking</button>
          </div>
        )}
        {b.status === 'EXPIRED' && <p className="muted">The seat hold expired. <Link to="/">Search again</Link></p>}
      </div>
    </>
  );
}
