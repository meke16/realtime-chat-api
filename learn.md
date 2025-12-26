# Learn: Realtime Broadcasting with Laravel Reverb + Echo

This guide explains how the monorepo’s realtime chat works end-to-end, and what each part does.

## Overview
- Backend (Laravel API): Handles auth, message storage, and broadcasting.
- WebSocket server (Reverb): Accepts client connections and delivers broadcast events.
- Frontend (Vite + React + Echo): Subscribes to channels and reacts to events.

## Architecture Flow
1. User authenticates with Laravel (Sanctum) and sends a message to `POST /api/messages`.
2. The controller creates a `Message` and dispatches `MessageSent` (implements `ShouldBroadcast`).
3. Laravel’s broadcaster sends the event to Reverb.
4. Clients subscribed via Echo to the `chat` channel receive the `message.sent` event payload.

## Backend Essentials
- Default broadcaster: set via `BROADCAST_CONNECTION`. This repo uses `reverb`.
- Reverb config: server + application credentials in `REVERB_*` env vars.
- Queues: `QUEUE_CONNECTION=sync` in dev (or run `php artisan queue:work` when using a queued driver like `database`).

Key files:
- Config: [realtime-chat-api/config/broadcasting.php](realtime-chat-api/config/broadcasting.php)
- Reverb: [realtime-chat-api/config/reverb.php](realtime-chat-api/config/reverb.php)
- Queues: [realtime-chat-api/config/queue.php](realtime-chat-api/config/queue.php)
- Event: [realtime-chat-api/app/Events/MessageSent.php](realtime-chat-api/app/Events/MessageSent.php)
- API: [realtime-chat-api/routes/api.php](realtime-chat-api/routes/api.php)
- Channels: [realtime-chat-api/routes/channels.php](realtime-chat-api/routes/channels.php)

Event highlights (`MessageSent`):
- Broadcasts on public channel `chat`: `new Channel('chat')`.
- Broadcast name: `message.sent` via `broadcastAs()`.
- Payload includes the `message` model (with `user`).

## Frontend Essentials
- Echo client reads from Vite env: `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`, `VITE_REVERB_APP_KEY`.
- Subscribes to `chat` channel and listens for `.message.sent` (and optionally `MessageSent`).

Key files:
- Echo setup: [frontend/src/lib/echo.js](frontend/src/lib/echo.js)
- Example env: [frontend/.env.example](frontend/.env.example)
- Listener: [frontend/src/App.jsx](frontend/src/App.jsx)

## Environments
Backend `.env` (important entries):
- `BROADCAST_CONNECTION=reverb` → use Reverb.
- `QUEUE_CONNECTION=sync` → dev-friendly.
- `REVERB_SERVER_HOST`, `REVERB_SERVER_PORT`, `REVERB_SERVER_SCHEME` → Reverb server.
- `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_APP_ID`, `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME` → application + client settings.

Frontend `.env`:
- `VITE_API_BASE_URL` → HTTP API base.
- `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`, `VITE_REVERB_APP_KEY` → Echo connection.

## Running Locally
- Terminal 1 (API): `php artisan serve --host=127.0.0.1 --port=8000`
- Terminal 2 (WebSockets): `php artisan reverb:start`
- Terminal 3 (Frontend): `npm run dev` (inside `frontend/`)

If not using `sync` queues, also run: `php artisan queue:work`.

## Public vs Private Channels
- Public: no auth, easy dev setup (used here).
- Private/Presence: require channel auth; implement checks in [realtime-chat-api/routes/channels.php](realtime-chat-api/routes/channels.php) and configure Echo’s auth endpoints.

## WS vs WSS
- `http` + `ws`: simple local development.
- `https` + `wss`: requires valid TLS certs for both server and client. Update `REVERB_SERVER_SCHEME` and `VITE_REVERB_SCHEME` accordingly.

## Common Pitfalls
- Using `BROADCAST_DRIVER` instead of `BROADCAST_CONNECTION` (this repo reads `BROADCAST_CONNECTION`).
- Not running a queue worker while using a queued driver; use `sync` in dev.
- Mismatched host/port/scheme/key between backend and frontend.
- Posting messages without being authenticated (routes are protected).

## Debugging Tips
- Check Echo client logs in the browser console.
- Verify Reverb server is running and reachable.
- Inspect `.env` values on both sides.
- Temporarily switch channel to public for troubleshooting.

## Next Steps
- Move to Private/Presence channels for user-specific messaging.
- Add message delivery acknowledgements and reconnection handling.
- Deploy with HTTPS and `wss` using proper certificates.
