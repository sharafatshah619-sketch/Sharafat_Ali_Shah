import React from 'react';
import { RotateCcw, RotateCw, Lightbulb, PlusCircle, Volume2, VolumeX, Settings, Grid, HelpCircle, Timer } from 'lucide-react';
import { Language } from '../types';

interface GameHeaderProps {
  levelId: number;
  levelName?: string;
  moves: number;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  undoCount: number;
  canUndo: boolean;
  extraTubesAdded: number;
  maxExtraTubes?: number;
  isSoundMuted: boolean;
  lang: Language;
  onUndo: () => void;
  onRestart: () => void;
  onHint: () => void;
  onAddTube: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenLevelSelect: () => void;
  onOpenRules: () => void;
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  levelId,
  moves,
  elapsedSeconds,
  isTimerRunning,
  undoCount,
  canUndo,
  extraTubesAdded,
  maxExtraTubes = 2,
  isSoundMuted,
  lang,
  onUndo,
  onRestart,
  onHint,
  onAddTube,
  onToggleSound,
  onOpenSettings,
  onOpenLevelSelect,
  onOpenRules,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 backdrop-blur-md">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenLevelSelect}
          className="flex items-center gap-2 text-left group hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-cyan-500/20">
            💧
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              AquaSort
            </h1>
            <span className="text-[11px] text-cyan-400 font-medium tracking-wide">
              {lang === 'hi' ? 'वाटर पज़ल' : 'Water Color Puzzle'}
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Level status, Move count, and Real-time Timer (Clean unboxed metadata) */}
      <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
        <button
          type="button"
          onClick={onOpenLevelSelect}
          className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-1.5 transition-colors border border-white/10 text-xs sm:text-sm"
        >
          <Grid className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'hi' ? `स्तर ${levelId}` : `Level ${levelId}`}</span>
        </button>

        <span aria-hidden="true" className="text-slate-600">·</span>

        <span className="text-slate-300 text-xs sm:text-sm">
          <strong className="text-white font-semibold">{moves}</strong> {lang === 'hi' ? 'चालें' : 'Moves'}
        </span>

        <span aria-hidden="true" className="text-slate-600">·</span>

        <div
          className={`flex items-center gap-1.5 text-xs sm:text-sm font-mono tracking-wider transition-colors ${
            isTimerRunning ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
          title={isTimerRunning ? 'Timer running' : 'Timer starts on first move'}
        >
          <Timer className={`w-3.5 h-3.5 ${isTimerRunning ? 'animate-pulse text-cyan-400' : 'text-slate-500'}`} />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Zone 3: Functional interactive control actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Undo button */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title={lang === 'hi' ? 'चाल वापस लें (Undo)' : 'Undo Move'}
          className={`relative p-2 rounded-lg transition-colors border ${
            canUndo
              ? 'bg-white/10 hover:bg-white/15 text-white border-white/15 active:scale-95'
              : 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed opacity-50'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          {undoCount > 0 && (
            <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-cyan-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center">
              {undoCount}
            </span>
          )}
        </button>

        {/* Restart button */}
        <button
          type="button"
          onClick={onRestart}
          title={lang === 'hi' ? 'दोबारा शुरू करें' : 'Restart Level'}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors active:scale-95"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Hint button */}
        <button
          type="button"
          onClick={onHint}
          title={lang === 'hi' ? 'संकेत (Hint)' : 'Get Hint'}
          className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors active:scale-95 flex items-center gap-1"
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline text-xs font-semibold">{lang === 'hi' ? 'संकेत' : 'Hint'}</span>
        </button>

        {/* Add Extra Tube button */}
        <button
          type="button"
          onClick={onAddTube}
          disabled={extraTubesAdded >= maxExtraTubes}
          title={lang === 'hi' ? 'अतिरिक्त ट्यूब जोड़ें (+Flask)' : 'Add Extra Flask'}
          className={`p-2 rounded-lg transition-colors border flex items-center gap-1 ${
            extraTubesAdded < maxExtraTubes
              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 active:scale-95'
              : 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed opacity-50'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline text-xs font-semibold">
            {extraTubesAdded > 0 ? `+${maxExtraTubes - extraTubesAdded}` : '+Tube'}
          </span>
        </button>

        {/* Rules button */}
        <button
          type="button"
          onClick={onOpenRules}
          title={lang === 'hi' ? 'नियम और सहायता' : 'How to Play'}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 border border-white/15 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 border border-white/15 transition-colors"
        >
          {isSoundMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title={lang === 'hi' ? 'सेटिंग्स' : 'Settings & Themes'}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 border border-white/15 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
