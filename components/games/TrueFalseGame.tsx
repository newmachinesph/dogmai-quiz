"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, CheckCircle, XCircle, RotateCcw, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface TrueFalseGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, correct: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface Statement {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export default function TrueFalseGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: TrueFalseGameProps) {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  useEffect(() => {
    if (!isGameActive || gameWon) return;
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isGameActive, gameWon]);

  const initializeGame = () => {
    const generatedStatements: Statement[] = [];

    pairs.forEach((pair, idx) => {
      // True statement
      generatedStatements.push({
        statement: `"${pair.front}" means "${pair.back}"`,
        isTrue: true,
        explanation: `Correct! ${pair.front} = ${pair.back}`,
      });

      // False statement (mix with wrong answer)
      const wrongPair = pairs[(idx + 1) % pairs.length];
      generatedStatements.push({
        statement: `"${pair.front}" means "${wrongPair.back}"`,
        isTrue: false,
        explanation: `Incorrect! ${pair.front} = ${pair.back}`,
      });
    });

    setStatements(shuffleArray(generatedStatements).slice(0, 10));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setShowFeedback(false);
  };

  const handleAnswer = (answer: boolean) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === statements[currentIndex].isTrue;
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < statements.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setGameWon(true);
        setIsGameActive(false);
        const finalCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;
        const score = calculateScore(finalCorrect);
        setTimeout(() => onComplete(score, finalCorrect, timeElapsed), 500);
      }
    }, 1500);
  };

  const calculateScore = (correct: number) => {
    const baseScore = correct * 100;
    const difficultyMultiplier =
      difficulty === "advanced" ? 1.5 : difficulty === "intermediate" ? 1.2 : 1;
    return Math.round(baseScore * difficultyMultiplier);
  };

  const currentStatement = statements[currentIndex];

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
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Progress</div>
                <div className="text-xl font-bold">
                  {currentIndex + 1}/{statements.length}
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

      {/* Statement Card */}
      {currentStatement && (
        <div className="card p-8">
          <div className="mb-8 text-center">
            <p className="label mb-4">Statement {currentIndex + 1}</p>
            <h2 className="text-xl sm:text-2xl font-bold font-mono leading-relaxed">
              {currentStatement.statement}
            </h2>
          </div>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-4 rounded-xl text-center ${
                selectedAnswer === currentStatement.isTrue
                  ? "bg-green-500/20 border border-green-500"
                  : "bg-red-500/20 border border-red-500"
              }`}
            >
              <p className="font-mono text-sm">{currentStatement.explanation}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => handleAnswer(true)}
              disabled={showFeedback}
              className={`p-6 rounded-xl border transition-all ${
                showFeedback && currentStatement.isTrue
                  ? "bg-green-500/20 border-green-500"
                  : showFeedback && selectedAnswer === true && !currentStatement.isTrue
                  ? "bg-red-500/20 border-red-500"
                  : "bg-white/[0.03] border-white/10 hover:border-green-500 hover:bg-green-500/10"
              }`}
              whileHover={{ scale: showFeedback ? 1 : 1.02 }}
              whileTap={{ scale: showFeedback ? 1 : 0.98 }}
            >
              <div className="flex flex-col items-center gap-3">
                <ThumbsUp className="w-8 h-8 text-green-500" />
                <span className="font-bold text-lg">TRUE</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleAnswer(false)}
              disabled={showFeedback}
              className={`p-6 rounded-xl border transition-all ${
                showFeedback && !currentStatement.isTrue
                  ? "bg-green-500/20 border-green-500"
                  : showFeedback && selectedAnswer === false && currentStatement.isTrue
                  ? "bg-red-500/20 border-red-500"
                  : "bg-white/[0.03] border-white/10 hover:border-red-500 hover:bg-red-500/10"
              }`}
              whileHover={{ scale: showFeedback ? 1 : 1.02 }}
              whileTap={{ scale: showFeedback ? 1 : 0.98 }}
            >
              <div className="flex flex-col items-center gap-3">
                <ThumbsDown className="w-8 h-8 text-red-500" />
                <span className="font-bold text-lg">FALSE</span>
              </div>
            </motion.button>
          </div>
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
                <Trophy className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Game Complete!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {correctAnswers}/{statements.length} correct answers
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
                    {Math.round((correctAnswers / statements.length) * 100)}%
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
