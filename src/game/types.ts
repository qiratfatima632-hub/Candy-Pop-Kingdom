export type CandyColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export type SpecialType = 'none' | 'striped_h' | 'striped_v' | 'wrapped' | 'color_bomb';

export interface Candy {
  id: string;
  color: CandyColor;
  special: SpecialType;
  isNew?: boolean;
}

export interface BoardCell {
  row: number;
  col: number;
  candy: Candy | null;
  jelly: number; // 0 = none, 1 = single jelly, 2 = double jelly
}

export type Grid = (Candy | null)[][];
export type JellyGrid = number[][];

export interface MatchGroup {
  cells: { row: number; col: number }[];
  color: CandyColor;
  specialToSpawn?: {
    type: SpecialType;
    row: number;
    col: number;
  };
}

export type ObjectiveType = 'score' | 'candies' | 'jelly';

export interface LevelObjective {
  type: ObjectiveType;
  target: number;
  current: number;
  color?: CandyColor; // for 'candies' objective
}

export interface LevelConfig {
  level: number;
  title: string;
  description: string;
  moves: number;
  targetScore: number;
  starScores: [number, number, number];
  objectives: LevelObjective[];
  initialJelly?: { row: number; col: number; layers?: number }[];
  colorsAllowed?: CandyColor[];
}

export interface PlayerProfile {
  coins: number;
  maxLevelUnlocked: number;
  levelStars: Record<number, number>;
  levelHighScores: Record<number, number>;
  boosters: {
    hammer: number;
    bomb: number;
    colorBlast: number;
    extraMoves: number;
  };
  settings: {
    bgm: boolean;
    sfx: boolean;
  };
  lastDailyClaim: string | null;
  claimedDays: number;
}

export type ActiveBooster = 'none' | 'hammer' | 'bomb' | 'colorBlast';

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  color: string;
  text?: string;
  type?: 'pop' | 'score' | 'laser_h' | 'laser_v' | 'explosion';
}
