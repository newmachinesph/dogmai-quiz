"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getGamesWithIcons, getEnabledGamesCount } from "@/lib/game-registry";

const categories = ["HTML", "CSS", "JavaScript", "Node", "React", "SQL", "PostgreSQL", "REST API", "Git"];

export default function Footer() {
  const games = getGamesWithIcons();
  const totalGames = getEnabledGamesCount();
  const displayedGames = games.slice(0, 10);
  const remainingGames = totalGames - displayedGames.length;

  return (
    <motion.footer
      className="mt-auto py-12 border-t border-white/10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold">DOGM.AI</span>
              <span className="text-orange-500 font-bold">Quiz</span>
            </Link>
            <p className="text-muted font-mono text-sm max-w-sm">
              Interactive quiz games for DOGM.AI Bootcamp students. Master
              coding concepts through play.
            </p>
          </div>

          {/* Topics */}
          <div>
            <h4 className="font-semibold mb-4">Topics</h4>
            <ul className="space-y-2 text-sm text-muted font-mono">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/game/flip-match?category=${cat}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Topics */}
          <div>
            <h4 className="font-semibold mb-4">More Topics</h4>
            <ul className="space-y-2 text-sm text-muted font-mono">
              {categories.slice(5).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/game/flip-match?category=${cat}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Games */}
          <div>
            <h4 className="font-semibold mb-4">Games ({totalGames})</h4>
            <ul className="space-y-2 text-sm text-muted font-mono">
              {displayedGames.map((game) => (
                <li key={game.href}>
                  <Link
                    href={game.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {game.name}
                  </Link>
                </li>
              ))}
              {remainingGames > 0 && (
                <li>
                  <Link
                    href="/"
                    className="hover:text-foreground transition-colors text-orange-500"
                  >
                    + {remainingGames} more games...
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted text-sm font-mono">
            &copy; 2026 DOGM.AI Quiz Platform
          </p>
          <div className="flex gap-6 text-sm text-muted font-mono">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/game/flip-match" className="hover:text-foreground transition-colors">
              Play Now
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
