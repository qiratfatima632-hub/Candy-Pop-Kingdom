import React from 'react';
import { CandyColor, SpecialType } from './types';

interface CandyProps {
  color: CandyColor;
  special?: SpecialType;
  size?: number;
  className?: string;
  isHint?: boolean;
  isSelected?: boolean;
}

export const CandyIcon: React.FC<CandyProps> = ({
  color,
  special = 'none',
  size = 54,
  className = '',
  isHint = false,
  isSelected = false,
}) => {
  // Color palette gradients and highlights
  const renderColorBomb = () => (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <radialGradient id="cb-base" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#4a2511" />
          <stop offset="60%" stopColor="#241107" />
          <stop offset="100%" stopColor="#100702" />
        </radialGradient>
        <filter id="cb-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Outer chocolate sphere */}
      <circle cx="50" cy="50" r="42" fill="url(#cb-base)" filter="url(#cb-glow)" />
      
      {/* Rainbow Sprinkles on top */}
      <rect x="30" y="24" width="10" height="4" rx="2" fill="#ff4d6d" transform="rotate(25 35 26)" />
      <rect x="58" y="22" width="11" height="4" rx="2" fill="#ffd166" transform="rotate(-35 63 24)" />
      <rect x="42" y="38" width="11" height="4" rx="2" fill="#06d6a0" transform="rotate(15 47 40)" />
      <rect x="22" y="52" width="10" height="4" rx="2" fill="#118ab2" transform="rotate(70 27 54)" />
      <rect x="65" y="48" width="11" height="4" rx="2" fill="#a06cd5" transform="rotate(-15 70 50)" />
      <rect x="36" y="65" width="11" height="4" rx="2" fill="#ff70a6" transform="rotate(45 41 67)" />
      <rect x="54" y="68" width="10" height="4" rx="2" fill="#ffd166" transform="rotate(-40 59 70)" />
      <rect x="48" y="52" width="12" height="4" rx="2" fill="#06d6a0" transform="rotate(-70 54 54)" />

      {/* Glossy top-left highlight */}
      <ellipse cx="38" cy="30" rx="14" ry="7" fill="white" opacity="0.35" transform="rotate(-25 38 30)" />
    </svg>
  );

  if (special === 'color_bomb') {
    return (
      <div className={`relative flex items-center justify-center ${isSelected ? 'scale-110 drop-shadow-[0_0_12px_rgba(255,215,0,0.9)]' : ''} ${isHint ? 'animate-bounce' : ''}`}>
        {renderColorBomb()}
      </div>
    );
  }

  const renderCandyShape = () => {
    switch (color) {
      case 'red': // Ruby Heart Drop
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
            <defs>
              <linearGradient id="red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d6d" />
                <stop offset="45%" stopColor="#e60039" />
                <stop offset="100%" stopColor="#990026" />
              </linearGradient>
              <radialGradient id="red-shine" cx="30%" cy="25%" r="45%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Heart Silhouette */}
            <path
              d="M50,84 C20,62 8,44 8,28 C8,15 18,6 31,6 C40,6 47,12 50,18 C53,12 60,6 69,6 C82,6 92,15 92,28 C92,44 80,62 50,84 Z"
              fill="url(#red-grad)"
              stroke="#ff758f"
              strokeWidth="2.5"
            />
            {/* Glossy Curved Highlight */}
            <path
              d="M32,12 C24,12 16,18 16,26 C16,35 24,46 36,54 C34,48 30,38 30,30 C30,22 34,16 38,13 Z"
              fill="#ffffff"
              opacity="0.45"
            />
            {/* Top Shine */}
            <circle cx="32" cy="20" r="12" fill="url(#red-shine)" />
          </svg>
        );

      case 'blue': // Sapphire Sphere Bonbon
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
            <defs>
              <radialGradient id="blue-grad" cx="32%" cy="28%" r="68%">
                <stop offset="0%" stopColor="#64dfdf" />
                <stop offset="35%" stopColor="#0096c7" />
                <stop offset="75%" stopColor="#023e8a" />
                <stop offset="100%" stopColor="#03045e" />
              </radialGradient>
              <radialGradient id="blue-glint" cx="30%" cy="25%" r="35%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="url(#blue-grad)" stroke="#90e0ef" strokeWidth="2.5" />
            {/* Glossy Rim & Orbit Swirl */}
            <path
              d="M26,38 C32,24 64,22 74,38 C80,48 70,68 50,72"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.3"
            />
            <ellipse cx="36" cy="32" rx="14" ry="7" fill="url(#blue-glint)" transform="rotate(-30 36 32)" />
          </svg>
        );

      case 'green': // Mint Crystal Square
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
            <defs>
              <linearGradient id="green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#52b788" />
                <stop offset="40%" stopColor="#2d6a4f" />
                <stop offset="100%" stopColor="#081c15" />
              </linearGradient>
            </defs>
            <rect
              x="14"
              y="14"
              width="72"
              height="72"
              rx="18"
              fill="url(#green-grad)"
              stroke="#74c69d"
              strokeWidth="2.5"
            />
            {/* Crystal Facet Lines */}
            <path d="M26,26 L50,50 L74,26 M50,50 L50,84 M50,50 L26,74 M50,50 L74,74" stroke="#95d5b2" strokeWidth="2" opacity="0.4" />
            <ellipse cx="34" cy="28" rx="14" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-20 34 28)" />
          </svg>
        );

      case 'yellow': // Star Lemon Drop
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
            <defs>
              <radialGradient id="yellow-grad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fff3b0" />
                <stop offset="30%" stopColor="#ffd166" />
                <stop offset="70%" stopColor="#f77f00" />
                <stop offset="100%" stopColor="#d62828" />
              </radialGradient>
            </defs>
            {/* Star Candy Outline */}
            <path
              d="M50,10 L61,34 L87,36 L67,54 L73,80 L50,67 L27,80 L33,54 L13,36 L39,34 Z"
              fill="url(#yellow-grad)"
              stroke="#ffe6a7"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <ellipse cx="44" cy="36" rx="12" ry="6" fill="#ffffff" opacity="0.5" transform="rotate(-25 44 36)" />
          </svg>
        );

      case 'purple': // Royal Grape Gumdrop
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
            <defs>
              <radialGradient id="purple-grad" cx="30%" cy="25%" r="75%">
                <stop offset="0%" stopColor="#c77dff" />
                <stop offset="35%" stopColor="#9d4edd" />
                <stop offset="75%" stopColor="#5a189a" />
                <stop offset="100%" stopColor="#240046" />
              </radialGradient>
            </defs>
            {/* Gumdrop Shape */}
            <path
              d="M50,14 C68,14 82,32 84,66 C85,76 76,84 64,84 L36,84 C24,84 15,76 16,66 C18,32 32,14 50,14 Z"
              fill="url(#purple-grad)"
              stroke="#e0aaff"
              strokeWidth="2.5"
            />
            {/* Swirl shine */}
            <path
              d="M40,24 C52,24 64,36 64,52"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.45"
            />
            <ellipse cx="38" cy="30" rx="9" ry="5" fill="#ffffff" opacity="0.4" />
          </svg>
        );

      case 'orange': // Tangerine Oval Bean
      default:
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
            <defs>
              <radialGradient id="orange-grad" cx="32%" cy="28%" r="68%">
                <stop offset="0%" stopColor="#ffb703" />
                <stop offset="45%" stopColor="#fb8500" />
                <stop offset="85%" stopColor="#e85d04" />
                <stop offset="100%" stopColor="#9d0208" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="50" rx="42" ry="32" fill="url(#orange-grad)" stroke="#ffb703" strokeWidth="2.5" transform="rotate(-18 50 50)" />
            <path
              d="M30,36 C42,26 62,26 72,36"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.4"
            />
            <ellipse cx="40" cy="38" rx="14" ry="6" fill="#ffffff" opacity="0.45" transform="rotate(-20 40 38)" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-150 ${
        isSelected ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]' : ''
      } ${isHint ? 'animate-candy-pulse' : ''}`}
      style={{ width: size, height: size }}
    >
      {renderCandyShape()}

      {/* Striped Candy Overlay */}
      {special === 'striped_h' && (
        <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 pointer-events-none">
          <line x1="16" y1="36" x2="84" y2="36" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
          <line x1="12" y1="50" x2="88" y2="50" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity="0.95" />
          <line x1="16" y1="64" x2="84" y2="64" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
        </svg>
      )}

      {special === 'striped_v' && (
        <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 pointer-events-none">
          <line x1="36" y1="16" x2="36" y2="84" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
          <line x1="50" y1="12" x2="50" y2="88" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity="0.95" />
          <line x1="64" y1="16" x2="64" y2="84" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
        </svg>
      )}

      {/* Wrapped Candy Cellophane Bow Wrapper Overlay */}
      {special === 'wrapped' && (
        <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 pointer-events-none">
          {/* Cellophane packaging corners with sparkling glow */}
          <polygon points="6,6 26,14 14,26" fill="#ffffff" opacity="0.75" />
          <polygon points="94,6 74,14 86,26" fill="#ffffff" opacity="0.75" />
          <polygon points="6,94 26,86 14,74" fill="#ffffff" opacity="0.75" />
          <polygon points="94,94 74,86 86,74" fill="#ffffff" opacity="0.75" />
          <rect x="22" y="22" width="56" height="56" rx="10" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.6" strokeDasharray="6 3" />
        </svg>
      )}
    </div>
  );
};

// Jelly Tile Component
export const JellyTileOverlay: React.FC<{ layers: number }> = ({ layers }) => {
  if (layers <= 0) return null;
  return (
    <div
      className={`absolute inset-0.5 rounded-xl pointer-events-none transition-all duration-300 ${
        layers >= 2
          ? 'bg-fuchsia-500/40 border-2 border-fuchsia-300 shadow-[inset_0_0_12px_rgba(217,70,239,0.5)]'
          : 'bg-pink-400/30 border border-pink-300/80 shadow-[inset_0_0_8px_rgba(244,114,182,0.4)]'
      }`}
    >
      <div className="absolute top-1 left-1 w-3 h-1.5 bg-white/60 rounded-full blur-[0.5px]" />
    </div>
  );
};
