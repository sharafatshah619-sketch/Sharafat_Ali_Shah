import React, { useRef } from 'react';
import { LIQUID_COLORS } from '../constants/colors';
import { TubeStyle } from '../types';
import { isTubeComplete } from '../utils/solver';

interface TubeProps {
  index: number;
  tube: string[];
  capacity?: number;
  isSelected: boolean;
  isHintSource?: boolean;
  isHintTarget?: boolean;
  isPouringSource?: boolean;
  isPouringTarget?: boolean;
  pourAngle?: number;
  pourShiftX?: number;
  pourShiftY?: number;
  styleType?: TubeStyle;
  disabled?: boolean;
  onClick: () => void;
  lang?: 'en' | 'hi';
}

export const Tube: React.FC<TubeProps> = ({
  index,
  tube,
  capacity = 4,
  isSelected,
  isHintSource = false,
  isHintTarget = false,
  isPouringSource = false,
  isPouringTarget = false,
  pourAngle = 0,
  pourShiftX = 0,
  pourShiftY = 0,
  styleType = 'test-tube',
  disabled = false,
  onClick,
  lang = 'en',
}) => {
  const containerRef = useRef<HTMLButtonElement>(null);
  const complete = isTubeComplete(tube, capacity);
  const isEmpty = tube.length === 0;

  // Visual tube dimensions
  const tubeHeight = 190; // px
  const tubeWidth = 52; // px

  // Calculate pouring transform
  let transformStyle = '';
  if (isPouringSource) {
    transformStyle = `translate(${pourShiftX}px, ${pourShiftY - 30}px) rotate(${pourAngle}deg)`;
  } else if (isSelected) {
    transformStyle = 'translateY(-24px) scale(1.03)';
  } else if (isHintSource) {
    transformStyle = 'translateY(-12px)';
  }

  // Border radius based on style
  const borderRadius =
    styleType === 'beaker'
      ? 'rounded-b-md rounded-t-sm'
      : styleType === 'potion'
      ? 'rounded-b-[24px] rounded-t-sm'
      : 'rounded-b-full rounded-t-sm';

  return (
    <div className="flex flex-col items-center select-none group">
      <button
        ref={containerRef}
        type="button"
        onClick={onClick}
        disabled={disabled || complete}
        aria-label={`Tube ${index + 1}: ${tube.length}/${capacity} units`}
        style={{
          transform: transformStyle,
          transition: isPouringSource
            ? 'transform 0.4s cubic-bezier(0.2, 0.8, 0.4, 1)'
            : 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s',
          width: `${tubeWidth}px`,
          height: `${tubeHeight}px`,
        }}
        className={`relative flex flex-col justify-end items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          disabled || complete ? 'cursor-default' : 'hover:brightness-105 active:scale-95'
        }`}
      >
        {/* Cork Stopper when tube is completed */}
        {complete && (
          <div
            className="absolute -top-4 z-30 flex flex-col items-center transition-all duration-300 animate-in fade-in slide-in-from-top-2"
            title={lang === 'hi' ? 'पूरा हुआ!' : 'Completed!'}
          >
            {/* Cork body */}
            <div className="w-8 h-3.5 bg-amber-800 rounded-t-md shadow-md border border-amber-900/60 relative">
              <div className="w-full h-1 bg-amber-700/60 rounded-t-sm" />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-950/40" />
            </div>
            <div className="w-6 h-2 bg-amber-900 rounded-b-sm shadow-inner" />
          </div>
        )}

        {/* Selection / Hint aura indicator */}
        {isSelected && (
          <div className="absolute -inset-2.5 rounded-full bg-cyan-400/20 blur-md pointer-events-none animate-pulse" />
        )}
        {isHintSource && !isSelected && (
          <div className="absolute -inset-2.5 rounded-full bg-amber-400/30 blur-md pointer-events-none animate-pulse" />
        )}
        {isHintTarget && (
          <div className="absolute -inset-2.5 rounded-full bg-emerald-400/30 blur-md pointer-events-none animate-pulse" />
        )}
        {complete && (
          <div className="absolute -inset-2 rounded-full bg-yellow-400/15 blur-lg pointer-events-none" />
        )}

        {/* Glass Lip / Mouth */}
        <div
          className={`absolute top-0 z-20 w-[58px] h-3 -mt-1 rounded-sm border-2 ${
            isSelected
              ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
              : isHintSource
              ? 'border-amber-400 bg-amber-950/30'
              : isHintTarget
              ? 'border-emerald-400 bg-emerald-950/30 animate-pulse'
              : complete
              ? 'border-amber-400/70 bg-amber-950/20 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
              : 'border-white/40 bg-white/5 backdrop-blur-xs'
          } glass-rim`}
        />

        {/* Main Glass Body */}
        <div
          className={`relative w-full h-[180px] overflow-hidden flex flex-col justify-end border-2 backdrop-blur-xs ${borderRadius} ${
            isSelected
              ? 'border-cyan-400/80 shadow-[0_0_16px_rgba(34,211,238,0.35)] bg-cyan-950/15'
              : isHintSource
              ? 'border-amber-400/90 shadow-[0_0_14px_rgba(251,191,36,0.4)] bg-amber-950/15'
              : isHintTarget
              ? 'border-emerald-400/90 shadow-[0_0_14px_rgba(52,211,153,0.4)] bg-emerald-950/15'
              : complete
              ? 'border-amber-300/60 shadow-[0_0_12px_rgba(252,211,77,0.25)] bg-yellow-950/10'
              : 'border-white/25 bg-white/[0.04] shadow-[inset_0_0_10px_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.3)]'
          }`}
        >
          {/* Glass Specular Reflection (vertical sheen) */}
          <div className="absolute inset-y-0 left-0.5 w-2 bg-gradient-to-r from-white/35 via-white/10 to-transparent pointer-events-none z-20 rounded-l-full" />
          <div className="absolute inset-y-0 right-1 w-1 bg-white/15 pointer-events-none z-20 rounded-r-full" />

          {/* Liquid Units */}
          <div className="w-full flex flex-col-reverse justify-start relative z-10">
            {tube.map((colorKey, layerIdx) => {
              const color = LIQUID_COLORS[colorKey] || {
                primary: '#6b7280',
                secondary: '#374151',
                highlight: '#9ca3af',
                glow: 'rgba(107, 114, 128, 0.4)',
              };

              const isTopLayer = layerIdx === tube.length - 1;
              const isBottomLayer = layerIdx === 0;

              return (
                <div
                  key={`${layerIdx}-${colorKey}`}
                  className="w-full relative transition-all duration-300 ease-out"
                  style={{
                    height: '38px',
                    backgroundColor: color.primary,
                    background: `linear-gradient(180deg, ${color.highlight} 0%, ${color.primary} 35%, ${color.secondary} 100%)`,
                    boxShadow: `inset 0 1px 3px rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.25)`,
                    borderBottomLeftRadius: isBottomLayer && styleType === 'test-tube' ? '24px' : undefined,
                    borderBottomRightRadius: isBottomLayer && styleType === 'test-tube' ? '24px' : undefined,
                  }}
                >
                  {/* Liquid meniscus on top layer */}
                  {isTopLayer && (
                    <div
                      className="absolute -top-1 inset-x-0 h-2.5 rounded-full pointer-events-none z-10"
                      style={{
                        backgroundColor: color.highlight,
                        background: `radial-gradient(ellipse at center, ${color.highlight} 0%, ${color.primary} 75%)`,
                        opacity: 0.9,
                      }}
                    />
                  )}

                  {/* Gentle wave ripple on top layer */}
                  {isTopLayer && (
                    <div
                      className="absolute inset-x-0 -top-0.5 h-1.5 opacity-40 animate-liquid-wave pointer-events-none"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  )}

                  {/* Internal gentle bubbles */}
                  <div
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/40 animate-bubble-rise pointer-events-none"
                    style={{
                      left: `${15 + ((layerIdx * 17) % 25)}px`,
                      bottom: '4px',
                      animationDelay: `${layerIdx * 0.4}s`,
                    }}
                  />
                  <div
                    className="absolute w-1 h-1 rounded-full bg-white/30 animate-bubble-rise pointer-events-none"
                    style={{
                      right: `${12 + ((layerIdx * 11) % 20)}px`,
                      bottom: '8px',
                      animationDelay: `${layerIdx * 0.6 + 0.3}s`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Liquid Splash / Impact Ripple when receiving liquid */}
          {isPouringTarget && (
            <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none z-20 flex justify-center items-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/70 animate-ping opacity-60" />
            </div>
          )}

          {/* Empty tube subtle measurement ticks */}
          {isEmpty && (
            <div className="absolute inset-0 flex flex-col justify-around py-3 px-1 pointer-events-none opacity-20">
              <div className="w-2.5 h-[1px] bg-white/60 ml-auto mr-1" />
              <div className="w-1.5 h-[1px] bg-white/40 ml-auto mr-1" />
              <div className="w-2.5 h-[1px] bg-white/60 ml-auto mr-1" />
              <div className="w-1.5 h-[1px] bg-white/40 ml-auto mr-1" />
            </div>
          )}
        </div>

        {/* Complete star sparkle badge */}
        {complete && (
          <div className="absolute -bottom-2 z-20 bg-amber-400 text-amber-950 text-[10px] font-black rounded-full px-1.5 py-0.5 shadow-md flex items-center gap-0.5 animate-bounce">
            ★
          </div>
        )}
      </button>

      {/* Tube Label / Number */}
      <div className="mt-2 text-xs font-semibold tracking-wider text-slate-400/80 transition-colors group-hover:text-slate-200">
        {index + 1}
      </div>
    </div>
  );
};
