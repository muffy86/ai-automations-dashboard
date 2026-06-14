import { NextRequest, NextResponse } from 'next/server';

const OPEN_TERMINAL_URL = process.env.OPEN_TERMINAL_URL ?? 'http://localhost:8000';
const OPEN_TERMINAL_API_KEY = process.env.OPEN_TERMINAL_API_KEY ?? '';
const TERMINAL_ACCESS_TOKEN = process.env.TERMINAL_ACCESS_TOKEN ?? '';

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? '';
  return auth === `Bearer ${TERMINAL_ACCESS_TOKEN}`;
}

export async function POST(req: NextRequest) {
  if (!TERMINAL_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Terminal not configured. Set TERMINAL_ACCESS_TOKEN in environment.' },
      { status: 503 }
    );
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { command } = body as { command?: string };
    if (!command) {
      return NextResponse.json({ error: 'command is required' }, { status: 400 });
    }

    const upstream = await fetch(`${OPEN_TERMINAL_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OPEN_TERMINAL_API_KEY ? { Authorization: `Bearer ${OPEN_TERMINAL_API_KEY}` } : {}),
      },
      body: JSON.stringify({ command }),
    });

    let result: unknown;
    try {
      result = await upstream.json();
    } catch {
      result = { error: 'Invalid JSON from upstream' };
    }

    if (!upstream.ok) {
      return NextResponse.json(result, { status: upstream.status });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!TERMINAL_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Terminal not configured. Set TERMINAL_ACCESS_TOKEN in environment.' },
      { status: 503 }
    );
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path') ?? '/workspace';

  try {
    const upstream = await fetch(
      `${OPEN_TERMINAL_URL}/files/list?path=${encodeURIComponent(path)}`,
      {
        cache: 'no-store',
        headers: OPEN_TERMINAL_API_KEY
          ? { Authorization: `Bearer ${OPEN_TERMINAL_API_KEY}` }
          : {},
      }
    );

    let result: unknown;
    try {
      result = await upstream.json();
    } catch {
      result = { error: 'Invalid JSON from upstream' };
    }

    if (!upstream.ok) {
      return NextResponse.json(result, { status: upstream.status });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
