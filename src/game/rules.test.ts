import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCandy,
  createEmptyGrid,
  findMatches,
  isValidSwap,
  generateSolvableBoard,
  calculateMatchScore,
  applyGravityAndRefill,
  hasPossibleMoves,
} from './match3';

test('detects simple horizontal match-3', () => {
  const grid = createEmptyGrid(8, 8);
  grid[0][0] = createCandy('red');
  grid[0][1] = createCandy('red');
  grid[0][2] = createCandy('red');
  grid[0][3] = createCandy('blue');

  const result = findMatches(grid);
  assert.equal(result.hasMatches, true);
  assert.equal(result.matchedCells.size, 3);
  assert.equal(result.matchedCells.has('0,0'), true);
  assert.equal(result.matchedCells.has('0,1'), true);
  assert.equal(result.matchedCells.has('0,2'), true);
  assert.equal(result.matchedCells.has('0,3'), false);
});

test('detects match-4 and assigns striped candy creation', () => {
  const grid = createEmptyGrid(8, 8);
  grid[2][1] = createCandy('yellow');
  grid[2][2] = createCandy('yellow');
  grid[2][3] = createCandy('yellow');
  grid[2][4] = createCandy('yellow');

  const result = findMatches(grid);
  assert.equal(result.hasMatches, true);
  assert.equal(result.matchedCells.size, 4);
  assert.equal(result.matchGroups.length, 1);
  assert.ok(result.matchGroups[0].specialToSpawn);
  assert.equal(result.matchGroups[0].specialToSpawn?.type, 'striped_v');
});

test('detects match-5 in a line and assigns color_bomb creation', () => {
  const grid = createEmptyGrid(8, 8);
  grid[4][1] = createCandy('purple');
  grid[4][2] = createCandy('purple');
  grid[4][3] = createCandy('purple');
  grid[4][4] = createCandy('purple');
  grid[4][5] = createCandy('purple');

  const result = findMatches(grid);
  assert.equal(result.hasMatches, true);
  assert.equal(result.matchGroups.length, 1);
  assert.equal(result.matchGroups[0].specialToSpawn?.type, 'color_bomb');
});

test('detects L-shape match and assigns wrapped candy creation', () => {
  const grid = createEmptyGrid(8, 8);
  // Horizontal arm: (3,1), (3,2), (3,3)
  grid[3][1] = createCandy('green');
  grid[3][2] = createCandy('green');
  grid[3][3] = createCandy('green');
  // Vertical arm: (1,3), (2,3), (3,3)
  grid[1][3] = createCandy('green');
  grid[2][3] = createCandy('green');

  const result = findMatches(grid);
  assert.equal(result.hasMatches, true);
  assert.equal(result.matchedCells.size, 5);
  const wrappedGroup = result.matchGroups.find(g => g.specialToSpawn?.type === 'wrapped');
  assert.ok(wrappedGroup);
  assert.equal(wrappedGroup.specialToSpawn?.row, 3);
  assert.equal(wrappedGroup.specialToSpawn?.col, 3);
});

test('evaluates valid vs invalid swaps', () => {
  const grid = createEmptyGrid(8, 8);
  // Row 0: Red, Blue, Red, Red -> swapping (0,0) with (0,1) gives Blue, Red, Red, Red!
  grid[0][0] = createCandy('red');
  grid[0][1] = createCandy('blue');
  grid[0][2] = createCandy('red');
  grid[0][3] = createCandy('red');

  const validSwap = isValidSwap(grid, 0, 0, 0, 1);
  assert.equal(validSwap.valid, true);

  // Swapping (0,2) and (0,3) both red gives no new match
  const invalidSwap = isValidSwap(grid, 0, 2, 0, 3);
  assert.equal(invalidSwap.valid, false);

  // Non-adjacent swap is rejected
  const nonAdj = isValidSwap(grid, 0, 0, 0, 3);
  assert.equal(nonAdj.valid, false);
});

test('generates solvable board with 0 initial matches and at least 1 move', () => {
  const board = generateSolvableBoard(8, 8);
  const matches = findMatches(board);
  assert.equal(matches.hasMatches, false, 'Generated board must not start with pre-matched candies');
  assert.equal(hasPossibleMoves(board), true, 'Generated board must contain at least one valid move');
});

test('computes scores accurately with match tiers and combo multiplier', () => {
  // Match 3 = 30
  assert.equal(calculateMatchScore(3, 1), 30);
  // Match 4 = 60
  assert.equal(calculateMatchScore(4, 1), 60);
  // Match 5 = 100
  assert.equal(calculateMatchScore(5, 1), 100);
  // Combo 2 (multiplier 1.5): Match 3 * 1.5 = 45
  assert.equal(calculateMatchScore(3, 2), 45);
});

test('gravity drops candies and refills empty cells', () => {
  const grid = createEmptyGrid(8, 8);
  // Place candy at (0, 0), leaving (1..7, 0) empty
  grid[0][0] = createCandy('orange');

  const { newGrid, falls } = applyGravityAndRefill(grid, ['blue']);
  // Candy at (0,0) should have dropped to row 7
  assert.equal(newGrid[7][0]?.color, 'orange');
  assert.equal(falls.length, 1);
  assert.equal(falls[0].fromRow, 0);
  assert.equal(falls[0].toRow, 7);

  // All cells in grid should now be filled (non-null)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      assert.notEqual(newGrid[r][c], null);
    }
  }
});
