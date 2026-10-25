import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, duration, fmtDateTime, fmtTime, localDate, money } from '../api.js';

export default function Search() {
  const [airports, setAirports] = useState([]);
  const [from, setFrom] = useState('HYD');
  const [to, setTo] = useState('BLR');
  const [date, setDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return localDate(d); });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/airports').then(setAirports).catch((e) => setError(e.message));
  }, []);

  const run = async (page = 0) => {
    if (from === to) { setError('Source and destination must be different.'); return; }
    setLoading(true); setError('');
    try {
      setResult(await api(`/api/flights/search?from=${from}&to=${to}&date=${date}&page=${page}&size=10`));
    } catch (e) { setError(e.message); setResult(null); }
    finally { setLoading(false); }
  };

  const swap = () => { setFrom(to); setTo(from); };
  const today = localDate(new Date());

  return (
    <>
      <section className="hero">
        <h1>Find your flight</h1>
        <p>Search, pick your seats and book in a minute.</p>
        <form className="search-form" onSubmit={(e) => { e.preventDefault(); run(0); }}>
          <label>From
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              {airports.map((a) => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
            </select>
          </label>
          <button type="button" className="swap" onClick={swap} title="Swap">⇄</button>
          <label>To
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {airports.map((a) => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
            </select>
          </label>
          <label>Date
            <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <button className="btn primary" disabled={loading || airports.length === 0}>{loading ? 'Searching…' : 'Search'}</button>
        </form>
      </section>

      {error && <div className="alert error">{error}</div>}

      {result && result.content.length === 0 && (
        <p className="muted center">No flights found for this route and date. Try another date.</p>
      )}

      {result?.content.map((f) => (
        <article className="card flight" key={f.id}>
          <div className="flight-main">
            <div className="flight-no">{f.flightNumber}</div>
            <div className="route">
              <div><strong>{fmtTime(f.departureTime)}</strong><span>{f.source}</span></div>
              <div className="line"><small>{duration(f.departureTime, f.arrivalTime)}</small></div>
              <div><strong>{fmtTime(f.arrivalTime)}</strong><span>{f.destination}</span></div>
            </div>
            <small className="muted">{fmtDateTime(f.departureTime)}</small>
          </div>
          <div className="flight-side">
            <div className="price">{money(f.basePrice)}<small> / person</small></div>
            <div className={f.availableSeats < 10 ? 'warn' : 'muted'}>
              {f.availableSeats === 0 ? 'Sold out' : `${f.availableSeats} seats left`}
            </div>
            <Link className="btn primary" to={`/flights/${f.id}`}>Select seats</Link>
          </div>
        </article>
      ))}

      {result && result.totalPages > 1 && (
        <div className="pager">
          <button className="btn ghost" disabled={result.number === 0} onClick={() => run(result.number - 1)}>← Prev</button>
          <span>Page {result.number + 1} of {result.totalPages}</span>
          <button className="btn ghost" disabled={result.number + 1 >= result.totalPages} onClick={() => run(result.number + 1)}>Next →</button>
        </div>
      )}
    </>
  );
}
