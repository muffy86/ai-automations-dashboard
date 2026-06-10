import { NextRequest, NextResponse } from 'next/server';

const NOTTE_API_BASE = 'https://api.notte.cc';

interface NotteStep {
  type: string;
  [key: string]: unknown;
}

interface NotteWorkflowRequest {
  url?: string;
  workflow_steps: NotteStep[];
  scrape_instructions?: string;
}

interface NotteAgentRequest {
  task: string;
  url?: string;
  max_steps?: number;
}

type NotteRequest = NotteAgentRequest | NotteWorkflowRequest;

function notteHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

function isWorkflowRequest(body: NotteRequest): body is NotteWorkflowRequest {
  return Array.isArray((body as NotteWorkflowRequest).workflow_steps);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.NOTTE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'NOTTE_API_KEY not configured' }, { status: 500 });
  }

  let body: NotteRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isWorkflowRequest(body) && !body.task) {
    return NextResponse.json({ error: 'task or workflow_steps is required' }, { status: 400 });
  }

  let sessionId: string | undefined;
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
    sessionId = session.id ?? session.session_id;

    if (isWorkflowRequest(body)) {
      // Workflow mode: execute known steps, then optionally scrape.
      // Generate steps from a live session with: notte sessions workflow-code
      if (body.url) {
        const gotoRes = await fetch(`${NOTTE_API_BASE}/v1/sessions/${sessionId}/execute`, {
          method: 'POST',
          headers: notteHeaders(apiKey),
          body: JSON.stringify({ type: 'goto', url: body.url }),
        });
        if (!gotoRes.ok) {
          const err = await gotoRes.text();
          return NextResponse.json({ error: `goto failed: ${err}` }, { status: gotoRes.status });
        }
      }
      for (const step of body.workflow_steps) {
        const stepRes = await fetch(`${NOTTE_API_BASE}/v1/sessions/${sessionId}/execute`, {
          method: 'POST',
          headers: notteHeaders(apiKey),
          body: JSON.stringify(step),
        });
        if (!stepRes.ok) {
          const err = await stepRes.text();
          return NextResponse.json(
            { error: `Step ${step.type} failed: ${err}` },
            { status: stepRes.status },
          );
        }
      }
      if (body.scrape_instructions) {
        const scrapeRes = await fetch(`${NOTTE_API_BASE}/v1/sessions/${sessionId}/scrape`, {
          method: 'POST',
          headers: notteHeaders(apiKey),
          body: JSON.stringify({ instructions: body.scrape_instructions }),
        });
        if (!scrapeRes.ok) {
          const err = await scrapeRes.text();
          return NextResponse.json({ error: `Scrape failed: ${err}` }, { status: scrapeRes.status });
        }
        const scrapeResult = await scrapeRes.json();
        return NextResponse.json({ result: scrapeResult, session_id: sessionId });
      }
      return NextResponse.json({ result: null, session_id: sessionId });
    }

    // Agent mode: AI agent for open-ended tasks
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
    if (!agentRes.ok) {
      const err = await agentRes.text();
      return NextResponse.json(
        { error: `Agent run failed: ${err}` },
        { status: agentRes.status },
      );
    }
    const result = await agentRes.json();
    return NextResponse.json({ answer: result.answer ?? result, session_id: sessionId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    if (sessionId) {
      try {
        await fetch(`${NOTTE_API_BASE}/v1/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: notteHeaders(apiKey),
        });
      } catch (cleanupErr) {
        console.error('Failed to delete Notte session:', cleanupErr);
      }
    }
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
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Failed to fetch sessions: ${err}` },
        { status: res.status },
      );
    }
    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
