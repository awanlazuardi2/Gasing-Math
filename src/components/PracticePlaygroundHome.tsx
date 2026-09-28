/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Shuffle, 
  Check, 
  MoreVertical, 
  Settings, 
  Award, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Search, 
  Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OperationType, GasingMaterial, GASING_DATABASE } from '../types';
import { getCurriculumProgress } from '../utils/progressTracker';
import { 
  playBubblePop, 
  playJuicyPop,
  playChimeStart,
  playTapSound,
  playToggleSwitch,
  isSoundEnabled,
  setSoundEnabled
} from '../utils/soundEffects';

export interface PracticePlaygroundHomeProps {
  operation: OperationType;
  randomLevel: 'Rendah' | 'Sedang' | 'Tinggi';
  onChangeRandomLevel?: (lvl: 'Rendah' | 'Sedang' | 'Tinggi') => void;
  currentMaterial: GasingMaterial;
  starsCount: number;
  streakCount?: number;
  totalQuestions: number;
  onStartFlashcard: () => void;
  onStartGrid?: () => void;
  onOpenSettings: () => void;
  onOpenBadges: () => void;
  onToggleConceptGuide?: () => void;
  showConceptGuide?: boolean;
  onSelectQuickMaterial?: (op: OperationType, materialId: string) => void;
  onSelectOperation?: (op: OperationType) => void;
  onSelectMaterial?: (materialId: string) => void;
  onSetTotalQuestions?: (n: 25 | 50 | 100 | 150 | 200) => void;
  onBackToHome?: () => void;
  onOpenPrintable?: () => void;
  onOpenPhilosophy?: () => void;
}

interface OperationOption {
  op: OperationType;
  label: string;
  symbol: string;
}

const OPERATIONS: OperationOption[] = [
  { op: 'PENJUMLAHAN', label: 'Tambah', symbol: '+' },
  { op: 'PENGURANGAN', label: 'Kurang', symbol: '−' },
  { op: 'PERKALIAN', label: 'Kali', symbol: '×' },
  { op: 'PEMBAGIAN', label: 'Bagi', symbol: '÷' },
];

export const PracticePlaygroundHome: React.FC<PracticePlaygroundHomeProps> = ({
  operation,
  randomLevel,
  onChangeRandomLevel,
  currentMaterial,
  starsCount,
  totalQuestions,
  onStartFlashcard,
  onOpenSettings,
  onOpenBadges,
  onToggleConceptGuide,
  onSelectQuickMaterial,
  onSelectOperation,
  onSelectMaterial,
  onSetTotalQuestions,
  onBackToHome,
  onOpenPrintable,
  onOpenPhilosophy,
}) => {
  const [showOverflowMenu, setShowOverflowMenu] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [justSelectedMaterialId, setJustSelectedMaterialId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  
  // Tingkat Latihan: 'Mudah' | 'Sedang' | 'Menantang' (default 'Sedang')
  const [difficulty, setDifficulty] = useState<'Mudah' | 'Sedang' | 'Menantang'>(() => {
    try {
      const saved = localStorage.getItem('gasing_practice_difficulty');
      if (saved === 'Mudah' || saved === 'Sedang' || saved === 'Menantang') {
        return saved;
      }
    } catch {}
    return 'Sedang';
  });

  const overflowRef = useRef<HTMLDivElement>(null);

  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflowMenu(false);
      }
    };
    if (showOverflowMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showOverflowMenu]);

  // Reset search query when switching operations
  useEffect(() => {
    setSearchQuery('');
  }, [operation]);

  // Sound toggle handler inside overflow menu
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playBubblePop();
  };

  // Acak Soal status: true when randomLevel is 'Tinggi' or 'Sedang' (default ON)
  const isRandom = randomLevel !== 'Rendah';

  const handleToggleRandom = () => {
    playToggleSwitch();
    if (onChangeRandomLevel) {
      onChangeRandomLevel(isRandom ? 'Rendah' : 'Tinggi');
    }
  };

  // Difficulty switch handler
  const handleSelectDifficulty = (lvl: 'Mudah' | 'Sedang' | 'Menantang') => {
    playTapSound();
    setDifficulty(lvl);
    try {
      localStorage.setItem('gasing_practice_difficulty', lvl);
    } catch {}
  };

  // Switch Operation handler
  const handleSelectOperation = (newOp: OperationType) => {
    playTapSound();
    if (onSelectOperation) {
      onSelectOperation(newOp);
    }
  };

  // Select Material handler with micro spark trigger
  const handleSelectMaterialItem = (matId: string) => {
    playBubblePop();
    setJustSelectedMaterialId(matId);
    setTimeout(() => {
      setJustSelectedMaterialId((curr) => (curr === matId ? null : curr));
    }, 450);

    if (onSelectMaterial) {
      onSelectMaterial(matId);
    } else if (onSelectQuickMaterial) {
      onSelectQuickMaterial(operation, matId);
    }
  };

  // Set Total Questions handler
  const handleSetQuestions = (count: 25 | 50 | 100) => {
    playTapSound();
    if (onSetTotalQuestions) {
      onSetTotalQuestions(count);
    }
  };

  // Available real materials from database
  const materialsList = useMemo(() => {
    return GASING_DATABASE[operation] || [];
  }, [operation]);

  // Curriculum completed materials
  const completedMaterials = useMemo(() => {
    return getCurriculumProgress().completedMaterials;
  }, [operation]);

  const completedCount = useMemo(() => {
    return materialsList.filter(m => Boolean(completedMaterials[`${operation}:${m.id}`])).length;
  }, [materialsList, completedMaterials, operation]);

  // Filtered materials by search query
  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return materialsList;
    const q = searchQuery.toLowerCase().trim();
    return materialsList.filter(
      (m) =>
        m.code.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    );
  }, [materialsList, searchQuery]);

  // Clean example question extraction for preview
  const previewExample = useMemo(() => {
    if (currentMaterial?.example) {
      const parts = currentMaterial.example.split(/atau|\n|,/);
      const firstPart = parts[0]?.trim() || '';
      if (firstPart.includes('=')) {
        const leftSide = firstPart.split('=')[0]?.trim();
        if (leftSide) return `${leftSide} = ?`;
      }
    }
    switch (operation) {
      case 'PENJUMLAHAN':
        return '34 + 25 = ?';
      case 'PENGURANGAN':
        return '57 − 24 = ?';
      case 'PERKALIAN':
        return '6 × 7 = ?';
      case 'PEMBAGIAN':
        return '48 ÷ 6 = ?';
      default:
        return '34 + 25 = ?';
    }
  }, [currentMaterial, operation]);

  // Clean pedagogical method tip for preview
  const previewTip = useMemo(() => {
    if (currentMaterial?.teachingTip) {
      const firstSentence = currentMaterial.teachingTip.split(/[.!]/)[0]?.trim();
      if (firstSentence && firstSentence.length >= 6 && firstSentence.length <= 75) {
        return `${firstSentence} →`;
      }
    }
    switch (operation) {
      case 'PENJUMLAHAN':
        return 'Bekerja dari depan →';
      case 'PENGURANGAN':
        return 'Hitung dari depan dengan trik coret →';
      case 'PERKALIAN':
        return 'Perkalian mencongak satu baris →';
      case 'PEMBAGIAN':
        return 'Bagi dari kiri ke kanan →';
      default:
        return 'Bekerja dari depan →';
    }
  }, [currentMaterial, operation]);

  // Main CTA start handler: launches active practice session with micro shine
  const handleStartPractice = () => {
    setIsStarting(true);
    playJuicyPop();
    playChimeStart();
    setTimeout(() => {
      onStartFlashcard();
      setIsStarting(false);
    }, 140);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-16 flex flex-col font-sans select-none" id="practice-config-container">
      
      {/* ================================================== */}
      {/* 4. HEADER: Compact, context-focused, dynamic       */}
      {/* ================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 shadow-2xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Tombol Kembali + Context Operasi */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Tombol Kembali: touch target >= 44px with spring tap */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              onClick={() => {
                playTapSound();
                if (onBackToHome) {
                  onBackToHome();
                }
              }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer select-none shrink-0"
              title="Kembali ke Beranda"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            {/* Header Titles: Dinamis Mengikuti Operasi */}
            <div className="flex flex-col truncate">
              <motion.span 
                key={operation}
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="text-sm sm:text-base font-black tracking-tight text-slate-900 font-display leading-tight uppercase truncate"
              >
                {operation}
              </motion.span>
              <span className="text-[11px] text-slate-500 font-medium font-sans leading-tight truncate">
                Latihan berhitung dengan metode GASING
              </span>
            </div>
          </div>

          {/* Right: Badge Skor Bintang + Menu Overflow "⋯" */}
          <div className="flex items-center gap-2 shrink-0 relative" ref={overflowRef}>
            {/* Skor bintang reward */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black font-display shrink-0 select-none shadow-2xs"
              title={`Skor latihan: ${starsCount} Bintang`}
            >
              <span className="text-sm leading-none">⭐</span>
              <span className="leading-none">{starsCount}</span>
            </motion.div>

            {/* Tombol Overflow "⋮" (More) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              onClick={() => {
                playTapSound();
                setShowOverflowMenu(!showOverflowMenu);
              }}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors cursor-pointer select-none ${
                showOverflowMenu
                  ? 'bg-slate-100 text-slate-900 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200'
              }`}
              title="Menu Lainnya"
              aria-label="Menu Lainnya"
              aria-expanded={showOverflowMenu}
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>

            {/* Secondary Popover Menu */}
            <AnimatePresence>
              {showOverflowMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 p-2 z-50 font-sans"
                  role="menu"
                  aria-label="Menu Opsi Latihan"
                >
                  {/* KELOMPOK 1: BELAJAR */}
                  <div>
                    <div className="px-2.5 pt-1 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 font-display">
                      Belajar
                    </div>
                    <div className="space-y-0.5">
                      {/* Efek Suara */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleToggleSound}
                        className="w-full text-left px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100/90 active:bg-slate-200/70 flex items-center justify-between transition-colors cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                            soundOn ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {soundOn ? (
                              <Volume2 className="w-4 h-4" />
                            ) : (
                              <VolumeX className="w-4 h-4" />
                            )}
                          </div>
                          <span className="truncate">Efek Suara</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-display shrink-0 transition-colors ${
                          soundOn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {soundOn ? 'Aktif' : 'Mati'}
                        </span>
                      </button>

                      {/* Panduan GASING */}
                      {(onOpenPhilosophy || onToggleConceptGuide) && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            playJuicyPop();
                            setShowOverflowMenu(false);
                            if (onOpenPhilosophy) {
                              onOpenPhilosophy();
                            } else if (onToggleConceptGuide) {
                              onToggleConceptGuide();
                            }
                          }}
                          className="w-full text-left px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100/90 active:bg-slate-200/70 flex items-center justify-between transition-colors cursor-pointer select-none group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center transition-colors shrink-0 group-hover:bg-sky-100">
                              <HelpCircle className="w-4 h-4" />
                            </div>
                            <span className="truncate">Panduan GASING</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PEMBATAS */}
                  <div className="my-1.5 border-t border-slate-100" />

                  {/* KELOMPOK 2: PROGRES */}
                  <div>
                    <div className="px-2.5 pt-1 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 font-display">
                      Progres
                    </div>
                    <div className="space-y-0.5">
                      {/* Lencana & Prestasi */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          playTapSound();
                          setShowOverflowMenu(false);
                          onOpenBadges();
                        }}
                        className="w-full text-left px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100/90 active:bg-slate-200/70 flex items-center justify-between transition-colors cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center transition-colors shrink-0 group-hover:bg-amber-100">
                            <Award className="w-4 h-4" />
                          </div>
                          <span className="truncate">Lencana & Prestasi</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* PEMBATAS */}
                  <div className="my-1.5 border-t border-slate-100" />

                  {/* KELOMPOK 3: PENGATURAN */}
                  <div>
                    <div className="px-2.5 pt-1 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 font-display">
                      Pengaturan
                    </div>
                    <div className="space-y-0.5">
                      {/* Pengaturan */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          playTapSound();
                          setShowOverflowMenu(false);
                          onOpenSettings();
                        }}
                        className="w-full text-left px-2.5 py-2 min-h-[44px] rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100/90 active:bg-slate-200/70 flex items-center justify-between transition-colors cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center transition-colors shrink-0 group-hover:bg-slate-200/70">
                            <Settings className="w-4 h-4" />
                          </div>
                          <span className="truncate">Pengaturan</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ================================================== */}
      {/* MAIN CONFIGURATION BODY: Mobile-first & focused   */}
      {/* ================================================== */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 sm:pt-6 space-y-5 grow">
        
        {/* ================================================== */}
        {/* 5. QUICK SWITCHER OPERASI: Animated segmented bar */}
        {/* ================================================== */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-slate-700 font-display">
            Operasi Matematika
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-200/60 rounded-2xl border border-slate-200/80 relative">
            {OPERATIONS.map((item) => {
              const isSelected = operation === item.op;
              return (
                <motion.button
                  key={item.op}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  onClick={() => handleSelectOperation(item.op)}
                  className="relative min-h-[44px] py-2 px-1 rounded-xl text-xs sm:text-sm font-display font-black cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 select-none"
                >
                  {/* Smooth Animated Selection Indicator Pill */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-operation-pill"
                      className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 text-base sm:text-lg leading-none transition-colors duration-150 ${isSelected ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                    {item.symbol}
                  </span>
                  <span className={`relative z-10 leading-tight transition-colors duration-150 ${isSelected ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ================================================== */}
        {/* 6. PILIH MATERI: Real data from GASING_DATABASE   */}
        {/* ================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                Pilih Materi
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-sans">
                Pilih kemampuan yang ingin kamu latih.
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full">
              {completedCount > 0 ? `${completedCount}/${materialsList.length} Tuntas` : `${materialsList.length} Topik`}
            </span>
          </div>

          {/* Quick search input when list has > 4 materials */}
          {materialsList.length > 4 && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari materi atau topik..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Compact Material Cards Scroll Container */}
          <div className="max-h-56 sm:max-h-64 overflow-y-auto space-y-1.5 pr-1 -mr-1 rounded-2xl border border-slate-200/70 p-1.5 bg-white/70 shadow-2xs">
            {filteredMaterials.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Tidak ada materi yang sesuai pencarian.
              </div>
            ) : (
              filteredMaterials.map((mat) => {
                const isSelected = currentMaterial?.id === mat.id;
                const isSparking = justSelectedMaterialId === mat.id;
                const isCompleted = Boolean(completedMaterials[`${operation}:${mat.id}`]);
                return (
                  <motion.button
                    key={mat.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    onClick={() => handleSelectMaterialItem(mat.id)}
                    className={`w-full min-h-[46px] p-2.5 rounded-xl text-left transition-colors duration-150 cursor-pointer flex items-center justify-between gap-2.5 select-none relative ${
                      isSelected
                        ? 'bg-emerald-50/90 border-2 border-emerald-600 text-emerald-950 shadow-2xs ring-1 ring-emerald-500/20'
                        : 'bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Code Tag */}
                      <span
                        className={`text-[10px] sm:text-xs font-mono font-black px-2 py-0.5 rounded-md shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {mat.code}
                      </span>

                      {/* Title & Completion Badge */}
                      <span
                        className={`text-xs sm:text-sm font-bold font-display truncate transition-colors ${
                          isSelected ? 'text-emerald-950' : 'text-slate-800'
                        }`}
                        title={mat.title}
                      >
                        {mat.title}
                      </span>

                      {isCompleted && (
                        <span className="text-[9px] font-black uppercase font-display bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded-md shrink-0 select-none">
                          ⭐ Tuntas
                        </span>
                      )}
                    </div>

                    {/* Indicator Check Icon with Scale + Fade & Micro GASING Spark */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 450, damping: 22 }}
                          className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center relative shadow-xs"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />

                          {/* Micro GASING Spark Particles */}
                          {isSparking && (
                            <span className="absolute inset-0 pointer-events-none">
                              <motion.span
                                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                                animate={{ scale: 1, opacity: 0, x: -7, y: -7 }}
                                transition={{ duration: 0.38, ease: "easeOut" }}
                                className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-amber-400"
                              />
                              <motion.span
                                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                                animate={{ scale: 1, opacity: 0, x: 7, y: -6 }}
                                transition={{ duration: 0.38, ease: "easeOut" }}
                                className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400"
                              />
                              <motion.span
                                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                                animate={{ scale: 1, opacity: 0, x: 0, y: 8 }}
                                transition={{ duration: 0.38, ease: "easeOut" }}
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-300"
                              />
                            </span>
                          )}
                        </motion.div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-200" />
                      )}
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* 7. JUMLAH SOAL: Animated Segmented Indicator      */}
        {/* ================================================== */}
        <div className="space-y-1.5">
          <div className="text-xs sm:text-sm font-bold text-slate-900 font-display">
            Jumlah Soal
          </div>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/50 rounded-2xl border border-slate-200/80 relative">
            {([25, 50, 100] as const).map((count) => {
              const isSelected = totalQuestions === count;
              return (
                <motion.button
                  key={count}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  onClick={() => handleSetQuestions(count)}
                  className="relative min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-display font-black cursor-pointer flex items-center justify-center select-none"
                >
                  {/* Animated Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-questions-indicator"
                      className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-150 ${isSelected ? 'text-white' : 'text-slate-700 hover:text-slate-950'}`}>
                    {count} Soal
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ================================================== */}
        {/* 8. ACAK SOAL: Spring Toggle & Shuffle Rotation    */}
        {/* ================================================== */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          onClick={handleToggleRandom}
          className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Shuffle Icon with one smooth rotation on toggle */}
            <motion.div
              animate={{ rotate: isRandom ? 360 : 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-emerald-700"
            >
              <Shuffle className="w-5 h-5" />
            </motion.div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                Acak Soal
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-sans mt-0.5 truncate">
                Urutan soal berbeda setiap latihan
              </div>
            </div>
          </div>

          {/* Spring Toggle Switch */}
          <div className="flex items-center gap-2 shrink-0 min-h-[44px]">
            <motion.span
              key={isRandom ? 'on' : 'off'}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className={`text-[11px] font-black font-display uppercase tracking-wider ${isRandom ? 'text-emerald-700' : 'text-slate-400'}`}
            >
              {isRandom ? 'ON' : 'OFF'}
            </motion.span>
            <div className={`w-12 h-7 rounded-full transition-colors duration-200 relative p-1 flex items-center ${isRandom ? 'bg-emerald-600' : 'bg-slate-200'}`}>
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full bg-white shadow-xs ${isRandom ? 'ml-auto' : 'mr-auto'}`}
              />
            </div>
          </div>
        </motion.div>

        {/* ================================================== */}
        {/* 9. TINGKAT LATIHAN: Animated Segmented Indicator  */}
        {/* ================================================== */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="text-xs sm:text-sm font-bold text-slate-900 font-display">
              Tingkat Latihan
            </div>
            <span className="text-[11px] text-slate-400 font-sans">
              Variasi & ritme soal
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/50 rounded-2xl border border-slate-200/80 relative">
            {(['Mudah', 'Sedang', 'Menantang'] as const).map((lvl) => {
              const isSelected = difficulty === lvl;
              return (
                <motion.button
                  key={lvl}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  onClick={() => handleSelectDifficulty(lvl)}
                  className="relative min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-display font-black cursor-pointer flex items-center justify-center select-none"
                >
                  {/* Animated Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-difficulty-indicator"
                      className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-150 ${isSelected ? 'text-white' : 'text-slate-700 hover:text-slate-950'}`}>
                    {lvl}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ================================================== */}
        {/* 10. PREVIEW LATIHAN: Smooth subtle transitions     */}
        {/* ================================================== */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Preview Latihan
            </span>
            <span className="text-emerald-700 font-bold font-sans normal-case">
              GASING Method
            </span>
          </div>

          {/* Parameter Grid Overview with micro subtle updates */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded-xl border border-slate-100 min-h-[50px] flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Materi
              </span>
              <motion.span
                key={currentMaterial?.id}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="font-extrabold text-slate-800 font-display truncate block mt-0.5"
                title={`${currentMaterial?.code} — ${currentMaterial?.title}`}
              >
                {currentMaterial?.code} — {currentMaterial?.title}
              </motion.span>
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-100 min-h-[50px] flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Jumlah
              </span>
              <motion.span
                key={totalQuestions}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="font-extrabold text-slate-800 font-display block mt-0.5"
              >
                {totalQuestions} Soal
              </motion.span>
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-100 min-h-[50px] flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Urutan
              </span>
              <motion.span
                key={isRandom ? 'diacak' : 'berurutan'}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="font-extrabold text-slate-800 font-display block mt-0.5"
              >
                {isRandom ? 'Diacak' : 'Berurutan'}
              </motion.span>
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-100 min-h-[50px] flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Tingkat
              </span>
              <motion.span
                key={difficulty}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="font-extrabold text-slate-800 font-display block mt-0.5"
              >
                {difficulty}
              </motion.span>
            </div>
          </div>

          {/* Contoh Soal Sesuai Materi with focal-point animation */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">
              Contoh Soal
            </span>
            <motion.div
              key={previewExample}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-wider"
            >
              {previewExample}
            </motion.div>
            <motion.div
              key={previewTip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-emerald-700 font-semibold font-sans"
            >
              {previewTip}
            </motion.div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 11. CTA UTAMA: "▶ Mulai Latihan Sekarang"          */}
        {/* ================================================== */}
        <div className="pt-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            onClick={handleStartPractice}
            className="w-full min-h-[50px] py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-base font-display shadow-md shadow-emerald-700/20 active:shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 select-none relative overflow-hidden"
          >
            {/* Subtle Shine/Spark Sweep Effect on Click */}
            {isStarting && (
              <motion.div
                initial={{ x: '-100%', opacity: 0.7 }}
                animate={{ x: '200%', opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
              />
            )}

            {/* Play Icon with micro spring nudge */}
            <motion.span
              animate={isStarting ? { x: 3, scale: 1.15 } : { x: 0, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="text-sm"
            >
              ▶
            </motion.span>
            <span>Mulai Latihan Sekarang</span>
          </motion.button>
        </div>

      </main>
    </div>
  );
};

export default PracticePlaygroundHome;
