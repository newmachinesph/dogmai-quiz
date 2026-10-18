"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Keyboard, RotateCcw, X, Zap } from "lucide-react";
import { QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface TypingChallengeGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, wpm: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function TypingChallengeGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: TypingChallengeGameProps) {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [correctWords, setCorrectWords] = useState(0);
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [correctCharacters, setCorrectCharacters] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  useEffect(() => {
    if (!isGameActive || gameWon || !hasStartedTyping) return;
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isGameActive, gameWon, hasStartedTyping]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  const initializeGame = () => {
    // Use the "back" (definitions) as typing challenges
    const wordList = shuffleArray(pairs.map((p) => p.back)).slice(0, 10);
    setWords(wordList);
    setCurrentIndex(0);
    setUserInput("");
    setCorrectWords(0);
    setTotalCharacters(0);
    setCorrectCharacters(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setHasStartedTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
    }

    const value = e.target.value;
    setUserInput(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only advance on Enter key press (not space, to allow multi-word terms)
    if (e.key === "Enter") {
      e.preventDefault();
      submitWord();
    }
  };

  const submitWord = () => {
    const typedWord = userInput.trim();
    const targetWord = words[currentIndex];

    if (typedWord.length === 0) return;

    setTotalCharacters((prev) => prev + targetWord.length);

    if (typedWord === targetWord) {
      setCorrectWords((prev) => prev + 1);
      setCorrectCharacters((prev) => prev + targetWord.length);
    } else {
      // Count correct characters
      let correct = 0;
      for (let i = 0; i < Math.min(typedWord.length, targetWord.length); i++) {
        if (typedWord[i] === targetWord[i]) correct++;
      }
      setCorrectCharacters((prev) => prev + correct);
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserInput("");
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameWon(true);
    setIsGameActive(false);
    const wpm = calculateWPM();
    const score = calculateScore();
    setTimeout(() => onComplete(score, wpm, timeElapsed), 500);
  };

  const calculateWPM = () => {
    if (timeElapsed === 0) return 0;
    // Standard: 5 characters = 1 word
    const wordsTyped = totalCharacters / 5;
    const minutes = timeElapsed / 60;
    return Math.round(wordsTyped / minutes);
  };

  const calculateAccuracy = () => {
    if (totalCharacters === 0) return 100;
    return Math.round((correctCharacters / totalCharacters) * 100);
  };

  const calculateScore = () => {
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    const baseScore = (wpm * accuracy) / 10;
    const difficultyMultiplier =
      difficulty === "advanced" ? 1.5 : difficulty === "intermediate" ? 1.2 : 1;
    return Math.round(baseScore * difficultyMultiplier);
  };

  const currentWord = words[currentIndex];

  const renderWord = () => {
    if (!currentWord) return null;

    return currentWord.split("").map((char, idx) => {
      let className = "text-muted";
      if (idx < userInput.length) {
        className = userInput[idx] === char ? "text-green-500" : "text-red-500";
      } else if (idx === userInput.length) {
        className = "text-foreground border-b-2 border-orange-500";
      }
      return (
        <span key={idx} className={`font-mono text-3xl ${className}`}>
          {char}
        </span>
      );
    });
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
              <div className="stat-icon w-10 h-10 !bg-blue-500/10">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="label">WPM</div>
                <div className="text-xl font-bold">{calculateWPM()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Accuracy</div>
                <div className="text-xl font-bold">{calculateAccuracy()}%</div>
              </div>
            </div>
          </div>

          <button onClick={initializeGame} className="btn-secondary text-sm">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Typing Area */}
      <div className="card p-8">
        <div className="mb-8 text-center">
          <p className="label mb-2">Word {currentIndex + 1} of {words.length}</p>
          <div className="flex items-center justify-center gap-1 min-h-[48px]">
            {renderWord()}
          </div>
        </div>

        <div className="mb-8">
          <p className="label mb-4 text-center">Upcoming words</p>
          <div className="flex flex-wrap justify-center gap-3">
            {words.slice(currentIndex + 1, currentIndex + 4).map((word, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 font-mono text-sm text-muted"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Start typing..."
          className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-orange-500 focus:outline-none font-mono text-lg text-center"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />

        <div className="mt-4 text-center">
          <Keyboard className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-muted text-sm font-mono">
            Type each word and press Enter to continue
          </p>
        </div>
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
                <Keyboard className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">Typing Complete!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                {correctWords}/{words.length} words correct
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-orange-500">
                    {calculateScore()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">WPM</span>
                  <span className="font-bold text-blue-500">{calculateWPM()}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Accuracy</span>
                  <span className="font-bold">{calculateAccuracy()}%</span>
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
