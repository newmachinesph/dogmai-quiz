import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";

interface GuestSession {
  gameTypeId: string;
  topicSlug: string;
  difficulty: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeElapsed: number;
  moves?: number;
  correctCount?: number;
  totalCount?: number;
  createdAt: string;
}

interface GuestStats {
  totalGames: number;
  totalScore: number;
  totalTime: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
}

interface GuestProgress {
  stats: GuestStats;
  sessions: GuestSession[];
  achievements: string[];
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const guestProgress: GuestProgress = body.guestProgress;

    if (!guestProgress) {
      return NextResponse.json(
        { error: "No guest progress provided" },
        { status: 400 }
      );
    }

    const userId = payload.userId;

    // Get all game types for mapping
    const gameTypes = await prisma.gameType.findMany({
      select: { id: true, slug: true },
    });

    const gameTypeMap = new Map(gameTypes.map((gt) => [gt.slug, gt.id]));

    // Migrate sessions
    let migratedSessions = 0;
    for (const session of guestProgress.sessions) {
      const gameTypeId = gameTypeMap.get(session.gameTypeId) || session.gameTypeId;

      try {
        await prisma.gameSession.create({
          data: {
            userId,
            gameTypeId,
            topicSlug: session.topicSlug,
            difficulty: session.difficulty,
            score: session.score,
            maxScore: session.maxScore,
            percentage: session.percentage,
            timeElapsed: session.timeElapsed,
            moves: session.moves,
            correctCount: session.correctCount,
            totalCount: session.totalCount,
            createdAt: new Date(session.createdAt),
          },
        });
        migratedSessions++;
      } catch (err) {
        console.error("Failed to migrate session:", err);
      }
    }

    // Update user stats by adding guest stats
    await prisma.userStats.upsert({
      where: { userId },
      update: {
        totalGames: { increment: guestProgress.stats.totalGames },
        totalScore: { increment: guestProgress.stats.totalScore },
        totalTime: { increment: guestProgress.stats.totalTime },
        gamesWon: { increment: guestProgress.stats.gamesWon },
        bestStreak: Math.max(guestProgress.stats.bestStreak, 0),
      },
      create: {
        userId,
        totalGames: guestProgress.stats.totalGames,
        totalScore: guestProgress.stats.totalScore,
        totalTime: guestProgress.stats.totalTime,
        gamesWon: guestProgress.stats.gamesWon,
        currentStreak: guestProgress.stats.currentStreak,
        bestStreak: guestProgress.stats.bestStreak,
      },
    });

    // Migrate achievements
    let migratedAchievements = 0;
    for (const achievementSlug of guestProgress.achievements) {
      try {
        const achievement = await prisma.achievement.findUnique({
          where: { slug: achievementSlug },
        });

        if (achievement) {
          await prisma.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId,
                achievementId: achievement.id,
              },
            },
            update: {},
            create: {
              userId,
              achievementId: achievement.id,
            },
          });
          migratedAchievements++;
        }
      } catch (err) {
        console.error("Failed to migrate achievement:", err);
      }
    }

    return NextResponse.json({
      message: "Guest progress migrated successfully",
      migratedSessions,
      migratedAchievements,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Failed to migrate guest progress" },
      { status: 500 }
    );
  }
}
