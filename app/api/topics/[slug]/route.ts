import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/topics/[slug] - Get a single topic with questions
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const type = searchParams.get("type");
    const limit = searchParams.get("limit");

    const topic = await prisma.topic.findUnique({
      where: { slug },
      include: {
        questions: {
          where: {
            isActive: true,
            ...(difficulty && { difficulty }),
            ...(type && { type }),
          },
          take: limit ? parseInt(limit) : undefined,
        },
      },
    });

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Topic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: topic });
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch topic" },
      { status: 500 }
    );
  }
}

// PATCH /api/topics/[slug] - Update a topic
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const topic = await prisma.topic.update({
      where: { slug },
      data: body,
    });

    return NextResponse.json({ success: true, data: topic });
  } catch (error) {
    console.error("Error updating topic:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update topic" },
      { status: 500 }
    );
  }
}

// DELETE /api/topics/[slug] - Delete a topic (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    await prisma.topic.update({
      where: { slug },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Topic deleted" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
