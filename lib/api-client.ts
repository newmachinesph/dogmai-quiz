// API Client for fetching data from the backend
// This abstraction makes it easy to switch to Supabase later

const API_BASE = "/api";

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  questionCount?: number;
}

export interface GameType {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  component: string;
  category: string;
  isActive: boolean;
  order: number;
  timesPlayed?: number;
}

export interface Question {
  id: string;
  topicId: string;
  difficulty: string;
  type: string;
  front?: string | null;
  back?: string | null;
  question?: string | null;
  options?: string | null;
  correctIndex?: number | null;
  statement?: string | null;
  isTrue?: boolean | null;
  code?: string | null;
  output?: string | null;
  sentence?: string | null;
  blankAnswer?: string | null;
  sequenceItems?: string | null;
  correctOrder?: string | null;
  explanation?: string | null;
  hint?: string | null;
  topic?: Topic;
}

export interface GameSession {
  id: string;
  gameTypeId: string;
  topicSlug: string;
  difficulty: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeElapsed: number;
  moves?: number | null;
  correctCount?: number | null;
  totalCount?: number | null;
  createdAt: string;
  gameType?: GameType;
}

export interface UserStats {
  totalGames: number;
  totalScore: number;
  totalTime: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  category: string;
  requirement: number;
  rarity: string;
  isUnlocked?: boolean;
  unlockedAt?: string | null;
}

// Helper function for API calls
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "API request failed");
  }

  return data.data;
}

// Topics API
export const topicsAPI = {
  getAll: () => fetchAPI<Topic[]>("/topics"),

  getBySlug: (slug: string, options?: { difficulty?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (options?.difficulty) params.set("difficulty", options.difficulty);
    if (options?.limit) params.set("limit", options.limit.toString());
    const query = params.toString() ? `?${params}` : "";
    return fetchAPI<Topic & { questions: Question[] }>(`/topics/${slug}${query}`);
  },
};

// Questions API
export const questionsAPI = {
  getAll: (options?: {
    topic?: string;
    difficulty?: string;
    type?: string;
    limit?: number;
    random?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (options?.topic) params.set("topic", options.topic);
    if (options?.difficulty) params.set("difficulty", options.difficulty);
    if (options?.type) params.set("type", options.type);
    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.random) params.set("random", "true");
    const query = params.toString() ? `?${params}` : "";
    return fetchAPI<Question[]>(`/questions${query}`);
  },

  getById: (id: string) => fetchAPI<Question>(`/questions/${id}`),
};

// Games API
export const gamesAPI = {
  getAll: () => fetchAPI<GameType[]>("/games"),

  getBySlug: (slug: string) => fetchAPI<GameType>(`/games/${slug}`),
};

// Sessions API
export const sessionsAPI = {
  getRecent: (options?: { limit?: number; game?: string; topic?: string }) => {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.game) params.set("game", options.game);
    if (options?.topic) params.set("topic", options.topic);
    const query = params.toString() ? `?${params}` : "";
    return fetchAPI<GameSession[]>(`/sessions${query}`);
  },

  create: (session: {
    gameSlug: string;
    topicSlug: string;
    difficulty: string;
    score: number;
    maxScore: number;
    timeElapsed: number;
    moves?: number;
    correctCount?: number;
    totalCount?: number;
  }, token?: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(`${API_BASE}/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify(session),
    }).then(async (res) => {
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }
      return data.data as GameSession;
    });
  },
};

// Stats API
export const statsAPI = {
  getGlobal: () =>
    fetchAPI<{
      totalGames: number;
      totalPlayers: number;
      topScores: GameSession[];
      gameStats: unknown[];
      topicStats: unknown[];
    }>("/stats"),

  getUser: (userId: string) =>
    fetchAPI<{
      stats: UserStats;
      recentGames: GameSession[];
      achievements: Achievement[];
    }>(`/stats?userId=${userId}`),
};

// Achievements API
export const achievementsAPI = {
  getAll: (options?: { category?: string; userId?: string }) => {
    const params = new URLSearchParams();
    if (options?.category) params.set("category", options.category);
    if (options?.userId) params.set("userId", options.userId);
    const query = params.toString() ? `?${params}` : "";
    return fetchAPI<Achievement[]>(`/achievements${query}`);
  },
};

// Leaderboard API
export const leaderboardAPI = {
  get: (options?: {
    period?: "daily" | "weekly" | "monthly" | "all-time";
    game?: string;
    topic?: string;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (options?.period) params.set("period", options.period);
    if (options?.game) params.set("game", options.game);
    if (options?.topic) params.set("topic", options.topic);
    if (options?.limit) params.set("limit", options.limit.toString());
    const query = params.toString() ? `?${params}` : "";
    return fetchAPI<
      Array<{
        rank: number;
        score: number;
        percentage: number;
        timeElapsed: number;
        game: string;
        topic: string;
        difficulty: string;
        user: { username: string; displayName: string };
        playedAt: string;
      }>
    >(`/leaderboard${query}`);
  },
};

// Convert API question to game-ready format
export function convertToQuizPair(question: Question): { front: string; back: string } {
  if (question.front && question.back) {
    return { front: question.front, back: question.back };
  }

  // Convert other question types to pair format for games that need it
  if (question.statement) {
    return { front: question.statement, back: question.isTrue ? "True" : "False" };
  }

  if (question.code && question.output) {
    return { front: question.code, back: question.output };
  }

  if (question.question && question.options) {
    const options = JSON.parse(question.options) as string[];
    return { front: question.question, back: options[question.correctIndex ?? 0] };
  }

  if (question.sentence && question.blankAnswer) {
    return { front: question.sentence, back: question.blankAnswer };
  }

  return { front: "Unknown", back: "Unknown" };
}

// Convert API question to multiple choice format
export function convertToMultipleChoice(question: Question): {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
} | null {
  if (question.type !== "multiple-choice" && question.type !== "pair") return null;

  if (question.question && question.options) {
    return {
      question: question.question,
      options: JSON.parse(question.options),
      correctAnswer: question.correctIndex ?? 0,
      explanation: question.explanation ?? undefined,
    };
  }

  // Convert pair to multiple choice
  if (question.front && question.back) {
    return {
      question: `What is: ${question.front}`,
      options: [question.back], // Will need to add distractors
      correctAnswer: 0,
      explanation: question.explanation ?? undefined,
    };
  }

  return null;
}

// Convert API question to true/false format
export function convertToTrueFalse(question: Question): {
  statement: string;
  isTrue: boolean;
  explanation?: string;
} | null {
  if (question.type !== "true-false") return null;

  if (question.statement && question.isTrue !== null && question.isTrue !== undefined) {
    return {
      statement: question.statement,
      isTrue: question.isTrue,
      explanation: question.explanation ?? undefined,
    };
  }

  return null;
}

// Convert API question to code output format
export function convertToCodeOutput(question: Question): {
  code: string;
  output: string;
  explanation?: string;
} | null {
  if (question.type !== "code-output") return null;

  if (question.code && question.output) {
    return {
      code: question.code,
      output: question.output,
      explanation: question.explanation ?? undefined,
    };
  }

  return null;
}
