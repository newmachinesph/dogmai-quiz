import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/stats - Get overall stats or user-specific stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // User-specific stats
      const userStats = await prisma.userStats.findUnique({
        where: { userId },
        include: { user: true },
      });

      const recentGames = await prisma.gameSession.findMany({
        where: { userId },
        include: { gameType: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      const achievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        data: {
          stats: userStats ?? {
            totalGames: 0,
            totalScore: 0,
            totalTime: 0,
            gamesWon: 0,
            currentStreak: 0,
            bestStreak: 0,
          },
          recentGames,
          achievements: achievements.map((ua) => ua.achievement),
        },
      });
    }

    // Global stats
    const [totalGames, totalPlayers, topScores] = await Promise.all([
      prisma.gameSession.count(),
      prisma.user.count(),
      prisma.gameSession.findMany({
        orderBy: { score: "desc" },
        take: 10,
        include: { gameType: true },
      }),
    ]);

    // Get stats by game type
    const gameStats = await prisma.gameSession.groupBy({
      by: ["gameTypeId"],
      _count: { id: true },
      _avg: { score: true, percentage: true },
    });

    // Get stats by topic
    const topicStats = await prisma.gameSession.groupBy({
      by: ["topicSlug"],
      _count: { id: true },
      _avg: { score: true, percentage: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalGames,
        totalPlayers,
        topScores,
        gameStats,
        topicStats,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
