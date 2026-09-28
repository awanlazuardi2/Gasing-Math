import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  Globe, 
  X,
  Sparkles, 
  BookOpen, 
  Printer, 
  Zap, 
  Play,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OperationType, GASING_DATABASE } from '../types';
import { playBubblePop, playJuicyPop } from '../utils/soundEffects';
import { 
  getCurriculumProgress, 
  getCurriculumStats, 
  CurriculumProgressData,
  LastLearningActivity 
} from '../utils/progressTracker';

export type UserRole = 'student' | 'teacher' | 'parent';

export interface LetsReadGasingHomeProps {
  selectedRole?: UserRole | null;
  onSelectRole: (role: UserRole) => void;
  onStartPractice: (operation?: OperationType, materialId?: string, resumeIndex?: number) => void;
  onStartPrintable: (operation?: OperationType, materialId?: string) => void;
  onOpenPhilosophy: () => void;
  onOpenSettings?: () => void;
  onCloseHome?: () => void;
}

interface CarouselSlide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaAction: 'practice' | 'printable' | 'philosophy';
  bgColor: string;
  accentColor: string;
  illustrationType: 'hero-characters' | 'worksheet-preview' | 'magic-numbers';
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    tag: 'PETUALANGAN MATEMATIKA GASING',
    title: 'Belajar Berhitung Jadi Gampang, Asyik, dan Menyenangkan!',
    subtitle: 'Yuk belajar berhitung dengan cara yang asyik!',
    ctaText: 'Mulai Belajar',
    ctaAction: 'practice',
    bgColor: 'from-amber-50/70 via-rose-50/60 to-emerald-50/70',
    accentColor: '#16a34a',
    illustrationType: 'hero-characters'
  },
  {
    id: 2,
    tag: 'GENERATOR LEMBAR KERJA SD/MI',
    title: 'Cetak Lembar Kerja Siap Pakai Dalam 1 Klik',
    subtitle: 'Kop resmi sekolah, variasi soal bertahap, dan kunci jawaban otomatis.',
    ctaText: 'Buat Worksheet',
    ctaAction: 'printable',
    bgColor: 'from-sky-50/70 via-indigo-50/50 to-teal-50/60',
    accentColor: '#0284c7',
    illustrationType: 'worksheet-preview'
  },
  {
    id: 3,
    tag: 'KENAPA GASING BERBEDA?',
    title: 'Mengapa Matematika Bisa Dipelajari dengan Gampang, Asyik, dan Menyenangkan?',
    subtitle: 'Kenali cara berpikir di balik Metode GASING—dari pasangan 10 hingga cara memahami angka secara lebih konkret.',
    ctaText: 'Temukan Rahasianya',
    ctaAction: 'philosophy',
    bgColor: 'from-emerald-50/70 via-teal-50/60 to-amber-50/60',
    accentColor: '#15803d',
    illustrationType: 'magic-numbers'
  }
];

interface GasingCategoryCard {
  id: string;
  operation: OperationType;
  materialId?: string;
  title: string;
  subtitle: string;
  iconSymbol: string;
  badge: string;
  accentBg: string;
  svgIcon: React.ReactNode;
}

const CATEGORY_CARDS: GasingCategoryCard[] = [
  {
    id: 'cat-penjumlahan',
    operation: 'PENJUMLAHAN',
    title: 'Penjumlahan',
    subtitle: 'Yuk cari pasangan 10!',
    iconSymbol: '➕',
    badge: 'Pondasi',
    accentBg: 'bg-sky-50',
    svgIcon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12 select-none">
        <rect x="26" y="10" width="12" height="44" rx="6" fill="#38bdf8" />
        <rect x="10" y="26" width="44" height="12" rx="6" fill="#38bdf8" />
        <circle cx="32" cy="32" r="7" fill="#0284c7" />
        <circle cx="20" cy="20" r="3" fill="#fde047" />
        <circle cx="44" cy="44" r="3" fill="#fde047" />
      </svg>
    )
  },
  {
    id: 'cat-pengurangan',
    operation: 'PENGURANGAN',
    title: 'Pengurangan',
    subtitle: 'Coba trik coret!',
    iconSymbol: '➖',
    badge: 'Cepat',
    accentBg: 'bg-rose-50',
    svgIcon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12 select-none">
        <rect x="10" y="26" width="44" height="12" rx="6" fill="#fb7185" />
        <circle cx="20" cy="32" r="3.5" fill="#ffffff" />
        <circle cx="44" cy="32" r="3.5" fill="#ffffff" />
        <path d="M 46 14 Q 54 22, 48 30" stroke="#f43f5e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'cat-perkalian',
    operation: 'PERKALIAN',
    title: 'Perkalian',
    subtitle: 'Hitung dengan cepat!',
    iconSymbol: '✕',
    badge: 'Unggulan',
    accentBg: 'bg-amber-50',
    svgIcon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12 select-none">
        <g transform="translate(32, 32) rotate(45) translate(-32, -32)">
          <rect x="26" y="10" width="12" height="44" rx="6" fill="#fbbf24" />
          <rect x="10" y="26" width="44" height="12" rx="6" fill="#fbbf24" />
          <circle cx="32" cy="32" r="7" fill="#d97706" />
        </g>
        <circle cx="16" cy="18" r="3" fill="#f59e0b" />
        <circle cx="48" cy="46" r="3" fill="#f59e0b" />
      </svg>
    )
  },
  {
    id: 'cat-pembagian',
    operation: 'PEMBAGIAN',
    title: 'Pembagian',
    subtitle: 'Bagikan dengan cara GASING!',
    iconSymbol: '÷',
    badge: 'Mudah',
    accentBg: 'bg-emerald-50',
    svgIcon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12 select-none">
        <rect x="10" y="27" width="44" height="10" rx="5" fill="#34d399" />
        <circle cx="32" cy="16" r="6" fill="#059669" />
        <circle cx="32" cy="48" r="6" fill="#059669" />
      </svg>
    )
  },
  {
    id: 'cat-pasangan10',
    operation: 'PENJUMLAHAN',
    materialId: 'P2',
    title: 'Pasangan 10',
    subtitle: 'Temukan pasangan ajaib!',
    iconSymbol: '🔟',
    badge: 'Spesial',
    accentBg: 'bg-teal-50',
    svgIcon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12 select-none">
        <circle cx="32" cy="32" r="24" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="2.5" />
        <text x="32" y="38" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#0f766e" fontFamily="sans-serif">10</text>
        <circle cx="14" cy="18" r="4" fill="#f59e0b" />
        <circle cx="50" cy="18" r="4" fill="#38bdf8" />
      </svg>
    )
  },
  {
    id: 'cat-problem-solving',
    operation: 'PERKALIAN',
    materialId: 'X1',
    title: 'Tantangan Asyik',
    subtitle: 'Siap memecahkan tantangan seru!',
    iconSymbol: '🧩',
    badge: 'Tantangan',
    accentBg: 'bg-purple-50',
    svgIcon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12 select-none">
        <rect x="12" y="12" width="18" height="18" rx="4" fill="#c084fc" />
        <rect x="34" y="12" width="18" height="18" rx="4" fill="#a855f7" />
        <rect x="12" y="34" width="18" height="18" rx="4" fill="#a855f7" />
        <rect x="34" y="34" width="18" height="18" rx="4" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="43" cy="43" r="3" fill="#7e22ce" />
      </svg>
    )
  }
];

interface ModuleCardItem {
  id: string;
  operation: OperationType;
  materialId: string;
  title: string;
  classGrade: string;
  topicBadge: string;
  cardColor: string;
  illustrationSvg: React.ReactNode;
}

const POPULAR_MODULES: ModuleCardItem[] = [
  {
    id: 'mod-p1',
    operation: 'PENJUMLAHAN',
    materialId: 'P1',
    title: 'Mengenal Bilangan 1-10 & Konsep Konkret',
    classGrade: 'Kelas 1 SD',
    topicBadge: 'Pondasi Awal',
    cardColor: 'from-amber-400 to-orange-500',
    illustrationSvg: (
      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-white">
        <div className="text-3xl mb-1">🍎 🍎 🍎</div>
        <div className="text-xs font-bold tracking-wider opacity-90">3 + 2 = 5</div>
        <div className="mt-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Konkret ke Abstrak</div>
      </div>
    )
  },
  {
    id: 'mod-p2',
    operation: 'PENJUMLAHAN',
    materialId: 'P2',
    title: 'Rahasia Mencongak: Pasangan 10',
    classGrade: 'Kelas 1-2 SD',
    topicBadge: 'Trik Kilat',
    cardColor: 'from-emerald-500 to-teal-600',
    illustrationSvg: (
      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-white">
        <div className="text-2xl font-black mb-1">7 + 3 = 10</div>
        <div className="flex gap-1 items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-yellow-300"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-300"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-300"></span>
        </div>
        <div className="mt-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Teman 10 Otomatis</div>
      </div>
    )
  },
  {
    id: 'mod-x1',
    operation: 'PERKALIAN',
    materialId: 'X1',
    title: 'Perkalian 1-Digit Tanpa Menghafal Kaku',
    classGrade: 'Kelas 2-3 SD',
    topicBadge: 'Menyenangkan',
    cardColor: 'from-sky-500 to-blue-600',
    illustrationSvg: (
      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-white">
        <div className="text-3xl font-black mb-1">4 × 3</div>
        <div className="text-xs opacity-90">Penjumlahan Berulang Asyik</div>
        <div className="mt-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">GASING Perkalian</div>
      </div>
    )
  },
  {
    id: 'mod-k3',
    operation: 'PENGURANGAN',
    materialId: 'K3',
    title: 'Pengurangan Coret & Teman Angka',
    classGrade: 'Kelas 2-4 SD',
    topicBadge: 'Coret & Simpan',
    cardColor: 'from-rose-500 to-pink-600',
    illustrationSvg: (
      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-white">
        <div className="text-2xl font-black mb-1">15 − 8 = 7</div>
        <div className="text-xs opacity-90">Tanpa Bingung Meminjam</div>
        <div className="mt-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Trik Teman Kecil</div>
      </div>
    )
  },
  {
    id: 'mod-b1',
    operation: 'PEMBAGIAN',
    materialId: 'B1',
    title: 'Pembagian Kiri ke Kanan GASING',
    classGrade: 'Kelas 3-5 SD',
    topicBadge: 'Logika Jernih',
    cardColor: 'from-teal-600 to-emerald-700',
    illustrationSvg: (
      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-white">
        <div className="text-3xl font-black mb-1">84 ÷ 4</div>
        <div className="text-xs opacity-90">8÷4=2, 4÷4=1 → 21</div>
        <div className="mt-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Bagi Kiri-ke-Kanan</div>
      </div>
    )
  }
];

interface LastActivityData {
  title: string;
  operation?: OperationType;
  materialId?: string;
  progressPercent: number;
}

export const LetsReadGasingHome: React.FC<LetsReadGasingHomeProps> = ({
  onSelectRole,
  onStartPractice,
  onStartPrintable,
  onOpenPhilosophy
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const paginate = (newDirection: number) => {
    playBubblePop();
    setSlideDirection(newDirection);
    setCurrentSlideIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = CAROUSEL_SLIDES.length - 1;
      if (next >= CAROUSEL_SLIDES.length) next = 0;
      return next;
    });
  };

  const goToSlide = (idx: number) => {
    if (idx === currentSlideIndex) return;
    playBubblePop();
    setSlideDirection(idx > currentSlideIndex ? 1 : -1);
    setCurrentSlideIndex(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      paginate(1);
    } else if (diff < -45) {
      paginate(-1);
    }
    touchStartX.current = null;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Read real curriculum progress from tracker
  const [curriculumData, setCurriculumData] = useState<CurriculumProgressData>(() => getCurriculumProgress());

  // Re-check progress whenever component mounts or window gains focus
  useEffect(() => {
    const checkProgress = () => {
      setCurriculumData(getCurriculumProgress());
    };
    checkProgress();
    window.addEventListener('focus', checkProgress);
    return () => window.removeEventListener('focus', checkProgress);
  }, []);

  const lastActivity = curriculumData.lastActivity;
  const currentOp = lastActivity?.operation || 'PENJUMLAHAN';
  const opStats = getCurriculumStats(currentOp);

  const currentSlide = CAROUSEL_SLIDES[currentSlideIndex];

  const handleCtaClick = (action: 'practice' | 'printable' | 'philosophy') => {
    playJuicyPop();
    if (action === 'practice') {
      onStartPractice();
    } else if (action === 'printable') {
      onStartPrintable();
    } else {
      onOpenPhilosophy();
    }
  };

  const filteredCategories = CATEGORY_CARDS.filter(cat => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return cat.title.toLowerCase().includes(q) || cat.subtitle.toLowerCase().includes(q);
  });

  const filteredModules = POPULAR_MODULES.filter(b => {
    if (activeFilter === 'kelas12') return b.classGrade.includes('Kelas 1') || b.classGrade.includes('Kelas 2');
    if (activeFilter === 'kelas34') return b.classGrade.includes('Kelas 3') || b.classGrade.includes('Kelas 4');
    if (activeFilter === 'kelas56') return b.classGrade.includes('Kelas 5') || b.classGrade.includes('Kelas 6');
    return true;
  }).filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.classGrade.toLowerCase().includes(q) || b.topicBadge.toLowerCase().includes(q);
  });

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3 transition-all" id="gasing-header">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand: Geometric Origami Gasing + Typography */}
          <div 
            onClick={() => {
              playBubblePop();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer select-none group py-0.5"
            title="Beranda GASING MATH"
          >
            {/* Origami / Geometric Vector Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <svg viewBox="0 0 48 48" className="w-7 h-7 select-none">
                <polygon points="24,4 42,18 24,24 6,18" fill="#ffffff" opacity="0.95" />
                <polygon points="6,18 24,24 24,44" fill="#047857" />
                <polygon points="42,18 24,24 24,44" fill="#10b981" />
                <polygon points="24,24 33,34 24,44 15,34" fill="#fde047" opacity="0.9" />
                <circle cx="24" cy="44" r="2" fill="#ffffff" />
              </svg>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 leading-none">
                  GASING
                </span>
                <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 tracking-wider font-display">
                  MATH
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-tight mt-1 leading-none">
                Gampang, Asyik, Menyenangkan
              </p>
            </div>
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3 font-display">
            {/* Info / Methodology Button */}
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onOpenPhilosophy();
              }}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200"
              title="Tentang Metode GASING"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Tentang GASING</span>
              <span className="sm:hidden">Info</span>
            </button>

            {/* Direct Quick Action (Cetak / Latihan) on Desktop */}
            <button
              type="button"
              onClick={() => {
                playJuicyPop();
                onStartPractice();
              }}
              className="hidden md:inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Mulai Belajar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onStartPrintable();
              }}
              className="hidden md:inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Buat Worksheet</span>
            </button>

            {/* Hamburger Menu Button */}
            <button
              type="button"
              id="btn-gasing-menu-toggle"
              onClick={() => {
                playBubblePop();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer select-none"
              aria-label="Menu Navigasi"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              ) : (
                <div className="space-y-1 w-5">
                  <span className="block h-0.5 w-full bg-emerald-600 rounded-full"></span>
                  <span className="block h-0.5 w-full bg-emerald-600 rounded-full"></span>
                  <span className="block h-0.5 w-full bg-emerald-600 rounded-full"></span>
                </div>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-slate-100 mt-2 pt-3 pb-2 font-display"
            >
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playJuicyPop();
                    setIsMobileMenuOpen(false);
                    onStartPractice();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>Mulai Belajar</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    setIsMobileMenuOpen(false);
                    onStartPrintable();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-bold text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Buat Worksheet</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    setIsMobileMenuOpen(false);
                    onOpenPhilosophy();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-bold text-sm"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Pelajari Metode GASING</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-xs text-slate-500">
                  <span>Pilihan Peran:</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => { onSelectRole('student'); setIsMobileMenuOpen(false); }} className="px-2 py-1 bg-amber-100 text-amber-900 rounded-md font-bold">Siswa</button>
                    <button onClick={() => { onSelectRole('teacher'); setIsMobileMenuOpen(false); }} className="px-2 py-1 bg-sky-100 text-sky-900 rounded-md font-bold">Guru</button>
                    <button onClick={() => { onSelectRole('parent'); setIsMobileMenuOpen(false); }} className="px-2 py-1 bg-rose-100 text-rose-900 rounded-md font-bold">Ortu</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Hub Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 mt-5 sm:mt-8 space-y-8 sm:space-y-12">

        {/* ========================================================================= */}
        {/* 2. HERO CAROUSEL (User-swipeable with uniform height & fixed alignment)   */}
        {/* ========================================================================= */}
        <section className="relative w-full" aria-label="Hero GASING MATH">
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs transition-all select-none touch-pan-y group"
          >
            {/* Uniform Height Container for All Slides */}
            <div className="w-full h-[385px] sm:h-[260px] md:h-[270px] relative overflow-hidden">
              <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                <motion.div
                  key={currentSlide.id}
                  custom={slideDirection}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_e, { offset, velocity }) => {
                    const swipe = offset.x;
                    if (swipe < -40 || velocity.x < -300) {
                      paginate(1);
                    } else if (swipe > 40 || velocity.x > 300) {
                      paginate(-1);
                    }
                  }}
                  initial={{ opacity: 0, x: slideDirection > 0 ? 60 : -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: slideDirection > 0 ? -60 : 60 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute inset-0 w-full h-full bg-gradient-to-br ${currentSlide.bgColor} p-4 sm:p-7 md:p-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-6 pb-11 sm:pb-8 cursor-grab active:cursor-grabbing`}
                >
                  {/* Left Text & CTA */}
                  <div className="w-full md:w-3/5 text-left space-y-2 sm:space-y-3 z-10 flex flex-col justify-center">
                    {/* Category Tag */}
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/95 text-slate-800 text-[10px] sm:text-xs font-black tracking-wider uppercase font-display border border-slate-200/70 shadow-2xs">
                        {currentSlide.tag}
                      </span>
                    </div>

                    {/* Headline - Uniform line clamp & height */}
                    <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[32px] font-extrabold font-display text-slate-900 leading-[1.25] tracking-tight line-clamp-3 sm:line-clamp-2">
                      {currentSlide.title}
                    </h1>

                    {/* Short Friendly Subtitle */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-lg line-clamp-3 sm:line-clamp-2">
                      {currentSlide.subtitle}
                    </p>

                    {/* Primary CTA Button */}
                    <div className="pt-1 font-display">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCtaClick(currentSlide.ctaAction);
                        }}
                        className="inline-flex items-center gap-2 px-5 sm:px-7 py-2 sm:py-2.5 min-h-[44px] rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs sm:text-sm shadow-sm shadow-emerald-700/20 transition-all cursor-pointer group"
                      >
                        <span>{currentSlide.ctaText}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Right Illustration Area - Uniform container across all 3 slides */}
                  <div className="w-full md:w-2/5 flex items-center justify-center relative select-none shrink-0 h-32 sm:h-full">
                    {currentSlide.illustrationType === 'hero-characters' && (
                      <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center">
                        <div className="absolute inset-0 bg-white/60 rounded-full blur-lg"></div>
                        <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 drop-shadow-sm">
                          <circle cx="100" cy="100" r="75" fill="#f0fdf4" stroke="#86efac" strokeWidth="3" />
                          <polygon points="100,35 145,80 100,105 55,80" fill="#22c55e" />
                          <polygon points="55,80 100,105 100,165" fill="#15803d" />
                          <polygon points="145,80 100,105 100,165" fill="#16a34a" />
                          <circle cx="100" cy="165" r="4" fill="#f59e0b" />
                          <g transform="translate(40, 45)">
                            <circle cx="0" cy="0" r="16" fill="#fde047" />
                            <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350f" fontFamily="sans-serif">7+3</text>
                          </g>
                          <g transform="translate(160, 50)">
                            <circle cx="0" cy="0" r="16" fill="#38bdf8" />
                            <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0369a1" fontFamily="sans-serif">10</text>
                          </g>
                          <g transform="translate(155, 140)">
                            <circle cx="0" cy="0" r="16" fill="#f43f5e" />
                            <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#ffffff" fontFamily="sans-serif">✕</text>
                          </g>
                        </svg>
                      </div>
                    )}

                    {currentSlide.illustrationType === 'worksheet-preview' && (
                      <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center">
                        <div className="w-28 sm:w-34 bg-white p-2.5 rounded-xl shadow-md border border-slate-200 rotate-1 transition-transform hover:rotate-0">
                          <div className="h-1.5 w-14 bg-emerald-500 rounded mb-1.5"></div>
                          <div className="space-y-1">
                            <div className="h-1 bg-slate-200 rounded w-full"></div>
                            <div className="h-1 bg-slate-200 rounded w-4/5"></div>
                            <div className="grid grid-cols-2 gap-1 pt-1.5">
                              <div className="h-4.5 bg-slate-50 border border-slate-200 rounded text-[7.5px] flex items-center justify-center font-bold text-slate-700">12 + 8 = ...</div>
                              <div className="h-4.5 bg-slate-50 border border-slate-200 rounded text-[7.5px] flex items-center justify-center font-bold text-slate-700">25 − 9 = ...</div>
                              <div className="h-4.5 bg-slate-50 border border-slate-200 rounded text-[7.5px] flex items-center justify-center font-bold text-slate-700">6 × 7 = ...</div>
                              <div className="h-4.5 bg-slate-50 border border-slate-200 rounded text-[7.5px] flex items-center justify-center font-bold text-slate-700">36 ÷ 4 = ...</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSlide.illustrationType === 'magic-numbers' && (
                      <div className="w-full max-w-[240px] sm:max-w-[260px] flex items-center justify-center">
                        <div className="w-full bg-white/95 backdrop-blur-xs px-3 sm:px-4 py-3 sm:py-3.5 rounded-2xl shadow-sm border border-emerald-200/90 text-center space-y-2.5">
                          {/* Header: Pasangan Bilangan 10 */}
                          <div className="inline-flex items-center justify-center gap-1.5 bg-emerald-100/90 text-emerald-800 px-3.5 py-1 rounded-full border border-emerald-200">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-xs sm:text-[13px] font-extrabold font-display tracking-tight whitespace-nowrap">
                              Pasangan Bilangan 10
                            </span>
                          </div>

                          {/* Pairs: 2 balanced rows (3 on top, 2 on bottom) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-700 shadow-2xs">
                                1 & 9
                              </span>
                              <span className="whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-700 shadow-2xs">
                                2 & 8
                              </span>
                              <span className="whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-700 shadow-2xs">
                                3 & 7
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-700 shadow-2xs">
                                4 & 6
                              </span>
                              <span className="whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-700 shadow-2xs">
                                5 & 5
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Left and Right Chevron Buttons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center z-20 transition-all hover:scale-105 active:scale-95 cursor-pointer opacity-70 group-hover:opacity-100"
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center z-20 transition-all hover:scale-105 active:scale-95 cursor-pointer opacity-70 group-hover:opacity-100"
              aria-label="Slide berikutnya"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Carousel Navigation Dots */}
            <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-2 z-20">
              {CAROUSEL_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`h-2 transition-all rounded-full cursor-pointer ${
                    currentSlideIndex === idx
                      ? 'w-6 bg-[#16a34a]'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. LEARNING JOURNEY: FOKUS KURIKULUM GASING (DINAMIS & TERSTRUKTUR)       */}
        {/* ========================================================================= */}
        {(() => {
          // Kasus 1: Materi baru saja tuntas -> Tampilkan rekomendasi materi berikutnya
          if (lastActivity && lastActivity.status === 'completed') {
            const nextMat = lastActivity.nextMaterial;
            return (
              <section className="bg-gradient-to-r from-emerald-50/95 via-teal-50/80 to-amber-50/60 border border-emerald-300/80 rounded-2xl p-4 sm:p-5 shadow-xs font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xl shadow-xs shrink-0 select-none ring-2 ring-amber-300/50">
                      🏆
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-black text-emerald-800 uppercase tracking-wider font-display bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          {nextMat ? 'Materi Berikutnya' : 'Kurikulum Tuntas'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {opStats.completedCount}/{opStats.totalCount} Materi Tuntas
                        </span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-slate-900 font-display truncate mt-0.5">
                        {nextMat ? `${nextMat.code} — ${nextMat.title}` : `Hebat! Seluruh Materi Selesai`}
                      </div>
                      {/* Real Curriculum Progress Bar */}
                      <div className="flex items-center gap-2.5 mt-1.5">
                        <div className="w-32 sm:w-48 h-2.5 bg-emerald-200/70 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out" 
                            style={{ width: `${Math.max(5, opStats.percent)}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-emerald-800 font-display">
                          {opStats.percent}% Kurikulum
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playJuicyPop();
                      if (nextMat) {
                        onStartPractice(nextMat.operation, nextMat.materialId);
                      } else {
                        onStartPractice(lastActivity.operation, lastActivity.materialId);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-all cursor-pointer font-display shrink-0 self-start sm:self-auto"
                  >
                    <span>{nextMat ? `Lanjut ke ${nextMat.code}` : 'Latihan Lagi'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            );
          }

          // Kasus 2: Sesi sedang berlangsung (in_progress)
          if (lastActivity && lastActivity.status === 'in_progress') {
            const sessionPercent = Math.min(100, Math.round((lastActivity.answeredCount / Math.max(1, lastActivity.totalQuestions)) * 100));
            return (
              <section className="bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0 select-none">
                      ✏️
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider font-display">
                          Yuk Lanjut!
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Soal {lastActivity.answeredCount} dari {lastActivity.totalQuestions}
                        </span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-slate-900 font-display truncate mt-0.5">
                        {lastActivity.materialCode ? `${lastActivity.materialCode} — ` : ''}{lastActivity.title}
                      </div>
                      {/* Real Dynamic Session Progress Bar */}
                      <div className="flex items-center gap-2.5 mt-1">
                        <div className="w-32 sm:w-44 h-2 bg-emerald-200/80 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.max(6, sessionPercent)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-emerald-800 font-display">
                          {sessionPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playJuicyPop();
                      onStartPractice(lastActivity.operation, lastActivity.materialId, lastActivity.lastQuestionIndex);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-all cursor-pointer font-display shrink-0 self-start sm:self-auto"
                  >
                    <span>Lanjut Belajar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            );
          }

          // Kasus 3: Siswa Baru / Belum Ada Aktivitas -> Tampilkan Materi Pertama Kurikulum
          return (
            <section className="bg-gradient-to-r from-amber-50/80 via-emerald-50/50 to-teal-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xl shadow-xs shrink-0 select-none">
                    🌟
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider font-display">
                      Kurikulum GASING • Pondasi Awal
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-slate-900 font-display mt-0.5">
                      P1 — Penjumlahan 2 Bilangan (Hasil 1–5)
                    </div>
                    <p className="text-xs text-slate-600 font-sans mt-0.5">
                      Mulai langkah pertamamu: 0 dari {opStats.totalCount} materi tuntas (0%)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playJuicyPop();
                    onStartPractice('PENJUMLAHAN', 'P1');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-all cursor-pointer font-display shrink-0 self-start sm:self-auto"
                >
                  <span>Mulai Belajar P1</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          );
        })()}

        {/* ========================================================================= */}
        {/* 4. EXPLORATION CATEGORY GRID (P1: Heading & Secondary Search)             */}
        {/* ========================================================================= */}
        <section className="space-y-4" aria-label="Mau belajar apa hari ini?">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 tracking-tight">
                Mau belajar apa hari ini?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                Pilih operasi matematika yang ingin kamu kuasai!
              </p>
            </div>

            {/* Secondary Search & Filter Affordance - Full width on mobile to avoid empty right space */}
            <div className="w-full sm:w-auto flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="gasing-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari materi..."
                  className="w-full pl-8 pr-7 py-2 sm:py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 rounded-full outline-none transition-all font-sans text-slate-800 placeholder-slate-400 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                id="btn-filter-drawer"
                onClick={() => {
                  playBubblePop();
                  setShowFilterDrawer(!showFilterDrawer);
                }}
                className={`p-2 rounded-full sm:rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  showFilterDrawer || activeFilter !== 'all'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Filter Tingkatan Kelas"
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Drawer (Collapsible) */}
          <AnimatePresence>
            {showFilterDrawer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl p-3.5 font-display"
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 mr-1">Tingkatan:</span>
                    {[
                      { id: 'all', label: 'Semua Kelas' },
                      { id: 'kelas12', label: 'Kelas 1 - 2 SD' },
                      { id: 'kelas34', label: 'Kelas 3 - 4 SD' },
                      { id: 'kelas56', label: 'Kelas 5 - 6 SD' },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          activeFilter === filter.id
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {activeFilter !== 'all' && (
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Cards Grid with Child-Friendly Natural Microcopy (P1 items 7 & 8) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredCategories.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  playBubblePop();
                  onStartPractice(cat.operation, cat.materialId);
                }}
                className="bg-white hover:bg-emerald-50/20 border border-slate-200/90 hover:border-emerald-300 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex flex-col items-center justify-between min-h-[148px] sm:min-h-[160px] cursor-pointer shadow-2xs hover:shadow-sm transition-all select-none group text-center"
              >
                {/* Centered Vector Artwork with Consistent Container */}
                <div className="h-13 sm:h-14 flex items-center justify-center my-auto transition-transform group-hover:scale-105">
                  {cat.svgIcon}
                </div>

                {/* Natural Child-Friendly Copy without Ellipsis */}
                <div className="w-full pt-1.5 flex flex-col items-center">
                  <h3 className="text-xs sm:text-sm font-bold font-display text-slate-900 group-hover:text-emerald-700 transition-colors text-center leading-snug">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-sans text-center leading-tight mt-1 line-clamp-2 min-h-[28px] flex items-center justify-center">
                    {cat.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Outline Button Below Categories */}
          <div className="pt-2 flex justify-center font-display">
            <button
              type="button"
              onClick={() => {
                playJuicyPop();
                onStartPractice();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[48px] px-8 py-2.5 sm:py-3 rounded-full border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer group shadow-2xs"
            >
              <span>Jelajahi Seluruh Modul GASING</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. POPULAR MODULE SHELVES (Child-friendly tone & balanced colors)         */}
        {/* ========================================================================= */}
        <section className="space-y-4" aria-label="Pilihan Petualangan Seru">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 tracking-tight">
                Pilihan Petualangan Seru
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                Mulai dari tantangan seru hingga makin percaya diri berhitung!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playJuicyPop();
                onStartPractice();
              }}
              className="text-xs sm:text-sm font-bold text-[#16a34a] hover:text-[#15803d] inline-flex items-center gap-1 font-display group cursor-pointer shrink-0"
            >
              <span>Lihat Semua Modul</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredModules.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  playJuicyPop();
                  onStartPractice(item.operation, item.materialId);
                }}
                className="flex flex-col cursor-pointer group select-none"
              >
                {/* 3:4 Aspect Ratio Visual Card */}
                <div className={`w-full aspect-[3/4] rounded-2xl bg-gradient-to-br ${item.cardColor} p-3 shadow-sm group-hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between border border-black/5`}>
                  {/* Subtle Spine Accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/10"></div>

                  {/* Top Badge */}
                  <div className="flex justify-between items-center pl-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/30 backdrop-blur-xs text-white px-2 py-0.5 rounded-md font-display">
                      {item.classGrade}
                    </span>
                    <span className="text-xs">⭐</span>
                  </div>

                  {/* Center Illustration */}
                  <div className="w-full flex-1 flex items-center justify-center">
                    {item.illustrationSvg}
                  </div>

                  {/* Bottom Strip */}
                  <div className="pl-2 pt-1 border-t border-white/20">
                    <span className="text-[10px] font-bold text-white/95 block truncate">
                      {item.topicBadge}
                    </span>
                  </div>
                </div>

                {/* Card Title Below Visual */}
                <div className="mt-2 text-left space-y-0.5 px-0.5">
                  <h4 className="text-xs sm:text-sm font-bold font-display text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {item.classGrade}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. BUAT WORKSHEET (P1 item 9: Clearly distinct printable tool)            */}
        {/* ========================================================================= */}
        <section className="bg-slate-50/70 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4" aria-label="Buat Worksheet">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 text-[11px] font-bold font-display uppercase tracking-wider mb-1">
                Khusus Guru & Orang Tua
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2">
                🖨️ Buat Worksheet
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5">
                Latihan GASING siap dicetak.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playJuicyPop();
                onStartPrintable();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white text-xs sm:text-sm font-extrabold font-display transition-all cursor-pointer shrink-0 self-start sm:self-auto shadow-xs group"
            >
              <span>Buat Worksheet</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
            {[
              {
                title: 'Paket Pasangan 10 & Penjumlahan 1 Digit',
                desc: '25 - 50 Soal bertahap dengan format rapi dan kunci jawaban otomatis.',
                op: 'PENJUMLAHAN' as OperationType,
                mat: 'P2',
                badge: 'Kelas 1-2 SD'
              },
              {
                title: 'Paket Perkalian 1 Digit & 2 Digit Kilat',
                desc: 'Format mendatar atau bersusun dengan trik mencongak cepat.',
                op: 'PERKALIAN' as OperationType,
                mat: 'X1',
                badge: 'Kelas 3-4 SD'
              },
              {
                title: 'Paket Pembagian Kiri-ke-Kanan & Coret',
                desc: 'Soal pembagian tanpa cemas sisa dan trik coret pengurangan.',
                op: 'PEMBAGIAN' as OperationType,
                mat: 'B1',
                badge: 'Kelas 4-5 SD'
              }
            ].map((sheet, i) => (
              <div
                key={i}
                onClick={() => {
                  playJuicyPop();
                  onStartPrintable(sheet.op, sheet.mat);
                }}
                className="bg-white hover:border-emerald-400 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group select-none shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-display">
                      {sheet.badge}
                    </span>
                    <Printer className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold font-display text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {sheet.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {sheet.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 font-display">
                  <span>Buat Worksheet</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. TENTANG GASING (P0 items 1 & 3: Clean, Friendly & Authentic)           */}
        {/* ========================================================================= */}
        <section className="bg-slate-50/70 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5" aria-label="Tentang GASING">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-emerald-700 font-display">
              TENTANG GASING
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 tracking-tight">
              Belajar dengan Metode GASING
            </h2>

            {/* Prof. Yohanes Surya as Penggagas Metode GASING */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center font-black text-emerald-800 text-sm shadow-xs shrink-0 font-display">
                YS
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                  Prof. Yohanes Surya
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Penggagas Metode GASING
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans pt-1">
              Belajar matematika dengan cara Gampang, Asyik, dan Menyenangkan.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  onOpenPhilosophy();
                }}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 font-display hover:underline cursor-pointer"
              >
                <span>Pelajari Metode GASING</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3 Role Pathways */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 font-display">
            <button
              type="button"
              onClick={() => {
                playJuicyPop();
                onSelectRole('student');
              }}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all text-left flex flex-col justify-between cursor-pointer group min-h-[165px] sm:min-h-[175px]"
            >
              <div>
                <span className="text-2xl block mb-2 select-none">🎮</span>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Untuk Siswa / Anak</h4>
                <p className="text-xs text-slate-500 font-sans mt-1 leading-relaxed">Bermain mencongak kilat, raih bintang, dan pecahkan tantangan.</p>
              </div>
              <span className="mt-3 text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                Masuk Mode Siswa <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onSelectRole('teacher');
              }}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all text-left flex flex-col justify-between cursor-pointer group min-h-[165px] sm:min-h-[175px]"
            >
              <div>
                <span className="text-2xl block mb-2 select-none">👩‍🏫</span>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Untuk Guru</h4>
                <p className="text-xs text-slate-500 font-sans mt-1 leading-relaxed">Cetak lembar kerja PDF dengan kop sekolah dan format terstruktur.</p>
              </div>
              <span className="mt-3 text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                Masuk Mode Guru <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onSelectRole('parent');
              }}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all text-left flex flex-col justify-between cursor-pointer group min-h-[165px] sm:min-h-[175px]"
            >
              <div>
                <span className="text-2xl block mb-2 select-none">👨‍👩‍👧</span>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">Untuk Orang Tua</h4>
                <p className="text-xs text-slate-500 font-sans mt-1 leading-relaxed">Panduan praktis mendampingi anak belajar berhitung di rumah.</p>
              </div>
              <span className="mt-3 text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                Pelajari Panduan <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. FOOTER (P0 item 2: Exact GASING Structure)                             */}
        {/* ========================================================================= */}
        <footer className="pt-10 pb-8 text-center space-y-5 border-t border-slate-200 font-sans" id="gasing-footer">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-[#16a34a] select-none">
              GASING!
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Gampang • Asyik • Menyenangkan
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belajar matematika dengan cara yang membuat anak berani berhitung.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-slate-600 font-display">
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onStartPractice();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
            >
              Belajar
            </button>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onStartPrintable();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
            >
              Worksheet
            </button>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onOpenPhilosophy();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
            >
              Tentang GASING
            </button>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onSelectRole('teacher');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
            >
              Untuk Guru
            </button>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onSelectRole('parent');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
            >
              Untuk Orang Tua
            </button>
          </nav>

          <div className="pt-2 text-xs text-slate-400">
            © 2026 GASING Math
          </div>
        </footer>

      </main>
    </div>
  );
};

export default LetsReadGasingHome;
