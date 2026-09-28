import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Binary, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Hash,
  ChevronRight,
  ChevronLeft,
  ArrowDown
} from 'lucide-react';

interface GasingX20X22VisualizerProps {
  mode: 'concrete' | 'abstract';
  materialId: string;
  materialTitle: string;
  useCustom: boolean;
  setUseCustom: (v: boolean) => void;
  customGroups: number;
  setCustomGroups: (v: number) => void;
  customSize: number;
  setCustomSize: (v: number) => void;
  selectedExample: number;
  setSelectedExample: (v: number) => void;
  perkalianExs: { groups: number; size: number; title: string }[];
  activeEx: { groups: number; size: number; title: string };
  x20Layout: 'mendatar' | 'bersusun';
  setX20Layout: (v: 'mendatar' | 'bersusun') => void;
  practiceA: number;
  practiceB: number;
  practiceAnswer: string;
  setPracticeAnswer: (v: string) => void;
  practiceChecked: boolean | null;
  setPracticeChecked: (v: boolean | null) => void;
  practiceShowStep: boolean;
  setPracticeShowStep: (v: boolean) => void;
  generateNewPractice: () => void;
}

export default function GasingX20X22Visualizer({
  mode,
  materialId,
  materialTitle,
  useCustom,
  setUseCustom,
  customGroups,
  setCustomGroups,
  customSize,
  setCustomSize,
  selectedExample,
  setSelectedExample,
  perkalianExs,
  activeEx,
  x20Layout,
  setX20Layout,
  practiceA,
  practiceB,
  practiceAnswer,
  setPracticeAnswer,
  practiceChecked,
  setPracticeChecked,
  practiceShowStep,
  setPracticeShowStep,
  generateNewPractice
}: GasingX20X22VisualizerProps) {
  // Local step index specifically for inner visualizer stages to avoid global state pollution
  const [localStep, setLocalStep] = useState<number>(0);

  // Sync or reset steps when changing material or example
  useEffect(() => {
    setLocalStep(0);
  }, [materialId, selectedExample, useCustom]);

  const numA = useCustom ? customGroups : activeEx.groups;
  const numB = useCustom ? customSize : activeEx.size;

  const h_A = Math.floor(numA / 100);
  const t_A = Math.floor((numA % 100) / 10);
  const o_A = numA % 10;

  // Split B multiplier based on material
  let h_B = 0;
  let t_B = 0;
  let o_B = numB;

  if (materialId === 'X21') {
    t_B = Math.floor(numB / 10);
    o_B = numB % 10;
  } else if (materialId === 'X22') {
    h_B = Math.floor(numB / 100);
    t_B = Math.floor((numB % 100) / 10);
    o_B = numB % 10;
  }

  // --- 1. ABSTRACT COLS DEFINITION ---
  let cols: { label: string; count: number; rawCount: number; type: 'PRb' | 'Rb' | 'R' | 'P' | 'S'; explanation: string }[] = [];
  if (materialId === 'X20') {
    cols = [
      { label: 'Ratusan (R)', count: h_A * numB, rawCount: h_A * numB, type: 'R', explanation: `${h_A} × ${numB}` },
      { label: 'Puluhan (P)', count: t_A * numB, rawCount: t_A * numB, type: 'P', explanation: `${t_A} × ${numB}` },
      { label: 'Satuan (S)', count: o_A * numB, rawCount: o_A * numB, type: 'S', explanation: `${o_A} × ${numB}` }
    ];
  } else if (materialId === 'X21') {
    cols = [
      { label: 'Ribuan (Rb)', count: h_A * t_B, rawCount: h_A * t_B, type: 'Rb', explanation: `${h_A} × ${t_B}` },
      { label: 'Ratusan (R)', count: h_A * o_B + t_A * t_B, rawCount: h_A * o_B + t_A * t_B, type: 'R', explanation: `(${h_A} × ${o_B}) + (${t_A} × ${t_B})` },
      { label: 'Puluhan (P)', count: t_A * o_B + o_A * t_B, rawCount: t_A * o_B + o_A * t_B, type: 'P', explanation: `(${t_A} × ${o_B}) + (${o_A} × ${t_B})` },
      { label: 'Satuan (S)', count: o_A * o_B, rawCount: o_A * o_B, type: 'S', explanation: `${o_A} × ${o_B}` }
    ];
  } else { // X22
    cols = [
      { label: 'PRibuan (PRb)', count: h_A * h_B, rawCount: h_A * h_B, type: 'PRb', explanation: `${h_A} × ${h_B}` },
      { label: 'Ribuan (Rb)', count: h_A * t_B + t_A * h_B, rawCount: h_A * t_B + t_A * h_B, type: 'Rb', explanation: `(${h_A} × ${t_B}) + (${t_A} × ${h_B})` },
      { label: 'Ratusan (R)', count: h_A * o_B + t_A * t_B + o_A * h_B, rawCount: h_A * o_B + t_A * t_B + o_A * h_B, type: 'R', explanation: `(${h_A} × ${o_B}) + (${t_A} × ${t_B}) + (${o_A} × ${h_B})` },
      { label: 'Puluhan (P)', count: t_A * o_B + o_A * t_B, rawCount: t_A * o_B + o_A * t_B, type: 'P', explanation: `(${t_A} × ${o_B}) + (${o_A} × ${t_B})` },
      { label: 'Satuan (S)', count: o_A * o_B, rawCount: o_A * o_B, type: 'S', explanation: `${o_A} × ${o_B}` }
    ];
  }

  // --- 2. ABSTRACT MODE LOGIC ---
  const C = cols.map(c => c.rawCount);

  interface GasingStep {
    headline: string;
    desc: string;
    render: () => React.JSX.Element;
  }

  // Generate the steps dynamically based on C and whether there are carries!
  const gasingSteps = React.useMemo<GasingStep[]>(() => {
    if (materialId === 'X21') {
      const steps: GasingStep[] = [];
      
      const G1 = h_A * t_B;
      const G2_1 = h_A * o_B;
      const G2_2 = t_A * t_B;
      const G2 = G2_1 + G2_2;
      const G3_1 = t_A * o_B;
      const G3_2 = o_A * t_B;
      const G3 = G3_1 + G3_2;
      const G4 = o_A * o_B;

      const S1 = Math.floor(G2 / 10);
      const U1 = G2 % 10;
      const S2 = Math.floor(G3 / 10);
      const U2 = G3 % 10;
      const S3 = Math.floor(G4 / 10);
      const U3 = G4 % 10;

      const finalVal = numA * numB;

      const slots: { val: number; isSmall: boolean; id: string }[] = [];
      const G1Str = G1.toString();
      for (let i = 0; i < G1Str.length; i++) {
        slots.push({ val: parseInt(G1Str[i]), isSmall: false, id: `G1_${i}` });
      }
      if (S1 > 0) {
        slots.push({ val: S1, isSmall: true, id: 'S1' });
      }
      slots.push({ val: U1, isSmall: false, id: 'U1' });
      if (S2 > 0) {
        slots.push({ val: S2, isSmall: true, id: 'S2' });
      }
      slots.push({ val: U2, isSmall: false, id: 'U2' });
      if (S3 > 0) {
        slots.push({ val: S3, isSmall: true, id: 'S3' });
      }
      slots.push({ val: U3, isSmall: false, id: 'U3' });

      const additions: { leftVal: number; smallVal: number; sum: number }[] = [];
      for (let i = 0; i < slots.length; i++) {
        if (slots[i].isSmall) {
          const leftVal = slots[i - 1].val;
          const smallVal = slots[i].val;
          additions.push({
            leftVal,
            smallVal,
            sum: leftVal + smallVal
          });
        }
      }

      // 1. Tahap 1: Pola Silang (Visual diagonal multiplier line diagram)
      steps.push({
        headline: "Tahap 1: Pola Silang Gasing",
        desc: "Mulai mengalikan dari depan dengan memahami rute perkalian diagonal menyilang khas Gasing.",
        render: () => {
          if (x20Layout === 'mendatar') {
            return (
              <div className="w-full flex flex-col items-center justify-center space-y-4">
                <div className="text-center text-xs font-semibold text-teal-400 border border-teal-800/40 bg-teal-950/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  Mendatar: Rute Diagonal Gasing
                </div>
                <svg viewBox="0 0 360 160" className="w-full max-w-sm h-auto select-none overflow-visible">
                  <defs>
                    <filter id="glowF" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  
                  <g className="font-mono text-4xl font-black" fill="#ffffff" filter="url(#glowF)">
                    <text x="50" y="70" textAnchor="middle" fill="#38bdf8">{h_A}</text>
                    <text x="85" y="70" textAnchor="middle" fill="#34d399">{t_A}</text>
                    <text x="120" y="70" textAnchor="middle" fill="#fbbf24">{o_A}</text>

                    <text x="170" y="70" textAnchor="middle" fill="#ef4444">×</text>

                    <text x="220" y="70" textAnchor="middle" fill="#34d399">{t_B}</text>
                    <text x="255" y="70" textAnchor="middle" fill="#fbbf24">{o_B}</text>

                    <text x="310" y="70" textAnchor="middle">=</text>
                  </g>

                  {/* Lines */}
                  {/* Group 1: R x P (amber) */}
                  <path d="M 50 85 Q 135 150 220 85" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                  
                  {/* Group 2: R x S & P x P (blue) */}
                  <path d="M 50 85 Q 152 170 255 85" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M 85 85 Q 152 135 220 85" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                  {/* Group 3: P x S & S x P (rose) */}
                  <path d="M 85 85 Q 170 150 255 85" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M 120 85 Q 170 120 220 85" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                  {/* Group 4: S x S (emerald) */}
                  <path d="M 120 85 Q 187 135 255 85" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                </svg>
                
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span> Klp 1: R×P</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-450 inline-block"></span> Klp 2: R×S + P×P</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span> Klp 3: P×S + S×P</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Klp 4: S×S</span>
                </div>
              </div>
            );
          } else {
            return (
              <div className="w-full flex flex-col items-center justify-center space-y-4">
                <div className="text-center text-xs font-semibold text-teal-400 border border-teal-800/40 bg-teal-950/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  Bersusun: Rute Diagonal Gasing
                </div>
                <svg viewBox="0 0 360 190" className="w-full max-w-sm h-auto select-none overflow-visible">
                  <defs>
                    <filter id="glowF2" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <g className="font-mono text-4xl font-black" fill="#ffffff" filter="url(#glowF2)">
                    {/* First Line (A): 1 2 3 */}
                    <text x="120" y="55" textAnchor="middle" fill="#38bdf8">{h_A}</text>
                    <text x="170" y="55" textAnchor="middle" fill="#34d399">{t_A}</text>
                    <text x="220" y="55" textAnchor="middle" fill="#fbbf24">{o_A}</text>

                    {/* Second Line (B): 3 2 */}
                    <text x="170" y="115" textAnchor="middle" fill="#34d399">{t_B}</text>
                    <text x="220" y="115" textAnchor="middle" fill="#fbbf24">{o_B}</text>

                    <text x="270" y="115" textAnchor="middle" fill="#ef4444">×</text>
                  </g>

                  {/* Horizontal multiplier line */}
                  <path d="M 80 140 L 290 140" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

                  {/* Diagonal connecting lines */}
                  {/* Group 1: R x P (120, 65) to (170, 95) (amber) */}
                  <line x1="120" y1="65" x2="170" y2="95" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

                  {/* Group 2: R x S (120, 65) to (220, 95) & P x P (170, 65) to (170, 95) (blue) */}
                  <line x1="120" y1="65" x2="220" y2="95" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="170" y1="65" x2="170" y2="95" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                  {/* Group 3: P x S (170, 65) to (220, 95) & S x P (220, 65) to (170, 95) (rose) */}
                  <line x1="170" y1="65" x2="220" y2="95" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="220" y1="65" x2="170" y2="95" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                  {/* Group 4: S x S (220, 65) to (220, 95) (emerald) */}
                  <line x1="220" y1="65" x2="220" y2="95" stroke="#10b981" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                </svg>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span> Klp 1: R×P</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-450 inline-block"></span> Klp 2: R×S + P×P</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span> Klp 3: P×S + S×P</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Klp 4: S×S</span>
                </div>
              </div>
            );
          }
        }
      });

      // 2. Tahap 2: Hasil Tiap Kelompok
      steps.push({
        headline: "Tahap 2: Hitung Hasil Tiap Kelompok",
        desc: "Hitung nilai operasi perkalian elementer masing-masing kelompok secara beruntun dari depan.",
        render: () => (
          <div className="w-full py-2 text-center">
            {/* Expression above */}
            <div className="text-lg text-slate-400 mb-4 font-mono">
              Kelompok hasil perkalian:
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center my-3 max-w-2xl mx-auto w-full font-sans">
              {/* Kelompok 1 */}
              <div className="bg-slate-900 border border-amber-600/30 p-4 rounded-2xl">
                <div className="text-[10px] text-amber-500 font-bold uppercase mb-2">Klp 1: R × P</div>
                <div className="font-mono text-sm text-slate-300 mb-2">{h_A} × {t_B}</div>
                <div className="font-mono text-2xl font-black text-white">{G1}</div>
              </div>

              {/* Kelompok 2 */}
              <div className="bg-slate-900 border border-sky-500/30 p-4 rounded-2xl">
                <div className="text-[10px] text-sky-400 font-bold uppercase mb-2">Klp 2: R×S + P×P</div>
                <div className="font-mono text-xs text-slate-300 mb-1">({h_A}×{o_B}) + ({t_A}×{t_B})</div>
                <div className="font-sans text-xs text-slate-400 mb-2">{G2_1} + {G2_2}</div>
                <div className="font-mono text-2xl font-black text-sky-400">{G2}</div>
              </div>

              {/* Kelompok 3 */}
              <div className="bg-slate-900 border border-rose-500/30 p-4 rounded-2xl">
                <div className="text-[10px] text-rose-400 font-bold uppercase mb-2">Klp 3: P×S + S×P</div>
                <div className="font-mono text-xs text-slate-300 mb-1">({t_A}×{o_B}) + ({o_A}×{t_B})</div>
                <div className="font-sans text-xs text-slate-400 mb-2">{G3_1} + {G3_2}</div>
                <div className="font-mono text-2xl font-black text-rose-450 text-rose-400">{G3}</div>
              </div>

              {/* Kelompok 4 */}
              <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-2xl">
                <div className="text-[10px] text-emerald-400 font-bold uppercase mb-2">Klp 4: S × S</div>
                <div className="font-mono text-sm text-slate-300 mb-2">{o_A} × {o_B}</div>
                <div className="font-mono text-2xl font-black text-white">{G4}</div>
              </div>
            </div>
          </div>
        )
      });

      // 3. Tahap 3: Hasil Sementara
      steps.push({
        headline: "Tahap 3: Susun Hasil Sementara",
        desc: "Luruskan seluruh hasil evaluasi kelompok sejajar mendatar berurutan, disekat oleh garis pemisah.",
        render: () => (
          <div className="w-full py-4 flex flex-col items-center">
            <div className="text-sm uppercase tracking-wide text-indigo-400 mb-4 font-mono">Struktur Sekat Kolom Gasing:</div>
            
            <div className="flex items-center justify-center gap-3 py-6 font-mono max-w-md mx-auto w-full">
              <div className="text-3xl font-black bg-slate-900 text-amber-400 px-6 py-4 rounded-2xl border-2 border-slate-800 shadow shadow-amber-900/10 min-w-[70px]">
                {G1}
              </div>
              <span className="text-slate-700 text-3xl font-light opacity-50 select-none">|</span>
              <div className="text-3xl font-black bg-slate-900 text-sky-400 px-6 py-4 rounded-2xl border-2 border-slate-800 shadow shadow-sky-900/10 min-w-[70px]">
                {G2}
              </div>
              <span className="text-slate-700 text-3xl font-light opacity-50 select-none">|</span>
              <div className="text-3xl font-black bg-slate-900 text-rose-450 text-rose-400 px-6 py-4 rounded-2xl border-2 border-slate-800 shadow shadow-rose-900/10 min-w-[70px]">
                {G3}
              </div>
              <span className="text-slate-700 text-3xl font-light opacity-50 select-none">|</span>
              <div className="text-3xl font-black bg-slate-900 text-emerald-400 px-6 py-4 rounded-2xl border-2 border-slate-800 shadow shadow-emerald-900/10 min-w-[70px]">
                {G4}
              </div>
            </div>
          </div>
        )
      });

      // 4. Tahap 4: Notasi Gasing
      steps.push({
        headline: "Tahap 4: Format Notasi Gasing",
        desc: "Tuliskan seluruh nilai dalam satu baris. Jika hasil berupa puluhan, tulis digit puluhannya kecil (superskrip) tepat di sebelah kiri digit satuannya. Angka kecil nol dilarang ditulis.",
        render: () => (
          <div className="w-full py-4 flex flex-col items-center">
            <div className="text-sm uppercase tracking-wide text-rose-450 text-rose-400 mb-4 font-mono">Notasi Gasing:</div>
            
            <div className="flex items-baseline justify-center gap-0.5 py-6 font-mono text-6xl font-black text-white select-none tracking-tight">
              {slots.map((slot) => {
                if (slot.isSmall) {
                  return (
                    <sup key={slot.id} className="text-rose-400 text-3xl font-black align-super pr-0.5">
                      {slot.val}
                    </sup>
                  );
                } else {
                  return (
                    <span key={slot.id} className="text-white">
                      {slot.val}
                    </span>
                  );
                }
              })}
            </div>
            
            <div className="text-center text-xs text-slate-400 max-w-sm mt-3 px-4 font-sans">
              {additions.length > 0 ? (
                <span>Angka kecil (superskrip) berwarna merah siap ditambahkan pada angka besar tepat di sebelah kirinya.</span>
              ) : (
                <span>Semua hasil bernilai satu digit sehingga dapat ditulis langsung apa adanya tanpa angka kecil (superskrip).</span>
              )}
            </div>
          </div>
        )
      });

      // 5. Tahap 5: Hasil Akhir (Gabung Samping)
      steps.push({
        headline: "Tahap 5: Hasil Akhir (Gilas)",
        desc: "Logika Gasing murni: Angka kecil selalu digabung dengan angka besar yang berada tepat di sebelah kirinya.",
        render: () => (
          <div className="w-full py-2 flex flex-col items-center">
            
            <div className="flex flex-col items-center space-y-4 py-4 w-full max-w-sm font-sans mx-auto">
              {/* 1. Notation */}
              <div className="bg-slate-900 border border-slate-800/80 px-6 py-4 rounded-2xl w-full text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Notasi Gasing</div>
                <div className="flex items-baseline justify-center font-mono font-black text-4xl select-none tracking-tight">
                  {slots.map((slot) => {
                    if (slot.isSmall) {
                      return (
                        <sup key={slot.id} className="text-rose-400 text-xl font-black align-super">
                          {slot.val}
                        </sup>
                      );
                    } else {
                      return (
                        <span key={slot.id} className="text-white">
                          {slot.val}
                        </span>
                      );
                    }
                  })}
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="flex justify-center text-indigo-400">
                <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </div>

              {/* 2. Gasing logic addition list */}
              {additions.length > 0 ? (
                <div className="bg-slate-900 border border-slate-800/85 px-6 py-4 rounded-2xl w-full text-center space-y-3">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Gabung Samping (Refleks)</div>
                  <div className="flex flex-col gap-2.5 items-center">
                    {additions.map((add, index) => (
                      <div key={index} className="flex items-center gap-3 font-mono text-xl select-none">
                        <span className="text-white font-extrabold text-2xl">{add.leftVal}</span>
                        <span className="text-slate-500 text-lg">+</span>
                        <span className="text-rose-450 text-rose-400 font-black text-xl align-super">
                          {add.smallVal}
                        </span>
                        <span className="text-slate-500 text-lg font-light">=</span>
                        <span className="text-emerald-400 font-black text-2xl">{add.sum}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800/85 px-6 py-4 rounded-2xl w-full text-center py-5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Gabung Samping</div>
                  <p className="text-[11px] text-slate-300">
                    Tidak ada angka kecil. Seluruh angka berurutan langsung digabung secara refleks.
                  </p>
                </div>
              )}

              {/* Arrow 2 */}
              <div className="flex justify-center text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </div>

              {/* 3. Final Answer Banner */}
              <div className="bg-emerald-500/10 border-2 border-emerald-500/35 rounded-3xl p-4.5 text-center w-full shadow-xl shadow-emerald-950/20">
                <span className="text-xs text-emerald-400 font-black block uppercase tracking-widest mb-1 font-sans">HASIL AKHIR</span>
                <div className="text-4xl font-mono font-black text-emerald-400 tracking-wider">
                  {finalVal}
                </div>
              </div>
            </div>
            
          </div>
        )
      });

      return steps;
    }

    if (materialId === 'X22') {
      const steps: GasingStep[] = [];
      
      const G1 = h_A * h_B;
      const G2_1 = h_A * t_B;
      const G2_2 = t_A * h_B;
      const G2 = G2_1 + G2_2;
      const G3_1 = h_A * o_B;
      const G3_2 = t_A * t_B;
      const G3_3 = o_A * h_B;
      const G3 = G3_1 + G3_2 + G3_3;
      const G4_1 = t_A * o_B;
      const G4_2 = o_A * t_B;
      const G4 = G4_1 + G4_2;
      const G5 = o_A * o_B;

      const S1 = Math.floor(G2 / 10);
      const U1 = G2 % 10;
      const S2 = Math.floor(G3 / 10);
      const U2 = G3 % 10;
      const S3 = Math.floor(G4 / 10);
      const U3 = G4 % 10;
      const S4 = Math.floor(G5 / 10);
      const U4 = G5 % 10;

      const finalVal = numA * numB;

      const slots: { val: number; isSmall: boolean; id: string }[] = [];
      const G1Str = G1.toString();
      for (let i = 0; i < G1Str.length; i++) {
        slots.push({ val: parseInt(G1Str[i]), isSmall: false, id: `G1_${i}` });
      }
      if (S1 > 0) {
        slots.push({ val: S1, isSmall: true, id: 'S1' });
      }
      slots.push({ val: U1, isSmall: false, id: 'U1' });
      if (S2 > 0) {
        slots.push({ val: S2, isSmall: true, id: 'S2' });
      }
      slots.push({ val: U2, isSmall: false, id: 'U2' });
      if (S3 > 0) {
        slots.push({ val: S3, isSmall: true, id: 'S3' });
      }
      slots.push({ val: U3, isSmall: false, id: 'U3' });
      if (S4 > 0) {
        slots.push({ val: S4, isSmall: true, id: 'S4' });
      }
      slots.push({ val: U4, isSmall: false, id: 'U4' });

      const additions: { leftVal: number; smallVal: number; sum: number }[] = [];
      for (let i = 0; i < slots.length; i++) {
        if (slots[i].isSmall) {
          const leftVal = slots[i - 1].val;
          const smallVal = slots[i].val;
          additions.push({
            leftVal,
            smallVal,
            sum: leftVal + smallVal
          });
        }
      }

      // 1. Tahap 1: Pola Silang (Visual diagonal multiplier line diagram)
      steps.push({
        headline: "Tahap 1: Pola Silang Gasing",
        desc: "Mulai mengalikan dari depan dengan memahami rute perkalian diagonal menyilang khas Gasing.",
        render: () => {
          if (x20Layout === 'mendatar') {
            return (
              <div className="w-full flex flex-col items-center justify-center space-y-4">
                <div className="text-center text-xs font-semibold text-teal-400 border border-teal-800/40 bg-teal-950/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  Mendatar: Rute Diagonal Gasing
                </div>
                <svg viewBox="0 0 360 160" className="w-full max-w-sm h-auto select-none overflow-visible">
                  <defs>
                    <filter id="glowF_x22" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  
                  <g className="font-mono text-4xl font-black" fill="#ffffff" filter="url(#glowF_x22)">
                    <text x="50" y="70" textAnchor="middle" fill="#38bdf8">{h_A}</text>
                    <text x="85" y="70" textAnchor="middle" fill="#34d399">{t_A}</text>
                    <text x="120" y="70" textAnchor="middle" fill="#fbbf24">{o_A}</text>

                    <text x="170" y="70" textAnchor="middle" fill="#ef4444">×</text>

                    <text x="220" y="70" textAnchor="middle" fill="#38bdf8">{h_B}</text>
                    <text x="255" y="70" textAnchor="middle" fill="#34d399">{t_B}</text>
                    <text x="290" y="70" textAnchor="middle" fill="#fbbf24">{o_B}</text>

                    <text x="330" y="70" textAnchor="middle">=</text>
                  </g>

                  {/* Lines */}
                  {/* Group 1: R x R (amber) */}
                  <path d="M 50 85 Q 135 130 220 85" fill="none" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" opacity="0.95" />
                  
                  {/* Group 2: R x P & P x R (sky) */}
                  <path d="M 50 85 Q 152 145 255 85" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M 85 85 Q 152 120 220 85" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                  {/* Group 3: R x S & P x P & S x R (rose) */}
                  <path d="M 50 85 Q 170 170 290 85" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                  <path d="M 85 85 Q 170 140 255 85" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                  <path d="M 120 85 Q 170 110 220 85" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />

                  {/* Group 4: P x S & S x P (indigo) */}
                  <path d="M 85 85 Q 187 145 290 85" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M 120 85 Q 187 120 255 85" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                  {/* Group 5: S x S (emerald) */}
                  <path d="M 120 85 Q 205 130 290 85" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" opacity="0.95" />
                </svg>
                
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span> Klp 1: R×R</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-450 inline-block"></span> Klp 2: R×P + P×R</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span> Klp 3: R×S + P×P + S×R</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"></span> Klp 4: P×S + S×P</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Klp 5: S×S</span>
                </div>
              </div>
            );
          } else {
            return (
              <div className="w-full flex flex-col items-center justify-center space-y-4">
                <div className="text-center text-xs font-semibold text-teal-400 border border-teal-800/40 bg-teal-950/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  Bersusun: Rute Diagonal Gasing
                </div>
                <svg viewBox="0 0 360 210" className="w-full max-w-sm h-auto select-none overflow-visible">
                  <defs>
                    <filter id="glowF2_x22" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <g className="font-mono text-4xl font-black" fill="#ffffff" filter="url(#glowF2_x22)">
                    {/* First Line (A): h_A t_A o_A */}
                    <text x="120" y="55" textAnchor="middle" fill="#38bdf8">{h_A}</text>
                    <text x="170" y="55" textAnchor="middle" fill="#34d399">{t_A}</text>
                    <text x="220" y="55" textAnchor="middle" fill="#fbbf24">{o_A}</text>

                    {/* Second Line (B): h_B t_B o_B */}
                    <text x="120" y="115" textAnchor="middle" fill="#38bdf8">{h_B}</text>
                    <text x="170" y="115" textAnchor="middle" fill="#34d399">{t_B}</text>
                    <text x="220" y="115" textAnchor="middle" fill="#fbbf24">{o_B}</text>

                    <text x="270" y="115" textAnchor="middle" fill="#ef4444">×</text>
                  </g>

                  {/* Horizontal multiplier line */}
                  <path d="M 80 140 L 290 140" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

                  {/* Diagonal connecting lines */}
                  {/* Group 1: R x R (120, 65) to (120, 95) (amber) */}
                  <line x1="120" y1="65" x2="120" y2="95" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />

                  {/* Group 2: R x P / P x R (sky) */}
                  <line x1="120" y1="65" x2="170" y2="95" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="170" y1="65" x2="120" y2="95" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                  {/* Group 3: R x S & P x P & S x R (rose) */}
                  <line x1="120" y1="65" x2="220" y2="95" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="170" y1="65" x2="170" y2="95" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="220" y1="65" x2="120" y2="95" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                  {/* Group 4: P x S & S x P (indigo) */}
                  <line x1="170" y1="65" x2="220" y2="95" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="220" y1="65" x2="170" y2="95" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                  {/* Group 5: S x S (emerald) */}
                  <line x1="220" y1="65" x2="220" y2="95" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
                </svg>

                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span> Klp 1: R×R</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-450 inline-block"></span> Klp 2: R×P + P×R</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span> Klp 3: R×S + P×P + S×R</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"></span> Klp 4: P×S + S×P</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Klp 5: S×S</span>
                </div>
              </div>
            );
          }
        }
      });

      // 2. Tahap 2: Kelompok Hasil
      steps.push({
        headline: "Tahap 2: Hasil Tiap Kelompok",
        desc: "Lakukan operasi perkalian elementer berdasarkan masing-masing kelompok diagonal secara murni.",
        render: () => (
          <div className="w-full py-2 flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full max-w-xl text-center select-none">
              
              {/* Card 1 */}
              <div className="bg-slate-900 border border-amber-900/40 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[9px] text-amber-500 uppercase font-bold tracking-widest block mb-1">R × R (Klp 1)</span>
                <div className="text-xs text-slate-400 font-mono mb-1.5">{h_A} × {h_B}</div>
                <div className="text-xl font-mono font-black text-white">{G1}</div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-900 border border-sky-900/40 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[9px] text-sky-450 uppercase font-bold tracking-widest block mb-1">R×P + P×R (Klp 2)</span>
                <div className="text-[10px] text-slate-400 font-mono mb-1.5 leading-snug">
                  ({h_A}×{t_B}) + ({t_A}×{h_B})<br />
                  = {G2_1} + {G2_2}
                </div>
                <div className="text-xl font-mono font-black text-sky-400">{G2}</div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-900 border border-rose-900/40 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[9px] text-rose-455 text-rose-400 uppercase font-bold tracking-widest block mb-1">R×S + P×P + S×R (Klp 3)</span>
                <div className="text-[10px] text-slate-400 font-mono mb-1.5 leading-snug">
                  ({h_A}×{o_B}) + ({t_A}×{t_B}) + ({o_A}×{h_B})<br />
                  = {G3_1} + {G3_2} + {G3_3}
                </div>
                <div className="text-xl font-mono font-black text-rose-400">{G3}</div>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-900 border border-indigo-900/40 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[9px] text-indigo-400 uppercase font-bold tracking-widest block mb-1">P×S + S×P (Klp 4)</span>
                <div className="text-[10px] text-slate-400 font-mono mb-1.5 leading-snug">
                  ({t_A}×{o_B}) + ({o_A}×{t_B})<br />
                  = {G4_1} + {G4_2}
                </div>
                <div className="text-xl font-mono font-black text-indigo-400">{G4}</div>
              </div>

              {/* Card 5 */}
              <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[9px] text-emerald-450 text-emerald-400 uppercase font-bold tracking-widest block mb-1">S × S (Klp 5)</span>
                <div className="text-xs text-slate-400 font-mono mb-1.5">{o_A} × {o_B}</div>
                <div className="text-xl font-mono font-black text-white">{G5}</div>
              </div>

            </div>
          </div>
        )
      });

      // 3. Tahap 3: Hasil Sementara
      steps.push({
        headline: "Tahap 3: Susun Hasil Sementara",
        desc: "Letakkan setiap hasil kelompok secara berjejer horizontal murni dipisahkan garis vertikal.",
        render: () => (
          <div className="w-full py-4 flex flex-col items-center">
            <div className="flex items-center justify-center gap-4 py-5 px-6 bg-slate-950/80 border border-slate-850 rounded-2xl font-mono text-3xl sm:text-4xl font-extrabold text-white select-none">
              <span>{G1}</span>
              <span className="text-slate-700 text-2xl font-light">|</span>
              <span className="text-sky-300">{G2}</span>
              <span className="text-slate-700 text-2xl font-light">|</span>
              <span className="text-rose-300">{G3}</span>
              <span className="text-slate-700 text-2xl font-light">|</span>
              <span className="text-indigo-300">{G4}</span>
              <span className="text-slate-700 text-2xl font-light">|</span>
              <span className="text-white">{G5}</span>
            </div>
          </div>
        )
      });

      // 4. Tahap 4: Notasi Gasing
      steps.push({
        headline: "Tahap 4: Format Notasi Gasing",
        desc: "Tuliskan seluruh nilai dalam satu baris. Jika hasil berupa puluhan, tulis digit puluhannya kecil (superskrip) tepat di sebelah kiri digit satuannya. Angka kecil nol dilarang ditulis.",
        render: () => (
          <div className="w-full py-4 flex flex-col items-center">
            <div className="text-sm uppercase tracking-wide text-rose-450 text-rose-400 mb-4 font-mono">Notasi Gasing:</div>
            
            <div className="flex items-baseline justify-center gap-0.5 py-6 font-mono text-5xl sm:text-6xl font-black text-white select-none tracking-tight">
              {slots.map((slot) => {
                if (slot.isSmall) {
                  return (
                    <sup key={slot.id} className="text-rose-400 text-2xl sm:text-3xl font-black align-super pr-0.5">
                      {slot.val}
                    </sup>
                  );
                } else {
                  return (
                    <span key={slot.id} className="text-white">
                      {slot.val}
                    </span>
                  );
                }
              })}
            </div>
            
            <div className="text-center text-xs text-slate-400 max-w-sm mt-3 px-4 font-sans">
              {additions.length > 0 ? (
                <span>Angka kecil (superskrip) berwarna merah siap ditambahkan pada angka besar tepat di sebelah kirinya.</span>
              ) : (
                <span>Semua hasil bernilai satu digit sehingga dapat ditulis langsung apa adanya tanpa angka kecil (superskrip).</span>
              )}
            </div>
          </div>
        )
      });

      // 5. Tahap 5: Hasil Akhir (Gabung Samping)
      steps.push({
        headline: "Tahap 5: Hasil Akhir (Gilas)",
        desc: "Logika Gasing murni: Angka kecil selalu digabung dengan angka besar yang berada tepat di sebelah kirinya.",
        render: () => (
          <div className="w-full py-2 flex flex-col items-center">
            
            <div className="flex flex-col items-center space-y-4 py-4 w-full max-w-sm font-sans mx-auto">
              {/* 1. Notation */}
              <div className="bg-slate-900 border border-slate-800/80 px-6 py-4 rounded-2xl w-full text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Notasi Gasing</div>
                <div className="flex items-baseline justify-center font-mono font-black text-4xl select-none tracking-tight">
                  {slots.map((slot) => {
                    if (slot.isSmall) {
                      return (
                        <sup key={slot.id} className="text-rose-400 text-xl font-black align-super">
                          {slot.val}
                        </sup>
                      );
                    } else {
                      return (
                        <span key={slot.id} className="text-white">
                          {slot.val}
                        </span>
                      );
                    }
                  })}
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="flex justify-center text-indigo-400">
                <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </div>

              {/* 2. Gasing logic addition list */}
              {additions.length > 0 ? (
                <div className="bg-slate-900 border border-slate-800/85 px-6 py-4 rounded-2xl w-full text-center space-y-3">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Gabung Samping (Refleks)</div>
                  <div className="flex flex-col gap-2.5 items-center">
                    {additions.map((add, index) => (
                      <div key={index} className="flex items-center gap-3 font-mono text-xl select-none">
                        <span className="text-white font-extrabold text-2xl">{add.leftVal}</span>
                        <span className="text-slate-500 text-lg">+</span>
                        <span className="text-rose-455 text-rose-400 font-black text-xl align-super">
                          {add.smallVal}
                        </span>
                        <span className="text-slate-500 text-lg font-light">=</span>
                        <span className="text-emerald-400 font-black text-2xl">{add.sum}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800/85 px-6 py-4 rounded-2xl w-full text-center py-5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Gabung Samping</div>
                  <p className="text-[11px] text-slate-300">
                    Tidak ada angka kecil. Seluruh angka berurutan langsung digabung secara refleks.
                  </p>
                </div>
              )}

              {/* Arrow 2 */}
              <div className="flex justify-center text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </div>

              {/* 3. Final Answer Banner */}
              <div className="bg-emerald-500/10 border-2 border-emerald-500/35 rounded-3xl p-4.5 text-center w-full shadow-xl shadow-emerald-950/20">
                <span className="text-xs text-emerald-400 font-black block uppercase tracking-widest mb-1 font-sans">HASIL AKHIR</span>
                <div className="text-4xl font-mono font-black text-emerald-400 tracking-wider">
                  {finalVal}
                </div>
              </div>
            </div>
            
          </div>
        )
      });

      return steps;
    }

    const steps: GasingStep[] = [];
    const n = C.length;
    
    // Calculate values and carries per column
    const cy: number[] = [];
    const un: number[] = [];
    for (let i = 0; i < n; i++) {
      cy[i] = (i === 0) ? 0 : Math.floor(C[i] / 10);
      un[i] = (i === 0) ? C[0] : C[i] % 10;
    }

    // Check if there are any non-zero carries
    const nonZeroCarries: number[] = [];
    for (let i = 1; i < n; i++) {
      if (cy[i] > 0) {
        nonZeroCarries.push(i);
      }
    }

    const hasSuperscript = nonZeroCarries.length > 0;

    if (!hasSuperscript) {
      // 1. Case without superscript helper carries (e.g. 121 x 3)
      // Only 2 steps according to user instructions:
      // Step 0: Hasil Perkalian
      steps.push({
        headline: "Langkah 1: Hasil Perkalian",
        desc: "Setiap digit hasil perkalian menghasilkan satu digit, sehingga tidak ada angka kecil (superscript).",
        render: () => (
          <div className="text-3xl font-mono font-black text-white flex items-center justify-center gap-3">
            {C.map((val, idx) => (
              <span key={idx}>{val}</span>
            ))}
          </div>
        )
      });
      // Step 1: Hasil Akhir
      steps.push({
        headline: "Hasil Akhir",
        desc: "Karena tidak ada superscript kecil, maka hasil perkalian langsung merupakan hasil akhir.",
        render: () => (
          <div className="text-4xl font-mono font-black text-teal-400 flex items-center justify-center animate-bounce">
            {numA * numB}
          </div>
        )
      });
      return steps;
    }

    // 2. Case with superscript carries! Let's build the steps sequentially.
    // Step 0: Initial expression with superscripts
    steps.push({
      headline: "Langkah 1: Hasil Perkalian Tempat Asli",
      desc: materialId === 'X20'
        ? `Kalikan digit pengali oleh ratusan, puluh, kemudian satuan: ${h_A}×${numB}=${C[0]}, ${t_A}×${numB}=${C[1]}, ${o_A}×${numB}=${C[2]}. Tulis sejajar dengan superskrip puluhan berikutnya.`
        : "Kalikan menyilang diagonal secara visual dari depan ke belakang untuk menemukan nilai tempat aseli per kolom.",
      render: () => {
        if (materialId === 'X20') {
          return (
            <div className="text-3xl font-mono font-black text-white flex items-center justify-center gap-1">
              <span>{C[0]}</span>
              {cy[1] > 0 ? <sup className="text-amber-400 text-lg font-bold -mt-3">{cy[1]}</sup> : null}
              <span>{un[1]}</span>
              {cy[2] > 0 ? <sup className="text-indigo-400 text-lg font-bold -mt-3">{cy[2]}</sup> : null}
              <span>{un[2]}</span>
            </div>
          );
        } else if (materialId === 'X21') {
          return (
            <div className="text-3xl font-mono font-black text-white flex items-center justify-center gap-1">
              <span>{C[0]}</span>
              {cy[1] > 0 ? <sup className="text-amber-400 text-lg font-bold -mt-3">{cy[1]}</sup> : null}
              <span>{un[1]}</span>
              {cy[2] > 0 ? <sup className="text-indigo-400 text-lg font-bold -mt-3">{cy[2]}</sup> : null}
              <span>{un[2]}</span>
              {cy[3] > 0 ? <sup className="text-rose-400 text-lg font-bold -mt-3">{cy[3]}</sup> : null}
              <span>{un[3]}</span>
            </div>
          );
        } else { // X22
          return (
            <div className="text-2xl sm:text-3xl font-mono font-black text-white flex items-center justify-center gap-1">
              <span>{C[0]}</span>
              {cy[1] > 0 ? <sup className="text-amber-400 text-xs sm:text-sm font-black -mt-3">{cy[1]}</sup> : null}
              <span>{un[1]}</span>
              {cy[2] > 0 ? <sup className="text-indigo-400 text-xs sm:text-sm font-black -mt-3">{cy[2]}</sup> : null}
              <span>{un[2]}</span>
              {cy[3] > 0 ? <sup className="text-rose-400 text-xs sm:text-sm font-black -mt-3">{cy[3]}</sup> : null}
              <span>{un[3]}</span>
              {cy[4] > 0 ? <sup className="text-emerald-400 text-xs sm:text-sm font-black -mt-3">{cy[4]}</sup> : null}
              <span>{un[4]}</span>
            </div>
          );
        }
      }
    });

    let stepNum = 1;

    // Track active digits and superscripts as we generate steps
    const activeVals = [...un];
    const activeSups = [...cy];
    let generatedFirstDigitCarry = false;
    let gdCarryVal = 0;

    // Help trace each non-zero carry from left-to-right
    for (const carryIdx of nonZeroCarries) {
      stepNum++;
      const targetIdx = carryIdx - 1;
      const cVal = activeSups[carryIdx];
      const prevVal = activeVals[targetIdx];

      // Perform the merge of cy into un
      const sum = prevVal + cVal;

      if (targetIdx === 0) {
        // Leftmost column merge!
        if (C[0] > 9 && (C[0] % 10) + cVal >= 10) {
          // Carry generated to the very first digit!
          const firstHighDigit = Math.floor(C[0] / 10);
          const firstLowDigit = C[0] % 10;
          const mergedLow = firstLowDigit + cVal;
          generatedFirstDigitCarry = true;
          gdCarryVal = Math.floor(mergedLow / 10);
          activeVals[0] = mergedLow % 10; // set as lower digit unit
        } else {
          activeVals[0] = C[0] + cVal;
        }
      } else {
        // Intermediate column merge
        if (sum >= 10) {
          // Generates a carry to its left!
          // Since we already merged things to the left, this new carry needs to be stored
          // on targetIdx - 1's superscript.
          activeVals[targetIdx] = sum % 10;
          activeSups[targetIdx] = Math.floor(sum / 10);
        } else {
          activeVals[targetIdx] = sum;
        }
      }

      // Mark this carry as processed
      activeSups[carryIdx] = 0;

      // Capture state for this step
      const frozenVals = [...activeVals];
      const frozenSups = [...activeSups];
      const frozenFirstDigitCarry = generatedFirstDigitCarry;
      const frozenGdCarryVal = gdCarryVal;

      steps.push({
        headline: `Gilas Gabung Tempat ke-${stepNum - 1}`,
        desc: `Hitung ${prevVal} + ${cVal} = ${sum}.${sum >= 10 ? ` Karena hasil ≥ 10, tulis ${sum % 10}, dan carry ${Math.floor(sum / 10)} ditulis kecil (sup) di atas digit depannya.` : ''}`,
        render: () => {
          return (
            <div className="text-3xl font-mono font-black text-white flex items-center justify-center gap-1">
              {frozenFirstDigitCarry ? (
                <>
                  <span>{Math.floor(C[0]/10)}</span>
                  <sup className="text-emerald-400 text-lg font-bold -mt-3">{frozenGdCarryVal}</sup>
                  <span className={targetIdx === 0 ? "text-emerald-400" : ""}>{frozenVals[0]}</span>
                </>
              ) : (
                <span className={targetIdx === 0 ? "text-emerald-400" : ""}>{frozenVals[0]}</span>
              )}

              {/* Col 1 */}
              {frozenSups[1] > 0 ? <sup className="text-amber-400 text-lg font-bold -mt-3">{frozenSups[1]}</sup> : null}
              <span className={targetIdx === 1 ? "text-emerald-400" : ""}>{frozenVals[1]}</span>

              {/* Col 2 */}
              {frozenSups[2] > 0 ? <sup className="text-indigo-400 text-lg font-bold -mt-3">{frozenSups[2]}</sup> : null}
              <span className={targetIdx === 2 ? "text-emerald-400" : ""}>{frozenVals[2]}</span>

              {/* Col 3 (X21, X22) */}
              {n > 3 && (
                <>
                  {frozenSups[3] > 0 ? <sup className="text-rose-400 text-lg font-bold -mt-3">{frozenSups[3]}</sup> : null}
                  <span className={targetIdx === 3 ? "text-emerald-400" : ""}>{frozenVals[3]}</span>
                </>
              )}

              {/* Col 4 (X22) */}
              {n > 4 && (
                <>
                  {frozenSups[4] > 0 ? <sup className="text-emerald-400 text-lg font-bold -mt-3">{frozenSups[4]}</sup> : null}
                  <span className={targetIdx === 4 ? "text-emerald-400" : ""}>{frozenVals[4]}</span>
                </>
              )}
            </div>
          );
        }
      });
    }

    // If there is a generated first digit carry (like the 2¹1), add a step to resolve it!
    if (generatedFirstDigitCarry) {
      stepNum++;
      const resolvedFirst = Math.floor(C[0] / 10) + gdCarryVal;
      const frozenVals = [...activeVals];

      steps.push({
        headline: "Selesaikan Sisa Angka Kecil",
        desc: `Selesaikan sisa angka kecil carry di depan: ${Math.floor(C[0] / 10)} + ${gdCarryVal} = ${resolvedFirst}.`,
        render: () => (
          <div className="text-3xl font-mono font-black text-white flex items-center justify-center gap-1">
            <span className="text-emerald-400">{resolvedFirst}</span>
            {frozenVals.slice(1).map((val, idx) => (
              <span key={idx}>{val}</span>
            ))}
          </div>
        )
      });
    }

    // Step Final: Hasil Akhir
    steps.push({
      headline: "Hasil Akhir",
      desc: `Semua superskrip carry berhasil diintegrasikan ke tempat depan secara tuntas. Hasil akhir diperoleh: ${numA * numB}.`,
      render: () => (
        <div className="text-4xl font-mono font-black text-teal-400 flex items-center justify-center animate-bounce">
          {numA * numB}
        </div>
      )
    });

    return steps;
  }, [C, numA, numB, materialId]);

  const showSupNotation = () => {
    if (!gasingSteps[localStep]) return null;
    return gasingSteps[localStep].render();
  };

  const getStepHeadline = () => {
    if (!gasingSteps[localStep]) return "";
    return gasingSteps[localStep].headline;
  };

  const getStepDesc = () => {
    if (!gasingSteps[localStep]) return "";
    return gasingSteps[localStep].desc;
  };

  // Stacked Layout Coordinates
  const alignGrid: (string | number | undefined)[][] = [];
  // Build A and B row representations
  const rowA = ['', '', h_A, t_A, o_A];
  let rowB = ['', '', '', '', numB];
  if (materialId === 'X21') {
    rowB = ['', '', '', t_B, o_B];
  } else if (materialId === 'X22') {
    rowB = ['', '', h_B, t_B, o_B];
  }

  // Row 1, 2, 3 values
  const r1_val = h_A * numB;
  const r2_val = t_A * numB;
  const r3_val = o_A * numB;

  // Render Stacked grid nicely
  const getStackedCellClass = (rIdx: number, cIdx: number) => {
    // Highlight coordinates based on stepIndex to make it deeply educational!
    const isStep0 = localStep === 0;
    const isStep1 = localStep === 1;
    const isStep2 = localStep === 2;

    if (rIdx === 0 && cIdx === 2 && isStep0) return 'bg-indigo-950 text-indigo-400 border border-indigo-500 font-bold';
    if (rIdx === 0 && cIdx === 3 && isStep1) return 'bg-emerald-950 text-emerald-400 border border-emerald-500 font-bold';
    if (rIdx === 0 && cIdx === 4 && isStep2) return 'bg-amber-950 text-amber-500 border border-amber-500 font-bold';

    if (rIdx === 1 && isStep0 && materialId === 'X20') return 'bg-yellow-950 text-yellow-405 border border-yellow-500';
    if (rIdx === 1 && isStep1 && materialId === 'X20') return 'bg-yellow-950 text-yellow-405 border border-yellow-500';
    if (rIdx === 1 && isStep2 && materialId === 'X20') return 'bg-yellow-950 text-yellow-405 border border-yellow-500';

    if (rIdx === 2 && isStep0) return 'bg-indigo-950/40 text-indigo-300 font-black';
    if (rIdx === 3 && isStep1) return 'bg-emerald-950/40 text-emerald-300 font-black';
    if (rIdx === 4 && isStep2) return 'bg-amber-950/40 text-amber-300 font-black';

    return 'text-slate-350';
  };

  return (
    <div className="space-y-6">
      {/* Top panel controls */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4 text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h4 className="text-xs font-black text-indigo-455 uppercase tracking-widest mb-1 font-sans text-indigo-400">
              Pola Berhitung {materialTitle}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {/* Layout Switcher */}
              <button
                onClick={() => {
                  setX20Layout('mendatar');
                  setLocalStep(0);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  x20Layout === 'mendatar' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Mendatar
              </button>
              <button
                onClick={() => {
                  setX20Layout('bersusun');
                  setLocalStep(0);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  x20Layout === 'bersusun' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Bersusun Gasing
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-850">
            {perkalianExs.map((e, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedExample(idx);
                  setUseCustom(false);
                  setLocalStep(0);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                  !useCustom && selectedExample === idx ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {e.title}
              </button>
            ))}
            <button
              onClick={() => {
                setUseCustom(true);
                setLocalStep(0);
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                useCustom ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Atur Sendiri
            </button>
          </div>
        </div>

        {useCustom && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in font-sans">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Bilangan Pertama A:</span>
                <strong className="text-indigo-400 font-mono">{customGroups}</strong>
              </div>
              <input
                type="range"
                min={100}
                max={999}
                value={customGroups}
                onChange={(e) => {
                  setCustomGroups(parseInt(e.target.value));
                  setLocalStep(0);
                }}
                className="w-full h-1 bg-slate-850 rounded appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Bilangan Kedua B:</span>
                <strong className="text-amber-400 font-mono">{customSize}</strong>
              </div>
              <input
                type="range"
                min={materialId === 'X20' ? 2 : materialId === 'X21' ? 10 : 100}
                max={materialId === 'X20' ? 9 : materialId === 'X21' ? 99 : 999}
                value={customSize}
                onChange={(e) => {
                  setCustomSize(parseInt(e.target.value));
                  setLocalStep(0);
                }}
                className="w-full h-1 bg-slate-850 rounded appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-sans">
              Langkah {localStep + 1} / {gasingSteps.length}
            </span>
            <h4 className="text-sm font-bold text-white font-sans">{getStepHeadline()}</h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={localStep === 0}
              onClick={() => setLocalStep(prev => Math.max(0, prev - 1))}
              className="px-2 py-1 bg-slate-850 hover:bg-slate-800 disabled:opacity-30 rounded text-xs font-bold text-white flex items-center gap-1 transition cursor-pointer"
            >
              <ChevronLeft size={14} /> Mundur
            </button>
            <button
              disabled={localStep >= gasingSteps.length - 1}
              onClick={() => setLocalStep(prev => Math.min(gasingSteps.length - 1, prev + 1))}
              className="px-2 py-1 bg-indigo-650 hover:bg-indigo-555 disabled:opacity-30 rounded text-xs font-bold text-white flex items-center gap-1 transition cursor-pointer"
            >
              Maju <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {(materialId === 'X21' || materialId === 'X22') && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-slate-800/80 pb-3 font-sans select-none">
            {[
              { id: 0, label: "Pola Silang" },
              { id: 1, label: "Kelompok Hasil" },
              { id: 2, label: "Hasil Sementara" },
              { id: 3, label: "Notasi Gasing" },
              { id: 4, label: "Gilas (Hasil)" }
            ].map((tab) => {
              const active = localStep === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLocalStep(tab.id)}
                  type="button"
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1.5 ${
                    active 
                      ? 'bg-indigo-650 text-white shadow-md shadow-indigo-900/30 ring-1 ring-indigo-500' 
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850'
                  }`}
                >
                  <span className={`text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold ${active ? 'bg-indigo-900 text-white' : 'bg-slate-900 text-slate-500'}`}>
                    {tab.id + 1}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 2A. MENDATAR VIEW */}
        {x20Layout === 'mendatar' && (
          <div className="space-y-6 py-6 border border-slate-800 bg-slate-950/50 rounded-2xl p-5 text-center flex flex-col justify-center items-center font-sans">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">FORMAT NOTASI GASING (MENDATAR)</span>
            <div className="py-6 px-12 bg-slate-950 border border-slate-900 rounded-3xl shadow-2xl relative min-w-[280px]">
              {showSupNotation()}
            </div>

            <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl text-xs max-w-xl text-left leading-relaxed text-slate-300">
              <strong className="text-indigo-400 font-bold block mb-1">💡 Penjelasan Langkah Gasing:</strong>
              {getStepDesc()}
            </div>
          </div>
        )}

        {/* 2B. BERSUSUN VIEW */}
        {x20Layout === 'bersusun' && (
          <div className="flex flex-col items-center gap-6 animate-fade-in font-sans">
            {/* Visual aligned vertical block for vertical positioning of the problem */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-850 text-center flex flex-col justify-center items-center min-w-[280px] sm:min-w-[320px]">
              <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-4">SOAL POSISI VERTIKAL</div>
              
              <div className="font-mono text-3xl font-black text-slate-100 flex flex-col items-end pr-6 relative space-y-1">
                <div>{numA}</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-sans text-amber-500">×</span>
                  <span>{numB}</span>
                </div>
                <div className="w-24 border-b-4 border-slate-700 my-1"></div>
              </div>
            </div>

            {/* Down arrow showing Gasing progress path */}
            <div className="flex flex-col items-center select-none text-indigo-400">
              <ArrowDown size={32} className="animate-bounce text-indigo-500" />
            </div>

            {/* Same horizontal Gasing step notation */}
            <div className="w-full space-y-6 py-6 border border-slate-800 bg-slate-950/50 rounded-2xl p-5 text-center flex flex-col justify-center items-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">RANGKAIAN NOTASI GASING (MENDATAR DARI DEPAN)</span>
              <div className="py-6 px-12 bg-slate-950 border border-slate-900 rounded-3xl shadow-2xl relative min-w-[280px]">
                {showSupNotation()}
              </div>

              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl text-xs max-w-xl text-left leading-relaxed text-slate-300">
                <strong className="text-indigo-400 font-bold block mb-1">💡 Penjelasan Langkah Gasing:</strong>
                {getStepDesc()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. PRACTICAL WORKSHEET / INTERACTIVE QUIZ SECTION */}
      <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-805/40 text-left space-y-4">
        <div className="flex items-center justify-between border-b border-plat-800 pb-3 font-sans">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-505 border border-amber-500/20 text-[10px] uppercase font-bold rounded-full text-amber-400">
              Evaluasi Mandiri
            </span>
            <h4 className="text-sm font-black text-white">Generator Kuis Berhitung Gasing</h4>
          </div>

          <button
            onClick={generateNewPractice}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-200 transition font-black cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850"
          >
            <RefreshCw size={12} /> Soal Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center font-sans">
          {/* Layout for Question */}
          <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl text-center space-y-4 relative flex flex-col items-center justify-center min-h-[160px]">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Kerjakan Soal Berikut:</span>
            
            <div className="text-3xl font-black font-mono text-white tracking-wide">
              {practiceA} × {practiceB} = ?
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                pattern="[0-9]*"
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                placeholder="Masukkan jawaban..."
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-center text-sm w-44 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  const parsed = parseInt(practiceAnswer);
                  setPracticeChecked(parsed === practiceA * practiceB);
                }}
                className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-xs text-white cursor-pointer transition"
              >
                Periksa
              </button>
            </div>

            {/* Answer feedback */}
            {practiceChecked !== null && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-xs font-bold leading-normal px-4 py-1.5 rounded-full border flex items-center gap-1.5 ${
                  practiceChecked 
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' 
                    : 'bg-rose-950/40 text-rose-455 border-rose-900/50 text-rose-400'
                }`}
              >
                {practiceChecked ? "✨ Luar Biasa! Jawabanmu Tepat Sekali." : "❌ Kurang Tepat, Coba Kerjakan Pelan-Pelan."}
              </motion.div>
            )}
          </div>

          {/* Explanation Step-By-Step Solution */}
          <div className="space-y-2">
            <button
              onClick={() => setPracticeShowStep(!practiceShowStep)}
              className="w-full px-4 py-2.5 bg-slate-950 hover:bg-slate-900 font-black text-xs text-slate-300 rounded-xl border border-slate-850 flex items-center justify-between cursor-pointer"
            >
              <span>{practiceShowStep ? '🙈 Sembunyikan Pembahasan Gasing' : '📖 Tampilkan Langkah Pembahasan Gasing'}</span>
              <ChevronRight size={14} className={`transform transition-transform ${practiceShowStep ? 'rotate-90' : ''}`} />
            </button>

            {practiceShowStep && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl text-xs space-y-2 leading-relaxed"
              >
                <div className="font-bold text-amber-400 border-b border-slate-900 pb-1 uppercase tracking-wider text-[10px]">
                  Langkah Berpikir Gasing (Depan):
                </div>
                
                {/* Visual multiplication from front */}
                <div className="space-y-1 text-slate-350">
                  {materialId === 'X20' && (
                    <>
                      <div>1. R × n (Ratusan × n): <strong className="text-white">{Math.floor(practiceA / 100)} × {practiceB} = {Math.floor(practiceA / 100) * practiceB}</strong></div>
                      <div>2. P × n (Puluhan × n): <strong className="text-white">{Math.floor((practiceA % 100) / 10)} × {practiceB} = {Math.floor((practiceA % 100) / 10) * practiceB}</strong></div>
                      <div>3. S × n (Satuan × n): <strong className="text-white">{(practiceA % 10)} × {practiceB} = {(practiceA % 10) * practiceB}</strong></div>
                    </>
                  )}

                  {materialId === 'X21' && (() => {
                    const hp_A = Math.floor(practiceA / 100);
                    const tp_A = Math.floor((practiceA % 100) / 10);
                    const op_A = practiceA % 10;
                    const tp_B = Math.floor(practiceB / 10);
                    const op_B = practiceB % 10;

                    const pG1 = hp_A * tp_B;
                    const pG2 = (hp_A * op_B) + (tp_A * tp_B);
                    const pG3 = (tp_A * op_B) + (op_A * tp_B);
                    const pG4 = op_A * op_B;

                    const pS1 = Math.floor(pG2 / 10);
                    const pU1 = pG2 % 10;
                    const pS2 = Math.floor(pG3 / 10);
                    const pU2 = pG3 % 10;
                    const pS3 = Math.floor(pG4 / 10);
                    const pU3 = pG4 % 10;

                    const pSlots: { val: number; isSmall: boolean }[] = [];
                    const pG1Str = pG1.toString();
                    for (let i = 0; i < pG1Str.length; i++) {
                      pSlots.push({ val: parseInt(pG1Str[i]), isSmall: false });
                    }
                    if (pS1 > 0) {
                      pSlots.push({ val: pS1, isSmall: true });
                    }
                    pSlots.push({ val: pU1, isSmall: false });
                    if (pS2 > 0) {
                      pSlots.push({ val: pS2, isSmall: true });
                    }
                    pSlots.push({ val: pU2, isSmall: false });
                    if (pS3 > 0) {
                      pSlots.push({ val: pS3, isSmall: true });
                    }
                    pSlots.push({ val: pU3, isSmall: false });

                    const pSlotsAdditions: { leftVal: number; smallVal: number; sum: number }[] = [];
                    for (let i = 0; i < pSlots.length; i++) {
                      if (pSlots[i].isSmall) {
                        pSlotsAdditions.push({
                          leftVal: pSlots[i - 1].val,
                          smallVal: pSlots[i].val,
                          sum: pSlots[i - 1].val + pSlots[i].val
                        });
                      }
                    }

                    return (
                      <div className="space-y-1.5 mt-2 text-slate-300">
                        <div>
                          <strong>1. Pola Silang Diagonal Gasing:</strong> Hubungkan rute perkalian ratusan-puluhan-satuan dengan pengali puluhan-satuan.
                        </div>
                        <div>
                          <strong>2. Hasil Tiap Kelompok:</strong>
                          <ul className="pl-4 list-disc opacity-85 mt-0.5 space-y-0.5 text-[11px] font-mono">
                            <li>Kelompok 1 (R × P): {hp_A} × {tp_B} = {pG1}</li>
                            <li>Kelompok 2 ((R × S) + (P × P)): ({hp_A} × {op_B}) + ({tp_A} × {tp_B}) = {pG2}</li>
                            <li>Kelompok 3 ((P × S) + (S × P)): ({tp_A} × {op_B}) + ({op_A} × {tp_B}) = {pG3}</li>
                            <li>Kelompok 4 (S × S): {op_A} × {op_B} = {pG4}</li>
                          </ul>
                        </div>
                        <div>
                          <strong>3. Hasil Sementara:</strong> <code className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-indigo-300 font-mono text-[11px] rounded">{pG1} | {pG2} | {pG3} | {pG4}</code>
                        </div>
                        <div>
                          <strong>4. Notasi Gasing (No 0-sup):</strong> <code className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-rose-300 font-mono text-[11px] rounded">
                            {pG1}
                            {pS1 > 0 ? `⁺${pS1}` : ''}{pU1}
                            {pS2 > 0 ? `⁺${pS2}` : ''}{pU2}
                            {pS3 > 0 ? `⁺${pS3}` : ''}{pU3}
                          </code>
                        </div>
                        <div>
                          <strong>5. Gabung Samping:</strong> Angka kecil selalu digabung dengan angka besar yang berada tepat di sebelah kirinya secara langsung.
                          {pSlotsAdditions.length > 0 ? (
                            <ul className="pl-4 list-disc opacity-85 mt-0.5 space-y-0.5 text-[11px] font-mono text-emerald-400">
                              {pSlotsAdditions.map((addi, idx2) => (
                                <li key={idx2}>{addi.leftVal} + {addi.smallVal} = {addi.sum}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-emerald-450 text-emerald-400 ml-1">Tidak ada angka kecil, langsung gabungkan.</span>
                          )}
                          <div className="mt-1">Jawaban Akhir: <strong className="text-emerald-400 font-bold">{practiceA * practiceB}</strong></div>
                        </div>
                      </div>
                    );
                  })()}

                  {materialId === 'X22' && (() => {
                    const hp_A = Math.floor(practiceA / 100);
                    const tp_A = Math.floor((practiceA % 100) / 10);
                    const op_A = practiceA % 10;
                    const hp_B = Math.floor(practiceB / 100);
                    const tp_B = Math.floor((practiceB % 100) / 10);
                    const op_B = practiceB % 10;

                    const pG1 = hp_A * hp_B;
                    const pG2_1 = hp_A * tp_B;
                    const pG2_2 = tp_A * hp_B;
                    const pG2 = pG2_1 + pG2_2;
                    const pG3_1 = hp_A * op_B;
                    const pG3_2 = tp_A * tp_B;
                    const pG3_3 = op_A * hp_B;
                    const pG3 = pG3_1 + pG3_2 + pG3_3;
                    const pG4_1 = tp_A * op_B;
                    const pG4_2 = op_A * tp_B;
                    const pG4 = pG4_1 + pG4_2;
                    const pG5 = op_A * op_B;

                    const pS1 = Math.floor(pG2 / 10);
                    const pU1 = pG2 % 10;
                    const pS2 = Math.floor(pG3 / 10);
                    const pU2 = pG3 % 10;
                    const pS3 = Math.floor(pG4 / 10);
                    const pU3 = pG4 % 10;
                    const pS4 = Math.floor(pG5 / 10);
                    const pU4 = pG5 % 10;

                    const pSlots: { val: number; isSmall: boolean }[] = [];
                    const pG1Str = pG1.toString();
                    for (let i = 0; i < pG1Str.length; i++) {
                      pSlots.push({ val: parseInt(pG1Str[i]), isSmall: false });
                    }
                    if (pS1 > 0) {
                      pSlots.push({ val: pS1, isSmall: true });
                    }
                    pSlots.push({ val: pU1, isSmall: false });
                    if (pS2 > 0) {
                      pSlots.push({ val: pS2, isSmall: true });
                    }
                    pSlots.push({ val: pU2, isSmall: false });
                    if (pS3 > 0) {
                      pSlots.push({ val: pS3, isSmall: true });
                    }
                    pSlots.push({ val: pU3, isSmall: false });
                    if (pS4 > 0) {
                      pSlots.push({ val: pS4, isSmall: true });
                    }
                    pSlots.push({ val: pU4, isSmall: false });

                    const pSlotsAdditions: { leftVal: number; smallVal: number; sum: number }[] = [];
                    for (let i = 0; i < pSlots.length; i++) {
                      if (pSlots[i].isSmall) {
                        pSlotsAdditions.push({
                          leftVal: pSlots[i - 1].val,
                          smallVal: pSlots[i].val,
                          sum: pSlots[i - 1].val + pSlots[i].val
                        });
                      }
                    }

                    return (
                      <div className="space-y-1.5 mt-2 text-slate-300">
                        <div>
                          <strong>1. Pola Silang Diagonal Gasing:</strong> Hubungkan rute perkalian ratusan-puluhan-satuan dengan pengali ratusan-puluhan-satuan.
                        </div>
                        <div>
                          <strong>2. Hasil Tiap Kelompok:</strong>
                          <ul className="pl-4 list-disc opacity-85 mt-0.5 space-y-0.5 text-[11px] font-mono font-sans">
                            <li>Kelompok 1 (R × R): {hp_A} × {hp_B} = {pG1}</li>
                            <li>Kelompok 2 ((R × P) + (P × R)): ({hp_A} × {tp_B}) + ({tp_A} × {hp_B}) = {pG2}</li>
                            <li>Kelompok 3 ((R × S) + (P × P) + (S × R)): ({hp_A} × {op_B}) + ({tp_A} × {tp_B}) + ({op_A} × {hp_B}) = {pG3}</li>
                            <li>Kelompok 4 ((P × S) + (S × P)): ({tp_A} × {op_B}) + ({op_A} × {tp_B}) = {pG4}</li>
                            <li>Kelompok 5 (S × S): {op_A} × {op_B} = {pG5}</li>
                          </ul>
                        </div>
                        <div>
                          <strong>3. Hasil Sementara:</strong> <code className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-indigo-300 font-mono text-[11px] rounded">{pG1} | {pG2} | {pG3} | {pG4} | {pG5}</code>
                        </div>
                        <div>
                          <strong>4. Notasi Gasing (No 0-sup):</strong> <code className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-rose-300 font-mono text-[11px] rounded">
                            {pG1}
                            {pS1 > 0 ? `⁺${pS1}` : ''}{pU1}
                            {pS2 > 0 ? `⁺${pS2}` : ''}{pU2}
                            {pS3 > 0 ? `⁺${pS3}` : ''}{pU3}
                            {pS4 > 0 ? `⁺${pS4}` : ''}{pU4}
                          </code>
                        </div>
                        <div>
                          <strong>5. Gabung Samping:</strong> Angka kecil selalu digabung dengan angka besar yang berada tepat di sebelah kirinya secara langsung.
                          {pSlotsAdditions.length > 0 ? (
                            <ul className="pl-4 list-disc opacity-85 mt-0.5 space-y-0.5 text-[11px] font-mono text-emerald-400">
                              {pSlotsAdditions.map((addi, idx2) => (
                                <li key={idx2}>{addi.leftVal} + {addi.smallVal} = {addi.sum}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-emerald-450 text-emerald-400 ml-1 font-sans">Tidak ada angka kecil, langsung gabungkan.</span>
                          )}
                          <div className="mt-1">Jawaban Akhir: <strong className="text-emerald-400 font-bold font-sans">{practiceA * practiceB}</strong></div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="pt-2 border-t border-slate-900 text-emerald-400 font-semibold">
                    Hasil Gabungan Terkonvergen: {practiceA * practiceB}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
