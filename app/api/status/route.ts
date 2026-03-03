import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    status: 'AI Automations Dashboard',
    version: '1.0.0',
    endpoints: {
      briefing: '/api/briefing',
      slides: '/api/slides',
      crypto: '/api/crypto',
      webhook: '/api/webhook'
    },
    features: [
      'Daily briefing with KV caching',
      'Markdown to HTML slides',
      'Real-time crypto prices',
      'Telegram bot webhook',
      'Vercel Cron jobs',
      'Blob storage for slides'
    ]
  });
}