"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Trophy, Timer, List, RotateCcw, X, CheckCircle, XCircle, GripVertical } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface SequenceGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, correct: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface SequenceQuestion {
  items: { id: string; text: string }[];
  correctOrder: string[];
  title: string;
}

export default function SequenceGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: SequenceGameProps) {
  const [questions, setQuestions] = useState<SequenceQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<{ id: string; text: string }[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  useEffect(() => {
    if (!isGameActive || gameWon) return;
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isGameActive, gameWon]);

  const initializeGame = () => {
    // Group pairs into sequences of 4
    const chunkedPairs: QuizPair[][] = [];
    for (let i = 0; i < pairs.length; i += 4) {
      if (i + 4 <= pairs.length) {
        chunkedPairs.push(pairs.slice(i, i + 4));
      }
    }

    const generatedQuestions: SequenceQuestion[] = chunkedPairs.map((chunk, idx) => {
      const items = chunk.map((pair, i) => ({
        id: `${idx}-${i}`,
        text: pair.front,
      }));
      const correctOrder = items.map((item) => item.id);
      return {
        items: shuffleArray([...items]),
        correctOrder,
        title: `Arrange in correct order`,
      };
    });

    if (generatedQuestions.length === 0) {
      // Fallback: use individual pairs
      const items = pairs.slice(0, 4).map((pair, i) => ({
        id: `0-${i}`,
        text: pair.front,
      }));
      generatedQuestions.push({
        items: shuffleArray([...items]),
        correctOrder: items.map((item) => item.id),
        title: "Arrange in correct order",
      });
    }

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setCurrentOrder(generatedQuestions[0]?.items || []);
    setCorrectAnswers(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const currentOrderIds = currentOrder.map((item) => item.id);
    const correct =
      JSON.stringify(currentOrderIds) ===
      JSON.stringify(questions[currentIndex].correctOrder);

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setCurrentOrder(questions[nextIndex].items);
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

  const calculateScore = (correct: number) => {
    const baseScore = correct * 150;
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
              <div className="stat-icon w-10 h-10 !bg-indigo-500/10">
                <List className="w-5 h-5 text-indigo-500" />
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
            <p className="label mb-2">Sequence {currentIndex + 1}</p>
            <h2 className="text-xl sm:text-2xl font-bold">{currentQuestion.title}</h2>
            <p className="text-muted text-sm mt-2">Drag items to reorder them</p>
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
                  <span className="font-mono">Perfect order!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="font-mono">Not quite right</span>
                </>
              )}
            </motion.div>
          )}

          <Reorder.Group
            axis="y"
            values={currentOrder}
            onReorder={setCurrentOrder}
            className="space-y-3"
          >
            {currentOrder.map((item, idx) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className={`p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                  showFeedback
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-white/[0.03] border-white/10 hover:border-orange-500"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <span className="font-mono flex-1">{item.text}</span>
                  <GripVertical className="w-5 h-5 text-muted" />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={showFeedback}
              className="btn-primary w-full"
            >
              Check Order
            </button>
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
                <List className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Sequences Complete!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {correctAnswers}/{questions.length} correct sequences
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
