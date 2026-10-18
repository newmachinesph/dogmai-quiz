import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/achievements - Get all achievements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const userId = searchParams.get("userId");

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;

    const achievements = await prisma.achievement.findMany({
      where,
      orderBy: [{ category: "asc" }, { requirement: "asc" }],
    });

    // If userId provided, include unlock status
    if (userId) {
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, unlockedAt: true },
      });

      const unlockedMap = new Map(
        userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
      );

      const achievementsWithStatus = achievements.map((a) => ({
        ...a,
        isUnlocked: unlockedMap.has(a.id),
        unlockedAt: unlockedMap.get(a.id) ?? null,
      }));

      return NextResponse.json({ success: true, data: achievementsWithStatus });
    }

    return NextResponse.json({ success: true, data: achievements });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

// POST /api/achievements - Create a new achievement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, name, description, icon, category, requirement, rarity } = body;

    if (!slug || !name || !description || !category || requirement === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievement.create({
      data: {
        slug,
        name,
        description,
        icon,
        category,
        requirement,
        rarity: rarity ?? "common",
      },
    });

    return NextResponse.json({ success: true, data: achievement }, { status: 201 });
  } catch (error) {
    console.error("Error creating achievement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create achievement" },
      { status: 500 }
    );
  }
}

// POST /api/achievements/unlock - Unlock an achievement for a user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, achievementSlug } = body;

    if (!userId || !achievementSlug) {
      return NextResponse.json(
        { success: false, error: "User ID and achievement slug are required" },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievement.findUnique({
      where: { slug: achievementSlug },
    });

    if (!achievement) {
      return NextResponse.json(
        { success: false, error: "Achievement not found" },
        { status: 404 }
      );
    }

    // Check if already unlocked
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        message: "Achievement already unlocked",
      });
    }

    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
      include: { achievement: true },
    });

    return NextResponse.json(
      { success: true, data: userAchievement },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unlock achievement" },
      { status: 500 }
    );
  }
}
