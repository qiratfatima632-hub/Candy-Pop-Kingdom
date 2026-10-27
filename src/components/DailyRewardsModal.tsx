import React from 'react';
import { PlayerProfile } from '../game/types';
import { X, Check, Gift, Sparkles } from 'lucide-react';
import { sound } from '../game/sound';

interface DailyRewardsModalProps {
  profile: PlayerProfile;
  onClaim: (dayIndex: number) => void;
  onClose: () => void;
}

const REWARDS = [
  { day: 1, title: '150 Coins', icon: '🪙', coins: 150 },
  { day: 2, title: '1 Hammer', icon: '🔨', hammer: 1 },
  { day: 3, title: '250 Coins', icon: '🪙', coins: 250 },
  { day: 4, title: '1 Sweet Bomb', icon: '💣', bomb: 1 },
  { day: 5, title: '350 Coins', icon: '🪙', coins: 350 },
  { day: 6, title: '1 Rainbow Spray', icon: '🌈', colorBlast: 1 },
  { day: 7, title: 'Grand Bundle: 500 Coins + All Boosters!', icon: '🎁', coins: 500, hammer: 1, bomb: 1, colorBlast: 1 },
];

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  profile,
  onClaim,
  onClose,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const canClaimToday = profile.lastDailyClaim !== todayStr;
  const currentDayIndex = profile.claimedDays % 7; // 0 to 6

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#3d1354] to-[#1e0730] rounded-3xl border-2 border-pink-500/50 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-700/50 bg-purple-950/60">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-pink-400" />
            <div>
              <h2 className="text-xl font-black text-amber-300">Daily Rewards</h2>
              <p className="text-xs text-purple-300">Log in every day for sweet gifts!</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            aria-label="Close Daily Rewards"
            className="w-9 h-9 rounded-full bg-purple-800/80 hover:bg-purple-700 text-purple-200 flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7 Days Grid */}
        <div className="p-5 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {REWARDS.map((rew, idx) => {
            const isClaimed = idx < currentDayIndex || (idx === currentDayIndex && !canClaimToday);
            const isReady = idx === currentDayIndex && canClaimToday;

            return (
              <div
                key={rew.day}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 text-center transition-all ${
                  rew.day === 7 ? 'col-span-3 sm:col-span-2 bg-gradient-to-r from-purple-800 to-pink-900 border-amber-300' : ''
                } ${
                  isReady
                    ? 'bg-purple-800 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] ring-2 ring-amber-300 ring-offset-2 ring-offset-purple-950 animate-candy-pulse'
                    : isClaimed
                    ? 'bg-purple-950/60 border-emerald-500/50 opacity-70'
                    : 'bg-purple-950/40 border-purple-800/60 opacity-60'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider">
                  Day {rew.day}
                </span>
                <span className="text-2xl sm:text-3xl my-1">{rew.icon}</span>
                <span className="text-xs font-bold text-amber-200">{rew.title}</span>

                {isClaimed && (
                  <div className="absolute inset-0 bg-emerald-950/70 rounded-2xl flex items-center justify-center">
                    <Check className="w-7 h-7 text-emerald-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Action CTA */}
        <div className="p-4 border-t border-purple-800/50 bg-purple-950/80 flex flex-col items-center gap-2">
          {canClaimToday ? (
            <button
              onClick={() => {
                sound.playVictory();
                onClaim(currentDayIndex);
              }}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-purple-950 font-black text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <Sparkles className="w-5 h-5" />
              <span>CLAIM TODAY'S REWARD!</span>
            </button>
          ) : (
            <div className="py-2.5 px-6 rounded-2xl bg-purple-900/60 text-purple-300 font-bold text-sm text-center">
              ✓ Reward Claimed! Next reward unlocks tomorrow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
