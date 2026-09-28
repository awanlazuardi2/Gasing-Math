import React, { useState } from 'react';
import { Settings, Award, Users, Flame, Volume2, VolumeX, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { isSoundEnabled, setSoundEnabled, playBubblePop } from '../utils/soundEffects';

export interface KidsTopBarProps {
  starsCount: number;
  totalQuestions: number;
  streakCount: number;
  onOpenSettings: () => void;
  onOpenRoleSwitcher: () => void;
  onSwitchToTeacher?: () => void;
  onOpenBadges: () => void;
}

export const KidsTopBar: React.FC<KidsTopBarProps> = ({
  starsCount,
  totalQuestions,
  streakCount,
  onOpenSettings,
  onOpenRoleSwitcher,
  onSwitchToTeacher,
  onOpenBadges,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

  const handleToggleSound = () => {
    const nextState = !soundOn;
    setSoundEnabled(nextState);
    setSoundOn(nextState);
    if (nextState) {
      playBubblePop();
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="no-print px-2 sm:px-4 pt-2 sticky top-0 z-40"
      id="kids-top-navbar"
    >
      <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md border-2 border-sky-200/90 rounded-3xl sm:rounded-[26px] px-3 sm:px-5 py-2 shadow-md shadow-sky-500/5 flex items-center justify-between gap-2 sm:gap-4 font-sans">
        {/* Left: Mascot Avatar + Brand + Star Counter */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mini Mascot Avatar (Gigi Si Bintang Gasing) */}
          <div 
            onClick={() => {
              playBubblePop();
              onOpenRoleSwitcher();
            }}
            className="flex items-center gap-2 cursor-pointer group select-none"
            title="Gasing Pintar - Klik untuk ganti peran"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-pink-400 to-amber-300 border-2 border-white flex items-center justify-center shadow-xs group-hover:scale-105 group-active:scale-95 transition-transform overflow-hidden relative">
              <svg viewBox="0 0 100 100" className="w-full h-full p-1 drop-shadow-xs">
                {/* 3D Gasing Cone Tip at base */}
                <path d="M 45 68 L 50 90 L 55 68 Z" fill="#b45309" />
                <circle cx="50" cy="90" r="1.5" fill="#ffffff" />
                {/* Amber cone */}
                <path d="M 32 54 Q 38 68 50 70 Q 62 68 68 54 Z" fill="#f59e0b" />
                {/* Cyan Rim */}
                <ellipse cx="50" cy="52" rx="30" ry="10" fill="#06b6d4" stroke="#0891b2" strokeWidth="1" />
                {/* Red Dome */}
                <path d="M 32 50 C 32 30 68 30 68 50 Z" fill="#ef4444" />
                <ellipse cx="46" cy="40" rx="6" ry="3" fill="#ffffff" opacity="0.6" transform="rotate(-15 46 40)" />
                {/* Peg top */}
                <rect x="48" y="24" width="4" height="10" rx="1" fill="#cbd5e1" />
                <circle cx="50" cy="22" r="3.5" fill="#f59e0b" />
              </svg>
            </div>
            
            <div className="hidden xs:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-display">
                  gasing<span className="text-pink-500 font-black">!</span>
                </span>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-display">
                  Siswa
                </span>
              </div>
            </div>
          </div>

          {/* Star Counter Pill - Joyful Gold Candy Badge */}
          <div className="flex items-center gap-1.5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-300 border-b-[3px] border-b-amber-600 px-3 py-1 rounded-2xl shadow-xs font-black text-xs sm:text-sm text-amber-950 font-display">
            <span className="text-base sm:text-lg animate-bounce" style={{ animationDuration: '2.5s' }}>⭐</span>
            <span className="text-sm sm:text-base leading-none drop-shadow-2xs">{starsCount}</span>
            <span className="text-amber-950/80 font-bold text-[11px] hidden sm:inline font-sans">Bintang</span>
          </div>

          {/* Streak Indicator (if active) */}
          {streakCount >= 2 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-400 to-pink-500 border border-orange-300 text-white px-2.5 py-1 rounded-2xl text-xs font-black shadow-xs animate-pulse font-display">
              <Flame className="w-3.5 h-3.5 fill-white text-white" />
              <span>x{streakCount}</span>
            </div>
          )}
        </div>

        {/* Right: Sound Toggle + Lencana + Pengaturan + Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Effect Toggle - Sky Blue Candy */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-2xl border-2 text-xs font-display font-black transition-all active:scale-95 active:border-b-2 active:translate-y-[1px] cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1 select-none ${
              soundOn 
                ? 'bg-sky-50 text-sky-700 border-sky-200 border-b-[3px] border-b-sky-300 hover:bg-sky-100' 
                : 'bg-slate-100 text-slate-400 border-slate-200 border-b-[3px] border-b-slate-300 hover:bg-slate-200'
            }`}
            title={soundOn ? 'Suara Aktif (Klik untuk Mematikan)' : 'Suara Mati (Klik untuk Mengaktifkan)'}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-sky-600 shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span className="hidden md:inline">{soundOn ? 'Suara' : 'Mute'}</span>
          </button>

          {/* Lencana Button - Sunny Yellow Candy */}
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              onOpenBadges();
            }}
            className="w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 active:scale-95 active:border-b-2 active:translate-y-[1px] text-amber-800 border-2 border-amber-200 border-b-[3px] border-b-amber-300 text-xs font-display font-black transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1 select-none"
            title="Lihat Koleksi Lencana & Trofi Kamu"
          >
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">Lencana</span>
          </button>

          {/* Pengaturan Soal Button - Soft Pink Candy */}
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              onOpenSettings();
            }}
            id="kids-topbar-settings-btn"
            className="w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-2xl bg-pink-50 hover:bg-pink-100 active:scale-95 active:border-b-2 active:translate-y-[1px] text-pink-700 border-2 border-pink-200 border-b-[3px] border-b-pink-300 text-xs font-display font-black transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1.5 select-none"
            title="Atur Materi & Jumlah Soal"
          >
            <Settings className="w-4 h-4 text-pink-600 shrink-0" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>

          {/* Tombol Ruang Guru - Fresh Mint Candy */}
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              if (onSwitchToTeacher) {
                onSwitchToTeacher();
              } else {
                onOpenRoleSwitcher();
              }
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 active:border-b-2 active:translate-y-[1px] text-emerald-800 border-2 border-emerald-200 border-b-[3px] border-b-emerald-300 text-xs font-display font-black transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1.5 select-none"
            title="Buka Ruang Guru: Generator & Cetak Lembar Kerja"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Ruang Guru</span>
            <span className="sm:hidden text-[11px]">Guru</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default KidsTopBar;
