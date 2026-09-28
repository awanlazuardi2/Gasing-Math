import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, GasingMaterial, PracticeAnswerItem } from '../types';
import { PracticeQuestionCard } from './PracticeQuestionCard';
import { RotateCcw, Clock, Award, CheckCircle2, ArrowLeft, Star, Sparkles } from 'lucide-react';
import { playSuccessStar, playButtonClick, playJuicyPop } from '../utils/soundEffects';

interface PracticeGridArenaProps {
  questions: Question[];
  currentMaterial: GasingMaterial;
  materialId: string;
  practiceActive: boolean;
  practiceEnded: boolean;
  practiceElapsed: number;
  practiceAnswers: Record<number, PracticeAnswerItem>;
  activeGridIndex: number;
  activeGridPart: 'val' | 'sisa';
  isGrading: boolean;
  gradingIndex: number;
  isRemainderDivision: boolean;
  p11Format: 'vertikal' | 'horizontal';
  showNumbers: boolean;
  showGasingSteps: boolean;
  onSelectCell: (index: number, part: 'val' | 'sisa', slotId?: string) => void;
  onAutoMerge: (index: number) => void;
  onStartGrid: () => void;
  onFinishGrid: () => void;
  onResetPractice: () => void;
  checkQuestionCorrectness: (q: Question, ansObj?: PracticeAnswerItem, isRemainder?: boolean) => boolean;
  calculatedStats: () => {
    correctCount: number;
    accuracyPercent: number;
    stars: number;
    message: string;
    messageColor: string;
    averageReflexSec: string;
  };
}

export const PracticeGridArena: React.FC<PracticeGridArenaProps> = ({
  questions,
  currentMaterial,
  materialId,
  practiceActive,
  practiceEnded,
  practiceElapsed,
  practiceAnswers,
  activeGridIndex,
  activeGridPart,
  isGrading,
  gradingIndex,
  isRemainderDivision,
  p11Format,
  showNumbers,
  showGasingSteps,
  onSelectCell,
  onAutoMerge,
  onStartGrid,
  onFinishGrid,
  onResetPractice,
  checkQuestionCorrectness,
  calculatedStats,
}) => {
  // Count how many questions have answers
  const filledCount = useMemo(() => {
    return questions.filter((q) => {
      const a = practiceAnswers[q.id];
      return a && (a.val || a.sisa || (a.gasingInputs && Object.keys(a.gasingInputs).length > 0));
    }).length;
  }, [questions, practiceAnswers]);

  const progressPercent = questions.length > 0 ? Math.round((filledCount / questions.length) * 100) : 0;

  return (
    <div className={`bg-white border-2 border-slate-100 rounded-[2.5rem] p-4 sm:p-8 md:p-10 shadow-xl shadow-slate-100/70 text-left relative overflow-hidden transition-all ${
      practiceActive && !isGrading ? 'pb-80 md:pb-84' : ''
    }`}>
      {/* Top Playful Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black tracking-wider uppercase bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 font-display">
              <span>🎯</span>
              <span>MISI LEMBAR KERJA</span>
            </span>
            <span className="text-xs font-bold text-slate-400 font-display">
              [{currentMaterial.code}] {currentMaterial.title}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2 font-display">
            <span>Arena Lembar Digital</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Ketuk nomor soal untuk mengisi langkah berpikir GASING secara berurutan.
          </p>
        </div>

        {/* Action / Timer Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 font-display">
          {!practiceActive && !practiceEnded && (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.88, transition: { type: "spring", stiffness: 600, damping: 12 } }}
              onClick={() => {
                playJuicyPop();
                onStartGrid();
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-md shadow-emerald-200 cursor-pointer flex items-center gap-2 font-display select-none"
            >
              <span>🚀 Mulai Misi Grid</span>
            </motion.button>
          )}

          {practiceActive && (
            <>
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3.5 py-2.5 rounded-2xl shadow-xs font-display">
                <Clock className="w-4 h-4 text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
                <span>{practiceElapsed}d</span>
              </div>
              <button
                onClick={() => {
                  playSuccessStar();
                  onFinishGrid();
                }}
                className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-4 py-2.5 rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5 font-display"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Selesai & Nilai</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              playButtonClick();
              onResetPractice();
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            title="Keluar ke Taman Bermain"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Strip */}
      {practiceActive && (
        <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            ✍️
          </div>
          <div className="grow">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1">
              <span>Progres Pengerjaan</span>
              <span className="font-mono text-indigo-600 font-black">
                {filledCount} / {questions.length} Soal ({progressPercent}%)
              </span>
            </div>
            <div className="h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid Questions Area */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 transition-all ${
        practiceActive ? 'pb-12 sm:pb-16' : ''
      }`}>
        {questions.map((q, idx) => {
          const ansObj = practiceAnswers[q.id];
          const isCorrect = checkQuestionCorrectness(q, ansObj, isRemainderDivision);

          return (
            <PracticeQuestionCard
              key={q.id}
              q={q}
              idx={idx}
              ansObj={ansObj}
              isRemainderDivision={isRemainderDivision}
              isActive={practiceActive && activeGridIndex === idx && !isGrading}
              activePart={activeGridPart}
              onSelect={(newIdx, part, slotId) => onSelectCell(newIdx, part, slotId)}
              onAutoMerge={onAutoMerge}
              materialId={materialId}
              p11Format={p11Format}
              showNumbers={showNumbers}
              showGasingSteps={showGasingSteps}
              practiceEnded={practiceEnded}
              hasBeenGraded={isGrading && gradingIndex >= idx}
              isCorrect={isCorrect}
            />
          );
        })}
      </div>

      {/* Test Ended / Results Celebration Card */}
      {practiceEnded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
          className="mt-12 bg-white border-4 border-amber-200/80 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-amber-200/30 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-36 bg-gradient-to-b from-amber-50/80 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-md mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>MISI SELESAI! JUARA GASING!</span>
            </motion.div>

            {(() => {
              const stats = calculatedStats();
              return (
                <div className="flex flex-col items-center">
                  {/* Star Container with bouncy spring */}
                  <div className="flex items-end justify-center gap-3 md:gap-5 mb-8 h-28">
                    {[1, 2, 3].map((starNum) => {
                      const isAchieved = starNum <= stats.stars;
                      const size = starNum === 2 ? 'w-24 h-24 md:w-28 md:h-28' : 'w-20 h-20 md:w-22 md:h-22';
                      const yOffset = starNum === 2 ? '-translate-y-3' : '';

                      return (
                        <motion.div
                          key={starNum}
                          initial={{ opacity: 0, scale: 0, rotate: -45 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            rotate: isAchieved ? [0, 15, -15, 0] : 0,
                          }}
                          transition={{
                            delay: 0.3 + starNum * 0.15,
                            scale: { type: 'spring', bounce: 0.6 },
                            opacity: { duration: 0.2 },
                            rotate: { duration: 0.6, ease: 'easeInOut' }
                          }}
                          className={`${size} ${yOffset} relative drop-shadow-xl`}
                        >
                          <Star
                            className={`w-full h-full ${
                              isAchieved
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                                : 'text-slate-200 fill-slate-100'
                            } transition-colors duration-500`}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Message */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className={`text-2xl md:text-3xl font-black mb-3 ${stats.messageColor}`}
                  >
                    {stats.message}
                  </motion.h3>

                  <p className="text-sm md:text-base font-semibold text-slate-500 mb-8 max-w-md">
                    Hebat! Kamu berhasil menyelesaikan {questions.length} soal lembar kerja mandiri.
                  </p>

                  {/* Mini Stats Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg mx-auto mb-8"
                  >
                    <div className="bg-amber-50/70 border-2 border-amber-100 rounded-3xl p-4 text-center">
                      <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-widest block mb-1">Akurasi</span>
                      <span className="text-3xl font-black text-amber-900 font-mono">{stats.accuracyPercent}%</span>
                    </div>
                    <div className="bg-emerald-50/70 border-2 border-emerald-100 rounded-3xl p-4 text-center">
                      <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest block mb-1">Benar</span>
                      <span className="text-3xl font-black text-emerald-900 font-mono">
                        {stats.correctCount}<span className="text-base text-emerald-600">/{questions.length}</span>
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-indigo-50/70 border-2 border-indigo-100 rounded-3xl p-4 text-center">
                      <span className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-widest block mb-1">Waktu Total</span>
                      <span className="text-3xl font-black text-indigo-900 font-mono">
                        {practiceElapsed}<span className="text-base text-indigo-500 ml-0.5">s</span>
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })()}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap gap-3 justify-center mt-2"
            >
              <button
                onClick={() => {
                  playButtonClick();
                  onStartGrid();
                }}
                className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-7 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-emerald-200 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Ulangi Misi
              </button>
              <button
                onClick={() => {
                  playButtonClick();
                  onResetPractice();
                }}
                className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 px-7 py-3.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer"
              >
                🏡 Kembali ke Taman Bermain
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
