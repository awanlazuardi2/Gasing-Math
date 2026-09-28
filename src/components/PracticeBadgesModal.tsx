import React, { useEffect } from 'react';
import { X, Trophy, Check, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playBubblePop, playSuccessStar } from '../utils/soundEffects';

export interface PracticeBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  starsCount: number;
  streakCount: number;
}

interface BadgeItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  target: number;
  current: number;
  unlocked: boolean;
  theme: string;
}

export const PracticeBadgesModal: React.FC<PracticeBadgesModalProps> = ({
  isOpen,
  onClose,
  starsCount,
  streakCount
}) => {
  useEffect(() => {
    if (isOpen) {
      playSuccessStar();
    }
  }, [isOpen]);

  const handleClose = () => {
    playBubblePop();
    onClose();
  };

  const badges: BadgeItem[] = [
    {
      id: 'b1',
      icon: '🌱',
      title: 'Langkah Pertama',
      desc: 'Jawab 1 soal dengan benar',
      target: 1,
      current: starsCount,
      unlocked: starsCount >= 1,
      theme: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'b2',
      icon: '⭐',
      title: 'Bintang Penjelajah',
      desc: 'Kumpulkan 5 bintang benar',
      target: 5,
      current: starsCount,
      unlocked: starsCount >= 5,
      theme: 'from-amber-400 to-orange-400'
    },
    {
      id: 'b3',
      icon: '🔥',
      title: 'Kombo Berapi-api',
      desc: 'Capai 3 jawaban benar berturut-turut',
      target: 3,
      current: streakCount,
      unlocked: streakCount >= 3,
      theme: 'from-orange-500 to-red-500'
    },
    {
      id: 'b4',
      icon: '🚀',
      title: 'Roket Refleks',
      desc: 'Kumpulkan 15 bintang latihan',
      target: 15,
      current: starsCount,
      unlocked: starsCount >= 15,
      theme: 'from-sky-400 to-indigo-500'
    },
    {
      id: 'b5',
      icon: '⚡',
      title: 'Kilat Halilintar',
      desc: 'Capai 7 kombo beruntun tanpa salah',
      target: 7,
      current: streakCount,
      unlocked: streakCount >= 7,
      theme: 'from-yellow-400 to-amber-500'
    },
    {
      id: 'b6',
      icon: '👑',
      title: 'Master GASING',
      desc: 'Kumpulkan 25 bintang prestasi',
      target: 25,
      current: starsCount,
      unlocked: starsCount >= 25,
      theme: 'from-purple-500 to-pink-500'
    },
    {
      id: 'b7',
      icon: '🔟',
      title: 'Sahabat Pasangan 10',
      desc: 'Kuasai konsep pasangan 10 dengan luwes',
      target: 1,
      current: starsCount >= 1 ? 1 : 0,
      unlocked: starsCount >= 1,
      theme: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'b8',
      icon: '🏆',
      title: 'Juara Tanpa Ragu',
      desc: 'Gampang, Asyik, dan Menyenangkan!',
      target: 1,
      current: 1,
      unlocked: true,
      theme: 'from-amber-500 to-yellow-400'
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm no-print">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white text-slate-800 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border-2 border-amber-100 relative max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Top decorative badge banner */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Trophy className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Lencana Prestasi GASING
                  </h3>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                    Koleksi {unlockedCount} dari {badges.length} lencana juara
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Unlocked Progress Bar */}
            <div className="py-2.5 px-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-black text-slate-600">
                <span>Pencapaian Petualang</span>
                <span className="text-amber-600 font-mono">{Math.round((unlockedCount / badges.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Scrollable Badges List */}
            <div className="space-y-2.5 overflow-y-auto pr-1 py-1 grow">
              {badges.map((badge) => {
                const pct = Math.min(100, Math.round((badge.current / badge.target) * 100));
                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                      badge.unlocked
                        ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                        : 'bg-slate-50/80 border-slate-100 opacity-70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-2xl shadow-xs">
                        {badge.icon}
                      </div>
                      {badge.unlocked && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      {!badge.unlocked && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center border-2 border-white shadow-xs">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-black text-slate-800 truncate">
                          {badge.title}
                        </h4>
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                          badge.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {badge.unlocked ? 'Terbuka ✨' : `${badge.current}/${badge.target}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {badge.desc}
                      </p>

                      {/* Mini progress bar if locked */}
                      {!badge.unlocked && (
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 active:scale-[0.99] text-white font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                Kembali Bermain 🚀
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PracticeBadgesModal;
