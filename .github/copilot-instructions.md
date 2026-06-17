# Copilot Instructions — ai-automations-dashboard

## Stack
Next.js 14 App Router, TypeScript, Tailwind CSS. Deployed on Vercel.
Backend: Open-muff Nucleus (FastAPI, port 8080).

## Key files
- `lib/nucleus.ts` — typed NucleusClient (REST + WebSocket). Import `nucleus` singleton — never `new NucleusClient()`.
- `app/nucleus/page.tsx` — Agent OS mission control dashboard.
- `app/api/nucleus/[...path]/route.ts` — server-side proxy to Nucleus (reads `NUCLEUS_URL` env var).

## Rules
- Client components must use the proxy `/api/nucleus/`, never call Nucleus directly (keeps backend off public internet).
- Timestamps from Nucleus are ISO strings — use `.slice(11, 19)` for HH:MM:SS display, never `toLocaleTimeString()` (causes hydration mismatch).
- WebSocket reconnect must use `active` flag + `clearTimeout(timerId)` + `ws.onclose = null` before calling `close()` in cleanup.
- Agent health dots: green=healthy, red=error/failed, yellow=degraded/other, grey=offline.

## Env vars
- `NEXT_PUBLIC_NUCLEUS_URL` — Nucleus URL visible to client (for WebSocket). Defaults to `http://localhost:8080`.
- `NUCLEUS_URL` — server-only URL for the proxy route. Keep off client.
