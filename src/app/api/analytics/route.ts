import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "SPY").toUpperCase();

  try {
    const snapshots = await prisma.chainSnapshot.findMany({
      where: { symbol },
      orderBy: { timestamp: 'asc' },
      take: 100 // Last 100 snapshots
    });

    return NextResponse.json({ data: snapshots });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
