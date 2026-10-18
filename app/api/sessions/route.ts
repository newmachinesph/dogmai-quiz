import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken, extractToken } from "@/lib/auth";
import { createSessionSchema, formatZodError } from "@/lib/validations";
import { z } from "zod";

const WIN_THRESHOLD = 70; // 70% to count as a win

// Query params validation
const getSessionsSchema = z.object({
  userId: z.string().optional(),
  game: z.string().optional(),
  topic: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

// GET /api/sessions - Get game sessions with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const validation = getSessionsSchema.safeParse(params);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: formatZodError(validation.error) },
        { status: 400 }
      );
    }

    const { userId, game, topic, limit, offset } = validation.data;

    // Build where clause
    const where: Record<string, unknown> = { isCompleted: true };
    if (userId) where.userId = userId;
    if (topic) where.topicSlug = topic;

    if (game) {
      const gameType = await prisma.gameType.findUnique({
        where: { slug: game },
        select: { id: true },
      });
      if (gameType) where.gameTypeId = gameType.id;
    }

    // Fetch with pagination
    const [sessions, total] = await Promise.all([
      prisma.gameSession.findMany({
        where,
        include: {
          gameType: {
            select: { id: true, slug: true, name: true, icon: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.gameSession.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: sessions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + sessions.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Record a new game session
export async function POST(request: NextRequest) {
  try {
    // Try to get user from auth token
    let userId: string | null = null;
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    // Validate request body
    const body = await request.json();
    const validation = createSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: formatZodError(validation.error) },
        { status: 400 }
      );
    }

    const {
      gameSlug,
      topicSlug,
      difficulty,
      score,
      maxScore,
      percentage,
      timeElapsed,
      moves,
      correctCount,
      totalCount,
    } = validation.data;

    // Get game type
    const gameType = await prisma.gameType.findUnique({
      where: { slug: gameSlug },
      select: { id: true, slug: true, name: true },
    });

    if (!gameType) {
      return NextResponse.json(
        { success: false, error: "Game type not found" },
        { status: 404 }
      );
    }

    // Create session
    const session = await prisma.gameSession.create({
      data: {
        userId,
        gameTypeId: gameType.id,
        topicSlug,
        difficulty,
        score,
        maxScore,
        percentage,
        timeElapsed,
        moves,
        correctCount,
        totalCount,
      },
      include: {
        gameType: {
          select: { id: true, slug: true, name: true, icon: true },
        },
      },
    });

    // Update user stats if authenticated
    if (userId) {
      const isWin = percentage >= WIN_THRESHOLD;

      // Get current stats to properly update best streak
      const currentStats = await prisma.userStats.findUnique({
        where: { userId },
        select: { currentStreak: true, bestStreak: true },
      });

      const newCurrentStreak = isWin
        ? (currentStats?.currentStreak ?? 0) + 1
        : 0;
      const newBestStreak = Math.max(
        newCurrentStreak,
        currentStats?.bestStreak ?? 0
      );

      await prisma.userStats.upsert({
        where: { userId },
        create: {
          userId,
          totalGames: 1,
          totalScore: score,
          totalTime: timeElapsed,
          gamesWon: isWin ? 1 : 0,
          currentStreak: isWin ? 1 : 0,
          bestStreak: isWin ? 1 : 0,
          lastPlayedAt: new Date(),
        },
        update: {
          totalGames: { increment: 1 },
          totalScore: { increment: score },
          totalTime: { increment: timeElapsed },
          gamesWon: isWin ? { increment: 1 } : undefined,
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
          lastPlayedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { success: true, data: session },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
      { status: 500 }
    );
  }
}
