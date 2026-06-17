'use client'
import { useEffect, useRef, useState } from 'react'
import { nucleus, NucleusTask, NucleusAgent } from '@/lib/nucleus'

const AGENT_ROLES: Record<string, string> = {
  orchestrator: 'Router',
  memory: 'RAG Memory',
  execution: 'Shell Exec',
  observer: 'Health Monitor',
  builder: 'LLM Builder',
  reflex: 'Trigger Handler',
  human_helpful: 'Conversational',
  voice_companion: 'Voice Input',
  vision: 'CLIP+YOLO',
  self_healer: 'Auto-Fix',
  digital_twin: 'Simulator',
  hardware: 'GPIO/Drone/NPU',
}

const STATUS_COLORS: Record<string, string> = {
  done: 'bg-green-500',
  running: 'bg-yellow-500',
  started: 'bg-blue-500',
  failed: 'bg-red-500',
  queued: 'bg-zinc-500',
}

// Compile-time constant — safe to declare at module level
const WS_BASE = (process.env.NEXT_PUBLIC_NUCLEUS_URL ?? 'http://localhost:8080')
  .replace(/^http/, 'ws')

export default function NucleusPage() {
  const [health, setHealth] = useState<string>('checking')
  const [agents, setAgents] = useState<NucleusAgent[]>([])
  const [tasks, setTasks] = useState<NucleusTask[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected'>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      const h = await nucleus.health()
      setHealth(h.status)
    }
    const loadAgents = async () => {
      try {
        const res = await nucleus.agents()
        setAgents(res.agents ?? [])
      } catch {}
    }
    const loadTasks = async () => {
      try {
        const res = await nucleus.tasks()
        setTasks(Array.isArray(res) ? res : [])
      } catch {}
    }
    checkHealth()
    loadAgents()
    loadTasks()
    const healthTimer = setInterval(checkHealth, 15000)
    const agentTimer = setInterval(loadAgents, 10000)
    const taskTimer = setInterval(loadTasks, 3000)
    return () => {
      clearInterval(healthTimer)
      clearInterval(agentTimer)
      clearInterval(taskTimer)
    }
  }, [])

  useEffect(() => {
    let active = true
    let timerId: ReturnType<typeof setTimeout> | null = null
    const wsUrl = WS_BASE + '/ws'

    const connect = () => {
      if (!active) return
      try {
        const ws = new WebSocket(wsUrl)
        ws.onopen = () => { if (active) setWsStatus('connected') }
        ws.onclose = () => {
          if (active) {
            setWsStatus('disconnected')
            timerId = setTimeout(connect, 3000)
          }
        }
        ws.onerror = () => ws.close()
        wsRef.current = ws
      } catch {}
    }

    connect()
    return () => {
      active = false
      if (timerId) clearTimeout(timerId)
      // Null the handler before closing so the close event does not
      // schedule another reconnect via the onclose callback
      if (wsRef.current) wsRef.current.onclose = null
      wsRef.current?.close()
    }
  }, [])

  const sendIntent = async () => {
    if (!input.trim()) return
    setSending(true)
    try {
      const res = await nucleus.intent(input)
      setLastResult(JSON.stringify(res, null, 2))
      setInput('')
    } catch {
      setLastResult('Error: could not reach Nucleus')
    } finally {
      setSending(false)
    }
  }

  const allAgentNames = Object.keys(AGENT_ROLES)

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Open-muff Nucleus</h1>
          <p className="text-zinc-500 text-sm">Agent OS Mission Control</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full ${
            wsStatus === 'connected' ? 'bg-green-900 text-green-400' : 'bg-zinc-800 text-zinc-500'
          }`}>
            WS {wsStatus}
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              health === 'ok' ? 'bg-green-500 animate-pulse' :
              health === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-xs text-zinc-400">{health}</span>
          </div>
        </div>
      </div>

      {/* Intent Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            placeholder="Send intent to Nucleus... e.g. 'check system health'"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendIntent()}
          />
          <button
            onClick={sendIntent}
            disabled={sending}
            className="px-5 py-3 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 rounded-lg text-sm font-semibold transition-colors"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
        {lastResult && (
          <pre className="mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-green-400 overflow-auto max-h-32">
            {lastResult}
          </pre>
        )}
      </div>

      {/* Agent Grid */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Agents ({allAgentNames.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {allAgentNames.map(name => {
            const live = agents.find(a => a.name === name)
            const dotColor = !live
              ? 'bg-zinc-600'
              : live.status === 'healthy'
              ? 'bg-green-500'
              : live.status === 'error' || live.status === 'failed'
              ? 'bg-red-500'
              : 'bg-yellow-500'
            return (
              <div key={name} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  <span className="text-xs font-semibold text-white truncate">{name}</span>
                </div>
                <span className="text-xs text-zinc-600">{AGENT_ROLES[name]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task Feed */}
      <div>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Live Tasks ({tasks.length})
        </h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-zinc-600 text-sm py-4">No tasks yet — send an intent above.</p>
          ) : (
            tasks.slice().reverse().map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[t.status] ?? 'bg-zinc-500'}`} />
                <span className="text-zinc-400 font-mono w-20 truncate">{t.id.slice(0, 8)}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                  t.status === 'done' ? 'bg-green-900 text-green-400' :
                  t.status === 'failed' ? 'bg-red-900 text-red-400' :
                  'bg-zinc-800 text-zinc-400'
                }`}>{t.status}</span>
                <span className="text-zinc-500 flex-1 truncate">
                  {t.result?.routed_to as string ?? JSON.stringify(t.inputs).slice(0, 60)}
                </span>
                {/* ISO slice is deterministic on server and client — no hydration mismatch */}
                <span className="text-zinc-700 flex-shrink-0">{t.created_at.slice(11, 19)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
