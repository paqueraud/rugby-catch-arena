import React from 'react';
import { FruitKind, ItemType } from '../types/game';

interface DistractorItemProps {
  type: ItemType;
  fruitKind?: FruitKind;
  rotation: number;
  isClicked: boolean;
  size?: number;
}

export const DistractorItem: React.FC<DistractorItemProps> = ({
  type,
  fruitKind = 'banana',
  rotation,
  isClicked,
  size = 62,
}) => {
  if (type === 'mine') {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transform: `rotate(${rotation}deg) scale(${isClicked ? 0 : 1})`,
          transition: isClicked ? 'transform 0.15s ease-out, opacity 0.15s' : 'none',
          opacity: isClicked ? 0 : 1,
        }}
        className="relative cursor-pointer select-none drop-shadow-[0_0_16px_rgba(239,68,68,0.7)] touch-none"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <radialGradient id="mineMetal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="60%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#090D16" />
            </radialGradient>
            <radialGradient id="mineCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="60%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </radialGradient>
          </defs>

          {/* Spikes / Horns */}
          <polygon points="50,6 44,22 56,22" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="50,94 44,78 56,78" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="6,50 22,44 22,56" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="94,50 78,44 78,56" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />

          {/* Diagonal spikes */}
          <polygon points="18,18 32,24 24,32" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="82,18 68,24 76,32" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="18,82 32,76 24,68" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="82,82 68,76 76,68" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />

          {/* Main mine sphere */}
          <circle cx="50" cy="50" r="32" fill="url(#mineMetal)" stroke="#0F172A" strokeWidth="2.5" />

          {/* Glowing Red Warning Core */}
          <circle cx="50" cy="50" r="16" fill="url(#mineCore)">
            <animate attributeName="r" values="14;17;14" dur="0.8s" repeatCount="indefinite" />
          </circle>

          {/* Hazard skull or bolt symbol */}
          <circle cx="50" cy="50" r="8" fill="#FEF08A" opacity="0.9" />
          <line x1="50" y1="44" x2="50" y2="52" stroke="#7F1D1D" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="55" r="1" fill="#7F1D1D" />
        </svg>

        {/* Danger blinking ring */}
        <span className="absolute -inset-1 rounded-full border-2 border-red-500/80 animate-ping opacity-60 pointer-events-none" />
      </div>
    );
  }

  // Fruits
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotation}deg) scale(${isClicked ? 0 : 1})`,
        transition: isClicked ? 'transform 0.15s ease-out, opacity 0.15s' : 'none',
        opacity: isClicked ? 0 : 1,
      }}
      className="relative cursor-pointer select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] flex items-center justify-center touch-none"
    >
      {fruitKind === 'banana' && (
        <span className="text-4xl filter drop-shadow hover:scale-110 transition-transform">🍌</span>
      )}
      {fruitKind === 'watermelon' && (
        <span className="text-4xl filter drop-shadow hover:scale-110 transition-transform">🍉</span>
      )}
      {fruitKind === 'orange' && (
        <span className="text-4xl filter drop-shadow hover:scale-110 transition-transform">🍊</span>
      )}
      {fruitKind === 'apple' && (
        <span className="text-4xl filter drop-shadow hover:scale-110 transition-transform">🍎</span>
      )}
    </div>
  );
};
