import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BOARD_SIZE,
  findMatches,
  isValidSwap,
  getSpecialActivationCells,
  applyGravityAndRefill,
  calculateMatchScore,
  hasPossibleMoves,
  reshuffleBoard,
  cloneGrid,
  findHintMove,
} from '../game/match3';
import { ActiveBooster, Candy, CandyColor, Grid, ParticleEffect, SpecialType } from '../game/types';
import { CandyIcon, JellyTileOverlay } from '../game/candyGraphics';
import { sound } from '../game/sound';

interface BoardProps {
  initialGrid: Grid;
  initialJellyGrid: number[][];
  activeBooster: ActiveBooster;
  onBoosterUsed: () => void;
  onMoveMade: (scoreGain: number, matchedCandies: Record<CandyColor, number>, jelliesCleared: number) => void;
  isGameActive: boolean;
}

export const Board: React.FC<BoardProps> = ({
  initialGrid,
  initialJellyGrid,
  activeBooster,
  onBoosterUsed,
  onMoveMade,
  isGameActive,
}) => {
  const [grid, setGrid] = useState<Grid>(initialGrid);
  const [jellyGrid, setJellyGrid] = useState<number[][]>(initialJellyGrid);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReshuffling, setIsReshuffling] = useState<boolean>(false);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);
  const [laserBeams, setLaserBeams] = useState<{ type: 'h' | 'v'; index: number; id: string }[]>([]);
  const [hintMove, setHintMove] = useState<{ from: [number, number]; to: [number, number] } | null>(null);

  const dragStartRef = useRef<{ row: number; col: number; x: number; y: number } | null>(null);
  const hintTimerRef = useRef<number | null>(null);

  // Sync initial board
  useEffect(() => {
    setGrid(initialGrid);
    setJellyGrid(initialJellyGrid);
    setSelectedCell(null);
    setIsProcessing(false);
  }, [initialGrid, initialJellyGrid]);

  // Reset & start hint timer when idle
  const resetHintTimer = useCallback(() => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    setHintMove(null);
    if (!isGameActive || isProcessing) return;

    hintTimerRef.current = window.setTimeout(() => {
      const hint = findHintMove(grid);
      if (hint) {
        setHintMove(hint);
      }
    }, 6000); // Show hint after 6s idle
  }, [grid, isGameActive, isProcessing]);

  useEffect(() => {
    resetHintTimer();
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [resetHintTimer]);

  // Add floating pop particles & text
  const addPopupText = (x: number, y: number, text: string, color = '#ffffff') => {
    const id = `part_${Date.now()}_${Math.random()}`;
    setParticles(prev => [...prev, { id, x, y, text, color, type: 'score' }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 900);
  };

  // Add laser beam effect
  const triggerLaser = (type: 'h' | 'v', index: number) => {
    const id = `laser_${Date.now()}_${Math.random()}`;
    setLaserBeams(prev => [...prev, { type, index, id }]);
    setTimeout(() => {
      setLaserBeams(prev => prev.filter(b => b.id !== id));
    }, 450);
  };

  // Process Board Cascade Chain Reactions
  const processCascade = useCallback(
    async (
      currentGrid: Grid,
      currentJellies: number[][],
      combo = 1,
      accumulatedScore = 0,
      collectedCandies: Record<CandyColor, number> = { red: 0, blue: 0, green: 0, yellow: 0, purple: 0, orange: 0 },
      accumulatedJellies = 0,
      preferredSpawn?: { row: number; col: number }
    ) => {
      setIsProcessing(true);

      const matchResult = findMatches(currentGrid, preferredSpawn);
      if (!matchResult.hasMatches) {
        // Cascade finished! Check if valid moves remain
        setIsProcessing(false);
        if (!hasPossibleMoves(currentGrid)) {
          setIsReshuffling(true);
          sound.playBooster();
          setTimeout(() => {
            const reshuffled = reshuffleBoard(currentGrid);
            setGrid(reshuffled);
            setIsReshuffling(false);
          }, 1200);
        }
        return;
      }

      // Collect cells to clear & identify specials
      const cellsToClear = new Set<string>(matchResult.matchedCells);
      const specialsToSpawn: { candy: Candy; row: number; col: number }[] = [];
      let specialActivationCount = 0;

      // Check special candy creation from groups
      for (const group of matchResult.matchGroups) {
        if (group.specialToSpawn) {
          const newSpecialCandy: Candy = {
            id: `special_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            color: group.color,
            special: group.specialToSpawn.type,
          };
          specialsToSpawn.push({
            candy: newSpecialCandy,
            row: group.specialToSpawn.row,
            col: group.specialToSpawn.col,
          });
        }
      }

      // Check if any matched cells were existing special candies, activating them!
      for (const key of Array.from(cellsToClear)) {
        const [r, c] = key.split(',').map(Number);
        const candy = currentGrid[r]?.[c];
        if (candy && candy.special !== 'none') {
          specialActivationCount++;
          if (candy.special === 'striped_h') {
            triggerLaser('h', r);
            sound.playStriped();
            for (let cc = 0; cc < BOARD_SIZE; cc++) cellsToClear.add(`${r},${cc}`);
          } else if (candy.special === 'striped_v') {
            triggerLaser('v', c);
            sound.playStriped();
            for (let rr = 0; rr < BOARD_SIZE; rr++) cellsToClear.add(`${rr},${c}`);
          } else if (candy.special === 'wrapped') {
            sound.playWrapped();
            const blast = getSpecialActivationCells(currentGrid, r, c, 'wrapped');
            blast.forEach(b => cellsToClear.add(`${b.row},${b.col}`));
          }
        }
      }

      // Play match sound
      sound.playMatch(combo);

      // Tally candies collected and clear jellies under destroyed cells
      const nextJellies = currentJellies.map(row => [...row]);
      let newlyClearedJellies = 0;

      cellsToClear.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        const candy = currentGrid[r]?.[c];
        if (candy) {
          collectedCandies[candy.color] = (collectedCandies[candy.color] || 0) + 1;
        }
        if (nextJellies[r][c] > 0) {
          nextJellies[r][c]--;
          if (nextJellies[r][c] === 0) {
            newlyClearedJellies++;
          }
        }
      });

      const stepScore = calculateMatchScore(cellsToClear.size, combo, specialActivationCount);
      const totalScore = accumulatedScore + stepScore;
      const totalJellies = accumulatedJellies + newlyClearedJellies;

      // Show floating feedback popup
      if (combo > 1) {
        const praises = ['Sweet!', 'Tasty!', 'Delicious!', 'Sugar Rush!', 'Divine!'];
        const praise = praises[Math.min(combo - 2, praises.length - 1)];
        addPopupText(50, 40, praise, '#ffd166');
      }

      // Build grid after clearing cells & placing newly created specials
      const clearedGrid = cloneGrid(currentGrid);
      cellsToClear.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        clearedGrid[r][c] = null;
      });

      specialsToSpawn.forEach(sp => {
        clearedGrid[sp.row][sp.col] = sp.candy;
      });

      setGrid(clearedGrid);
      setJellyGrid(nextJellies);

      // Notify parent HUD of moves/score
      onMoveMade(stepScore, collectedCandies, newlyClearedJellies);

      // Wait brief moment for pop animation, then drop gravity
      await new Promise(res => setTimeout(res, 280));

      const { newGrid } = applyGravityAndRefill(clearedGrid);
      setGrid(newGrid);

      // Wait for drop animation to settle before next cascade check
      await new Promise(res => setTimeout(res, 320));

      // Recursive cascade call
      await processCascade(newGrid, nextJellies, combo + 1, totalScore, collectedCandies, totalJellies);
    },
    [onMoveMade]
  );

  // Execute a valid swap
  const executeSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isProcessing || !isGameActive) return;

    resetHintTimer();
    const swapCheck = isValidSwap(grid, r1, c1, r2, c2);

    if (!swapCheck.valid) {
      // Invalid swap bounce back
      sound.playTap();
      setSelectedCell(null);
      return;
    }

    setIsProcessing(true);
    sound.playSwap();

    const c1Candy = grid[r1][c1];
    const c2Candy = grid[r2][c2];

    // Handle Special Combos!
    if (swapCheck.specialCombo) {
      const workingGrid = cloneGrid(grid);
      workingGrid[r1][c1] = null;
      workingGrid[r2][c2] = null;
      const cellsToDestroy = new Set<string>();
      let bonusScore = 500;

      if (swapCheck.specialCombo === 'bomb+bomb') {
        // Clear entire board!
        sound.playColorBomb();
        addPopupText(50, 50, 'SUPER NOVA!', '#ff4d6d');
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            cellsToDestroy.add(`${r},${c}`);
          }
        }
        bonusScore = 2000;
      } else if (swapCheck.specialCombo === 'bomb+striped') {
        // Transform all candies of the striped candy's color into striped and detonate!
        sound.playColorBomb();
        const stripedColor = c1Candy?.special === 'color_bomb' ? c2Candy!.color : c1Candy!.color;
        addPopupText(50, 50, 'STRIPED PARTY!', '#ffd166');
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (workingGrid[r][c]?.color === stripedColor) {
              cellsToDestroy.add(`${r},${c}`);
              triggerLaser(Math.random() > 0.5 ? 'h' : 'v', Math.random() > 0.5 ? r : c);
            }
          }
        }
        bonusScore = 1200;
      } else if (swapCheck.specialCombo === 'bomb+normal') {
        // Color bomb swapped with normal candy
        sound.playColorBomb();
        const targetColor = c1Candy?.special === 'color_bomb' ? c2Candy!.color : c1Candy!.color;
        addPopupText(50, 50, `${targetColor.toUpperCase()} BLAST!`, '#ffd166');
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (workingGrid[r][c]?.color === targetColor) {
              cellsToDestroy.add(`${r},${c}`);
            }
          }
        }
        bonusScore = 800;
      } else if (swapCheck.specialCombo === 'striped+striped') {
        // Cross laser blast on target cell
        sound.playStriped();
        triggerLaser('h', r2);
        triggerLaser('v', c2);
        for (let c = 0; c < BOARD_SIZE; c++) cellsToDestroy.add(`${r2},${c}`);
        for (let r = 0; r < BOARD_SIZE; r++) cellsToDestroy.add(`${r},${c2}`);
        bonusScore = 600;
      } else if (swapCheck.specialCombo === 'striped+wrapped') {
        // Giant 3-row / 3-column cross
        sound.playWrapped();
        for (let r = Math.max(0, r2 - 1); r <= Math.min(BOARD_SIZE - 1, r2 + 1); r++) {
          triggerLaser('h', r);
          for (let c = 0; c < BOARD_SIZE; c++) cellsToDestroy.add(`${r},${c}`);
        }
        for (let c = Math.max(0, c2 - 1); c <= Math.min(BOARD_SIZE - 1, c2 + 1); c++) {
          triggerLaser('v', c);
          for (let r = 0; r < BOARD_SIZE; r++) cellsToDestroy.add(`${r},${c}`);
        }
        bonusScore = 1000;
      } else if (swapCheck.specialCombo === 'wrapped+wrapped') {
        // Giant 5x5 blast
        sound.playWrapped();
        for (let r = Math.max(0, r2 - 2); r <= Math.min(BOARD_SIZE - 1, r2 + 2); r++) {
          for (let c = Math.max(0, c2 - 2); c <= Math.min(BOARD_SIZE - 1, c2 + 2); c++) {
            cellsToDestroy.add(`${r},${c}`);
          }
        }
        bonusScore = 800;
      }

      // Collect candies and clear jellies
      const collected: Record<CandyColor, number> = { red: 0, blue: 0, green: 0, yellow: 0, purple: 0, orange: 0 };
      const nextJellies = jellyGrid.map(row => [...row]);
      let jelliesCleared = 0;

      cellsToDestroy.forEach(k => {
        const [r, c] = k.split(',').map(Number);
        const candy = workingGrid[r]?.[c];
        if (candy) {
          collected[candy.color] = (collected[candy.color] || 0) + 1;
        }
        if (nextJellies[r][c] > 0) {
          nextJellies[r][c]--;
          if (nextJellies[r][c] === 0) jelliesCleared++;
        }
        workingGrid[r][c] = null;
      });

      setGrid(workingGrid);
      setJellyGrid(nextJellies);
      onMoveMade(bonusScore, collected, jelliesCleared);
      setSelectedCell(null);

      await new Promise(res => setTimeout(res, 300));
      const { newGrid } = applyGravityAndRefill(workingGrid);
      setGrid(newGrid);

      await new Promise(res => setTimeout(res, 320));
      await processCascade(newGrid, nextJellies, 1, 0);
      return;
    }

    // Normal swap
    const swappedGrid = cloneGrid(grid);
    swappedGrid[r1][c1] = c2Candy;
    swappedGrid[r2][c2] = c1Candy;
    setGrid(swappedGrid);
    setSelectedCell(null);

    // Run cascade with preferred spawn cell at r2, c2
    await processCascade(swappedGrid, jellyGrid, 1, 0, { red: 0, blue: 0, green: 0, yellow: 0, purple: 0, orange: 0 }, 0, { row: r2, col: c2 });
  };

  // Booster action handler on cell click
  const handleBoosterClick = (r: number, c: number) => {
    if (!grid[r][c]) return;

    sound.playBooster();
    const workingGrid = cloneGrid(grid);
    const nextJellies = jellyGrid.map(row => [...row]);
    let jelliesCleared = 0;
    const collected: Record<CandyColor, number> = { red: 0, blue: 0, green: 0, yellow: 0, purple: 0, orange: 0 };
    let score = 150;

    if (activeBooster === 'hammer') {
      // Lollipop Hammer: smashes single cell
      const candy = workingGrid[r][c]!;
      collected[candy.color] = (collected[candy.color] || 0) + 1;
      workingGrid[r][c] = null;
      if (nextJellies[r][c] > 0) {
        nextJellies[r][c]--;
        if (nextJellies[r][c] === 0) jelliesCleared++;
      }
      addPopupText(50, 50, 'SMASH!', '#ff4d6d');
    } else if (activeBooster === 'bomb') {
      // Sweet Bomb: 3x3 blast
      sound.playWrapped();
      for (let rr = Math.max(0, r - 1); rr <= Math.min(BOARD_SIZE - 1, r + 1); rr++) {
        for (let cc = Math.max(0, c - 1); cc <= Math.min(BOARD_SIZE - 1, c + 1); cc++) {
          const candy = workingGrid[rr][cc];
          if (candy) {
            collected[candy.color] = (collected[candy.color] || 0) + 1;
          }
          if (nextJellies[rr][cc] > 0) {
            nextJellies[rr][cc]--;
            if (nextJellies[rr][cc] === 0) jelliesCleared++;
          }
          workingGrid[rr][cc] = null;
        }
      }
      score = 450;
      addPopupText(50, 50, 'KABOOM!', '#ffd166');
    } else if (activeBooster === 'colorBlast') {
      // Rainbow Spray: clears all candies of clicked color
      sound.playColorBomb();
      const targetColor = workingGrid[r][c]!.color;
      for (let rr = 0; rr < BOARD_SIZE; rr++) {
        for (let cc = 0; cc < BOARD_SIZE; cc++) {
          if (workingGrid[rr][cc]?.color === targetColor) {
            collected[targetColor] = (collected[targetColor] || 0) + 1;
            if (nextJellies[rr][cc] > 0) {
              nextJellies[rr][cc]--;
              if (nextJellies[rr][cc] === 0) jelliesCleared++;
            }
            workingGrid[rr][cc] = null;
          }
        }
      }
      score = 600;
      addPopupText(50, 50, 'COLOR BLAST!', '#06d6a0');
    }

    setGrid(workingGrid);
    setJellyGrid(nextJellies);
    onBoosterUsed();
    onMoveMade(score, collected, jelliesCleared);

    setTimeout(() => {
      const { newGrid } = applyGravityAndRefill(workingGrid);
      setGrid(newGrid);
      setTimeout(() => {
        processCascade(newGrid, nextJellies, 1, 0);
      }, 300);
    }, 250);
  };

  // Handle Candy Tile Interaction (Tap or Drag)
  const handleCellClick = (r: number, c: number) => {
    if (isProcessing || !isGameActive) return;

    if (activeBooster !== 'none') {
      handleBoosterClick(r, c);
      return;
    }

    if (!selectedCell) {
      sound.playTap();
      setSelectedCell({ row: r, col: c });
      return;
    }

    // If tapped the same cell, unselect
    if (selectedCell.row === r && selectedCell.col === c) {
      setSelectedCell(null);
      return;
    }

    // If tapped adjacent cell, attempt swap
    if (Math.abs(selectedCell.row - r) + Math.abs(selectedCell.col - c) === 1) {
      executeSwap(selectedCell.row, selectedCell.col, r, c);
    } else {
      // Otherwise select new cell
      sound.playTap();
      setSelectedCell({ row: r, col: c });
    }
  };

  // Drag / Swipe handling
  const handleTouchOrMouseDown = (r: number, c: number, clientX: number, clientY: number) => {
    if (isProcessing || !isGameActive || activeBooster !== 'none') return;
    dragStartRef.current = { row: r, col: c, x: clientX, y: clientY };
  };

  const handleTouchOrMouseUp = (clientX: number, clientY: number) => {
    if (!dragStartRef.current || isProcessing || !isGameActive) return;
    const { row, col, x, y } = dragStartRef.current;
    dragStartRef.current = null;

    const dx = clientX - x;
    const dy = clientY - y;
    const minThreshold = 24;

    if (Math.abs(dx) < minThreshold && Math.abs(dy) < minThreshold) {
      // Considered a tap
      handleCellClick(row, col);
      return;
    }

    let targetRow = row;
    let targetCol = col;

    if (Math.abs(dx) > Math.abs(dy)) {
      targetCol += dx > 0 ? 1 : -1;
    } else {
      targetRow += dy > 0 ? 1 : -1;
    }

    if (targetRow >= 0 && targetRow < BOARD_SIZE && targetCol >= 0 && targetCol < BOARD_SIZE) {
      executeSwap(row, col, targetRow, targetCol);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Laser beam animations */}
      {laserBeams.map(beam => (
        <div
          key={beam.id}
          className={`absolute pointer-events-none z-30 transition-all duration-300 ${
            beam.type === 'h'
              ? 'left-0 right-0 h-4 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_#ffffff]'
              : 'top-0 bottom-0 w-4 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_20px_#ffffff]'
          }`}
          style={
            beam.type === 'h'
              ? { top: `calc(${(beam.index / BOARD_SIZE) * 100}% + 20px)` }
              : { left: `calc(${(beam.index / BOARD_SIZE) * 100}% + 20px)` }
          }
        />
      ))}

      {/* Floating combo & score popup indicators */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute z-40 text-2xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] pointer-events-none animate-bounce"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: p.color,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {p.text}
        </div>
      ))}

      {/* Reshuffle Notice Overlay */}
      {isReshuffling && (
        <div className="absolute inset-0 z-40 bg-purple-950/80 rounded-3xl flex flex-col items-center justify-center backdrop-blur-xs animate-candy-pulse">
          <span className="text-3xl font-black text-amber-300 drop-shadow-md">No More Moves!</span>
          <span className="text-lg font-bold text-white mt-1">Reshuffling Candies...</span>
        </div>
      )}

      {/* Active Booster Cursor Banner */}
      {activeBooster !== 'none' && (
        <div className="mb-2 px-4 py-1.5 rounded-full bg-amber-400 text-purple-950 font-bold text-sm shadow-md animate-bounce">
          {activeBooster === 'hammer' && '🔨 Tap any candy to smash it!'}
          {activeBooster === 'bomb' && '💣 Tap any tile to detonate 3x3!'}
          {activeBooster === 'colorBlast' && '🌈 Tap a candy to clear all of that color!'}
        </div>
      )}

      {/* 8x8 Board Container with pastry/waffle frame */}
      <div
        className="relative p-2.5 sm:p-3 rounded-3xl bg-gradient-to-b from-amber-900/60 via-purple-950/80 to-purple-950/95 border-4 border-amber-300/40 shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.2)]"
        onMouseUp={e => handleTouchOrMouseUp(e.clientX, e.clientY)}
        onTouchEnd={e => {
          if (e.changedTouches[0]) {
            handleTouchOrMouseUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
          }
        }}
      >
        <div
          className="grid grid-cols-8 gap-1 sm:gap-1.5"
          style={{
            touchAction: 'none',
          }}
        >
          {grid.map((rowCandies, r) =>
            rowCandies.map((candy, c) => {
              const isSelected = selectedCell?.row === r && selectedCell?.col === c;
              const isHint =
                (hintMove?.from[0] === r && hintMove?.from[1] === c) ||
                (hintMove?.to[0] === r && hintMove?.to[1] === c);
              const jelly = jellyGrid[r]?.[c] || 0;
              const isEvenTile = (r + c) % 2 === 0;

              return (
                <div
                  key={`${r}-${c}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Tile ${r + 1}, ${c + 1}: ${candy ? `${candy.color} ${candy.special}` : 'empty'}`}
                  className={`relative w-9 h-9 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 ${
                    isEvenTile ? 'bg-purple-900/40' : 'bg-purple-800/30'
                  } ${
                    isSelected
                      ? 'ring-4 ring-amber-300 ring-offset-2 ring-offset-purple-950 scale-105 z-20'
                      : 'hover:bg-purple-700/40'
                  } ${isHint ? 'ring-2 ring-yellow-400 animate-candy-pulse' : ''}`}
                  onMouseDown={e => {
                    e.preventDefault();
                    handleTouchOrMouseDown(r, c, e.clientX, e.clientY);
                  }}
                  onTouchStart={e => {
                    if (e.touches[0]) {
                      handleTouchOrMouseDown(r, c, e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                  onClick={() => handleCellClick(r, c)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCellClick(r, c);
                    }
                  }}
                >
                  {/* Jelly Underlay Layer */}
                  <JellyTileOverlay layers={jelly} />

                  {/* Candy Artwork */}
                  {candy && (
                    <CandyIcon
                      color={candy.color}
                      special={candy.special}
                      size={44}
                      isSelected={isSelected}
                      isHint={isHint}
                      className="transition-transform duration-200"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
