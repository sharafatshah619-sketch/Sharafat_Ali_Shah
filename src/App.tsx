/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tube } from './components/Tube';
import { PourStream } from './components/PourStream';
import { GameHeader } from './components/GameHeader';
import { WinModal } from './components/WinModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { RulesModal } from './components/RulesModal';
import { CustomLevelModal } from './components/CustomLevelModal';
import { ParticleExplosion } from './components/ParticleExplosion';
import { THEMES, LIQUID_COLORS } from './constants/colors';
import {
  Language,
  ThemeId,
  TubeStyle,
  MoveRecord,
  HintStep,
} from './types';
import {
  canPour,
  executePour,
  isGameWon,
  isTubeComplete,
  findNextHint,
  hasPossibleMoves,
} from './utils/solver';
import { getLevelConfig, generateSolvableLevel, TOTAL_LEVELS } from './utils/levels';
import { sound } from './utils/audio';

export default function App() {
  // Game Configuration State
  const [levelId, setLevelId] = useState<number>(1);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [tubes, setTubes] = useState<string[][]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const [extraTubesAdded, setExtraTubesAdded] = useState<number>(0);
  const [history, setHistory] = useState<MoveRecord[]>([]);

  // Real-time Timer State (starts on first move)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [finalTimeSeconds, setFinalTimeSeconds] = useState<number>(0);
  const elapsedRef = useRef<number>(0);

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Interval timer tick
  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Pouring Animation State
  const [pouringSource, setPouringSource] = useState<number | null>(null);
  const [pouringTarget, setPouringTarget] = useState<number | null>(null);
  const [pouringColor, setPouringColor] = useState<string | null>(null);
  const [streamPositions, setStreamPositions] = useState<{
    sourcePos: { x: number; y: number } | null;
    targetPos: { x: number; y: number } | null;
  }>({ sourcePos: null, targetPos: null });
  const [pourTransform, setPourTransform] = useState<{
    angle: number;
    shiftX: number;
    shiftY: number;
  }>({ angle: 0, shiftX: 0, shiftY: 0 });

  // Hint State
  const [activeHint, setActiveHint] = useState<HintStep | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Modals & User Settings
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  // Victory particle explosion effect state
  const [isExploding, setIsExploding] = useState<boolean>(false);
  const [explosionPositions, setExplosionPositions] = useState<{ x: number; y: number; color?: string }[]>([]);

  const [theme, setTheme] = useState<ThemeId>('ocean');
  const [tubeStyle, setTubeStyle] = useState<TubeStyle>('test-tube');
  const [lang, setLang] = useState<Language>('en');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Persistence: Completed levels & stars
  const [completedLevels, setCompletedLevels] = useState<
    Record<number, { stars: number; moves: number }>
  >({});

  const tubeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const showToast = useCallback((msg: string, duration: number = 3000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, []);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedLevel = localStorage.getItem('aquasort_level');
      if (savedLevel) setLevelId(parseInt(savedLevel, 10));

      const savedTheme = localStorage.getItem('aquasort_theme') as ThemeId;
      if (savedTheme && THEMES[savedTheme]) setTheme(savedTheme);

      const savedStyle = localStorage.getItem('aquasort_tube_style') as TubeStyle;
      if (savedStyle) setTubeStyle(savedStyle);

      const savedLang = localStorage.getItem('aquasort_lang') as Language;
      if (savedLang) setLang(savedLang);

      const savedProgress = localStorage.getItem('aquasort_progress');
      if (savedProgress) setCompletedLevels(JSON.parse(savedProgress));

      setIsMuted(sound.getMuted());
    } catch {
      // Fallback to defaults
    }
  }, []);

  // Load level tubes whenever levelId changes (unless custom mode is active)
  const initLevel = useCallback(
    (lvl: number) => {
      const config = getLevelConfig(lvl);
      // Deep clone tubes array
      setTubes(config.tubes.map((t) => [...t]));
      setSelectedTube(null);
      setMoves(0);
      setExtraTubesAdded(0);
      setHistory([]);
      setActiveHint(null);
      setIsWinModalOpen(false);
      setIsCustomMode(false);
      setIsTimerRunning(false);
      setElapsedSeconds(0);
      setFinalTimeSeconds(0);
      setIsExploding(false);
      setExplosionPositions([]);
      localStorage.setItem('aquasort_level', lvl.toString());
    },
    []
  );

  useEffect(() => {
    if (!isCustomMode) {
      initLevel(levelId);
    }
  }, [levelId, isCustomMode, initLevel]);

  // Handle pouring action
  const handlePour = (fromIdx: number, toIdx: number) => {
    if (pouringSource !== null) return; // Prevent double trigger during animation

    const check = canPour(tubes, fromIdx, toIdx, 4);
    if (!check.valid || check.units <= 0) {
      sound.playError();
      showToast(
        lang === 'hi'
          ? 'यहाँ पानी नहीं डाला जा सकता! ऊपरी रंग मिलना चाहिए।'
          : 'Cannot pour here! Colors must match or flask must be empty.'
      );
      return;
    }

    // Start timer on first move if not already running
    setIsTimerRunning(true);

    const sourceElem = tubeRefs.current[fromIdx];
    const targetElem = tubeRefs.current[toIdx];

    // Compute pouring angle and offset
    let angle = 65;
    let shiftX = 20;
    let shiftY = -20;

    if (sourceElem && targetElem) {
      const sRect = sourceElem.getBoundingClientRect();
      const tRect = targetElem.getBoundingClientRect();

      const isTargetOnLeft = tRect.left < sRect.left;
      angle = isTargetOnLeft ? -65 : 65;
      shiftX = (tRect.left - sRect.left) * 0.45;
      shiftY = Math.min(-30, (tRect.top - sRect.top) - 20);

      // Coordinates for liquid stream
      const sMouth = {
        x: isTargetOnLeft ? sRect.left + 5 : sRect.right - 5,
        y: sRect.top + 10,
      };
      const tMouth = {
        x: tRect.left + tRect.width / 2,
        y: tRect.top + 8,
      };

      setStreamPositions({ sourcePos: sMouth, targetPos: tMouth });
    }

    const topColor = tubes[fromIdx][tubes[fromIdx].length - 1];
    setPourTransform({ angle, shiftX, shiftY });
    setPouringSource(fromIdx);
    setPouringTarget(toIdx);
    setPouringColor(topColor);

    sound.playPour(0.45);

    // After animation frame: update tube contents
    setTimeout(() => {
      const result = executePour(tubes, fromIdx, toIdx, 4);
      if (!result) return;

      // Record move for Undo
      setHistory((prev) => [
        ...prev,
        {
          fromTube: fromIdx,
          toTube: toIdx,
          colorId: result.colorId,
          units: result.units,
          previousState: tubes.map((t) => [...t]),
        },
      ]);

      const nextTubes = result.newTubes;
      setTubes(nextTubes);
      setMoves((m) => m + 1);

      // Check if target tube was completed
      if (isTubeComplete(nextTubes[toIdx], 4)) {
        sound.playCompleteTube();
      }

      // Check win condition
      if (isGameWon(nextTubes, 4)) {
        setIsTimerRunning(false);
        const timeTaken = elapsedRef.current;
        setFinalTimeSeconds(timeTaken);
        sound.playWinFanfare();

        // Calculate tube coordinates for celebratory particle explosions
        const positions: { x: number; y: number; color?: string }[] = [];
        tubeRefs.current.forEach((el, idx) => {
          if (el && nextTubes[idx]?.length > 0) {
            const rect = el.getBoundingClientRect();
            const colorId = nextTubes[idx][0];
            const colorHex = LIQUID_COLORS[colorId]?.primary || '#38bdf8';
            positions.push({
              x: rect.left + rect.width / 2,
              y: rect.top + 20,
              color: colorHex,
            });
          }
        });
        setExplosionPositions(positions);
        setIsExploding(true);

        // Calculate stars
        const optimal = Math.max(8, (nextTubes.length - 2) * 4);
        let starsWon = 3;
        if (moves + 1 > optimal + 8) starsWon = 1;
        else if (moves + 1 > optimal + 3) starsWon = 2;

        if (!isCustomMode) {
          const updated = {
            ...completedLevels,
            [levelId]: {
              stars: Math.max(completedLevels[levelId]?.stars || 0, starsWon),
              moves: Math.min(completedLevels[levelId]?.moves || 999, moves + 1),
            },
          };
          setCompletedLevels(updated);
          localStorage.setItem('aquasort_progress', JSON.stringify(updated));
        }

        setTimeout(() => {
          setIsWinModalOpen(true);
        }, 500);
      } else {
        // Check if player is deadlocked
        if (!hasPossibleMoves(nextTubes, 4)) {
          showToast(
            lang === 'hi'
              ? 'कोई चाल नहीं बची! Undo या +Tube दबाएँ।'
              : 'No moves left! Use Undo or +Tube to continue.'
          );
        }
      }

      // Reset animation state
      setPouringSource(null);
      setPouringTarget(null);
      setPouringColor(null);
      setStreamPositions({ sourcePos: null, targetPos: null });
      setSelectedTube(null);
      setActiveHint(null);
    }, 400);
  };

  // Tube click handler
  const handleTubeClick = (index: number) => {
    if (pouringSource !== null) return;

    // 1. If no tube is currently selected
    if (selectedTube === null) {
      if (tubes[index].length === 0) {
        sound.playClink(0.7);
        return; // Cannot pick up an empty tube
      }
      if (isTubeComplete(tubes[index], 4)) {
        sound.playClink(1.3);
        return; // Completed tube is sealed
      }
      setSelectedTube(index);
      sound.playClink(1.0);
    }
    // 2. If same tube is clicked again: deselect
    else if (selectedTube === index) {
      setSelectedTube(null);
      sound.playClink(0.85);
    }
    // 3. If another tube is clicked: attempt pour
    else {
      const check = canPour(tubes, selectedTube, index, 4);
      if (check.valid) {
        handlePour(selectedTube, index);
      } else {
        // If clicking on another non-empty, non-complete tube, shift selection to it
        if (tubes[index].length > 0 && !isTubeComplete(tubes[index], 4)) {
          setSelectedTube(index);
          sound.playClink(1.05);
        } else {
          sound.playError();
          showToast(
            lang === 'hi'
              ? 'यहाँ पानी नहीं डाला जा सकता! ऊपरी रंग मिलना चाहिए।'
              : 'Cannot pour here! Colors must match or destination must be empty.'
          );
        }
      }
    }
  };

  // Undo move
  const handleUndo = () => {
    if (history.length === 0 || pouringSource !== null) return;
    const lastMove = history[history.length - 1];
    setTubes(lastMove.previousState);
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    setSelectedTube(null);
    setActiveHint(null);
    sound.playUndo();
    if (newHistory.length === 0) {
      // Reverted all moves back to start
      setIsTimerRunning(false);
      setElapsedSeconds(0);
      setFinalTimeSeconds(0);
    }
    showToast(lang === 'hi' ? 'चाल वापस ली गई' : 'Move Undone');
  };

  // Restart current level
  const handleRestart = () => {
    setIsTimerRunning(false);
    setElapsedSeconds(0);
    setFinalTimeSeconds(0);
    setIsExploding(false);
    setExplosionPositions([]);
    if (isCustomMode) {
      // Re-initialize custom level
      setSelectedTube(null);
      setMoves(0);
      setExtraTubesAdded(0);
      setHistory([]);
      setActiveHint(null);
      sound.playUndo();
    } else {
      initLevel(levelId);
      sound.playUndo();
    }
    showToast(lang === 'hi' ? 'स्तर पुनः प्रारंभ हुआ' : 'Level Restarted');
  };

  // Hint
  const handleHint = () => {
    sound.playHint();
    const hint = findNextHint(tubes, 4);
    if (hint) {
      setActiveHint(hint);
      showToast(
        lang === 'hi'
          ? `संकेत: ट्यूब ${hint.fromIndex + 1} से ट्यूब ${hint.toIndex + 1} में डालें`
          : `Hint: Pour from Flask ${hint.fromIndex + 1} into Flask ${hint.toIndex + 1}`,
        5000
      );
    } else {
      showToast(
        lang === 'hi'
          ? 'कोई चाल संभव नहीं है! Undo या +Tube का उपयोग करें।'
          : 'No valid solution from here! Tap Undo or +Tube to unlock.'
      );
    }
  };

  // Add Extra Tube booster
  const handleAddTube = () => {
    if (extraTubesAdded >= 2) return;
    setTubes((prev) => [...prev, []]);
    setExtraTubesAdded((c) => c + 1);
    sound.playCorkPop();
    showToast(
      lang === 'hi' ? '+1 अतिरिक्त खाली फ्लास्क जोड़ा गया!' : '+1 Extra Empty Flask added!'
    );
  };

  // Sound toggle
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    showToast(
      muted
        ? lang === 'hi' ? 'ध्वनि म्यूट' : 'Sound Muted'
        : lang === 'hi' ? 'ध्वनि चालू' : 'Sound Enabled'
    );
  };

  // Theme selection
  const handleSelectTheme = (newTheme: ThemeId) => {
    setTheme(newTheme);
    localStorage.setItem('aquasort_theme', newTheme);
  };

  // Tube style selection
  const handleSelectTubeStyle = (newStyle: TubeStyle) => {
    setTubeStyle(newStyle);
    localStorage.setItem('aquasort_tube_style', newStyle);
  };

  // Language toggle
  const handleToggleLang = () => {
    const nextLang: Language = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    localStorage.setItem('aquasort_lang', nextLang);
  };

  // Reset progress
  const handleResetProgress = () => {
    setCompletedLevels({});
    localStorage.removeItem('aquasort_progress');
    setLevelId(1);
    initLevel(1);
    setIsSettingsOpen(false);
    showToast(lang === 'hi' ? 'प्रोग्रेस रीसेट कर दिया गया' : 'Progress Reset Successfully');
  };

  // Custom level generator
  const handleGenerateCustom = (colorCount: number, emptyCount: number) => {
    const customTubes = generateSolvableLevel(colorCount, emptyCount, 55, Date.now());
    setTubes(customTubes);
    setSelectedTube(null);
    setMoves(0);
    setExtraTubesAdded(0);
    setHistory([]);
    setActiveHint(null);
    setIsCustomMode(true);
    setIsTimerRunning(false);
    setElapsedSeconds(0);
    setFinalTimeSeconds(0);
    setIsExploding(false);
    setExplosionPositions([]);
    showToast(
      lang === 'hi'
        ? `कस्टम पज़ल: ${colorCount} रंग, ${emptyCount} खाली ट्यूब`
        : `Custom Puzzle: ${colorCount} Colors, ${emptyCount} Empty Flasks`
    );
  };

  // Next level handler
  const handleNextLevel = () => {
    setIsWinModalOpen(false);
    setIsTimerRunning(false);
    setElapsedSeconds(0);
    setFinalTimeSeconds(0);
    setIsExploding(false);
    setExplosionPositions([]);
    if (levelId < TOTAL_LEVELS) {
      setLevelId((l) => l + 1);
    } else {
      showToast(
        lang === 'hi'
          ? 'बधाई हो! आपने सभी 60 स्तर पार कर लिए हैं!'
          : 'Congratulations! You beat all 60 levels!'
      );
      setIsLevelSelectOpen(true);
    }
  };

  const currentTheme = THEMES[theme] || THEMES.ocean;

  // Split tubes into 2 balanced rows if there are more than 5 tubes
  const totalTubes = tubes.length;
  let topRow: { tube: string[]; index: number }[] = [];
  let bottomRow: { tube: string[]; index: number }[] = [];

  if (totalTubes <= 5) {
    topRow = tubes.map((t, idx) => ({ tube: t, index: idx }));
  } else {
    const half = Math.ceil(totalTubes / 2);
    topRow = tubes.slice(0, half).map((t, idx) => ({ tube: t, index: idx }));
    bottomRow = tubes.slice(half).map((t, idx) => ({ tube: t, index: half + idx }));
  }

  // Level completion progress: completed tubes relative to required color tubes
  const totalLiquidUnits = tubes.reduce((acc, t) => acc + t.length, 0);
  const targetCompletedTubes = Math.max(1, Math.round(totalLiquidUnits / 4));
  const completedTubesCount = tubes.filter((t) => isTubeComplete(t, 4)).length;
  const completionPercentage = Math.min(
    100,
    Math.round((completedTubesCount / targetCompletedTubes) * 100)
  );

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between text-slate-100 ${currentTheme.bgClass} relative overflow-hidden select-none font-sans transition-colors duration-500`}
    >
      {/* Dynamic Liquid Stream Arc during pour */}
      <PourStream
        sourcePos={streamPositions.sourcePos}
        targetPos={streamPositions.targetPos}
        colorId={pouringColor || 'blue'}
      />

      {/* Celebratory Particle Explosion Overlay */}
      <ParticleExplosion
        active={isExploding}
        tubePositions={explosionPositions}
      />

      {/* Top Header */}
      <GameHeader
        levelId={levelId}
        levelName={isCustomMode ? (lang === 'hi' ? 'कस्टम मोड' : 'Custom Mode') : undefined}
        moves={moves}
        elapsedSeconds={elapsedSeconds}
        isTimerRunning={isTimerRunning}
        undoCount={history.length}
        canUndo={history.length > 0 && pouringSource === null}
        extraTubesAdded={extraTubesAdded}
        isSoundMuted={isMuted}
        lang={lang}
        onUndo={handleUndo}
        onRestart={handleRestart}
        onHint={handleHint}
        onAddTube={handleAddTube}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm font-semibold shadow-xl shadow-cyan-950/40 backdrop-blur-md animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <span>💧</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Game Stage / Chemistry Rack */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center items-center px-4 py-4 sm:py-6 relative z-10">
        {/* Subtle glowing ambient backdrop */}
        <div className="absolute w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none -z-10" />

        {/* Thin Animated Level Progress Bar */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto mb-5 sm:mb-7 px-2">
          <div className="flex items-center justify-between text-[11px] font-medium mb-1.5 px-0.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="text-cyan-400 text-xs">✦</span>
              <span>{lang === 'hi' ? 'सॉर्टेड फ्लास्क' : 'Sorted Flasks'}</span>
            </span>
            <span className="font-mono text-cyan-300 font-semibold tracking-wider text-xs">
              {completedTubesCount} / {targetCompletedTubes}{' '}
              <span className="text-slate-400 font-normal">({completionPercentage}%)</span>
            </span>
          </div>

          {/* Thin Progress Track */}
          <div className="w-full h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden p-[1px] backdrop-blur-xs relative shadow-inner">
            <div
              style={{ width: `${completionPercentage}%` }}
              className={`h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(45,212,191,0.5)] ${
                completionPercentage === 100
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 animate-pulse-glow'
                  : 'bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 animate-progress-shimmer'
              }`}
            />
          </div>
        </div>

        {/* Flasks Matrix */}
        <div className="w-full flex flex-col items-center justify-center gap-8 md:gap-12 py-2">
          {/* Row 1 */}
          <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-7 md:gap-9">
            {topRow.map(({ tube, index }) => (
              <div
                key={`tube-${index}`}
                ref={(el) => {
                  tubeRefs.current[index] = el;
                }}
              >
                <Tube
                  index={index}
                  tube={tube}
                  capacity={4}
                  isSelected={selectedTube === index}
                  isHintSource={activeHint?.fromIndex === index}
                  isHintTarget={activeHint?.toIndex === index}
                  isPouringSource={pouringSource === index}
                  isPouringTarget={pouringTarget === index}
                  pourAngle={pourTransform.angle}
                  pourShiftX={pourTransform.shiftX}
                  pourShiftY={pourTransform.shiftY}
                  styleType={tubeStyle}
                  disabled={pouringSource !== null}
                  onClick={() => handleTubeClick(index)}
                  lang={lang}
                />
              </div>
            ))}
          </div>

          {/* Row 2 (if > 5 tubes) */}
          {bottomRow.length > 0 && (
            <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-7 md:gap-9">
              {bottomRow.map(({ tube, index }) => (
                <div
                  key={`tube-${index}`}
                  ref={(el) => {
                    tubeRefs.current[index] = el;
                  }}
                >
                  <Tube
                    index={index}
                    tube={tube}
                    capacity={4}
                    isSelected={selectedTube === index}
                    isHintSource={activeHint?.fromIndex === index}
                    isHintTarget={activeHint?.toIndex === index}
                    isPouringSource={pouringSource === index}
                    isPouringTarget={pouringTarget === index}
                    pourAngle={pourTransform.angle}
                    pourShiftX={pourTransform.shiftX}
                    pourShiftY={pourTransform.shiftY}
                    styleType={tubeStyle}
                    disabled={pouringSource !== null}
                    onClick={() => handleTubeClick(index)}
                    lang={lang}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Laboratory Stand / Frosted Wooden Rack Footing */}
        <div className="w-full max-w-2xl h-3 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4 shadow-inner opacity-75" />
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span>AquaSort Water Puzzle</span>
          <span aria-hidden="true">·</span>
          <span>
            {lang === 'hi' ? 'सॉर्टिंग पज़ल गेम' : 'Liquid Color Sort'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="hover:text-slate-300 transition-colors"
          >
            {lang === 'hi' ? 'नियम' : 'Rules'}
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="hover:text-cyan-400 text-cyan-500/80 transition-colors"
          >
            {lang === 'hi' ? 'कस्टम स्तर' : 'Custom'}
          </button>
        </div>
      </footer>

      {/* Modals */}
      <WinModal
        isOpen={isWinModalOpen}
        levelId={levelId}
        moves={moves}
        timeTakenSeconds={finalTimeSeconds || elapsedSeconds}
        stars={3}
        lang={lang}
        onNextLevel={handleNextLevel}
        onReplay={handleRestart}
        onOpenLevelSelect={() => {
          setIsWinModalOpen(false);
          setIsLevelSelectOpen(true);
        }}
      />

      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        currentLevel={levelId}
        completedLevels={completedLevels}
        lang={lang}
        onSelectLevel={(lvl) => {
          setLevelId(lvl);
          setIsLevelSelectOpen(false);
        }}
        onOpenCustomGame={() => setIsCustomModalOpen(true)}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        theme={theme}
        tubeStyle={tubeStyle}
        isSoundMuted={isMuted}
        lang={lang}
        onSelectTheme={handleSelectTheme}
        onSelectTubeStyle={handleSelectTubeStyle}
        onToggleSound={handleToggleSound}
        onToggleLang={handleToggleLang}
        onResetProgress={handleResetProgress}
        onClose={() => setIsSettingsOpen(false)}
      />

      <RulesModal
        isOpen={isRulesOpen}
        lang={lang}
        onClose={() => setIsRulesOpen(false)}
      />

      <CustomLevelModal
        isOpen={isCustomModalOpen}
        lang={lang}
        onGenerateCustom={handleGenerateCustom}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </div>
  );
}
