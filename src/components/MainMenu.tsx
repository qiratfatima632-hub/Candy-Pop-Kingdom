import React from 'react';
import { PlayerProfile } from '../game/types';
import { CandyIcon } from '../game/candyGraphics';
import { Play, Grid, Gift, ShoppingBag, Settings, LogOut, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../game/sound';

interface MainMenuProps {
  profile: PlayerProfile;
  onPlay: (level?: number) => void;
  onOpenLevelSelect: () => void;
  onOpenDailyRewards: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  onPlay,
  onOpenLevelSelect,
  onOpenDailyRewards,
  onOpenShop,
  onOpenSettings,
  onToggleSound,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 bg-gradient-to-b from-[#2b0f4c] via-[#1a0833] to-[#0c0317] text-white overflow-hidden select-none">
      {/* Animated Floating Candy Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-12 left-10 animate-float" style={{ animationDelay: '0s' }}>
          <CandyIcon color="red" size={60} />
        </div>
        <div className="absolute top-24 right-12 animate-float" style={{ animationDelay: '1.2s' }}>
          <CandyIcon color="yellow" special="striped_v" size={68} />
        </div>
        <div className="absolute bottom-28 left-8 animate-float" style={{ animationDelay: '2.4s' }}>
          <CandyIcon color="blue" size={64} />
        </div>
        <div className="absolute bottom-20 right-14 animate-float" style={{ animationDelay: '0.8s' }}>
          <CandyIcon color="green" special="wrapped" size={64} />
        </div>
        <div className="absolute top-1/2 left-1/4 animate-float" style={{ animationDelay: '1.8s' }}>
          <CandyIcon color="purple" special="color_bomb" size={54} />
        </div>
        <div className="absolute top-2/3 right-1/4 animate-float" style={{ animationDelay: '3s' }}>
          <CandyIcon color="orange" size={56} />
        </div>
      </div>

      {/* Top Header Bar: Coins, Sound, Level */}
      <header className="relative z-10 w-full max-w-xl flex items-center justify-between px-2 pt-2">
        {/* Player Level Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/60 shadow-md">
          <span className="text-xs uppercase font-bold text-purple-300">Current</span>
          <span className="text-sm font-black text-amber-300">Level {profile.maxLevelUnlocked}</span>
        </div>

        {/* Coin Balance Pill */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-amber-400/50 shadow-md">
          <span className="text-base">🪙</span>
          <span className="text-sm font-black text-amber-300 tabular-nums">{profile.coins}</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            sound.playTap();
            onToggleSound();
          }}
          aria-label="Toggle Sound"
          className="w-10 h-10 rounded-full bg-purple-900/80 hover:bg-purple-800 text-amber-300 flex items-center justify-center border border-amber-300/40 shadow-md transition-transform active:scale-95"
        >
          {profile.settings.sfx ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </header>

      {/* Center: Title Logo Lockup & Decorative Candies */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4">
        {/* Candy decorative row */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <CandyIcon color="red" size={38} className="animate-bounce" />
          <CandyIcon color="yellow" size={44} className="animate-candy-pulse" />
          <CandyIcon color="blue" special="color_bomb" size={50} />
          <CandyIcon color="green" size={44} className="animate-candy-pulse" />
          <CandyIcon color="purple" size={38} className="animate-bounce" />
        </div>

        {/* Title Emblem */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-amber-500 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
          CANDY POP
        </h1>
        <div className="inline-block mt-0.5 px-4 py-1 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 text-xs sm:text-sm font-black uppercase tracking-widest text-white border border-pink-300 shadow-md">
          Kingdom: Match-3 Quest
        </div>
        <p className="text-purple-300 text-xs sm:text-sm mt-2 font-medium max-w-xs">
          Swap sweet treats, ignite super combos & conquer 50 delicious levels!
        </p>

        {/* Primary CTA Play Button */}
        <div className="mt-8 flex flex-col items-center w-full max-w-xs gap-3">
          <button
            data-start="true"
            onClick={() => {
              sound.playTap();
              onPlay(profile.maxLevelUnlocked);
            }}
            className="w-full py-4 px-8 rounded-3xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-black text-xl tracking-wide flex items-center justify-center gap-3 candy-btn border-2 border-emerald-200 cursor-pointer"
          >
            <Play className="w-7 h-7 fill-current" />
            <span>PLAY LEVEL {profile.maxLevelUnlocked}</span>
          </button>

          {/* Secondary Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full mt-2">
            <button
              onClick={() => {
                sound.playTap();
                onOpenLevelSelect();
              }}
              className="py-3 px-3 rounded-2xl bg-purple-900/90 hover:bg-purple-800 text-white font-bold text-sm flex items-center justify-center gap-2 border border-purple-700/80 shadow-md active:scale-95 transition-all"
            >
              <Grid className="w-4 h-4 text-amber-300" />
              <span>50 Levels</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onOpenDailyRewards();
              }}
              className="py-3 px-3 rounded-2xl bg-purple-900/90 hover:bg-purple-800 text-white font-bold text-sm flex items-center justify-center gap-2 border border-purple-700/80 shadow-md active:scale-95 transition-all relative"
            >
              <Gift className="w-4 h-4 text-rose-300" />
              <span>Daily Gift</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2 right-2 animate-ping" />
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onOpenShop();
              }}
              className="py-3 px-3 rounded-2xl bg-purple-900/90 hover:bg-purple-800 text-white font-bold text-sm flex items-center justify-center gap-2 border border-purple-700/80 shadow-md active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-yellow-300" />
              <span>Shop</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onOpenSettings();
              }}
              className="py-3 px-3 rounded-2xl bg-purple-900/90 hover:bg-purple-800 text-white font-bold text-sm flex items-center justify-center gap-2 border border-purple-700/80 shadow-md active:scale-95 transition-all"
            >
              <Settings className="w-4 h-4 text-cyan-300" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer safe bottom note */}
      <footer className="relative z-10 w-full text-center py-2 text-[11px] text-purple-400 font-medium">
        Swipe or Click to Swap · Match 3+ Candies · Enter/Space to Start
      </footer>
    </div>
  );
};
