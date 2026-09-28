import React, { useEffect } from 'react';
import { Award, ExternalLink, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompetitionModal: React.FC<CompetitionModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print" id="competition-welcome-modal">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 overflow-hidden my-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Ambient Background Decorative Glow */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              id="close-competition-modal-btn"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer"
              aria-label="Tutup Dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content Header */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-5">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-3.5 rounded-2xl shadow-lg shadow-amber-500/25 shrink-0 text-slate-950 flex items-center justify-center">
                <Award className="w-8 h-8 drop-shadow-sm" />
              </div>
              <div className="text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-[11px] font-bold bg-amber-500 text-amber-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    MGMP Informatika MTs-MA Jatim
                  </span>
                  <span className="text-[11px] font-bold bg-indigo-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Departemen TI ITS
                  </span>
                </div>
                <h2 id="modal-title" className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
                  Kompetisi Nasional Inovasi Media Pembelajaran Berbasis IT 2026
                </h2>
              </div>
            </div>

            {/* Rationale & Description */}
            <div className="relative z-10 space-y-4 text-slate-200 text-sm leading-relaxed mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
              <p>
                Platform ini dihadirkan sebagai karya inovasi media pembelajaran interaktif untuk mendiseminasikan{' '}
                <strong className="text-amber-300 font-semibold">Metode GASING (Gampang, ASyIk, menyenaNGkan)</strong> karya Prof. Yohanes Surya ke seluruh madrasah dan sekolah di Indonesia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Generator LKPD A4 Standar Kedinasan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Simulator Latihan & Mencongak Real-time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Visualisasi Konkret-Abstrak Interaktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Responsif di HP, Tablet & Laptop</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-white/10">
              <a
                href="https://s.id/lombainovasimedia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-slate-700 hover:border-slate-600"
              >
                <span>Lihat Juknis Resmi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                id="explore-platform-btn"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Mulai Jelajahi Platform</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default CompetitionModal;
