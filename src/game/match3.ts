import { Candy, CandyColor, Grid, MatchGroup, SpecialType } from './types';

export const BOARD_SIZE = 8;

export const ALL_COLORS: CandyColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

let candyIdCounter = 1;
export function createCandy(color: CandyColor, special: SpecialType = 'none'): Candy {
  return {
    id: `candy_${candyIdCounter++}_${Math.random().toString(36).substring(2, 7)}`,
    color,
    special,
  };
}

export function createEmptyGrid(rows = BOARD_SIZE, cols = BOARD_SIZE): Grid {
  const grid: Grid = [];
  for (let r = 0; r < rows; r++) {
    const row: (Candy | null)[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(null);
    }
    grid.push(row);
  }
  return grid;
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

// Find all matches on the grid
export function findMatches(
  grid: Grid,
  preferredSpawnCell?: { row: number; col: number }
): {
  matchedCells: Set<string>; // "r,c"
  matchGroups: MatchGroup[];
  hasMatches: boolean;
} {
  const rows = grid.length;
  const cols = grid[0].length;
  const matchedCoords = new Set<string>();

  // Find horizontal matches
  const hMatches: { row: number; startCol: number; endCol: number; color: CandyColor }[] = [];
  for (let r = 0; r < rows; r++) {
    let matchStart = 0;
    while (matchStart < cols) {
      const candy = grid[r][matchStart];
      if (!candy) {
        matchStart++;
        continue;
      }
      let matchEnd = matchStart + 1;
      while (matchEnd < cols && grid[r][matchEnd] && grid[r][matchEnd]?.color === candy.color) {
        matchEnd++;
      }
      const matchLen = matchEnd - matchStart;
      if (matchLen >= 3) {
        hMatches.push({ row: r, startCol: matchStart, endCol: matchEnd - 1, color: candy.color });
        for (let c = matchStart; c < matchEnd; c++) {
          matchedCoords.add(`${r},${c}`);
        }
      }
      matchStart = matchEnd;
    }
  }

  // Find vertical matches
  const vMatches: { col: number; startRow: number; endRow: number; color: CandyColor }[] = [];
  for (let c = 0; c < cols; c++) {
    let matchStart = 0;
    while (matchStart < rows) {
      const candy = grid[matchStart][c];
      if (!candy) {
        matchStart++;
        continue;
      }
      let matchEnd = matchStart + 1;
      while (matchEnd < rows && grid[matchEnd][c] && grid[matchEnd][c]?.color === candy.color) {
        matchEnd++;
      }
      const matchLen = matchEnd - matchStart;
      if (matchLen >= 3) {
        vMatches.push({ col: c, startRow: matchStart, endRow: matchEnd - 1, color: candy.color });
        for (let r = matchStart; r < matchEnd; r++) {
          matchedCoords.add(`${r},${c}`);
        }
      }
      matchStart = matchEnd;
    }
  }

  const matchGroups: MatchGroup[] = [];
  const processedIntersections = new Set<string>();

  // Detect L or T shapes (intersections of H and V matches of the same color)
  for (const hm of hMatches) {
    for (const vm of vMatches) {
      if (hm.color === vm.color && vm.col >= hm.startCol && vm.col <= hm.endCol && hm.row >= vm.startRow && hm.row <= vm.endRow) {
        // Intersection at hm.row, vm.col
        const interKey = `${hm.row},${vm.col}`;
        if (!processedIntersections.has(interKey)) {
          processedIntersections.add(interKey);
          const cellsSet = new Set<string>();
          for (let c = hm.startCol; c <= hm.endCol; c++) cellsSet.add(`${hm.row},${c}`);
          for (let r = vm.startRow; r <= vm.endRow; r++) cellsSet.add(`${r},${vm.col}`);
          
          const cells = Array.from(cellsSet).map(s => {
            const [r, c] = s.split(',').map(Number);
            return { row: r, col: c };
          });

          // Check if preferredSpawnCell is in this group, otherwise use intersection
          const spawnRow = preferredSpawnCell && cellsSet.has(`${preferredSpawnCell.row},${preferredSpawnCell.col}`)
            ? preferredSpawnCell.row
            : hm.row;
          const spawnCol = preferredSpawnCell && cellsSet.has(`${preferredSpawnCell.row},${preferredSpawnCell.col}`)
            ? preferredSpawnCell.col
            : vm.col;

          matchGroups.push({
            cells,
            color: hm.color,
            specialToSpawn: {
              type: 'wrapped',
              row: spawnRow,
              col: spawnCol,
            },
          });
        }
      }
    }
  }

  // Process remaining horizontal matches that weren't part of an L/T
  for (const hm of hMatches) {
    const isPartOfLT = Array.from(processedIntersections).some(k => {
      const [r, c] = k.split(',').map(Number);
      return r === hm.row && c >= hm.startCol && c <= hm.endCol;
    });
    if (!isPartOfLT) {
      const len = hm.endCol - hm.startCol + 1;
      const cells: { row: number; col: number }[] = [];
      for (let c = hm.startCol; c <= hm.endCol; c++) {
        cells.push({ row: hm.row, col: c });
      }

      let specialToSpawn: { type: SpecialType; row: number; col: number } | undefined;
      const spawnCol = preferredSpawnCell && preferredSpawnCell.row === hm.row && preferredSpawnCell.col >= hm.startCol && preferredSpawnCell.col <= hm.endCol
        ? preferredSpawnCell.col
        : Math.floor((hm.startCol + hm.endCol) / 2);

      if (len >= 5) {
        specialToSpawn = { type: 'color_bomb', row: hm.row, col: spawnCol };
      } else if (len === 4) {
        specialToSpawn = { type: 'striped_v', row: hm.row, col: spawnCol };
      }

      matchGroups.push({
        cells,
        color: hm.color,
        specialToSpawn,
      });
    }
  }

  // Process remaining vertical matches
  for (const vm of vMatches) {
    const isPartOfLT = Array.from(processedIntersections).some(k => {
      const [r, c] = k.split(',').map(Number);
      return c === vm.col && r >= vm.startRow && r <= vm.endRow;
    });
    if (!isPartOfLT) {
      const len = vm.endRow - vm.startRow + 1;
      const cells: { row: number; col: number }[] = [];
      for (let r = vm.startRow; r <= vm.endRow; r++) {
        cells.push({ row: r, col: vm.col });
      }

      let specialToSpawn: { type: SpecialType; row: number; col: number } | undefined;
      const spawnRow = preferredSpawnCell && preferredSpawnCell.col === vm.col && preferredSpawnCell.row >= vm.startRow && preferredSpawnCell.row <= vm.endRow
        ? preferredSpawnCell.row
        : Math.floor((vm.startRow + vm.endRow) / 2);

      if (len >= 5) {
        specialToSpawn = { type: 'color_bomb', row: spawnRow, col: vm.col };
      } else if (len === 4) {
        specialToSpawn = { type: 'striped_h', row: spawnRow, col: vm.col };
      }

      matchGroups.push({
        cells,
        color: vm.color,
        specialToSpawn,
      });
    }
  }

  return {
    matchedCells: matchedCoords,
    matchGroups,
    hasMatches: matchedCoords.size > 0,
  };
}

// Check if two cells are adjacent (non-diagonal)
export function areAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

// Check whether a swap is valid (results in matches or activates special candies)
export function isValidSwap(
  grid: Grid,
  r1: number,
  c1: number,
  r2: number,
  c2: number
): {
  valid: boolean;
  specialCombo?: string; // 'bomb+bomb' | 'bomb+striped' | 'bomb+wrapped' | 'bomb+normal' | 'striped+striped' | 'striped+wrapped' | 'wrapped+wrapped'
} {
  if (!areAdjacent(r1, c1, r2, c2)) return { valid: false };
  const cA = grid[r1]?.[c1];
  const cB = grid[r2]?.[c2];
  if (!cA || !cB) return { valid: false };

  // Special Combo Checks
  if (cA.special === 'color_bomb' && cB.special === 'color_bomb') {
    return { valid: true, specialCombo: 'bomb+bomb' };
  }
  if ((cA.special === 'color_bomb' && (cB.special === 'striped_h' || cB.special === 'striped_v')) ||
      (cB.special === 'color_bomb' && (cA.special === 'striped_h' || cA.special === 'striped_v'))) {
    return { valid: true, specialCombo: 'bomb+striped' };
  }
  if ((cA.special === 'color_bomb' && cB.special === 'wrapped') ||
      (cB.special === 'color_bomb' && cA.special === 'wrapped')) {
    return { valid: true, specialCombo: 'bomb+wrapped' };
  }
  if (cA.special === 'color_bomb' || cB.special === 'color_bomb') {
    return { valid: true, specialCombo: 'bomb+normal' };
  }
  if ((cA.special === 'striped_h' || cA.special === 'striped_v') &&
      (cB.special === 'striped_h' || cB.special === 'striped_v')) {
    return { valid: true, specialCombo: 'striped+striped' };
  }
  if (((cA.special === 'striped_h' || cA.special === 'striped_v') && cB.special === 'wrapped') ||
      ((cB.special === 'striped_h' || cB.special === 'striped_v') && cA.special === 'wrapped')) {
    return { valid: true, specialCombo: 'striped+wrapped' };
  }
  if (cA.special === 'wrapped' && cB.special === 'wrapped') {
    return { valid: true, specialCombo: 'wrapped+wrapped' };
  }

  // Normal swap match test
  const tempGrid = cloneGrid(grid);
  tempGrid[r1][c1] = cB;
  tempGrid[r2][c2] = cA;

  const matches = findMatches(tempGrid);
  return { valid: matches.hasMatches };
}

// Find if any possible valid moves exist on the board
export function hasPossibleMoves(grid: Grid): boolean {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const candy = grid[r][c];
      if (!candy) continue;

      // Color bombs can always swap with any neighbor
      if (candy.special === 'color_bomb') return true;

      // Check right neighbor
      if (c + 1 < cols) {
        if (isValidSwap(grid, r, c, r, c + 1).valid) return true;
      }
      // Check down neighbor
      if (r + 1 < rows) {
        if (isValidSwap(grid, r, c, r + 1, c).valid) return true;
      }
    }
  }
  return false;
}

// Find a single valid hint move to help the player if stuck
export function findHintMove(grid: Grid): { from: [number, number]; to: [number, number] } | null {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) continue;
      if (c + 1 < cols && isValidSwap(grid, r, c, r, c + 1).valid) {
        return { from: [r, c], to: [r, c + 1] };
      }
      if (r + 1 < rows && isValidSwap(grid, r, c, r + 1, c).valid) {
        return { from: [r, c], to: [r + 1, c] };
      }
    }
  }
  return null;
}

// Generate an 8x8 solvable board with NO pre-existing matches, but at least 1 valid move
export function generateSolvableBoard(
  rows = BOARD_SIZE,
  cols = BOARD_SIZE,
  colors: CandyColor[] = ALL_COLORS
): Grid {
  let attempts = 0;
  while (attempts < 100) {
    attempts++;
    const grid = createEmptyGrid(rows, cols);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const forbiddenColors = new Set<CandyColor>();
        // Avoid 3-in-a-row horizontally
        if (c >= 2 && grid[r][c - 1] && grid[r][c - 2] && grid[r][c - 1]?.color === grid[r][c - 2]?.color) {
          forbiddenColors.add(grid[r][c - 1]!.color);
        }
        // Avoid 3-in-a-row vertically
        if (r >= 2 && grid[r - 1][c] && grid[r - 2][c] && grid[r - 1][c]?.color === grid[r - 2][c]?.color) {
          forbiddenColors.add(grid[r - 1][c]!.color);
        }

        const validColors = colors.filter(col => !forbiddenColors.has(col));
        const color = validColors.length > 0
          ? validColors[Math.floor(Math.random() * validColors.length)]
          : colors[Math.floor(Math.random() * colors.length)];

        grid[r][c] = createCandy(color, 'none');
      }
    }

    // Check if the board has zero matches and at least 1 move
    const matches = findMatches(grid);
    if (!matches.hasMatches && hasPossibleMoves(grid)) {
      return grid;
    }
  }

  // Fallback: build with a guaranteed valid move setup
  return createFallbackSolvableBoard(rows, cols, colors);
}

function createFallbackSolvableBoard(rows = BOARD_SIZE, cols = BOARD_SIZE, colors: CandyColor[]): Grid {
  const grid = createEmptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const colIdx = (r * 2 + c) % colors.length;
      grid[r][c] = createCandy(colors[colIdx], 'none');
    }
  }
  // Setup a guaranteed match-3 swap on (0,0) and (0,1)
  const targetColor = colors[0];
  grid[0][1] = createCandy(colors[1], 'none');
  grid[0][0] = createCandy(targetColor, 'none');
  grid[0][2] = createCandy(targetColor, 'none');
  grid[0][3] = createCandy(targetColor, 'none');
  return grid;
}

// Reshuffle the board candies when no valid moves remain
export function reshuffleBoard(grid: Grid, colors: CandyColor[] = ALL_COLORS): Grid {
  const rows = grid.length;
  const cols = grid[0].length;
  const candies: Candy[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) {
        candies.push(grid[r][c]!);
      }
    }
  }

  let attempts = 0;
  while (attempts < 60) {
    attempts++;
    // Shuffle array
    for (let i = candies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candies[i], candies[j]] = [candies[j], candies[i]];
    }

    const testGrid = createEmptyGrid(rows, cols);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        testGrid[r][c] = { ...candies[idx++] };
      }
    }

    const matches = findMatches(testGrid);
    if (!matches.hasMatches && hasPossibleMoves(testGrid)) {
      return testGrid;
    }
  }

  // If impossible with existing candies, generate fresh colors keeping specials
  return generateSolvableBoard(rows, cols, colors);
}

// Calculate points according to prompt specifications
export function calculateMatchScore(
  matchedCount: number,
  combo: number = 1,
  specialTriggers: number = 0
): number {
  let baseScore = 0;
  if (matchedCount === 3) baseScore = 30;
  else if (matchedCount === 4) baseScore = 60;
  else if (matchedCount >= 5) baseScore = 100;
  else baseScore = matchedCount * 10;

  // Add combo multiplier
  const comboMultiplier = 1 + (combo - 1) * 0.5;
  const specialBonus = specialTriggers * 150;

  return Math.round(baseScore * comboMultiplier + specialBonus);
}

// Calculate cells destroyed by a special candy activation
export function getSpecialActivationCells(
  grid: Grid,
  targetRow: number,
  targetCol: number,
  specialType: SpecialType,
  selectedColor?: CandyColor
): { row: number; col: number }[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const cells: { row: number; col: number }[] = [];

  if (specialType === 'striped_h') {
    for (let c = 0; c < cols; c++) {
      cells.push({ row: targetRow, col: c });
    }
  } else if (specialType === 'striped_v') {
    for (let r = 0; r < rows; r++) {
      cells.push({ row: r, col: targetCol });
    }
  } else if (specialType === 'wrapped') {
    // 3x3 explosion
    for (let r = Math.max(0, targetRow - 1); r <= Math.min(rows - 1, targetRow + 1); r++) {
      for (let c = Math.max(0, targetCol - 1); c <= Math.min(cols - 1, targetCol + 1); c++) {
        cells.push({ row: r, col: c });
      }
    }
  } else if (specialType === 'color_bomb' && selectedColor) {
    // All candies of that color
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c]?.color === selectedColor) {
          cells.push({ row: r, col: c });
        }
      }
    }
    // Also include the bomb's own cell
    cells.push({ row: targetRow, col: targetCol });
  }

  return cells;
}

// Apply gravity: candies fall down into empty spaces, top fills with new candies
export function applyGravityAndRefill(
  grid: Grid,
  colors: CandyColor[] = ALL_COLORS
): {
  newGrid: Grid;
  falls: { id: string; fromRow: number; toRow: number; col: number }[];
  spawned: { id: string; row: number; col: number; candy: Candy }[];
} {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = cloneGrid(grid);
  const falls: { id: string; fromRow: number; toRow: number; col: number }[] = [];
  const spawned: { id: string; row: number; col: number; candy: Candy }[] = [];

  for (let c = 0; c < cols; c++) {
    // Shift non-null candies down
    let writeRow = rows - 1;
    for (let r = rows - 1; r >= 0; r--) {
      if (newGrid[r][c] !== null) {
        if (r !== writeRow) {
          const candy = newGrid[r][c]!;
          newGrid[writeRow][c] = candy;
          newGrid[r][c] = null;
          falls.push({ id: candy.id, fromRow: r, toRow: writeRow, col: c });
        }
        writeRow--;
      }
    }

    // Refill remaining empty cells at top
    for (let r = writeRow; r >= 0; r--) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const candy = createCandy(randomColor, 'none');
      candy.isNew = true;
      newGrid[r][c] = candy;
      spawned.push({ id: candy.id, row: r, col: c, candy });
    }
  }

  return { newGrid, falls, spawned };
}
