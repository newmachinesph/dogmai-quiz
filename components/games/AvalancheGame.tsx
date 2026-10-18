"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Mountain, RotateCcw, X, ArrowDown } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface AvalancheGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, caught: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface FallingAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
  x: number; // percentage position
  y: number; // percentage from top
  speed: number;
}

export default function AvalancheGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: AvalancheGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState<QuizPair | null>(null);
  const [fallingAnswers, setFallingAnswers] = useState<FallingAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [lives, setLives] = useState(3);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shuffledPairs, setShuffledPairs] = useState<QuizPair[]>([]);
  const [showFeedback, setShowFeedback] = useState<{ type: "correct" | "wrong" | "miss"; x: number } | null>(null);
  const answerIdRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Difficulty settings - slower and more manageable
  const settings = {
    beginner: { fallSpeed: 0.4, spawnInterval: 3500, maxOnScreen: 3, lives: 4, rounds: 8 },
    intermediate: { fallSpeed: 0.6, spawnInterval: 2500, maxOnScreen: 4, lives: 3, rounds: 10 },
    advanced: { fallSpeed: 0.8, spawnInterval: 2000, maxOnScreen: 5, lives: 2, rounds: 10 },
  }[difficulty];

  const difficultyMultiplier = { beginner: 1, intermediate: 1.2, advanced: 1.5 }[difficulty];

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  useEffect(() => {
    if (!isGameActive || gameOver) return;
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isGameActive, gameOver]);

  // Spawn falling answers
  useEffect(() => {
    if (!isGameActive || gameOver || !currentQuestion) return;

    const spawnAnswer = () => {
      setFallingAnswers((prev) => {
        // Don't spawn if we already have max answers on screen
        if (prev.length >= settings.maxOnScreen) return prev;

        // Ensure at least one correct answer is falling
        const hasCorrect = prev.some((a) => a.isCorrect);
        const isCorrect = !hasCorrect ? true : Math.random() < 0.35;

        const content = isCorrect
          ? currentQuestion.back
          : shuffledPairs.filter((p) => p.back !== currentQuestion.back)[
              Math.floor(Math.random() * (shuffledPairs.length - 1))
            ]?.back || "???";

        const newAnswer: FallingAnswer = {
          id: `answer-${answerIdRef.current++}`,
          content,
          isCorrect,
          x: 10 + Math.random() * 80, // 10-90% horizontal position
          y: -5,
          speed: settings.fallSpeed * (0.9 + Math.random() * 0.2), // Less variation
        };

        return [...prev, newAnswer];
      });
    };

    const interval = setInterval(spawnAnswer, settings.spawnInterval);
    // Spawn first answer after a short delay
    const initialTimeout = setTimeout(spawnAnswer, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [isGameActive, gameOver, currentQuestion, settings, shuffledPairs]);

  // Animate falling
  useEffect(() => {
    if (!isGameActive || gameOver) return;

    const interval = setInterval(() => {
      setFallingAnswers((prev) => {
        const updated: FallingAnswer[] = [];
        let correctMissed = false;

        prev.forEach((answer) => {
          const newY = answer.y + answer.speed;

          if (newY > 100) {
            // Fell off screen
            if (answer.isCorrect) {
              correctMissed = true;
            }
          } else {
            updated.push({ ...answer, y: newY });
          }
        });

        if (correctMissed) {
          setLives((l) => {
            const newLives = l - 1;
            if (newLives <= 0) {
              endGame();
            }
            return newLives;
          });
          setMissed((m) => m + 1);
          setShowFeedback({ type: "miss", x: 50 });
          setTimeout(() => setShowFeedback(null), 500);
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isGameActive, gameOver]);

  const initializeGame = () => {
    const shuffled = shuffleArray([...pairs]);
    setShuffledPairs(shuffled);
    setCurrentQuestion(shuffled[0]);
    setQuestionIndex(0);
    setFallingAnswers([]);
    setScore(0);
    setCaught(0);
    setMissed(0);
    setLives(settings.lives);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameOver(false);
    setShowFeedback(null);
    answerIdRef.current = 0;
  };

  const handleCatch = useCallback(
    (answer: FallingAnswer) => {
      if (!isGameActive || gameOver) return;

      setFallingAnswers((prev) => prev.filter((a) => a.id !== answer.id));
      setShowFeedback({ type: answer.isCorrect ? "correct" : "wrong", x: answer.x });

      if (answer.isCorrect) {
        setCaught((prev) => prev + 1);
        const heightBonus = Math.floor((100 - answer.y) / 10); // Catch higher = more points
        setScore((prev) => prev + Math.round((100 + heightBonus * 10) * difficultyMultiplier));

        // Clear all answers and move to next question
        setTimeout(() => {
          setShowFeedback(null);
          setFallingAnswers([]);

          if (questionIndex < settings.rounds - 1) {
            const nextIndex = questionIndex + 1;
            setQuestionIndex(nextIndex);
            setCurrentQuestion(shuffledPairs[nextIndex % shuffledPairs.length]);
          } else {
            endGame();
          }
        }, 500);
      } else {
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            endGame();
          }
          return newLives;
        });

        setTimeout(() => setShowFeedback(null), 500);
      }
    },
    [isGameActive, gameOver, questionIndex, settings.rounds, shuffledPairs, difficultyMultiplier]
  );

  const endGame = useCallback(() => {
    setGameOver(true);
    setIsGameActive(false);
    onComplete(score, caught, timeElapsed);
  }, [score, caught, timeElapsed, onComplete]);

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
              <div className="stat-icon w-10 h-10 !bg-red-500/10">
                <Mountain className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="label">Lives</div>
                <div className="text-xl font-bold text-red-500">
                  {"❤️".repeat(lives)}{"🖤".repeat(settings.lives - lives)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Caught</div>
                <div className="text-xl font-bold">{caught}/{settings.rounds}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-purple-500/10">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="label">Score</div>
                <div className="text-xl font-bold text-purple-500">{score}</div>
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
        <p className="label mb-2">Catch the correct answer for:</p>
        <h2 className="text-2xl font-bold text-orange-500">{currentQuestion?.front}</h2>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="card relative overflow-hidden"
        style={{ height: "400px" }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/20 via-transparent to-orange-900/20" />

        {/* Danger zone indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-red-500/30 to-transparent" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-red-400 text-xs font-mono flex items-center gap-1">
          <ArrowDown className="w-3 h-3" />
          DANGER ZONE
          <ArrowDown className="w-3 h-3" />
        </div>

        {/* Falling Answers */}
        <AnimatePresence>
          {fallingAnswers.map((answer) => (
            <motion.button
              key={answer.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => handleCatch(answer)}
              className="absolute px-4 py-2 rounded-xl bg-gradient-to-b from-white/20 to-white/10 border border-white/20 cursor-pointer hover:border-orange-500 hover:bg-orange-500/20 transition-colors font-medium text-sm shadow-lg"
              style={{
                left: `${answer.x}%`,
                top: `${answer.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {answer.content.length > 25 ? answer.content.slice(0, 25) + "..." : answer.content}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl"
            >
              {showFeedback.type === "correct" ? "✓" : showFeedback.type === "wrong" ? "✗" : "💨"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions overlay when no answers */}
        {fallingAnswers.length === 0 && !showFeedback && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted">
              <Mountain className="w-12 h-12 mx-auto mb-2 animate-bounce" />
              <p className="font-mono text-sm">Answers falling soon...</p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-4">
        <p className="text-muted text-sm font-mono">
          Click the correct answer! Wrong answers and missed correct ones cost lives!
        </p>
      </div>

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

              <div className="stat-icon w-20 h-20 mx-auto mb-6 !bg-blue-500/10">
                <Mountain className="w-10 h-10 text-blue-500" />
              </div>

              <h2 className="heading-3 mb-2">Avalanche Over!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {lives > 0 ? `Survived with ${lives} lives!` : "Buried in the avalanche!"}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-orange-500">{score}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Caught</span>
                  <span className="font-bold text-green-500">{caught}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Missed</span>
                  <span className="font-bold text-red-500">{missed}</span>
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
