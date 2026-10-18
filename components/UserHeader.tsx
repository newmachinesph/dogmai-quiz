"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  LogIn,
  LogOut,
  Trophy,
  Flame,
  Gamepad2,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function UserHeader() {
  const { user, isGuest, isAdmin, guestStats, logout, isLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="flex items-center gap-3">
        {/* Guest stats */}
        {guestStats && guestStats.totalGames > 0 && (
          <div className="hidden sm:flex items-center gap-4 mr-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted">
              <Gamepad2 className="w-4 h-4" />
              <span>{guestStats.totalGames}</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-500">
              <Trophy className="w-4 h-4" />
              <span>{guestStats.totalScore}</span>
            </div>
            {guestStats.currentStreak > 0 && (
              <div className="flex items-center gap-1.5 text-red-500">
                <Flame className="w-4 h-4" />
                <span>{guestStats.currentStreak}</span>
              </div>
            )}
          </div>
        )}

        <Link
          href="/login"
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Sign In</span>
        </Link>

        <Link
          href="/signup"
          className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Up</span>
        </Link>
      </div>
    );
  }

  // Logged in user
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
      >
        {/* User stats */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted">
            <Gamepad2 className="w-4 h-4" />
            <span>{user?.stats?.totalGames || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-500">
            <Trophy className="w-4 h-4" />
            <span>{user?.stats?.totalScore || 0}</span>
          </div>
          {(user?.stats?.currentStreak || 0) > 0 && (
            <div className="flex items-center gap-1.5 text-red-500">
              <Flame className="w-4 h-4" />
              <span>{user?.stats?.currentStreak}</span>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold">
            {user?.displayName?.charAt(0).toUpperCase() ||
              user?.username?.charAt(0).toUpperCase()}
          </div>
          {isAdmin && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="hidden sm:block text-left">
          <p className="font-medium text-sm">{user?.displayName || user?.username}</p>
          <p className="text-xs text-muted">
            {isAdmin ? "Admin" : "Player"}
          </p>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-64 card p-2 z-50"
            >
              {/* User info */}
              <div className="p-3 border-b border-white/10 mb-2">
                <p className="font-medium">{user?.displayName || user?.username}</p>
                <p className="text-sm text-muted">@{user?.username}</p>
                {user?.email && (
                  <p className="text-xs text-muted mt-1">{user?.email}</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-white/[0.02] rounded-lg mb-2">
                <div className="text-center">
                  <p className="text-lg font-bold">{user?.stats?.totalGames || 0}</p>
                  <p className="text-xs text-muted">Games</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-500">
                    {user?.stats?.totalScore || 0}
                  </p>
                  <p className="text-xs text-muted">Score</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-500">
                    {user?.stats?.gamesWon || 0}
                  </p>
                  <p className="text-xs text-muted">Wins</p>
                </div>
              </div>

              {/* Links */}
              <Link
                href="/dashboard"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Trophy className="w-4 h-4 text-muted" />
                <span className="text-sm">Dashboard</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-purple-400"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Admin Panel</span>
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 transition-colors text-red-400 w-full"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
