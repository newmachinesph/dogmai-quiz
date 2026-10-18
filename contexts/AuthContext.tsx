"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  getGuestProgress,
  addGuestGameSession,
  getGuestStats,
  clearGuestProgress,
  hasGuestProgress,
  exportGuestProgress,
  GuestStats,
  GuestGameSession,
} from "@/lib/guest-storage";

interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  role: string;
  avatarUrl?: string;
  stats?: {
    totalGames: number;
    totalScore: number;
    totalTime: number;
    gamesWon: number;
    currentStreak: number;
    bestStreak: number;
    lastPlayedAt?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  guestStats: GuestStats | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  saveGameProgress: (session: GameSessionData) => Promise<void>;
}

interface SignupData {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
  migrateGuestProgress?: boolean;
}

interface GameSessionData {
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
}

const AUTH_TOKEN_KEY = "dogmai_auth_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);

  const isGuest = !user;
  const isAdmin = user?.role === "admin";

  // Load guest stats
  const loadGuestStats = useCallback(() => {
    if (typeof window !== "undefined") {
      setGuestStats(getGuestStats());
    }
  }, []);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        try {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token invalid, remove it
            localStorage.removeItem(AUTH_TOKEN_KEY);
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      }

      // Load guest stats regardless
      loadGuestStats();
      setIsLoading(false);
    };

    checkAuth();
  }, [loadGuestStats]);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const signup = async (signupData: SignupData) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupData.username,
          password: signupData.password,
          email: signupData.email,
          displayName: signupData.displayName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Signup failed" };
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setUser(data.user);

      // Migrate guest progress if requested
      if (signupData.migrateGuestProgress && hasGuestProgress()) {
        const guestProgress = exportGuestProgress();
        if (guestProgress) {
          try {
            await fetch("/api/auth/migrate-guest", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.token}`,
              },
              body: JSON.stringify({ guestProgress }),
            });

            // Clear guest progress after successful migration
            clearGuestProgress();
            loadGuestStats();
          } catch (migrationError) {
            console.error("Failed to migrate guest progress:", migrationError);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    loadGuestStats();
  };

  const refreshUser = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const saveGameProgress = async (sessionData: GameSessionData) => {
    const percentage = sessionData.maxScore > 0
      ? (sessionData.score / sessionData.maxScore) * 100
      : 0;

    if (user) {
      // Save to server for authenticated users
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      try {
        await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            gameSlug: sessionData.gameTypeId,
            topicSlug: sessionData.topicSlug,
            difficulty: sessionData.difficulty,
            score: sessionData.score,
            maxScore: sessionData.maxScore,
            timeElapsed: sessionData.timeElapsed,
            moves: sessionData.moves,
            correctCount: sessionData.correctCount,
            totalCount: sessionData.totalCount,
          }),
        });

        // Refresh user to get updated stats
        await refreshUser();
      } catch (error) {
        console.error("Failed to save game session:", error);
      }
    } else {
      // Save to localStorage for guests
      addGuestGameSession({
        ...sessionData,
        percentage,
      });
      loadGuestStats();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isLoading,
        isAdmin,
        guestStats,
        login,
        signup,
        logout,
        refreshUser,
        saveGameProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
