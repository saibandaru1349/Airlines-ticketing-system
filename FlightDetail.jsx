import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, duration, fmtDateTime, money } from '../api.js';
import { useAuth } from '../auth.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function SeatMap({ seats, selected, onToggle }) {
  const rows = useMemo(() => {
    const map = {};
    seats.forEach((s) => {
      const row = parseInt(s.seatNumber, 10);
      const letter = s.seatNumber.slice(-1);
      (map[row] ||= {})[letter] = s;
    });
    return Object.keys(map).map(Number).sort((a, b) => a - b).map((r) => ({ row: r, seats: map[r] }));
  }, [seats]);

  return (
    <div className="seatmap">
      <div className="plane-nose">Front of aircraft</div>
      {rows.map(({ row, seats: byLetter }) => (
        <div className="seat-row" key={row}>
          <span className="row-no">{row}</span>
          {LETTERS.map((l) => {
            const s = byLetter[l];
            const aisle = l === 'D' ? <span className="aisle" key={'aisle' + row} /> : null;
            if (!s) return <span key={l} className="seat-slot">{aisle}<span className="seat empty" /></span>;
            const taken = s.status !== 'AVAILABLE';
            const isSel = selected.includes(s.seatNumber);
            const cls = ['seat', s.seatClass === 'BUSINESS' ? 'business' : '', taken ? 'taken' : '', isSel ? 'selected' : '']
              .filter(Boolean).join(' ');
            return (
              <span key={l} className="seat-slot">
                {aisle}
                <button type="button" className={cls} disabled={taken}
                  title={`${s.seatNumber} · ${s.seatClass.toLowerCase()} · ${money(s.price)}${taken ? ' · unavailable' : ''}`}
                  onClick={() => onToggle(s.seatNumber)}>{l}</button>
              </span>
            );
          })}
        </div>
      ))}
      <div className="legend">
        <span><i className="seat sample" /> Economy</span>
        <span><i className="seat sample business" /> Business</span>
        <span><i className="seat sample taken" /> Unavailable</span>
        <span><i className="seat sample selected" /> Selected</span>
      </div>
    </div>
  );
}

export default function FlightDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [pax, setPax] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, s] = await Promise.all([api(`/api/flights/${id}`), api(`/api/flights/${id}/seats`)]);
      setFlight(f); setSeats(s);
      setSelected((cur) => cur.filter((n) => s.find((x) => x.seatNumber === n && x.status === 'AVAILABLE')));
    } catch (e) { setError(e.message); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggle = (num) => {
    setError('');
    setSelected((cur) => {
      if (cur.includes(num)) return cur.filter((n) => n !== num);
      if (cur.length >= 9) { setError('You can book at most 9 seats at a time.'); return cur; }
      return [...cur, num];
    });
    setPax((p) => (p[num] ? p : { ...p, [num]: { name: '', age: '', gender: 'M' } }));
  };

  const updatePax = (num, key, val) => setPax((p) => ({ ...p, [num]: { ...p[num], [key]: val } }));
  const priceOf = (num) => seats.find((s) => s.seatNumber === num)?.price ?? 0;
  const total = selected.reduce((sum, n) => sum + Number(priceOf(n)), 0);

  const book = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const body = {
        flightId: Number(id),
        passengers: selected.map((n) => ({
          name: pax[n].name, age: Number(pax[n].age), gender: pax[n].gender, seatNumber: n,
        })),
      };
      const booking = await api('/api/bookings', { method: 'POST', body });
      navigate(`/bookings/${booking.pnr}`);
    } catch (err) {
      setError(err.message);
      load();   // refresh seat map: someone else may have taken a seat
    } finally { setBusy(false); }
  };

  if (!flight) return error ? <div className="alert error">{error}</div> : <p className="muted">Loading flight…</p>;

  return (
    <>
      <Link to="/" className="back">← Back to search</Link>
      <div className="card flight-head">
        <div>
          <h2>{flight.flightNumber}: {flight.source} → {flight.destination}</h2>
          <p className="muted">{fmtDateTime(flight.departureTime)} · {duration(flight.departureTime, flight.arrivalTime)} · from {money(flight.basePrice)}</p>
        </div>
        <div className="muted">{flight.availableSeats} seats available</div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="two-col">
        <div className="card"><h3>Choose your seats</h3>
          <SeatMap seats={seats} selected={selected} onToggle={toggle} />
        </div>

        <form className="card" onSubmit={book}>
          <h3>Passengers</h3>
          {selected.length === 0 && <p className="muted">Click seats on the map to add passengers.</p>}
          {selected.map((n) => (
            <fieldset key={n} className="pax">
              <legend>Seat {n} · {money(priceOf(n))}</legend>
              <input placeholder="Full name" value={pax[n]?.name || ''} onChange={(e) => updatePax(n, 'name', e.target.value)} required />
              <div className="row">
                <input type="number" placeholder="Age" min="0" max="120" value={pax[n]?.age || ''} onChange={(e) => updatePax(n, 'age', e.target.value)} required />
                <select value={pax[n]?.gender || 'M'} onChange={(e) => updatePax(n, 'gender', e.target.value)}>
                  <option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
                </select>
              </div>
            </fieldset>
          ))}
          {selected.length > 0 && <div className="total"><span>Total</span><strong>{money(total)}</strong></div>}
          {user ? (
            <button className="btn primary block" disabled={busy || selected.length === 0}>
              {busy ? 'Booking…' : `Book ${selected.length || ''} seat${selected.length === 1 ? '' : 's'}`}
            </button>
          ) : (
            <button type="button" className="btn primary block"
              onClick={() => navigate('/login', { state: { from: location } })}>Log in to book</button>
          )}
          <p className="muted small">Seats are held for 10 minutes after booking. Pay before the hold expires.</p>
        </form>
      </div>
    </>
  );
}
