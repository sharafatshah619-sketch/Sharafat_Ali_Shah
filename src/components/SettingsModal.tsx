import React from 'react';
import { X, Palette, FlaskConical, Volume2, Globe, Trash2 } from 'lucide-react';
import { Language, ThemeId, TubeStyle } from '../types';
import { THEMES } from '../constants/colors';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  theme: ThemeId;
  tubeStyle: TubeStyle;
  isSoundMuted: boolean;
  lang: Language;
  onSelectTheme: (theme: ThemeId) => void;
  onSelectTubeStyle: (style: TubeStyle) => void;
  onToggleSound: () => void;
  onToggleLang: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  theme,
  tubeStyle,
  isSoundMuted,
  lang,
  onSelectTheme,
  onSelectTubeStyle,
  onToggleSound,
  onToggleLang,
  onResetProgress,
  onClose,
}) => {
  if (!isOpen) return null;

  const tubeStylesList: { id: TubeStyle; nameEn: string; nameHi: string; icon: string }[] = [
    { id: 'test-tube', nameEn: 'Test Tube', nameHi: 'टेस्ट ट्यूब', icon: '🧪' },
    { id: 'potion', nameEn: 'Potion Bottle', nameHi: 'पोशन फ्लास्क', icon: '⚗️' },
    { id: 'beaker', nameEn: 'Lab Beaker', nameHi: 'बीकर', icon: '🥛' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'hi' ? 'सेटिंग्स और थीम्स' : 'Settings & Themes'}</span>
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
          {/* Language Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              <Globe className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
              {lang === 'hi' ? 'भाषा (Language)' : 'Language'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => lang !== 'en' && onToggleLang()}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors ${
                  lang === 'en'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => lang !== 'hi' && onToggleLang()}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors ${
                  lang === 'hi'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          {/* Background Theme Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              {lang === 'hi' ? 'पृष्ठभूमि थीम' : 'Background Theme'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(THEMES).map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTheme(t.id as ThemeId)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-white/10 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/40'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs font-semibold">
                      {lang === 'hi' ? t.nameHi : t.nameEn}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: t.accentHex }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tube Glassware Style Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              <FlaskConical className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
              {lang === 'hi' ? 'फ्लास्क स्टाइल' : 'Flask & Vial Style'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {tubeStylesList.map((s) => {
                const isActive = tubeStyle === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectTubeStyle(s.id)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="text-xl mb-1">{s.icon}</div>
                    <span className="text-[11px] font-semibold block truncate">
                      {lang === 'hi' ? s.nameHi : s.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Audio Toggle with Test Button */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              <Volume2 className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
              {lang === 'hi' ? 'ध्वनि प्रभाव (Audio)' : 'Sound Effects'}
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs font-medium text-slate-300">
                {isSoundMuted
                  ? lang === 'hi' ? 'ध्वनि म्यूट है' : 'Audio is Muted'
                  : lang === 'hi' ? 'ध्वनि चालू है' : 'Audio is Enabled'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => sound.playClink(1.2)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-semibold text-slate-200 border border-white/10"
                >
                  {lang === 'hi' ? 'टेस्ट करें' : 'Test Ring'}
                </button>
                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    !isSoundMuted
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {isSoundMuted ? (lang === 'hi' ? 'चालू करें' : 'Unmute') : (lang === 'hi' ? 'म्यूट' : 'Mute')}
                </button>
              </div>
            </div>
          </div>

          {/* Reset progress */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(lang === 'hi' ? 'क्या आप वाकई अपना सारा गेम प्रोग्रेस रीसेट करना चाहते हैं?' : 'Are you sure you want to reset all game stars & progress?')) {
                  onResetProgress();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'प्रोग्रेस रीसेट करें' : 'Reset All Progress'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
