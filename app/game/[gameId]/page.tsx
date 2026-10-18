"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useParams, notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Code2, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { QuizPair } from "@/types";
import {
  topicsAPI,
  questionsAPI,
  sessionsAPI,
  convertToQuizPair,
  Topic,
  Question,
} from "@/lib/api-client";
import {
  getGameById,
  getGameIcon,
  getGameComponent,
  GameConfig,
} from "@/lib/game-registry";
import { useAuth } from "@/contexts/AuthContext";

// Icon mapping for topics
const topicIcons: Record<string, string> = {
  html: "Code2",
  css: "Palette",
  javascript: "FileCode",
  typescript: "FileType",
  react: "Atom",
  nextjs: "Layers",
  nodejs: "Server",
  sql: "Database",
  postgresql: "Database",
  git: "GitBranch",
  "rest-api": "Link",
  graphql: "Share2",
  docker: "Container",
  python: "Code",
  tailwind: "Wind",
};

function GameContent({ gameConfig }: { gameConfig: GameConfig }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const difficultyParam = searchParams.get("difficulty") as
    | "beginner"
    | "intermediate"
    | "advanced"
    | null;

  const { user, isGuest, saveGameProgress } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryParam
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >(difficultyParam || "beginner");
  const [gameStarted, setGameStarted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentPairs, setCurrentPairs] = useState<QuizPair[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);

  const difficulties: ("beginner" | "intermediate" | "advanced")[] = [
    "beginner",
    "intermediate",
    "advanced",
  ];

  const GameComponent = getGameComponent(gameConfig.component);
  const GameIcon = getGameIcon(gameConfig.icon);

  // Fetch topics on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await topicsAPI.getAll();
        setTopics(data);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (difficultyParam) {
      setSelectedDifficulty(difficultyParam);
    }
  }, [categoryParam, difficultyParam]);

  // Get appropriate question limit based on game type
  const getQuestionLimit = (gameId: string): number => {
    const limits: Record<string, number> = {
      "flip-match": 8,        // 8 pairs = 16 cards (4x4 grid)
      "memory-chain": 8,      // 8 terms to memorize
      "whack-a-mole": 10,     // 10 rounds
      "hot-potato": 10,       // 10 questions
      "lightning-round": 12,  // 12 questions
      "first-letter": 10,     // 10 terms to guess
      "avalanche": 10,        // 10 questions
      "multiple-choice": 10,  // 10 questions
      "true-false": 10,       // 10 questions
      "speed-quiz": 10,       // 10 questions
      "survival": 15,         // More questions for survival
      "typing-challenge": 10, // 10 terms
      "hangman": 8,           // 8 words
      "word-scramble": 8,     // 8 words
      "fill-blank": 10,       // 10 sentences
      "sequence": 8,          // 8 sequence puzzles
      "code-output": 8,       // 8 code snippets
      "code-debugger": 6,     // 6 debugging challenges
      "code-completion": 6,   // 6 completion challenges
    };
    return limits[gameId] ?? 10;
  };

  const startGame = useCallback(async () => {
    if (!selectedCategory) return;

    setLoadingQuestions(true);
    try {
      const questionLimit = getQuestionLimit(gameConfig.id);

      // Fetch questions from API
      const questions = await questionsAPI.getAll({
        topic: selectedCategory,
        difficulty: selectedDifficulty,
        limit: questionLimit,
        random: true,
      });

      if (questions.length === 0) {
        console.error("No questions found");
        setLoadingQuestions(false);
        return;
      }

      // Store the raw questions for games that need specific types
      setCurrentQuestions(questions);

      // Convert to pairs for games that use that format
      const pairs = questions.map(convertToQuizPair);
      setCurrentPairs(pairs);
      setGameStarted(true);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoadingQuestions(false);
    }
  }, [selectedCategory, selectedDifficulty, gameConfig.id]);

  const handleGameComplete = async (score: number, ...args: unknown[]) => {
    const [maxScore, timeElapsed, moves, correctCount, totalCount] = args as [
      number | undefined,
      number | undefined,
      number | undefined,
      number | undefined,
      number | undefined
    ];

    console.log("Game completed:", {
      score,
      maxScore,
      timeElapsed,
      moves,
      correctCount,
      totalCount,
      isGuest,
      userId: user?.id,
    });

    // Use the auth context to save progress (handles both guest and logged-in users)
    try {
      await saveGameProgress({
        gameTypeId: gameConfig.id,
        topicSlug: selectedCategory!,
        difficulty: selectedDifficulty,
        score,
        maxScore: maxScore ?? score,
        percentage: maxScore && maxScore > 0 ? (score / maxScore) * 100 : 0,
        timeElapsed: timeElapsed ?? 0,
        moves,
        correctCount,
        totalCount,
      });
    } catch (error) {
      console.error("Failed to record session:", error);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentPairs([]);
    setCurrentQuestions([]);
  };

  if (!GameComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted font-mono">Game component not found</p>
        </div>
      </div>
    );
  }

  const selectedTopic = topics.find((t) => t.slug === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="page-container">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-sm">Back to Home</span>
          </Link>

          {!gameStarted ? (
            <div className="section-container">
              <div className="text-center mb-8">
                <div className="stat-icon w-16 h-16 mx-auto mb-6">
                  <GameIcon className="w-8 h-8 text-orange-500" />
                </div>
                <h1 className="heading-2 mb-4">{gameConfig.name}</h1>
                <p className="text-muted font-mono max-w-md mx-auto">
                  {gameConfig.description}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
                {/* Left Column - Category Selection (scrollable) */}
                <div className="card p-6 max-h-[50vh] overflow-y-auto order-2 lg:order-1">
                  <h2 className="heading-3 mb-4 sticky top-0 bg-[#0a0a0a] pb-3 -mt-1 pt-1 z-10">Select Category</h2>
                  {loadingTopics ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                      {topics.map((topic) => (
                        <motion.button
                          key={topic.slug}
                          onClick={() => setSelectedCategory(topic.slug)}
                          className={`p-3 rounded-xl border transition-all text-left ${
                            selectedCategory === topic.slug
                              ? "bg-orange-500/20 border-orange-500"
                              : "bg-white/[0.03] border-white/10 hover:border-white/30"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                              selectedCategory === topic.slug
                                ? "bg-orange-500 text-black"
                                : "bg-white/10 text-orange-500"
                            }`}
                          >
                            <Code2 className="w-4 h-4" />
                          </div>
                          <h3 className="font-bold text-sm mb-0.5">{topic.name}</h3>
                          <p className="text-xs text-muted font-mono">
                            {topic.questionCount ?? 0} questions
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Difficulty & Start (sticky) */}
                <div className="flex flex-col gap-4 order-1 lg:order-2 lg:sticky lg:top-24">
                  <div className="card p-5">
                    <h2 className="heading-3 mb-4 text-base">Difficulty</h2>
                    <div className="flex flex-col gap-2">
                      {difficulties.map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`px-4 py-2.5 rounded-lg font-mono text-sm transition-all w-full text-left ${
                            selectedDifficulty === diff
                              ? "bg-orange-500 text-black"
                              : "bg-white/[0.03] border border-white/10 hover:border-white/30"
                          }`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Info */}
                  {selectedCategory && (
                    <div className="card p-5">
                      <p className="text-xs text-muted mb-1">Ready to play:</p>
                      <p className="font-bold">
                        {topics.find(t => t.slug === selectedCategory)?.name}
                      </p>
                      <p className="text-orange-500 text-sm capitalize">{selectedDifficulty}</p>
                    </div>
                  )}

                  <button
                    onClick={startGame}
                    disabled={!selectedCategory || loadingQuestions}
                    className={`btn-primary px-6 py-3 text-base w-full ${
                      !selectedCategory || loadingQuestions
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loadingQuestions ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <GameIcon className="w-5 h-5" />
                        Start Game
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="section-container">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="heading-3">{selectedTopic?.name || selectedCategory}</h1>
                  <p className="text-muted font-mono text-sm">
                    {selectedDifficulty} difficulty
                  </p>
                </div>
                <button onClick={resetGame} className="btn-secondary text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  Change Topic
                </button>
              </div>

              <GameComponent
                pairs={currentPairs}
                questions={currentQuestions}
                onComplete={handleGameComplete}
                difficulty={selectedDifficulty}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DynamicGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const gameConfig = getGameById(gameId);

  if (!gameConfig || !gameConfig.enabled) {
    notFound();
  }

  const GameIcon = getGameIcon(gameConfig.icon);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="stat-icon w-16 h-16 mx-auto mb-4 animate-pulse">
              <GameIcon className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-muted font-mono">Loading {gameConfig.name}...</p>
          </div>
        </div>
      }
    >
      <GameContent gameConfig={gameConfig} />
    </Suspense>
  );
}
