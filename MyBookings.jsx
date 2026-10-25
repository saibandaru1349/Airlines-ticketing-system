import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDateTime, money } from '../api.js';
import { StatusBadge } from './Booking.jsx';

export default function MyBookings() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/bookings?page=${page}&size=10`).then(setData).catch((e) => setError(e.message));
  }, [page]);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <p className="muted">Loading…</p>;

  return (
    <>
      <h2>My bookings</h2>
      {data.content.length === 0 && <p className="muted">No bookings yet. <Link to="/">Find a flight</Link></p>}
      {data.content.map((b) => (
        <Link to={`/bookings/${b.pnr}`} className="card booking-row" key={b.pnr}>
          <div>
            <strong>{b.source} → {b.destination}</strong> <span className="muted">· {b.flightNumber}</span>
            <div className="muted small">{fmtDateTime(b.departureTime)} · {b.passengers.length} passenger(s) · PNR {b.pnr}</div>
          </div>
          <div className="right"><div>{money(b.totalAmount)}</div><StatusBadge status={b.status} /></div>
        </Link>
      ))}
      {data.totalPages > 1 && (
        <div className="pager">
          <button className="btn ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
          <span>Page {data.number + 1} of {data.totalPages}</span>
          <button className="btn ghost" disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </>
  );
}
