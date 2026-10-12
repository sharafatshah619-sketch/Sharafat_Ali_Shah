import React from 'react';
import { X, HelpCircle, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface RulesModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, lang, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'hi' ? 'कैसे खेलें? (नियम)' : 'How to Play (Rules)'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 py-4 text-xs sm:text-sm text-slate-300">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div>
              <strong className="text-white block mb-0.5">
                {lang === 'hi' ? 'ट्यूब चुनें' : 'Select a Flask'}
              </strong>
              <p className="text-slate-400">
                {lang === 'hi'
                  ? 'किसी भी ट्यूब पर टैप करें जिसे आप उठाना चाहते हैं।'
                  : 'Tap any flask to lift it into pouring position.'}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </div>
            <div>
              <strong className="text-white block mb-0.5">
                {lang === 'hi' ? 'रंग मिलाकर पानी डालें' : 'Match Top Colors to Pour'}
              </strong>
              <p className="text-slate-400">
                {lang === 'hi'
                  ? 'आप पानी तभी डाल सकते हैं जब दूसरी ट्यूब का ऊपरी रंग वही हो, या वह पूरी तरह खाली हो और उसमें जगह हो।'
                  : 'You can only pour water if the destination flask has the same top color or is completely empty, and has enough room (up to 4 units).'}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </div>
            <div>
              <strong className="text-white block mb-0.5">
                {lang === 'hi' ? 'जीत का नियम' : 'Winning Goal'}
              </strong>
              <p className="text-slate-400">
                {lang === 'hi'
                  ? 'जब प्रत्येक ट्यूब में केवल एक ही रंग का 4 यूनिट पानी भर जाएगा, तो ट्यूब कॉर्क से सील हो जाएगी और आप जीत जाएंगे!'
                  : 'When all flasks are sorted so that each flask contains 4 units of a single color (or is completely empty), you win!'}
              </p>
            </div>
          </div>

          {/* Boosters & Helpers */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">
                {lang === 'hi' ? 'अटक जाने पर क्या करें?' : 'Stuck? Use Helpful Boosters'}
              </strong>
              <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                <li>
                  <strong>Undo (वापस):</strong> {lang === 'hi' ? 'पिछली चाल को वापस लें।' : 'Reverse your last move.'}
                </li>
                <li>
                  <strong>Hint (संकेत):</strong> {lang === 'hi' ? 'अगली सबसे अच्छी चाल देखें।' : 'Reveals the optimal next move.'}
                </li>
                <li>
                  <strong>+Tube (+ट्यूब):</strong>{' '}
                  {lang === 'hi'
                    ? 'अतिरिक्त खाली ट्यूब जोड़कर पहेली को आसान बनाएं।'
                    : 'Add a fresh empty flask to unlock new sorting possibilities.'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Got it button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition-colors"
        >
          {lang === 'hi' ? 'समझ गया, खेल शुरू करें!' : 'Got it, Let’s Play!'}
        </button>
      </div>
    </div>
  );
};
