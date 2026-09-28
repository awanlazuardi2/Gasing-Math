import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  RotateCcw, 
  Star, 
  Sparkles, 
  Lightbulb, 
  ArrowRight, 
  Check, 
  Delete, 
  Zap, 
  Volume2, 
  VolumeX,
  Smile,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, PracticeAnswerItem, GasingMaterial } from '../types';
import P11GasingRenderer from './P11GasingRenderer';
import { 
  playBubblePop, 
  playSuccessStar, 
  playChimeStart, 
  isSoundEnabled, 
  setSoundEnabled 
} from '../utils/soundEffects';

export interface PracticeFlashcardArenaProps {
  questions: Question[];
  currentMaterial: GasingMaterial;
  currentPracticeIndex: number;
  practiceAnswers: Record<number, PracticeAnswerItem>;
  practiceInput: string;
  practiceSisaInput: string;
  flashcardState: 'idle' | 'correct' | 'wrong';
  streak: number;
  bestStreak?: number;
  starsEarned?: number;
  questionAttempts?: number;
  firstTryCorrectCount?: number;
  retryCount?: number;
  practiceElapsed: number;
  practiceActive: boolean;
  practiceEnded: boolean;
  p11Format?: 'vertikal' | 'horizontal';
  onAnswerSubmit: (e?: React.FormEvent | string, overrideVal?: string) => void;
  onInputChange: (val: string) => void;
  onSisaInputChange: (val: string) => void;
  onResetPractice: () => void;
  onRestartPractice: () => void;
  onNextMaterial?: () => void;
  nextMaterialCode?: string;
  calculatedStats: () => {
    correctCount: number;
    accuracyPercent: number;
    stars: number;
    message: string;
    messageColor: string;
    averageReflexSec: string;
  };
}

export const PracticeFlashcardArena: React.FC<PracticeFlashcardArenaProps> = ({
  questions,
  currentMaterial,
  currentPracticeIndex,
  practiceAnswers,
  practiceInput,
  practiceSisaInput,
  flashcardState,
  streak,
  bestStreak = 0,
  starsEarned = 0,
  questionAttempts = 0,
  firstTryCorrectCount = 0,
  retryCount = 0,
  practiceElapsed,
  practiceActive,
  practiceEnded,
  p11Format = 'vertikal',
  onAnswerSubmit,
  onInputChange,
  onSisaInputChange,
  onResetPractice,
  onRestartPractice,
  onNextMaterial,
  nextMaterialCode,
  calculatedStats,
}) => {
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
  const [hintAnimKey, setHintAnimKey] = useState<number>(0);
  const [activeInputFocus, setActiveInputFocus] = useState<'val' | 'sisa'>('val');
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const inputRef = useRef<HTMLInputElement>(null);

  const activeQuestion = questions[currentPracticeIndex];
  const isRemainderDivision = Boolean(activeQuestion?.answerText?.includes(' sisa '));
  const isP3Active = currentMaterial.id === 'P3' || Boolean(activeQuestion?.digits?.targetSum === 10);
  const isP4Active = currentMaterial.id === 'P4' || ((activeQuestion?.digits?.a === 10 || activeQuestion?.digits?.b === 10) && activeQuestion?.digits?.op === '+');
  const isP5Active = currentMaterial.id === 'P5' || (
    !isP4Active &&
    activeQuestion?.digits?.op === '+' &&
    (activeQuestion?.digits?.a ?? 0) <= 9 &&
    (activeQuestion?.digits?.b ?? 0) <= 9 &&
    ((activeQuestion?.digits?.a ?? 0) + (activeQuestion?.digits?.b ?? 0) >= 10)
  );
  const isSimpleHorizontalEquation = 
    !isP3Active &&
    activeQuestion?.displayFormat === 'horizontal' && 
    activeQuestion?.digits?.a !== undefined && 
    activeQuestion?.digits?.b !== undefined;

  // Reset hint & focus on question change
  useEffect(() => {
    if (practiceActive && !practiceEnded && inputRef.current) {
      inputRef.current.focus();
    }
    setShowHint(false);
    setHintLevel(1);
    setHintAnimKey(0);
    setActiveInputFocus('val');
  }, [currentPracticeIndex, practiceActive, practiceEnded]);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playBubblePop();
  };

  const handleNumpadPress = (char: string) => {
    playBubblePop();
    if (activeInputFocus === 'val') {
      if (practiceInput.length < 8) {
        onInputChange(practiceInput + char);
      }
    } else {
      if (practiceSisaInput.length < 6) {
        onSisaInputChange(practiceSisaInput + char);
      }
    }
  };

  const handleNumpadDelete = () => {
    playBubblePop();
    if (activeInputFocus === 'val') {
      onInputChange(practiceInput.slice(0, -1));
    } else {
      onSisaInputChange(practiceSisaInput.slice(0, -1));
    }
  };

  // Render question visual
  const renderQuestionVisual = () => {
    if (!activeQuestion) return null;
    const digits = activeQuestion.digits;

    // 1. Tampilan Khusus P3: Pasangan 10 (Persamaan Bersih untuk Mencongak Murni)
    if (isP3Active) {
      return (
        <div className="flex flex-col items-center justify-center w-full">
          {/* Persamaan 1 Kotak Terintegrasi (Posisi Statis Sempurna Tanpa Pergeseran) */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 font-display font-black text-4xl sm:text-6xl text-slate-900 select-none h-20 sm:h-24">
            {digits?.format === 'resultFirst' ? (
              <>
                <span className="text-emerald-700 bg-emerald-100/90 px-3.5 py-1 rounded-2xl border-2 border-emerald-300 leading-none">10</span>
                <span className="text-slate-400 font-sans leading-none">=</span>
                {digits?.missingPosition === 'a' ? (
                  <>
                    <div className={`w-18 sm:w-22 h-16 sm:h-20 px-3 rounded-2xl border-2 border-dashed flex items-center justify-center text-3xl sm:text-5xl font-mono ${
                      flashcardState === 'correct'
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-md'
                        : flashcardState === 'wrong'
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : practiceInput
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200 shadow-xs'
                        : 'border-slate-300 bg-white text-slate-400 shadow-inner'
                    }`}>
                      {practiceInput || <span className="text-slate-300">?</span>}
                    </div>
                    <span className="text-slate-400 font-sans leading-none">+</span>
                    <span className="text-slate-800 leading-none">{digits?.b}</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-800 leading-none">{digits?.a}</span>
                    <span className="text-slate-400 font-sans leading-none">+</span>
                    <div className={`w-18 sm:w-22 h-16 sm:h-20 px-3 rounded-2xl border-2 border-dashed flex items-center justify-center text-3xl sm:text-5xl font-mono ${
                      flashcardState === 'correct'
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-md'
                        : flashcardState === 'wrong'
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : practiceInput
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200 shadow-xs'
                        : 'border-slate-300 bg-white text-slate-400 shadow-inner'
                    }`}>
                      {practiceInput || <span className="text-slate-300">?</span>}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {digits?.missingPosition === 'a' ? (
                  <>
                    <div className={`w-18 sm:w-22 h-16 sm:h-20 px-3 rounded-2xl border-2 border-dashed flex items-center justify-center text-3xl sm:text-5xl font-mono ${
                      flashcardState === 'correct'
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-md'
                        : flashcardState === 'wrong'
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : practiceInput
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200 shadow-xs'
                        : 'border-slate-300 bg-white text-slate-400 shadow-inner'
                    }`}>
                      {practiceInput || <span className="text-slate-300">?</span>}
                    </div>
                    <span className="text-slate-400 font-sans leading-none">+</span>
                    <span className="text-slate-800 leading-none">{digits?.b}</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-800 leading-none">{digits?.a}</span>
                    <span className="text-slate-400 font-sans leading-none">+</span>
                    <div className={`w-18 sm:w-22 h-16 sm:h-20 px-3 rounded-2xl border-2 border-dashed flex items-center justify-center text-3xl sm:text-5xl font-mono ${
                      flashcardState === 'correct'
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-md'
                        : flashcardState === 'wrong'
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : practiceInput
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200 shadow-xs'
                        : 'border-slate-300 bg-white text-slate-400 shadow-inner'
                    }`}>
                      {practiceInput || <span className="text-slate-300">?</span>}
                    </div>
                  </>
                )}
                <span className="text-slate-400 font-sans leading-none">=</span>
                <span className="text-emerald-700 bg-emerald-100/90 px-3.5 py-1 rounded-2xl border-2 border-emerald-300 leading-none">10</span>
              </>
            )}
          </div>
        </div>
      );
    }

    // 2. Tampilan P1 & Persamaan Horizontal Standar (2 + 1 = [ ? ]) - Posisi Diam Permanen
    if (isSimpleHorizontalEquation) {
      const a = activeQuestion.digits?.a;
      const b = activeQuestion.digits?.b;
      const op = activeQuestion.digits?.op || '+';

      return (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex items-center justify-center gap-3 sm:gap-4 font-display font-black text-4xl sm:text-6xl text-slate-900 select-none h-20 sm:h-24">
            <span className="leading-none">{a}</span>
            <span className="text-slate-400 font-sans leading-none">{op}</span>
            <span className="leading-none">{b}</span>
            <span className="text-slate-400 font-sans leading-none">=</span>
            
            {/* Input Terintegrasi: Dimensi Tetap Stabil, Zero Shift */}
            <div className={`w-20 sm:w-24 h-16 sm:h-20 rounded-2xl border-2 border-dashed flex items-center justify-center font-mono text-3xl sm:text-5xl select-none ${
              flashcardState === 'correct'
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-md'
                : flashcardState === 'wrong'
                ? 'border-amber-400 bg-amber-50 text-amber-900'
                : practiceInput
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200 shadow-xs'
                : 'border-slate-300 bg-white text-slate-400 shadow-inner'
            }`}>
              {practiceInput || <span className="text-slate-300">?</span>}
            </div>
          </div>
        </div>
      );
    }

    // 3. Tampilan Khusus P11 (Penjumlahan Beruntun)
    const isP11 = currentMaterial.id === 'P11';
    let displayAsVertical = activeQuestion.displayFormat === 'vertical';
    let questionTextToRender = activeQuestion.questionText;
    let fullNums: number[] = [];

    if (isP11) {
      if (activeQuestion.displayFormat === 'vertical' || activeQuestion.questionText.includes('\n')) {
        const lines = activeQuestion.questionText.split('\n');
        fullNums = lines.map(line => parseInt(line.replace(/\./g, '').trim())).filter(num => !isNaN(num));
      } else {
        const cleanText = activeQuestion.questionText.replace('=', '');
        const parts = cleanText.split('+');
        fullNums = parts.map(part => parseInt(part.replace(/\./g, '').trim())).filter(num => !isNaN(num));
      }

      if (fullNums.length === 0) {
        fullNums = activeQuestion.digits?.extraNumbers || [];
      }

      displayAsVertical = p11Format === 'vertikal';

      return (
        <div className="flex items-center justify-center min-h-[160px]">
          <P11GasingRenderer
            numbers={fullNums}
            layout={displayAsVertical ? 'vertical' : 'horizontal'}
            showAnswers={false}
            size="xl"
          />
        </div>
      );
    }

    // 4. Tampilan Format Vertikal Umum
    if (displayAsVertical) {
      const lines = questionTextToRender.split('\n');
      const allExceptLast = lines.slice(0, -1);
      const lastLine = lines[lines.length - 1];
      return (
        <div className="inline-flex flex-col items-end font-display text-4xl sm:text-6xl tracking-widest text-slate-900 border-b-4 border-slate-900 pb-2 px-6">
          {allExceptLast.map((line, lIdx) => (
            <span key={lIdx}>{line}</span>
          ))}
          <div className="flex items-center gap-4">
            <span className="text-2xl sm:text-3xl font-display font-black text-emerald-600">
              {activeQuestion.digits?.op || '+'}
            </span>
            <span>{lastLine}</span>
          </div>
        </div>
      );
    }

    // 5. Fallback Soal Standar Lainnya
    return (
      <div className="font-display text-4xl sm:text-6xl font-black text-slate-900 tracking-wide select-none drop-shadow-xs">
        {questionTextToRender.replace('=', '').trim()}
      </div>
    );
  };

  // Render Kartu Satuan GASING (S) dengan Pola 5 Sejajar (Pedagogi GASING: 5 kartu per baris utuh)
  const renderMicroSatuanCards = (count: number, crossedCount = 0) => {
    if (count <= 0 && crossedCount <= 0) return null;

    // Kumpulkan daftar kartu (normal dan dicoret)
    const cards: { isCrossed: boolean; idx: number }[] = [];
    for (let i = 0; i < count; i++) {
      cards.push({ isCrossed: false, idx: i });
    }
    for (let i = 0; i < crossedCount; i++) {
      cards.push({ isCrossed: true, idx: count + i });
    }

    // Pola 5 GASING: Bagi ke dalam baris dengan tepat 5 kartu per baris
    const rows: { isCrossed: boolean; idx: number }[][] = [];
    for (let i = 0; i < cards.length; i += 5) {
      rows.push(cards.slice(i, i + 5));
    }

    return (
      <div className="flex flex-col items-start gap-1 p-1 sm:p-1.5 bg-amber-50/80 rounded-xl border border-amber-200/90 shadow-2xs">
        {rows.map((row, rIdx) => (
          <div key={`row-${rIdx}`} className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
            {row.map((card) => (
              <div
                key={`card-${card.idx}`}
                className={`relative shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg border-2 font-black text-[11px] sm:text-xs flex items-center justify-center shadow-xs select-none transition-all ${
                  card.isCrossed
                    ? 'border-rose-300 bg-rose-50 text-rose-300 opacity-60'
                    : 'border-amber-500 bg-amber-400 text-amber-950'
                }`}
                title="Kartu Satuan (S)"
              >
                <span>S</span>
                {card.isCrossed && (
                  <svg className="absolute inset-0 w-full h-full text-rose-600" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="4" />
                    <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="4" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Helper membagi kartu ke tumpukan maksimal 5 kartu per kolom (ciri khas gasing subitizing 5-an)
  const getStackSplit = (count: number): number[] => {
    if (count <= 0) return [];
    const stacks: number[] = [];
    let remaining = count;
    while (remaining > 5) {
      stacks.push(5);
      remaining -= 5;
    }
    if (remaining > 0) {
      stacks.push(remaining);
    }
    return stacks;
  };

  // Render 1 Tumpukan Kartu Satuan GASING (S) Ke Atas (Maksimal 5 kartu per kolom agar tidak terlalu tinggi)
  const renderSingleSatuanStack = (
    count: number,
    options?: {
      label?: string;
      subLabel?: string;
      theme?: 'amber' | 'emerald';
      dimmed?: boolean;
    }
  ) => {
    if (count <= 0) return null;
    const isEmerald = options?.theme === 'emerald';

    return (
      <div className={`flex flex-col items-center shrink-0 ${options?.dimmed ? 'opacity-35' : ''}`}>
        {options?.label && (
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {options.label}
          </span>
        )}

        {/* Tumpukan Kartu Satuan ke atas: ditumpuk dari bawah ke atas */}
        <div className="flex flex-col-reverse items-center justify-end gap-[1.5px] p-1 bg-amber-50/90 border border-amber-200/90 rounded-lg shadow-2xs">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={`single-vcard-${i}`}
              className={`w-7 sm:w-8 h-3.5 sm:h-4 rounded-[3px] border font-black text-[9px] sm:text-[10px] flex items-center justify-center select-none shadow-2xs transition-all ${
                isEmerald
                  ? 'border-emerald-500 bg-emerald-400 text-emerald-950'
                  : 'border-amber-500 bg-amber-400 text-amber-950'
              }`}
              title="Kartu Satuan"
            >
              <span>S</span>
            </div>
          ))}
        </div>

        {/* Tatakan dasar tumpukan kartu */}
        <div className="w-8 sm:w-9 h-1 bg-amber-300 rounded-full mt-1" />

        {/* Label Jumlah di Bawah */}
        {options?.subLabel !== undefined && (
          <span className="text-[10px] font-bold text-amber-950 font-mono mt-0.5">
            {options.subLabel}
          </span>
        )}
      </div>
    );
  };

  // Render Kartu Puluhan GASING (P) Besar Hijau Bersih (Tidak memanjang, tanpa teks berlebih)
  const renderBigPuluhanCard = () => {
    return (
      <div className="flex flex-col items-center shrink-0">
        <div className="w-13 sm:w-15 h-19 sm:h-21 rounded-xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-black flex items-center justify-center shadow-md select-none ring-2 ring-emerald-300/40">
          <span className="text-3xl sm:text-4xl font-black tracking-normal drop-shadow-xs">
            P
          </span>
        </div>
        <div className="w-11 sm:w-13 h-1 bg-emerald-400 rounded-full mt-1" />
        <span className="text-[10px] font-bold text-emerald-800 font-mono mt-0.5">
          1 Puluhan
        </span>
      </div>
    );
  };

  // Render Micro Hint GASING: Konkret -> Penggabungan -> Abstrak (Ringkas, visual-first, tanpa teks panjang)
  const renderMicroHint = () => {
    if (!activeQuestion) return null;
    const digits = activeQuestion.digits;
    const a = digits?.a ?? 1;
    const b = digits?.b ?? 1;
    const op = digits?.op || '+';
    const sum = a + b;

    // 1. Khusus P3: Pasangan 10
    if (isP3Active) {
      const known = digits?.knownNumber ?? (digits?.missingPosition === 'a' ? digits?.b : digits?.a) ?? 5;
      const partner = 10 - known;

      if (hintLevel === 1) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans">
            {/* Wadah 10 Kotak Satuan GASING (2 baris x 5 kolom) */}
            <div className="py-2.5 px-3 bg-white/90 border border-amber-200 rounded-2xl shadow-2xs flex flex-col items-center gap-1.5">
              {/* Baris 1: 5 Slot Pertama */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-black text-xs flex items-center justify-center select-none transition-all ${
                      i < known
                        ? 'border-2 border-amber-500 bg-amber-400 text-amber-950 shadow-xs'
                        : 'border-2 border-dashed border-slate-300 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {i < known ? 'S' : ''}
                  </div>
                ))}
              </div>
              {/* Baris 2: 5 Slot Kedua */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const idx = 5 + i;
                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-black text-xs flex items-center justify-center select-none transition-all ${
                        idx < known
                          ? 'border-2 border-amber-500 bg-amber-400 text-amber-950 shadow-xs'
                          : 'border-2 border-dashed border-slate-300 bg-slate-50 text-slate-300'
                      }`}
                    >
                      {idx < known ? 'S' : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Ada <strong className="text-amber-600 font-bold">{known}</strong> kartu. Berapa kartu lagi agar genap menjadi <strong className="text-emerald-700 font-bold">10</strong>?
            </p>

            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setHintLevel(2);
                setHintAnimKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        );
      }

      if (hintLevel === 2) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans" key={`p3-anim-${hintAnimKey}`}>
            {/* Wadah 10 Kotak Satuan GASING Terisi Penuh (Kartu Awal Oranye + Animasi Mengisi Kartu Pelengkap Hijau) */}
            <div className="py-2.5 px-3 bg-white/95 border border-emerald-200 rounded-2xl shadow-2xs flex flex-col items-center gap-1.5 relative overflow-hidden">
              {/* Baris 1: 5 Slot Pertama */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const isExisting = i < known;
                  const partnerIdx = i - known;
                  return (
                    <motion.div
                      key={i}
                      initial={!isExisting ? { scale: 0, opacity: 0, y: 15 } : { scale: 1, opacity: 1 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={!isExisting ? { delay: 0.3 + partnerIdx * 0.18, duration: 0.45, ease: "backOut" } : {}}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-black text-xs flex items-center justify-center select-none shadow-xs ${
                        isExisting
                          ? 'border-2 border-amber-500 bg-amber-400 text-amber-950'
                          : 'border-2 border-emerald-500 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300'
                      }`}
                    >
                      S
                    </motion.div>
                  );
                })}
              </div>
              {/* Baris 2: 5 Slot Kedua */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const idx = 5 + i;
                  const isExisting = idx < known;
                  const partnerIdx = idx - known;
                  return (
                    <motion.div
                      key={idx}
                      initial={!isExisting ? { scale: 0, opacity: 0, y: 15 } : { scale: 1, opacity: 1 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={!isExisting ? { delay: 0.3 + partnerIdx * 0.18, duration: 0.45, ease: "backOut" } : {}}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-black text-xs flex items-center justify-center select-none shadow-xs ${
                        isExisting
                          ? 'border-2 border-amber-500 bg-amber-400 text-amber-950'
                          : 'border-2 border-emerald-500 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300'
                      }`}
                    >
                      S
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="text-xs sm:text-sm font-semibold text-slate-700"
            >
              Perlu <strong className="text-emerald-700 font-bold">{partner}</strong> kartu lagi agar genap menjadi 10.
            </motion.p>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(1);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 cursor-pointer transition-colors"
              >
                ← Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintAnimKey((k) => k + 1);
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 cursor-pointer"
                title="Ulangi Animasi"
              >
                🔄 Ulang
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(3);
                }}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans">
          <div className="py-2.5 px-6 bg-white/90 border border-amber-200 rounded-2xl shadow-2xs">
            <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 select-none">
              <span className="text-amber-600">{known}</span>
              <span className="text-slate-400 mx-2 font-sans">+</span>
              <span className="text-emerald-700 font-black">{partner}</span>
              <span className="text-slate-400 mx-2 font-sans">=</span>
              <span className="text-slate-900">10</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-slate-700">
              Pasangan {known} adalah {partner}.
            </p>
            <p className="text-xs font-bold text-emerald-800">
              👉 Ketik <span className="font-mono text-emerald-900 text-sm font-black">{partner}</span> lalu tekan CEK.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setShowHint(false);
              setHintLevel(1);
            }}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Saya Coba!</span>
          </button>
        </div>
      );
    }

    // 2. Khusus P4: Penjumlahan 10 dengan Bilangan 1 Angka (Sesuai Belajar Mandiri: 10 Satuan Ditukar Menjadi 1 Puluhan [P])
    if (isP4Active && (a === 10 || b === 10)) {
      const onesVal = a === 10 ? b : a;
      const answerVal = 10 + onesVal;

      // Nama bilangan belasan khas GASING
      const getBelasanWord = (num: number) => {
        const words = ['', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
        return words[num] || `${num} belas`;
      };

      // TAHAP 1: Kuantitas Awal Satuan
      if (hintLevel === 1) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans">
            {/* Visual Bersih: Kartu Satuan Kiri & Kanan */}
            <div className="flex items-center justify-center gap-3 sm:gap-5 py-2.5 px-4 bg-white/95 border border-amber-200 rounded-2xl shadow-2xs">
              <div className="flex flex-col items-center gap-1">
                {renderMicroSatuanCards(10)}
                <span className="text-xs font-bold text-amber-900 font-mono">10 Satuan</span>
              </div>

              <span className="text-slate-300 font-black text-xl select-none">+</span>

              <div className="flex flex-col items-center gap-1">
                {renderMicroSatuanCards(onesVal)}
                <span className="text-xs font-bold text-amber-900 font-mono">{onesVal} Satuan</span>
              </div>
            </div>

            {/* Diksi Menuntun yang Alami & Humanis */}
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                10 satuan + {onesVal} satuan = <strong className="text-amber-900 font-bold">{10 + onesVal} satuan</strong>.
              </p>
              <p className="text-xs text-emerald-800 font-bold">
                Dari {10 + onesVal} satuan ada yang bisa ditukar, yaitu 10 satuan ditukar dengan 1 puluhan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setHintLevel(2);
                setHintAnimKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Yuk Tukar</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        );
      }

      // TAHAP 2: Penukaran Nilai Tempat & Bunyi Belasan (Animasi Menyatukan 10 Satuan -> Menjelma Jadi 1 Puluhan [P])
      if (hintLevel === 2) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans" key={`p4-anim-${hintAnimKey}`}>
            {/* Visual Animasi Penukaran Nilai Tempat */}
            <div className="py-2.5 px-3 sm:px-4 bg-white/95 border border-emerald-200 rounded-2xl shadow-2xs flex flex-col items-center gap-2 w-full overflow-hidden">
              {/* Layout horizontal non-wrapping yang pas di layar HP dengan margin presisi */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 w-full">
                {/* 10 Satuan asal yang ditukar */}
                <motion.div 
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: [1, 0.9, 0.75, 0.65], opacity: [1, 0.8, 0.45, 0.35] }}
                  transition={{ duration: 0.9, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
                  className="flex flex-col items-center justify-center shrink-0"
                >
                  <div className="scale-[0.68] sm:scale-75 origin-center">
                    {renderMicroSatuanCards(10)}
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold whitespace-nowrap mt-0.5">10 Satuan</span>
                </motion.div>

                {/* Panah Ditukar yang kokoh dan selalu di antara kedua sisi */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: [0.8, 1.25, 1], opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex flex-col items-center justify-center text-emerald-600 px-0.5 shrink-0"
                >
                  <span className="text-xl sm:text-2xl font-black leading-none">➔</span>
                  <span className="text-[7px] sm:text-[8px] font-bold text-emerald-700 uppercase tracking-tighter mt-0.5">DITUKAR</span>
                </motion.div>

                {/* Wadah Hasil Konkret: 1 Puluhan [P] + Satuan Sisa */}
                <motion.div 
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.45 }}
                  className="flex items-center gap-1 sm:gap-2 bg-emerald-50/70 p-1 sm:p-1.5 rounded-xl border border-emerald-200 shrink-0"
                >
                  {/* 1 Puluhan [P] */}
                  <motion.div 
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.8, duration: 0.5, ease: "backOut" }}
                    className="flex flex-col items-center gap-0.5 shrink-0"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 border-emerald-600 bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md ring-2 ring-emerald-300 select-none">
                      P
                    </div>
                  </motion.div>

                  {/* Kartu Satuan Riil Sisa (Berdampingan tanpa tanda +) */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.95, duration: 0.4 }}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <div className="scale-[0.75] sm:scale-85 origin-center">
                      {renderMicroSatuanCards(onesVal)}
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-amber-900 font-bold whitespace-nowrap font-mono">{onesVal} Satuan</span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Hasil Nilai Tempat & Angka */}
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.25, duration: 0.4 }}
                className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 text-xs font-bold text-slate-700"
              >
                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <span className="w-4 h-4 rounded bg-emerald-500 text-white text-[9px] font-black inline-flex items-center justify-center">P</span>
                  1 Puluhan
                </span>
                <span className="text-slate-400">+</span>
                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {onesVal} Satuan
                </span>
                <span className="text-slate-400">=</span>
                <span className="text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-300">
                  {answerVal}
                </span>
              </motion.div>
            </div>

            {/* Diksi Menuntun yang Jelas & Hangat */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="space-y-1"
            >
              <p className="text-xs sm:text-sm font-bold text-emerald-800">
                10 satuan ditukar jadi 1 puluhan!
              </p>
              <p className="text-xs text-slate-600 font-medium">
                1 puluhan dan {onesVal} satuan dibaca <strong className="text-emerald-900 font-extrabold capitalize">{getBelasanWord(onesVal)} ({answerVal})</strong>.
              </p>
            </motion.div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(1);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 cursor-pointer transition-colors"
              >
                ← Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintAnimKey((k) => k + 1);
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 cursor-pointer"
                title="Ulangi Animasi"
              >
                🔄 Ulang
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(3);
                }}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Lihat Angka</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        );
      }

      // TAHAP 3: Simbolik Abstrak (10 + n = 1n)
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans">
          <div className="py-2.5 px-6 bg-white/95 border border-emerald-200 rounded-2xl shadow-2xs">
            <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 select-none">
              <span>{a}</span>
              <span className="text-slate-400 mx-2 font-sans">+</span>
              <span>{b}</span>
              <span className="text-slate-400 mx-2 font-sans">=</span>
              <span className="text-emerald-600 font-black">{answerVal}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 capitalize">
              {a} + {b} = {answerVal} ({getBelasanWord(onesVal)})
            </p>
            <p className="text-xs font-bold text-emerald-800">
              👉 Ketik <span className="font-mono text-emerald-900 text-sm font-black">{answerVal}</span> lalu tekan CEK.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setShowHint(false);
              setHintLevel(1);
            }}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Saya Paham!</span>
          </button>
        </div>
      );
    }

    // 2.5 Khusus P5: Penjumlahan 2 Bilangan Hasilnya 10-20 (Pedagogi Diklat GASING: Penukaran 10 Satuan & Trik Kepala-Tangan)
    if (isP5Active && op === '+') {
      const headNum = a >= b ? a : b;
      const handNum = a >= b ? b : a;
      const partner = 10 - headNum;
      const onesRemainder = handNum - partner;

      const getBelasanWord = (num: number) => {
        const words = ['', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
        return words[num] || `${num} belas`;
      };

      // TAHAP 1: KONKRET & PENGGABUNGAN (5 & 5 Subitizing, Disejajarkan Tanpa Simbol +)
      if (hintLevel === 1) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-2.5 py-1 font-sans">
            <div className="flex flex-col items-center justify-center gap-2.5 py-2.5 px-3 sm:px-4 bg-white/95 border border-amber-200 rounded-2xl shadow-2xs max-w-full">
              {/* Baris Atas: Kiri + Kanan sebelum digabung */}
              <div className="flex items-end justify-center gap-4 sm:gap-7">
                {/* Kiri */}
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kiri</span>
                  <div className="flex items-end gap-1.5">
                    {getStackSplit(a).map((cnt, idx) => (
                      <div key={`left-stk-${idx}`}>
                        {renderSingleSatuanStack(cnt)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-amber-950 font-mono mt-1">{a} satuan</span>
                </div>

                <span className="text-slate-400 font-black text-base select-none self-center pb-4">+</span>

                {/* Kanan */}
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kanan</span>
                  <div className="flex items-end gap-1.5">
                    {getStackSplit(b).map((cnt, idx) => (
                      <div key={`right-stk-${idx}`}>
                        {renderSingleSatuanStack(cnt)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-amber-950 font-mono mt-1">{b} satuan</span>
                </div>
              </div>

              {/* Baris Bawah: Setelah Digabung (Tata letak: '↓ Digabung menjadi:', kartu gabungan dengan 10 satuan diberi tanda, angka total di bawah kartu) */}
              <div className="w-full border-t border-amber-200/80 pt-2 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  ↓ Digabung menjadi:
                </span>

                {/* Wadah Gabungan: 10 Satuan diberi tanda khusus, sisa satuan bersanding, total di bawah kartu */}
                <div className="flex flex-col items-center">
                  <div className="flex items-end justify-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-amber-50/80 rounded-2xl border border-amber-200/90 shadow-2xs">
                    {/* 10 Satuan (Diberi tanda bingkai putus-putus oranye tegas) */}
                    <div className="flex flex-col items-center p-1 sm:p-1.5 bg-amber-100/70 rounded-xl border-2 border-dashed border-amber-400">
                      <span className="text-[8px] sm:text-[8.5px] font-black text-amber-900 tracking-tight mb-0.5">
                        ✨ 10 Satuan
                      </span>
                      <div className="flex items-end gap-1.5">
                        {renderSingleSatuanStack(5)}
                        {renderSingleSatuanStack(5)}
                      </div>
                    </div>

                    {/* Sisa Satuan (disejajarkan tanpa tanda +) */}
                    {onesRemainder > 0 && (
                      <div className="flex items-end gap-1.5 pb-1">
                        {getStackSplit(onesRemainder).map((cnt, idx) => (
                          <div key={`combined-rem-stk-${idx}`}>
                            {renderSingleSatuanStack(cnt)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Angka total ditaruh di bawah kartu, persis seperti Kiri dan Kanan */}
                  <span className="text-[11px] font-bold text-amber-950 font-mono mt-1">
                    {sum} satuan
                  </span>
                </div>
              </div>
            </div>

            {/* Diksi Penjelas Langsung & To The Point */}
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                Dari <strong className="text-amber-950 font-mono font-bold">{sum} satuan</strong> ada yang bisa ditukar, yaitu <strong className="text-emerald-700 font-bold underline decoration-emerald-500 decoration-2 underline-offset-2">10 satuan</strong> ditukar dengan <strong className="text-emerald-900 font-extrabold">1 puluhan</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setHintLevel(2);
                setHintAnimKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Yuk Tukar</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        );
      }

      // TAHAP 2: PENUKARAN 10 SATUAN JADI 1 PULUHAN [P] + TRIK GASING (Bersih, Sederhana)
      // TAHAP 2: ANIMASI PENUKARAN 10 SATUAN JADI 1 PULUHAN [P] (Mengambil tampilan wadah gabungan Langkah 1 yang dianimasikan di tempat)
      if (hintLevel === 2) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-2.5 py-0.5 font-sans" key={`p5-anim-${hintAnimKey}`}>
            {/* Mengambil Tampilan Wadah Gabungan Langkah 1 yang Dianimasikan Ditukar */}
            <div className="flex flex-col items-center justify-center gap-2 py-2.5 px-3 sm:px-4 bg-white/95 border border-emerald-200 rounded-2xl shadow-2xs max-w-full">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <span>✨ 10 Satuan ditukar menjadi 1 Puluhan:</span>
              </span>

              {/* Wadah Gabungan yang sama dengan Langkah 1: 10 Satuan bertransformasi di tempatnya */}
              <div className="flex flex-col items-center p-2 sm:p-2.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 shadow-2xs">
                <div className="flex items-end justify-center gap-3 sm:gap-4">
                  {/* Slot Kiri: 10 Satuan yang dianimasikan bertukar menjadi 1 Puluhan [P] di tempat yang sama */}
                  <div className="relative flex items-center justify-center shrink-0 min-h-[96px] min-w-[70px]">
                    {/* 10 Satuan (5 & 5) awal yang menyusut dan menghilang */}
                    <motion.div
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 0.5, opacity: 0 }}
                      transition={{ delay: 0.8, duration: 0.45, ease: "easeInOut" }}
                      className="flex flex-col items-center absolute pointer-events-none origin-bottom"
                    >
                      <div className="flex items-end gap-1.5 p-1 bg-amber-100/90 rounded-xl border-2 border-dashed border-amber-400">
                        {renderSingleSatuanStack(5)}
                        {renderSingleSatuanStack(5)}
                      </div>
                      <span className="text-[9px] font-bold text-amber-900 mt-1">10 satuan</span>
                    </motion.div>

                    {/* 1 Puluhan [P] yang muncul mekar menggantikan 10 satuan di tempat yang persis sama */}
                    <motion.div
                      initial={{ scale: 0.2, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ delay: 1.0, duration: 0.5, ease: "backOut" }}
                      className="flex flex-col items-center"
                    >
                      {renderBigPuluhanCard()}
                    </motion.div>
                  </div>

                  {/* Slot Kanan: Sisa Satuan (Tetap tenang dan utuh di sampingnya dari Langkah 1) */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex items-end gap-1.5 pb-0.5">
                      {getStackSplit(onesRemainder).map((cnt, idx) => (
                        <div key={`step2-rem-${idx}`}>
                          {renderSingleSatuanStack(cnt)}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-amber-950 font-mono mt-1.5">
                      {onesRemainder} satuan
                    </span>
                  </div>
                </div>

                {/* Status Nilai Tempat Baru */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className="mt-1.5 pt-1.5 border-t border-emerald-200/80 w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-950"
                >
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">1 puluhan</span>
                  <span className="text-slate-400">dan</span>
                  <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md">{onesRemainder} satuan</span>
                </motion.div>
              </div>

              {/* Keterangan Bunyi Belasan */}
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.3 }}
                className="text-xs sm:text-sm font-bold text-slate-800"
              >
                Dibaca <strong className="text-emerald-700 font-extrabold capitalize">{getBelasanWord(onesRemainder)} ({sum})</strong>
              </motion.div>
            </div>

            {/* Tombol Navigasi Langkah 2 (Fokus Kartu Bersih) */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(1);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 cursor-pointer transition-colors"
              >
                ← Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintAnimKey((k) => k + 1);
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 cursor-pointer"
                title="Ulangi Animasi"
              >
                🔄 Ulang
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(3);
                }}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Trik Jari Cepat</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        );
      }

      // TAHAP 3: KHUSUS TRIK CEPAT KEPALA & JARI (Friendly, Humanis, Pakem Diksi 'Pasangan', Terpisah & Sangat Jelas)
      if (hintLevel === 3) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans">
            {/* Visualisasi Interaktif Kepala & Jari Tangan */}
            <div className="w-full flex items-center justify-center gap-3 sm:gap-5">
              {/* Kartu Kepala */}
              <div className="flex flex-col items-center bg-white/95 border-2 border-amber-300 rounded-2xl p-2.5 sm:p-3 shadow-2xs w-28 sm:w-32">
                <span className="text-2xl sm:text-3xl mb-0.5">🧠</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Di Kepala</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-950 font-mono mt-0.5">
                  {headNum}
                </span>
                <span className="text-[9px] font-semibold text-amber-800 mt-0.5 bg-amber-100/70 px-1.5 py-0.5 rounded-md">
                  Angka Besar
                </span>
              </div>

              <span className="text-slate-300 font-black text-xl select-none">+</span>

              {/* Kartu Jari Tangan */}
              <div className="flex flex-col items-center bg-white/95 border-2 border-emerald-300 rounded-2xl p-2.5 sm:p-3 shadow-2xs w-28 sm:w-32">
                <span className="text-2xl sm:text-3xl mb-0.5">🖐️</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Di Jari</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono mt-0.5">
                  {handNum}
                </span>
                <span className="text-[9px] font-semibold text-emerald-800 mt-0.5 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
                  Jari Terbuka
                </span>
              </div>
            </div>

            {/* Simulasi Jari Tangan: Ditekuk (Pasangan) vs Sisa Berdiri */}
            <div className="flex flex-col items-center gap-1.5 p-2.5 bg-white/95 border border-amber-200 rounded-2xl shadow-2xs w-full max-w-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Simulasi Jari Tangan ({handNum} Jari Dibuka)
              </span>
              <div className="flex items-center justify-center gap-1.5 py-1">
                {Array.from({ length: handNum }).map((_, i) => {
                  const isFolded = i < partner;
                  return (
                    <div
                      key={`finger-visual-${i}`}
                      className={`flex flex-col items-center justify-center w-8 sm:w-9 h-11 sm:h-12 rounded-xl border-2 transition-all ${
                        isFolded
                          ? 'bg-slate-100 border-dashed border-slate-300 text-slate-400 opacity-60 scale-90'
                          : 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-300 scale-100'
                      }`}
                    >
                      <span className="text-base">{isFolded ? '✊' : '☝️'}</span>
                      <span className="text-[8px] font-bold leading-none mt-0.5">
                        {isFolded ? 'Tekuk' : 'Sisa'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-2 text-[10.5px] font-semibold text-slate-600">
                <span className="text-slate-500">Tekuk {partner} (Pasangan {headNum})</span>
                <span>➔</span>
                <span className="text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Sisa jari berdiri = {onesRemainder}
                </span>
              </div>
            </div>

            {/* Kotak Tuntunan Langkah demi Langkah (Pedagogi GASING Pakem: Pasangan 9 adalah 1) */}
            <div className="p-3 sm:p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl text-left max-w-md w-full space-y-2 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <span>✨ Cara Asyik Menghitung dengan Jari</span>
                </span>
                <span className="text-[9px] font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Pedagogi GASING
                </span>
              </div>

              <div className="text-xs text-slate-700 space-y-1.5 leading-relaxed">
                <p className="flex items-start gap-1.5">
                  <span className="shrink-0 font-bold text-amber-800">1.</span>
                  <span>🧠 <strong>Simpan {headNum}</strong> di kepala, lalu 🖐️ <strong>buka {handNum} jari</strong> di tangan.</span>
                </p>

                <p className="flex items-start gap-1.5 bg-amber-100/60 p-1.5 rounded-xl border border-amber-300/60 font-medium">
                  <span className="shrink-0 font-bold text-amber-900">2.</span>
                  <span>
                    Kuncinya: <strong>Pasangan {headNum} itu {partner}</strong>! ➔ Yuk, <strong>tekuk {partner} jari</strong> di tanganmu.
                  </span>
                </p>

                <p className="flex items-start gap-1.5">
                  <span className="shrink-0 font-bold text-amber-800">3.</span>
                  <span>
                    Sisa jari yang masih berdiri sekarang tinggal: <strong className="text-amber-950 font-black">{onesRemainder} jari</strong>.
                  </span>
                </p>

                <div className="pt-1 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                    🗣️ Sebut: 10 dan {onesRemainder} ➔ <span className="capitalize">{getBelasanWord(onesRemainder)} ({sum})</span>! 🎉
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Navigasi Langkah 3 */}
            <div className="flex items-center justify-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(2);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 cursor-pointer transition-colors"
              >
                ← Kembali ke Kartu
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(4);
                }}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Lihat Angka</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        );
      }

      // TAHAP 4: SIMBOLIK & REFLEKS MENCONGAK (PERSAMAAN ANGKA)
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans">
          <div className="py-2.5 px-6 bg-white/95 border border-emerald-200 rounded-2xl shadow-2xs">
            <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 select-none">
              <span>{a}</span>
              <span className="text-slate-400 mx-2 font-sans">+</span>
              <span>{b}</span>
              <span className="text-slate-400 mx-2 font-sans">=</span>
              <span className="text-emerald-600 font-black">{sum}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 capitalize">
              1 puluhan dan {onesRemainder} satuan = {sum} ({getBelasanWord(onesRemainder)})
            </p>
            <p className="text-xs font-bold text-emerald-800">
              👉 Ketik <span className="font-mono text-emerald-900 text-sm font-black">{sum}</span> lalu tekan CEK.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setHintLevel(3);
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 cursor-pointer transition-colors"
            >
              ← Kembali
            </button>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setShowHint(false);
                setHintLevel(1);
              }}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Saya Paham!</span>
            </button>
          </div>
        </div>
      );
    }

    // 3. Untuk P1, P2 & Penjumlahan Dasar (Konkret -> Penggabungan Animasi -> Abstrak)
    if (op === '+') {
      // TAHAP 1: KONKRET (Dua kelompok kartu satuan identik dengan Belajar Mandiri)
      if (hintLevel === 1) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans">
            {/* Visual: Kelompok Kiri (a kartu S) + Kelompok Kanan (b kartu S) */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2.5 px-3 sm:px-4 bg-white/90 border border-amber-200 rounded-2xl shadow-2xs max-w-full">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kiri</span>
                {renderMicroSatuanCards(a)}
                <span className="text-[11px] font-bold text-amber-950 font-mono">
                  {a} kartu
                </span>
              </div>
              <span className="text-slate-400 font-black text-lg select-none self-center">+</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kanan</span>
                {renderMicroSatuanCards(b)}
                <span className="text-[11px] font-bold text-amber-950 font-mono">
                  {b} kartu
                </span>
              </div>
            </div>

            {/* Teks Humanis & Logis */}
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
              Ada <span className="font-bold text-amber-950 font-mono">{a}</span> kartu di sebelah kiri dan <span className="font-bold text-amber-950 font-mono">{b}</span> kartu di sebelah kanan.
            </p>

            {/* Tombol kecil [Gabungkan Kartu →] */}
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setHintLevel(2);
                setHintAnimKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Gabungkan Kartu</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        );
      }

      // TAHAP 2: PENGGABUNGAN (Proses kartu kiri & kanan meluncur saling mendekat menyatu menjadi satu wadah)
      if (hintLevel === 2) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans" key={`p1p2-anim-${hintAnimKey}`}>
            {/* Visual Penggabungan Teranimasi Halus */}
            <div className="flex flex-col items-center justify-center gap-2 py-2.5 px-4 bg-white/95 border border-amber-200 rounded-2xl shadow-2xs max-w-full overflow-hidden">
              {/* Fase 1: Dua kelompok meluncur ke tengah */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                <motion.div 
                  initial={{ x: -28, opacity: 0.7 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                  className="flex flex-col items-center"
                >
                  {renderMicroSatuanCards(a)}
                  <span className="text-[10px] text-slate-400 font-bold mt-0.5">{a} kartu</span>
                </motion.div>

                <motion.span 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-slate-400 font-black text-xs"
                >
                  +
                </motion.span>

                <motion.div 
                  initial={{ x: 28, opacity: 0.7 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                  className="flex flex-col items-center"
                >
                  {renderMicroSatuanCards(b)}
                  <span className="text-[10px] text-slate-400 font-bold mt-0.5">{b} kartu</span>
                </motion.div>
              </div>

              {/* Panah transisi ke bawah */}
              <motion.span 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="text-amber-500 font-black text-sm leading-none"
              >
                ⬇ menyatu menjadi
              </motion.span>

              {/* Fase 2: Wadah hasil utuh muncul secara mekar (Pola 5 Sejajar GASING) */}
              <motion.div 
                initial={{ scale: 0.85, opacity: 0, y: 8 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5, ease: "backOut" }}
                className="flex items-center justify-center p-1 bg-amber-50/50 rounded-xl border border-amber-300"
              >
                {renderMicroSatuanCards(sum)}
              </motion.div>
            </div>

            {/* Teks Singkat & Logis */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="space-y-1"
            >
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                Setelah digabung, semuanya menjadi <span className="text-emerald-800 font-black font-mono text-sm">{sum}</span> kartu.
              </p>
            </motion.div>

            {/* Navigasi [← Kembali], [🔄 Ulang], dan [Lanjut →] */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(1);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 cursor-pointer transition-colors"
              >
                ← Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintAnimKey((k) => k + 1);
                }}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 px-2 py-1 cursor-pointer"
                title="Ulangi Animasi"
              >
                🔄 Ulang
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(3);
                }}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Lihat Angka</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        );
      }

      // TAHAP 3: ABSTRAK (Simbol formal)
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans">
          {/* Visual Persamaan Formal */}
          <div className="py-2.5 px-6 bg-white/90 border border-amber-200 rounded-2xl shadow-2xs">
            <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 select-none">
              <span className="text-emerald-700">{a}</span>
              <span className="text-slate-400 mx-2 font-sans">+</span>
              <span className="text-emerald-700">{b}</span>
              <span className="text-slate-400 mx-2 font-sans">=</span>
              <span className="text-amber-500">{sum}</span>
            </div>
          </div>

          {/* Teks Singkat & Instruksi Langsung */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Jadi, <span className="font-mono font-bold text-slate-900">{a} + {b} = {sum}</span>.
            </p>
            <p className="text-xs font-bold text-emerald-800">
              👉 Ketik <span className="font-mono text-emerald-900 text-sm font-black">{sum}</span> lalu tekan CEK.
            </p>
          </div>

          {/* Tombol [Saya Coba!] */}
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setShowHint(false);
              setHintLevel(1);
            }}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Saya Coba!</span>
          </button>
        </div>
      );
    }

    // 4. Untuk Pengurangan Dasar (Konkret -> Ambil/Coret Animasi -> Abstrak)
    if (op === '-') {
      const diff = a - b;

      // TAHAP 1: KONKRET (Ada a kartu awal)
      if (hintLevel === 1) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans">
            <div className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-4 bg-white/90 border border-amber-200 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kartu Awal</span>
              {renderMicroSatuanCards(a)}
              <span className="text-[11px] font-bold text-amber-950 font-mono">
                {a} kartu
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
              Awalnya ada <span className="font-bold text-amber-950 font-mono">{a}</span> kartu satuan.
            </p>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setHintLevel(2);
                setHintAnimKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Ambil Kartu</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        );
      }

      // TAHAP 2: PROSES AMBIL / CORET TERANIMASI (Take-away: b kartu dicoret silang bertahap)
      if (hintLevel === 2) {
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans" key={`sub-anim-${hintAnimKey}`}>
            <div className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-4 bg-white/95 border border-rose-200 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Ambil {b} Kartu</span>
              
              {/* Animasi pencoretan kartu satuan */}
              <motion.div 
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {renderMicroSatuanCards(diff, b)}
              </motion.div>

              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="text-[11px] font-bold text-emerald-800 font-mono"
              >
                Tersisa {diff} kartu
              </motion.span>
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug"
            >
              Dari {a} kartu, diambil <span className="font-bold text-rose-600 font-mono">{b}</span> kartu sehingga tersisa <span className="font-bold text-emerald-800 font-mono">{diff}</span> kartu.
            </motion.p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(1);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 cursor-pointer transition-colors"
              >
                ← Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintAnimKey((k) => k + 1);
                }}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 px-2 py-1 cursor-pointer"
                title="Ulangi Animasi"
              >
                🔄 Ulang
              </button>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setHintLevel(3);
                }}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Lihat Angka</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        );
      }

      // TAHAP 3: ABSTRAK
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-3 py-1 font-sans">
          <div className="py-2.5 px-6 bg-white/90 border border-amber-200 rounded-2xl shadow-2xs">
            <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 select-none">
              <span className="text-emerald-700">{a}</span>
              <span className="text-slate-400 mx-2 font-sans">-</span>
              <span className="text-rose-600">{b}</span>
              <span className="text-slate-400 mx-2 font-sans">=</span>
              <span className="text-amber-500">{diff}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Jadi, <span className="font-mono font-bold text-slate-900">{a} - {b} = {diff}</span>.
            </p>
            <p className="text-xs font-bold text-emerald-800">
              👉 Ketik <span className="font-mono text-emerald-900 text-sm font-black">{diff}</span> lalu tekan CEK.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setShowHint(false);
              setHintLevel(1);
            }}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Saya Coba!</span>
          </button>
        </div>
      );
    }

    // Fallback Operasi Lainnya
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-2 py-1 font-sans">
        <p className="text-xs sm:text-sm text-slate-800">
          Gunakan langkah konkret ke abstrak sesuai Metode GASING!
        </p>
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setShowHint(false);
            setHintLevel(1);
          }}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
        >
          Tutup Bantuan
        </button>
      </div>
    );
  };

  const progressPercent = questions.length > 0
    ? Math.round(((currentPracticeIndex) / questions.length) * 100)
    : 0;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col font-sans select-none flex-1 justify-between gap-3 sm:gap-4" id="practice-flashcard-arena">
      {/* 1. HEADER SEDERHANA & BERSIH (Design System Beranda GASING) */}
      <div className="bg-white border-2 border-emerald-100/80 rounded-3xl p-3 sm:p-4 shadow-sm relative overflow-hidden flex-shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Tombol Kembali ke Beranda */}
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              onResetPractice();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-2xs"
          >
            <span>🏡</span>
            <span>Kembali</span>
          </button>

          {/* Label Soal X dari 25 */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-2xl text-xs font-black text-slate-700">
            <span>Soal {currentPracticeIndex + 1} dari {questions.length}</span>
          </div>

          {/* Kontrol Kanan: Bintang & Suara */}
          <div className="flex items-center gap-2">
            {/* Live Counter ⭐ Bintang */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/90 rounded-2xl text-xs font-black text-amber-900 shadow-2xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span className="font-mono text-sm">{starsEarned}</span>
            </div>

            {/* Timer Santai (Elemen Pendukung) */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-2xl text-xs font-mono font-bold text-slate-600">
              <span>⏱️ {practiceElapsed}s</span>
            </div>

            {/* Pengaturan Efek Suara */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                soundOn ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
              title={soundOn ? 'Suara Aktif' : 'Suara Mati'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Progress Bar Visual Sederhana (Hijau GASING) */}
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300 shadow-2xs"
            style={{ width: `${Math.max(progressPercent, 4)}%` }}
          />
        </div>
      </div>

      {/* 2. KARTU SOAL UTAMA (Tinggi Proporsional & Mengisi Layar Nyaman) */}
      {!practiceEnded && activeQuestion && (
        <div className="bg-white border-4 border-slate-100 rounded-[2.5rem] p-4 sm:p-7 shadow-xl shadow-slate-200/50 relative overflow-hidden flex flex-col items-center justify-between flex-1 w-full min-h-[490px] sm:min-h-[520px]">
          
          {/* Baris Status Atas Kartu: Tinggi Tetap 28px Tanpa Pergeseran */}
          <div className="w-full flex items-center justify-between h-7 mb-1 px-1 flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              {isP3Active ? 'Pasangan 10' : currentMaterial.title || 'Penjumlahan 1–5'}
            </span>

            {/* Badge Combo Status Bar (Tampil Konsisten Tanpa Menghilang Tiba-Tiba) */}
            {streak >= 2 && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-2.5 py-0.5 rounded-xl shadow-xs flex items-center gap-1 border border-amber-300/40 select-none">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>Combo {streak}!</span>
              </div>
            )}
          </div>

          {/* Area Soal: Tinggi Tetap Terkunci (h-36 sm:h-40) - Letak Angka & Teks 100% Diam Permanen */}
          <div
            className={`w-full h-36 sm:h-40 rounded-3xl border-2 flex flex-col items-center justify-center relative transition-colors flex-shrink-0 ${
              flashcardState === 'correct'
                ? 'border-emerald-300 bg-emerald-50/40 shadow-lg shadow-emerald-200/40'
                : flashcardState === 'wrong'
                ? 'border-amber-300 bg-amber-50/50 shadow-md shadow-amber-200/30'
                : 'border-slate-100 bg-slate-50/40'
            }`}
          >
            {/* Feedback Pop: Jawaban Benar (Melayang Tenang di Layer Atas Tanpa Mendorong Angka) */}
            <AnimatePresence>
              {flashcardState === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute -top-4 sm:-top-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white font-black text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-2xl shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2.5 z-30 border-2 border-emerald-300/40 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5 font-display">
                    <Sparkles className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
                    <span>🎉 Hebat!</span>
                    <span className="font-mono text-emerald-100 bg-emerald-700/60 px-2 py-0.5 rounded-lg text-xs sm:text-sm">
                      {activeQuestion.questionText.replace('=', '').trim()} = {activeQuestion.answerText}
                    </span>
                  </div>

                  <span className="bg-emerald-800/80 px-2.5 py-0.5 rounded-xl text-amber-300 font-extrabold flex items-center gap-1 text-xs border border-amber-300/40 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>+1 Bintang</span>
                  </span>
                </motion.div>
              )}

              {/* Feedback Pop: Jawaban Belum Tepat */}
              {flashcardState === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute -top-4 sm:-top-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs sm:text-sm px-4.5 py-2 rounded-2xl shadow-lg flex items-center gap-2 z-30 border-2 border-amber-300/40 select-none whitespace-nowrap"
                >
                  <Smile className="w-4 h-4 text-white" />
                  <span>
                    {questionAttempts >= 2 ? '💡 Coba lihat Trik GASING yuk!' : '😊 Hampir tepat! Yuk, coba lagi.'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visual Soal Utama */}
            {renderQuestionVisual()}

            {/* Kotak Input Khusus Pembagian Bersisa atau Format Vertikal Non-P1/P3 */}
            {!isP3Active && !isSimpleHorizontalEquation && (
              <div className="mt-4 flex items-center gap-3">
                <div 
                  onClick={() => setActiveInputFocus('val')}
                  className={`min-w-[100px] h-14 px-4 rounded-2xl border-2 font-mono text-3xl font-black flex items-center justify-center transition-all cursor-pointer ${
                    activeInputFocus === 'val'
                      ? 'border-emerald-600 bg-white ring-4 ring-emerald-200/60 shadow-md text-emerald-950'
                      : 'border-slate-200 bg-white/80 text-slate-700'
                  }`}
                >
                  {practiceInput || (
                    <span className="text-slate-300 text-2xl font-sans font-normal animate-pulse">?</span>
                  )}
                </div>

                {isRemainderDivision && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-500 uppercase">sisa</span>
                    <div
                      onClick={() => setActiveInputFocus('sisa')}
                      className={`min-w-[80px] h-14 px-3 rounded-2xl border-2 font-mono text-2xl font-black flex items-center justify-center transition-all cursor-pointer ${
                        activeInputFocus === 'sisa'
                          ? 'border-amber-500 bg-white ring-4 ring-amber-200/60 shadow-md text-amber-950'
                          : 'border-slate-200 bg-white/80 text-slate-700'
                      }`}
                    >
                      {practiceSisaInput || (
                        <span className="text-slate-300 text-xl font-sans font-normal animate-pulse">?</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hidden Input untuk Keyboard Fisik */}
            <input
              ref={inputRef}
              type="text"
              inputMode="none"
              value={activeInputFocus === 'val' ? practiceInput : practiceSisaInput}
              onChange={(e) => {
                if (activeInputFocus === 'val') {
                  onInputChange(e.target.value);
                } else {
                  onSisaInputChange(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (isP3Active && /^[1-9]$/.test(e.key)) {
                  e.preventDefault();
                  playBubblePop();
                  onInputChange(e.key);
                  onAnswerSubmit(e.key);
                  return;
                }
                if (e.key === 'Enter') {
                  onAnswerSubmit();
                } else if (e.key === 'Tab' && isRemainderDivision) {
                  e.preventDefault();
                  setActiveInputFocus(activeInputFocus === 'val' ? 'sisa' : 'val');
                }
              }}
              className="sr-only"
              autoFocus
            />
          </div>

          {/* 3. TRIK GASING: DEFAULT TERTUTUP DENGAN BANTUAN BERTAHAP (MICRO HINT) */}
          <div className="w-full my-2 flex flex-col items-center">
            {!showHint ? (
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setShowHint(true);
                  setHintLevel(1);
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border transition-all cursor-pointer shadow-2xs ${
                  questionAttempts >= 2
                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-bounce ring-2 ring-amber-200'
                    : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Butuh Bantuan?</span>
              </button>
            ) : null}

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mt-2 p-4 bg-amber-50/95 border border-amber-200 rounded-3xl text-xs font-medium text-slate-800 shadow-xs space-y-3"
                >
                  {/* Top Bar: Title 💡 Trik GASING & Micro Indicator ● ○ ○ */}
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200/70">
                    <div className="flex items-center gap-1.5 font-display font-extrabold text-xs text-amber-900">
                      <span>💡</span>
                      <span>Trik GASING</span>
                    </div>

                    {/* Indikator kecil bertahap: 4 tahap untuk P5, 3 tahap untuk materi lain */}
                    <div className="flex items-center gap-1.5 text-xs select-none font-mono" title={`Tahap ${hintLevel} dari ${isP5Active ? 4 : 3}`}>
                      <span className={hintLevel >= 1 ? "text-amber-600 font-bold" : "text-amber-200"}>●</span>
                      <span className={hintLevel >= 2 ? "text-amber-600 font-bold" : "text-slate-300"}>
                        {hintLevel >= 2 ? '●' : '○'}
                      </span>
                      <span className={hintLevel >= 3 ? "text-amber-600 font-bold" : "text-slate-300"}>
                        {hintLevel >= 3 ? '●' : '○'}
                      </span>
                      {isP5Active && (
                        <span className={hintLevel >= 4 ? "text-amber-600 font-bold" : "text-slate-300"}>
                          {hintLevel >= 4 ? '●' : '○'}
                        </span>
                      )}
                    </div>

                    {/* Tombol Tutup Mini */}
                    <button
                      type="button"
                      onClick={() => {
                        playBubblePop();
                        setShowHint(false);
                        setHintLevel(1);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-700 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                      title="Tutup Bantuan"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Konten Micro Hint (Konkret -> Penggabungan -> Abstrak) */}
                  {renderMicroHint()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. KEYPAD TAKTIL ANAK (Touch Target Nyaman & Presisi Jempol) */}
          <div className="w-full max-w-[360px] sm:max-w-sm mx-auto space-y-2 pt-2 pb-1" id="kids-tactile-numpad">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumpadPress(String(num))}
                  className="h-14 sm:h-16 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-display font-black text-2xl sm:text-3xl rounded-2xl border-2 border-slate-200 border-b-[5px] border-b-slate-300 active:border-b-2 active:translate-y-[3px] shadow-xs flex items-center justify-center transition-all cursor-pointer select-none"
                >
                  {num}
                </button>
              ))}

              {/* Hapus / DEL */}
              <button
                type="button"
                onClick={handleNumpadDelete}
                className="h-14 sm:h-16 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 font-display font-black text-lg rounded-2xl border-2 border-rose-200 border-b-[5px] border-b-rose-300 active:border-b-2 active:translate-y-[3px] shadow-xs flex items-center justify-center transition-all cursor-pointer select-none"
                title="Hapus Satu Angka"
              >
                <Delete className="w-6 h-6" />
              </button>

              {/* Angka 0 */}
              <button
                type="button"
                onClick={() => handleNumpadPress('0')}
                className="h-14 sm:h-16 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-display font-black text-2xl sm:text-3xl rounded-2xl border-2 border-slate-200 border-b-[5px] border-b-slate-300 active:border-b-2 active:translate-y-[3px] shadow-xs flex items-center justify-center transition-all cursor-pointer select-none"
                title="0"
              >
                0
              </button>

              {/* Tombol Kirim / CEK (Hijau GASING) */}
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  onAnswerSubmit();
                }}
                disabled={!practiceInput.trim()}
                className={`h-14 sm:h-16 font-display font-black text-base sm:text-lg rounded-2xl border-2 border-b-[5px] active:border-b-2 active:translate-y-[3px] shadow-md flex items-center justify-center gap-1.5 transition-all select-none ${
                  practiceInput.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border-emerald-700 border-b-emerald-800 shadow-emerald-600/30 cursor-pointer'
                    : 'bg-slate-100 text-slate-300 border-slate-200 border-b-slate-200 cursor-not-allowed opacity-50'
                }`}
              >
                <Check className="w-6 h-6 stroke-[3]" />
                <span>CEK</span>
              </button>
            </div>

            {/* Quick Sisa Toggle Bar if Remainder Division */}
            {isRemainderDivision && (
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveInputFocus('val')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    activeInputFocus === 'val'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  Ketik Hasil Utama
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInputFocus('sisa')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    activeInputFocus === 'sisa'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  Ketik Sisa Pembagian
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. HASIL SELESAI 25 SOAL (Berorientasi Selebrasi & Apresiasi Progres) */}
      {practiceEnded && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white border-4 border-amber-200 rounded-[2.5rem] p-6 sm:p-10 text-center shadow-xl shadow-amber-500/10 relative overflow-hidden space-y-6"
        >
          {/* Confetti Glow Background */}
          <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-amber-100/50 to-transparent pointer-events-none" />

          <div className="relative space-y-2">
            <div className="text-4xl sm:text-5xl select-none animate-bounce">🎉</div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
              {currentMaterial.code} SELESAI!
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-600 font-sans">
              {currentMaterial.title}
            </p>
          </div>

          {/* Kotak Bintang & Combo */}
          <div className="bg-amber-50/80 border-2 border-amber-200 rounded-3xl p-5 max-w-sm mx-auto shadow-inner flex items-center justify-around">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Star className="w-8 h-8 fill-amber-400 text-amber-500 drop-shadow" />
              </div>
              <span className="text-2xl sm:text-3xl font-black font-display text-amber-950">
                {starsEarned} Bintang
              </span>
              <span className="text-xs font-bold text-amber-700">Terkumpul</span>
            </div>

            <div className="w-[1px] h-12 bg-amber-200" />

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-orange-500 mb-1">
                <Flame className="w-7 h-7 fill-orange-500 text-orange-500" />
              </div>
              <span className="text-2xl sm:text-3xl font-black font-display text-orange-950">
                {bestStreak}
              </span>
              <span className="text-xs font-bold text-orange-700">Combo Terbaik</span>
            </div>
          </div>

          {/* Rangkuman 25 Soal Tuntas */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black font-display">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>{questions.length} Soal Selesai Dituntaskan!</span>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              {firstTryCorrectCount} Benar Langsung • {retryCount} Perlu Latihan / Terbantu
            </p>
          </div>

          {/* Tombol Aksi Akhir */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 font-display">
            <button
              type="button"
              onClick={() => {
                playChimeStart();
                onRestartPractice();
              }}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl border border-slate-300 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>🔄 Ulangi {currentMaterial.code}</span>
            </button>

            {onNextMaterial && (
              <button
                type="button"
                onClick={() => {
                  playSuccessStar();
                  onNextMaterial();
                }}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm sm:text-base py-3.5 px-7 rounded-2xl border-b-[4px] border-emerald-800 active:border-b-2 active:translate-y-[2px] shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🚀 Lanjut {nextMaterialCode || 'Materi Berikutnya'}</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PracticeFlashcardArena;
