"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Shuffle, RotateCcw, X, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface WordScrambleGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, correct: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function WordScrambleGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: WordScrambleGameProps) {
  const [words, setWords] = useState<{ original: string; scrambled: string; hint: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
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

  const scrambleWord = (word: string): string => {
    const letters = word.toUpperCase().replace(/[^A-Z]/g, "").split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    // Make sure it's actually scrambled
    const scrambled = letters.join("");
    if (scrambled === word.toUpperCase().replace(/[^A-Z]/g, "")) {
      return scrambleWord(word);
    }
    return scrambled;
  };

  const initializeGame = () => {
    const wordList = shuffleArray(
      pairs.map((p) => ({
        original: p.back.toUpperCase().replace(/[^A-Z ]/g, ""),
        scrambled: scrambleWord(p.back),
        hint: p.front,
      }))
    ).filter((w) => w.original.replace(/\s/g, "").length >= 3).slice(0, 8);

    setWords(wordList);
    setCurrentIndex(0);
    setUserAnswer("");
    setCorrectAnswers(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setShowFeedback(false);
    setIsCorrect(false);
    setHintsUsed(0);
    setShowHint(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showFeedback || !userAnswer.trim()) return;

    const correct = userAnswer.toUpperCase().replace(/[^A-Z]/g, "") ===
                   words[currentIndex].original.replace(/\s/g, "");
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setUserAnswer("");
        setShowFeedback(false);
        setIsCorrect(false);
        setShowHint(false);
      } else {
        setGameWon(true);
        setIsGameActive(false);
        const finalCorrect = correct ? correctAnswers + 1 : correctAnswers;
        const score = calculateScore(finalCorrect);
        setTimeout(() => onComplete(score, finalCorrect, timeElapsed), 500);
      }
    }, 1500);
  };

  const handleHint = () => {
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);
  };

  const calculateScore = (correct: number) => {
    const baseScore = correct * 100;
    const hintPenalty = hintsUsed * 10;
    const difficultyMultiplier =
      difficulty === "advanced" ? 1.5 : difficulty === "intermediate" ? 1.2 : 1;
    return Math.round((baseScore - hintPenalty) * difficultyMultiplier);
  };

  const currentWord = words[currentIndex];

  const renderScrambledLetters = () => {
    if (!currentWord) return null;
    return currentWord.scrambled.split("").map((letter, idx) => (
      <motion.span
        key={idx}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="w-10 h-12 bg-orange-500/20 border border-orange-500 rounded-lg flex items-center justify-center text-xl font-bold text-orange-500"
      >
        {letter}
      </motion.span>
    ));
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
              <div className="stat-icon w-10 h-10 !bg-purple-500/10">
                <Shuffle className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="label">Progress</div>
                <div className="text-xl font-bold">
                  {currentIndex + 1}/{words.length}
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

      {/* Game Card */}
      {currentWord && (
        <div className="card p-8">
          <div className="mb-8 text-center">
            <p className="label mb-2">Unscramble the word</p>
            <p className="text-muted text-sm font-mono mb-6">Hint: {currentWord.hint}</p>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {renderScrambledLetters()}
            </div>

            {showHint && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-yellow-500 font-mono text-sm"
              >
                First letter: {currentWord.original[0]}
              </motion.p>
            )}
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
                  <span className="font-mono">Answer: {currentWord.original}</span>
                </>
              )}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
              disabled={showFeedback}
              placeholder="Type the unscrambled word..."
              className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-orange-500 focus:outline-none font-mono text-lg text-center uppercase"
              autoComplete="off"
            />
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleHint}
                disabled={showFeedback || showHint}
                className="btn-secondary flex-1"
              >
                <Lightbulb className="w-4 h-4" />
                Hint
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
                <Shuffle className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Unscrambled!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {correctAnswers}/{words.length} words solved
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-orange-500">
                    {calculateScore(correctAnswers)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Hints Used</span>
                  <span className="font-bold">{hintsUsed}</span>
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
