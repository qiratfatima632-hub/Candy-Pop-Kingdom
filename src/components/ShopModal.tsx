import React from 'react';
import { PlayerProfile } from '../game/types';
import { X, ShoppingBag, Plus, Sparkles } from 'lucide-react';
import { sound } from '../game/sound';

interface ShopModalProps {
  profile: PlayerProfile;
  onBuyItem: (type: 'hammer' | 'bomb' | 'colorBlast' | 'extraMoves', cost: number) => void;
  onClaimFreeCoins: () => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  profile,
  onBuyItem,
  onClaimFreeCoins,
  onClose,
}) => {
  const items = [
    {
      id: 'hammer' as const,
      name: 'Lollipop Hammer',
      desc: 'Smash any single candy or jelly tile immediately!',
      icon: '🔨',
      cost: 150,
      owned: profile.boosters.hammer,
    },
    {
      id: 'bomb' as const,
      name: 'Sweet Bomb',
      desc: 'Blows up a 3×3 square of candies and jellies!',
      icon: '💣',
      cost: 200,
      owned: profile.boosters.bomb,
    },
    {
      id: 'colorBlast' as const,
      name: 'Rainbow Spray',
      desc: 'Instantly clears all candies of any selected color!',
      icon: '🌈',
      cost: 300,
      owned: profile.boosters.colorBlast,
    },
    {
      id: 'extraMoves' as const,
      name: '+5 Extra Moves',
      desc: 'Adds 5 emergency moves when you run low on moves!',
      icon: '➕',
      cost: 180,
      owned: profile.boosters.extraMoves,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#2e104d] to-[#16062b] rounded-3xl border-2 border-amber-500/50 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-700/50 bg-purple-950/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-black text-amber-300">Candy Shop</h2>
              <p className="text-xs text-purple-300">Stock up on powerful boosters!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-amber-400/50">
              <span className="text-sm">🪙</span>
              <span className="font-bold text-amber-300 text-sm tabular-nums">{profile.coins}</span>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              aria-label="Close Shop"
              className="w-9 h-9 rounded-full bg-purple-800/80 hover:bg-purple-700 text-purple-200 flex items-center justify-center active:scale-95 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shop Items List */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {items.map(item => {
            const canAfford = profile.coins >= item.cost;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/70 hover:border-purple-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-900/90 border border-purple-700 flex items-center justify-center text-2xl shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm">{item.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900 text-purple-300 border border-purple-800">
                        Owned: {item.owned}
                      </span>
                    </div>
                    <p className="text-xs text-purple-300 mt-0.5 max-w-xs">{item.desc}</p>
                  </div>
                </div>

                <button
                  disabled={!canAfford}
                  onClick={() => {
                    sound.playBooster();
                    onBuyItem(item.id, item.cost);
                  }}
                  className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-purple-950 hover:from-amber-300 hover:to-yellow-400 cursor-pointer'
                      : 'bg-purple-900/50 text-purple-500 cursor-not-allowed border border-purple-800/50'
                  }`}
                >
                  <span>🪙</span>
                  <span>{item.cost}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Free Coins Gift Banner */}
        <div className="p-3 border-t border-purple-800/50 bg-purple-950/80 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs text-purple-300 font-bold">Need more coins?</span>
          </div>
          <button
            onClick={() => {
              sound.playVictory();
              onClaimFreeCoins();
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 border border-purple-600 text-amber-300 text-xs font-bold active:scale-95 transition-transform flex items-center gap-1"
          >
            <span>+100 Free Coins</span>
          </button>
        </div>
      </div>
    </div>
  );
};
