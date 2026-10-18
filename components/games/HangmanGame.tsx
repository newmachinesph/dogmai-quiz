"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Skull, RotateCcw, X, Heart } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface HangmanGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, wins: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function HangmanGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: HangmanGameProps) {
  const [words, setWords] = useState<{ word: string; hint: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [wins, setWins] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [roundResult, setRoundResult] = useState<"win" | "lose" | null>(null);

  const maxWrongGuesses = difficulty === "advanced" ? 4 : difficulty === "intermediate" ? 5 : 6;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  useEffect(() => {
    if (!isGameActive || gameWon) return;
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isGameActive, gameWon]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isGameActive || roundResult) return;
      const letter = e.key.toUpperCase();
      if (alphabet.includes(letter) && !guessedLetters.has(letter)) {
        handleGuess(letter);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isGameActive, guessedLetters, roundResult]);

  const initializeGame = () => {
    const wordList = shuffleArray(
      pairs.map((p) => ({
        word: p.back.toUpperCase().replace(/[^A-Z]/g, ""),
        hint: p.front,
      }))
    )
      .filter((w) => w.word.length >= 3)
      .slice(0, 5);

    setWords(wordList);
    setCurrentIndex(0);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setWins(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setRoundResult(null);
  };

  const handleGuess = useCallback(
    (letter: string) => {
      if (guessedLetters.has(letter) || roundResult) return;

      const newGuessed = new Set(guessedLetters);
      newGuessed.add(letter);
      setGuessedLetters(newGuessed);

      const currentWord = words[currentIndex]?.word || "";

      if (!currentWord.includes(letter)) {
        const newWrongGuesses = wrongGuesses + 1;
        setWrongGuesses(newWrongGuesses);

        if (newWrongGuesses >= maxWrongGuesses) {
          setRoundResult("lose");
          setTimeout(() => nextRound(false), 2000);
        }
      } else {
        // Check if word is complete
        const isComplete = currentWord
          .split("")
          .every((l) => newGuessed.has(l));

        if (isComplete) {
          setWins((prev) => prev + 1);
          setRoundResult("win");
          setTimeout(() => nextRound(true), 1500);
        }
      }
    },
    [guessedLetters, words, currentIndex, wrongGuesses, maxWrongGuesses, roundResult]
  );

  const nextRound = (won: boolean) => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setGuessedLetters(new Set());
      setWrongGuesses(0);
      setRoundResult(null);
    } else {
      setGameWon(true);
      setIsGameActive(false);
      const finalWins = won ? wins + 1 : wins;
      const score = calculateScore(finalWins);
      setTimeout(() => onComplete(score, finalWins, timeElapsed), 500);
    }
  };

  const calculateScore = (totalWins: number) => {
    const baseScore = totalWins * 200;
    const difficultyMultiplier =
      difficulty === "advanced" ? 1.5 : difficulty === "intermediate" ? 1.2 : 1;
    return Math.round(baseScore * difficultyMultiplier);
  };

  const currentWord = words[currentIndex]?.word || "";
  const currentHint = words[currentIndex]?.hint || "";

  const renderWord = () => {
    return currentWord.split("").map((letter, idx) => (
      <span
        key={idx}
        className={`w-10 h-14 border-b-4 flex items-center justify-center text-3xl font-bold ${
          guessedLetters.has(letter)
            ? "text-green-500 border-green-500"
            : roundResult === "lose"
            ? "text-red-500 border-red-500"
            : "border-white/30"
        }`}
      >
        {guessedLetters.has(letter) || roundResult === "lose" ? letter : ""}
      </span>
    ));
  };

  const renderLives = () => {
    const lives = maxWrongGuesses - wrongGuesses;
    return (
      <div className="flex gap-1">
        {Array.from({ length: maxWrongGuesses }).map((_, idx) => (
          <Heart
            key={idx}
            className={`w-6 h-6 ${
              idx < lives ? "text-red-500 fill-red-500" : "text-white/20"
            }`}
          />
        ))}
      </div>
    );
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
              <div className="stat-icon w-10 h-10 !bg-red-500/10">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="label">Lives</div>
                {renderLives()}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Wins</div>
                <div className="text-xl font-bold">{wins}/{words.length}</div>
              </div>
            </div>
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
          <p className="label mb-2">Hint</p>
          <h2 className="text-xl font-bold font-mono text-orange-500">{currentHint}</h2>
        </div>

        {roundResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-8 p-4 rounded-xl text-center ${
              roundResult === "win"
                ? "bg-green-500/20 border border-green-500"
                : "bg-red-500/20 border border-red-500"
            }`}
          >
            <p className="font-bold text-lg">
              {roundResult === "win" ? "Correct!" : `The word was: ${currentWord}`}
            </p>
          </motion.div>
        )}

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {renderWord()}
        </div>

        <div className="grid grid-cols-9 gap-2 max-w-lg mx-auto">
          {alphabet.map((letter) => {
            const isGuessed = guessedLetters.has(letter);
            const isInWord = currentWord.includes(letter);
            return (
              <motion.button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={isGuessed || !!roundResult}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                  isGuessed
                    ? isInWord
                      ? "bg-green-500/20 text-green-500 border border-green-500"
                      : "bg-red-500/20 text-red-500 border border-red-500"
                    : "bg-white/[0.03] border border-white/10 hover:border-orange-500 hover:bg-orange-500/10"
                }`}
                whileHover={{ scale: isGuessed ? 1 : 1.1 }}
                whileTap={{ scale: isGuessed ? 1 : 0.95 }}
              >
                {letter}
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-muted text-sm mt-6 font-mono">
          Use your keyboard or click letters to guess
        </p>
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
                <Skull className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Game Over!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {wins}/{words.length} words guessed
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-orange-500">
                    {calculateScore(wins)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Win Rate</span>
                  <span className="font-bold">
                    {Math.round((wins / words.length) * 100)}%
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
