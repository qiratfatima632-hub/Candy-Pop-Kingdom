import { CandyColor, LevelConfig } from './types';

// Helper to generate a jelly pattern
function generateJellyGrid(pattern: 'center' | 'corners' | 'cross' | 'checkered' | 'ring' | 'full', rows = 8, cols = 8) {
  const jellies: { row: number; col: number; layers?: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pattern === 'center' && r >= 2 && r <= 5 && c >= 2 && c <= 5) {
        jellies.push({ row: r, col: c, layers: 1 });
      } else if (pattern === 'corners' && ((r <= 1 || r >= 6) && (c <= 1 || c >= 6))) {
        jellies.push({ row: r, col: c, layers: 1 });
      } else if (pattern === 'cross' && (r === 3 || r === 4 || c === 3 || c === 4)) {
        jellies.push({ row: r, col: c, layers: 1 });
      } else if (pattern === 'ring' && (r === 1 || r === 6 || c === 1 || c === 6) && r >= 1 && r <= 6 && c >= 1 && c <= 6) {
        jellies.push({ row: r, col: c, layers: 1 });
      } else if (pattern === 'checkered' && (r + c) % 2 === 0 && r >= 1 && r <= 6 && c >= 1 && c <= 6) {
        jellies.push({ row: r, col: c, layers: 1 });
      } else if (pattern === 'full' && r >= 1 && r <= 6 && c >= 1 && c <= 6) {
        jellies.push({ row: r, col: c, layers: 1 });
      }
    }
  }
  return jellies;
}

export function getLevelConfig(levelNum: number): LevelConfig {
  const num = Math.max(1, Math.min(50, levelNum));
  
  // Specific authored setups for key milestones
  if (num === 1) {
    return {
      level: 1,
      title: 'Sugar Meadow',
      description: 'Reach 500 points in 20 moves to pass the opening tutorial!',
      moves: 20,
      targetScore: 500,
      starScores: [500, 1000, 1800],
      objectives: [
        { type: 'score', target: 500, current: 0 }
      ],
      colorsAllowed: ['red', 'blue', 'green', 'yellow'],
    };
  }

  if (num === 2) {
    return {
      level: 2,
      title: 'Candy Stream',
      description: 'Reach 1,000 points in 25 moves. Look for 4-in-a-row matches!',
      moves: 25,
      targetScore: 1000,
      starScores: [1000, 1800, 2600],
      objectives: [
        { type: 'score', target: 1000, current: 0 }
      ],
      colorsAllowed: ['red', 'blue', 'green', 'yellow', 'purple'],
    };
  }

  if (num === 3) {
    return {
      level: 3,
      title: 'Ruby Orchard',
      description: 'Collect 15 Red Candies in 25 moves. Match red candies to gather them!',
      moves: 25,
      targetScore: 1200,
      starScores: [1200, 2000, 3000],
      objectives: [
        { type: 'candies', color: 'red', target: 15, current: 0 },
        { type: 'score', target: 800, current: 0 }
      ],
      colorsAllowed: ['red', 'blue', 'green', 'yellow', 'purple'],
    };
  }

  if (num === 4) {
    return {
      level: 4,
      title: 'Jelly Marsh',
      description: 'Clear 12 sweet Jelly tiles in 28 moves! Match candies over the pink jellies.',
      moves: 28,
      targetScore: 1500,
      starScores: [1500, 2400, 3600],
      initialJelly: [
        { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
        { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
        { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 },
      ],
      objectives: [
        { type: 'jelly', target: 12, current: 0 }
      ],
    };
  }

  if (num === 5) {
    return {
      level: 5,
      title: 'Citrus Grove',
      description: 'Collect 18 Yellow candies and reach 2,000 points in 25 moves!',
      moves: 25,
      targetScore: 2000,
      starScores: [2000, 3200, 4500],
      objectives: [
        { type: 'candies', color: 'yellow', target: 18, current: 0 },
        { type: 'score', target: 2000, current: 0 }
      ],
    };
  }

  // Levels 6 - 10: Higher scores & color collection
  if (num <= 10) {
    const target = 1800 + (num - 5) * 400;
    const colors: CandyColor[] = ['blue', 'green', 'purple', 'orange', 'red'];
    const chosenColor = colors[(num - 6) % colors.length];
    return {
      level: num,
      title: `Sweet Blossom ${num}`,
      description: `Collect 20 ${chosenColor} candies and score ${target} points!`,
      moves: 26 - Math.floor((num - 6) * 0.8),
      targetScore: target,
      starScores: [target, Math.round(target * 1.6), Math.round(target * 2.3)],
      objectives: [
        { type: 'candies', color: chosenColor, target: 18 + (num - 5) * 2, current: 0 },
        { type: 'score', target: Math.round(target * 0.7), current: 0 },
      ],
    };
  }

  // Levels 11 - 20: Special Candies & Jelly exploration
  if (num <= 20) {
    const patterns: ('center' | 'corners' | 'cross' | 'ring')[] = ['center', 'cross', 'corners', 'ring'];
    const pat = patterns[(num - 11) % patterns.length];
    const jellyList = generateJellyGrid(pat);
    const target = 2500 + (num - 10) * 350;
    return {
      level: num,
      title: `Jelly Castle ${num}`,
      description: `Clear ${jellyList.length} Jelly tiles using Striped and Wrapped combos!`,
      moves: 26 - Math.floor((num - 11) * 0.5),
      targetScore: target,
      starScores: [target, Math.round(target * 1.5), Math.round(target * 2.2)],
      initialJelly: jellyList,
      objectives: [
        { type: 'jelly', target: jellyList.length, current: 0 },
        { type: 'score', target: Math.round(target * 0.6), current: 0 }
      ],
    };
  }

  // Levels 21 - 35: Complex multi-objective & dual-colors
  if (num <= 35) {
    const jellyList = generateJellyGrid('checkered');
    const target = 4500 + (num - 20) * 300;
    const c1: CandyColor = (num % 2 === 0) ? 'red' : 'purple';
    const c2: CandyColor = (num % 2 === 0) ? 'blue' : 'green';
    const jellyCount = Math.min(jellyList.length, 16);
    return {
      level: num,
      title: `Caramel Forest ${num}`,
      description: `Clear ${jellyCount} Jellies and collect 22 ${c1} Candies!`,
      moves: 24 - Math.floor((num - 21) * 0.4),
      targetScore: target,
      starScores: [target, Math.round(target * 1.5), Math.round(target * 2.1)],
      initialJelly: jellyList.slice(0, jellyCount),
      objectives: [
        { type: 'jelly', target: jellyCount, current: 0 },
        { type: 'candies', color: c1, target: 20, current: 0 },
      ],
    };
  }

  // Levels 36 - 50: Master Candy Kingdom trials
  const fullJellies = generateJellyGrid('cross');
  const target = 6500 + (num - 35) * 450;
  const targetCandy: CandyColor = (['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as CandyColor[])[(num) % 6];
  return {
    level: num,
    title: `Sugar Palace ${num}`,
    description: `Master Challenge: Clear all Jellies and gather 25 ${targetCandy} candies in limited moves!`,
    moves: Math.max(16, 23 - Math.floor((num - 36) * 0.5)),
    targetScore: target,
    starScores: [target, Math.round(target * 1.45), Math.round(target * 2.0)],
    initialJelly: fullJellies,
    objectives: [
      { type: 'jelly', target: fullJellies.length, current: 0 },
      { type: 'candies', color: targetCandy, target: 22, current: 0 },
    ],
  };
}

// Generate all 50 level definitions
export const ALL_LEVELS: LevelConfig[] = Array.from({ length: 50 }, (_, i) => getLevelConfig(i + 1));
