const BASE = process.env.NEXT_PUBLIC_NUCLEUS_URL ?? 'http://localhost:8080'

export interface NucleusTask {
  id: string
  status: string
  inputs: Record<string, unknown>
  result?: Record<string, unknown>
  created_at: string
}

export interface NucleusAgent {
  name: string
  role: string
  status?: string
}

export class NucleusClient {
  private base: string
  constructor(base = BASE) { this.base = base }

  async intent(text: string) {
    const r = await fetch(`${this.base}/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return r.json()
  }

  async tasks(): Promise<NucleusTask[]> {
    const r = await fetch(`${this.base}/tasks`)
    return r.json()
  }

  async task(id: string): Promise<NucleusTask> {
    const r = await fetch(`${this.base}/tasks/${id}`)
    return r.json()
  }

  async runTask(id: string) {
    const r = await fetch(`${this.base}/tasks/${id}/run`, { method: 'POST' })
    return r.json()
  }

  async agents(): Promise<{ agents: NucleusAgent[] }> {
    const r = await fetch(`${this.base}/agents`)
    return r.json()
  }

  async health(): Promise<{ status: string }> {
    try {
      const r = await fetch(`${this.base}/health`, { cache: 'no-store' })
      return r.json()
    } catch {
      return { status: 'unreachable' }
    }
  }
}

export const nucleus = new NucleusClient()
