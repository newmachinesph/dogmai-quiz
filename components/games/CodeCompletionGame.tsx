"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Code2, Trophy, RotateCcw, ArrowRight, Lightbulb } from "lucide-react";
import { QuizPair } from "@/types";

interface CodeCompletionGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, ...args: unknown[]) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function CodeCompletionGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: CodeCompletionGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!gameComplete) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Create a fill-in-the-blank from the pair
  const createCodeChallenge = (pair: QuizPair) => {
    // Use the front as the concept to identify
    const concept = pair.front;
    const description = pair.back;

    // Create a code-like challenge
    return {
      codeTemplate: `// Complete the code:
// ${description}
const result = ____;`,
      answer: concept.replace(/[<>]/g, "").toLowerCase().trim(),
      hint: description,
    };
  };

  const currentChallenge = createCodeChallenge(pairs[currentIndex]);

  const checkAnswer = () => {
    const userAnswer = userInput.toLowerCase().trim();
    const correctAnswer = currentChallenge.answer.toLowerCase();

    // Allow for partial matches and common variations
    const isCorrect =
      userAnswer === correctAnswer ||
      correctAnswer.includes(userAnswer) ||
      userAnswer.includes(correctAnswer) ||
      pairs[currentIndex].front.toLowerCase().includes(userAnswer);

    if (isCorrect) {
      const basePoints = difficulty === "advanced" ? 20 : difficulty === "intermediate" ? 15 : 10;
      const hintPenalty = showHint ? 5 : 0;
      setScore((prev) => prev + basePoints - hintPenalty);
      setCorrectAnswers((prev) => prev + 1);
      setShowResult("correct");
    } else {
      setShowResult("wrong");
    }

    setTimeout(() => {
      if (currentIndex < pairs.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setUserInput("");
        setShowResult(null);
        setShowHint(false);
      } else {
        setGameComplete(true);
        onComplete(score + (isCorrect ? 10 : 0), score + (isCorrect ? 10 : 0), timeElapsed, undefined, correctAnswers + (isCorrect ? 1 : 0), pairs.length);
      }
    }, 1500);
  };

  const skipQuestion = () => {
    if (currentIndex < pairs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserInput("");
      setShowResult(null);
      setShowHint(false);
    } else {
      setGameComplete(true);
      onComplete(score, score, timeElapsed, undefined, correctAnswers, pairs.length);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setUserInput("");
    setShowResult(null);
    setShowHint(false);
    setCorrectAnswers(0);
    setGameComplete(false);
    setTimeElapsed(0);
  };

  if (gameComplete) {
    const accuracy = Math.round((correctAnswers / pairs.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card text-center py-12"
      >
        <div className="stat-icon w-20 h-20 mx-auto mb-6">
          <Trophy className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="heading-2 mb-4">Code Complete!</h2>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
          <div className="bg-white/[0.03] rounded-xl p-4">
            <div className="stat-value text-orange-500">{score}</div>
            <div className="stat-label">Total Score</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4">
            <div className="stat-value">{formatTime(timeElapsed)}</div>
            <div className="stat-label">Time</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4">
            <div className="stat-value text-green-500">{accuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4">
            <div className="stat-value">
              {correctAnswers}/{pairs.length}
            </div>
            <div className="stat-label">Correct</div>
          </div>
        </div>

        <button onClick={resetGame} className="btn-primary">
          <RotateCcw className="w-4 h-4" />
          Play Again
        </button>
      </motion.div>
    );
  }

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
            <span className="text-muted font-mono text-sm">Time</span>
            <span className="ml-2 font-bold">{formatTime(timeElapsed)}</span>
          </div>
        </div>
        <div className="text-muted font-mono text-sm">
          {currentIndex + 1} / {pairs.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / pairs.length) * 100}%` }}
        />
      </div>

      {/* Code Challenge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="stat-icon w-10 h-10">
              <Code2 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="heading-3">Complete the Code</h2>
              <p className="text-muted font-mono text-sm">
                Fill in the blank with the correct value
              </p>
            </div>
          </div>

          {/* Code Display */}
          <div className="bg-black/30 rounded-xl p-6 font-mono text-sm mb-6">
            <pre className="whitespace-pre-wrap">
              <span className="text-muted">// Complete the code:</span>
              {"\n"}
              <span className="text-muted">// {pairs[currentIndex].back}</span>
              {"\n\n"}
              <span className="text-blue-400">const</span>{" "}
              <span className="text-white">result</span>{" "}
              <span className="text-orange-500">=</span>{" "}
              <span
                className={`px-2 py-1 rounded ${
                  showResult === "correct"
                    ? "bg-green-500/20 text-green-500"
                    : showResult === "wrong"
                    ? "bg-red-500/20 text-red-500"
                    : "bg-orange-500/20 text-orange-500"
                }`}
              >
                {showResult
                  ? showResult === "correct"
                    ? userInput || pairs[currentIndex].front
                    : pairs[currentIndex].front
                  : "____"}
              </span>
              <span className="text-white">;</span>
            </pre>
          </div>

          {/* Hint */}
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <Lightbulb className="w-4 h-4" />
                <span className="font-bold text-sm">Hint</span>
              </div>
              <p className="text-sm text-muted">
                This is: <span className="text-yellow-500">{pairs[currentIndex].back}</span>
              </p>
            </motion.div>
          )}

          {/* Result Feedback */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
                showResult === "correct"
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              {showResult === "correct" ? (
                <>
                  <Check className="w-6 h-6 text-green-500" />
                  <span className="text-green-500 font-bold">Correct!</span>
                </>
              ) : (
                <>
                  <X className="w-6 h-6 text-red-500" />
                  <span>
                    <span className="text-red-500 font-bold">Incorrect.</span>{" "}
                    <span className="text-muted">
                      The answer was: <span className="text-white">{pairs[currentIndex].front}</span>
                    </span>
                  </span>
                </>
              )}
            </motion.div>
          )}

          {/* Input */}
          {!showResult && (
            <div className="space-y-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && userInput && checkAnswer()}
                placeholder="Type your answer..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-orange-500/50 focus:outline-none font-mono"
                autoFocus
              />

              <div className="flex items-center gap-4">
                <button
                  onClick={checkAnswer}
                  disabled={!userInput}
                  className="btn-primary flex-1"
                >
                  <Check className="w-4 h-4" />
                  Submit
                </button>

                <button
                  onClick={() => setShowHint(true)}
                  disabled={showHint}
                  className="btn-secondary"
                >
                  <Lightbulb className="w-4 h-4" />
                  Hint
                </button>

                <button onClick={skipQuestion} className="btn-secondary">
                  Skip
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
