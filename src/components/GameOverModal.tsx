import React from 'react';
import { LevelConfig } from '../game/types';
import { Star, RotateCcw, Play, Grid, Home, Sparkles, PlusCircle } from 'lucide-react';
import { sound } from '../game/sound';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  status: 'victory' | 'defeat' | 'pause';
  levelConfig: LevelConfig;
  score: number;
  highScore: number;
  objectivesProgress: LevelConfig['objectives'];
  coinsWon?: number;
  playerCoins: number;
  extraMovesBoosters: number;
  onNextLevel: () => void;
  onRetry: () => void;
  onResume: () => void;
  onLevelSelect: () => void;
  onHome: () => void;
  onBuyExtraMoves: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  levelConfig,
  score,
  highScore,
  objectivesProgress,
  coinsWon = 50,
  playerCoins,
  extraMovesBoosters,
  onNextLevel,
  onRetry,
  onResume,
  onLevelSelect,
  onHome,
  onBuyExtraMoves,
}) => {
  const [s1, s2, s3] = levelConfig.starScores;
  const starsEarned = score >= s3 ? 3 : score >= s2 ? 2 : score >= s1 ? 1 : 1;

  React.useEffect(() => {
    if (status === 'victory') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff4d6d', '#ffd166', '#06d6a0', '#118ab2', '#a06cd5'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [status]);

  if (status === 'pause') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs select-none">
        <div className="relative w-full max-w-sm bg-gradient-to-b from-[#2b0e45] to-[#140621] rounded-3xl border-2 border-purple-500/50 shadow-2xl p-6 flex flex-col items-center text-center text-white">
          <h2 className="text-2xl font-black text-amber-300">Level {levelConfig.level} Paused</h2>
          <p className="text-xs text-purple-300 mt-1">{levelConfig.description}</p>

          <div className="w-full my-6 flex flex-col gap-2.5">
            <button
              onClick={() => {
                sound.playTap();
                onResume();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Resume Game</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onRetry();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-purple-200 font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Level</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onLevelSelect();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-purple-200 font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Grid className="w-4 h-4" />
              <span>Level Selection</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onHome();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-purple-950/90 hover:bg-purple-900 border border-purple-800 text-purple-300 font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'victory') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs select-none">
        <div className="relative w-full max-w-sm bg-gradient-to-b from-[#3a1359] to-[#180729] rounded-3xl border-2 border-amber-400/60 shadow-2xl p-6 flex flex-col items-center text-center text-white">
          <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl mb-2 animate-bounce">
            🏆
          </div>

          <h2 className="text-3xl font-black text-amber-300 tracking-tight">Level Complete!</h2>
          <p className="text-xs text-purple-300 mt-0.5">Sweet victory in Level {levelConfig.level}!</p>

          {/* Animated 3 Stars */}
          <div className="flex items-center justify-center gap-2 my-4">
            <Star
              className={`w-10 h-10 transition-transform ${
                starsEarned >= 1 ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_#fbbf24]' : 'text-purple-800'
              }`}
            />
            <Star
              className={`w-12 h-12 -translate-y-1 transition-transform ${
                starsEarned >= 2 ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_#fbbf24]' : 'text-purple-800'
              }`}
            />
            <Star
              className={`w-10 h-10 transition-transform ${
                starsEarned >= 3 ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_#fbbf24]' : 'text-purple-800'
              }`}
            />
          </div>

          {/* Score & Rewards Cards */}
          <div className="w-full bg-purple-950/70 border border-purple-800/80 rounded-2xl p-3 flex flex-col gap-2 my-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-300">
              <span>Final Score:</span>
              <span className="text-white text-base font-black tabular-nums">{score}</span>
            </div>
            {highScore > score && (
              <div className="flex items-center justify-between text-xs text-purple-400">
                <span>Best Score:</span>
                <span className="tabular-nums font-bold">{highScore}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs font-bold text-amber-300 pt-1 border-t border-purple-800/50">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Coins Earned:
              </span>
              <span className="text-sm font-black text-amber-300 tabular-nums">+{coinsWon} 🪙</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full flex flex-col gap-2 mt-4">
            {levelConfig.level < 50 ? (
              <button
                data-start="true"
                onClick={() => {
                  sound.playTap();
                  onNextLevel();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <span>NEXT LEVEL</span>
                <Play className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <div className="py-2 px-4 rounded-xl bg-purple-900 text-amber-300 font-bold text-xs">
                🎉 Congratulations! You have conquered all 50 levels!
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playTap();
                  onRetry();
                }}
                className="py-2.5 px-3 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  onLevelSelect();
                }}
                className="py-2.5 px-3 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Levels</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Defeat / Out of Moves State
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#380e2b] to-[#170514] rounded-3xl border-2 border-rose-500/50 shadow-2xl p-6 flex flex-col items-center text-center text-white">
        <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-2xl mb-2">
          🍬
        </div>

        <h2 className="text-2xl font-black text-rose-300">Out of Moves!</h2>
        <p className="text-xs text-purple-300 mt-0.5">Don't give up! Keep going or retry Level {levelConfig.level}.</p>

        {/* Objectives Progress Breakdown */}
        <div className="w-full bg-purple-950/70 border border-purple-800/80 rounded-2xl p-3 flex flex-col gap-2 my-3 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
            Objectives Remaining:
          </span>
          {objectivesProgress.map((obj, i) => {
            const needed = Math.max(0, obj.target - obj.current);
            return (
              <div key={i} className="flex items-center justify-between text-xs text-purple-200">
                <span>{obj.type === 'candies' ? `${obj.color} Candies` : obj.type === 'jelly' ? 'Jelly Tiles' : 'Target Score'}:</span>
                <span className="font-bold text-rose-300 tabular-nums">
                  {needed === 0 ? '✓ Complete' : `${needed} more needed`}
                </span>
              </div>
            );
          })}
        </div>

        {/* +5 Extra Moves Option */}
        <button
          onClick={() => {
            sound.playBooster();
            onBuyExtraMoves();
          }}
          disabled={playerCoins < 50 && extraMovesBoosters <= 0}
          className={`w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all mb-3 ${
            playerCoins >= 50 || extraMovesBoosters > 0
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-purple-950 cursor-pointer'
              : 'bg-purple-950/60 text-purple-500 border border-purple-800 cursor-not-allowed'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>
            {extraMovesBoosters > 0 ? '+5 Moves (Use Free Booster)' : '+5 Extra Moves (50 🪙)'}
          </span>
        </button>

        {/* Retry & Menu Actions */}
        <div className="w-full grid grid-cols-2 gap-2">
          <button
            data-start="true"
            onClick={() => {
              sound.playTap();
              onRetry();
            }}
            className="py-2.5 px-3 rounded-xl bg-purple-900/90 hover:bg-purple-800 border border-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onLevelSelect();
            }}
            className="py-2.5 px-3 rounded-xl bg-purple-900/90 hover:bg-purple-800 border border-purple-700 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Levels</span>
          </button>
        </div>
      </div>
    </div>
  );
};
