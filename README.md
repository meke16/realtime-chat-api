# Laravel Echo Realtime Chat Monorepo

This repository contains a simple realtime chat application split into two parts:

- **Frontend**: Vite + React app living in `frontend/`
- **Backend**: Laravel API (with broadcasting via Reverb/Echo) in `realtime-chat-api/`

The frontend connects to the backend over HTTP and WebSockets to send and receive messages in realtime.

---

## Repository Layout

- `frontend/` — Vite/React single-page app
- `realtime-chat-api/` — Laravel app (API, events, broadcasting)
- `realtime-chat-api-local-backup-20251226/` — Local backup artifacts (not required to run)

---

## Prerequisites

- Node.js 18+ and npm
- PHP 8.2+ and Composer
- A database (SQLite or MySQL recommended)
- OpenSSL (for generating Laravel `APP_KEY`)

Optional but recommended:
- `mkcert` or proper TLS certs if you want secure local WebSockets

---

## Backend Setup (Laravel)

1. Install dependencies:
   ```bash
   cd realtime-chat-api
   composer install
   ```

2. Configure environment:
   - Create `.env` (copy from `.env.example` if present):
     ```bash
     cp .env.example .env
     ```
   - Generate app key:
     ```bash
     php artisan key:generate
     ```
   - Database options:
     - SQLite (quick start):
       ```bash
       touch database/database.sqlite
       ```
       Then set in `.env`:
       ```env
       DB_CONNECTION=sqlite
       DB_DATABASE=./database/database.sqlite
       ```
     - MySQL (example):
       ```env
       DB_CONNECTION=mysql
       DB_HOST=127.0.0.1
       DB_PORT=3306
       DB_DATABASE=chat
       DB_USERNAME=your_user
       DB_PASSWORD=your_password
       ```

3. Broadcasting (Laravel Reverb):
   - Default Reverb vars (adjust as needed):
     ```env
     BROADCAST_DRIVER=reverb

     REVERB_SERVER_HOST=127.0.0.1
     REVERB_SERVER_PORT=8080
     REVERB_SERVER_SCHEME=http

     REVERB_APP_ID=app-id
     REVERB_APP_KEY=app-key
     REVERB_APP_SECRET=app-secret
     ```
   - Ensure `config/broadcasting.php` is set to use `reverb` and `config/reverb.php` exists (already in this repo).

4. Migrate and seed the database:
   ```bash
   php artisan migrate --seed
   ```

5. Run the Laravel HTTP server and Reverb WebSocket server (use two terminals):
   ```bash
   # Terminal 1: HTTP API
   php artisan serve --host=127.0.0.1 --port=8000

   # Terminal 2: WebSockets (Reverb)
   php artisan reverb:start
   ```

---

## Frontend Setup (Vite + React)

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment (optional if defaults work). Create `.env` with values matching your backend:
   ```env
   # API
   VITE_API_BASE_URL=http://127.0.0.1:8000

   # Echo / Reverb
   VITE_ECHO_HOST=127.0.0.1
   VITE_ECHO_PORT=8080
   VITE_ECHO_SCHEME=http
   VITE_ECHO_KEY=app-key
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

Open the app URL shown in the terminal (typically `http://127.0.0.1:5173`).

---

## Development Workflow

- Start backend API: `php artisan serve`
- Start WebSockets: `php artisan reverb:start`
- Start frontend: `npm run dev`

Use separate terminals so the three processes run simultaneously.

---

## Troubleshooting

- **WebSocket fails to connect**
  - Ensure `php artisan reverb:start` is running.
  - Confirm host/port in frontend `.env` matches backend Reverb settings.
  - If you switch to HTTPS, update `REVERB_SERVER_SCHEME=https` and `VITE_ECHO_SCHEME=https` and provide valid certs.

- **CORS or CSRF issues**
  - Verify `APP_URL` in backend `.env` and that your frontend origin is allowed. Adjust CORS settings if needed.

- **DB errors**
  - Confirm migrations were applied and `.env` DB settings are correct.

---

## Scripts & Commands (Quick Reference)

```bash
# Backend
cd realtime-chat-api
composer install
cp .env.example .env    # if present
php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan reverb:start

# Frontend
cd frontend
npm install
npm run dev
```

---

## Notes

- This repo uses Laravel Echo on the client and Reverb on the server for realtime messaging.
- The `frontend/src/lib/echo.js` is the entry point for configuring Echo; update it to match your `.env`.
- The API endpoints and events in the backend are in `app/Events`, `app/Http/Controllers`, and `routes/`.

---

## License

This project is provided as-is for learning and experimentation. Add your preferred license if you plan to distribute.
