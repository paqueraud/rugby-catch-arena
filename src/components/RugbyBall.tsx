import React from 'react';

interface RugbyBallProps {
  rotation: number;
  isClicked: boolean;
  size?: number;
}

export const RugbyBall: React.FC<RugbyBallProps> = ({ rotation, isClicked, size = 82 }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size * 0.68}px`,
        transform: `rotate(${rotation}deg) scale(${isClicked ? 0 : 1})`,
        transition: isClicked ? 'transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.18s' : 'none',
        opacity: isClicked ? 0 : 1,
      }}
      className="relative cursor-pointer select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] hover:scale-110 active:scale-95 touch-none"
    >
      {/* Invisible padding for easy touch tapping on mobile & tablet */}
      <div className="absolute -inset-3" />
      <svg
        viewBox="0 0 100 65"
        className="w-full h-full filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Leather Gradient */}
          <linearGradient id="rugbyLeatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C26A25" />
            <stop offset="40%" stopColor="#964414" />
            <stop offset="70%" stopColor="#78340F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* White Stripe Gradient */}
          <linearGradient id="whiteStripeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.8" />
          </linearGradient>

          {/* Golden Sheen */}
          <linearGradient id="goldSheen" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Rugby Ball Body (Ellipse with pointed ends) */}
        <path
          d="M 5,32.5 C 18,7 82,7 95,32.5 C 82,58 18,58 5,32.5 Z"
          fill="url(#rugbyLeatherGrad)"
          stroke="#451A03"
          strokeWidth="1.8"
        />

        {/* Top & Bottom Accent Curves (Official Match Ball Stripes) */}
        <path
          d="M 18,17 C 28,12 72,12 82,17 C 76,22 24,22 18,17 Z"
          fill="url(#whiteStripeGrad)"
          opacity="0.9"
        />
        <path
          d="M 18,48 C 28,53 72,53 82,48 C 76,43 24,43 18,48 Z"
          fill="url(#whiteStripeGrad)"
          opacity="0.9"
        />

        {/* Center Seam */}
        <path
          d="M 5,32.5 Q 50,33 95,32.5"
          stroke="#291205"
          strokeWidth="1.6"
          strokeDasharray="1.5 1"
        />

        {/* Central Laces (Coutures blanches) */}
        <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
          {/* Main vertical lace base */}
          <line x1="50" y1="21" x2="50" y2="44" stroke="#CBD5E1" strokeWidth="2.5" />
          {/* Cross stitches */}
          <line x1="42" y1="24" x2="58" y2="24" />
          <line x1="40" y1="29.5" x2="60" y2="29.5" />
          <line x1="40" y1="35.5" x2="60" y2="35.5" />
          <line x1="42" y1="41" x2="58" y2="41" />
        </g>

        {/* Highlight Overlay */}
        <path
          d="M 8,30 C 20,12 80,12 92,30"
          stroke="url(#goldSheen)"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Pulsing Target Indicator / Ring */}
      <span className="absolute -inset-1.5 rounded-full border border-amber-400/40 animate-ping pointer-events-none opacity-40" />
    </div>
  );
};
