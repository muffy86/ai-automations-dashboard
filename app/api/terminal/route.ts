import { NextRequest, NextResponse } from 'next/server';

const OPEN_TERMINAL_URL = process.env.OPEN_TERMINAL_URL ?? 'http://localhost:8000';
const OPEN_TERMINAL_API_KEY = process.env.OPEN_TERMINAL_API_KEY ?? '';

const otHeaders = () => ({
  Authorization: `Bearer ${OPEN_TERMINAL_API_KEY}`,
  'Content-Type': 'application/json',
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { command } = body;

  if (!command || typeof command !== 'string') {
    return NextResponse.json({ error: 'command is required' }, { status: 400 });
  }

  try {
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

export async function GET() {
  try {
    const res = await fetch(`${OPEN_TERMINAL_URL}/files/list?path=/workspace`, {
      headers: { Authorization: `Bearer ${OPEN_TERMINAL_API_KEY}` },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
