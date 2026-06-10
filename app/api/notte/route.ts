import { NextRequest, NextResponse } from 'next/server';

const NOTTE_API_BASE = 'https://api.notte.cc';

interface NotteAgentRequest {
  task: string;
  url?: string;
  max_steps?: number;
}

function notteHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.NOTTE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'NOTTE_API_KEY not configured' }, { status: 500 });
  }

  const body: NotteAgentRequest = await req.json();
  if (!body.task) {
    return NextResponse.json({ error: 'task is required' }, { status: 400 });
  }

  try {
    const sessionRes = await fetch(`${NOTTE_API_BASE}/v1/sessions`, {
      method: 'POST',
      headers: notteHeaders(apiKey),
      body: JSON.stringify({}),
    });
    if (!sessionRes.ok) {
      const err = await sessionRes.text();
      return NextResponse.json(
        { error: `Session creation failed: ${err}` },
        { status: sessionRes.status },
      );
    }
    const session = await sessionRes.json();
    const sessionId: string = session.id ?? session.session_id;

    const agentRes = await fetch(`${NOTTE_API_BASE}/v1/agents/run`, {
      method: 'POST',
      headers: notteHeaders(apiKey),
      body: JSON.stringify({
        session_id: sessionId,
        task: body.task,
        url: body.url,
        max_steps: body.max_steps ?? 20,
      }),
    });
    const result = await agentRes.json();

    await fetch(`${NOTTE_API_BASE}/v1/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: notteHeaders(apiKey),
    });

    return NextResponse.json({ answer: result.answer ?? result, session_id: sessionId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  const apiKey = process.env.NOTTE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'NOTTE_API_KEY not configured' }, { status: 500 });
  }
  try {
    const res = await fetch(`${NOTTE_API_BASE}/v1/sessions`, {
      headers: notteHeaders(apiKey),
    });
    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
