# SkyBook frontend (React + Vite)

Web UI for the Airline Ticketing backend: flight search, seat map, booking, payment, my bookings, admin panel.

## Run locally
```bash
npm install
cp .env.example .env      # point VITE_API_URL at your backend
npm run dev               # http://localhost:5173
```
The backend must be running (default http://localhost:8080) and must allow this origin in `CORS_ORIGINS`
(`http://localhost:5173` is allowed by default).

## Build for production
```bash
npm run build             # output in dist/
```
`VITE_API_URL` is baked in at build time, so set it in your host's environment settings before building.

## Pages
| Route | What it does |
|---|---|
| `/` | Search flights by route and date |
| `/flights/:id` | Seat map, passenger details, create booking |
| `/bookings/:pnr` | Booking details, 10-minute hold countdown, pay / cancel |
| `/bookings` | Your bookings |
| `/login` | Log in / sign up |
| `/admin` | Admin only: add airports, aircraft, flights; revenue report |
