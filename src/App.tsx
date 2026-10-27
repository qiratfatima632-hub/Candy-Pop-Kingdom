import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActiveBooster, CandyColor, Grid, LevelConfig, PlayerProfile } from './game/types';
import { ALL_LEVELS, getLevelConfig } from './game/levels';
import { generateSolvableBoard, BOARD_SIZE } from './game/match3';
import { sound } from './game/sound';
import { HUD } from './components/HUD';
import { Board } from './components/Board';
import { MainMenu } from './components/MainMenu';
import { LevelSelectModal } from './components/LevelSelectModal';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { ShopModal } from './components/ShopModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';

const SAVE_KEY = 'candy_pop_kingdom_save_v1';

const DEFAULT_PROFILE: PlayerProfile = {
  coins: 350,
  maxLevelUnlocked: 1,
  levelStars: {},
  levelHighScores: {},
  boosters: {
    hammer: 2,
    bomb: 2,
    colorBlast: 1,
    extraMoves: 1,
  },
  settings: {
    bgm: true,
    sfx: true,
  },
  lastDailyClaim: null,
  claimedDays: 0,
};

export default function App() {
  // Load persistent profile from localStorage
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PROFILE;
  });

  // Save profile changes automatically
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(profile));
    } catch {
      // Safe fallback
    }
  }, [profile]);

  // Sync sound settings with SoundManager
  useEffect(() => {
    sound.setSfx(profile.settings.sfx);
    sound.setBgm(profile.settings.bgm);
  }, [profile.settings]);

  // Screen State
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'victory' | 'defeat'>('title');
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [movesRemaining, setMovesRemaining] = useState<number>(20);
  const [objectives, setObjectives] = useState<LevelConfig['objectives']>([]);
  const [boardGrid, setBoardGrid] = useState<Grid>(() => generateSolvableBoard());
  const [jellyGrid, setJellyGrid] = useState<number[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))
  );
  const [activeBooster, setActiveBooster] = useState<ActiveBooster>('none');

  // Modals state
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showDailyRewards, setShowDailyRewards] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Sync with document.body.dataset.state for ultra mode & testability
  useEffect(() => {
    const stateMap: Record<typeof gameState, string> = {
      title: 'title',
      playing: 'playing',
      paused: 'paused',
      victory: 'gameover',
      defeat: 'gameover',
    };
    document.body.dataset.state = stateMap[gameState];
  }, [gameState]);

  const levelConfig = useMemo(() => getLevelConfig(currentLevelNum), [currentLevelNum]);

  // Start or Restart Level
  const startLevel = useCallback(
    (lvlNum = currentLevelNum) => {
      const cfg = getLevelConfig(lvlNum);
      setCurrentLevelNum(lvlNum);
      setScore(0);
      setMovesRemaining(cfg.moves);
      setActiveBooster('none');

      // Initialize objectives copy
      setObjectives(cfg.objectives.map(o => ({ ...o, current: 0 })));

      // Initialize jellies grid
      const jGrid: number[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
      if (cfg.initialJelly) {
        cfg.initialJelly.forEach(j => {
          if (j.row < BOARD_SIZE && j.col < BOARD_SIZE) {
            jGrid[j.row][j.col] = j.layers || 1;
          }
        });
      }
      setJellyGrid(jGrid);

      // Generate solvable board with colors allowed
      const newBoard = generateSolvableBoard(BOARD_SIZE, BOARD_SIZE, cfg.colorsAllowed);
      setBoardGrid(newBoard);

      setGameState('playing');
      setShowLevelSelect(false);
      setShowDailyRewards(false);
      setShowShop(false);
      setShowSettings(false);
    },
    [currentLevelNum]
  );

  // Check URL query parameter ?autostart=1 on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startLevel(1);
    }
  }, [startLevel]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startLevel(profile.maxLevelUnlocked);
        }
      } else if (gameState === 'playing') {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          sound.playTap();
          setGameState('paused');
        }
      } else if (gameState === 'paused') {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          sound.playTap();
          setGameState('playing');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, profile.maxLevelUnlocked, startLevel]);

  // Handle board move result and check objectives / win / loss
  const handleMoveMade = useCallback(
    (scoreGain: number, collectedCandies: Record<CandyColor, number>, jelliesCleared: number) => {
      setScore(prevScore => {
        const nextScore = prevScore + scoreGain;

        setObjectives(prevObjectives => {
          const updatedObjectives = prevObjectives.map(obj => {
            if (obj.type === 'score') {
              return { ...obj, current: nextScore };
            } else if (obj.type === 'candies' && obj.color) {
              const gained = collectedCandies[obj.color] || 0;
              return { ...obj, current: obj.current + gained };
            } else if (obj.type === 'jelly') {
              return { ...obj, current: obj.current + jelliesCleared };
            }
            return obj;
          });

          // Check if all objectives are completed
          const allCompleted = updatedObjectives.every(obj => obj.current >= obj.target);

          setMovesRemaining(prevMoves => {
            const nextMoves = Math.max(0, prevMoves - 1);

            if (allCompleted) {
              // Victory!
              sound.playVictory();
              const stars = nextScore >= levelConfig.starScores[2] ? 3 : nextScore >= levelConfig.starScores[1] ? 2 : 1;
              const coinsEarned = 50 + stars * 15;

              setProfile(p => {
                const nextMaxLevel = Math.max(p.maxLevelUnlocked, Math.min(50, levelConfig.level + 1));
                const prevStars = p.levelStars[levelConfig.level] || 0;
                const prevBest = p.levelHighScores[levelConfig.level] || 0;

                return {
                  ...p,
                  coins: p.coins + coinsEarned,
                  maxLevelUnlocked: nextMaxLevel,
                  levelStars: {
                    ...p.levelStars,
                    [levelConfig.level]: Math.max(prevStars, stars),
                  },
                  levelHighScores: {
                    ...p.levelHighScores,
                    [levelConfig.level]: Math.max(prevBest, nextScore),
                  },
                };
              });

              setTimeout(() => {
                setGameState('victory');
              }, 500);
            } else if (nextMoves <= 0) {
              // Out of moves!
              sound.playDefeat();
              setTimeout(() => {
                setGameState('defeat');
              }, 600);
            }

            return nextMoves;
          });

          return updatedObjectives;
        });

        return nextScore;
      });
    },
    [levelConfig]
  );

  // Consume booster
  const handleBoosterUsed = () => {
    if (activeBooster === 'none') return;
    setProfile(p => ({
      ...p,
      boosters: {
        ...p.boosters,
        [activeBooster]: Math.max(0, p.boosters[activeBooster] - 1),
      },
    }));
    setActiveBooster('none');
  };

  // Buy +5 Extra Moves when in defeat screen
  const handleBuyExtraMoves = () => {
    if (profile.boosters.extraMoves > 0) {
      setProfile(p => ({
        ...p,
        boosters: { ...p.boosters, extraMoves: p.boosters.extraMoves - 1 },
      }));
    } else if (profile.coins >= 50) {
      setProfile(p => ({
        ...p,
        coins: p.coins - 50,
      }));
    } else {
      return;
    }
    setMovesRemaining(prev => prev + 5);
    setGameState('playing');
  };

  // Claim Daily Reward
  const handleClaimDailyReward = (dayIdx: number) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dayRewards = [
      { coins: 150 },
      { hammer: 1 },
      { coins: 250 },
      { bomb: 1 },
      { coins: 350 },
      { colorBlast: 1 },
      { coins: 500, hammer: 1, bomb: 1, colorBlast: 1 },
    ];
    const reward = dayRewards[dayIdx % 7];

    setProfile(p => ({
      ...p,
      coins: p.coins + (reward.coins || 0),
      boosters: {
        hammer: p.boosters.hammer + (reward.hammer || 0),
        bomb: p.boosters.bomb + (reward.bomb || 0),
        colorBlast: p.boosters.colorBlast + (reward.colorBlast || 0),
        extraMoves: p.boosters.extraMoves,
      },
      lastDailyClaim: todayStr,
      claimedDays: p.claimedDays + 1,
    }));
  };

  // Buy item in shop
  const handleBuyShopItem = (type: 'hammer' | 'bomb' | 'colorBlast' | 'extraMoves', cost: number) => {
    if (profile.coins < cost) return;
    setProfile(p => ({
      ...p,
      coins: p.coins - cost,
      boosters: {
        ...p.boosters,
        [type]: p.boosters[type] + 1,
      },
    }));
  };

  // Reset Progress
  const handleResetProgress = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem(SAVE_KEY);
    setGameState('title');
  };

  return (
    <div className="min-h-screen w-full bg-[#160729] text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Title Screen View */}
      {gameState === 'title' && (
        <MainMenu
          profile={profile}
          onPlay={level => startLevel(level || profile.maxLevelUnlocked)}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onOpenDailyRewards={() => setShowDailyRewards(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenSettings={() => setShowSettings(true)}
          onToggleSound={() => {
            const nextSfx = !profile.settings.sfx;
            sound.setSfx(nextSfx);
            sound.setBgm(nextSfx);
            setProfile(p => ({
              ...p,
              settings: { bgm: nextSfx, sfx: nextSfx },
            }));
          }}
        />
      )}

      {/* Playing / In-Game View */}
      {gameState !== 'title' && (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-2 sm:p-4 bg-radial from-[#2d0f4d] via-[#1a0833] to-[#0d0218]">
          <HUD
            levelConfig={levelConfig}
            score={score}
            movesRemaining={movesRemaining}
            objectivesProgress={objectives}
            profile={profile}
            activeBooster={activeBooster}
            onSelectBooster={b => {
              if (b !== 'none' && profile.boosters[b] <= 0) {
                setShowShop(true);
              } else {
                setActiveBooster(b);
              }
            }}
            onPause={() => setGameState('paused')}
            onRestart={() => startLevel(currentLevelNum)}
            onToggleSound={() => {
              const next = !profile.settings.sfx;
              sound.setSfx(next);
              sound.setBgm(next);
              setProfile(p => ({
                ...p,
                settings: { bgm: next, sfx: next },
              }));
            }}
          />

          {/* 8x8 Playable Game Board */}
          <main className="my-auto flex flex-col items-center justify-center py-1">
            <Board
              initialGrid={boardGrid}
              initialJellyGrid={jellyGrid}
              activeBooster={activeBooster}
              onBoosterUsed={handleBoosterUsed}
              onMoveMade={handleMoveMade}
              isGameActive={gameState === 'playing'}
            />
          </main>

          {/* Bottom control hint footer */}
          <footer className="text-center py-1 text-[11px] text-purple-400 font-medium">
            Tap adjacent candies or drag to swap · [P] Pause · [R] Restart
          </footer>
        </div>
      )}

      {/* Outcome and Status Modals */}
      {(gameState === 'paused' || gameState === 'victory' || gameState === 'defeat') && (
        <GameOverModal
          status={gameState === 'paused' ? 'pause' : gameState}
          levelConfig={levelConfig}
          score={score}
          highScore={profile.levelHighScores[levelConfig.level] || 0}
          objectivesProgress={objectives}
          coinsWon={50 + (score >= levelConfig.starScores[1] ? 25 : 0)}
          playerCoins={profile.coins}
          extraMovesBoosters={profile.boosters.extraMoves}
          onNextLevel={() => startLevel(Math.min(50, currentLevelNum + 1))}
          onRetry={() => startLevel(currentLevelNum)}
          onResume={() => setGameState('playing')}
          onLevelSelect={() => {
            setGameState('title');
            setShowLevelSelect(true);
          }}
          onHome={() => setGameState('title')}
          onBuyExtraMoves={handleBuyExtraMoves}
        />
      )}

      {/* Menu Modals */}
      {showLevelSelect && (
        <LevelSelectModal
          profile={profile}
          onSelectLevel={lvl => startLevel(lvl)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {showDailyRewards && (
        <DailyRewardsModal
          profile={profile}
          onClaim={handleClaimDailyReward}
          onClose={() => setShowDailyRewards(false)}
        />
      )}

      {showShop && (
        <ShopModal
          profile={profile}
          onBuyItem={handleBuyShopItem}
          onClaimFreeCoins={() => setProfile(p => ({ ...p, coins: p.coins + 100 }))}
          onClose={() => setShowShop(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          profile={profile}
          onUpdateSettings={s => setProfile(p => ({ ...p, settings: s }))}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
