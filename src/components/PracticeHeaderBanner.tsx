/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { 
  Printer, 
  Sparkles, 
  Award, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Star, 
  Check, 
  X, 
  Trophy,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OperationType, GasingMaterial } from '../types';

export interface PracticeHeaderBannerProps {
  operation: OperationType;
  onSelectOperation: (op: OperationType) => void;
  randomLevel: 'Rendah' | 'Sedang' | 'Tinggi';
  onSelectLevel: (lvl: 'Rendah' | 'Sedang' | 'Tinggi') => void;
  materials: GasingMaterial[];
  selectedMaterialId: string;
  onSelectMaterial: (id: string) => void;
  onGenerateNewQuestions: () => void;
  onPrint: () => void;
  isGenerating?: boolean;
  showConceptGuide: boolean;
  onToggleConceptGuide: () => void;
  showGasingSteps?: boolean;
  onToggleGasingSteps?: () => void;
  starsCount: number;
  streakCount: number;
  totalQuestions: number;
}

export const PracticeHeaderBanner: React.FC<PracticeHeaderBannerProps> = ({
  operation,
  onSelectOperation,
  randomLevel,
  onSelectLevel,
  materials,
  selectedMaterialId,
  onSelectMaterial,
  onGenerateNewQuestions,
  onPrint,
  isGenerating = false,
  showConceptGuide,
  onToggleConceptGuide,
  showGasingSteps = true,
  onToggleGasingSteps,
  starsCount,
  streakCount,
  totalQuestions
}) => {
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const operationsList: { id: OperationType; label: string; symbol: string }[] = [
    { id: 'PENJUMLAHAN', label: 'Tambah', symbol: '+' },
    { id: 'PENGURANGAN', label: 'Kurang', symbol: '−' },
    { id: 'PERKALIAN', label: 'Kali', symbol: '×' },
    { id: 'PEMBAGIAN', label: 'Bagi', symbol: '÷' },
  ];

  const levelsList: { id: 'Rendah' | 'Sedang' | 'Tinggi'; label: string }[] = [
    { id: 'Rendah', label: 'Mudah' },
    { id: 'Sedang', label: 'Sedang' },
    { id: 'Tinggi', label: 'Sulit' },
  ];

  const currentMaterial = materials.find(m => m.id === selectedMaterialId) || materials[0];

  return (
    <div className="no-print w-full bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-indigo-500/30 space-y-4">
      {/* Top Row: Stars / Points Badge & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Star / Point Counter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15 shadow-inner">
            <span className="text-amber-300 text-base animate-bounce">⭐</span>
            <span className="font-mono font-black text-sm text-amber-200">
              {starsCount} <span className="text-white/60 font-normal">/ {totalQuestions}</span>
            </span>
          </div>

          {streakCount >= 3 && (
            <div className="hidden sm:flex items-center gap-1 bg-amber-500/30 text-amber-200 border border-amber-400/40 px-3 py-1 rounded-xl text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Streak x{streakCount}</span>
            </div>
          )}
        </div>

        {/* Right: Action Buttons (Logika GASING, Panduan Konsep, Cetak Halaman, Lencana, Soal Baru) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Logika GASING (Angka Kecil) Toggle Button */}
          {onToggleGasingSteps && (
            <button
              type="button"
              onClick={onToggleGasingSteps}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-2xl transition-all cursor-pointer border ${
                showGasingSteps
                  ? 'bg-amber-400 text-amber-950 border-amber-300 font-black shadow-md shadow-amber-950/20'
                  : 'bg-black/20 text-amber-200 hover:bg-black/30 border-amber-400/20'
              }`}
              title="Aktifkan/Nonaktifkan Notasi GASING dengan Angka Kecil di Atas"
            >
              <span className="font-mono font-black text-xs leading-none">¹²</span>
              <span>{showGasingSteps ? 'Logika GASING' : 'Logika GASING'}</span>
            </button>
          )}

          {/* Panduan Konkret Toggle Button */}
          <button
            type="button"
            onClick={onToggleConceptGuide}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-2xl transition-all cursor-pointer border ${
              showConceptGuide 
                ? 'bg-white/20 text-white border-white/30 shadow-xs' 
                : 'bg-black/20 text-indigo-100 hover:bg-black/30 border-white/10'
            }`}
            title="Tampilkan/Sembunyikan Panduan Konkret GASING"
          >
            {showConceptGuide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-indigo-200" />}
            <span className="hidden md:inline">{showConceptGuide ? 'Tutup Panduan' : 'Panduan Konsep'}</span>
          </button>

          {/* Cetak Halaman (Green Pill) */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-black px-3.5 py-2 rounded-2xl shadow-md shadow-emerald-900/30 border border-emerald-400/40 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Halaman</span>
          </button>

          {/* Lencana (Yellow Pill) */}
          <button
            type="button"
            onClick={() => setShowBadgesModal(true)}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-amber-950 text-xs font-black px-3.5 py-2 rounded-2xl shadow-md shadow-amber-900/30 border border-amber-300 transition-all cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 fill-amber-950" />
            <span>Lencana</span>
          </button>

          {/* Soal Baru (Orange / Coral Button) */}
          <button
            type="button"
            onClick={onGenerateNewQuestions}
            disabled={isGenerating}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white text-xs font-black px-4 py-2 rounded-2xl shadow-md shadow-orange-900/30 border border-orange-400/40 transition-all cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Soal Baru</span>
          </button>
        </div>
      </div>

      {/* Center Operational Rows */}
      <div className="bg-black/15 backdrop-blur-xs rounded-2xl p-3 sm:p-3.5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Group 1: Operasi (Tambah, Kurang, Kali, Bagi, Cerita) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-black tracking-wider uppercase text-indigo-200 mr-1">
            Operasi:
          </span>
          {operationsList.map((op) => {
            const isSelected = operation === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => onSelectOperation(op.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-white text-indigo-950 border-white shadow-md shadow-indigo-950/20 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/10'
                }`}
              >
                <span className="font-mono text-xs opacity-75">{op.symbol}</span>
                <span>{op.label}</span>
              </button>
            );
          })}

          {/* Soal Cerita Button */}
          <button
            type="button"
            onClick={() => setShowStoryModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border bg-white/10 hover:bg-white/20 text-amber-200 border-amber-300/30"
          >
            <span>📖</span>
            <span>Cerita</span>
          </button>
        </div>

        {/* Group 2: Level (Mudah, Sedang, Sulit) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-black tracking-wider uppercase text-indigo-200 mr-1">
            Level:
          </span>
          {levelsList.map((lvl) => {
            const isSelected = randomLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => onSelectLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400 text-amber-950 border-amber-300 font-black shadow-md scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/10'
                }`}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Material Selector Dropdown & Topic Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono bg-indigo-500/40 text-indigo-200 px-2.5 py-0.5 rounded-full font-black border border-indigo-400/30 shrink-0">
            {currentMaterial?.code}
          </span>
          <span className="text-xs font-extrabold text-white truncate">
            {currentMaterial?.title}
          </span>
        </div>

        {/* Material Selection Dropdown */}
        <div className="relative shrink-0">
          <select
            value={selectedMaterialId}
            onChange={(e) => onSelectMaterial(e.target.value)}
            className="w-full sm:w-auto bg-black/30 hover:bg-black/40 text-xs font-semibold text-white px-3 py-1.5 pr-8 rounded-xl border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-amber-400 appearance-none cursor-pointer"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                [{m.code}] {m.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-white/70 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Modal Lencana & Prestasi */}
      <AnimatePresence>
        {showBadgesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative"
            >
              <button
                type="button"
                onClick={() => setShowBadgesModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Prestasi & Lencana GASING</h3>
                  <p className="text-xs text-slate-500">Koleksi pencapaian latihan matematika hebatmu!</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {/* Badge 1 */}
                <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
                  starsCount >= 5 ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-100 opacity-60'
                }`}>
                  <div className="text-2xl">🌟</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800">Bintang Pemula</p>
                    <p className="text-[11px] text-slate-500">Jawab benar minimal 5 soal latihan</p>
                  </div>
                  {starsCount >= 5 && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                </div>

                {/* Badge 2 */}
                <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
                  streakCount >= 5 ? 'bg-orange-50/60 border-orange-200' : 'bg-slate-50 border-slate-100 opacity-60'
                }`}>
                  <div className="text-2xl">🔥</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800">Streak Kilat</p>
                    <p className="text-[11px] text-slate-500">Capai 5 jawaban berturut-turut tanpa salah</p>
                  </div>
                  {streakCount >= 5 && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                </div>

                {/* Badge 3 */}
                <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
                  starsCount >= 20 ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50 border-slate-100 opacity-60'
                }`}>
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800">Master Mencongak</p>
                    <p className="text-[11px] text-slate-500">Kumpulkan 20 jawaban benar</p>
                  </div>
                  {starsCount >= 20 && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                </div>

                {/* Badge 4 */}
                <div className="p-3 rounded-2xl border bg-emerald-50/60 border-emerald-200 flex items-center gap-3">
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800">Metode GASING</p>
                    <p className="text-[11px] text-slate-500">Gampang, Asyik, dan Menyenangkan!</p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBadgesModal(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Soal Cerita */}
      <AnimatePresence>
        {showStoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative"
            >
              <button
                type="button"
                onClick={() => setShowStoryModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Soal Cerita GASING</h3>
                  <p className="text-xs text-slate-500">{currentMaterial.title}</p>
                </div>
              </div>

              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs leading-relaxed text-slate-700 space-y-2">
                <p className="font-bold text-indigo-900">💡 Contoh Cerita Kontekstual:</p>
                <p>
                  "Budi memiliki permen sesuai materi <strong>{currentMaterial.code}</strong>. Ia ingin membagikan atau menghitungnya bersama teman-temannya dengan cara GASING: dimulai dari pembagian adil atau penjumlahan cepat tanpa mencacah jari!"
                </p>
                <p className="text-[11px] text-indigo-600/80 italic">
                  Tip Guru: Ajak siswa menghubungkan angka-angka pada kartu latihan dengan objek nyata di sekitar mereka (pensil, kelereng, atau kue).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowStoryModal(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
              >
                Kembali ke Latihan
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticeHeaderBanner;
