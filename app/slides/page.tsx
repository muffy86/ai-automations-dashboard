'use client';

import { useState } from 'react';

export default function SlidesPage() {
  const [markdown, setMarkdown] = useState(`# Welcome
- Point one
- Point two

# Next Slide
- Another point
- Final point`);
  const [theme, setTheme] = useState('default');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{url?: string; error?: string}>({});

  async function generateSlides() {
    setLoading(true);
    // Simulate slide generation for static export
    setTimeout(() => {
      setResult({ 
        error: 'Slide generation requires a backend. This is a demo version for static hosting.'
      });
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🎨 Slide Generator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Markdown Content</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-96 p-4 bg-slate-800 rounded-lg font-mono text-sm"
              placeholder="# Title&#10;- Bullet 1&#10;- Bullet 2"
            />
            
            <div className="mt-4 flex gap-4">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="px-4 py-2 bg-slate-800 rounded-lg"
              >
                <option value="default">Light Theme</option>
                <option value="dark">Dark Theme</option>
              </select>
              
              <button
                onClick={generateSlides}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Slides'}
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="text-gray-400 text-sm">
              <p>Slides will be generated as an HTML presentation.</p>
              <p className="mt-2">Use # for slide titles</p>
              <p>Use - or * for bullet points</p>
            </div>
            
            {result.url && (
              <div className="mt-4 p-4 bg-green-900/30 rounded-lg">
                <p className="text-green-400">✅ Slides generated!</p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline break-all"
                >
                  {result.url}
                </a>
              </div>
            )}
            
            {result.error && (
              <div className="mt-4 p-4 bg-red-900/30 rounded-lg text-red-400">
                ❌ {result.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
