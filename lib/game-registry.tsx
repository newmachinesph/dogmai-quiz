"use client";

import { ComponentType, lazy } from "react";
import {
  Gamepad2,
  CircleDot,
  ToggleLeft,
  Zap,
  Code,
  Edit3,
  List,
  Keyboard,
  Skull,
  Move,
  Shuffle,
  Heart,
  Bug,
  Clock,
  Brain,
  Flame,
  FileCode,
  Network,
  Target,
  Bomb,
  Eye,
  Mountain,
  LucideIcon,
} from "lucide-react";
import gamesConfig from "@/data/games-config.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyGameComponent = ComponentType<any>;

// Dynamic imports for game components (code splitting)
const FlipMatchGame = lazy(() => import("@/components/FlipMatchGame"));
const MultipleChoiceGame = lazy(() => import("@/components/games/MultipleChoiceGame"));
const TrueFalseGame = lazy(() => import("@/components/games/TrueFalseGame"));
const SpeedQuizGame = lazy(() => import("@/components/games/SpeedQuizGame"));
const CodeOutputGame = lazy(() => import("@/components/games/CodeOutputGame"));
const FillBlankGame = lazy(() => import("@/components/games/FillBlankGame"));
const SequenceGame = lazy(() => import("@/components/games/SequenceGame"));
const TypingChallengeGame = lazy(() => import("@/components/games/TypingChallengeGame"));
const HangmanGame = lazy(() => import("@/components/games/HangmanGame"));
const DragDropGame = lazy(() => import("@/components/games/DragDropGame"));
const WordScrambleGame = lazy(() => import("@/components/games/WordScrambleGame"));
const SurvivalGame = lazy(() => import("@/components/games/SurvivalGame"));
const CodeDebuggerGame = lazy(() => import("@/components/games/CodeDebuggerGame"));
const BeatTheClockGame = lazy(() => import("@/components/games/BeatTheClockGame"));
const MemoryChainGame = lazy(() => import("@/components/games/MemoryChainGame"));
const RapidFireGame = lazy(() => import("@/components/games/RapidFireGame"));
const CodeCompletionGame = lazy(() => import("@/components/games/CodeCompletionGame"));
const WhackAMoleGame = lazy(() => import("@/components/games/WhackAMoleGame"));
const HotPotatoGame = lazy(() => import("@/components/games/HotPotatoGame"));
const LightningRoundGame = lazy(() => import("@/components/games/LightningRoundGame"));
const FirstLetterGame = lazy(() => import("@/components/games/FirstLetterGame"));
const AvalancheGame = lazy(() => import("@/components/games/AvalancheGame"));

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Gamepad2,
  CircleDot,
  ToggleLeft,
  Zap,
  Code,
  Edit3,
  List,
  Keyboard,
  Skull,
  Move,
  Shuffle,
  Heart,
  Bug,
  Clock,
  Brain,
  Flame,
  FileCode,
  Network,
  Target,
  Bomb,
  Eye,
  Mountain,
};

// Component mapping with lazy loaded components
// Using AnyGameComponent to allow flexibility in game component props
const componentMap: Record<string, AnyGameComponent> = {
  FlipMatchGame,
  MultipleChoiceGame,
  TrueFalseGame,
  SpeedQuizGame,
  CodeOutputGame,
  FillBlankGame,
  SequenceGame,
  TypingChallengeGame,
  HangmanGame,
  DragDropGame,
  WordScrambleGame,
  SurvivalGame,
  CodeDebuggerGame,
  BeatTheClockGame,
  MemoryChainGame,
  RapidFireGame,
  CodeCompletionGame,
  WhackAMoleGame,
  HotPotatoGame,
  LightningRoundGame,
  FirstLetterGame,
  AvalancheGame,
};

// Types
export interface GameConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  component: string;
  enabled: boolean;
  category: string;
}

export interface GameCategory {
  id: string;
  name: string;
}

// Get all enabled games
export function getEnabledGames(): GameConfig[] {
  return gamesConfig.games.filter((game) => game.enabled);
}

// Get all games
export function getAllGames(): GameConfig[] {
  return gamesConfig.games;
}

// Get game by ID
export function getGameById(id: string): GameConfig | undefined {
  return gamesConfig.games.find((game) => game.id === id);
}

// Get games by category
export function getGamesByCategory(categoryId: string): GameConfig[] {
  return gamesConfig.games.filter(
    (game) => game.category === categoryId && game.enabled
  );
}

// Get all categories
export function getCategories(): GameCategory[] {
  return gamesConfig.categories;
}

// Get icon component for a game
export function getGameIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Gamepad2;
}

// Get game component (lazy loaded)
export function getGameComponent(componentName: string): AnyGameComponent | null {
  return componentMap[componentName] || null;
}

// Get games with icons resolved
export function getGamesWithIcons() {
  return getEnabledGames().map((game) => ({
    ...game,
    IconComponent: getGameIcon(game.icon),
    href: `/game/${game.id}`,
  }));
}

// Get total enabled games count
export function getEnabledGamesCount(): number {
  return getEnabledGames().length;
}

// Preload a game component (for performance optimization)
export function preloadGameComponent(componentName: string): void {
  const component = componentMap[componentName];
  if (component) {
    // Trigger the lazy load
    const lazyComponent = component as unknown as { preload?: () => void };
    if (typeof lazyComponent.preload === "function") {
      lazyComponent.preload();
    }
  }
}
