import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeMarketSymbol } from '@/shared/utils/marketSymbol';

function getMockSnapshots(symbol: string) {
  const data = [];
  const now = Date.now();
  let iv = 18.0;
  let vrp = 4.0;

  // Generate 60 data points (simulating 1 hour of minute-by-minute snapshots)
  for (let i = 60; i >= 0; i--) {
    iv += (Math.random() - 0.5) * 0.5;
    vrp += (Math.random() - 0.45) * 0.2;

    data.push({
      id: `mock-${i}`,
      symbol,
      timestamp: new Date(now - i * 60000).toISOString(),
      avgIV: parseFloat(iv.toFixed(2)),
      avgVRP: parseFloat(vrp.toFixed(2)),
      putCallRatio: parseFloat((0.8 + Math.random() * 0.4).toFixed(2)),
    });
  }
  return data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = normalizeMarketSymbol(searchParams.get('symbol'));

  try {
    const snapshots = await prisma.chainSnapshot.findMany({
      where: { symbol },
      orderBy: { timestamp: 'asc' },
      take: 100, // Last 100 snapshots
    });

    if (snapshots.length === 0) {
      return NextResponse.json({
        data: getMockSnapshots(symbol),
        warning: 'Showing simulated analytics until enough live snapshots are collected.',
      });
    }

    return NextResponse.json({ data: snapshots });
  } catch (error) {
    console.warn(
      '[Analytics Router] Database error (likely Vercel environment), falling back to mock data.',
      error,
    );
    return NextResponse.json({
      data: getMockSnapshots(symbol),
      warning: 'Live database unavailable. Showing simulated analytics.',
    });
  }
}
