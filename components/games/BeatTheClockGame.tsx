"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Zap, RotateCcw, X, Play } from "lucide-react";
import { QuizPair } from "@/types";
import { shuffleArray } from "@/lib/utils";

interface BeatTheClockGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, answered: number, correct: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function BeatTheClockGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: BeatTheClockGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const gameDuration = difficulty === "advanced" ? 45 : difficulty === "intermediate" ? 60 : 75;

  useEffect(() => {
    generateQuestions();
  }, [pairs]);

  useEffect(() => {
    if (!isGameActive || gameOver) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, gameOver]);

  const generateQuestions = () => {
    const allQuestions: Question[] = [];

    // Generate multiple rounds of questions
    for (let round = 0; round < 5; round++) {
      pairs.forEach((pair, idx) => {
        const wrongAnswers = pairs
          .filter((_, i) => i !== idx)
          .map((p) => p.back)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const allOptions = shuffleArray([pair.back, ...wrongAnswers]);
        const correctIndex = allOptions.indexOf(pair.back);

        allQuestions.push({
          question: pair.front,
          options: allOptions,
          correctAnswer: correctIndex,
        });
      });
    }

    setQuestions(shuffleArray(allQuestions));
  };

  const startGame = () => {
    generateQuestions();
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setTimeRemaining(gameDuration);
    setIsGameActive(true);
    setGameStarted(true);
    setGameOver(false);
    setLastAnswerCorrect(null);
  };

  const endGame = useCallback(() => {
    setIsGameActive(false);
    setGameOver(true);
    const score = calculateScore();
    setTimeout(() => onComplete(score, currentIndex, correctAnswers), 500);
  }, [currentIndex, correctAnswers]);

  const handleAnswer = (answerIndex: number) => {
    if (!isGameActive) return;

    const isCorrect = answerIndex === questions[currentIndex].correctAnswer;
    setLastAnswerCorrect(isCorrect);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      // Bonus time for correct answers
      setTimeRemaining((prev) => Math.min(prev + 2, gameDuration));
    }

    // Quick flash then move to next question
    setTimeout(() => {
      setLastAnswerCorrect(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        endGame();
      }
    }, 200);
  };

  const calculateScore = () => {
    const baseScore = correctAnswers * 100;
    const speedBonus = Math.floor(currentIndex / 5) * 25;
    const difficultyMultiplier =
      difficulty === "advanced" ? 1.5 : difficulty === "intermediate" ? 1.2 : 1;
    return Math.round((baseScore + speedBonus) * difficultyMultiplier);
  };

  const currentQuestion = questions[currentIndex];
  const timerPercentage = (timeRemaining / gameDuration) * 100;

  return (
    <div className="w-full">
      {!gameStarted ? (
        /* Start Screen */
        <div className="card p-8 text-center">
          <div className="stat-icon w-20 h-20 mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="heading-2 mb-4">Beat the Clock!</h2>
          <p className="text-muted font-mono mb-8 max-w-md mx-auto">
            Answer as many questions as possible in {gameDuration} seconds!
            Correct answers add +2 seconds to your time.
          </p>
          <button onClick={startGame} className="btn-primary px-12 py-4 text-lg">
            <Play className="w-5 h-5" />
            Start Challenge
          </button>
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="card mb-8 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className={`stat-icon w-10 h-10 ${timerPercentage < 20 ? "!bg-red-500/20" : ""}`}>
                    <Clock className={`w-5 h-5 ${timerPercentage < 20 ? "text-red-500" : "text-orange-500"}`} />
                  </div>
                  <div>
                    <div className="label">Time Left</div>
                    <div className={`text-2xl font-bold ${timerPercentage < 20 ? "text-red-500" : ""}`}>
                      {timeRemaining}s
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="stat-icon w-10 h-10 !bg-blue-500/10">
                    <Zap className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="label">Answered</div>
                    <div className="text-xl font-bold">{currentIndex}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="stat-icon w-10 h-10 !bg-green-500/10">
                    <Trophy className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="label">Correct</div>
                    <div className="text-xl font-bold text-green-500">{correctAnswers}</div>
                  </div>
                </div>
              </div>

              <button onClick={startGame} className="btn-secondary text-sm">
                <RotateCcw className="w-4 h-4" />
                Restart
              </button>
            </div>

            {/* Timer Bar */}
            <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${timerPercentage < 20 ? "bg-red-500" : timerPercentage < 50 ? "bg-yellow-500" : "bg-green-500"}`}
                animate={{ width: `${timerPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          {currentQuestion && !gameOver && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className={`card p-8 ${
                lastAnswerCorrect === true
                  ? "ring-2 ring-green-500"
                  : lastAnswerCorrect === false
                  ? "ring-2 ring-red-500"
                  : ""
              }`}
            >
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold font-mono">{currentQuestion.question}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="p-4 rounded-xl border bg-white/[0.03] border-white/10 hover:border-orange-500 hover:bg-orange-500/10 transition-all text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-mono text-sm">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
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
                <Clock className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Time's Up!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                You answered {currentIndex} questions
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Final Score</span>
                  <span className="text-xl font-bold text-orange-500">
                    {calculateScore()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Correct</span>
                  <span className="font-bold text-green-500">{correctAnswers}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Accuracy</span>
                  <span className="font-bold">
                    {currentIndex > 0 ? Math.round((correctAnswers / currentIndex) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted font-mono text-sm">Questions/Min</span>
                  <span className="font-bold">
                    {Math.round((currentIndex / gameDuration) * 60)}
                  </span>
                </div>
              </div>

              <button onClick={startGame} className="btn-primary w-full">
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
