import { NextRequest, NextResponse } from 'next/server'

// Server-side Nucleus URL — keeps the backend off the public internet.
// On Vercel: set NUCLEUS_URL to your private Nucleus host and
// NEXT_PUBLIC_NUCLEUS_URL=/api/nucleus so the browser hits this proxy.
const NUCLEUS = process.env.NUCLEUS_URL ?? 'http://localhost:8080'

type Params = { path: string[] }

export async function GET(
  req: NextRequest,
  { params }: { params: Params },
) {
  const path = params.path.join('/')
  const url = `${NUCLEUS}/${path}${req.nextUrl.search}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Params },
) {
  const path = params.path.join('/')
  const url = `${NUCLEUS}/${path}`
  try {
    const body = await req.text()
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': req.headers.get('content-type') ?? 'application/json' },
      body,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }
}
