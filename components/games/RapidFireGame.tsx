"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, Clock, Trophy, RotateCcw } from "lucide-react";
import { QuizPair } from "@/types";

interface RapidFireGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, ...args: unknown[]) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function RapidFireGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: RapidFireGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const timeLimit = difficulty === "beginner" ? 60 : difficulty === "intermediate" ? 45 : 30;

  const generateOptions = useCallback((correctAnswer: string) => {
    const incorrectOptions = pairs
      .filter((p) => p.back !== correctAnswer)
      .map((p) => p.back)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [...incorrectOptions, correctAnswer].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  }, [pairs]);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (pairs.length > 0 && currentIndex < pairs.length) {
      generateOptions(pairs[currentIndex].back);
    }
  }, [currentIndex, pairs, generateOptions]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0) {
      if (!gameOver) {
        setGameOver(true);
        onComplete(score, score, timeLimit - timeLeft, undefined, correctAnswers, questionsAnswered);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, timeLeft, score, onComplete, correctAnswers, questionsAnswered, timeLimit]);

  const handleAnswer = (selectedAnswer: string) => {
    if (gameOver || showFeedback) return;

    const isCorrect = selectedAnswer === pairs[currentIndex].back;
    setQuestionsAnswered((prev) => prev + 1);

    if (isCorrect) {
      const streakBonus = Math.floor(streak / 3) * 5;
      const basePoints = difficulty === "advanced" ? 15 : difficulty === "intermediate" ? 12 : 10;
      setScore((prev) => prev + basePoints + streakBonus);
      setStreak((prev) => prev + 1);
      setBestStreak((prev) => Math.max(prev, streak + 1));
      setCorrectAnswers((prev) => prev + 1);
      setShowFeedback("correct");
    } else {
      setStreak(0);
      setShowFeedback("wrong");
    }

    setTimeout(() => {
      setShowFeedback(null);
      if (currentIndex < pairs.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Loop back to start for endless mode
        setCurrentIndex(0);
      }
    }, 300);
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(timeLimit);
    setGameOver(false);
    setShowFeedback(null);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
  };

  if (gameOver) {
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card text-center py-12"
      >
        <div className="stat-icon w-20 h-20 mx-auto mb-6">
          <Trophy className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="heading-2 mb-4">Time&apos;s Up!</h2>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
          <div className="bg-white/[0.03] rounded-xl p-4">
            <div className="stat-value text-orange-500">{score}</div>
            <div className="stat-label">Total Score</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4">
            <div className="stat-value">{questionsAnswered}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4">
            <div className="stat-value text-green-500">{accuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4">
            <div className="stat-value">{bestStreak}</div>
            <div className="stat-label">Best Streak</div>
          </div>
        </div>

        <button onClick={resetGame} className="btn-primary">
          <RotateCcw className="w-4 h-4" />
          Play Again
        </button>
      </motion.div>
    );
  }

  const currentPair = pairs[currentIndex];
  const timePercentage = (timeLeft / timeLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/[0.03] rounded-xl px-4 py-2">
            <span className="text-muted font-mono text-sm">Score</span>
            <span className="ml-2 font-bold text-orange-500">{score}</span>
          </div>
          <div className="bg-white/[0.03] rounded-xl px-4 py-2">
            <span className="text-muted font-mono text-sm">Streak</span>
            <span className="ml-2 font-bold">{streak}</span>
            {streak >= 3 && <Zap className="inline w-4 h-4 ml-1 text-yellow-500" />}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${timeLeft <= 10 ? "text-red-500" : "text-muted"}`} />
          <span className={`font-mono font-bold ${timeLeft <= 10 ? "text-red-500" : ""}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            timePercentage > 50 ? "bg-green-500" : timePercentage > 25 ? "bg-yellow-500" : "bg-red-500"
          }`}
          initial={{ width: "100%" }}
          animate={{ width: `${timePercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className={`card text-center py-12 ${
            showFeedback === "correct"
              ? "border-green-500 bg-green-500/10"
              : showFeedback === "wrong"
              ? "border-red-500 bg-red-500/10"
              : ""
          }`}
        >
          <h2 className="heading-3 mb-2">What is this?</h2>
          <p className="font-mono text-2xl text-orange-500 mb-8">{currentPair.front}</p>

          {/* Feedback Icons */}
          {showFeedback && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-4"
            >
              {showFeedback === "correct" ? (
                <Check className="w-12 h-12 mx-auto text-green-500" />
              ) : (
                <X className="w-12 h-12 mx-auto text-red-500" />
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={`${currentIndex}-${index}`}
            onClick={() => handleAnswer(option)}
            disabled={showFeedback !== null}
            className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-orange-500/50 hover:bg-white/[0.05] transition-all text-left disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xs text-muted font-mono mr-2">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="font-medium">{option}</span>
          </motion.button>
        ))}
      </div>

      {/* Streak Indicator */}
      {streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-yellow-500 font-bold">
            <Zap className="inline w-4 h-4 mr-1" />
            {streak} streak! +{Math.floor(streak / 3) * 5} bonus points
          </span>
        </motion.div>
      )}
    </div>
  );
}
