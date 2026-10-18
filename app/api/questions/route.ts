import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/questions - Get questions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const type = searchParams.get("type");
    const limit = searchParams.get("limit");
    const random = searchParams.get("random") === "true";

    // Build where clause
    const where: Record<string, unknown> = { isActive: true };

    if (topic) {
      const topicRecord = await prisma.topic.findUnique({
        where: { slug: topic },
      });
      if (topicRecord) {
        where.topicId = topicRecord.id;
      }
    }

    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;

    let questions;

    if (random && limit) {
      // For random selection, get all matching questions then shuffle
      const allQuestions = await prisma.question.findMany({
        where,
        include: { topic: true },
      });

      // Fisher-Yates shuffle
      const shuffled = [...allQuestions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      questions = shuffled.slice(0, parseInt(limit));
    } else {
      questions = await prisma.question.findMany({
        where,
        include: { topic: true },
        take: limit ? parseInt(limit) : undefined,
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      data: questions,
      count: questions.length,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a new question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topicSlug, ...questionData } = body;

    // Get topic by slug
    const topic = await prisma.topic.findUnique({
      where: { slug: topicSlug },
    });

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Topic not found" },
        { status: 404 }
      );
    }

    const question = await prisma.question.create({
      data: {
        ...questionData,
        topicId: topic.id,
      },
      include: { topic: true },
    });

    return NextResponse.json({ success: true, data: question }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create question" },
      { status: 500 }
    );
  }
}

// POST /api/questions/bulk - Bulk create questions
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { questions } = body;

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: "Questions array is required" },
        { status: 400 }
      );
    }

    // Get all topics for mapping
    const topics = await prisma.topic.findMany();
    const topicMap = new Map(topics.map((t) => [t.slug, t.id]));

    interface QuestionInput {
      topicId: string;
      difficulty?: string;
      type?: string;
      front?: string;
      back?: string;
      [key: string]: unknown;
    }

    const questionsWithTopicIds: QuestionInput[] = questions
      .map((q: { topicSlug: string; [key: string]: unknown }) => {
        const { topicSlug, ...rest } = q;
        const topicId = topicMap.get(topicSlug);
        if (!topicId) return null;
        return {
          ...rest,
          topicId,
        } as QuestionInput;
      })
      .filter((q): q is QuestionInput => q !== null);

    if (questionsWithTopicIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No valid questions to create",
        count: 0,
      });
    }

    const created = await prisma.question.createMany({
      data: questionsWithTopicIds,
    });

    return NextResponse.json({
      success: true,
      message: `Created ${created.count} questions`,
      count: created.count,
    });
  } catch (error) {
    console.error("Error bulk creating questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create questions" },
      { status: 500 }
    );
  }
}
