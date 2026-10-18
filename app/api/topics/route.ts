import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/topics - Get all topics
export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: topics.map((topic) => ({
        ...topic,
        questionCount: topic._count.questions,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

// POST /api/topics - Create a new topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, icon, color, order } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const topic = await prisma.topic.create({
      data: {
        name,
        slug,
        description,
        icon,
        color,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: topic }, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
