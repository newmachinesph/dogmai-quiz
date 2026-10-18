// ================================
// Question Types
// ================================

export interface QuizPair {
  id?: string;
  front: string;
  back: string;
}

export interface MultipleChoiceQuestion {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface TrueFalseQuestion {
  id?: string;
  statement: string;
  isTrue: boolean;
  explanation?: string;
}

export interface FillBlankQuestion {
  id?: string;
  sentence: string;
  blankAnswer: string;
  hint?: string;
}

export interface SequenceQuestion {
  id?: string;
  sequenceItems: string[];
  correctOrder: number[];
}

export interface CodeOutputQuestion {
  id?: string;
  code: string;
  output: string;
  explanation?: string;
}

// Unified question type from database
export interface Question {
  id: string;
  topicId: string;
  difficulty: Difficulty;
  type: QuestionType;
  // Pair type
  front?: string | null;
  back?: string | null;
  // Multiple choice
  question?: string | null;
  options?: string | null; // JSON string array
  correctIndex?: number | null;
  // True/False
  statement?: string | null;
  isTrue?: boolean | null;
  // Code output
  code?: string | null;
  output?: string | null;
  // Fill blank
  sentence?: string | null;
  blankAnswer?: string | null;
  // Sequence
  sequenceItems?: string | null; // JSON string array
  correctOrder?: string | null; // JSON string array
  // Common
  explanation?: string | null;
  hint?: string | null;
  tags?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ================================
// Game Types
// ================================

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type QuestionType =
  | "pair"
  | "multiple-choice"
  | "true-false"
  | "code-output"
  | "fill-blank"
  | "sequence";

export type GameSlug =
  | "flip-match"
  | "multiple-choice"
  | "true-false"
  | "speed-quiz"
  | "code-output"
  | "fill-blank"
  | "sequence"
  | "typing-challenge"
  | "hangman"
  | "drag-drop"
  | "word-scramble"
  | "survival"
  | "code-debugger"
  | "beat-the-clock"
  | "memory-chain"
  | "rapid-fire"
  | "code-completion"
  | "whack-a-mole"
  | "hot-potato"
  | "lightning-round"
  | "first-letter"
  | "avalanche";

export interface GameType {
  id: string;
  slug: GameSlug;
  name: string;
  description: string | null;
  icon: string | null;
  component: string;
  category: string;
  isActive: boolean;
  order: number;
}

// ================================
// Game State Types
// ================================

export interface GameCard {
  id: string;
  content: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameResult {
  score: number;
  maxScore: number;
  percentage: number;
  timeElapsed: number;
  moves?: number;
  correctCount?: number;
  totalCount?: number;
}

export interface GameStats {
  score: number;
  moves: number;
  timeElapsed: number;
  matches: number;
  totalPairs: number;
}

// ================================
// User Types
// ================================

export interface User {
  id: string;
  username: string;
  email: string | null;
  displayName: string | null;
  role: "player" | "admin";
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UserStats {
  id: string;
  userId: string;
  totalGames: number;
  totalScore: number;
  totalTime: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedAt: string | null;
}

export interface UserWithStats extends User {
  stats: UserStats | null;
}

// ================================
// Session Types
// ================================

export interface GameSession {
  id: string;
  userId: string | null;
  gameTypeId: string;
  topicSlug: string;
  difficulty: Difficulty;
  score: number;
  maxScore: number;
  percentage: number;
  timeElapsed: number;
  moves: number | null;
  correctCount: number | null;
  totalCount: number | null;
  isCompleted: boolean;
  createdAt: string;
  gameType?: GameType;
}

export interface RecentGame {
  id: string;
  title: string;
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  time: number;
  date: string;
  gameSlug: GameSlug;
}

// ================================
// Achievement Types
// ================================

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  category: string;
  requirement: number;
  rarity: AchievementRarity;
  isActive: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement?: Achievement;
}

// ================================
// Topic Types
// ================================

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  _count?: {
    questions: number;
  };
}

// ================================
// Leaderboard Types
// ================================

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "all-time";

export interface LeaderboardEntry {
  id: string;
  period: LeaderboardPeriod;
  gameSlug: string | null;
  topicSlug: string | null;
  username: string;
  userId: string | null;
  score: number;
  rank: number | null;
  periodDate: string;
}

// ================================
// API Response Types
// ================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ================================
// Game Component Props
// ================================

export interface BaseGameProps {
  difficulty: Difficulty;
  topicSlug: string;
  onComplete: (result: GameResult) => void;
  onQuit?: () => void;
}

export interface FlipMatchGameProps extends BaseGameProps {
  pairs: QuizPair[];
}

export interface MultipleChoiceGameProps extends BaseGameProps {
  questions: MultipleChoiceQuestion[];
}

export interface TrueFalseGameProps extends BaseGameProps {
  questions: TrueFalseQuestion[];
}

export interface CodeOutputGameProps extends BaseGameProps {
  questions: CodeOutputQuestion[];
}

export interface FillBlankGameProps extends BaseGameProps {
  questions: FillBlankQuestion[];
}

export interface SequenceGameProps extends BaseGameProps {
  questions: SequenceQuestion[];
}

// Generic game component props for dynamic loading
// Uses unknown[] for questions to allow flexible typing from API responses
export interface GameComponentProps {
  pairs?: QuizPair[];
  questions?: unknown[];
  difficulty: Difficulty;
  topicSlug?: string;
  onComplete: (score: number, maxScore: number, timeElapsed: number, moves?: number) => void;
  onQuit?: () => void;
}

// ================================
// Form Types
// ================================

export interface LoginFormData {
  username: string;
  password: string;
}

export interface SignupFormData {
  username: string;
  email?: string;
  password: string;
  displayName?: string;
}

// ================================
// Guest Data Types (localStorage)
// ================================

export interface GuestSession {
  gameSlug: string;
  topicSlug: string;
  difficulty: Difficulty;
  score: number;
  maxScore: number;
  percentage: number;
  timeElapsed: number;
  moves?: number;
  correctCount?: number;
  totalCount?: number;
  completedAt: string;
}

export interface GuestStats {
  totalGames: number;
  totalScore: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
}

export interface GuestData {
  sessions: GuestSession[];
  stats: GuestStats;
}
