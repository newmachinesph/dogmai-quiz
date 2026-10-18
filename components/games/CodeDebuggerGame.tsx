"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Bug, RotateCcw, X, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface CodeDebuggerGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, correct: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface BugQuestion {
  buggyCode: string;
  correctCode: string;
  bugDescription: string;
  options: string[];
  correctAnswer: number;
}

export default function CodeDebuggerGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: CodeDebuggerGameProps) {
  const [questions, setQuestions] = useState<BugQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
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

  const generateBuggyVersions = (code: string): { buggy: string; description: string }[] => {
    const bugs = [
      { pattern: /\(/g, replacement: "[", description: "Wrong bracket type" },
      { pattern: /\)/g, replacement: "]", description: "Wrong bracket type" },
      { pattern: /\./g, replacement: ",", description: "Wrong punctuation" },
      { pattern: /=/g, replacement: "==", description: "Assignment vs comparison" },
      { pattern: /==/g, replacement: "=", description: "Comparison vs assignment" },
      { pattern: /let /g, replacement: "const ", description: "Wrong keyword" },
      { pattern: /const /g, replacement: "var ", description: "Wrong keyword" },
      { pattern: /true/g, replacement: "false", description: "Wrong boolean" },
      { pattern: /\+/g, replacement: "-", description: "Wrong operator" },
    ];

    const applicableBugs = bugs.filter(bug => bug.pattern.test(code));
    if (applicableBugs.length === 0) return [];

    return applicableBugs.slice(0, 3).map(bug => ({
      buggy: code.replace(bug.pattern, bug.replacement),
      description: bug.description
    }));
  };

  const initializeGame = () => {
    const bugQuestions: BugQuestion[] = [];

    pairs.forEach((pair) => {
      const bugVersions = generateBuggyVersions(pair.front);
      if (bugVersions.length > 0) {
        const selectedBug = bugVersions[0];
        const wrongOptions = [
          "Missing semicolon",
          "Undefined variable",
          "Type mismatch",
          "Syntax error",
          "Missing return statement",
        ].filter(opt => opt !== selectedBug.description);

        const allOptions = shuffleArray([
          selectedBug.description,
          ...shuffleArray(wrongOptions).slice(0, 3)
        ]);

        bugQuestions.push({
          buggyCode: selectedBug.buggy,
          correctCode: pair.front,
          bugDescription: selectedBug.description,
          options: allOptions,
          correctAnswer: allOptions.indexOf(selectedBug.description),
        });
      }
    });

    // If not enough bug questions, create some based on the pairs
    if (bugQuestions.length < 5) {
      pairs.slice(0, 8).forEach((pair, idx) => {
        const bugTypes = [
          { buggy: pair.front.replace(/[()]/g, ""), desc: "Missing parentheses" },
          { buggy: pair.front + " // undefined", desc: "Incomplete statement" },
          { buggy: pair.front.toLowerCase(), desc: "Case sensitivity issue" },
        ];
        const bug = bugTypes[idx % bugTypes.length];
        const wrongOptions = ["Syntax error", "Type error", "Reference error", "Logic error"];
        const allOptions = shuffleArray([bug.desc, ...wrongOptions.slice(0, 3)]);

        bugQuestions.push({
          buggyCode: bug.buggy,
          correctCode: pair.front,
          bugDescription: bug.desc,
          options: allOptions,
          correctAnswer: allOptions.indexOf(bug.desc),
        });
      });
    }

    setQuestions(shuffleArray(bugQuestions).slice(0, 8));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setShowFeedback(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;

    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    const isCorrect = answerIndex === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
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
    const baseScore = correct * 125;
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
              <div className="stat-icon w-10 h-10 !bg-red-500/10">
                <Bug className="w-5 h-5 text-red-500" />
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
                <div className="label">Fixed</div>
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
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <p className="label">Find the bug in this code</p>
            </div>

            <div className="bg-black/50 rounded-xl p-6 border border-red-500/30 mb-4">
              <pre className="font-mono text-lg text-red-400 overflow-x-auto">
                <code>{currentQuestion.buggyCode}</code>
              </pre>
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 rounded-xl p-4 border border-green-500/30"
              >
                <p className="text-sm text-muted mb-2">Correct code:</p>
                <pre className="font-mono text-green-400 overflow-x-auto">
                  <code>{currentQuestion.correctCode}</code>
                </pre>
              </motion.div>
            )}
          </div>

          <p className="text-center text-muted font-mono text-sm mb-6">
            What type of bug is this?
          </p>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              const showCorrect = showFeedback && isCorrect;
              const showWrong = showFeedback && isSelected && !isCorrect;

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
                    {showCorrect && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                    {showWrong && <XCircle className="w-5 h-5 text-red-500 ml-auto" />}
                  </div>
                </motion.button>
              );
            })}
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
                <Bug className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Bugs Squashed!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {correctAnswers}/{questions.length} bugs identified
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
                Debug Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
