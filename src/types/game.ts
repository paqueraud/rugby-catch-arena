export type CharacterType = 'leopard' | 'serpent' | 'chevalier' | 'chat' | 'oiseau';

export type DifficultyLevel = 'facile' | 'normale' | 'difficile' | 'cauchemar';

export type GameMode = 'tournament' | 'infinite';

export interface InfiniteGameOptions {
  includeFruits: boolean;       // Mode normal
  includeMines: boolean;        // Mode difficile
  nightmareDensity: boolean;    // Plus de fruits et de mines (mode cauchemard)
  progressiveAcceleration: boolean; // 3s -> 1s + superposition
}

export interface CharacterInfo {
  id: CharacterType;
  name: string;
  nickname: string;
  role: string;
  description: string;
  color: string;
  accentColor: string;
  bgColor: string;
  image: string;
  icon: string;
}

export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  character: CharacterType;
  score: number;
  ballsCaught: number;
  ballsMissed: number;
  fruitsHit: number;
  minesHit: number;
  turnScores: number[];
}

export type ItemType = 'rugby_ball' | 'fruit' | 'mine';

export type FruitKind = 'banana' | 'watermelon' | 'orange' | 'apple';

export interface FlyingItem {
  id: string;
  type: ItemType;
  fruitKind?: FruitKind;
  startX: number; // percentage 0-100
  startY: number; // percentage 0-100
  endX: number;   // percentage 0-100
  endY: number;   // percentage 0-100
  spawnTime: number; // timestamp in ms relative to round start
  durationMs: number; // 2000 ms for balls as required
  rotationSpeed: number; // degrees per second
  initialRotation: number;
  isClicked: boolean;
  clickFeedback?: {
    text: string;
    points: number;
    color: string;
    time: number;
  };
}

export type GamePhase = 'SETUP' | 'TURN_READY' | 'PLAYING' | 'TURN_SUMMARY' | 'GAME_OVER';

export interface GameSettings {
  difficulty: DifficultyLevel;
  totalRounds: number; // e.g. 5
  soundEnabled: boolean;
}
