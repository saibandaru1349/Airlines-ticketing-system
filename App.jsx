import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Search from './pages/Search.jsx';
import Login from './pages/Login.jsx';
import FlightDetail from './pages/FlightDetail.jsx';
import Booking from './pages/Booking.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Admin from './pages/Admin.jsx';

function RequireAuth({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <Link to="/" className="brand">✈ SkyBook</Link>
          <nav>
            <NavLink to="/" end>Flights</NavLink>
            {user && <NavLink to="/bookings">My bookings</NavLink>}
            {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
            {user ? (
              <>
                <span className="who">Hi, {user.name.split(' ')[0]}</span>
                <button className="btn ghost" onClick={logout}>Log out</button>
              </>
            ) : (
              <NavLink to="/login">Log in</NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/flights/:id" element={<FlightDetail />} />
          <Route path="/bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
          <Route path="/bookings/:pnr" element={<RequireAuth><Booking /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth role="ADMIN"><Admin /></RequireAuth>} />
          <Route path="*" element={<p className="muted">Page not found. <Link to="/">Go home</Link></p>} />
        </Routes>
      </main>
      <footer className="footer">SkyBook demo project · Java, Spring Boot, MySQL, React</footer>
    </>
  );
}
