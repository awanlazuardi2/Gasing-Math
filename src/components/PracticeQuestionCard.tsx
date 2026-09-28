/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { memo, useState, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, PracticeAnswerItem } from '../types';
import P11GasingRenderer from './P11GasingRenderer';
import {
  calculateGasingSteps,
  toSuperscript,
  getQuestionInteractiveSlots,
  GasingInteractiveSlot,
} from '../utils/gasingCalculator';

export interface PracticeQuestionCardProps {
  q: Question;
  idx: number;
  ansObj: PracticeAnswerItem | undefined;
  isRemainderDivision: boolean;
  isActive: boolean;
  activePart: 'val' | 'sisa';
  onSelect: (idx: number, part: 'val' | 'sisa', slotId?: string) => void;
  onAutoMerge?: (idx: number) => void;
  materialId: string;
  p11Format?: string;
  showNumbers?: boolean;
  showGasingSteps?: boolean;
  practiceEnded: boolean;
  hasBeenGraded: boolean;
  isCorrect: boolean;
}

const BADGE_COLORS = [
  'bg-rose-500 text-white',
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-500 text-white',
  'bg-purple-600 text-white',
  'bg-indigo-600 text-white',
  'bg-pink-500 text-white',
  'bg-teal-600 text-white',
];

export const PracticeQuestionCard = memo(function PracticeQuestionCard({
  q,
  idx,
  ansObj,
  isRemainderDivision,
  isActive,
  activePart,
  onSelect,
  onAutoMerge,
  materialId,
  p11Format = 'vertikal',
  showNumbers = true,
  showGasingSteps = true,
  practiceEnded,
  hasBeenGraded,
  isCorrect,
}: PracticeQuestionCardProps) {
  const [showStepsModal, setShowStepsModal] = useState(false);
  const badgeColor = BADGE_COLORS[idx % BADGE_COLORS.length];
  const isP11 = materialId === 'P11';
  const isPasangan10 = materialId === 'P3' || q.digits?.targetSum === 10;

  // Extract slots, stepSlots, finalSlots, and gasingData
  const slotData = useMemo(() => {
    if (isP11) return null;
    return getQuestionInteractiveSlots(q);
  }, [q, isP11]);

  const gasingData = slotData?.gasingData ?? null;
  const currentActiveSlotId = ansObj?.activeSlotId || slotData?.slots[0]?.id;

  // Extract numbers and operator for arithmetic display
  let num1 = '';
  let num2 = '';
  let opSymbol = '+';
  let isVerticalApplicable = false;
  let summaryText = '';

  if (isP11) {
    let fullNums: number[] = [];
    if (q.displayFormat === 'vertical' || q.questionText.includes('\n')) {
      const lines = q.questionText.split('\n');
      fullNums = lines.map((l) => parseInt(l.replace(/\./g, '').trim())).filter((n) => !isNaN(n));
    } else {
      const cleanText = q.questionText.replace('=', '');
      const parts = cleanText.split('+');
      fullNums = parts.map((p) => parseInt(p.replace(/\./g, '').trim())).filter((n) => !isNaN(n));
    }
    if (fullNums.length === 0) {
      fullNums = q.digits?.extraNumbers || [];
    }
    summaryText = fullNums.slice(0, 3).join(' + ') + (fullNums.length > 3 ? '...' : '');
  } else if (q.digits?.a !== undefined && q.digits?.b !== undefined) {
    num1 = String(q.digits.a);
    num2 = String(q.digits.b);
    opSymbol = q.digits.op || '+';
    if (opSymbol === '*' || opSymbol === 'x') opSymbol = '×';
    if (opSymbol === '/' || opSymbol === ':') opSymbol = '÷';
    isVerticalApplicable = opSymbol === '+' || opSymbol === '-' || opSymbol === '×';
    summaryText = `${num1} ${opSymbol} ${num2}`;
  } else if (q.questionText.includes('\n')) {
    const lines = q.questionText.split('\n');
    num1 = lines[0]?.trim() || '';
    num2 = lines[1]?.trim() || '';
    opSymbol = '+';
    isVerticalApplicable = true;
    summaryText = `${num1} + ${num2}`;
  } else {
    // Horizontal fallback parser (e.g., "11 + 25 =")
    const clean = q.questionText.replace('=', '').trim();
    const match = clean.match(/^(\d+)\s*([+\-×x*÷:])\s*(\d+)$/);
    if (match) {
      num1 = match[1];
      let rawOp = match[2];
      if (rawOp === '*' || rawOp === 'x') rawOp = '×';
      if (rawOp === '/' || rawOp === ':') rawOp = '÷';
      opSymbol = rawOp;
      num2 = match[3];
      isVerticalApplicable = opSymbol === '+' || opSymbol === '-' || opSymbol === '×';
      summaryText = `${num1} ${opSymbol} ${num2}`;
    } else {
      summaryText = clean;
    }
  }

  const needsMerge = slotData?.needsMerge ?? false;
  const hasSmallNumbers = slotData?.hasSmallNumbers ?? false;

  // Check if all GASING intermediate steps are filled
  const hasAllGasingSteps = useMemo(() => {
    if (!slotData?.stepSlots || slotData.stepSlots.length === 0) return false;
    const gInputs = ansObj?.gasingInputs || {};
    return slotData.stepSlots.every((s) => (gInputs[s.id] || '').length >= s.maxLength);
  }, [slotData, ansObj?.gasingInputs]);

  // Blinking cursor component
  const BlinkingCursor = ({ color = 'bg-indigo-600' }: { color?: string }) => (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
      className={`w-0.5 h-4 ${color} inline-block align-middle ml-0.5`}
    />
  );

  return (
    <div
      id={`grid-cell-${idx}`}
      onClick={() => onSelect(idx, 'val')}
      className={`group relative rounded-3xl p-3.5 sm:p-4.5 border-2 transition-all cursor-pointer select-none flex flex-col justify-between min-h-[190px] ${
        isActive
          ? 'bg-white border-indigo-500 ring-4 ring-indigo-100 shadow-lg scale-[1.01]'
          : isCorrect
          ? 'bg-emerald-50/30 border-emerald-200/90 shadow-2xs hover:border-emerald-300'
          : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* 1. Header Bar: Badge No, Formula Summary, & Success/Error Checkmark */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100/90">
        <div className="flex items-center gap-2 overflow-hidden">
          {showNumbers && (
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-2xs ${badgeColor}`}
            >
              {q.id}
            </span>
          )}
          <span className="text-xs sm:text-sm font-bold text-slate-500 font-mono truncate">
            {summaryText}
          </span>
        </div>

        {/* Status Indicator (Checkmark / Cross) */}
        <div className="flex items-center gap-1.5">
          {practiceEnded && showGasingSteps && gasingData && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowStepsModal(true);
              }}
              title="Lihat panduan detil logika GASING"
              className="w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
            >
              ?
            </button>
          )}

          {isCorrect && (
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
          {hasBeenGraded && !isCorrect && (
            <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
          {!isCorrect && !(hasBeenGraded && !isCorrect) && (
            <div className="w-6 h-6 rounded-full border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-300">
              {idx + 1}
            </div>
          )}
        </div>
      </div>

      {/* 2. Arithmetic Problem Body */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 my-auto">
        {isP11 ? (
          <div className="flex flex-col items-center">
            <P11GasingRenderer
              numbers={q.digits?.extraNumbers || [q.digits?.a ?? 0, q.digits?.b ?? 0]}
              layout={p11Format === 'vertikal' ? 'vertical' : 'horizontal'}
              showAnswers={false}
              size="sm"
            />
          </div>
        ) : isVerticalApplicable ? (
          (() => {
            const maxLen = Math.max(num1.length, num2.length);
            const pNum1 = num1.padStart(maxLen, ' ');
            const pNum2 = num2.padStart(maxLen, ' ');

            return (
              <div className="inline-flex flex-col items-end font-mono">
                {/* Top Number */}
                <div className="flex items-center justify-end pr-1">
                  {pNum1.split('').map((digit, dIdx) => (
                    <span
                      key={`d1-${dIdx}`}
                      className="w-5 sm:w-6 text-center text-xl sm:text-2xl font-black text-slate-800"
                    >
                      {digit}
                    </span>
                  ))}
                </div>

                {/* Bottom Number with Operator */}
                <div className="flex items-center justify-end gap-1.5 sm:gap-2 pr-1">
                  <span className="text-sm sm:text-base font-black text-slate-400">
                    {opSymbol}
                  </span>
                  <div className="flex items-center justify-end">
                    {pNum2.split('').map((digit, dIdx) => (
                      <span
                        key={`d2-${dIdx}`}
                        className="w-5 sm:w-6 text-center text-xl sm:text-2xl font-black text-slate-800"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Math Horizontal Underline */}
                <div className="w-full h-0.5 bg-slate-800 my-1.5 rounded-full" />

                {/* Case A: Needs Merge OR Has Small Numbers (e.g. 363+770, 16+5, or 6+5) */}
                {showGasingSteps && gasingData && (needsMerge || hasSmallNumbers) && (
                  <div className="w-full flex flex-col items-center justify-center pt-1 pb-1">
                    <div className="flex items-end justify-center gap-1 sm:gap-1.5 font-mono">
                      {gasingData.nodes.map((node, nIdx) => {
                        const hasSmall = Boolean(node.carry && node.carry > 0);
                        const smallSlotId = `g_${nIdx}_small`;
                        const baseSlotId = `g_${nIdx}_base`;
                        const smallVal = ansObj?.gasingInputs?.[smallSlotId] || '';
                        const baseVal = ansObj?.gasingInputs?.[baseSlotId] || '';
                        const isSmallFocused = isActive && currentActiveSlotId === smallSlotId;
                        const isBaseFocused = isActive && currentActiveSlotId === baseSlotId;

                        return (
                          <React.Fragment key={`col-${nIdx}`}>
                            {/* Kolom Angka Kecil (Berada di antara angka depan dan angka besar kolom ini) */}
                            {hasSmall && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelect(idx, 'val', smallSlotId);
                                }}
                                className={`w-5 h-5 sm:w-6 sm:h-6 mb-2.5 sm:mb-3 rounded-md font-mono text-xs sm:text-sm font-black flex items-center justify-center transition-all cursor-pointer ${
                                  isSmallFocused
                                    ? 'border-2 border-dashed border-amber-600 bg-amber-100 text-amber-950 ring-2 ring-amber-300 shadow-xs scale-110'
                                    : smallVal
                                    ? 'border-2 border-amber-400 bg-amber-50 text-amber-900 shadow-2xs'
                                    : 'border-2 border-dashed border-amber-300/80 bg-amber-50/60 text-amber-400 hover:border-amber-500'
                                }`}
                              >
                                {smallVal ? (
                                  toSuperscript(smallVal)
                                ) : isSmallFocused ? (
                                  <BlinkingCursor color="bg-amber-600" />
                                ) : null}
                              </div>
                            )}

                            {/* Kolom Angka Besar */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelect(idx, 'val', baseSlotId);
                              }}
                              className={`${
                                node.base.length > 1 ? 'w-10 sm:w-11' : 'w-7 sm:w-8'
                              } h-8 sm:h-9 rounded-xl font-mono text-base sm:text-lg font-black flex items-center justify-center transition-all cursor-pointer ${
                                isBaseFocused
                                  ? 'border-2 border-dashed border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-200 shadow-xs scale-105'
                                  : baseVal
                                  ? 'border border-slate-400 bg-white text-slate-800 shadow-2xs'
                                  : 'border border-slate-200 bg-slate-50 text-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {baseVal ? (
                                baseVal
                              ) : isBaseFocused ? (
                                <BlinkingCursor color="bg-indigo-600" />
                              ) : (
                                ''
                              )}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Case B: Direct Answer (No Carry / No Merging Needed, e.g. 870 + 103) */}
                {!needsMerge && !hasSmallNumbers && (
                  <div className="flex items-center justify-end pr-1 gap-1 font-mono pt-1">
                    {(slotData?.finalSlots || []).map((fSlot, fIdx) => {
                      const char = (ansObj?.val || '')[fIdx] || '';
                      const isSlotFocused =
                        isActive &&
                        (currentActiveSlotId === fSlot.id ||
                          (!currentActiveSlotId?.startsWith('g_') &&
                            fIdx === Math.min((ansObj?.val || '').length, (slotData?.finalSlots.length || 1) - 1)));

                      return (
                        <div
                          key={fSlot.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(idx, 'val', fSlot.id);
                          }}
                          className={`w-5 sm:w-6 h-8 sm:h-9 rounded-xl font-mono text-base sm:text-lg font-black flex items-center justify-center transition-all cursor-pointer ${
                            isSlotFocused
                              ? 'border-2 border-dashed border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-200 shadow-xs scale-105'
                              : char
                              ? 'border border-slate-400 bg-white text-slate-800 shadow-2xs'
                              : 'border border-slate-200 bg-slate-50 text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {char ? char : isSlotFocused ? <BlinkingCursor color="bg-indigo-600" /> : ''}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          /* Horizontal / Division / Pasangan 10 Display */
          isPasangan10 ? (
            <div className="flex flex-col items-center justify-center gap-2 font-mono py-1 w-full">
              {/* Pasangan 10 Badge (Tanpa bocoran sebelum dinilai) */}
              <div className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50/90 border border-indigo-200/90 px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs font-display">
                <span>🎯</span>
                <span>
                  {hasBeenGraded && q.digits?.mnemonicText
                    ? `Pasangan 10: ${q.digits.mnemonicText} (${q.digits.mnemonicCode || ''})`
                    : `Pasangan 10 • Lengkapi Angka`}
                </span>
              </div>

              {/* Ten-Frame Mini Visual Beads (Pola 5 + 5 Tangan GASING) */}
              <div className="flex flex-col items-center gap-1 py-1 px-3 bg-slate-50/90 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, bIdx) => {
                    const known = q.digits?.knownNumber ?? (q.digits?.missingPosition === 'a' ? q.digits?.b : q.digits?.a) ?? 5;
                    const isKnownBead = bIdx < (known || 5);
                    return (
                      <div
                        key={bIdx}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all ${
                          isKnownBead
                            ? 'bg-indigo-600 shadow-2xs'
                            : 'border-2 border-dashed border-emerald-400 bg-emerald-50/80'
                        }`}
                        title={isKnownBead ? `Manik ${bIdx + 1}` : 'Manik pasangan'}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const bIdx = i + 5;
                    const known = q.digits?.knownNumber ?? (q.digits?.missingPosition === 'a' ? q.digits?.b : q.digits?.a) ?? 5;
                    const isKnownBead = bIdx < (known || 5);
                    return (
                      <div
                        key={bIdx}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all ${
                          isKnownBead
                            ? 'bg-indigo-600 shadow-2xs'
                            : 'border-2 border-dashed border-emerald-400 bg-emerald-50/80'
                        }`}
                        title={isKnownBead ? `Manik ${bIdx + 1}` : 'Manik pasangan'}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Equation with Inline Partner Slot */}
              <div className="flex items-center justify-center flex-wrap gap-2 text-xl sm:text-2xl font-black text-slate-800 py-1">
                {(() => {
                  const fSlot = slotData?.finalSlots?.[0] || { id: 'final_0', maxLength: 1 };
                  const char = (ansObj?.val || '')[0] || '';
                  const isSlotFocused =
                    isActive &&
                    (currentActiveSlotId === fSlot.id || !currentActiveSlotId?.startsWith('g_'));

                  const renderPartnerInputSlot = () => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(idx, 'val', fSlot.id);
                      }}
                      className={`w-9 h-10 sm:w-11 sm:h-12 rounded-xl font-mono text-xl sm:text-2xl font-black flex items-center justify-center transition-all cursor-pointer ${
                        isSlotFocused
                          ? 'border-2 border-dashed border-indigo-600 bg-indigo-50/90 text-indigo-950 ring-3 ring-indigo-200/80 shadow-md scale-105'
                          : char
                          ? 'border-2 border-slate-400 bg-white text-slate-900 shadow-xs'
                          : 'border-2 border-dashed border-slate-300 bg-slate-50 text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {char ? char : isSlotFocused ? <BlinkingCursor color="bg-indigo-600" /> : <span className="text-slate-300 text-sm">?</span>}
                    </div>
                  );

                  if (q.digits?.isDecomposition) {
                    return (
                      <>
                        <span className="text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-lg border border-emerald-300 font-display">10</span>
                        <span className="text-slate-400">=</span>
                        {q.digits.missingPosition === 'a' ? (
                          <>
                            {renderPartnerInputSlot()}
                            <span className="text-slate-400">+</span>
                            <span className="text-indigo-600">{q.digits.b}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-indigo-600">{q.digits?.a}</span>
                            <span className="text-slate-400">+</span>
                            {renderPartnerInputSlot()}
                          </>
                        )}
                      </>
                    );
                  }

                  return (
                    <>
                      {q.digits?.missingPosition === 'a' ? (
                        <>
                          {renderPartnerInputSlot()}
                          <span className="text-slate-400">+</span>
                          <span className="text-indigo-600">{q.digits?.b}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-indigo-600">{q.digits?.a}</span>
                          <span className="text-slate-400">+</span>
                          {renderPartnerInputSlot()}
                        </>
                      )}
                      <span className="text-slate-400">=</span>
                      <span className="text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-lg border border-emerald-300 font-display">10</span>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
          <div className="flex flex-col items-center justify-center gap-1 font-mono">
            <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-black text-slate-800 py-1">
              <span>{summaryText}</span>
              <span className="text-slate-400">=</span>
              {/* Direct Answer (No Carry / No Merging Needed, e.g. 870 + 103) */}
              {!needsMerge && !hasSmallNumbers && (
                <div className="flex items-center gap-1">
                  {(slotData?.finalSlots || []).map((fSlot, fIdx) => {
                    const char = (ansObj?.val || '')[fIdx] || '';
                    const isSlotFocused =
                      isActive &&
                      (currentActiveSlotId === fSlot.id ||
                        (!currentActiveSlotId?.startsWith('g_') &&
                          fIdx === Math.min((ansObj?.val || '').length, (slotData?.finalSlots.length || 1) - 1)));

                    return (
                      <div
                        key={fSlot.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(idx, 'val', fSlot.id);
                        }}
                        className={`w-7 h-8 sm:w-8 sm:h-9 rounded-xl font-mono text-base sm:text-lg font-black flex items-center justify-center transition-all cursor-pointer ${
                          isSlotFocused
                            ? 'border-2 border-dashed border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-200 shadow-xs scale-105'
                            : char
                            ? 'border border-slate-400 bg-white text-slate-800 shadow-2xs'
                            : 'border border-slate-200 bg-slate-50 text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {char ? char : isSlotFocused ? <BlinkingCursor color="bg-indigo-600" /> : ''}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Case A: Intermediate steps with carries / small numbers */}
            {showGasingSteps && gasingData && (needsMerge || hasSmallNumbers) && (
              <div className="flex flex-col items-center gap-1.5 my-1 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-2">
                <span className="text-[10px] font-extrabold text-amber-800">
                  Tulis Notasi GASING (Angka Kecil di Antara & Besar):
                </span>
                <div className="flex items-end justify-center gap-1 sm:gap-1.5 font-mono">
                  {gasingData.nodes.map((node, nIdx) => {
                    const hasSmall = Boolean(node.carry && node.carry > 0);
                    const smallSlotId = `g_${nIdx}_small`;
                    const baseSlotId = `g_${nIdx}_base`;
                    const smallVal = ansObj?.gasingInputs?.[smallSlotId] || '';
                    const baseVal = ansObj?.gasingInputs?.[baseSlotId] || '';
                    const isSmallFocused = isActive && currentActiveSlotId === smallSlotId;
                    const isBaseFocused = isActive && currentActiveSlotId === baseSlotId;

                    return (
                      <React.Fragment key={`h-col-${nIdx}`}>
                        {/* Kolom Angka Kecil (Berada di antara angka depan dan angka besar kolom ini) */}
                        {hasSmall && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(idx, 'val', smallSlotId);
                            }}
                            className={`w-5 h-5 sm:w-6 sm:h-6 mb-2.5 sm:mb-3 rounded-md font-mono text-xs sm:text-sm font-black flex items-center justify-center transition-all cursor-pointer ${
                              isSmallFocused
                                ? 'border-2 border-dashed border-amber-600 bg-amber-100 text-amber-950 ring-2 ring-amber-300 scale-110 shadow-xs'
                                : smallVal
                                ? 'border-2 border-amber-400 bg-white text-amber-900 shadow-2xs'
                                : 'border-2 border-dashed border-amber-300/80 bg-white/70 text-amber-400 hover:border-amber-500'
                            }`}
                          >
                            {smallVal ? (
                              toSuperscript(smallVal)
                            ) : isSmallFocused ? (
                              <BlinkingCursor color="bg-amber-600" />
                            ) : null}
                          </div>
                        )}

                        {/* Kolom Angka Besar */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(idx, 'val', baseSlotId);
                          }}
                          className={`${
                            node.base.length > 1 ? 'w-10 sm:w-11' : 'w-7 sm:w-8'
                          } h-8 sm:h-9 rounded-xl font-mono text-base font-black flex items-center justify-center transition-all cursor-pointer ${
                            isBaseFocused
                              ? 'border-2 border-dashed border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-200 scale-105 shadow-xs'
                              : baseVal
                              ? 'border border-slate-400 bg-white text-slate-800 shadow-2xs'
                              : 'border border-slate-200 bg-white text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {baseVal ? (
                            baseVal
                          ) : isBaseFocused ? (
                            <BlinkingCursor color="bg-indigo-600" />
                          ) : (
                            ''
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )
      )}
      </div>

      {/* 3. Final Answer Slots (Hanya jika membutuhkan gabung, atau ada sisa bagi) */}
      {(needsMerge || isRemainderDivision || (practiceEnded && !isCorrect)) && (
        <div className="pt-2 border-t border-slate-100 flex flex-col items-center justify-center gap-1.5">
          {needsMerge && (
            <div className="flex items-center justify-center flex-wrap gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                ➔ Gabung:
              </span>

              {/* Final Answer Digit Slots */}
              <div className="flex items-center gap-1">
                {(slotData?.finalSlots || [{ id: 'final_0', maxLength: 1 }]).map((fSlot, fIdx) => {
                  const char = (ansObj?.val || '')[fIdx] || '';
                  const isSlotFocused =
                    isActive &&
                    (currentActiveSlotId === fSlot.id ||
                      (!currentActiveSlotId?.startsWith('g_') &&
                        fIdx === Math.min((ansObj?.val || '').length, (slotData?.finalSlots.length || 1) - 1)));

                  return (
                    <div
                      key={fSlot.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(idx, 'val', fSlot.id);
                      }}
                      className={`w-7 h-8 sm:w-8 sm:h-9 rounded-xl font-mono text-base sm:text-lg font-black flex items-center justify-center transition-all cursor-pointer ${
                        isSlotFocused
                          ? 'border-2 border-dashed border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-200/70 shadow-xs scale-105'
                          : char
                          ? 'border border-slate-300 bg-white text-slate-800 shadow-2xs'
                          : 'border border-slate-200 bg-slate-50/70 text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {char ? char : isSlotFocused ? <BlinkingCursor /> : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sisa Bagi (if remainder division) */}
          {isRemainderDivision && (
            <div className="flex items-center gap-1 ml-1">
              <span className="text-[11px] font-black text-amber-600">sisa</span>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(idx, 'sisa', 'sisa_0');
                }}
                className={`w-7 h-8 sm:w-8 sm:h-9 rounded-xl font-mono text-base font-black flex items-center justify-center cursor-pointer ${
                  isActive && (activePart === 'sisa' || currentActiveSlotId === 'sisa_0')
                    ? 'border-2 border-dashed border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                    : ansObj?.sisa
                    ? 'border border-amber-300 bg-amber-50/60 text-amber-900'
                    : 'border border-slate-200 bg-slate-50 text-slate-300'
                }`}
              >
                {ansObj?.sisa || ''}
              </div>
            </div>
          )}

          {/* Answer key hint when practice ended */}
          {practiceEnded && !isCorrect && (
            <div className="text-[10px] sm:text-xs font-mono font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md mt-0.5">
              Kunci: {q.answerText}{q.digits?.mnemonicText ? ` (${q.digits.mnemonicText})` : ''}
            </div>
          )}
        </div>
      )}

      {/* 4. GASING Step-by-Step Detail Modal */}
      <AnimatePresence>
        {showStepsModal && gasingData && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
            onClick={(e) => {
              e.stopPropagation();
              setShowStepsModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-black text-base text-slate-800">
                      Langkah Logika GASING
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Soal: {summaryText}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStepsModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps List with Small Numbers on Top */}
              <div className="space-y-3">
                {gasingData.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Langkah {step.stepNumber}: {step.title}</span>
                      {step.hasSmallNumber && step.smallNumber !== undefined && (
                        <span className="text-[11px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full font-mono">
                          Angka kecil: {toSuperscript(step.smallNumber)}
                        </span>
                      )}
                    </div>
                    <div className="font-mono font-black text-indigo-700 text-base">
                      {step.expression}
                    </div>
                    <p className="text-xs text-slate-600 font-sans leading-relaxed">
                      {step.explanation}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary and Close Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-slate-500">
                  Hasil Akhir: <span className="text-emerald-600 font-black text-base">{gasingData.finalAnswer}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStepsModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default PracticeQuestionCard;
