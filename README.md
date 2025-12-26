# Realtime Chat API (learning project)

A compact realtime chat API built on Laravel with a small WebSocket "Reverb" server for learning realtime communication patterns.

**What's already in place**
- **Authentication**: token-based (see `database/migrations/2025_12_26_073648_create_personal_access_tokens_table.php` and `config/sanctum.php`).
- **WebSocket server (Reverb)**: a lightweight server used for realtime message transport (see `resources/js/echo.js` and `routes/channels.php`).

This repo focuses on moving from Authentication (working) to Communication: defining message shapes and sending the first ping across WebSocket.

**Architecture overview**
- **HTTP layer**: Laravel controllers in `app/Http/Controllers` handle login, token issuance, and REST endpoints (see `routes/api.php`).
- **Persistence**: Eloquent models in `app/Models` (notably `User.php`) and migrations in `database/migrations`.
- **Realtime transport**: Reverb WebSocket server receives and relays JSON messages. Clients connect with an authenticated token and subscribe to channels.

Design note: the system separates authentication (HTTP + tokens) from realtime messaging (WebSocket) so you can reason about auth once and reuse tokens for the WebSocket handshake.

Message / data structure
The following minimal message schema is recommended for learning and interop:

```json
{
	"id": "uuid-v4",
	"type": "ping",                // ping | message | ack | join | leave
	"from": "user:123",           // sender identifier
	"to": "channel:global" ,      // channel or user target
	"ts": 1690000000,               // unix timestamp (seconds)
	"payload": { "text": "hello" }
}
```

Example: the first "ping" to test connectivity

- Client -> Reverb: send a `ping` message using the schema above.
- Reverb -> Client(s): echo back an `ack` or forward the `ping` to subscribed clients.

Quick examples

- Obtain a token (example):

```bash
curl -X POST http://localhost:8000/api/login \
	-H "Content-Type: application/json" \
	-d '{"email":"you@example.com","password":"secret"}'
# response contains `token` (use as Bearer)
```

- Connect to Reverb (JavaScript, minimal):

```js
const token = 'PASTE_TOKEN_HERE';
const ws = new WebSocket('ws://localhost:6000?token=' + encodeURIComponent(token));
ws.onopen = () => {
	const ping = { id: '1', type: 'ping', from: 'user:1', to: 'channel:global', ts: Math.floor(Date.now()/1000), payload: {} };
	ws.send(JSON.stringify(ping));
};
ws.onmessage = (evt) => console.log('recv', JSON.parse(evt.data));
```

- Send ping via HTTP endpoint (if present):

```bash
curl -X POST http://localhost:8000/api/messages \
	-H "Authorization: Bearer <TOKEN>" \
	-H "Content-Type: application/json" \
	-d '{"type":"ping","to":"channel:global","payload":{}}'
```

Where the HTTP handler may validate and forward the payload to Reverb (server-to-server call or via queue).

Useful file pointers
- `app/Models/User.php` — user model and relationships
- `app/Http/Controllers` — auth and API controllers
- `routes/api.php` — REST endpoints
- `routes/channels.php` — broadcast channel definitions
- `resources/js/echo.js` — client-side echo/connection helpers

Next steps (recommended for learning)
1. Define the first message contract (`ping`, `message`, `ack`) and add a JSON Schema or PHP DTO for validation.
2. Implement a small HTTP route to POST a test `ping` that the server forwards to Reverb.
3. Add a minimal JS client in `resources/js` that connects with token and performs the first ping/ack handshake.
4. Add logging in Reverb to print received messages and a test that the `ping` is echoed back.

If you'd like, I can:
- add the JSON Schema file and a PHP validator in `app/Http/Requests`,
- implement the HTTP test route and a tiny JS example client in `resources/js`,
- or produce step-by-step testing commands you can run locally.

---
Small note: this README replaces the default Laravel placeholder with a focused architecture summary and actionable next steps for the realtime chat learning path.
