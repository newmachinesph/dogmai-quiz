"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Target, RotateCcw, X, Crosshair } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface WhackAMoleGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, accuracy: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface Mole {
  id: string;
  position: number;
  content: string;
  isCorrect: boolean;
  timeLeft: number;
}

export default function WhackAMoleGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: WhackAMoleGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState<QuizPair | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ position: number; correct: boolean } | null>(null);
  const [shuffledPairs, setShuffledPairs] = useState<QuizPair[]>([]);
  const gridSize = 9; // 3x3 grid
  const moleIdRef = useRef(0);

  // Difficulty settings - more relaxed
  const settings = {
    beginner: { moleLifetime: 4000, spawnInterval: 2000, maxMoles: 2, rounds: 8 },
    intermediate: { moleLifetime: 3000, spawnInterval: 1600, maxMoles: 3, rounds: 10 },
    advanced: { moleLifetime: 2200, spawnInterval: 1200, maxMoles: 4, rounds: 10 },
  }[difficulty];

  const difficultyMultiplier = { beginner: 1, intermediate: 1.2, advanced: 1.5 }[difficulty];

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  useEffect(() => {
    if (!isGameActive || gameWon) return;
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isGameActive, gameWon]);

  // Spawn moles periodically
  useEffect(() => {
    if (!isGameActive || gameWon || !currentQuestion) return;

    const spawnMole = () => {
      setMoles((prevMoles) => {
        if (prevMoles.length >= settings.maxMoles) return prevMoles;

        // Find available positions
        const occupiedPositions = prevMoles.map((m) => m.position);
        const availablePositions = Array.from({ length: gridSize }, (_, i) => i).filter(
          (pos) => !occupiedPositions.includes(pos)
        );

        if (availablePositions.length === 0) return prevMoles;

        const position = availablePositions[Math.floor(Math.random() * availablePositions.length)];

        // 40% chance to spawn the correct answer
        const isCorrect = Math.random() < 0.4;

        let content: string;
        if (isCorrect) {
          content = currentQuestion.back;
        } else {
          // Get a wrong answer from other pairs
          const wrongPairs = shuffledPairs.filter((p) => p.back !== currentQuestion.back);
          content = wrongPairs[Math.floor(Math.random() * wrongPairs.length)]?.back || "???";
        }

        const newMole: Mole = {
          id: `mole-${moleIdRef.current++}`,
          position,
          content,
          isCorrect,
          timeLeft: settings.moleLifetime,
        };

        return [...prevMoles, newMole];
      });
    };

    const interval = setInterval(spawnMole, settings.spawnInterval);
    spawnMole(); // Spawn one immediately

    return () => clearInterval(interval);
  }, [isGameActive, gameWon, currentQuestion, settings, shuffledPairs]);

  // Mole lifetime countdown
  useEffect(() => {
    if (!isGameActive || gameWon) return;

    const interval = setInterval(() => {
      setMoles((prevMoles) =>
        prevMoles
          .map((mole) => ({ ...mole, timeLeft: mole.timeLeft - 100 }))
          .filter((mole) => mole.timeLeft > 0)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isGameActive, gameWon]);

  const initializeGame = () => {
    const shuffled = shuffleArray([...pairs]);
    setShuffledPairs(shuffled);
    setCurrentQuestion(shuffled[0]);
    setQuestionIndex(0);
    setMoles([]);
    setScore(0);
    setHits(0);
    setMisses(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setShowFeedback(null);
    moleIdRef.current = 0;
  };

  const handleWhack = useCallback(
    (mole: Mole) => {
      if (!isGameActive || showFeedback) return;

      setShowFeedback({ position: mole.position, correct: mole.isCorrect });
      setMoles((prev) => prev.filter((m) => m.id !== mole.id));

      if (mole.isCorrect) {
        setHits((prev) => prev + 1);
        const timeBonus = Math.floor(mole.timeLeft / 100);
        setScore((prev) => prev + Math.round((100 + timeBonus) * difficultyMultiplier));

        // Move to next question
        setTimeout(() => {
          setShowFeedback(null);
          if (questionIndex < settings.rounds - 1) {
            const nextIndex = questionIndex + 1;
            setQuestionIndex(nextIndex);
            setCurrentQuestion(shuffledPairs[nextIndex % shuffledPairs.length]);
            setMoles([]);
          } else {
            endGame();
          }
        }, 500);
      } else {
        setMisses((prev) => prev + 1);
        setTimeout(() => setShowFeedback(null), 300);
      }
    },
    [isGameActive, showFeedback, questionIndex, shuffledPairs, settings.rounds, difficultyMultiplier]
  );

  const endGame = () => {
    setGameWon(true);
    setIsGameActive(false);
    const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
    setTimeout(() => onComplete(score, accuracy, timeElapsed), 500);
  };

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 100;

  return (
    <div className="w-full">
      {/* Stats Bar */}
      <div className="card mb-8 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10">
                <Timer className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="label">Time</div>
                <div className="text-xl font-bold">{formatTime(timeElapsed)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-green-500/10">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Hits</div>
                <div className="text-xl font-bold text-green-500">{hits}/{settings.rounds}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-purple-500/10">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="label">Score</div>
                <div className="text-xl font-bold">{score}</div>
              </div>
            </div>
          </div>

          <button onClick={initializeGame} className="btn-secondary text-sm">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="card p-6 mb-6 text-center">
        <p className="label mb-2">Find the match for:</p>
        <h2 className="text-2xl font-bold text-orange-500">{currentQuestion?.front}</h2>
      </div>

      {/* Game Grid */}
      <div className="card p-8">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {Array.from({ length: gridSize }).map((_, index) => {
            const mole = moles.find((m) => m.position === index);
            const feedback = showFeedback?.position === index ? showFeedback : null;

            return (
              <div
                key={index}
                className="aspect-square rounded-xl bg-white/[0.03] border border-white/10 relative overflow-hidden"
              >
                {/* Hole */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-3 rounded-full bg-orange-900/50" />

                {/* Mole */}
                <AnimatePresence>
                  {mole && (
                    <motion.button
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 100, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      onClick={() => handleWhack(mole)}
                      className="absolute inset-2 rounded-lg bg-gradient-to-b from-orange-500 to-orange-700 flex items-center justify-center p-2 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                      style={{
                        opacity: mole.timeLeft / settings.moleLifetime,
                      }}
                    >
                      <span className="text-white font-bold text-xs text-center leading-tight">
                        {mole.content.length > 20 ? mole.content.slice(0, 20) + "..." : mole.content}
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`absolute inset-0 flex items-center justify-center ${
                        feedback.correct ? "bg-green-500/20" : "bg-red-500/20"
                      } rounded-xl`}
                    >
                      <span className="text-4xl">{feedback.correct ? "✓" : "✗"}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Crosshair className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-muted text-sm font-mono">
            Whack the correct answer before it disappears!
          </p>
        </div>
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {gameWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setGameWon(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-sm w-full text-center p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setGameWon(false)}
                className="absolute top-4 right-4 text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="stat-icon w-20 h-20 mx-auto mb-6">
                <Target className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Game Complete!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {hits}/{settings.rounds} targets hit
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-orange-500">{score}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Accuracy</span>
                  <span className="font-bold">{accuracy}%</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Misses</span>
                  <span className="font-bold text-red-500">{misses}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted font-mono text-sm">Time</span>
                  <span className="font-bold">{formatTime(timeElapsed)}</span>
                </div>
              </div>

              <button onClick={initializeGame} className="btn-primary w-full">
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
