/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { WorksheetHeaderData, GasingMaterial, OperationType } from '../types';
import { GraduationCap, Award, ShieldCheck } from 'lucide-react';

interface WorksheetHeaderProps {
  headerData: WorksheetHeaderData;
  selectedMaterial: GasingMaterial;
  operation: OperationType;
  totalQuestions: number;
}

export const WorksheetHeader: React.FC<WorksheetHeaderProps> = ({
  headerData,
  selectedMaterial,
  operation,
  totalQuestions,
}) => {
  const {
    schoolName,
    schoolSubtext,
    teacherName,
    logoType,
    customLogoUrl,
  } = headerData;

  const hasSchoolName = Boolean(schoolName && schoolName.trim().length > 0);
  const hasSubtext = Boolean(schoolSubtext && schoolSubtext.trim().length > 0);
  const hasTeacher = Boolean(teacherName && teacherName.trim().length > 0);

  return (
    <div className="flex flex-col mb-6 font-sans gasing-pdf-block">
      {/* 
        KOP KEDINASAN / CORPORATE ACADEMIC HEADER
        Struktur simetris berbobot resmi: 
        [Logo Kiri (Opsional)] | [Teks Identitas Instansi & Dokumen di Tengah] | [Badge Meta Kanan (Jenjang & Butir Soal)]
      */}
      <div className="flex items-center justify-between gap-6 pb-2">
        {/* Sisi Kiri: Logo Instansi Resmi */}
        {logoType !== 'none' ? (
          <div className="shrink-0 flex items-center justify-center">
            {logoType === 'custom' && customLogoUrl ? (
              <div className="w-20 h-20 rounded-xl bg-transparent border-2 border-slate-300 p-1 flex items-center justify-center overflow-hidden print:border-slate-500">
                <img
                  src={customLogoUrl}
                  alt="Logo Instansi"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : logoType === 'preset:kemenag' ? (
              <div className="w-20 h-20 rounded-xl bg-emerald-50/40 border-2 border-emerald-800 flex flex-col items-center justify-center text-emerald-900 print:border-slate-800 print:bg-transparent">
                <ShieldCheck className="w-8 h-8 text-emerald-800 print:text-slate-800" />
                <span className="text-[8px] font-black tracking-wider uppercase mt-0.5 text-emerald-900 print:text-slate-900">
                  KEMENAG
                </span>
              </div>
            ) : logoType === 'preset:kemendikbud' ? (
              <div className="w-20 h-20 rounded-xl bg-sky-50/40 border-2 border-sky-800 flex flex-col items-center justify-center text-sky-900 print:border-slate-800 print:bg-transparent">
                <Award className="w-8 h-8 text-sky-800 print:text-slate-800" />
                <span className="text-[8px] font-black tracking-wider uppercase mt-0.5 text-sky-900 print:text-slate-900">
                  TUT WURI
                </span>
              </div>
            ) : (
              /* preset:gasing */
              <div className="w-20 h-20 rounded-xl bg-emerald-50/50 border-2 border-emerald-800 flex flex-col items-center justify-center text-emerald-900 print:border-slate-800 print:bg-transparent">
                <svg viewBox="0 0 48 48" className="w-9 h-9">
                  <polygon points="24,4 42,18 24,24 6,18" fill="#047857" />
                  <polygon points="6,18 24,24 24,44" fill="#065f46" />
                  <polygon points="42,18 24,24 24,44" fill="#10b981" />
                  <polygon points="24,24 33,34 24,44 15,34" fill="#f59e0b" />
                  <circle cx="24" cy="44" r="2.5" fill="#047857" />
                </svg>
                <span className="text-[8px] font-black tracking-wider uppercase mt-1 text-emerald-950 font-display print:text-slate-900">
                  GASING
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-2 shrink-0"></div>
        )}

        {/* Bagian Tengah: Teks Identitas Lembaga & Judul Dokumen (Tata Letak Resmi Kedinasan) */}
        <div className="flex-1 min-w-0 text-center px-3">
          {hasSchoolName && (
            <h2
              id="kop-nama-sekolah"
              className="text-lg font-black text-slate-900 uppercase tracking-wider leading-tight mb-0.5 font-display print:text-slate-950"
            >
              {schoolName.trim().toUpperCase()}
            </h2>
          )}

          {hasSubtext && (
            <p className="text-xs text-slate-600 font-medium leading-tight mb-1.5 font-sans print:text-slate-700">
              {schoolSubtext.trim()}
            </p>
          )}

          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug uppercase font-display print:text-slate-950">
            LEMBAR KERJA PESERTA DIDIK (LKPD)
          </h1>

          <p className="text-sm font-bold text-slate-800 tracking-normal mt-1 leading-normal font-sans">
            Matematika — Metode GASING: <span className="text-emerald-800 print:text-slate-900 font-black">{selectedMaterial.code} ({selectedMaterial.title})</span>
          </p>
        </div>

        {/* Sisi Kanan: Meta Dokumen (Jenjang & Jumlah Soal) */}
        <div className="shrink-0 flex flex-col items-end justify-center gap-1.5">
          <div className="px-3 py-1 border border-slate-300 rounded-md bg-slate-50/80 text-[11px] font-bold text-slate-800 uppercase tracking-wide print:bg-transparent print:border-slate-600 whitespace-nowrap text-center min-w-[120px]">
            Jenjang SD / MI
          </div>
          <div className="px-3 py-1 border border-slate-300 rounded-md bg-slate-50/80 text-[11px] font-bold text-slate-800 uppercase tracking-wide print:bg-transparent print:border-slate-600 whitespace-nowrap text-center min-w-[120px]">
            {totalQuestions} Butir Soal
          </div>
        </div>
      </div>

      {/* Official Government / Academic Double Border Divider */}
      <div className="w-full mt-2 mb-4">
        <div className="border-b-[3px] border-slate-900"></div>
        <div className="border-b border-slate-800 mt-[2px]"></div>
      </div>

      {/* Structured Corporate / Academic Student Identity Table */}
      <div className="w-full border-2 border-slate-800 rounded-lg overflow-hidden bg-white box-border shadow-xs">
        <div className="grid grid-cols-12 divide-x-2 divide-slate-800 text-xs">
          
          {/* Kolom Kiri: Biodata Siswa (7 dari 12 kolom) */}
          <div className="col-span-7 flex flex-col divide-y-2 divide-slate-200">
            {/* Baris Pertama: Nama Lengkap Siswa */}
            <div className="h-13 px-4 flex items-center gap-2">
              <span className="w-28 shrink-0 font-bold uppercase text-slate-700 text-xs tracking-wider flex items-center">
                Nama Lengkap
              </span>
              <span className="font-bold text-slate-500 shrink-0 flex items-center">:</span>
              <div className="flex-1 h-5 border-b-2 border-dotted border-slate-400"></div>
            </div>

            {/* Baris Kedua: Kelas & Hari/Tanggal */}
            <div className="grid grid-cols-2 divide-x-2 divide-slate-200 h-13">
              <div className="px-4 flex items-center gap-2 h-full">
                <span className="w-24 shrink-0 font-bold uppercase text-slate-700 text-xs tracking-wider flex items-center">
                  Kelas / No.
                </span>
                <span className="font-bold text-slate-500 shrink-0 flex items-center">:</span>
                <div className="flex-1 h-5 border-b-2 border-dotted border-slate-400"></div>
              </div>

              <div className="px-4 flex items-center gap-2 h-full">
                <span className="w-20 shrink-0 font-bold uppercase text-slate-700 text-xs tracking-wider flex items-center">
                  Hari / Tgl
                </span>
                <span className="font-bold text-slate-500 shrink-0 flex items-center">:</span>
                <div className="flex-1 h-5 border-b-2 border-dotted border-slate-400"></div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Penilaian & Pengesahan (5 dari 12 kolom) */}
          <div className="col-span-5 grid grid-cols-2 divide-x-2 divide-slate-800">
            {/* Nilai / Skor Akhir */}
            <div className="flex flex-col items-center justify-between p-2.5 text-center h-full min-h-[104px]">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 block w-full text-center leading-none pt-0.5">
                Nilai Akhir
              </span>
              <div className="flex-1 flex items-center justify-center w-full">
                <div className="flex items-baseline justify-center gap-1.5 my-1">
                  <span className="text-2xl font-black text-slate-300 tracking-wider">____</span>
                  <span className="text-sm font-black text-slate-800 font-bold">/ {totalQuestions}</span>
                </div>
              </div>
              <div className="w-full flex flex-col items-center opacity-0 pointer-events-none select-none">
                <div className="w-20 border-b border-transparent mb-1"></div>
                <span className="text-[10px] font-bold block text-center w-full px-1 leading-normal pb-0.5">
                  ( Guru Pengampu )
                </span>
              </div>
            </div>

            {/* Paraf & Nama Guru */}
            <div className="flex flex-col items-center justify-between p-2.5 text-center h-full min-h-[104px]">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 block w-full text-center leading-none pt-0.5">
                Paraf Guru
              </span>
              
              {/* Ruang tanda tangan */}
              <div className="flex-1 w-full min-h-[40px]"></div>

              {/* Garis batas tanda tangan dan Nama Guru Pengampu */}
              <div className="w-full flex flex-col items-center">
                <div className="w-24 border-b border-slate-400 mb-1"></div>
                <span className="text-[10px] font-bold text-slate-700 block text-center w-full px-1 leading-tight pb-0.5 truncate max-w-full">
                  {hasTeacher ? teacherName : '( Guru Pengampu )'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WorksheetHeader;
