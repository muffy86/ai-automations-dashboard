'use client';

import { useEffect, useState } from 'react';

interface BriefingData {
  generatedAt: string;
  sections: Array<{ title: string; items: string[] }>;
}

export default function BriefingPage() {
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch('/api/briefing');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">📰 Daily Briefing</h1>
        
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : data ? (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Generated: {new Date(data.generatedAt).toLocaleString()}
            </p>
            
            {data.sections.map((section, i) => (
              <div key={i} className="p-6 bg-white/10 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="text-gray-300">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-400">Failed to load briefing</p>
        )}
      </div>
    </div>
  );
}