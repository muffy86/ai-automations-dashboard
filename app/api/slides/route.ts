import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { markdown, theme = 'default' } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { success: false, error: 'Markdown content required' },
        { status: 400 }
      );
    }

    // Generate HTML slides
    const html = generateSlidesHTML(markdown, theme);
    
    // Store in Blob
    const filename = `slides-${Date.now()}.html`;
    const blob = await put(filename, html, {
      access: 'public',
      contentType: 'text/html'
    });

    // Track in KV
    await kv.lpush('generated-slides', {
      url: blob.url,
      filename,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function generateSlidesHTML(markdown: string, theme: string): string {
  const slides = markdown.split('\n# ').filter(Boolean).map((section, i) => {
    const [title, ...content] = section.split('\n');
    const bullets = content
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => `<li>${line.trim().replace(/^[-*]\s*/, '')}</li>`)
      .join('');
    
    return `
      <div class="slide ${i === 0 ? 'active' : ''}" data-slide="${i}">
        <h1>${title.replace('# ', '')}</h1>
        <ul>${bullets}</ul>
      </div>
    `;
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Generated Presentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${theme === 'dark' ? '#0a0a0a' : '#ffffff'};
      color: ${theme === 'dark' ? '#ffffff' : '#0a0a0a'};
      overflow: hidden;
    }
    .slide {
      display: none;
      width: 100vw;
      height: 100vh;
      padding: 60px;
      flex-direction: column;
      justify-content: center;
    }
    .slide.active { display: flex; }
    h1 { font-size: 3rem; margin-bottom: 40px; }
    ul { list-style: none; }
    li { 
      font-size: 1.5rem; 
      margin: 20px 0;
      padding-left: 30px;
      position: relative;
    }
    li:before {
      content: '→';
      position: absolute;
      left: 0;
      color: #3b82f6;
    }
    .nav {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
    }
    button {
      padding: 10px 20px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  ${slides.join('')}
  <div class="nav">
    <button onclick="prev()">← Prev</button>
    <button onclick="next()">Next →</button>
  </div>
  <script>
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    function show(n) {
      slides.forEach(s => s.classList.remove('active'));
      slides[n].classList.add('active');
    }
    function next() { current = (current + 1) % slides.length; show(current); }
    function prev() { current = (current - 1 + slides.length) % slides.length; show(current); }
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  </script>
</body>
</html>`;
}