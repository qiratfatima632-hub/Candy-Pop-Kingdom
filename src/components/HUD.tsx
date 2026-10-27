import React from 'react';
import { ActiveBooster, LevelConfig, PlayerProfile } from '../game/types';
import { CandyIcon } from '../game/candyGraphics';
import { Pause, RotateCcw, Volume2, VolumeX, Sparkles, Award } from 'lucide-react';
import { sound } from '../game/sound';

interface HUDProps {
  levelConfig: LevelConfig;
  score: number;
  movesRemaining: number;
  objectivesProgress: LevelConfig['objectives'];
  profile: PlayerProfile;
  activeBooster: ActiveBooster;
  onSelectBooster: (booster: ActiveBooster) => void;
  onPause: () => void;
  onRestart: () => void;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  levelConfig,
  score,
  movesRemaining,
  objectivesProgress,
  profile,
  activeBooster,
  onSelectBooster,
  onPause,
  onRestart,
  onToggleSound,
}) => {
  const [s1, s2, s3] = levelConfig.starScores;
  const currentStars = score >= s3 ? 3 : score >= s2 ? 2 : score >= s1 ? 1 : 0;
  const starProgressPct = Math.min(100, Math.round((score / s3) * 100));

  return (
    <header className="w-full max-w-xl mx-auto px-3 py-2 flex flex-col gap-2 select-none">
      {/* Top Utility Dock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playTap();
              onPause();
            }}
            aria-label="Pause Game"
            className="w-10 h-10 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-amber-300 flex items-center justify-center border border-amber-300/40 shadow-md active:scale-95 transition-transform"
          >
            <Pause className="w-5 h-5 fill-current" />
          </button>
          <button
            onClick={() => {
              sound.playTap();
              onRestart();
            }}
            aria-label="Restart Level"
            className="w-10 h-10 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-amber-300 flex items-center justify-center border border-amber-300/40 shadow-md active:scale-95 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playTap();
              onToggleSound();
            }}
            aria-label="Toggle Sound"
            className="w-10 h-10 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-amber-300 flex items-center justify-center border border-amber-300/40 shadow-md active:scale-95 transition-transform"
          >
            {profile.settings.sfx ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Level Emblem Badge */}
        <div className="px-4 py-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 border border-pink-300 shadow-md text-white font-black text-sm tracking-wide">
          LEVEL {levelConfig.level}
        </div>

        {/* Player Coin Purse */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-purple-950/90 border border-amber-400/50 shadow-md">
          <div className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-inner">
            🪙
          </div>
          <span className="font-bold text-amber-300 text-sm">{profile.coins}</span>
        </div>
      </div>

      {/* Main Score & Moves Banner */}
      <div className="grid grid-cols-12 gap-2 items-center bg-purple-950/70 border border-purple-800/80 rounded-2xl p-2.5 shadow-lg backdrop-blur-xs">
        {/* Moves Left Counter */}
        <div
          className={`col-span-3 flex flex-col items-center justify-center py-1 px-2 rounded-xl border ${
            movesRemaining <= 5
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-purple-900/50 border-purple-700/60 text-white'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Moves</span>
          <span className="text-2xl font-black tabular-nums leading-none mt-0.5">{movesRemaining}</span>
        </div>

        {/* Score & Star Progress Bar */}
        <div className="col-span-9 flex flex-col gap-1 px-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-purple-300 flex items-center gap-1">
              SCORE: <span className="text-white text-base font-black tabular-nums">{score}</span>
            </span>
            <div className="flex items-center gap-1">
              <span className={currentStars >= 1 ? 'text-amber-300 text-sm' : 'text-purple-800 text-sm'}>★</span>
              <span className={currentStars >= 2 ? 'text-amber-300 text-sm' : 'text-purple-800 text-sm'}>★</span>
              <span className={currentStars >= 3 ? 'text-amber-300 text-sm' : 'text-purple-800 text-sm'}>★</span>
            </div>
          </div>

          {/* Star Bar Track */}
          <div className="relative w-full h-3 rounded-full bg-purple-900/80 overflow-hidden border border-purple-700/50">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${starProgressPct}%` }}
            />
            {/* Star Milestone Marks */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/50"
              style={{ left: `${(s1 / s3) * 100}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/50"
              style={{ left: `${(s2 / s3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Objectives Live Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {objectivesProgress.map((obj, i) => {
          const isDone = obj.current >= obj.target;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                isDone
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                  : 'bg-purple-900/60 border-purple-700/60 text-purple-200'
              }`}
            >
              {obj.type === 'candies' && obj.color && (
                <div className="w-5 h-5 flex items-center justify-center">
                  <CandyIcon color={obj.color} size={20} />
                </div>
              )}
              {obj.type === 'jelly' && (
                <span className="w-4 h-4 rounded-md bg-pink-400 border border-pink-200 inline-block shadow-xs" />
              )}
              {obj.type === 'score' && <Award className="w-4 h-4 text-amber-300" />}

              <span>
                {obj.type === 'candies' ? 'Collect' : obj.type === 'jelly' ? 'Clear Jelly' : 'Target'}:{' '}
                <span className="text-white font-black tabular-nums">
                  {Math.min(obj.target, obj.current)} / {obj.target}
                </span>
              </span>
              {isDone && <span className="text-emerald-400 font-black">✓</span>}
            </div>
          );
        })}
      </div>

      {/* In-Game Boosters Dock */}
      <div className="flex items-center justify-center gap-3 mt-0.5">
        <button
          onClick={() => {
            sound.playTap();
            onSelectBooster(activeBooster === 'hammer' ? 'none' : 'hammer');
          }}
          aria-label="Lollipop Hammer Booster"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border shadow-md transition-all active:scale-95 ${
            activeBooster === 'hammer'
              ? 'bg-amber-400 text-purple-950 border-white ring-2 ring-amber-300 ring-offset-2 ring-offset-purple-950'
              : 'bg-purple-900/70 hover:bg-purple-800 text-purple-200 border-purple-700/70'
          }`}
        >
          <span className="text-base">🔨</span>
          <span className="hidden sm:inline">Hammer</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-950 text-amber-300 text-[10px] font-black">
            {profile.boosters.hammer}
          </span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            onSelectBooster(activeBooster === 'bomb' ? 'none' : 'bomb');
          }}
          aria-label="Sweet Bomb Booster"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border shadow-md transition-all active:scale-95 ${
            activeBooster === 'bomb'
              ? 'bg-amber-400 text-purple-950 border-white ring-2 ring-amber-300 ring-offset-2 ring-offset-purple-950'
              : 'bg-purple-900/70 hover:bg-purple-800 text-purple-200 border-purple-700/70'
          }`}
        >
          <span className="text-base">💣</span>
          <span className="hidden sm:inline">Bomb</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-950 text-amber-300 text-[10px] font-black">
            {profile.boosters.bomb}
          </span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            onSelectBooster(activeBooster === 'colorBlast' ? 'none' : 'colorBlast');
          }}
          aria-label="Rainbow Spray Booster"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border shadow-md transition-all active:scale-95 ${
            activeBooster === 'colorBlast'
              ? 'bg-amber-400 text-purple-950 border-white ring-2 ring-amber-300 ring-offset-2 ring-offset-purple-950'
              : 'bg-purple-900/70 hover:bg-purple-800 text-purple-200 border-purple-700/70'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span className="hidden sm:inline">Rainbow</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-950 text-amber-300 text-[10px] font-black">
            {profile.boosters.colorBlast}
          </span>
        </button>
      </div>
    </header>
  );
};
