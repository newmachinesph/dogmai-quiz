import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/leaderboard - Get leaderboard entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all-time";
    const gameSlug = searchParams.get("game");
    const topicSlug = searchParams.get("topic");
    const limit = parseInt(searchParams.get("limit") || "10");

    // For real-time leaderboard, aggregate from game sessions
    const where: Record<string, unknown> = { isCompleted: true };

    if (gameSlug) {
      const game = await prisma.gameType.findUnique({
        where: { slug: gameSlug },
      });
      if (game) where.gameTypeId = game.id;
    }

    if (topicSlug) where.topicSlug = topicSlug;

    // Apply time filter based on period
    const now = new Date();
    if (period === "daily") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.createdAt = { gte: startOfDay };
    } else if (period === "weekly") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startOfWeek };
    } else if (period === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      where.createdAt = { gte: startOfMonth };
    }

    // Get top sessions
    const topSessions = await prisma.gameSession.findMany({
      where,
      include: {
        gameType: true,
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { score: "desc" },
      take: limit,
    });

    // Format leaderboard entries
    const leaderboard = topSessions.map((session, index) => ({
      rank: index + 1,
      score: session.score,
      percentage: session.percentage,
      timeElapsed: session.timeElapsed,
      game: session.gameType.name,
      topic: session.topicSlug,
      difficulty: session.difficulty,
      user: session.user ?? { username: "Anonymous", displayName: "Anonymous Player" },
      playedAt: session.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: leaderboard,
      period,
      filters: { gameSlug, topicSlug },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

// POST /api/leaderboard - Submit score to leaderboard (for persistent/cached leaderboards)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period, gameSlug, topicSlug, username, userId, score } = body;

    if (!period || !username || score === undefined) {
      return NextResponse.json(
        { success: false, error: "Period, username, and score are required" },
        { status: 400 }
      );
    }

    // Calculate period date
    const now = new Date();
    let periodDate: string;

    if (period === "daily") {
      periodDate = now.toISOString().split("T")[0];
    } else if (period === "weekly") {
      const weekNum = Math.ceil((now.getDate() - now.getDay()) / 7);
      periodDate = `${now.getFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
    } else if (period === "monthly") {
      periodDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    } else {
      periodDate = "all-time";
    }

    const entry = await prisma.leaderboardEntry.create({
      data: {
        period,
        gameSlug,
        topicSlug,
        username,
        userId,
        score,
        periodDate,
      },
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating leaderboard entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create leaderboard entry" },
      { status: 500 }
    );
  }
}
