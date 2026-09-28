/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Delete, 
  Check, 
  Keyboard, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PracticeAnswerItem } from '../types';

export interface PracticeKeypadProps {
  activeGridIndex: number;
  totalQuestions: number;
  onKeyPress: (key: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isLastQuestion: boolean;
  isFirstQuestion: boolean;
  isRemainderDivision: boolean;
  activeGridPart: 'val' | 'sisa';
  onTogglePart: (part: 'val' | 'sisa') => void;
  onFinish: () => void;
  currentAnswer?: PracticeAnswerItem;
}

export const PracticeKeypad: React.FC<PracticeKeypadProps> = ({
  activeGridIndex,
  totalQuestions,
  onKeyPress,
  onNext,
  onPrev,
  isLastQuestion,
  isFirstQuestion,
  isRemainderDivision,
  activeGridPart,
  onTogglePart,
  onFinish,
  currentAnswer,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const triggerHaptic = () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // ignore
    }
  };

  const handleKey = (key: string) => {
    triggerHaptic();
    onKeyPress(key);
  };

  const handleActionClick = () => {
    triggerHaptic();
    if (isRemainderDivision && activeGridPart === 'val') {
      onTogglePart('sisa');
    } else if (isLastQuestion) {
      onFinish();
    } else {
      onNext();
    }
  };

  // Determine active slot description
  const getActiveSlotBadge = () => {
    if (!currentAnswer?.activeSlotId) return null;
    const slot = currentAnswer.activeSlotId;
    if (slot.includes('small')) {
      return {
        label: 'Angka Kecil',
        classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      };
    }
    if (slot.includes('base')) {
      return {
        label: 'Angka Besar',
        classes: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
      };
    }
    if (slot.includes('sisa')) {
      return {
        label: 'Sisa Bagi',
        classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      };
    }
    return {
      label: 'Hasil',
      classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    };
  };

  const activeBadge = getActiveSlotBadge();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 no-print pointer-events-none flex justify-center px-2 sm:px-4 pb-2.5 sm:pb-4">
      <motion.div
        layout
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-slate-900/92 backdrop-blur-2xl text-white rounded-3xl sm:rounded-[32px] border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden p-2.5 sm:p-3.5"
      >
        {/* Subtle Top Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-0.5 mb-1.5" />

        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-1 pb-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Question Counter Pill */}
            <div className="flex items-center gap-1.5 bg-white/6 border border-white/10 rounded-full px-2.5 py-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-100">
                Soal {activeGridIndex + 1}
                <span className="text-slate-400 font-normal ml-0.5">/{totalQuestions}</span>
              </span>
            </div>

            {/* Quick Prev / Next Navigator */}
            <div className="flex items-center bg-white/6 rounded-full p-0.5 border border-white/10">
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  triggerHaptic();
                  onPrev();
                }}
                disabled={isFirstQuestion}
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Soal Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  triggerHaptic();
                  onNext();
                }}
                disabled={isLastQuestion}
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Soal Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Slot Pill Badge */}
            {activeBadge && (
              <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-semibold border ${activeBadge.classes}`}>
                {activeBadge.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Division Remainder Selector Tabs */}
            {isRemainderDivision && (
              <div className="flex items-center bg-white/6 rounded-xl p-0.5 border border-white/10 text-xs font-bold">
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    triggerHaptic();
                    onTogglePart('val');
                  }}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    activeGridPart === 'val'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Hasil
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    triggerHaptic();
                    onTogglePart('sisa');
                  }}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    activeGridPart === 'sisa'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sisa
                </button>
              </div>
            )}

            {/* Toggle Minimize/Expand Button */}
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                triggerHaptic();
                setIsMinimized(!isMinimized);
              }}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-white/6 hover:bg-white/10 px-2 py-1 rounded-full border border-white/10 transition-colors cursor-pointer"
              title={isMinimized ? 'Buka Keyboard' : 'Tutup Keyboard'}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isMinimized ? 'Buka' : 'Tutup'}</span>
              {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Numpad Keypad Body */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="pt-1.5"
            >
              {/* Premium 3-Column Ergonomic Keypad Grid */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {/* Row 1: 1, 2, 3 */}
                {['1', '2', '3'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleKey(digit)}
                    className="h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-850/95 hover:from-slate-750 hover:to-slate-800 active:from-slate-700 active:to-slate-750 active:scale-[0.96] text-xl sm:text-2xl font-display font-black text-slate-100 border-t border-white/15 border-x border-b border-black/40 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-center transition-all cursor-pointer select-none"
                  >
                    {digit}
                  </button>
                ))}

                {/* Row 2: 4, 5, 6 */}
                {['4', '5', '6'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleKey(digit)}
                    className="h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-850/95 hover:from-slate-750 hover:to-slate-800 active:from-slate-700 active:to-slate-750 active:scale-[0.96] text-xl sm:text-2xl font-display font-black text-slate-100 border-t border-white/15 border-x border-b border-black/40 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-center transition-all cursor-pointer select-none"
                  >
                    {digit}
                  </button>
                ))}

                {/* Row 3: 7, 8, 9 */}
                {['7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleKey(digit)}
                    className="h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-850/95 hover:from-slate-750 hover:to-slate-800 active:from-slate-700 active:to-slate-750 active:scale-[0.96] text-xl sm:text-2xl font-display font-black text-slate-100 border-t border-white/15 border-x border-b border-black/40 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-center transition-all cursor-pointer select-none"
                  >
                    {digit}
                  </button>
                ))}

                {/* Row 4: Reset, 0, Backspace */}
                {/* Reset / Clear Key */}
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleKey('ClearAll')}
                  className="h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-800/60 hover:bg-slate-750/70 active:bg-slate-700/80 active:scale-[0.96] text-slate-400 hover:text-slate-200 border-t border-white/10 border-x border-b border-black/30 shadow-[0_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1 transition-all cursor-pointer select-none font-display"
                  title="Kosongkan Digit"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold">Reset</span>
                </button>

                {/* Digit 0 */}
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleKey('0')}
                  className="h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-850/95 hover:from-slate-750 hover:to-slate-800 active:from-slate-700 active:to-slate-750 active:scale-[0.96] text-xl sm:text-2xl font-display font-black text-slate-100 border-t border-white/15 border-x border-b border-black/40 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-center transition-all cursor-pointer select-none"
                >
                  0
                </button>

                {/* Backspace Key */}
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleKey('Backspace')}
                  className="h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-500/12 hover:bg-rose-500/22 active:bg-rose-500/30 active:scale-[0.96] text-rose-300 hover:text-rose-100 border-t border-rose-400/25 border-x border-b border-rose-950/40 shadow-[0_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all cursor-pointer select-none"
                  title="Hapus Satu Digit"
                >
                  <Delete className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                </button>
              </div>

              {/* Row 5: Distinct Primary Action Button with spacing */}
              <div className="pt-2">
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleActionClick}
                  className={`w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] select-none ${
                    isLastQuestion && (!isRemainderDivision || activeGridPart === 'sisa')
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-110 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] border-t border-white/25 border-b border-emerald-900/40'
                      : isRemainderDivision && activeGridPart === 'val'
                      ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:brightness-110 text-slate-950 shadow-[0_4px_16px_rgba(245,158,11,0.35)] border-t border-white/30 border-b border-amber-900/40'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:brightness-110 text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] border-t border-white/20 border-b border-blue-900/40'
                  }`}
                >
                  {isLastQuestion && (!isRemainderDivision || activeGridPart === 'sisa') ? (
                    <>
                      <span className="text-sm sm:text-base tracking-wide">Selesai & Nilai Hasil</span>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </>
                  ) : isRemainderDivision && activeGridPart === 'val' ? (
                    <>
                      <span className="text-sm sm:text-base tracking-wide">Lanjut ke Sisa Bagi</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base tracking-wide">Berikutnya</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PracticeKeypad;

