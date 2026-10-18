import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/games - Get all game types
export async function GET() {
  try {
    const games = await prisma.gameType.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { gameSessions: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: games.map((game) => ({
        ...game,
        timesPlayed: game._count.gameSessions,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

// POST /api/games - Create a new game type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, name, description, icon, component, category, order } = body;

    if (!slug || !name || !component) {
      return NextResponse.json(
        { success: false, error: "Slug, name, and component are required" },
        { status: 400 }
      );
    }

    const game = await prisma.gameType.create({
      data: {
        slug,
        name,
        description,
        icon,
        component,
        category: category ?? "quiz",
        order: order ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: game }, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create game" },
      { status: 500 }
    );
  }
}
