"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Edit3, RotateCcw, X, CheckCircle, XCircle } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface FillBlankGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, correct: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface BlankQuestion {
  sentence: string;
  answer: string;
  hint: string;
}

export default function FillBlankGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: FillBlankGameProps) {
  const [questions, setQuestions] = useState<BlankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  useEffect(() => {
    if (!isGameActive || gameWon) return;
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isGameActive, gameWon]);

  useEffect(() => {
    if (inputRef.current && !showFeedback) {
      inputRef.current.focus();
    }
  }, [currentIndex, showFeedback]);

  const initializeGame = () => {
    const generatedQuestions: BlankQuestion[] = pairs.map((pair) => ({
      sentence: `${pair.front} = _____`,
      answer: pair.back.toLowerCase().trim(),
      hint: pair.back.charAt(0) + "...",
    }));

    setQuestions(shuffleArray(generatedQuestions));
    setCurrentIndex(0);
    setUserAnswer("");
    setCorrectAnswers(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showFeedback || !userAnswer.trim()) return;

    const correct =
      userAnswer.toLowerCase().trim() === questions[currentIndex].answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setUserAnswer("");
        setShowFeedback(false);
        setIsCorrect(false);
      } else {
        setGameWon(true);
        setIsGameActive(false);
        const finalCorrect = correct ? correctAnswers + 1 : correctAnswers;
        const score = calculateScore(finalCorrect);
        setTimeout(() => onComplete(score, finalCorrect, timeElapsed), 500);
      }
    }, 1500);
  };

  const handleSkip = () => {
    if (showFeedback) return;

    setShowFeedback(true);
    setIsCorrect(false);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setUserAnswer("");
        setShowFeedback(false);
        setIsCorrect(false);
      } else {
        setGameWon(true);
        setIsGameActive(false);
        const score = calculateScore(correctAnswers);
        setTimeout(() => onComplete(score, correctAnswers, timeElapsed), 500);
      }
    }, 1500);
  };

  const calculateScore = (correct: number) => {
    const baseScore = correct * 100;
    const difficultyMultiplier =
      difficulty === "advanced" ? 1.5 : difficulty === "intermediate" ? 1.2 : 1;
    return Math.round(baseScore * difficultyMultiplier);
  };

  const currentQuestion = questions[currentIndex];

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
              <div className="stat-icon w-10 h-10 !bg-purple-500/10">
                <Edit3 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="label">Progress</div>
                <div className="text-xl font-bold">
                  {currentIndex + 1}/{questions.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Correct</div>
                <div className="text-xl font-bold">{correctAnswers}</div>
              </div>
            </div>
          </div>

          <button onClick={initializeGame} className="btn-secondary text-sm">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="card p-8">
          <div className="mb-8 text-center">
            <p className="label mb-4">Fill in the blank</p>
            <h2 className="text-xl sm:text-2xl font-bold font-mono leading-relaxed">
              {currentQuestion.sentence}
            </h2>
            <p className="text-muted text-sm mt-2">Hint: {currentQuestion.hint}</p>
          </div>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-4 rounded-xl text-center flex items-center justify-center gap-3 ${
                isCorrect
                  ? "bg-green-500/20 border border-green-500"
                  : "bg-red-500/20 border border-red-500"
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-mono">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="font-mono">
                    Answer: {currentQuestion.answer}
                  </span>
                </>
              )}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showFeedback}
              placeholder="Type your answer..."
              className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-orange-500 focus:outline-none font-mono text-lg text-center"
            />
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSkip}
                disabled={showFeedback}
                className="btn-secondary flex-1"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={showFeedback || !userAnswer.trim()}
                className="btn-primary flex-1"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
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
                <Edit3 className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Well Done!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {correctAnswers}/{questions.length} correct answers
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-orange-500">
                    {calculateScore(correctAnswers)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Accuracy</span>
                  <span className="font-bold">
                    {Math.round((correctAnswers / questions.length) * 100)}%
                  </span>
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
