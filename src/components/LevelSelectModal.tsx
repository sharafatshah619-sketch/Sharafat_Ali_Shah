import React, { useState } from 'react';
import { X, Star, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Language } from '../types';
import { TOTAL_LEVELS } from '../utils/levels';

interface LevelSelectModalProps {
  isOpen: boolean;
  currentLevel: number;
  completedLevels: Record<number, { stars: number; moves: number }>;
  lang: Language;
  onSelectLevel: (levelId: number) => void;
  onOpenCustomGame: () => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  currentLevel,
  completedLevels,
  lang,
  onSelectLevel,
  onOpenCustomGame,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0); // 0: 1-15, 1: 16-30, 2: 31-45, 3: 46-60
  const pageSize = 15;
  const tabsCount = Math.ceil(TOTAL_LEVELS / pageSize);

  if (!isOpen) return null;

  const startLevel = activeTab * pageSize + 1;
  const endLevel = Math.min((activeTab + 1) * pageSize, TOTAL_LEVELS);
  const levelsToShow = Array.from({ length: endLevel - startLevel + 1 }, (_, i) => startLevel + i);

  const totalStarsWon = Object.values(completedLevels).reduce((acc, curr) => acc + (curr.stars || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{lang === 'hi' ? 'स्तर चुनें' : 'Select Level'}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-300" />
                {totalStarsWon} / {TOTAL_LEVELS * 3}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'hi' ? 'कुल 60 स्तर उपलब्ध हैं' : 'Choose any level to challenge your mind'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pagination */}
        <div className="flex items-center gap-1.5 py-3 border-b border-white/5 overflow-x-auto">
          {Array.from({ length: tabsCount }).map((_, idx) => {
            const rangeStart = idx * pageSize + 1;
            const rangeEnd = Math.min((idx + 1) * pageSize, TOTAL_LEVELS);
            const isActive = activeTab === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {rangeStart} - {rangeEnd}
              </button>
            );
          })}
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-5 gap-2.5 py-4 overflow-y-auto pr-1">
          {levelsToShow.map((lvl) => {
            const isCurrent = lvl === currentLevel;
            const record = completedLevels[lvl];
            const isCompleted = !!record;
            const stars = record ? record.stars : 0;

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  onSelectLevel(lvl);
                  onClose();
                }}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center aspect-square ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400/30'
                    : isCompleted
                    ? 'bg-white/5 border-emerald-500/40 text-white hover:bg-white/10'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-base font-bold">{lvl}</span>

                {/* Stars display */}
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-2.5 h-2.5 ${
                        s <= stars
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer with Custom Puzzle generator button */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCustomGame();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/40 hover:to-pink-600/40 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
            <span>{lang === 'hi' ? 'कस्टम पज़ल बनाएँ' : 'Create Custom Puzzle'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
