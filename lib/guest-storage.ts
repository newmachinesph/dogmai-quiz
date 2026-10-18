"use client";

// Guest progress storage using localStorage
// This allows guests to play and save progress without signing up

export interface GuestGameSession {
  id: string;
  gameTypeId: string;
  topicSlug: string;
  difficulty: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeElapsed: number;
  moves?: number;
  correctCount?: number;
  totalCount?: number;
  createdAt: string;
}

export interface GuestStats {
  totalGames: number;
  totalScore: number;
  totalTime: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedAt: string | null;
}

export interface GuestProgress {
  guestId: string;
  stats: GuestStats;
  sessions: GuestGameSession[];
  achievements: string[]; // Achievement slugs
  createdAt: string;
  updatedAt: string;
}

const GUEST_STORAGE_KEY = "dogmai_guest_progress";

// Generate a unique guest ID
function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get or create guest progress
export function getGuestProgress(): GuestProgress {
  if (typeof window === "undefined") {
    return createEmptyProgress();
  }

  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading guest progress:", error);
  }

  // Create new guest progress
  const newProgress = createEmptyProgress();
  saveGuestProgress(newProgress);
  return newProgress;
}

function createEmptyProgress(): GuestProgress {
  return {
    guestId: generateGuestId(),
    stats: {
      totalGames: 0,
      totalScore: 0,
      totalTime: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedAt: null,
    },
    sessions: [],
    achievements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Save guest progress
export function saveGuestProgress(progress: GuestProgress): void {
  if (typeof window === "undefined") return;

  try {
    progress.updatedAt = new Date().toISOString();
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving guest progress:", error);
  }
}

// Add a game session to guest progress
export function addGuestGameSession(session: Omit<GuestGameSession, "id" | "createdAt">): GuestGameSession {
  const progress = getGuestProgress();

  const newSession: GuestGameSession = {
    ...session,
    id: `session_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  // Add session (keep last 100 sessions)
  progress.sessions.unshift(newSession);
  if (progress.sessions.length > 100) {
    progress.sessions = progress.sessions.slice(0, 100);
  }

  // Update stats
  const stats = progress.stats;
  stats.totalGames += 1;
  stats.totalScore += session.score;
  stats.totalTime += session.timeElapsed;

  // Check if won (70% or above)
  const isWin = session.percentage >= 70;
  if (isWin) {
    stats.gamesWon += 1;
    stats.currentStreak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  stats.lastPlayedAt = new Date().toISOString();

  // Check for achievements
  checkGuestAchievements(progress);

  saveGuestProgress(progress);
  return newSession;
}

// Check and unlock achievements for guest
function checkGuestAchievements(progress: GuestProgress): void {
  const { stats, achievements } = progress;

  // Achievement definitions matching database slugs
  const achievementChecks = [
    { slug: "first-game", check: () => stats.totalGames >= 1 },
    { slug: "games-10", check: () => stats.totalGames >= 10 },
    { slug: "games-50", check: () => stats.totalGames >= 50 },
    { slug: "games-100", check: () => stats.totalGames >= 100 },
    { slug: "streak-3", check: () => stats.bestStreak >= 3 },
    { slug: "streak-7", check: () => stats.bestStreak >= 7 },
    { slug: "streak-14", check: () => stats.bestStreak >= 14 },
    { slug: "score-1000", check: () => stats.totalScore >= 1000 },
    { slug: "score-10000", check: () => stats.totalScore >= 10000 },
    { slug: "score-50000", check: () => stats.totalScore >= 50000 },
  ];

  for (const { slug, check } of achievementChecks) {
    if (!achievements.includes(slug) && check()) {
      achievements.push(slug);
    }
  }
}

// Get guest stats
export function getGuestStats(): GuestStats {
  return getGuestProgress().stats;
}

// Get guest sessions
export function getGuestSessions(limit?: number): GuestGameSession[] {
  const sessions = getGuestProgress().sessions;
  return limit ? sessions.slice(0, limit) : sessions;
}

// Get guest achievements
export function getGuestAchievements(): string[] {
  return getGuestProgress().achievements;
}

// Clear guest progress (when migrating to account)
export function clearGuestProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_STORAGE_KEY);
}

// Get guest ID
export function getGuestId(): string {
  return getGuestProgress().guestId;
}

// Check if there's existing guest progress
export function hasGuestProgress(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    if (stored) {
      const progress = JSON.parse(stored);
      return progress.stats.totalGames > 0;
    }
  } catch {
    // Ignore
  }
  return false;
}

// Export guest progress for migration
export function exportGuestProgress(): GuestProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
