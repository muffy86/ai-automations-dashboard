import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function GET() {
  try {
    // Try cache first
    const cached = await kv.get('crypto-prices');
    const cacheTime = await kv.get('crypto-prices-time');
    
    if (cached && cacheTime && (Date.now() - Number(cacheTime)) < 60000) {
      return NextResponse.json({
        success: true,
        source: 'cache',
        data: cached
      });
    }

    // Fetch fresh data
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 60 } }
    );

    if (!response.ok) throw new Error('Crypto API failed');

    const data = await response.json();
    
    // Cache for 1 minute
    await kv.set('crypto-prices', data);
    await kv.set('crypto-prices-time', Date.now());

    return NextResponse.json({
      success: true,
      source: 'fresh',
      data
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}