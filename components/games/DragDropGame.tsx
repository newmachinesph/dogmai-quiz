"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Move, RotateCcw, X, CheckCircle, XCircle } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface DragDropGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, correct: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface MatchItem {
  id: string;
  text: string;
  matchId: string;
}

export default function DragDropGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: DragDropGameProps) {
  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [connections, setConnections] = useState<Map<string, string>>(new Map());
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  useEffect(() => {
    if (!isGameActive || gameWon) return;
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isGameActive, gameWon]);

  const initializeGame = () => {
    const gamePairs = shuffleArray([...pairs]).slice(0, 6);

    const left: MatchItem[] = gamePairs.map((p, i) => ({
      id: `left-${i}`,
      text: p.front,
      matchId: `match-${i}`,
    }));

    const right: MatchItem[] = shuffleArray(
      gamePairs.map((p, i) => ({
        id: `right-${i}`,
        text: p.back,
        matchId: `match-${i}`,
      }))
    );

    setLeftItems(left);
    setRightItems(right);
    setConnections(new Map());
    setSelectedLeft(null);
    setCorrectMatches(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setShowResults(false);
  };

  const handleLeftClick = (id: string) => {
    if (showResults) return;
    setSelectedLeft(selectedLeft === id ? null : id);
  };

  const handleRightClick = (id: string) => {
    if (showResults || !selectedLeft) return;

    const newConnections = new Map(connections);

    // Remove any existing connection from this left item
    for (const [leftId, rightId] of connections.entries()) {
      if (leftId === selectedLeft) {
        newConnections.delete(leftId);
      }
    }

    // Remove any existing connection to this right item
    for (const [leftId, rightId] of connections.entries()) {
      if (rightId === id) {
        newConnections.delete(leftId);
      }
    }

    // Add new connection
    newConnections.set(selectedLeft, id);
    setConnections(newConnections);
    setSelectedLeft(null);

    // Check if all items are connected
    if (newConnections.size === leftItems.length) {
      checkResults(newConnections);
    }
  };

  const checkResults = (finalConnections: Map<string, string>) => {
    setShowResults(true);

    let correct = 0;
    finalConnections.forEach((rightId, leftId) => {
      const leftItem = leftItems.find((item) => item.id === leftId);
      const rightItem = rightItems.find((item) => item.id === rightId);
      if (leftItem && rightItem && leftItem.matchId === rightItem.matchId) {
        correct++;
      }
    });

    setCorrectMatches(correct);

    setTimeout(() => {
      setGameWon(true);
      setIsGameActive(false);
      const score = calculateScore(correct);
      onComplete(score, correct, timeElapsed);
    }, 2000);
  };

  const calculateScore = (correct: number) => {
    const baseScore = correct * 150;
    const difficultyMultiplier =
      difficulty === "advanced" ? 1.5 : difficulty === "intermediate" ? 1.2 : 1;
    return Math.round(baseScore * difficultyMultiplier);
  };

  const getConnectionStatus = (leftId: string, rightId: string) => {
    if (!showResults) return null;
    const leftItem = leftItems.find((item) => item.id === leftId);
    const rightItem = rightItems.find((item) => item.id === rightId);
    return leftItem?.matchId === rightItem?.matchId;
  };

  const isRightItemConnected = (rightId: string) => {
    for (const [, rId] of connections) {
      if (rId === rightId) return true;
    }
    return false;
  };

  const getConnectedLeftItem = (rightId: string) => {
    for (const [leftId, rId] of connections) {
      if (rId === rightId) return leftId;
    }
    return null;
  };

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
              <div className="stat-icon w-10 h-10 !bg-cyan-500/10">
                <Move className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <div className="label">Connected</div>
                <div className="text-xl font-bold">
                  {connections.size}/{leftItems.length}
                </div>
              </div>
            </div>

            {showResults && (
              <div className="flex items-center gap-3">
                <div className="stat-icon w-10 h-10 !bg-green-500/10">
                  <Trophy className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="label">Correct</div>
                  <div className="text-xl font-bold">{correctMatches}</div>
                </div>
              </div>
            )}
          </div>

          <button onClick={initializeGame} className="btn-secondary text-sm">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="card p-8">
        <div className="mb-8 text-center">
          <p className="label mb-2">Match the pairs</p>
          <p className="text-muted text-sm font-mono">
            Click a term on the left, then click its matching definition on the right
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-3">
            <p className="label mb-3">Terms</p>
            {leftItems.map((item) => {
              const isSelected = selectedLeft === item.id;
              const isConnected = connections.has(item.id);
              const connectedRight = connections.get(item.id);
              const isCorrect =
                showResults && connectedRight
                  ? getConnectionStatus(item.id, connectedRight)
                  : null;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleLeftClick(item.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isCorrect === true
                      ? "bg-green-500/20 border-green-500"
                      : isCorrect === false
                      ? "bg-red-500/20 border-red-500"
                      : isSelected
                      ? "bg-orange-500/20 border-orange-500"
                      : isConnected
                      ? "bg-cyan-500/20 border-cyan-500"
                      : "bg-white/[0.03] border-white/10 hover:border-white/30"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm flex-1">{item.text}</span>
                    {isCorrect === true && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {isCorrect === false && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <p className="label mb-3">Definitions</p>
            {rightItems.map((item) => {
              const isConnected = isRightItemConnected(item.id);
              const connectedLeft = getConnectedLeftItem(item.id);
              const isCorrect =
                showResults && connectedLeft
                  ? getConnectionStatus(connectedLeft, item.id)
                  : null;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleRightClick(item.id)}
                  disabled={!selectedLeft && !isConnected}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isCorrect === true
                      ? "bg-green-500/20 border-green-500"
                      : isCorrect === false
                      ? "bg-red-500/20 border-red-500"
                      : isConnected
                      ? "bg-cyan-500/20 border-cyan-500"
                      : selectedLeft
                      ? "bg-white/[0.03] border-white/10 hover:border-orange-500"
                      : "bg-white/[0.03] border-white/10 opacity-50"
                  }`}
                  whileHover={{ scale: selectedLeft ? 1.02 : 1 }}
                  whileTap={{ scale: selectedLeft ? 0.98 : 1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm flex-1">{item.text}</span>
                    {isCorrect === true && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {isCorrect === false && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {connections.size === leftItems.length && !showResults && (
          <div className="mt-8 text-center">
            <p className="text-muted font-mono text-sm">
              All items connected! Checking results...
            </p>
          </div>
        )}
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

              <div className="stat-icon w-20 h-20 mx-auto mb-6">
                <Move className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Matching Complete!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {correctMatches}/{leftItems.length} correct matches
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-orange-500">
                    {calculateScore(correctMatches)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Accuracy</span>
                  <span className="font-bold">
                    {Math.round((correctMatches / leftItems.length) * 100)}%
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
