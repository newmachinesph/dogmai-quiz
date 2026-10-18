"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Heart, Skull, RotateCcw, X, Zap, Shield } from "lucide-react";
import { QuizPair } from "@/types";
import { shuffleArray } from "@/lib/utils";

interface SurvivalGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, round: number, streak: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function SurvivalGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: SurvivalGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);

  const maxLives = difficulty === "advanced" ? 2 : difficulty === "intermediate" ? 3 : 4;

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  const generateMoreQuestions = () => {
    const newQuestions: Question[] = pairs.map((pair, idx) => {
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
    return shuffleArray(newQuestions);
  };

  const initializeGame = () => {
    setQuestions(generateMoreQuestions());
    setCurrentIndex(0);
    setLives(maxLives);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsGameActive(true);
    setGameOver(false);
    setShowFeedback(false);
    setSelectedAnswer(null);
    setIsCorrect(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;

    const correct = answerIndex === questions[currentIndex].correctAnswer;
    setSelectedAnswer(answerIndex);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      // Bonus points for streaks
      const streakBonus = Math.floor(newStreak / 3) * 50;
      setScore((prev) => prev + 100 + streakBonus);
    } else {
      setStreak(0);
      setLives((prev) => prev - 1);
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 500);

      if (lives <= 1) {
        setTimeout(() => {
          setGameOver(true);
          setIsGameActive(false);
          onComplete(score, currentIndex + 1, maxStreak);
        }, 1000);
        return;
      }
    }

    setTimeout(() => {
      // Generate more questions if running low
      if (currentIndex >= questions.length - 2) {
        setQuestions((prev) => [...prev, ...generateMoreQuestions()]);
      }
      setCurrentIndex((prev) => prev + 1);
      setShowFeedback(false);
      setSelectedAnswer(null);
      setIsCorrect(false);
    }, 1000);
  };

  const currentQuestion = questions[currentIndex];

  const renderLives = () => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: maxLives }).map((_, idx) => (
          <motion.div
            key={idx}
            animate={idx === lives && shakeScreen ? { x: [-2, 2, -2, 2, 0] } : {}}
          >
            <Heart
              className={`w-6 h-6 ${
                idx < lives ? "text-red-500 fill-red-500" : "text-white/20"
              }`}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className={`w-full ${shakeScreen ? "animate-shake" : ""}`}>
      {/* Stats Bar */}
      <div className="card mb-8 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-red-500/10">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="label">Lives</div>
                {renderLives()}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-yellow-500/10">
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="label">Streak</div>
                <div className="text-xl font-bold text-yellow-500">{streak}</div>
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

          <div className="flex items-center gap-4">
            <span className="label">Round {currentIndex + 1}</span>
            <button onClick={initializeGame} className="btn-secondary text-sm">
              <RotateCcw className="w-4 h-4" />
              Restart
            </button>
          </div>
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && !gameOver && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-8"
        >
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Skull className="w-6 h-6 text-orange-500" />
              <p className="label">Survival Mode</p>
              <Skull className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold font-mono">{currentQuestion.question}</h2>
          </div>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrectAnswer = idx === currentQuestion.correctAnswer;
              const showCorrect = showFeedback && isCorrectAnswer;
              const showWrong = showFeedback && isSelected && !isCorrectAnswer;

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showFeedback}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    showCorrect
                      ? "bg-green-500/20 border-green-500"
                      : showWrong
                      ? "bg-red-500/20 border-red-500"
                      : "bg-white/[0.03] border-white/10 hover:border-orange-500 hover:bg-orange-500/10"
                  }`}
                  whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                  whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-mono">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {streak >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-center"
            >
              <span className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-500 font-mono text-sm">
                {streak} Streak! +{Math.floor(streak / 3) * 50} bonus
              </span>
            </motion.div>
          )}
        </motion.div>
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

              <div className="stat-icon w-20 h-20 mx-auto mb-6 !bg-red-500/10">
                <Skull className="w-10 h-10 text-red-500" />
              </div>

              <h2 className="heading-3 mb-2">Game Over!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                You survived {currentIndex + 1} rounds
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Final Score</span>
                  <span className="text-xl font-bold text-orange-500">{score}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Best Streak</span>
                  <span className="font-bold text-yellow-500">{maxStreak}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted font-mono text-sm">Rounds Survived</span>
                  <span className="font-bold">{currentIndex + 1}</span>
                </div>
              </div>

              <button onClick={initializeGame} className="btn-primary w-full">
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
