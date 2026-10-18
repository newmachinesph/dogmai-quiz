import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/games/[slug] - Get a single game type
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const game = await prisma.gameType.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { gameSessions: true },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...game,
        timesPlayed: game._count.gameSessions,
        _count: undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}

// PATCH /api/games/[slug] - Update a game type
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const game = await prisma.gameType.update({
      where: { slug },
      data: body,
    });

    return NextResponse.json({ success: true, data: game });
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update game" },
      { status: 500 }
    );
  }
}

// DELETE /api/games/[slug] - Delete a game type (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    await prisma.gameType.update({
      where: { slug },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Game deleted" });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete game" },
      { status: 500 }
    );
  }
}
