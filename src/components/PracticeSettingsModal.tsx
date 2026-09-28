import React from 'react';
import { 
  X, 
  Settings, 
  Sparkles, 
  Printer, 
  Award, 
  BookOpen, 
  Eye, 
  EyeOff, 
  Check, 
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OperationType, GasingMaterial } from '../types';
import { playBubblePop } from '../utils/soundEffects';

export interface PracticeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onOpenBadgesModal: () => void;
  onOpenStoryModal: () => void;
}

export const PracticeSettingsModal: React.FC<PracticeSettingsModalProps> = ({
  isOpen,
  onClose,
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
  onOpenBadgesModal,
  onOpenStoryModal,
}) => {
  const operationsList: { id: OperationType; label: string; symbol: string; desc: string }[] = [
    { id: 'PENJUMLAHAN', label: 'Penjumlahan', symbol: '+', desc: 'Metode tambah dari kiri (P1–P11)' },
    { id: 'PENGURANGAN', label: 'Pengurangan', symbol: '−', desc: 'Metode kurang 1 digit & 2 digit (K1–K8)' },
    { id: 'PERKALIAN', label: 'Perkalian', symbol: '×', desc: 'Mencongak 1×1 sampai 20×20' },
    { id: 'PEMBAGIAN', label: 'Pembagian', symbol: '÷', desc: 'Bagi habis & bersisa notasi coret' },
  ];

  const levelsList: { id: 'Rendah' | 'Sedang' | 'Tinggi'; label: string; badge: string }[] = [
    { id: 'Rendah', label: 'Mudah', badge: 'Level 1' },
    { id: 'Sedang', label: 'Sedang', badge: 'Level 2' },
    { id: 'Tinggi', label: 'Sulit', badge: 'Level 3' },
  ];

  const currentMaterial = materials.find(m => m.id === selectedMaterialId) || materials[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
          id="practice-settings-modal-overlay"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white text-slate-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 relative my-auto max-h-[92vh] flex flex-col font-sans"
            id="practice-settings-modal-content"
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight font-display">
                    Pengaturan Latihan GASING
                  </h3>
                  <p className="text-xs text-slate-500 font-medium font-sans">
                    Atur materi, tingkat kesulitan, dan bantuan visual
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup Pengaturan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto py-4 space-y-5 pr-1 text-sm">
              {/* 1. Pilih Operasi */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 font-display">
                  1. Pilih Operasi Matematika
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {operationsList.map((op) => {
                    const isSelected = operation === op.id;
                    return (
                      <motion.button
                        key={op.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.92, transition: { type: "spring", stiffness: 600, damping: 12 } }}
                        onClick={() => {
                          playBubblePop();
                          onSelectOperation(op.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-colors cursor-pointer flex flex-col gap-1 select-none ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-200'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-display font-bold text-sm ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-800 border border-slate-200'
                          }`}>
                            {op.symbol}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="font-black text-xs sm:text-sm mt-1 font-display">{op.label}</span>
                        <span className={`text-[10px] leading-tight font-sans ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {op.desc}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Tingkat Kesulitan */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 font-display">
                  2. Tingkat Kesulitan (Level)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {levelsList.map((lvl) => {
                    const isSelected = randomLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => onSelectLevel(lvl.id)}
                        className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                          isSelected
                            ? 'bg-amber-400 text-amber-950 border-amber-400 shadow-sm ring-2 ring-amber-200 font-black'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        <div>{lvl.label}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-amber-900/70' : 'text-slate-400'}`}>
                          {lvl.badge}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Topik / Sub-Materi GASING */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  3. Topik Materi Terstruktur GASING
                </label>
                <div className="relative">
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => onSelectMaterial(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-800 p-3 pr-9 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.code}] {m.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {currentMaterial && (
                  <p className="text-[11px] text-slate-500 mt-1.5 pl-1 italic">
                    {currentMaterial.description || 'Penerapan langkah konkret, abstrak, hingga mencongak cepat.'}
                  </p>
                )}
              </div>

              {/* 4. Fitur Bantuan Belajar & Visual */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="block text-xs font-black uppercase tracking-wider text-slate-500">
                  4. Fitur Bantuan & Visualisasi
                </span>

                {/* Toggle Logika GASING */}
                {onToggleGasingSteps && (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="font-mono text-amber-600 font-black">¹²</span>
                        <span>Logika GASING (Angka Kecil)</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Tampilkan notasi angka kecil di atas angka puluhan
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleGasingSteps}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        showGasingSteps ? 'bg-amber-500' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          showGasingSteps ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Toggle Panduan Konsep */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Panduan Konsep (Konkret & Abstrak)</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Buka visualisasi interaktif langkah berpikir GASING
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleConceptGuide}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      showConceptGuide ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        showConceptGuide ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 5. Aksi Pendukung (Acak Soal, Cetak, Lencana, Cerita) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onGenerateNewQuestions();
                  }}
                  disabled={isGenerating}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer font-bold text-xs"
                >
                  <RotateCcw className={`w-4 h-4 text-orange-500 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Acak Soal</span>
                </button>

                <button
                  type="button"
                  onClick={onPrint}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer font-bold text-xs"
                >
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Cetak PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBadgesModal();
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer font-bold text-xs"
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Lencana</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenStoryModal();
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer font-bold text-xs"
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Soal Cerita</span>
                </button>
              </div>
            </div>

            {/* Footer Modal: Tombol Terapkan */}
            <div className="pt-4 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Kembali ke Taman Bermain</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PracticeSettingsModal;
