import React from 'react';
import { LIQUID_COLORS } from '../constants/colors';

interface PourStreamProps {
  sourcePos: { x: number; y: number } | null;
  targetPos: { x: number; y: number } | null;
  colorId: string;
}

export const PourStream: React.FC<PourStreamProps> = ({ sourcePos, targetPos, colorId }) => {
  if (!sourcePos || !targetPos) return null;

  const color = LIQUID_COLORS[colorId] || {
    primary: '#06b6d4',
    secondary: '#0891b2',
    highlight: '#a5f3fc',
  };

  const sx = sourcePos.x;
  const sy = sourcePos.y;
  const tx = targetPos.x;
  const ty = targetPos.y;

  // Bezier control point creates a natural cascading stream arc
  const midX = (sx + tx) / 2;
  const arcHeight = Math.min(sy, ty) - 25;
  const pathD = `M ${sx} ${sy} Q ${midX} ${arcHeight} ${tx} ${ty}`;

  return (
    <svg
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="streamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color.highlight} />
          <stop offset="50%" stopColor={color.primary} />
          <stop offset="100%" stopColor={color.secondary} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer fluid stream glow */}
      <path
        d={pathD}
        fill="none"
        stroke={color.primary}
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.45"
        filter="url(#glow)"
      />

      {/* Main core liquid stream with flowing dash */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#streamGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        className="animate-stream-flow"
      />

      {/* Core highlight stream */}
      <path
        d={pathD}
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Splash impact droplets at target mouth */}
      <circle cx={tx} cy={ty} r="5" fill={color.highlight} opacity="0.8" className="animate-ping" />
      <circle cx={tx - 4} cy={ty - 3} r="2.5" fill={color.primary} />
      <circle cx={tx + 5} cy={ty - 2} r="2" fill={color.highlight} />
    </svg>
  );
};
