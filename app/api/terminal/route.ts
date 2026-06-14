import { NextRequest, NextResponse } from 'next/server';

const OPEN_TERMINAL_URL = process.env.OPEN_TERMINAL_URL ?? 'http://localhost:8000';
const OPEN_TERMINAL_API_KEY = process.env.OPEN_TERMINAL_API_KEY ?? '';
// Set TERMINAL_ACCESS_TOKEN in .env.local to restrict who can call this route.
// If unset, the endpoint is open (suitable only for local dev behind auth middleware).
const TERMINAL_ACCESS_TOKEN = process.env.TERMINAL_ACCESS_TOKEN ?? '';

function isAuthorized(req: NextRequest): boolean {
  if (!TERMINAL_ACCESS_TOKEN) return true;
  const auth = req.headers.get('authorization') ?? '';
  return auth === `Bearer ${TERMINAL_ACCESS_TOKEN}`;
}

const otHeaders = () => ({
  Authorization: `Bearer ${OPEN_TERMINAL_API_KEY}`,
  'Content-Type': 'application/json',
});

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { command } = body;

    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: 'command is required' }, { status: 400 });
    }

    const res = await fetch(`${OPEN_TERMINAL_URL}/execute`, {
      method: 'POST',
      headers: otHeaders(),
      body: JSON.stringify({ command }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(`${OPEN_TERMINAL_URL}/files/list?path=/workspace`, {
      headers: { Authorization: `Bearer ${OPEN_TERMINAL_API_KEY}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
