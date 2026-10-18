"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { getGamesWithIcons } from "@/lib/game-registry";
import UserHeader from "./UserHeader";

interface HeaderProps {
  showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);

  const games = getGamesWithIcons();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <motion.header
      className="py-6 relative z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">DOGM.AI</span>
            <span className="text-orange-500 font-bold">Quiz</span>
          </Link>

          {/* Desktop Navigation */}
          {showNav && (
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted hover:text-foreground transition-colors font-mono text-sm"
                >
                  {link.label}
                </Link>
              ))}

              {/* Games Dropdown */}
              <div className="relative"
                onMouseEnter={() => setIsGamesOpen(true)}
                onMouseLeave={() => setIsGamesOpen(false)}
              >
                <button className="flex items-center gap-1 text-muted hover:text-foreground transition-colors font-mono text-sm">
                  Games
                  <ChevronDown className={`w-4 h-4 transition-transform ${isGamesOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isGamesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-background border border-white/10 rounded-xl p-2 shadow-xl max-h-96 overflow-y-auto"
                    >
                      {games.map((game) => (
                        <Link
                          key={game.href}
                          href={game.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors text-sm"
                        >
                          <game.IconComponent className="w-4 h-4 text-orange-500" />
                          {game.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/game/flip-match" className="btn-primary text-sm">
                Start Playing
              </Link>

              <UserHeader />
            </nav>
          )}

          {/* Mobile Menu Button */}
          {showNav && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-muted hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showNav && isMenuOpen && (
            <motion.nav
              className="md:hidden mt-6 pb-4 border-t border-white/10 pt-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-muted hover:text-foreground transition-colors font-mono py-2"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-white/10 pt-4 mt-2">
                  <p className="text-sm font-semibold mb-3">Games</p>
                  <div className="grid grid-cols-2 gap-2">
                    {games.map((game) => (
                      <Link
                        key={game.href}
                        href={game.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 text-muted hover:text-foreground transition-colors font-mono text-sm py-2"
                      >
                        <game.IconComponent className="w-4 h-4 text-orange-500" />
                        {game.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href="/game/flip-match"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-primary text-center mt-2"
                >
                  Start Playing
                </Link>

                <div className="border-t border-white/10 pt-4 mt-4">
                  <UserHeader />
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
