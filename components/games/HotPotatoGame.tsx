"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Bomb, RotateCcw, X, AlertTriangle } from "lucide-react";
import { QuizPair } from "@/types";
import { shuffleArray } from "@/lib/utils";

interface HotPotatoGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, streak: number, survived: boolean) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function HotPotatoGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: HotPotatoGameProps) {
  const [currentPair, setCurrentPair] = useState<QuizPair | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [potatoTimer, setPotatoTimer] = useState(100); // Percentage
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [survived, setSurvived] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [shuffledPairs, setShuffledPairs] = useState<QuizPair[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  // Difficulty settings - timer drains faster at higher levels (slower for better UX)
  const settings = {
    beginner: { timerDrain: 2, rounds: 8, timeBonus: 25 },
    intermediate: { timerDrain: 3.5, rounds: 10, timeBonus: 20 },
    advanced: { timerDrain: 5, rounds: 10, timeBonus: 15 },
  }[difficulty];

  const difficultyMultiplier = { beginner: 1, intermediate: 1.2, advanced: 1.5 }[difficulty];

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  // Potato timer countdown
  useEffect(() => {
    if (!isGameActive || gameOver || selectedAnswer !== null) return;

    const interval = setInterval(() => {
      setPotatoTimer((prev) => {
        const newValue = prev - settings.timerDrain / 10;

        // Start shaking when low
        if (newValue < 30 && !isShaking) {
          setIsShaking(true);
        }

        if (newValue <= 0) {
          // BOOM!
          explode();
          return 0;
        }
        return newValue;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isGameActive, gameOver, selectedAnswer, settings.timerDrain, isShaking]);

  const initializeGame = () => {
    const shuffled = shuffleArray([...pairs]);
    setShuffledPairs(shuffled);
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setPotatoTimer(100);
    setIsGameActive(true);
    setGameOver(false);
    setSurvived(false);
    setShowExplosion(false);
    setSelectedAnswer(null);
    setIsShaking(false);
    setupQuestion(shuffled, 0);
  };

  const setupQuestion = (pairList: QuizPair[], index: number) => {
    const pair = pairList[index % pairList.length];
    setCurrentPair(pair);

    // Generate options
    const wrongAnswers = pairList
      .filter((p) => p.back !== pair.back)
      .map((p) => p.back)
      .slice(0, 3);

    const allOptions = shuffleArray([pair.back, ...wrongAnswers]);
    setOptions(allOptions);
    setCorrectIndex(allOptions.indexOf(pair.back));
    setPotatoTimer(100);
    setSelectedAnswer(null);
    setIsShaking(false);
  };

  const explode = useCallback(() => {
    setShowExplosion(true);
    setIsGameActive(false);
    setTimeout(() => {
      setGameOver(true);
      setSurvived(false);
      onComplete(score, bestStreak, false);
    }, 1000);
  }, [score, bestStreak, onComplete]);

  const handleAnswer = (index: number) => {
    if (!isGameActive || selectedAnswer !== null) return;

    setSelectedAnswer(index);

    if (index === correctIndex) {
      // Correct! Pass the potato
      const newStreak = streak + 1;
      const timeBonus = Math.floor(potatoTimer / 10);
      const roundScore = Math.round((100 + timeBonus * 5) * difficultyMultiplier);

      setScore((prev) => prev + roundScore);
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));

      setTimeout(() => {
        if (questionIndex < settings.rounds - 1) {
          const nextIndex = questionIndex + 1;
          setQuestionIndex(nextIndex);
          setupQuestion(shuffledPairs, nextIndex);
        } else {
          // Survived all rounds!
          setGameOver(true);
          setSurvived(true);
          setIsGameActive(false);
          onComplete(score + roundScore, Math.max(bestStreak, newStreak), true);
        }
      }, 500);
    } else {
      // Wrong answer = BOOM!
      setStreak(0);
      explode();
    }
  };

  const getPotatoColor = () => {
    if (potatoTimer > 60) return "from-yellow-500 to-orange-500";
    if (potatoTimer > 30) return "from-orange-500 to-red-500";
    return "from-red-500 to-red-700";
  };

  return (
    <div className="w-full">
      {/* Stats Bar */}
      <div className="card mb-8 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10">
                <Bomb className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="label">Round</div>
                <div className="text-xl font-bold">{questionIndex + 1}/{settings.rounds}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Score</div>
                <div className="text-xl font-bold text-green-500">{score}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-purple-500/10">
                <AlertTriangle className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="label">Streak</div>
                <div className="text-xl font-bold">{streak}</div>
              </div>
            </div>
          </div>

          <button onClick={initializeGame} className="btn-secondary text-sm">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Potato Timer */}
      <div className="card p-6 mb-6">
        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getPotatoColor()} rounded-full`}
            animate={{ width: `${potatoTimer}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-muted font-mono">HOT POTATO</span>
          <span className={`font-bold ${potatoTimer < 30 ? "text-red-500 animate-pulse" : "text-orange-500"}`}>
            {Math.ceil(potatoTimer)}%
          </span>
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        className="card p-8"
        animate={isShaking ? { x: [-2, 2, -2, 2, 0] } : {}}
        transition={{ duration: 0.3, repeat: isShaking ? Infinity : 0 }}
      >
        {/* Potato Visual */}
        <div className="flex justify-center mb-6">
          <motion.div
            className={`w-24 h-24 rounded-full bg-gradient-to-br ${getPotatoColor()} flex items-center justify-center shadow-lg`}
            animate={isShaking ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.2, repeat: isShaking ? Infinity : 0 }}
          >
            <Bomb className="w-12 h-12 text-white" />
          </motion.div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <p className="label mb-2">What does this mean?</p>
          <h2 className="text-2xl font-bold">{currentPair?.front}</h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((option, index) => {
            let buttonClass = "p-4 rounded-xl border-2 text-left transition-all font-medium ";

            if (selectedAnswer !== null) {
              if (index === correctIndex) {
                buttonClass += "border-green-500 bg-green-500/20 text-green-400";
              } else if (index === selectedAnswer) {
                buttonClass += "border-red-500 bg-red-500/20 text-red-400";
              } else {
                buttonClass += "border-white/10 bg-white/[0.02] text-muted";
              }
            } else {
              buttonClass += "border-white/10 bg-white/[0.03] hover:border-orange-500 hover:bg-orange-500/10 cursor-pointer";
            }

            return (
              <motion.button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={buttonClass}
                whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
              >
                <span className="text-orange-500 mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-muted text-sm font-mono">
            Answer before the potato explodes! Wrong answer = instant boom!
          </p>
        </div>
      </motion.div>

      {/* Explosion Animation */}
      <AnimatePresence>
        {showExplosion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-900/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 2, 1.5] }}
              className="text-9xl"
            >
              💥
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && !showExplosion && (
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

              <div className={`stat-icon w-20 h-20 mx-auto mb-6 ${survived ? "!bg-green-500/10" : "!bg-red-500/10"}`}>
                {survived ? (
                  <Trophy className="w-10 h-10 text-green-500" />
                ) : (
                  <Bomb className="w-10 h-10 text-red-500" />
                )}
              </div>

              <h2 className="heading-3 mb-2">
                {survived ? "You Survived!" : "BOOM!"}
              </h2>
              <p className="text-muted font-mono text-sm mb-8">
                {survived
                  ? `Completed all ${settings.rounds} rounds!`
                  : `Exploded on round ${questionIndex + 1}`}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-orange-500">{score}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Best Streak</span>
                  <span className="font-bold">{bestStreak}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted font-mono text-sm">Rounds</span>
                  <span className="font-bold">{questionIndex + (survived ? 1 : 0)}/{settings.rounds}</span>
                </div>
              </div>

              <button onClick={initializeGame} className="btn-primary w-full">
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
