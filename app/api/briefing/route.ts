import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function GET() {
  try {
    // Try to get cached briefing
    const cached = await kv.get('daily-briefing');
    
    if (cached) {
      return NextResponse.json({
        success: true,
        source: 'cache',
        data: cached
      });
    }

    // Generate new briefing
    const briefing = await generateBriefing();
    
    // Cache for 6 hours
    await kv.set('daily-briefing', briefing, { ex: 21600 });
    
    return NextResponse.json({
      success: true,
      source: 'fresh',
      data: briefing
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function generateBriefing() {
  const sections = [
    { title: 'Tech', feeds: ['https://news.ycombinator.com/rss', 'https://techcrunch.com/feed/'] },
    { title: 'Crypto', feeds: ['https://cointelegraph.com/rss'] },
    { title: 'World', feeds: ['https://feeds.bbci.co.uk/news/rss.xml'] }
  ];

  const briefing = {
    generatedAt: new Date().toISOString(),
    sections: []
  };

  for (const section of sections) {
    briefing.sections.push({
      title: section.title,
      items: [`Latest from ${section.title}...`] // Placeholder for actual feed parsing
    });
  }

  return briefing;
}