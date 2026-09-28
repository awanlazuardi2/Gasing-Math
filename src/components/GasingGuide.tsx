/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Star, Sparkles, HelpCircle, GraduationCap, Compass, Layers, AlertCircle, Award, ArrowDownUp, Check } from 'lucide-react';

const PASANGAN_10_LIST = [
  { num1: 1, num2: 9, code: 'SS', text: 'satu sembilan', w1: 'Satu', w2: 'Sembilan' },
  { num1: 2, num2: 8, code: 'DD', text: 'dua delapan', w1: 'Dua', w2: 'Delapan' },
  { num1: 3, num2: 7, code: 'TT', text: 'tiga tujuh', w1: 'Tiga', w2: 'Tujuh' },
  { num1: 4, num2: 6, code: 'EE', text: 'empat enam', w1: 'Empat', w2: 'Enam' },
  { num1: 5, num2: 5, code: 'LL', text: 'lima lima', w1: 'Lima', w2: 'Lima' },
];

export default function GasingGuide() {
  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(0);
  const activePair = PASANGAN_10_LIST[selectedPairIndex];

  return (
    <div className="space-y-12 text-slate-800 font-sans" id="gasing-guide-root">
      
      {/* 1. Hero / Header Profil Prof. Yohanes Surya */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-850 rounded-[32px] p-8 md:p-12 relative overflow-hidden text-left text-white shadow-xl">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 top-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30">
              Profil Tokoh & Penemu
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
              Prof. Yohanes Surya, Ph.D.
            </h1>
            <p className="text-sm md:text-base text-indigo-300 font-semibold tracking-wide">
              Fisikawan, Pendidik, & Pendiri Surya Institute
            </p>
          </div>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal">
            Beliau memperoleh gelar Ph.D. dalam bidang Fisika dari <strong className="text-white">College of William and Mary (USA)</strong>. Berdedikasi tinggi mengubah wajah pendidikan Indonesia, beliau menciptakan Metode GASING agar tidak ada lagi anak yang tertinggal dalam matematika. 
          </p>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 italic text-xs leading-relaxed text-slate-200 font-sans max-w-2xl relative">
            <span className="text-2xl text-rose-500 font-serif absolute -top-2 -left-1">“</span>
            <p className="pl-4">
              Tidak ada anak yang bodoh. Yang ada hanyalah anak yang belum mendapatkan kesempatan belajar dari guru yang baik dengan metode yang tepat. Semua anak, dari pelosok terdalam sekalipun, bisa menjadi juara dunia jika diajar dengan Gampang, ASyIk, menyenaNGkan.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Sejarah Metode GASING */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-3 text-left">
          <div className="bg-indigo-550/10 text-indigo-600 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider w-fit">
            Latar Belakang
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Sejarah Lahirnya Metode GASING
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Metode ini tidak lahir dari laboratorium teoritis yang steril, melainkan dari perjuangan langsung di garis depan keterbatasan wilayah pelosok tanah air.
          </p>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200/60 text-left space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Metode <strong>GASING (Gampang, ASyIk, menyenaNGkan)</strong> dirintis oleh Prof. Yohanes Surya pada tahun 1996. Awal mulanya, metode ini dikembangkan untuk melatih anak-anak di daerah tertinggal dan terpencil di Indonesia, seperti daerah Tolikara di pedalaman Papua, yang semula tidak bisa berhitung sama sekali.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hanya dalam waktu beberapa bulan pelatihan intensif berbasis benda konkret dan dialog interaktif tanpa hafalan rumus kaku, anak-anak tersebut tidak hanya mampu berhitung cepat, tetapi juga berhasil memenangkan berbagai <strong>Olimpiade Sains dan Matematika tingkat Nasional serta Internasional</strong>.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Keberhasilan spektakuler ini membuktikan secara ilmiah bahwa dengan pendekatan pedagogi yang tepat, potensi kognitif anak dapat diakselerasi secara luar biasa tanpa menimbulkan tekanan mental atau trauma belajar matematika.
          </p>
        </div>
      </div>

      {/* 3. Pilar Filosofi Belajar Mandiri GASING */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-150 font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Alasan Ilmiah & Pedagogis
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Mengapa Metode GASING Berbeda?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Berikut adalah pilar utama mengapa GASING membuang metode hafalan kuno dan menggantinya dengan pemahaman logika alami:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* A. Mengapa bekerja dari depan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              1. Mengapa Bekerja Dari Depan?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mengerjakan hitungan dari kiri ke kanan (dari depan) adalah arah alami manusia membaca, menulis, dan berbicara. Ketika kita ditanya suatu bilangan, kita selalu menyebut digit paling depan terlebih dahulu. 
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dengan mengerjakan dari depan, anak-anak langsung memproses nilai tempat terbesar secara proaktif. Mereka tidak perlu menunggu seluruh barisan hitungan selesai dari belakang, sehingga memicu kecepatan proses mental mencongak di bawah 2 detik.
            </p>
          </div>

          {/* B. Mengapa menggunakan pasangan angka */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              2. Mengapa Menggunakan Pasangan Angka?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Basis sistem bilangan kita adalah basis 10. Oleh karena itu, konsep <strong>Pasangan 10</strong> (seperti 9 dengan 1, 8 dengan 2, 7 dengan 3) merupakan landasan mutlak berhitung cepat.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ketika anak menguasai pasangan ini secara refleks, operasi matematika yang rumit seperti penjumlahan menyimpan atau pengurangan meminjam langsung tereliminasi. Operasi tersebut diubah menjadi kalkulasi komplementer yang sangat sederhana di kepala mereka.
            </p>
          </div>

          {/* C. Mengapa menggunakan kartu nilai tempat */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              3. Mengapa Menggunakan Kartu Nilai Tempat?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anak-anak sering mengalami kesulitan karena angka tertulis bersifat terlalu abstrak. Kartu nilai tempat GASING memisahkan ratusan, puluhan, dan satuan secara fisik dan warna yang konsisten.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ini memberikan jembatan sensorik yang kuat bagi otak anak untuk memahami kuantitas nyata di balik simbol angka. Siswa menyadari arti fisis dari perpindahan nilai tempat, bukan sekadar memindahkan angka kosong di kertas.
            </p>
          </div>

          {/* D. Mengapa menghindari algoritma konvensional */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              4. Mengapa Menghindari Algoritma Konvensional?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Metode konvensional (seperti penambahan susun bawah dari kanan dengan menulis angka simpanan kecil di bawah/atas, atau pembagian bersusun "porogapit") bersifat sangat mekanis, kaku, dan lambat.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Metode-metode lama tersebut tidak melatih intuisi angka (number sense) anak, melainkan hanya melatih ingatan prosedural yang rentan salah tulis. GASING membuangnya dan menggunakan **Notasi Coret Horizontal Horizontal** yang menuntut visualisasi mental aktif dan mandiri.
            </p>
          </div>

        </div>
      </div>

      {/* 4. Interactive Element: Pasangan 10 (GASING Mnemonic) */}
      <div id="pasangan-10-visualizer" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 text-left space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="text-indigo-600 w-5 h-5 shrink-0" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
              Eksplorasi Pasangan 10
            </h3>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
            Rumus Huruf Kembar GASING
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Angka di baris atas lurus dengan pasangannya di baris bawah. Awalan hurufnya selalu sama (kembar) sehingga sangat mudah dihafal murid dan orang tua:
        </p>

        {/* 5 Kolom Sejajar Elegan: Baris Atas 1-5, Baris Bawah 9-5 */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 pt-1 select-none">
          {PASANGAN_10_LIST.map((pair, index) => {
            const isSelected = selectedPairIndex === index;
            const [word1, word2] = pair.text.split(' ');
            return (
              <button
                key={pair.code}
                type="button"
                id={`btn-pair-col-${index}`}
                onClick={() => setSelectedPairIndex(index)}
                className={`group flex flex-col items-center justify-between py-3 px-1 sm:py-4 sm:px-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-400 shadow-sm ring-2 ring-indigo-200/70'
                    : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Baris Pertama: 1 2 3 4 5 */}
                <span className={`text-2xl sm:text-3xl font-black font-sans tracking-tight transition-colors ${
                  isSelected ? 'text-indigo-700' : 'text-slate-800'
                }`}>
                  {pair.num1}
                </span>

                {/* Konektor Vertikal Elegan dengan Badge Kode */}
                <div className="my-2 flex flex-col items-center">
                  <div className={`w-px h-2 transition-colors ${isSelected ? 'bg-indigo-300' : 'bg-slate-200'}`} />
                  <span className={`text-[10px] sm:text-xs font-mono font-black px-1.5 sm:px-2 py-0.5 rounded-md transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs scale-105'
                      : 'bg-slate-200/80 text-slate-600 group-hover:bg-slate-300/80'
                  }`}>
                    {pair.code}
                  </span>
                  <div className={`w-px h-2 transition-colors ${isSelected ? 'bg-indigo-300' : 'bg-slate-200'}`} />
                </div>

                {/* Baris Kedua: 9 8 7 6 5 (Lurus di bawahnya) */}
                <span className={`text-2xl sm:text-3xl font-black font-sans tracking-tight transition-colors ${
                  isSelected ? 'text-indigo-700' : 'text-slate-800'
                }`}>
                  {pair.num2}
                </span>

                {/* Garis Pemisah Halus */}
                <div className={`w-6 sm:w-8 h-px my-2 transition-colors ${isSelected ? 'bg-indigo-200' : 'bg-slate-200'}`} />

                {/* Keterangan Kata (Satu Sembilan, Dua Delapan, dst) */}
                <div className="text-center leading-tight">
                  <span className={`block text-[10px] sm:text-xs font-semibold capitalize transition-colors ${
                    isSelected ? 'text-indigo-900 font-bold' : 'text-slate-500'
                  }`}>
                    {word1}
                  </span>
                  <span className={`block text-[10px] sm:text-xs font-semibold capitalize transition-colors ${
                    isSelected ? 'text-indigo-900 font-bold' : 'text-slate-500'
                  }`}>
                    {word2}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Ringkasan Satu Kalimat Aktif yang Ringkas & Elegan */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/60 border border-indigo-150 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-2xs">
              {activePair.code}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              Angka <strong className="text-indigo-600 font-bold">{activePair.num1}</strong> pasangannya{' '}
              <strong className="text-indigo-600 font-bold">{activePair.num2}</strong>{' '}
              <span className="text-slate-500 font-normal">
                ({activePair.code} = artinya <strong>{activePair.text}</strong>)
              </span>
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-100 shadow-2xs shrink-0 hidden sm:inline-block">
            {activePair.num1} + {activePair.num2} = 10
          </span>
        </div>
      </div>

    </div>
  );
}
