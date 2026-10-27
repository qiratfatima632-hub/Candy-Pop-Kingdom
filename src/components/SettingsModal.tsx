import React, { useState } from 'react';
import { PlayerProfile } from '../game/types';
import { X, Volume2, VolumeX, Music, HelpCircle, RotateCcw } from 'lucide-react';
import { sound } from '../game/sound';

interface SettingsModalProps {
  profile: PlayerProfile;
  onUpdateSettings: (settings: PlayerProfile['settings']) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'howToPlay'>('settings');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#2b0e45] to-[#140621] rounded-3xl border-2 border-purple-500/50 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-700/50 bg-purple-950/60">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-amber-300">
              {activeTab === 'settings' ? 'Game Settings' : 'How to Play'}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            aria-label="Close Settings"
            className="w-9 h-9 rounded-full bg-purple-800/80 hover:bg-purple-700 text-purple-200 flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-purple-800/50 bg-purple-950/40">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('settings');
            }}
            className={`flex-1 py-2.5 font-bold text-sm transition-all ${
              activeTab === 'settings'
                ? 'text-amber-300 border-b-2 border-amber-300 bg-purple-900/40'
                : 'text-purple-400 hover:text-purple-200'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('howToPlay');
            }}
            className={`flex-1 py-2.5 font-bold text-sm transition-all ${
              activeTab === 'howToPlay'
                ? 'text-amber-300 border-b-2 border-amber-300 bg-purple-900/40'
                : 'text-purple-400 hover:text-purple-200'
            }`}
          >
            How to Play
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {activeTab === 'settings' ? (
            <div className="flex flex-col gap-4">
              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-900 flex items-center justify-center text-amber-300">
                    {profile.settings.sfx ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white">Sound Effects</span>
                    <p className="text-xs text-purple-300">Juicy pops, chimes, and explosions</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const next = !profile.settings.sfx;
                    sound.setSfx(next);
                    if (next) sound.playTap();
                    onUpdateSettings({ ...profile.settings, sfx: next });
                  }}
                  className={`px-4 py-1.5 rounded-full font-black text-xs transition-all ${
                    profile.settings.sfx ? 'bg-amber-400 text-purple-950' : 'bg-purple-900 text-purple-400'
                  }`}
                >
                  {profile.settings.sfx ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Music Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-900 flex items-center justify-center text-amber-300">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white">Background Music</span>
                    <p className="text-xs text-purple-300">Gentle melody synthesized in real-time</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const next = !profile.settings.bgm;
                    sound.setBgm(next);
                    sound.playTap();
                    onUpdateSettings({ ...profile.settings, bgm: next });
                  }}
                  className={`px-4 py-1.5 rounded-full font-black text-xs transition-all ${
                    profile.settings.bgm ? 'bg-amber-400 text-purple-950' : 'bg-purple-900 text-purple-400'
                  }`}
                >
                  {profile.settings.bgm ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Reset Progress */}
              <div className="mt-4 pt-4 border-t border-purple-800/50 flex flex-col gap-2">
                {!showConfirmReset ? (
                  <button
                    onClick={() => {
                      sound.playTap();
                      setShowConfirmReset(true);
                    }}
                    className="py-2.5 px-4 rounded-2xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset All Game Progress</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-950/90 border border-rose-600 flex flex-col gap-2 text-center">
                    <span className="text-xs font-bold text-rose-200">
                      Are you sure? This will reset all unlocked levels, scores, and coins!
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          sound.playTap();
                          onResetProgress();
                          setShowConfirmReset(false);
                          onClose();
                        }}
                        className="py-1.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                      >
                        Yes, Reset
                      </button>
                      <button
                        onClick={() => {
                          sound.playTap();
                          setShowConfirmReset(false);
                        }}
                        className="py-1.5 px-4 rounded-xl bg-purple-900 hover:bg-purple-800 text-purple-300 font-bold text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-xs text-purple-200">
              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <span className="font-bold text-amber-300 text-sm block mb-1">Basic Matching</span>
                <p>Swap two adjacent candies horizontally or vertically. Match 3 identical candies in a row or column to clear them and score points.</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <span className="font-bold text-amber-300 text-sm block mb-1">Striped Candies (Match 4)</span>
                <p>Match 4 candies in a straight line to create a Striped Candy. When matched or triggered, it blasts an entire row or column!</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <span className="font-bold text-amber-300 text-sm block mb-1">Wrapped Candies (L or T Shape)</span>
                <p>Match 5 candies in an L or T shape to create a Wrapped Candy. When activated, it detonates in a 3×3 square explosion!</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <span className="font-bold text-amber-300 text-sm block mb-1">Color Bomb (Match 5 in a Line)</span>
                <p>Match 5 candies in a row to create a Color Bomb! Swap it with any candy to clear all candies of that color from the board.</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <span className="font-bold text-amber-300 text-sm block mb-1">Special Candy Combos</span>
                <p>Swap two special candies together for super combos! For example: Color Bomb + Color Bomb clears the entire board, while Striped + Striped fires a cross laser blast.</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <span className="font-bold text-amber-300 text-sm block mb-1">Jelly Tiles</span>
                <p>Some levels contain pink translucent jelly tiles under the board. Make matches on top of jelly tiles to clear them!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
