/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OperationType = 'PENJUMLAHAN' | 'PENGURANGAN' | 'PERKALIAN' | 'PEMBAGIAN';

export interface GasingMaterial {
  id: string; // e.g. 'P1', 'K3', 'X12', 'B1'
  code: string;
  title: string;
  description: string;
  teachingTip: string; // Penjelasan bagaimana cara mengajarkannya sesuai metode GASING
  example: string; // Contoh konkret soal
}

export interface Question {
  id: number;
  questionText: string;
  displayFormat?: 'horizontal' | 'vertical' | 'repeated_addition' | 'repeated_subtraction' | 'repeated_add_step' | 'grid_2x2' | 'balance_scale' | 'triangle_magic' | 'crossword_puzzle' | 'tree_puzzle';
  digits?: {
    a: number;
    b: number;
    op: string;
    extraNumbers?: number[]; // For multi-number addition, coret, etc.
    explanation?: string; // Step-by-step hint
    missingPosition?: 'a' | 'b';
    targetSum?: number;
    knownNumber?: number;
    partnerNumber?: number;
    isDecomposition?: boolean;
    mnemonicCode?: string;
    mnemonicText?: string;
    gridData?: {
      cells: [number, number, number, number]; // [A, B, C, D]
      rowSums: [number, number]; // [A+B, C+D]
      colSums: [number, number]; // [A+C, B+D]
      missingIndices: [number, number]; // Indices in cells array that are blank (0, 1, 2, 3)
    };
    balanceData?: {
      leftPair: [number, number];
      rightPair: [number, number];
      choices: [number, number, number, number];
      prefilledIndices: number[]; // 0 for leftPair[0], 1 for leftPair[1], 2 for rightPair[0], 3 for rightPair[1]
    };
    triangleData?: {
      squares: [number, number, number]; // [left, right, bottom]
      circles: [number, number, number]; // [top, bottomLeft, bottomRight]
      isExample?: boolean;
      missingType?: 'circles' | 'squares';
    };
    crosswordData?: {
      grid: string[][]; // 2D array of variable names 'v1', ops '+', '=', or empty ''
      values: Record<string, number>; // value for each variable
      hidden: string[]; // array of variable names that are hidden
    };
    treeData?: {
      hA: number;
      hB: number;
      hC: number;
      hD: number;
      H: number;
      themeId: number;
      missingTargets?: Array<'A' | 'B' | 'C' | 'D' | 'H'>;
    };
  };
  answerText: string; // Calculated answer as string
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface PracticeAnswerItem {
  val: string;
  sisa?: string;
  gasingInputs?: Record<string, string>; // Maps slot key -> user entered digit(s)
  activeSlotId?: string; // Current focused slot id in this question
}

export interface WorksheetConfig {
  operation: OperationType;
  materialId: string;
  totalQuestions: 25 | 50 | 100 | 150 | 200;
  layoutColumns: 1 | 2 | 3;
  showAnswers: boolean; // Soal saja vs Soal + Kunci Jawaban
  randomLevel: 'Rendah' | 'Sedang' | 'Tinggi';
  showNumbers: boolean; // Ya vs Tidak
  multiplicationFormat?: 'mendatar' | 'bersusun';
  p11Format?: 'vertikal' | 'horizontal';
}

export type LogoPresetType = 'preset:kemenag' | 'preset:kemendikbud' | 'preset:gasing' | 'custom' | 'none';

export interface WorksheetHeaderData {
  schoolName: string;
  schoolSubtext: string;
  academicYear?: string;
  timeAllocation?: string;
  teacherName: string;
  logoType: LogoPresetType;
  customLogoUrl: string;
  instructionText: string;
  headerStyle: 'kedinasan' | 'modern';
}

export const GASING_DATABASE: Record<OperationType, GasingMaterial[]> = {
  PENJUMLAHAN: [
    {
      id: 'P1',
      code: 'P1',
      title: 'Penjumlahan 2 Bilangan yang Hasilnya 1–5',
      description: 'Latihan pengenalan awal penjumlahan dengan rentang hasil terkecil.',
      teachingTip: 'Gunakan benda konkret (seperti kelereng atau pensil). Letakkan 2 kelereng di tangan kiri dan 1 di tangan kanan, lalu gabungkan. Tekankan refleks instan tanpa menghitung jari.',
      example: '2 + 1 = 3 atau 3 + 2 = 5'
    },
    {
      id: 'P2',
      code: 'P2',
      title: 'Penjumlahan 2 Bilangan yang Hasilnya 1–9',
      description: 'Penjumlahan bilangan satu angka yang hasilnya di bawah 10.',
      teachingTip: 'Latih anak untuk mencongak penjumlahan di bawah 10 sampai lancar dan spontan. Ini fondasi terpenting sebelum masuk ke penjumlahan puluhan.',
      example: '4 + 3 = 7 atau 6 + 2 = 8'
    },
    {
      id: 'P3',
      code: 'P3',
      title: 'Pasangan 10',
      description: 'Mencari pasangan dua bilangan dasar yang jika ditambahkan menghasilkan tepat 10.',
      teachingTip: 'Sangat vital untuk penjumlahan lanjutan! Minta anak merespons dengan cepat jika ditanya: "Pasangan 7?" Anak langsung jawab "3!". Gunakan visualisasi 10 jari terlipat.',
      example: '7 + 3 = 10 atau 4 + 6 = 10'
    },
    {
      id: 'P4',
      code: 'P4',
      title: 'Penjumlahan Bilangan 10 dengan Bilangan 1 Angka',
      description: 'Penjumlahan dengan basis puluhan awal yang sangat mudah.',
      teachingTip: 'Biarkan anak menyadari polanya: angka puluhannya tetap 10, angka satuannya langsung menempati posisi nol.',
      example: '10 + 5 = 15 atau 7 + 10 = 17'
    },
    {
      id: 'P5',
      code: 'P5',
      title: 'Penjumlahan 2 Bilangan yang Hasilnya 10–20',
      description: 'Hasil penjumlahan menyeberang angka 10, menggunakan trik jembatan 10.',
      teachingTip: 'Gunakan prinsip pasangan 10. Jika 8 + 5: cari pasangan 8 yaitu 2 (diambil dari 5), sisa 3. Jadi hasil sisa ditaruh belakang, satuannya 3 dan puluhannya 1 (13).',
      example: '8 + 7 = 15 atau 9 + 4 = 13'
    },
    {
      id: 'P6',
      code: 'P6',
      title: 'Penjumlahan Bilangan 2 Angka dg 1 Angka (Satuan < 10)',
      description: 'Penjumlahan puluhan dengan satuan tanpa ada simpanan (carrying).',
      teachingTip: 'Cukup jumlahkan satuannya langsung secara mendatar. Puluhannya tetap.',
      example: '23 + 4 = 27 atau 45 + 3 = 48'
    },
    {
      id: 'P7',
      code: 'P7',
      title: 'Penjumlahan Bilangan 2 Angka dg 1 Angka (Satuan >= 10)',
      description: 'Penjumlahan puluhan dengan satuan yang menghasilkan simpanan (menyimpan 1 ke puluhan).',
      teachingTip: 'Jumlahkan puluhannya naik 1 angka, satuannya diisi dengan sisa dari jembatan 10.',
      example: '27 + 6 = 33 atau 48 + 5 = 53'
    },
    {
      id: 'P8',
      code: 'P8',
      title: 'Penjumlahan Bilangan 2 Angka dg Bilangan 2 Angka',
      description: 'Menjumlahkan dua bilangan puluhan secara mendatar.',
      teachingTip: 'Latih anak menghitung dari DEPAN! Tambahkan puluhannya terlebih dahulu, lalu tambahkan ratusan/satuannya berurutan agar refleks terbentuk cepat.',
      example: '24 + 13 = 37 atau 35 + 28 = 63'
    },
    {
      id: 'P9',
      code: 'P9',
      title: 'Penjumlahan Bersusun Bilangan 2 Angka',
      description: 'Sama seperti P8, namun disajikan dalam format bersusun ke bawah secara rapi.',
      teachingTip: 'Tulis posisi satuan di bawah satuan, puluhan di bawah puluhan. Hitung dari depan dengan teknik GASING tanpa mencoret-coret berlebih.',
      example: '  24\n+ 15\n----\n  39'
    },
    {
      id: 'P10',
      code: 'P10',
      title: 'Penjumlahan Bersusun 2 Bilangan 2 Angka atau Lebih',
      description: 'Penjumlahan bersusun dengan tingkat kesulitan bertambah (ratusan, ribuan).',
      teachingTip: 'Tetap latih anak melihat angka dari kiri ke kanan. Tanamkan konsep letak nilai tempat secara konsisten.',
      example: '  145\n+ 278\n-----\n  423'
    },
    {
      id: 'P11',
      code: 'P11',
      title: 'Penjumlahan Banyak Bilangan Satu Angka (Sistem Coret)',
      description: 'Membantu anak menjumlahkan barisan angka panjang dengan cepat tanpa beban memori.',
      teachingTip: 'Tambahkan berurutan dari atas. Jika hasil penjumlahan >= 10, coret angka tersebut, simpan satuannya di otak untuk dijumlahkan berikutnya. Hasil puluhan adalah jumlah coretan.',
      example: '3 + 8 (coret, sisa 1) + 4 (5) + 6 (coret, sisa 1) = 21 (ada 2 coretan).'
    },
    {
      id: 'P12',
      code: 'P12',
      title: 'Penjumlahan Bersusun Banyak Bilangan 2 Angka atau Lebih',
      description: 'Latihan tingkat tinggi penjumlahan bersusun banyak baris sekaligus.',
      teachingTip: 'Gunakan sistem coret untuk kolom satuan terlebih dahulu, tulis sisa satuannya, lalu bawa angka coretan ke kolom puluhannya lalu ulangi coret.',
      example: 'Berbaris vertikal dengan 3 atau 4 baris angka.'
    },
    {
      id: 'P13',
      code: 'P13',
      title: 'Persiapan Menuju Perkalian',
      description: 'Penjumlahan berulang bilangan yang sama untuk memperkenalkan konsep perkalian.',
      teachingTip: 'Kenalkan anak bahwa penjumlahan angka berulang adalah operasi perkalian dasar.',
      example: '2 + 2 + 2 + 2 = 8 (artinya ada 4 angka dua: 4 x 2)'
    },
    {
      id: 'P14',
      code: 'P14',
      title: 'Teka-Teki Grid Penjumlahan 2x2',
      description: 'Penjumlahan kotak 2x2. Isilah kotak kosong sehingga penjumlahan mendatar dan menurun bernilai tepat.',
      teachingTip: 'Gunakan kemampuan penjumlahan dan pengurangan untuk mencari nilai yang hilang di dalam grid.',
      example: 'Grid 2x2 Penjumlahan'
    },
    {
      id: 'P15',
      code: 'P15',
      title: 'Timbangan Penjumlahan',
      description: 'Penjumlahan bilangan yang hasilnya 10 sampai 20. Masukkan angka yang tepat, agar jumlah bilangan kanan dan kiri sama.',
      teachingTip: 'Bimbing siswa untuk mencari dua pasang angka yang menghasilkan jumlah yang sama pada kedua sisi timbangan.',
      example: 'Timbangan Penjumlahan'
    },
    {
      id: 'P16',
      code: 'P16',
      title: 'Segitiga Ajaib Penjumlahan',
      description: 'Penjumlahan dalam bentuk segitiga. Jumlahkan angka pada kotak untuk menemukan angka pada lingkaran.',
      teachingTip: 'Bimbing siswa menjumlahkan dua kotak pada satu sisi untuk menentukan nilai pada lingkaran yang menghubungkannya.',
      example: 'Segitiga Penjumlahan'
    },
    {
      id: 'P17',
      code: 'P17',
      title: 'Teka-Teki Silang Penjumlahan',
      description: 'Lengkapi angka yang hilang pada teka-teki silang penjumlahan.',
      teachingTip: 'Bimbing siswa menyelesaikan persamaan yang memiliki informasi paling lengkap terlebih dahulu.',
      example: 'Teka-Teki Silang'
    },
    {
      id: 'P18',
      code: 'P18',
      title: 'Teka-Teki Pohon (Visual Logika)',
      description: 'Mencari nilai penjumlahan dari logika gambar pepohonan dan tebing.',
      teachingTip: 'Bimbing anak memahami letak tebing yang menyebabkan perbedaan tinggi dasar (alas) pada pohon.',
      example: 'Visual Pohon C = Pohon D - Tebing'
    },
    {
      id: 'P19',
      code: 'P19',
      title: 'Penjumlahan Bilangan Lebih dari 2 Angka (Mendatar)',
      description: 'Penjumlahan mendatar kombinasi bilangan ratusan, ribuan dengan puluhan, ratusan, atau ribuan.',
      teachingTip: 'Latih anak menggunakan teknik GASING menjumlahkan dari depan (nilai tempat terbesar terlebih dahulu) secara langsung dan mengingat penyesuaian dari hasil di belakangnya.',
      example: '345 + 367 = 712'
    }
  ],
  PENGURANGAN: [
    {
      id: 'K1',
      code: 'K1',
      title: 'Pengurangan Kurang dari 5',
      description: 'Pengurangan bilangan dasar menggunakan benda nyata dengan prinsip AMBIL ➔ TINGGAL.',
      teachingTip: 'Minta anak mengamati sejumlah benda nyata awal kelompok kecil (kurang dari 5), mengambil sebagian, lalu melihat berapa yang tinggal/sisa.',
      example: '5 - 1 = 4 (Ada 5 lidi, diambil 1, tinggal 4 lidi)'
    },
    {
      id: 'K2',
      code: 'K2',
      title: 'Pengurangan Kurang dari 10',
      description: 'Pengurangan bilangan dasar dari angka di bawah atau sama dengan 10 dengan rincian AMBIL ➔ TINGGAL.',
      teachingTip: 'Latih anak secara bertahap menggunakan batang/benda konkret yang ditaruh, kemudian diambil sebagian, lalu menyimpulkan sisa yang tinggal di tempat.',
      example: '9 - 1 = 8 (Ada 9 lidi, diambil 1, tinggal 8 lidi)'
    },
    {
      id: 'K3',
      code: 'K3',
      title: 'Pengurangan Bilangan Kurang dari 20 Tanpa Menukar',
      description: 'Pengurangan dari puluhan belasan dengan satuan tanpa perlu meminjam.',
      teachingTip: 'Kurangkan saja angka satuannya, angka puluhannya (1) tetap utuh.',
      example: '17 - 4 = 13 atau 19 - 6 = 13'
    },
    {
      id: 'K4',
      code: 'K4',
      title: 'Pengurangan dari Bilangan 10',
      description: 'Membangun refleks otomatis Pasangan 10 tanpa menghitung mundur atau memakai jari.',
      teachingTip: 'Tanyakan Pasangan dari angka pengurang. Pasangan 6 adalah 4, maka 10 - 6 = 4. Siswa cukup mengenali rantai Pasangan 10.',
      example: '10 - 6 = 4 atau 10 - 8 = 2'
    },
    {
      id: 'K5',
      code: 'K5',
      title: 'Pengurangan Belasan dengan Menukar',
      description: 'Pengurangan bilangan 11-19 dengan bilangan 1 angka yang membutuhkan penukaran.',
      teachingTip: 'Gunakan trik GASING: Untuk 13 - 7, lihat angka satuan 3 dan kurangi 7. Caranya, cari pasangan 7 yaitu 3. Jumlahkan satuan awal 3 dengan pasangan tersebut (3 + 3 = 6). Selesai!',
      example: '13 - 7 = 6 atau 15 - 8 = 7'
    },
    {
      id: 'K6',
      code: 'K6',
      title: 'Pengurangan Dua/Tiga Angka Mendatar',
      description: 'Pengurangan bilangan puluhan/ratusan mendatar secara taktis.',
      teachingTip: 'Latih kurangkan puluhan dengan puluhan mendatar, lalu kurangi satuannya dari tempat terbesar.',
      example: '54 - 23 = 31 atau 76 - 48 = 28'
    },
    {
      id: 'K7',
      code: 'K7',
      title: 'Pengurangan Tiga Angka Bersusun',
      description: 'Pengurangan bersusun ratusan lengkap dengan peminjaman.',
      teachingTip: 'Format bersusun vertikal agar melatih ketepatan menyejajarkan tempat nilai angka.',
      example: '  345\n- 128\n-----\n  217'
    },
    {
      id: 'K8',
      code: 'K8',
      title: 'Pengurangan Empat Angka atau Lebih',
      description: 'Pengurangan skala besar ribuan atau lebih secara rapi.',
      teachingTip: 'Tetap gunakan konsep melirik dari depan untuk ketepatan mencongak.',
      example: '3250 - 1420 = 1830'
    }
  ],
  PERKALIAN: [
    {
      id: 'X0',
      code: 'X0',
      title: 'Konsep Perkalian',
      description: 'Memahami arti perkalian sebagai kelompok yang sama banyak menggunakan Notasi Gasing asli.',
      teachingTip: 'Angka kiri = jumlah kelompok, simbol kotak (□) = kelompok, angka kanan bawah = isi tiap kelompok. Tekankan perbedaan proses 2□₃ vs 3□₂.',
      example: '2□₃ = 3 + 3 = 6'
    },
    {
      id: 'X1',
      code: 'X1',
      title: 'Perkalian 1',
      description: 'Memahami perkalian bilangan dengan angka 1 menghasilkan bilangan itu sendiri.',
      teachingTip: 'Bantu siswa memahami sifat identitas perkalian melalui lidi konkret: 4 x 1 = 4 lidi karena ada 4 wadah yang masing-masing berisi 1.',
      example: '4 × 1 = 4'
    },
    {
      id: 'X2',
      code: 'X2',
      title: 'Perkalian 10',
      description: 'Perkalian cepat dengan angka 10.',
      teachingTip: 'Cukup tambahkan angka nol di belakang bilangan yang dikalikan.',
      example: '7 x 10 = 70 atau 10 x 4 = 40'
    },
    {
      id: 'X3',
      code: 'X3',
      title: 'Perkalian 2',
      description: 'Konsep penjumlahan ganda (melipatgandakan bilangan).',
      teachingTip: 'Kalikan 2 berarti menjumlahkan bilangan tersebut dengan dirinya sendiri secara instan.',
      example: '6 x 2 = 6 + 6 = 12'
    },
    {
      id: 'X4',
      code: 'X4',
      title: 'Perkalian 9',
      description: 'Perkalian dengan angka 9 menggunakan trik unik jari tangan atau pengurangan dasar.',
      teachingTip: 'Gunakan trik jembatan 10: Hasil perkalian puluhan selalu kurang 1 dari pengali, satuannya adalah pasangan 10 dari pengali tersebut. Contoh: 9 x 4 -> puluhannya 3 (4-1), satuannya 6 (pasangan 4). Hasilnya 36!',
      example: '9 x 7 = 63 atau 9 x 8 = 72'
    },
    {
      id: 'X5',
      code: 'X5',
      title: 'Perkalian 5',
      description: 'Perkalian 5 berpola akhiran genap (berakhir 0) dan ganjil (berakhir 5).',
      teachingTip: 'Jika ganjil diakhiri angka 5, genap diakhiri angka 0. Gunakan separuh nilai dikalikan 10.',
      example: '4 x 5 = 20 atau 7 x 5 = 35'
    },
    {
      id: 'X6',
      code: 'X6',
      title: 'Perkalian 5 Khusus',
      description: 'Khusus memperlancar drill angka sulit perkalian 5: 6x5, 7x5, dan 8x5.',
      teachingTip: 'Fokuskan ingatan anak pada 3 fakta ini secara berulang agar tidak ragu-ragu.',
      example: '6 x 5 = 30, 7 x 5 = 35, 8 x 5 = 40'
    },
    {
      id: 'X7',
      code: 'X7',
      title: 'Perkalian Bilangan yang Sama (1–9)',
      description: 'Perkalian dua bilangan yang sama untuk angka di bawah 10 (1 × 1 sampai 9 × 9).',
      teachingTip: 'Latih anak menghafal dan menguasai perkalian bilangan kembar dari 1 × 1 hingga 9 × 9 sebagai pondasi penting.',
      example: '7 × 7 = 49 atau 6 × 6 = 36'
    },
    {
      id: 'X8',
      code: 'X8',
      title: 'Perkalian 3 dan 4',
      description: 'Fakta perkalian angka 3 dan 4 sebagai tangga perantara.',
      teachingTip: 'Gunakan penjumlahan berulang yang cepat atau konsep kelipatan bilangan.',
      example: '3 x 6 = 18 atau 4 x 7 = 28'
    },
    {
      id: 'X9',
      code: 'X9',
      title: 'Pengulangan Perkalian 2–5',
      description: 'Kombinasi soal latihan acak perkalian dasar antara angka 2 hingga 5.',
      teachingTip: 'Drill acak sangat membantu mengunci refleks dari tingkat sebelumnya.',
      example: '3 x 4, 5 x 2, 4 x 4, dll.'
    },
    {
      id: 'X10',
      code: 'X10',
      title: 'Perkalian Angka Sulit: 6, 7, dan 8',
      description: 'Fokus pada perkalian antara bilangan besar satu angka.',
      teachingTip: 'Latih dengan teknik perkalian jari di atas 5 atau pengulangan refleks yang rutin.',
      example: '6 x 7 = 42 atau 8 x 8 = 64'
    },
    {
      id: 'X11',
      code: 'X11',
      title: 'Pengulangan Perkalian Lengkap 1–10',
      description: 'Drill komprehensif seluruh tabel perkalian dasar satu digit.',
      teachingTip: 'Latihan menyeluruh ini harus bisa dikerjakan anak di bawah waktu 2 detik per soal guna mengasah reflex mencongak.',
      example: '8 x 9 = 72 atau 6 x 3 = 18'
    },
    {
      id: 'X12',
      code: 'X12',
      title: 'Perkalian 2 Angka dg 1 Angka Tkt 1 (Tanpa Simpan)',
      description: 'Perkalian puluhan belasan dengan satu angka tanpa ada angka carry.',
      teachingTip: 'Bimbing anak menghitung dari DEPAN! Kalikan puluhannya dulu baru kalikan satuannya mendatar langsung.',
      example: '12 x 3 = 36 (10x3=30, 2x3=6 -> 36)'
    },
    {
      id: 'X13',
      code: 'X13',
      title: 'Perkalian 2 Angka dg 1 Angka Tkt 2 (Dengan Simpan)',
      description: 'Perkalian puluhan dengan satu angka yang melibatkan penyimpanan angka puluhan.',
      teachingTip: 'Gunakan teknik GASING dari depan: kalikan puluhannya, tambahkan hasil simpanan dari satuannya, lalu tulis satuannya.',
      example: '24 x 6 -> puluhannya 2x6=12, satuannya 4x6=24. Tulis 14 (12+2) dan belakangnya 4 -> 144'
    },
    {
      id: 'X14',
      code: 'X14',
      title: 'Perkalian 2 Angka dg 2 Angka Tkt 1 (Tanpa Simpan)',
      description: 'Perkalian dua angka dengan metode bintang GASING tanpa menyimpan angka.',
      teachingTip: 'Metode Bintang/Stitch: Kiri x Kiri, Silang Tengah (Kiri x Kanan + Kanan x Kiri), Kanan x Kanan.',
      example: '12 x 13 -> 1x1=1, (1x3 + 2x1)=5, 2x3=6 -> Hasil: 156'
    },
    {
      id: 'X15',
      code: 'X15',
      title: 'Perkalian 2 Angka dg 2 Angka Tkt 2 (Simpan Sedikit)',
      description: 'Perkalian dua angka menggunakan metode bintang dengan satu atau dua penyimpanan ringan.',
      teachingTip: 'Lakukan perkalian silang biasa, jika ada hasil belasan, simpan 1 angka ke depannya secara cepat.',
      example: '23 x 14 = 322'
    },
    {
      id: 'X16',
      code: 'X16',
      title: 'Perkalian 2 Angka dg 2 Angka Tkt 3 (Umum)',
      description: 'Perkalian 2-digit acak dengan metode bintang GASING secara utuh.',
      teachingTip: 'Terus biasakan metode melirik dari kiri-tengah-kanan guna mengasah kalkulasi mental.',
      example: '43 x 27 = 1161'
    },
    {
      id: 'X17',
      code: 'X17',
      title: 'Perkalian Khusus Bilangan Dekat 100',
      description: 'Trik GASING kecepatan tinggi untuk perkalian angka bernilai tinggi mendekati 100.',
      teachingTip: 'Trik Komplemen: Untuk 95 x 96, cari selisih ke 100 (95 adalah -5, 96 adalah -4). Dua digit depan: 95-4 = 91. Dua digit belakang: (-5) x (-4) = 20. Hasilnya: 9120!',
      example: '98 x 97 = 9506'
    },
    {
      id: 'X18',
      code: 'X18',
      title: 'Perkalian Khusus Bilangan Dekat 50',
      description: 'Trik GASING khusus perkalian angka sekitar 50 dengan cara mengalikan dan membagi dua basisnya.',
      teachingTip: 'Gunakan metode selisih basis 50 lalu bagi dua untuk nilai puluhannya.',
      example: '52 x 54 = 2808'
    },
    {
      id: 'X19',
      code: 'X19',
      title: 'Perkalian Bilangan Berakhiran Nol',
      description: 'Perkalian cepat kelipatan puluhan berakhiran nol.',
      teachingTip: 'Kalikan angka depannya, lalu kumpulkan semua no l penampung di bagian akhir.',
      example: '30 x 40 = 1200 atau 150 x 20 = 3000'
    },
    {
      id: 'X20',
      code: 'X20',
      title: 'Perkalian 3 Angka dg 1 Angka',
      description: 'Perkalian ratusan dengan satuan dikerjakan mendatar secara terstruktur.',
      teachingTip: 'Tetap kalikan dari depan: ratusan, puluhan, lalu satuan.',
      example: '124 x 3 = 372'
    },
    {
      id: 'X21',
      code: 'X21',
      title: 'Perkalian 3 Angka dg 2 Angka',
      description: 'Perkalian tingkat menengah ratusan dengan puluhan.',
      teachingTip: 'Gunakan perluasan metode bintang 3 angka secara berurutan.',
      example: '123 x 12 = 1476'
    },
    {
      id: 'X22',
      code: 'X22',
      title: 'Perkalian 3 Angka dg 3 Angka',
      description: 'Perkalian tingkat tinggi ratusan dengan ratusan.',
      teachingTip: 'Struktur perkalian bintang terpanjang: 5 langkah melirik mendatar.',
      example: '123 x 321 = 39483'
    }
  ],
  PEMBAGIAN: [
    {
      id: 'B1',
      code: 'B1',
      title: 'Persiapan Pembagian',
      description: 'Membangun refleks hubungan perkalian dan pembagian menggunakan faktor yang hilang.',
      teachingTip: 'Tanyakan "8 kali berapa sama dengan 24?" untuk menuntun anak ke "24 dibagi 8 sama dengan 3".',
      example: '8 × □ = 24'
    },
    {
      id: 'B2',
      code: 'B2',
      title: 'Drill Pembagian Dasar',
      description: 'Membentuk refleks pembagian dasar habis dibagi tanpa sisa.',
      teachingTip: 'Seluruh soal habis dibagi. Hubungkan dengan fakta perkalian dasar.',
      example: '12 ÷ 3 = 4'
    },
    {
      id: 'B3',
      code: 'B3',
      title: 'Drill Pembagian Lanjutan',
      description: 'Memperluas pembagian dasar ke nilai tempat puluhan atau ratusan.',
      teachingTip: 'Gunakan hubungan nilai tempat tanpa pembagian bersusun. Contoh: 24 ÷ 8 = 3 maka 240 ÷ 8 = 30.',
      example: '240 ÷ 8 = 30'
    },
    {
      id: 'B4',
      code: 'B4',
      title: 'Pembagian dengan Sisa (Dasar)',
      description: 'Mengenalkan konsep sisa menggunakan kelipatan terdekat di bawah angka utama.',
      teachingTip: 'Cari kelipatan pembagi terdekat di bawah angka yang dibagi, lalu hitung selisihnya sebagai sisa.',
      example: '13 ÷ 3 = 4 sisa 1'
    },
    {
      id: 'B5',
      code: 'B5',
      title: 'Pembagian Bersisa dengan Bilangan 1 Angka',
      description: 'Mengembangkan konsep sisa ke bilangan puluhan/ratusan dengan membagi dari depan.',
      teachingTip: 'Lakukan pembagian dari depan secara bertahap dan bawa sisa angka ke nilai tempat berikutnya.',
      example: '73 ÷ 4 = 18 sisa 1'
    },
    {
      id: 'B6',
      code: 'B6',
      title: 'Pembagian dengan Bilangan Dua Angka',
      description: 'Tahap akhir pembagian Gasing menggunakan pasangan perkalian dan nilai tempat.',
      teachingTip: 'Gunakan pasangan perkalian atau estimasi untuk pembagi dua angka.',
      example: '156 ÷ 13 = 12'
    }
  ]
};
