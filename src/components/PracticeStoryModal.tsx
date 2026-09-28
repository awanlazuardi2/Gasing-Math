import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GasingMaterial } from '../types';

export interface PracticeStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: GasingMaterial;
}

export const PracticeStoryModal: React.FC<PracticeStoryModalProps> = ({
  isOpen,
  onClose,
  material
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Soal Cerita GASING</h3>
                <p className="text-xs text-slate-500 font-medium">[{material.code}] {material.title}</p>
              </div>
            </div>

            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs leading-relaxed text-slate-700 space-y-2.5">
              <p className="font-bold text-indigo-900">💡 Contoh Cerita Kontekstual:</p>
              <p>
                "Budi memiliki objek matematika sesuai materi <strong>[{material.code}]</strong>. Ia ingin membagikan atau menghitungnya bersama teman-temannya dengan cara GASING: dimulai dari langkah konkret, visualisasi teratur, hingga hitung cepat tanpa mencacah jari!"
              </p>
              <p className="text-[11px] text-indigo-700/80 italic pt-1 border-t border-indigo-100">
                Tip Guru: Ajak siswa menghubungkan angka-angka pada kartu latihan dengan objek nyata di sekitar mereka (pensil, kelereng, atau kue).
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Kembali ke Latihan
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PracticeStoryModal;
