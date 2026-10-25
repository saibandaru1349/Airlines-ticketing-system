# Deployment guide

You will deploy three things: a **MySQL database**, the **Spring Boot API** (Docker), and the **React website** (static files).
This guide uses free tiers: Aiven (MySQL), Render (API + website). Free-tier terms change, so check each provider's pricing page before you start.

Time needed: about 30-45 minutes the first time.

## 0. Before you start
1. Make sure it works locally first:
   ```bash
   cd backend && mvn test            # needs JDK 17+ and Maven
   docker compose up --build         # from the project root: MySQL + API on :8080
   cd frontend && npm install && npm run dev   # website on :5173
   ```
2. Create a GitHub repository and push the whole project (the `backend/` and `frontend/` folders at the top level).
   `.env` files and `node_modules/` are git-ignored; never commit passwords.

## 1. Database (Aiven free MySQL)
1. Sign up at aiven.io and create a **MySQL** service on the **Free** plan.
2. When it is running, open the service page and note: **host, port, user (`avnadmin`), password, database (`defaultdb`)**.
3. Build your JDBC URL (SSL is required):
   ```
   jdbc:mysql://<HOST>:<PORT>/defaultdb?sslMode=REQUIRED
   ```
Tables are created automatically on the first API start (`ddl-auto=update`).

## 2. API (Render)
**Easy way: Blueprint.** Render dashboard -> New -> Blueprint -> select your repo. It reads `render.yaml` and creates the API and the website.
It asks for the secret values. Use:

| Variable | Value |
|---|---|
| `DB_URL` | the JDBC URL from step 1 |
| `DB_USERNAME` | `avnadmin` |
| `DB_PASSWORD` | the Aiven password |
| `ADMIN_PASSWORD` | a strong password (this is your admin login) |
| `CORS_ORIGINS` | leave a placeholder for now, set in step 4 |
| `VITE_API_URL` (website) | leave a placeholder for now, set in step 3 |

`JWT_SECRET` is generated automatically.

**Manual way:** New -> Web Service -> your repo -> Runtime **Docker** -> Root directory `backend` -> Instance type Free -> add the same environment variables.

Wait for the deploy to finish, then open `https://<your-api>.onrender.com/swagger-ui.html`. If you see the Swagger page, the API and database are working.

> Free web services sleep after 15 minutes without traffic; the first request afterwards can take up to a minute. That is normal for the free tier.

## 3. Website
If you used the Blueprint, the static site already exists. Otherwise create it:
- **Render:** New -> Static Site -> root directory `frontend`, build command `npm install && npm run build`, publish directory `dist`, add a rewrite rule `/*` -> `/index.html`.
- **Vercel or Netlify:** import the repo, root directory `frontend`, framework Vite, build `npm run build`, output `dist`. (`vercel.json` and `public/_redirects` are already included for page refreshes.)

Set the environment variable **`VITE_API_URL`** to your API URL, with no trailing slash (e.g. `https://skybook-api.onrender.com`), then redeploy. This value is baked in at build time, so you must rebuild after changing it.

## 4. Connect them (CORS)
Set the API's **`CORS_ORIGINS`** to the website's exact address, `https://` included and no trailing slash (e.g. `https://skybook-web.onrender.com`). Several origins can be comma-separated. Save; the API redeploys.

## 5. Verify
- Open the website, search HYD -> BLR, open a flight, pick seats.
- Sign up, book, pay (demo), then cancel.
- Log in as `admin@airline.com` with your `ADMIN_PASSWORD` and open **Admin** to see the revenue report.

> **Demo flights are created once**, dated 7 days after the *first* start. A week later the default search date finds nothing. Log in as admin and add new flights, or search the original dates.

## 6. Before sharing it publicly
- Use a strong `ADMIN_PASSWORD`; remove or change the default admin email.
- Set `SEED_DEMO=false` after the first successful start.
- Move from `ddl-auto=update` to Flyway migrations for safe schema changes.
- Payment is a mock. Do not take real money until you integrate a gateway (e.g. Razorpay) and handle webhooks.
- Add login rate limiting and (optionally) a custom domain.
- Keep the JWT secret private; rotating it logs everyone out.

## Troubleshooting
| Symptom | Likely cause / fix |
|---|---|
| Browser console: *blocked by CORS policy* | `CORS_ORIGINS` is missing, has a trailing slash, or uses `http` instead of `https` |
| Website says "Cannot reach the server" | `VITE_API_URL` wrong or not rebuilt; API asleep (wait ~1 min and retry) |
| API fails at startup with SSL / connection errors | JDBC URL missing `?sslMode=REQUIRED`, wrong port, or Aiven service is powered off |
| API killed / out of memory | Free instances have little RAM; the Dockerfile already limits the JVM. Upgrade the instance if it persists |
| 404 when refreshing a page like `/bookings` | Missing SPA rewrite rule (`/*` -> `/index.html`) |
| 401 right after login | `JWT_SECRET` changed between deploys, or token expired (24 h); log in again |
| No flights found | Seeded flights are in the past or on other dates; add flights in Admin |
