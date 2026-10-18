"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Eye, RotateCcw, X, Lightbulb } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface FirstLetterGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, accuracy: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function FirstLetterGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: FirstLetterGameProps) {
  const [currentPair, setCurrentPair] = useState<QuizPair | null>(null);
  const [revealedCount, setRevealedCount] = useState(1);
  const [userGuess, setUserGuess] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [shuffledPairs, setShuffledPairs] = useState<QuizPair[]>([]);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [autoRevealTimer, setAutoRevealTimer] = useState(0);

  // Difficulty settings - slower reveal for better UX
  const settings = {
    beginner: { rounds: 8, revealInterval: 4000, maxScore: 100 },
    intermediate: { rounds: 10, revealInterval: 3000, maxScore: 120 },
    advanced: { rounds: 10, revealInterval: 2500, maxScore: 150 },
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

  // Auto-reveal letters over time
  useEffect(() => {
    if (!isGameActive || gameWon || !currentPair || showFeedback) return;

    const interval = setInterval(() => {
      setAutoRevealTimer((prev) => {
        const newValue = prev + 100;
        if (newValue >= settings.revealInterval) {
          // Reveal next letter
          const answer = currentPair.back;
          if (revealedCount < answer.length) {
            setRevealedCount((r) => r + 1);
          }
          return 0;
        }
        return newValue;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isGameActive, gameWon, currentPair, revealedCount, settings.revealInterval, showFeedback]);

  const initializeGame = () => {
    const shuffled = shuffleArray([...pairs]).slice(0, settings.rounds);
    setShuffledPairs(shuffled);
    setQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setShowFeedback(null);
    setupQuestion(shuffled, 0);
  };

  const setupQuestion = (pairList: QuizPair[], index: number) => {
    const pair = pairList[index];
    setCurrentPair(pair);
    setRevealedCount(1);
    setUserGuess("");
    setAutoRevealTimer(0);
  };

  const getRevealedWord = useCallback(() => {
    if (!currentPair) return "";

    const answer = currentPair.back;
    let revealed = "";

    for (let i = 0; i < answer.length; i++) {
      if (answer[i] === " ") {
        revealed += " ";
      } else if (i < revealedCount) {
        revealed += answer[i];
      } else {
        revealed += "_";
      }
    }

    return revealed;
  }, [currentPair, revealedCount]);

  const handleRevealMore = () => {
    if (!currentPair || showFeedback) return;
    const answer = currentPair.back;
    // Count non-space characters
    const letterCount = answer.replace(/\s/g, "").length;
    if (revealedCount < letterCount) {
      setRevealedCount((prev) => prev + 1);
      setAutoRevealTimer(0);
    }
  };

  const handleSubmit = () => {
    if (!currentPair || !userGuess.trim() || showFeedback) return;

    const isCorrect = userGuess.trim().toLowerCase() === currentPair.back.toLowerCase();

    if (isCorrect) {
      setShowFeedback("correct");
      setCorrectAnswers((prev) => prev + 1);

      // Score based on how few letters were revealed
      const answer = currentPair.back;
      const letterCount = answer.replace(/\s/g, "").length;
      const revealRatio = revealedCount / letterCount;
      const baseScore = settings.maxScore * (1 - revealRatio * 0.8); // 80% reduction at full reveal
      const roundScore = Math.round(Math.max(20, baseScore) * difficultyMultiplier);

      setScore((prev) => prev + roundScore);
    } else {
      setShowFeedback("wrong");
    }

    setTimeout(() => {
      setShowFeedback(null);
      if (questionIndex < shuffledPairs.length - 1) {
        const nextIndex = questionIndex + 1;
        setQuestionIndex(nextIndex);
        setupQuestion(shuffledPairs, nextIndex);
      } else {
        endGame();
      }
    }, 1500);
  };

  const handleSkip = () => {
    if (showFeedback) return;

    setShowFeedback("wrong");
    setTimeout(() => {
      setShowFeedback(null);
      if (questionIndex < shuffledPairs.length - 1) {
        const nextIndex = questionIndex + 1;
        setQuestionIndex(nextIndex);
        setupQuestion(shuffledPairs, nextIndex);
      } else {
        endGame();
      }
    }, 1000);
  };

  const endGame = () => {
    setGameWon(true);
    setIsGameActive(false);
    const accuracy = Math.round((correctAnswers / settings.rounds) * 100);
    onComplete(score, accuracy, timeElapsed);
  };

  const accuracy = shuffledPairs.length > 0
    ? Math.round((correctAnswers / Math.max(1, questionIndex + 1)) * 100)
    : 100;

  const answer = currentPair?.back || "";
  const letterCount = answer.replace(/\s/g, "").length;
  const revealProgress = Math.round((revealedCount / Math.max(1, letterCount)) * 100);

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
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Score</div>
                <div className="text-xl font-bold">{score}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-blue-500/10">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="label">Progress</div>
                <div className="text-xl font-bold">{questionIndex + 1}/{settings.rounds}</div>
              </div>
            </div>
          </div>

          <button onClick={initializeGame} className="btn-secondary text-sm">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Reveal Progress */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted font-mono">Letters Revealed</span>
          <span className="text-sm font-bold text-cyan-500">{revealProgress}%</span>
        </div>
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
            animate={{ width: `${revealProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted">
          <span>More revealed = Less points</span>
          <span>Auto-reveal in {Math.ceil((settings.revealInterval - autoRevealTimer) / 1000)}s</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="card p-8">
        {/* Hint (the front/question) */}
        <div className="text-center mb-6">
          <p className="label mb-2">Clue:</p>
          <h2 className="text-xl font-bold text-orange-500">{currentPair?.front}</h2>
        </div>

        {/* Revealed Word Display */}
        <div className="text-center mb-8">
          <p className="label mb-4">The Answer:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {getRevealedWord()
              .split("")
              .map((char, idx) => (
                <motion.span
                  key={idx}
                  initial={char !== "_" && char !== " " ? { scale: 1.3, color: "#22d3ee" } : {}}
                  animate={{ scale: 1, color: char === "_" ? "#6b7280" : "#ffffff" }}
                  className={`font-mono text-3xl font-bold ${
                    char === " " ? "w-4" : "w-8 h-12 flex items-center justify-center bg-white/[0.05] rounded-lg border border-white/10"
                  }`}
                >
                  {char === " " ? "" : char}
                </motion.span>
              ))}
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center mb-6 p-4 rounded-xl ${
                showFeedback === "correct"
                  ? "bg-green-500/20 border border-green-500/30"
                  : "bg-red-500/20 border border-red-500/30"
              }`}
            >
              <p className={`font-bold ${showFeedback === "correct" ? "text-green-400" : "text-red-400"}`}>
                {showFeedback === "correct" ? "Correct!" : `The answer was: ${currentPair?.back}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        {!showFeedback && (
          <>
            <div className="mb-6">
              <input
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Type your guess..."
                className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-cyan-500 focus:outline-none font-mono text-lg text-center"
                autoComplete="off"
                autoCapitalize="off"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleRevealMore}
                disabled={revealedCount >= letterCount}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                Reveal Letter
              </button>
              <button
                onClick={handleSubmit}
                disabled={!userGuess.trim()}
                className="flex-1 btn-primary"
              >
                Submit
              </button>
              <button
                onClick={handleSkip}
                className="btn-secondary px-4"
              >
                Skip
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-muted text-sm font-mono">
            Guess early for more points! Letters reveal automatically.
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

              <div className="stat-icon w-20 h-20 mx-auto mb-6 !bg-cyan-500/10">
                <Eye className="w-10 h-10 text-cyan-500" />
              </div>

              <h2 className="heading-3 mb-2">Game Complete!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {correctAnswers}/{settings.rounds} correct guesses
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-cyan-500">{score}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Accuracy</span>
                  <span className="font-bold">{Math.round((correctAnswers / settings.rounds) * 100)}%</span>
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
