/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef, useState } from 'react';
import { WorksheetHeaderData, LogoPresetType } from '../types';
import {
  GraduationCap,
  Upload,
  Trash2,
  Clock,
  Calendar,
  User,
  Check,
  Building2,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';

interface WorksheetHeaderConfigProps {
  data: WorksheetHeaderData;
  onChange: (data: WorksheetHeaderData) => void;
}

export const WorksheetHeaderConfig: React.FC<WorksheetHeaderConfigProps> = ({
  data,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof WorksheetHeaderData>(
    field: K,
    value: WorksheetHeaderData[K]
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB for responsiveness & localStorage safety)
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran berkas logo terlalu besar (maksimal 3MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onChange({
          ...data,
          logoType: 'custom',
          customLogoUrl: base64,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const clearCustomLogo = () => {
    onChange({
      ...data,
      logoType: 'preset:gasing',
      customLogoUrl: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs transition-all font-sans">
      {/* Header Toggle */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">
              Identitas KOP & Naskah LKPD
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Logo, instansi, guru pengampu, dan petunjuk
            </p>
          </div>
        </div>
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
          aria-label={isOpen ? 'Tutup konfigurasi KOP' : 'Buka konfigurasi KOP'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4 pt-3 border-t border-slate-100 text-left">
          {/* LOGO INSTANSI SECTION */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-display">
              Logo Sekolah / Lembaga
            </label>

            {/* Quick Preset Selector */}
            <div className="grid grid-cols-2 gap-1.5 mb-2.5 font-display">
              <button
                type="button"
                onClick={() => updateField('logoType', 'preset:gasing')}
                className={`text-xs py-2 px-2.5 rounded-xl font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  data.logoType === 'preset:gasing'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>⚡ GASING</span>
                {data.logoType === 'preset:gasing' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => updateField('logoType', 'preset:kemendikbud')}
                className={`text-xs py-2 px-2.5 rounded-xl font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  data.logoType === 'preset:kemendikbud'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🎓 Kemendikbud</span>
                {data.logoType === 'preset:kemendikbud' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => updateField('logoType', 'preset:kemenag')}
                className={`text-xs py-2 px-2.5 rounded-xl font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  data.logoType === 'preset:kemenag'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🕌 Kemenag</span>
                {data.logoType === 'preset:kemenag' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => updateField('logoType', 'none')}
                className={`text-xs py-2 px-2.5 rounded-xl font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  data.logoType === 'none'
                    ? 'bg-slate-800 border-slate-800 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Tanpa Logo</span>
                {data.logoType === 'none' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Custom Logo Upload Box */}
            <div className="border border-dashed border-slate-300 rounded-2xl p-3 bg-slate-50/70 hover:bg-slate-50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
                id="school-logo-upload"
              />

              {data.logoType === 'custom' && data.customLogoUrl ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={data.customLogoUrl}
                      alt="Pratinjau Logo"
                      className="w-10 h-10 object-contain rounded-xl border border-slate-200 bg-white p-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 font-display">Logo Sekolah Aktif</p>
                      <p className="text-[10px] text-emerald-600 font-medium">✓ Siap tercetak di dokumen PDF</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearCustomLogo}
                    className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Hapus Logo Mandiri"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center justify-center py-2 text-center select-none"
                >
                  <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                  <p className="text-xs font-bold text-slate-800 font-display">
                    Unggah Logo Sekolah Sendiri (PNG / JPG)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Klik untuk memilih berkas dari perangkat Anda (Maks. 3MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* NAMA SEKOLAH / MADRASAH */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="cfg-school-name" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">
                Nama Sekolah / Madrasah
              </label>
              {data.schoolName.trim() && (
                <button
                  type="button"
                  onClick={() => updateField('schoolName', '')}
                  className="text-[10px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  Kosongkan
                </button>
              )}
            </div>
            <input
              id="cfg-school-name"
              type="text"
              value={data.schoolName}
              onChange={(e) => updateField('schoolName', e.target.value)}
              placeholder="Contoh: SD NEGERI 01 JAKARTA / MI NURUL IMAN"
              className="w-full text-xs font-bold uppercase bg-slate-50 border border-slate-200 text-slate-900 py-2.5 px-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 font-display"
            />
          </div>

          {/* SUB-KETERANGAN / ALAMAT KOP */}
          <div>
            <label htmlFor="cfg-school-subtext" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-display">
              Alamat / Keterangan KOP (Opsional)
            </label>
            <input
              id="cfg-school-subtext"
              type="text"
              value={data.schoolSubtext}
              onChange={(e) => updateField('schoolSubtext', e.target.value)}
              placeholder="Contoh: Jl. Merdeka No. 45, Gambir, Jakarta Pusat"
              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-900 py-2 px-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* NAMA GURU PENGAMPU */}
          <div>
            <label htmlFor="cfg-teacher-name" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-display">
              Nama Guru Pengampu (Kolom Paraf)
            </label>
            <input
              id="cfg-teacher-name"
              type="text"
              value={data.teacherName}
              onChange={(e) => updateField('teacherName', e.target.value)}
              placeholder="Contoh: Siti Rahmawati, S.Pd."
              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-900 py-2 px-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorksheetHeaderConfig;
