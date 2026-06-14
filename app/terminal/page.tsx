'use client';

import { useState, useRef, useEffect } from 'react';

interface TerminalEntry {
  command: string;
  stdout: string;
  stderr: string;
  exit_code: number;
  timestamp: string;
}

export default function TerminalPage() {
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  async function runCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const command = input.trim();
    setInput('');
    setHistoryIdx(-1);
    setCmdHistory((h) => [command, ...h].slice(0, 100));
    setLoading(true);

    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      setHistory((h) => [
        ...h,
        {
          command,
          stdout: data.stdout ?? '',
          stderr: data.stderr ?? data.error ?? '',
          exit_code: data.exit_code ?? (res.ok ? 0 : 1),
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      setHistory((h) => [
        ...h,
        { command, stdout: '', stderr: String(err), exit_code: 1, timestamp: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(next);
      setInput(cmdHistory[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setInput(next === -1 ? '' : cmdHistory[next]);
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <h1 className="text-sm font-bold text-green-300 ml-2">OpenTerminal — Remote Shell</h1>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-2 max-h-[calc(100vh-200px)]">
        {history.length === 0 && (
          <div className="text-green-800 text-sm">
            Connected to OpenTerminal. Type a command and press Enter.
          </div>
        )}
        {history.map((entry, i) => (
          <div key={i}>
            <div className="text-green-600 text-xs">[{entry.timestamp}]</div>
            <div className="text-green-300">$ {entry.command}</div>
            {entry.stdout && (
              <pre className="text-green-400 whitespace-pre-wrap text-sm ml-2">{entry.stdout}</pre>
            )}
            {entry.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap text-sm ml-2">{entry.stderr}</pre>
            )}
            {entry.exit_code !== 0 && (
              <div className="text-red-600 text-xs ml-2">↳ exit {entry.exit_code}</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-green-700 animate-pulse text-sm">executing...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={runCommand} className="flex gap-2 border-t border-green-900 pt-3">
        <span className="text-green-500 font-bold">$</span>
        <input
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-green-300 placeholder-green-900 text-sm font-mono"
          placeholder="Enter command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1 bg-green-900 text-green-300 rounded hover:bg-green-800 disabled:opacity-40 text-xs font-mono"
        >
          {loading ? '...' : 'RUN'}
        </button>
      </form>
    </div>
  );
}
