import React, { useState } from 'react';
import { X, SlidersHorizontal, Play } from 'lucide-react';
import { Language } from '../types';

interface CustomLevelModalProps {
  isOpen: boolean;
  lang: Language;
  onGenerateCustom: (colorCount: number, emptyTubes: number) => void;
  onClose: () => void;
}

export const CustomLevelModal: React.FC<CustomLevelModalProps> = ({
  isOpen,
  lang,
  onGenerateCustom,
  onClose,
}) => {
  const [colors, setColors] = useState<number>(5);
  const [emptyTubes, setEmptyTubes] = useState<number>(2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-pink-400" />
            <span>{lang === 'hi' ? 'कस्टम पज़ल जनरेटर' : 'Custom Puzzle'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 py-4">
          {/* Number of Colors */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === 'hi' ? 'रंगों की संख्या' : 'Number of Colors'}
              </label>
              <span className="text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                {colors}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={9}
              value={colors}
              onChange={(e) => setColors(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>3 (Easy)</span>
              <span>6 (Medium)</span>
              <span>9 (Expert)</span>
            </div>
          </div>

          {/* Empty Flasks */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === 'hi' ? 'खाली ट्यूब्स की संख्या' : 'Empty Flasks'}
              </label>
              <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                {emptyTubes}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              value={emptyTubes}
              onChange={(e) => setEmptyTubes(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 (Very Tight)</span>
              <span>2 (Standard)</span>
              <span>3 (Relaxed)</span>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>{lang === 'hi' ? 'कुल ट्यूब्स:' : 'Total Flasks:'}</span>
            <span className="font-bold text-white text-sm">{colors + emptyTubes}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onGenerateCustom(colors, emptyTubes);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{lang === 'hi' ? 'नया पज़ल शुरू करें' : 'Generate & Play'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
