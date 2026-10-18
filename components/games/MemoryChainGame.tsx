"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Brain, Link2, RotateCcw, X, Play, Eye, EyeOff } from "lucide-react";
import { QuizPair } from "@/types";
import { shuffleArray } from "@/lib/utils";

interface MemoryChainGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, level: number, maxChain: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function MemoryChainGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: MemoryChainGameProps) {
  const [terms, setTerms] = useState<string[]>([]);
  const [chain, setChain] = useState<string[]>([]);
  const [userChain, setUserChain] = useState<string[]>([]);
  const [level, setLevel] = useState(1);
  const [isShowingChain, setIsShowingChain] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentShowIndex, setCurrentShowIndex] = useState(-1);
  const [maxChain, setMaxChain] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const showDuration = difficulty === "advanced" ? 600 : difficulty === "intermediate" ? 800 : 1000;

  useEffect(() => {
    const termList = shuffleArray(pairs.map((p) => p.back)).slice(0, 9);
    setTerms(termList);
  }, [pairs]);

  const startGame = () => {
    setLevel(1);
    setChain([]);
    setUserChain([]);
    setScore(0);
    setMaxChain(0);
    setGameStarted(true);
    setGameOver(false);
    setFeedback(null);
    startNewRound([]);
  };

  const startNewRound = useCallback((currentChain: string[]) => {
    // Add a new random term to the chain
    const availableTerms = terms.filter((t) => !currentChain.includes(t) || currentChain.length >= terms.length);
    const newTerm = availableTerms[Math.floor(Math.random() * availableTerms.length)] || terms[Math.floor(Math.random() * terms.length)];
    const newChain = [...currentChain, newTerm];

    setChain(newChain);
    setUserChain([]);
    setIsShowingChain(true);
    setIsUserTurn(false);
    setCurrentShowIndex(-1);
    setFeedback(null);

    // Show the chain sequence
    let index = 0;
    const showInterval = setInterval(() => {
      if (index < newChain.length) {
        setCurrentShowIndex(index);
        index++;
      } else {
        clearInterval(showInterval);
        setTimeout(() => {
          setIsShowingChain(false);
          setIsUserTurn(true);
          setCurrentShowIndex(-1);
        }, 500);
      }
    }, showDuration);
  }, [terms, showDuration]);

  const handleTermClick = (term: string) => {
    if (!isUserTurn || feedback) return;

    const expectedTerm = chain[userChain.length];
    const newUserChain = [...userChain, term];
    setUserChain(newUserChain);

    if (term !== expectedTerm) {
      // Wrong answer
      setFeedback("wrong");
      setTimeout(() => {
        setGameOver(true);
        onComplete(score, level, maxChain);
      }, 1000);
      return;
    }

    // Correct answer
    setFeedback("correct");
    setTimeout(() => setFeedback(null), 300);

    if (newUserChain.length === chain.length) {
      // Completed the chain
      const roundScore = chain.length * 50;
      const newScore = score + roundScore;
      const newLevel = level + 1;
      const newMaxChain = Math.max(maxChain, chain.length);

      setScore(newScore);
      setLevel(newLevel);
      setMaxChain(newMaxChain);

      setTimeout(() => {
        startNewRound(chain);
      }, 1000);
    }
  };

  const getTermStyle = (term: string) => {
    if (isShowingChain && chain[currentShowIndex] === term) {
      return "bg-orange-500 border-orange-500 text-black scale-110";
    }
    if (isUserTurn && userChain.includes(term)) {
      return "bg-green-500/20 border-green-500";
    }
    if (feedback === "wrong" && term === chain[userChain.length - 1]) {
      return "bg-red-500/20 border-red-500";
    }
    return "bg-white/[0.03] border-white/10 hover:border-orange-500";
  };

  return (
    <div className="w-full">
      {!gameStarted ? (
        /* Start Screen */
        <div className="card p-8 text-center">
          <div className="stat-icon w-20 h-20 mx-auto mb-6">
            <Brain className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="heading-2 mb-4">Memory Chain</h2>
          <p className="text-muted font-mono mb-8 max-w-md mx-auto">
            Watch the sequence of terms light up, then repeat them in order.
            Each round adds one more term to remember!
          </p>
          <button onClick={startGame} className="btn-primary px-12 py-4 text-lg">
            <Play className="w-5 h-5" />
            Start Game
          </button>
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="card mb-8 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="stat-icon w-10 h-10 !bg-purple-500/10">
                    <Link2 className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="label">Level</div>
                    <div className="text-xl font-bold">{level}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="stat-icon w-10 h-10 !bg-blue-500/10">
                    <Brain className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="label">Chain</div>
                    <div className="text-xl font-bold">{chain.length}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="stat-icon w-10 h-10 !bg-green-500/10">
                    <Trophy className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="label">Score</div>
                    <div className="text-xl font-bold">{score}</div>
                  </div>
                </div>
              </div>

              <button onClick={startGame} className="btn-secondary text-sm">
                <RotateCcw className="w-4 h-4" />
                Restart
              </button>
            </div>
          </div>

          {/* Game Area */}
          <div className="card p-8">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                {isShowingChain ? (
                  <>
                    <Eye className="w-5 h-5 text-orange-500" />
                    <p className="label">Watch the sequence...</p>
                  </>
                ) : isUserTurn ? (
                  <>
                    <EyeOff className="w-5 h-5 text-green-500" />
                    <p className="label">Your turn! Repeat the sequence</p>
                  </>
                ) : null}
              </div>

              {isUserTurn && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-muted font-mono text-sm">
                    Progress: {userChain.length} / {chain.length}
                  </span>
                </div>
              )}
            </div>

            {/* Terms Grid */}
            <div className="grid grid-cols-3 gap-4">
              {terms.map((term, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleTermClick(term)}
                  disabled={!isUserTurn || feedback === "wrong"}
                  className={`p-4 rounded-xl border text-center transition-all ${getTermStyle(term)}`}
                  animate={{
                    scale: isShowingChain && chain[currentShowIndex] === term ? 1.1 : 1,
                  }}
                  whileHover={isUserTurn ? { scale: 1.05 } : {}}
                  whileTap={isUserTurn ? { scale: 0.95 } : {}}
                >
                  <span className="font-mono text-sm">{term}</span>
                </motion.button>
              ))}
            </div>

            {/* Chain visualization */}
            {isUserTurn && userChain.length > 0 && (
              <div className="mt-6 p-4 bg-white/[0.02] rounded-xl">
                <p className="label mb-2 text-center">Your sequence:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {userChain.map((term, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-green-500/20 text-green-500 font-mono text-sm"
                    >
                      {idx + 1}. {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setGameOver(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-sm w-full text-center p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setGameOver(false)}
                className="absolute top-4 right-4 text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="stat-icon w-20 h-20 mx-auto mb-6">
                <Brain className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Chain Broken!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                You reached level {level}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Final Score</span>
                  <span className="text-xl font-bold text-orange-500">{score}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Max Chain</span>
                  <span className="font-bold text-purple-500">{maxChain}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted font-mono text-sm">Level Reached</span>
                  <span className="font-bold">{level}</span>
                </div>
              </div>

              <button onClick={startGame} className="btn-primary w-full">
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
