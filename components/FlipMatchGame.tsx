"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, RotateCcw, Target, X } from "lucide-react";
import { GameCard, QuizPair } from "@/types";
import { formatTime, shuffleArray } from "@/lib/utils";

interface FlipMatchGameProps {
  pairs: QuizPair[];
  onComplete: (score: number, moves: number, timeElapsed: number) => void;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function FlipMatchGame({
  pairs,
  onComplete,
  difficulty = "beginner",
}: FlipMatchGameProps) {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<GameCard[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Initialize cards
  useEffect(() => {
    initializeGame();
  }, [pairs]);

  // Timer
  useEffect(() => {
    if (!isGameActive || gameWon) return;

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, gameWon]);

  // Check for win condition
  useEffect(() => {
    if (matches === pairs.length && matches > 0) {
      setGameWon(true);
      setIsGameActive(false);
      const score = calculateScore();
      setTimeout(() => onComplete(score, moves, timeElapsed), 500);
    }
  }, [matches]);

  const initializeGame = () => {
    const gameCards: GameCard[] = [];

    pairs.forEach((pair, index) => {
      gameCards.push({
        id: `${index}-front`,
        content: pair.front,
        pairId: `pair-${index}`,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: `${index}-back`,
        content: pair.back,
        pairId: `pair-${index}`,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(shuffleArray(gameCards));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
  };

  const handleCardClick = (clickedCard: GameCard) => {
    if (
      !isGameActive ||
      clickedCard.isMatched ||
      clickedCard.isFlipped ||
      flippedCards.length >= 2
    ) {
      return;
    }

    const updatedCards = cards.map((card) =>
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );

    setCards(updatedCards);
    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      checkForMatch(newFlippedCards[0], newFlippedCards[1]);
    }
  };

  const checkForMatch = (card1: GameCard, card2: GameCard) => {
    if (card1.pairId === card2.pairId) {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((card) =>
            card.pairId === card1.pairId ? { ...card, isMatched: true } : card
          )
        );
        setMatches((prev) => prev + 1);
        setFlippedCards([]);
      }, 400);
    } else {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((card) =>
            card.id === card1.id || card.id === card2.id
              ? { ...card, isFlipped: false }
              : card
          )
        );
        setFlippedCards([]);
      }, 800);
    }
  };

  const calculateScore = () => {
    const baseScore = pairs.length * 100;
    const movesPenalty = Math.max(0, (moves - pairs.length) * 5);
    const difficultyMultiplier =
      difficulty === "advanced" ? 1.5 : difficulty === "intermediate" ? 1.2 : 1;

    return Math.round((baseScore - movesPenalty) * difficultyMultiplier);
  };

  const getGridCols = () => {
    // Always use 4x4 grid (16 cards = 8 pairs)
    return "grid-cols-4";
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
              <div className="stat-icon w-10 h-10">
                <Target className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="label">Moves</div>
                <div className="text-xl font-bold">{moves}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="stat-icon w-10 h-10 !bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="label">Matches</div>
                <div className="text-xl font-bold">
                  {matches}/{pairs.length}
                </div>
              </div>
            </div>
          </div>

          <button onClick={initializeGame} className="btn-secondary text-sm">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className={`grid ${getGridCols()} gap-3 sm:gap-4`}>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className="aspect-[4/3]"
            whileHover={{ scale: card.isMatched ? 1 : 1.02 }}
            whileTap={{ scale: card.isMatched ? 1 : 0.98 }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{
                rotateY: card.isFlipped || card.isMatched ? 180 : 0,
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card Back */}
              <div
                className="game-card absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(0deg)",
                }}
              >
                <span className="text-4xl font-bold text-orange-500">?</span>
              </div>

              {/* Card Front */}
              <div
                className={`absolute inset-0 flex items-center justify-center p-3 rounded-xl ${
                  card.isMatched
                    ? "game-card-matched"
                    : "game-card-flipped"
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <span
                  className={`text-center font-mono text-xs sm:text-sm leading-tight ${
                    card.isMatched ? "text-white" : "text-black"
                  }`}
                >
                  {card.content}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ))}
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
                <Trophy className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="heading-3 mb-2">You Win!</h2>
              <p className="text-muted font-mono text-sm mb-8">
                Great job completing the game
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Score</span>
                  <span className="text-xl font-bold text-orange-500">
                    {calculateScore()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-muted font-mono text-sm">Moves</span>
                  <span className="font-bold">{moves}</span>
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
