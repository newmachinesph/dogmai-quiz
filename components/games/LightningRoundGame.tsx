"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Timer, RotateCcw, X, TrendingUp } from "lucide-react";
import { QuizPair } from "@/types";
import { shuffleArray } from "@/lib/utils";

interface LightningRoundGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, level: number, questionsAnswered: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function LightningRoundGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: LightningRoundGameProps) {
  const [currentPair, setCurrentPair] = useState<QuizPair | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [questionTimer, setQuestionTimer] = useState(100); // Percentage
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [shuffledPairs, setShuffledPairs] = useState<QuizPair[]>([]);
  const [questionsInLevel, setQuestionsInLevel] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Difficulty settings - more time to think
  const settings = {
    beginner: { startTime: 12000, minTime: 4000, speedIncrease: 800, questionsPerLevel: 4 },
    intermediate: { startTime: 10000, minTime: 3000, speedIncrease: 700, questionsPerLevel: 4 },
    advanced: { startTime: 8000, minTime: 2000, speedIncrease: 600, questionsPerLevel: 3 },
  }[difficulty];

  const difficultyMultiplier = { beginner: 1, intermediate: 1.2, advanced: 1.5 }[difficulty];

  // Calculate current time limit based on level
  const getCurrentTimeLimit = useCallback(() => {
    const reduction = (level - 1) * settings.speedIncrease;
    return Math.max(settings.minTime, settings.startTime - reduction);
  }, [level, settings]);

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  // Question timer
  useEffect(() => {
    if (!isGameActive || gameOver || selectedAnswer !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const timeLimit = getCurrentTimeLimit();
    const decrementPerTick = 100 / (timeLimit / 50); // Update every 50ms

    timerRef.current = setInterval(() => {
      setQuestionTimer((prev) => {
        const newValue = prev - decrementPerTick;
        if (newValue <= 0) {
          // Time's up!
          handleTimeout();
          return 0;
        }
        return newValue;
      });
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameActive, gameOver, selectedAnswer, getCurrentTimeLimit]);

  const initializeGame = () => {
    const shuffled = shuffleArray([...pairs]);
    setShuffledPairs(shuffled);
    setQuestionIndex(0);
    setScore(0);
    setLevel(1);
    setQuestionsInLevel(0);
    setQuestionTimer(100);
    setIsGameActive(true);
    setGameOver(false);
    setSelectedAnswer(null);
    setShowLevelUp(false);
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
    setQuestionTimer(100);
    setSelectedAnswer(null);
  };

  const handleTimeout = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    endGame();
  }, []);

  const handleAnswer = (index: number) => {
    if (!isGameActive || selectedAnswer !== null) return;

    setSelectedAnswer(index);
    if (timerRef.current) clearInterval(timerRef.current);

    if (index === correctIndex) {
      // Correct!
      const timeBonus = Math.floor(questionTimer / 10);
      const levelBonus = level * 10;
      const roundScore = Math.round((100 + timeBonus * 3 + levelBonus) * difficultyMultiplier);

      setScore((prev) => prev + roundScore);
      const newQuestionsInLevel = questionsInLevel + 1;
      setQuestionsInLevel(newQuestionsInLevel);

      setTimeout(() => {
        // Check for level up
        if (newQuestionsInLevel >= settings.questionsPerLevel) {
          setLevel((prev) => prev + 1);
          setQuestionsInLevel(0);
          setShowLevelUp(true);
          setTimeout(() => {
            setShowLevelUp(false);
            advanceToNextQuestion();
          }, 1000);
        } else {
          advanceToNextQuestion();
        }
      }, 300);
    } else {
      // Wrong = game over
      setTimeout(() => endGame(), 500);
    }
  };

  const advanceToNextQuestion = () => {
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setupQuestion(shuffledPairs, nextIndex);
  };

  const endGame = () => {
    setGameOver(true);
    setIsGameActive(false);
    onComplete(score, level, questionIndex + 1);
  };

  const getTimerColor = () => {
    if (questionTimer > 60) return "from-green-500 to-emerald-500";
    if (questionTimer > 30) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-red-700";
  };

  const currentTimeMs = getCurrentTimeLimit();

  return (
    <div className="w-full">
      {/* Stats Bar */}
      <div className="card mb-8 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-yellow-500/10">
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="label">Level</div>
                <div className="text-xl font-bold text-yellow-500">{level}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Score</div>
                <div className="text-xl font-bold">{score}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-blue-500/10">
                <Timer className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="label">Speed</div>
                <div className="text-xl font-bold">{(currentTimeMs / 1000).toFixed(1)}s</div>
              </div>
            </div>
          </div>

          <button onClick={initializeGame} className="btn-secondary text-sm">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Level Progress */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted font-mono">Level {level} Progress</span>
          <span className="text-sm font-bold">{questionsInLevel}/{settings.questionsPerLevel}</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: settings.questionsPerLevel }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < questionsInLevel ? "bg-yellow-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Timer Bar */}
      <div className="card p-4 mb-6">
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getTimerColor()} rounded-full`}
            style={{ width: `${questionTimer}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card p-8">
        {/* Speed indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30">
            <TrendingUp className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500 font-bold text-sm">
              {level > 1 ? `${((1 - currentTimeMs / settings.startTime) * 100).toFixed(0)}% faster` : "Starting speed"}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <p className="label mb-2">Question {questionIndex + 1}</p>
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
              buttonClass += "border-white/10 bg-white/[0.03] hover:border-yellow-500 hover:bg-yellow-500/10 cursor-pointer";
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
                <span className="text-yellow-500 mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-muted text-sm font-mono">
            Answer quickly! Speed increases every {settings.questionsPerLevel} questions!
          </p>
        </div>
      </div>

      {/* Level Up Overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-yellow-500/20 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="text-center"
            >
              <Zap className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-yellow-500">LEVEL {level}!</h2>
              <p className="text-yellow-300 font-mono">Speed increased!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
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

              <div className="stat-icon w-20 h-20 mx-auto mb-6 !bg-yellow-500/10">
                <Zap className="w-10 h-10 text-yellow-500" />
              </div>

              <h2 className="heading-3 mb-2">Lightning Round Over!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                Reached Level {level}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-yellow-500">{score}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Max Level</span>
                  <span className="font-bold">{level}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Questions</span>
                  <span className="font-bold">{questionIndex + 1}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted font-mono text-sm">Final Speed</span>
                  <span className="font-bold">{(currentTimeMs / 1000).toFixed(1)}s</span>
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
