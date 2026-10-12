import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, RotateCw, Grid, Star } from 'lucide-react';
import { Language } from '../types';

interface WinModalProps {
  isOpen: boolean;
  levelId: number;
  moves: number;
  timeTakenSeconds: number;
  stars: number;
  lang: Language;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevelSelect: () => void;
}

function formatTimeTaken(totalSeconds: number, lang: Language): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) {
    return lang === 'hi' ? `${secs} सेकंड` : `${secs}s`;
  }
  return lang === 'hi' ? `${mins} मि. ${secs} से.` : `${mins}m ${secs}s`;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  levelId,
  moves,
  timeTakenSeconds,
  stars,
  lang,
  onNextLevel,
  onReplay,
  onOpenLevelSelect,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Confetti burst
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#06b6d4', '#3b82f6', '#ec4899', '#eab308', '#10b981'],
      });
      fire(0.2, {
        spread: 60,
        colors: ['#06b6d4', '#3b82f6', '#ec4899', '#eab308', '#10b981'],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#06b6d4', '#3b82f6', '#ec4899', '#eab308', '#10b981'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ['#06b6d4', '#3b82f6', '#ec4899', '#eab308', '#10b981'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#06b6d4', '#3b82f6', '#ec4899', '#eab308', '#10b981'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 p-6 text-center shadow-2xl shadow-cyan-900/50">
        {/* Glow ambient circle & celebratory particle halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-cyan-500/25 blur-2xl pointer-events-none" />
        <div className="absolute -inset-6 pointer-events-none -z-10 overflow-visible">
          <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-cyan-400 blur-[1px] animate-ping opacity-75" />
          <div className="absolute top-12 right-6 w-2.5 h-2.5 rounded-full bg-amber-400 blur-[1px] animate-pulse opacity-85" />
          <div className="absolute bottom-20 left-4 w-2 h-2 rounded-full bg-pink-400 blur-[1px] animate-bounce opacity-80" />
          <div className="absolute bottom-8 right-8 w-3 h-3 rounded-full bg-emerald-400 blur-[1px] animate-ping opacity-70" />
          <div className="absolute -top-4 right-1/4 w-2 h-2 rounded-full bg-yellow-300 blur-[1px] animate-pulse opacity-90" />
        </div>

        {/* Trophy icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white mb-1">
          {lang === 'hi' ? 'शानदार जीत!' : 'Level Complete!'}
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          {lang === 'hi' ? `आपने स्तर ${levelId} सफलतापूर्वक पूरा किया!` : `You sorted all flasks in Level ${levelId}!`}
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`p-2 rounded-xl border transition-all duration-300 ${
                starIdx <= stars
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-400 shadow-md shadow-amber-500/20 scale-110'
                  : 'bg-white/5 border-white/10 text-slate-600'
              }`}
            >
              <Star className={`w-6 h-6 ${starIdx <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
            </div>
          ))}
        </div>

        {/* Move metrics */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-6 grid grid-cols-3 gap-1.5 text-center items-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
              {lang === 'hi' ? 'कुल चालें' : 'Moves'}
            </div>
            <div className="text-lg sm:text-xl font-bold text-cyan-400">{moves}</div>
          </div>
          <div className="border-x border-white/10 px-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
              {lang === 'hi' ? 'समय' : 'Time'}
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
              {formatTimeTaken(timeTakenSeconds, lang)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
              {lang === 'hi' ? 'रेटिंग' : 'Rating'}
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-400">{stars} / 3 ★</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onNextLevel}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>{lang === 'hi' ? 'अगला स्तर' : 'Next Level'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onReplay}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'फिर खेलें' : 'Replay'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenLevelSelect}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'स्तर सूची' : 'Levels'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
