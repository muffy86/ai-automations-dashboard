import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

export const runtime = 'edge';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Handle commands
bot.command('start', (ctx) => {
  ctx.reply('🤖 AI Automations Bot ready.\n\nCommands:\n/briefing - Daily news\n/slides - Generate presentation\n/crypto - Crypto prices\n/organize - Organize files');
});

bot.command('briefing', async (ctx) => {
  const response = await fetch(`${process.env.VERCEL_URL}/api/briefing`);
  const data = await response.json();
  ctx.reply(`📰 Briefing:\n\n${JSON.stringify(data.data, null, 2)}`.slice(0, 4000));
});

bot.command('crypto', async (ctx) => {
  const response = await fetch(`${process.env.VERCEL_URL}/api/crypto`);
  const data = await response.json();
  const prices = data.data;
  ctx.reply(
    `💰 Crypto Prices:\n\n` +
    `BTC: $${prices.bitcoin.usd} (${prices.bitcoin.usd_24h_change > 0 ? '+' : ''}${prices.bitcoin.usd_24h_change.toFixed(2)}%)\n` +
    `ETH: $${prices.ethereum.usd} (${prices.ethereum.usd_24h_change > 0 ? '+' : ''}${prices.ethereum.usd_24h_change.toFixed(2)}%)\n` +
    `SOL: $${prices.solana.usd} (${prices.solana.usd_24h_change > 0 ? '+' : ''}${prices.solana.usd_24h_change.toFixed(2)}%)`
  );
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message });
  }
}