export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🤖 AI Automations Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/briefing" className="p-6 bg-white/10 rounded-xl hover:bg-white/20 transition">
            <h2 className="text-2xl font-semibold mb-2">📰 Daily Briefing</h2>
            <p className="text-gray-300">Auto-generated news summary</p>
          </a>
          
          <a href="/slides" className="p-6 bg-white/10 rounded-xl hover:bg-white/20 transition">
            <h2 className="text-2xl font-semibold mb-2">🎨 Slide Generator</h2>
            <p className="text-gray-300">Markdown to presentation</p>
          </a>
          
          <a href="/crypto" className="p-6 bg-white/10 rounded-xl hover:bg-white/20 transition">
            <h2 className="text-2xl font-semibold mb-2">💰 Crypto Tracker</h2>
            <p className="text-gray-300">Real-time price data</p>
          </a>
          
          <div className="p-6 bg-white/10 rounded-xl">
            <h2 className="text-2xl font-semibold mb-2">⚡ API Status</h2>
            <p className="text-gray-300">All systems operational</p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-black/20 rounded-lg">
          <p className="text-sm text-gray-400">
            Powered by Vercel Edge Functions • KV • Blob • Cron
          </p>
        </div>
      </div>
    </div>
  );
}