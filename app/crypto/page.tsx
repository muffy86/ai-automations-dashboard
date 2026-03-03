'use client';

import { useEffect, useState } from 'react';

interface CryptoData {
  bitcoin: { usd: number; usd_24h_change: number };
  ethereum: { usd: number; usd_24h_change: number };
  solana: { usd: number; usd_24h_change: number };
}

// Mock crypto data for static export
const mockCryptoData: CryptoData = {
  bitcoin: { usd: 67432.15, usd_24h_change: 2.34 },
  ethereum: { usd: 3521.78, usd_24h_change: -1.12 },
  solana: { usd: 145.23, usd_24h_change: 5.67 }
};

export default function CryptoPage() {
  const [data, setData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and use mock data for static export
    const timer = setTimeout(() => {
      setData(mockCryptoData);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const coins = [
    { key: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', color: 'text-orange-400' },
    { key: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: 'text-purple-400' },
    { key: 'solana', name: 'Solana', symbol: 'SOL', color: 'text-green-400' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">💰 Crypto Tracker</h1>
        
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coins.map((coin) => {
              const coinData = data[coin.key as keyof CryptoData];
              const change = coinData.usd_24h_change;
              return (
                <div key={coin.key} className="p-6 bg-white/10 rounded-xl">
                  <h2 className={`text-xl font-semibold ${coin.color}`}>{coin.name}</h2>
                  <p className="text-3xl font-bold mt-2">
                    ${coinData.usd.toLocaleString()}
                  </p>
                  <p className={`mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-red-400">Failed to load data</p>
        )}
        
        <p className="mt-8 text-sm text-gray-500">
          Demo data for static export • Real-time updates require backend
        </p>
      </div>
    </div>
  );
}
