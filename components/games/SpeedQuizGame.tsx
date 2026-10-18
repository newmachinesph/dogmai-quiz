"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Zap, RotateCcw, X, AlertTriangle } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface SpeedQuizGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, correct: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function SpeedQuizGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: SpeedQuizGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const getTimePerQuestion = () => {
    if (difficulty === "advanced") return 5;
    if (difficulty === "intermediate") return 8;
    return 10;
  };

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  useEffect(() => {
    if (!isGameActive || gameWon) return;

    const timer = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
      setTimeRemaining((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, gameWon, currentIndex]);

  const handleTimeout = useCallback(() => {
    setStreak(0);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setQuestionTimer(getTimePerQuestion());
    } else {
      endGame();
    }
  }, [currentIndex, questions.length]);

  const initializeGame = () => {
    const generatedQuestions: Question[] = pairs.map((pair, idx) => {
      const wrongAnswers = pairs
        .filter((_, i) => i !== idx)
        .map((p) => p.back)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allOptions = shuffleArray([pair.back, ...wrongAnswers]);
      const correctIndex = allOptions.indexOf(pair.back);

      return {
        question: pair.front,
        options: allOptions,
        correctAnswer: correctIndex,
      };
    });

    setQuestions(shuffleArray(generatedQuestions));
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setTimeRemaining(0);
    setQuestionTimer(getTimePerQuestion());
    setIsGameActive(true);
    setGameWon(false);
    setStreak(0);
    setMaxStreak(0);
  };

  const handleAnswer = (answerIndex: number) => {
    const isCorrect = answerIndex === questions[currentIndex].correctAnswer;

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setQuestionTimer(getTimePerQuestion());
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameWon(true);
    setIsGameActive(false);
    const score = calculateScore();
    setTimeout(() => onComplete(score, correctAnswers, timeRemaining), 500);
  };

  const calculateScore = () => {
    const baseScore = correctAnswers * 100;
    const streakBonus = maxStreak * 25;
    const difficultyMultiplier =
      difficulty === "advanced" ? 1.5 : difficulty === "intermediate" ? 1.2 : 1;
    return Math.round((baseScore + streakBonus) * difficultyMultiplier);
  };

  const currentQuestion = questions[currentIndex];
  const timerPercentage = (questionTimer / getTimePerQuestion()) * 100;

  return (
    <div className="w-full">
      {/* Stats Bar */}
      <div className="card mb-8 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`stat-icon w-10 h-10 ${timerPercentage < 30 ? "!bg-red-500/20" : ""}`}>
                <Timer className={`w-5 h-5 ${timerPercentage < 30 ? "text-red-500" : "text-orange-500"}`} />
              </div>
              <div>
                <div className="label">Time Left</div>
                <div className={`text-xl font-bold ${timerPercentage < 30 ? "text-red-500" : ""}`}>
                  {questionTimer}s
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-yellow-500/10">
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="label">Streak</div>
                <div className="text-xl font-bold">{streak}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Score</div>
                <div className="text-xl font-bold">{correctAnswers * 100}</div>
              </div>
            </div>
          </div>

          <button onClick={initializeGame} className="btn-secondary text-sm">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>

        {/* Timer Bar */}
        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${timerPercentage < 30 ? "bg-red-500" : "bg-orange-500"}`}
            initial={{ width: "100%" }}
            animate={{ width: `${timerPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-8"
        >
          <div className="mb-8 text-center">
            <p className="label mb-2">Question {currentIndex + 1} of {questions.length}</p>
            <h2 className="text-2xl font-bold font-mono">{currentQuestion.question}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="p-4 rounded-xl border bg-white/[0.03] border-white/10 hover:border-orange-500 hover:bg-orange-500/10 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-mono text-sm">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

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
                <Zap className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Speed Round Complete!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {correctAnswers}/{questions.length} correct answers
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-orange-500">
                    {calculateScore()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Best Streak</span>
                  <span className="font-bold text-yellow-500">{maxStreak}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted font-mono text-sm">Total Time</span>
                  <span className="font-bold">{formatTime(timeRemaining)}</span>
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
