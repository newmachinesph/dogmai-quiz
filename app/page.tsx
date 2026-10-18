"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Target,
  Trophy,
  Brain,
  Code,
  GitBranch,
  Layers,
  ArrowRight,
  Play,
  Gamepad2,
  FileCode,
  Palette,
  Terminal,
  Database,
  Server,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BentoItem from "@/components/BentoItem";
import { getGamesWithIcons, getEnabledGamesCount } from "@/lib/game-registry";

export default function HomePage() {
  const categories = [
    { name: "HTML", icon: FileCode, description: "Learn HTML elements and structure" },
    { name: "CSS", icon: Palette, description: "Master CSS styling and layouts" },
    { name: "JavaScript", icon: Code, description: "JS fundamentals and concepts" },
    { name: "Node", icon: Terminal, description: "Node.js runtime and modules" },
    { name: "React", icon: Layers, description: "React hooks and patterns" },
    { name: "SQL", icon: Database, description: "SQL queries and commands" },
    { name: "PostgreSQL", icon: Database, description: "PostgreSQL specific features" },
    { name: "REST API", icon: Server, description: "REST API design patterns" },
    { name: "Git", icon: GitBranch, description: "Version control mastery" },
  ];

  const games = getGamesWithIcons();
  const gamesCount = getEnabledGamesCount();

  const features = [
    { icon: Zap, title: "Fast Learning", description: "Learn through interactive games" },
    { icon: Target, title: "Track Progress", description: "Monitor your improvement" },
    { icon: Trophy, title: "Compete", description: "Challenge your classmates" },
    { icon: Brain, title: "Retain Better", description: "Game-based learning sticks" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 lg:py-20">
          <div className="page-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <BentoItem className="lg:col-span-2 p-8 sm:p-12">
                <div className="flex flex-col justify-center h-full">
                  <p className="label mb-4">DOGM.AI Bootcamp</p>
                  <h1 className="heading-1 mb-6">
                    Learn to Code
                    <br />
                    <span className="text-orange-500">Through Games</span>
                  </h1>
                  <p className="body-text max-w-xl mb-8">
                    Interactive quiz games designed for DOGM.AI Bootcamp students.
                    Master HTML, CSS, JavaScript, Node, React, SQL, REST APIs, and Git through engaging gameplay.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/game/flip-match" className="btn-primary">
                      <Play className="w-5 h-5" />
                      Start Playing
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/dashboard" className="btn-secondary">
                      View Dashboard
                    </Link>
                  </div>
                </div>
              </BentoItem>

              <div className="flex flex-col gap-6">
                <BentoItem className="p-8" delay={0.1}>
                  <Gamepad2 className="w-8 h-8 text-orange-500 mb-4" />
                  <div className="stat-value">{gamesCount}</div>
                  <p className="stat-label mt-1">Game Types</p>
                </BentoItem>

                <BentoItem className="p-8" delay={0.2}>
                  <Trophy className="w-8 h-8 text-orange-500 mb-4" />
                  <div className="stat-value">9</div>
                  <p className="stat-label mt-1">Topics</p>
                </BentoItem>
              </div>
            </div>
          </div>
        </section>

        {/* Games Section */}
        <section className="py-16">
          <div className="page-container">
            <div className="text-center mb-12">
              <p className="label mb-4">Choose Your Game</p>
              <h2 className="heading-2">{gamesCount} Ways to Learn</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {games.map((game, index) => (
                <Link key={game.id} href={game.href}>
                  <BentoItem className="p-4 h-full card-interactive" delay={index * 0.05}>
                    <game.IconComponent className="w-8 h-8 text-orange-500 mb-3" />
                    <h3 className="font-bold text-sm mb-1">{game.name}</h3>
                    <p className="text-muted font-mono text-xs">{game.description}</p>
                  </BentoItem>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="page-container">
            <div className="text-center mb-12">
              <p className="label mb-4">Why Play?</p>
              <h2 className="heading-2">Learn Better Through Play</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <BentoItem key={feature.title} className="p-6" delay={index * 0.1}>
                  <feature.icon className="w-10 h-10 text-orange-500 mb-4" />
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted font-mono text-sm">{feature.description}</p>
                </BentoItem>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="page-container">
            <div className="text-center mb-12">
              <p className="label mb-4">Pick a Topic</p>
              <h2 className="heading-2">9 Categories</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 section-container">
              {categories.map((category, index) => (
                <Link key={category.name} href={`/game/flip-match?category=${category.name}`}>
                  <BentoItem className="p-6 h-full card-interactive" delay={index * 0.05}>
                    <category.icon className="w-10 h-10 text-orange-500 mb-3" />
                    <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                    <p className="text-muted font-mono text-sm mb-4">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="label">3 Levels</span>
                      <ArrowRight className="w-4 h-4 text-muted" />
                    </div>
                  </BentoItem>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="page-container">
            <BentoItem className="p-12 sm:p-16 text-center content-container">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="heading-2 mb-4">Ready to Level Up?</h2>
                <p className="body-text mb-8 max-w-lg mx-auto">
                  Join DOGM.AI students mastering code through interactive games.
                </p>
                <Link href="/game/flip-match" className="btn-primary">
                  <Play className="w-5 h-5" />
                  Start Your First Game
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </BentoItem>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
