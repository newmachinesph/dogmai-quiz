"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Flame,
  Clock,
  Gamepad2,
  TrendingUp,
  Calendar,
  Award,
  Loader2,
  Medal,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BentoItem from "@/components/BentoItem";
import {
  sessionsAPI,
  achievementsAPI,
  topicsAPI,
  Topic,
  GameSession,
  Achievement,
} from "@/lib/api-client";

interface DashboardStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 0,
    totalScore: 0,
    averageScore: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [recentGames, setRecentGames] = useState<GameSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [sessionsData, achievementsData, topicsData] = await Promise.all([
          sessionsAPI.getRecent({ limit: 10 }),
          achievementsAPI.getAll(),
          topicsAPI.getAll(),
        ]);

        setRecentGames(sessionsData);
        setAchievements(achievementsData.slice(0, 5)); // Show first 5 achievements
        setTopics(topicsData);

        // Calculate stats from sessions
        if (sessionsData.length > 0) {
          const totalScore = sessionsData.reduce((sum, g) => sum + g.score, 0);
          setStats({
            totalGames: sessionsData.length,
            totalScore,
            averageScore: Math.round(totalScore / sessionsData.length),
            currentStreak: 0, // Would need user-specific data
            bestStreak: 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case "legendary":
        return "text-yellow-500 bg-yellow-500/20";
      case "epic":
        return "text-purple-500 bg-purple-500/20";
      case "rare":
        return "text-blue-500 bg-blue-500/20";
      default:
        return "text-green-500 bg-green-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-muted font-mono">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="page-container">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="heading-2 mb-2">Dashboard</h1>
            <p className="text-muted font-mono">
              Track your progress and achievements
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <BentoItem className="p-6">
              <div className="stat-icon w-12 h-12 mb-4">
                <Gamepad2 className="w-6 h-6 text-orange-500" />
              </div>
              <div className="stat-value">{stats.totalGames}</div>
              <div className="stat-label mt-1">Games Played</div>
            </BentoItem>

            <BentoItem className="p-6">
              <div className="stat-icon w-12 h-12 mb-4">
                <Trophy className="w-6 h-6 text-orange-500" />
              </div>
              <div className="stat-value">{stats.totalScore.toLocaleString()}</div>
              <div className="stat-label mt-1">Total Score</div>
            </BentoItem>

            <BentoItem className="p-6">
              <div className="stat-icon w-12 h-12 mb-4">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <div className="stat-value">{stats.averageScore}</div>
              <div className="stat-label mt-1">Average Score</div>
            </BentoItem>

            <BentoItem className="p-6">
              <div className="stat-icon w-12 h-12 mb-4">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div className="stat-value">{stats.currentStreak}</div>
              <div className="stat-label mt-1">Day Streak</div>
            </BentoItem>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Games */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="heading-3">Recent Games</h2>
                  <Link
                    href="/game/flip-match"
                    className="text-orange-500 hover:text-orange-400 font-mono text-sm"
                  >
                    Play New Game
                  </Link>
                </div>

                {recentGames.length === 0 ? (
                  <div className="text-center py-12">
                    <Gamepad2 className="w-12 h-12 text-muted mx-auto mb-4" />
                    <p className="text-muted font-mono mb-4">No games played yet</p>
                    <Link href="/game/flip-match" className="btn-primary text-sm">
                      Play Your First Game
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentGames.map((game, index) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Gamepad2 className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {game.gameType?.name || "Quiz Game"}
                            </h3>
                            <p className="text-xs text-muted font-mono">
                              {game.topicSlug} - {game.difficulty}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xs text-muted font-mono">Score</div>
                            <div className="font-bold text-orange-500">{game.score}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted font-mono">Time</div>
                            <div className="font-bold">{formatTime(game.timeElapsed)}</div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <div className="text-xs text-muted font-mono">Accuracy</div>
                            <div className="font-bold">{Math.round(game.percentage)}%</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Achievements */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-5 h-5 text-orange-500" />
                  <h2 className="heading-3">Achievements</h2>
                </div>

                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${getRarityColor(
                          achievement.rarity
                        )}`}
                      >
                        <Medal className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{achievement.name}</div>
                        <div className="text-xs text-muted font-mono">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <h2 className="heading-3">Stats</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted font-mono text-sm">Best Streak</span>
                    <span className="font-bold">{stats.bestStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted font-mono text-sm">Current Streak</span>
                    <span className="font-bold text-orange-500">
                      {stats.currentStreak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted font-mono text-sm">Avg. Score</span>
                    <span className="font-bold">{stats.averageScore} pts</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <h2 className="heading-3">Quick Play</h2>
                </div>

                <div className="space-y-3">
                  {topics.slice(0, 4).map((topic) => (
                    <Link
                      key={topic.slug}
                      href={`/game/flip-match?category=${topic.slug}`}
                      className="block w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/30 transition-colors text-center font-mono text-sm"
                    >
                      {topic.name} Quiz
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
