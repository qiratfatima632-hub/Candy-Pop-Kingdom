import React from 'react';
import { ALL_LEVELS } from '../game/levels';
import { PlayerProfile } from '../game/types';
import { X, Lock, Star, Play } from 'lucide-react';
import { sound } from '../game/sound';

interface LevelSelectModalProps {
  profile: PlayerProfile;
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  profile,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl max-h-[88vh] bg-gradient-to-b from-[#381363] to-[#1e0738] rounded-3xl border-2 border-purple-500/50 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-700/50 bg-purple-950/60">
          <div>
            <h2 className="text-xl font-black text-amber-300">Level Selection</h2>
            <p className="text-xs text-purple-300">Choose from 50 sweet kingdom levels</p>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            aria-label="Close Level Selection"
            className="w-9 h-9 rounded-full bg-purple-800/80 hover:bg-purple-700 text-purple-200 flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Levels Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[65vh]">
          {ALL_LEVELS.map(lvl => {
            const isUnlocked = lvl.level <= profile.maxLevelUnlocked;
            const stars = profile.levelStars[lvl.level] || 0;
            const highScore = profile.levelHighScores[lvl.level] || 0;

            return (
              <button
                key={lvl.level}
                disabled={!isUnlocked}
                onClick={() => {
                  sound.playTap();
                  onSelectLevel(lvl.level);
                }}
                className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all duration-150 ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-purple-800 to-purple-950 border-amber-400/60 hover:border-amber-300 hover:scale-105 shadow-md active:scale-95 cursor-pointer'
                    : 'bg-purple-950/50 border-purple-900/60 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Level Number or Lock Icon */}
                {isUnlocked ? (
                  <span className="text-base sm:text-lg font-black text-white">{lvl.level}</span>
                ) : (
                  <Lock className="w-5 h-5 text-purple-400 my-0.5" />
                )}

                {/* Stars Indicator */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  <Star className={`w-3 h-3 ${stars >= 1 ? 'text-amber-400 fill-amber-400' : 'text-purple-700'}`} />
                  <Star className={`w-3 h-3 ${stars >= 2 ? 'text-amber-400 fill-amber-400' : 'text-purple-700'}`} />
                  <Star className={`w-3 h-3 ${stars >= 3 ? 'text-amber-400 fill-amber-400' : 'text-purple-700'}`} />
                </div>

                {/* High score badge */}
                {highScore > 0 && (
                  <span className="text-[9px] text-amber-200/90 font-bold tabular-nums mt-0.5">
                    {highScore > 9999 ? `${Math.round(highScore / 1000)}k` : highScore}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-purple-800/50 bg-purple-950/80 flex items-center justify-between text-xs text-purple-300 px-6">
          <span>Total Stars Earned:</span>
          <span className="font-black text-amber-300 text-sm flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {Object.values(profile.levelStars).reduce((a, b) => a + b, 0)} / 150
          </span>
        </div>
      </div>
    </div>
  );
};
