import { z } from "zod";

// ================================
// Auth Schemas
// ================================

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(50),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  displayName: z
    .string()
    .max(50, "Display name must be at most 50 characters")
    .optional(),
  guestData: z
    .object({
      sessions: z.array(z.any()).optional(),
      stats: z.any().optional(),
    })
    .optional(),
});

export const migrateGuestSchema = z.object({
  guestSessions: z.array(
    z.object({
      gameSlug: z.string(),
      topicSlug: z.string(),
      difficulty: z.string(),
      score: z.number(),
      maxScore: z.number(),
      percentage: z.number(),
      timeElapsed: z.number(),
      moves: z.number().optional(),
      correctCount: z.number().optional(),
      totalCount: z.number().optional(),
      completedAt: z.string(),
    })
  ),
});

// ================================
// Game Session Schemas
// ================================

export const createSessionSchema = z.object({
  gameSlug: z.string().min(1, "Game slug is required"),
  topicSlug: z.string().min(1, "Topic slug is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  score: z.number().int().min(0),
  maxScore: z.number().int().min(1),
  percentage: z.number().min(0).max(100),
  timeElapsed: z.number().int().min(0),
  moves: z.number().int().min(0).optional(),
  correctCount: z.number().int().min(0).optional(),
  totalCount: z.number().int().min(0).optional(),
});

export const getSessionsSchema = z.object({
  userId: z.string().optional(),
  gameSlug: z.string().optional(),
  topicSlug: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

// ================================
// Question Schemas
// ================================

export const getQuestionsSchema = z.object({
  topicSlug: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  type: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  random: z.coerce.boolean().default(true),
});

// ================================
// Leaderboard Schemas
// ================================

export const getLeaderboardSchema = z.object({
  period: z.enum(["daily", "weekly", "monthly", "all-time"]).default("all-time"),
  gameSlug: z.string().optional(),
  topicSlug: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// ================================
// Stats Schemas
// ================================

export const getStatsSchema = z.object({
  userId: z.string().optional(),
});

// ================================
// Achievement Schemas
// ================================

export const unlockAchievementSchema = z.object({
  achievementSlug: z.string().min(1, "Achievement slug is required"),
});

// ================================
// Type Exports
// ================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type MigrateGuestInput = z.infer<typeof migrateGuestSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type GetSessionsInput = z.infer<typeof getSessionsSchema>;
export type GetQuestionsInput = z.infer<typeof getQuestionsSchema>;
export type GetLeaderboardInput = z.infer<typeof getLeaderboardSchema>;
export type GetStatsInput = z.infer<typeof getStatsSchema>;
export type UnlockAchievementInput = z.infer<typeof unlockAchievementSchema>;

// ================================
// Helper Functions
// ================================

export function parseSearchParams<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> | { error: z.ZodError } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  if (!result.success) {
    return { error: result.error };
  }
  return result.data;
}

export function formatZodError(error: z.ZodError<unknown>): string {
  return error.issues.map((e) => e.message).join(", ");
}
