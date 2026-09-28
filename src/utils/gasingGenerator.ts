/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, WorksheetConfig } from '../types';

// Helper: Convert number to subscript
export function toSubscript(num: number | string): string {
  const mapping: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  return num.toString().split('').map(char => mapping[char] || char).join('');
}

// Helper: Shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper: Get random integer in range [min, max] inclusive
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Generate unique/sequential options or pad with random copies if list is too small
function generateFittedList<T>(
  uniqueList: T[],
  totalNeeded: number,
  randomLevel: 'Rendah' | 'Sedang' | 'Tinggi'
): T[] {
  let result: T[] = [];
  
  if (uniqueList.length === 0) return [];

  if (randomLevel === 'Rendah') {
    // Keep sequential as much as possible, repeating in blocks
    result = [...uniqueList];
    while (result.length < totalNeeded) {
      result = [...result, ...shuffleArray(uniqueList)];
    }
    result = result.slice(0, totalNeeded);
  } else if (randomLevel === 'Sedang') {
    // Mix blocks but keep half of it localized
    const half = Math.floor(totalNeeded / 2);
    let block1: T[] = [...uniqueList];
    while (block1.length < half) {
      block1 = [...block1, ...shuffleArray(uniqueList)];
    }
    block1 = block1.slice(0, half);
    
    let block2: T[] = [];
    while (block2.length < (totalNeeded - half)) {
      block2 = [...block2, ...shuffleArray(uniqueList)];
    }
    block2 = block2.slice(0, totalNeeded - half);

    result = [...block1, ...block2];
  } else {
    // High randomness: fully shuffled repetitions
    while (result.length < totalNeeded) {
      result = [...result, ...shuffleArray(uniqueList)];
    }
    result = shuffleArray(result).slice(0, totalNeeded);
  }

  return result;
}

/**
 * Main Generator function based on Operation and Material ID
 */
export function generateGasingWorksheet(config: WorksheetConfig): Question[] {
  const { operation, materialId, totalQuestions, randomLevel } = config;
  let questions: Question[] = [];

  switch (operation) {
    case 'PENJUMLAHAN':
      questions = generatePenjumlahan(materialId, totalQuestions, randomLevel, config.p11Format);
      break;
    case 'PENGURANGAN':
      questions = generatePengurangan(materialId, totalQuestions, randomLevel);
      break;
    case 'PERKALIAN':
      questions = generatePerkalian(materialId, totalQuestions, randomLevel, config.multiplicationFormat);
      break;
    case 'PEMBAGIAN':
      questions = generatePembagian(materialId, totalQuestions, randomLevel);
      break;
  }

  // Double check that we have exactly the count wanted and correct IDs
  return questions.slice(0, totalQuestions).map((q, idx) => ({
    ...q,
    id: idx + 1
  }));
}

// ==========================================
// PENJUMLAHAN GENERATORS
// ==========================================
function generatePenjumlahan(
  materialId: string,
  total: number,
  rLevel: 'Rendah' | 'Sedang' | 'Tinggi',
  p11Format?: 'vertikal' | 'horizontal'
): Question[] {
  const list: Omit<Question, 'id'>[] = [];

  if (materialId === 'P1') {
    // Penjumlahan 2 Bilangan, hasil 1-5 (a+b <= 5)
    const unique: any[] = [];
    for (let a = 1; a < 5; a++) {
      for (let b = 1; b < 5; b++) {
        if (a + b <= 5) {
          unique.push({ a, b });
        }
      }
    }
    // Pre-shuffle then sort (stable sort keeps same difficulty items randomly order-mixed)
    const shuffledUnique = shuffleArray(unique);
    shuffledUnique.sort((x, y) => (x.a + x.b) - (y.a + y.b));
    const fitted = generateFittedList(shuffledUnique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} + ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '+' },
        answerText: (item.a + item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'P2') {
    // Penjumlahan 2 Bilangan, hasil 6-9 (a+b in [6..9])
    const unique6 = [
      { a: 1, b: 5 }, { a: 2, b: 4 }, { a: 3, b: 3 }, { a: 4, b: 2 }, { a: 5, b: 1 }
    ];
    const unique7 = [
      { a: 1, b: 6 }, { a: 2, b: 5 }, { a: 3, b: 4 }, { a: 4, b: 3 }, { a: 5, b: 2 }, { a: 6, b: 1 }
    ];
    const unique8 = [
      { a: 1, b: 7 }, { a: 2, b: 6 }, { a: 3, b: 5 }, { a: 4, b: 4 }, { a: 5, b: 3 }, { a: 6, b: 2 }, { a: 7, b: 1 }
    ];
    const unique9 = [
      { a: 1, b: 8 }, { a: 2, b: 7 }, { a: 3, b: 6 }, { a: 4, b: 5 }, { a: 5, b: 4 }, { a: 6, b: 3 }, { a: 7, b: 2 }, { a: 8, b: 1 }
    ];

    const count6 = Math.floor(total * 6 / 25);
    const count7 = Math.floor(total * 6 / 25);
    const count8 = Math.floor(total * 6 / 25);
    const count9 = total - (count6 + count7 + count8);

    const fitted6 = generateFittedList(unique6, count6, rLevel);
    const fitted7 = generateFittedList(unique7, count7, rLevel);
    const fitted8 = generateFittedList(unique8, count8, rLevel);
    const fitted9 = generateFittedList(unique9, count9, rLevel);

    const combined = [...fitted6, ...fitted7, ...fitted8, ...fitted9];
    const shuffled = shuffleArray(combined);

    shuffled.forEach(item => {
      list.push({
        questionText: `${item.a} + ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '+' },
        answerText: (item.a + item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'P3') {
    // Pasangan 10: Melatih refleks anak memasangkan bilangan yang jumlahnya 10
    // Mnemonik GASING: SS (Satu-Sembilan), DD (Dua-Delapan), TT (Tiga-Tujuh), EE (Empat-Enam), LL (Lima-Lima)
    const MNEMONICS_10: Record<number, { code: string; text: string }> = {
      1: { code: 'SS', text: 'Satu Sembilan' },
      2: { code: 'DD', text: 'Dua Delapan' },
      3: { code: 'TT', text: 'Tiga Tujuh' },
      4: { code: 'EE', text: 'Empat Enam' },
      5: { code: 'LL', text: 'Lima Lima' },
      6: { code: 'EE', text: 'Enam Empat' },
      7: { code: 'TT', text: 'Tujuh Tiga' },
      8: { code: 'DD', text: 'Delapan Dua' },
      9: { code: 'SS', text: 'Sembilan Satu' },
    };

    interface P3Item {
      known: number;
      partner: number;
      missingPosition: 'a' | 'b';
      isDecomposition: boolean;
    }

    const unique: P3Item[] = [];

    if (rLevel === 'Rendah') {
      // Tingkat Rendah: Format konsisten "a + ... = 10", pasangan 1-9 teratur berurutan
      // Membantu anak menghafal dan menstabilkan rantai pasangan 10 dengan tenang
      for (let k = 1; k <= 9; k++) {
        unique.push({
          known: k,
          partner: 10 - k,
          missingPosition: 'b',
          isDecomposition: false,
        });
      }
    } else if (rLevel === 'Sedang') {
      // Tingkat Sedang: Variasi komutatif dua arah (mencari pasangan di kanan "a + ... = 10" dan di kiri "... + b = 10")
      for (let k = 1; k <= 9; k++) {
        unique.push({
          known: k,
          partner: 10 - k,
          missingPosition: 'b',
          isDecomposition: false,
        });
        unique.push({
          known: k,
          partner: 10 - k,
          missingPosition: 'a',
          isDecomposition: false,
        });
      }
    } else {
      // Tingkat Tinggi: Variasi penuh termasuk bentuk dekomposisi "10 = a + ..." dan "10 = ... + b"
      for (let k = 1; k <= 9; k++) {
        unique.push({
          known: k,
          partner: 10 - k,
          missingPosition: 'b',
          isDecomposition: false,
        });
        unique.push({
          known: k,
          partner: 10 - k,
          missingPosition: 'a',
          isDecomposition: false,
        });
        unique.push({
          known: k,
          partner: 10 - k,
          missingPosition: 'b',
          isDecomposition: true,
        });
        unique.push({
          known: k,
          partner: 10 - k,
          missingPosition: 'a',
          isDecomposition: true,
        });
      }
    }

    const fitted = generateFittedList(unique, total, rLevel);

    fitted.forEach(item => {
      const { known, partner, missingPosition, isDecomposition } = item;
      const m = MNEMONICS_10[known] || { code: '10', text: 'Pasangan 10' };

      let qText = '';
      if (isDecomposition) {
        qText = missingPosition === 'a'
          ? `10 = ... + ${known}`
          : `10 = ${known} + ...`;
      } else {
        qText = missingPosition === 'a'
          ? `... + ${known} = 10`
          : `${known} + ... = 10`;
      }

      list.push({
        questionText: qText,
        displayFormat: 'horizontal',
        digits: {
          a: missingPosition === 'a' ? partner : known,
          b: missingPosition === 'b' ? partner : known,
          op: '+',
          missingPosition,
          targetSum: 10,
          knownNumber: known,
          partnerNumber: partner,
          isDecomposition,
          mnemonicCode: m.code,
          mnemonicText: m.text,
        },
        answerText: String(partner)
      });
    });
  } 
  
  else if (materialId === 'P4') {
    // Penjumlahan 10 dengan bilangan 1 angka (10 + c)
    const unique: any[] = [];
    for (let c = 1; c <= 9; c++) {
      unique.push({ a: 10, b: c });
    }
    unique.sort((x, y) => x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} + ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '+' },
        answerText: (item.a + item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'P5') {
    // Penjumlahan 2 Bilangan, hasil 10-20. Tipe Gasing: 1-digit + 1-digit dengan trik jembatan 10.
    // Latihan Pasangan 10: 20% Hasil = 10 (pemanasan), 80% Hasil = 11-19 (utama).
    const targetSums = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const weights = [0.20, 0.12, 0.12, 0.12, 0.12, 0.08, 0.08, 0.08, 0.04, 0.04];

    let counts = targetSums.map((_, idx) => Math.floor(total * weights[idx]));
    let currentTotal = counts.reduce((sum, c) => sum + c, 0);

    while (currentTotal < total) {
      let bestIdx = -1;
      let maxFraction = -1;
      for (let i = 0; i < targetSums.length; i++) {
        const fraction = (total * weights[i]) - counts[i];
        if (fraction > maxFraction) {
          maxFraction = fraction;
          bestIdx = i;
        }
      }
      if (bestIdx !== -1) {
        counts[bestIdx]++;
      } else {
        counts[1]++; // prefer 11
      }
      currentTotal = counts.reduce((sum, c) => sum + c, 0);
    }

    const getPairsForSum = (s: number): { a: number, b: number }[] => {
      const pairs: { a: number, b: number }[] = [];
      const maxVal = s >= 19 ? 10 : 9;
      for (let a = 1; a <= maxVal; a++) {
        for (let b = 1; b <= maxVal; b++) {
          if (a + b === s) {
            pairs.push({ a, b });
          }
        }
      }
      return pairs;
    };

    let combinedItems: { a: number, b: number }[] = [];
    for (let i = 0; i < targetSums.length; i++) {
      const sum = targetSums[i];
      const count = counts[i];
      if (count > 0) {
        const pairs = getPairsForSum(sum);
        const fittedPairs = generateFittedList(pairs, count, rLevel);
        combinedItems = [...combinedItems, ...fittedPairs];
      }
    }

    // Shuffle the combined items so students cannot guess the pattern
    const finalItems = shuffleArray(combinedItems);

    finalItems.forEach(item => {
      list.push({
        questionText: `${item.a} + ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '+' },
        answerText: (item.a + item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'P6') {
    // 2 Angka + 1 Angka (hasil satuan < 10, No Carry)
    // 1. Tentukan target distribusi untuk bilangan kedua (b) dari 1 s.d 9:
    // b=1: 10%, b=2: 15%, b=3: 15%, b=4: 15%, b=5: 15%, b=6: 10%, b=7: 10%, b=8: 5%, b=9: 5%
    const bPercentages = [0.10, 0.15, 0.15, 0.15, 0.15, 0.10, 0.10, 0.05, 0.05];
    let bCounts = bPercentages.map(p => Math.floor(total * p));
    let sumB = bCounts.reduce((s, c) => s + c, 0);
    
    // Distribusikan sisa (remainders) agar total pas sesuai jumlah soal yang diminta
    while (sumB < total) {
      let bestIdx = -1;
      let maxFraction = -1;
      for (let i = 0; i < 9; i++) {
        const fraction = (total * bPercentages[i]) - bCounts[i];
        if (fraction > maxFraction) {
          maxFraction = fraction;
          bestIdx = i;
        }
      }
      if (bestIdx !== -1) {
        bCounts[bestIdx]++;
      } else {
        bCounts[1]++; // Fallback ke b=2 (index 1)
      }
      sumB = bCounts.reduce((s, c) => s + c, 0);
    }

    // 2. Tentukan target porsi Belasan (20%) dan Puluhan Lain (80%)
    const belasanCount = Math.floor(total * 0.20);
    const puluhanLainCount = total - belasanCount;

    // Distribusikan belasanCount dan puluhanLainCount di seluruh kategori b
    const belasanTargetCounts = bCounts.map(count => Math.floor(count * 0.20));
    const puluhanLainTargetCounts = bCounts.map((count, i) => count - belasanTargetCounts[i]);

    let currentBelasanSum = belasanTargetCounts.reduce((s, c) => s + c, 0);
    let idx = 0;
    while (currentBelasanSum < belasanCount) {
      if (puluhanLainTargetCounts[idx] > 0) {
        belasanTargetCounts[idx]++;
        puluhanLainTargetCounts[idx]--;
        currentBelasanSum++;
      }
      idx = (idx + 1) % 9;
    }

    // 3. Generate pasangan soal (a, b) berdasarkan target distribusi tersebut
    const finalItems: { a: number, b: number }[] = [];

    for (let bIndex = 0; bIndex < 9; bIndex++) {
      const b = bIndex + 1; // b bernilai 1 s.d 9
      const countBel = belasanTargetCounts[bIndex];
      const countPul = puluhanLainTargetCounts[bIndex];

      // Kriteria satuan dari a:
      // - (a % 10) + b < 10
      // - Hindari penjumlahan dengan 0 untuk b <= 8 (mencegah bentuk X0 + b)
      // - Untuk b = 9, mau tidak mau satuan a harus 0 (karena 0 + 9 < 10)
      let validSats: number[] = [];
      if (b === 9) {
        validSats = [0];
      } else {
        for (let s = 1; s <= 9 - b; s++) {
          validSats.push(s);
        }
      }

      // Generate Belasan (tens = 1)
      if (countBel > 0 && validSats.length > 0) {
        for (let k = 0; k < countBel; k++) {
          const sat = validSats[k % validSats.length];
          finalItems.push({ a: 10 + sat, b });
        }
      }

      // Generate Puluhan Lain (tens = 2 s.d 9)
      if (countPul > 0 && validSats.length > 0) {
        // Buat semua kombinasi tens (2 s.d 9) dan sat yang valid
        const possiblePairs: { t: number, sat: number }[] = [];
        for (const sat of validSats) {
          for (let t = 2; t <= 9; t++) {
            possiblePairs.push({ t, sat });
          }
        }
        // Acak kombinasi agar tens (puluhannya) bervariasi secara merata
        const shuffledPairs = shuffleArray(possiblePairs);
        for (let k = 0; k < countPul; k++) {
          const pair = shuffledPairs[k % shuffledPairs.length];
          finalItems.push({ a: pair.t * 10 + pair.sat, b });
        }
      }
    }

    // 4. Acak urutan seluruh soal agar siswa tidak bisa menebak polanya
    const shuffledFinalItems = shuffleArray(finalItems);

    shuffledFinalItems.forEach(item => {
      list.push({
        questionText: `${item.a} + ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '+' },
        answerText: (item.a + item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'P7') {
    // 2 Angka + 1 Angka (hasil satuan >= 10, carrying)
    const unique: any[] = [];
    for (let a = 10; a <= 98; a++) {
      const sat = a % 10;
      for (let b = 1; b <= 9; b++) {
        if (sat + b >= 10) {
          unique.push({ a, b });
        }
      }
    }
    unique.sort((x, y) => x.a - y.a || x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} + ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '+' },
        answerText: (item.a + item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'P8') {
    // 2 Angka + 2 Angka (Mendatar)
    const unique: any[] = [];
    // Gasing usually splits these into: no carry first, then with carry
    for (let a = 11; a <= 89; a++) {
      for (let b = 11; b <= 99 - a; b++) {
        const carries = (a % 10) + (b % 10) >= 10;
        unique.push({ a, b, carries });
      }
    }
    // Sort no carry first if Low randomness, otherwise mix
    unique.sort((x, y) => {
      if (x.carries !== y.carries) {
        return x.carries ? 1 : -1; // No carry first
      }
      return (x.a + x.b) - (y.a + y.b);
    });

    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} + ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '+' },
        answerText: (item.a + item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'P9') {
    // Penjumlahan Bersusun Bilangan 2 Angka (format vertical)
    const unique: any[] = [];
    for (let a = 11; a <= 89; a++) {
      for (let b = 11; b <= 99 - a; b++) {
        unique.push({ a, b });
      }
    }
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a}\n${item.b}`,
        displayFormat: 'vertical',
        digits: { a: item.a, b: item.b, op: '+' },
        answerText: (item.a + item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'P10') {
    // Penjumlahan bersusun 2 Bilangan 2 Angka ke atas (Dasar, Menengah, Lanjut, Mahir)
    const unique: any[] = [];
    if (rLevel === 'Rendah') {
      // Level Dasar: 2 angka + 2 angka
      for (let i = 0; i < total * 2; i++) {
        const a = getRandomInt(10, 99);
        const b = getRandomInt(10, 99);
        unique.push({ a, b });
      }
    } else if (rLevel === 'Sedang') {
      // Level Menengah: 3 angka + 3 angka
      for (let i = 0; i < total * 2; i++) {
        const a = getRandomInt(100, 999);
        const b = getRandomInt(100, 999);
        unique.push({ a, b });
      }
    } else {
      // Level Lanjut & Mahir: 4 angka + 4 angka & banyak digit (5 angka)
      for (let i = 0; i < total * 2; i++) {
        const carriesDigitCount = i % 2 === 0 ? 5 : 4;
        const a = carriesDigitCount === 5 ? getRandomInt(10000, 99999) : getRandomInt(1000, 9999);
        const b = carriesDigitCount === 5 ? getRandomInt(10000, 99999) : getRandomInt(1000, 9999);
        unique.push({ a, b });
      }
    }
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a}\n${item.b}`,
        displayFormat: 'vertical',
        digits: { a: item.a, b: item.b, op: '+' },
        answerText: (item.a + item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'P11') {
    // Penjumlahan Banyak Bilangan Satu Angka - Sistem Coret
    // Needs 4 to 6 numbers
    const format = p11Format || 'vertikal';
    for (let i = 0; i < total; i++) {
      const length = getRandomInt(4, 6);
      const nums: number[] = [];
      for (let j = 0; j < length; j++) {
        nums.push(getRandomInt(1, 9));
      }
      const sum = nums.reduce((s, n) => s + n, 0);
      if (format === 'vertikal') {
        list.push({
          questionText: nums.join('\n'),
          displayFormat: 'vertical',
          digits: { a: nums[0], b: nums[1], op: '+', extraNumbers: nums.slice(2) },
          answerText: sum.toString()
        });
      } else {
        list.push({
          questionText: nums.join(' + ') + ' =',
          displayFormat: 'repeated_addition',
          digits: { a: nums[0], b: nums[1], op: '+', extraNumbers: nums },
          answerText: sum.toString()
        });
      }
    }
  } 
  
  else if (materialId === 'P12') {
    // Penjumlahan Bersusun Banyak Bilangan (3/4 baris, 2 digit)
    for (let i = 0; i < total; i++) {
      const length = getRandomInt(3, 4);
      const nums: number[] = [];
      for (let j = 0; j < length; j++) {
        nums.push(getRandomInt(10, 50));
      }
      const sum = nums.reduce((s, n) => s + n, 0);
      // We represent multi-line vertical by joining with newline
      list.push({
        questionText: nums.join('\n'),
        displayFormat: 'vertical',
        digits: { a: nums[0], b: nums[1], op: '+', extraNumbers: nums.slice(2) },
        answerText: sum.toString()
      });
    }
  } 
  
  else if (materialId === 'P13') {
    // Persiapan Menuju Perkalian (Penjumlahan Angka Sama)
    const unique: any[] = [];
    for (let num = 2; num <= 9; num++) {
      for (let cols = 3; cols <= 7; cols++) {
        unique.push({ num, cols });
      }
    }
    // Easiest first (smaller numbers, shorter lengths)
    unique.sort((x, y) => (x.num * x.cols) - (y.num * y.cols));
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      const nums = Array(item.cols).fill(item.num);
      list.push({
        questionText: `${nums.join(' + ')} =`,
        displayFormat: 'repeated_addition',
        digits: { a: item.num, b: item.cols, op: '+' }, // representing cols X num
        answerText: (item.num * item.cols).toString()
      });
    });
  } 
  
  else if (materialId === 'P14') {
    // Grid Penjumlahan 2x2
    for (let i = 0; i < total; i++) {
      let a = 0, b = 0, c = 0, d = 0;
      let valid = false;
      while (!valid) {
        a = getRandomInt(11, 88);
        b = getRandomInt(11, 88);
        c = getRandomInt(11, 88);
        d = getRandomInt(11, 88);
        
        // Cek syarat "Tanpa Simpan" (satuan < 10 untuk mendatar dan menurun)
        if (a % 10 + b % 10 < 10 &&
            c % 10 + d % 10 < 10 &&
            a % 10 + c % 10 < 10 &&
            b % 10 + d % 10 < 10 &&
            a % 10 !== 0 && b % 10 !== 0 && c % 10 !== 0 && d % 10 !== 0) {
          valid = true;
        }
      }
      
      const rowSums: [number, number] = [a + b, c + d];
      const colSums: [number, number] = [a + c, b + d];
      
      const possibleMissing = [
        [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
      ];
      const missingIndices = possibleMissing[getRandomInt(0, possibleMissing.length - 1)] as [number, number];

      list.push({
        questionText: `Isilah kotak kosong`,
        displayFormat: 'grid_2x2',
        digits: { 
          a: 0, b: 0, op: '+', 
          gridData: {
            cells: [a, b, c, d],
            rowSums,
            colSums,
            missingIndices
          }
        },
        answerText: `${[a, b, c, d][missingIndices[0]]}, ${[a, b, c, d][missingIndices[1]]}`
      });
    }
  }

  else if (materialId === 'P15') {
    // Timbangan Penjumlahan (Hasil 10-20)
    for (let i = 0; i < total; i++) {
      const sum = getRandomInt(10, 20);
      let a = 0, b = 0, c = 0, d = 0;
      let valid = false;
      while (!valid) {
        a = getRandomInt(1, sum - 1);
        b = sum - a;
        c = getRandomInt(1, sum - 1);
        d = sum - c;
        if (a !== c && a !== d) {
          valid = true;
        }
      }

      const isFirst = i === 0;
      const choicesArray = [a, b, c, d];
      const shuffledChoices = shuffleArray(choicesArray) as [number, number, number, number];

      list.push({
        questionText: `Masukkan angka yang tepat, agar jumlah bilangan kanan dan kiri sama.`,
        displayFormat: 'balance_scale',
        digits: {
          a: 0, b: 0, op: '+',
          balanceData: {
            leftPair: [a, b],
            rightPair: [c, d],
            choices: shuffledChoices,
            prefilledIndices: isFirst ? [0, 3] : []
          }
        },
        answerText: `${a}+${b}=${c}+${d}`
      });
    }
  }

  else if (materialId === 'P16') {
    // Segitiga Ajaib Penjumlahan
    for (let i = 0; i < total; i++) {
      const leftSquare = getRandomInt(10, 50);
      const rightSquare = getRandomInt(10, 50);
      const bottomSquare = getRandomInt(10, 50);
      
      const topCircle = leftSquare + rightSquare;
      const blCircle = leftSquare + bottomSquare;
      const brCircle = rightSquare + bottomSquare;
      
      const isExample = i === 0;
      // 50% chance to hide circles (ask for sum), 50% chance to hide squares (ask for difference)
      // except for example which should show all
      const missingType = isExample ? 'circles' : (Math.random() > 0.5 ? 'circles' : 'squares');

      let answerText = '';
      if (missingType === 'circles') {
         answerText = `${topCircle}, ${blCircle}, ${brCircle}`;
      } else {
         answerText = `${leftSquare}, ${rightSquare}, ${bottomSquare}`;
      }

      list.push({
        questionText: missingType === 'circles' ? 
          `Jumlahkan angka pada kotak yang terhubung untuk mengisi lingkaran.` :
          `Kurangkan angka lingkaran dengan kotak terdekat untuk mengisi kotak lainnya.`,
        displayFormat: 'triangle_magic',
        digits: {
          a: 0, b: 0, op: '+',
          triangleData: {
            squares: [leftSquare, rightSquare, bottomSquare],
            circles: [topCircle, blCircle, brCircle],
            isExample,
            missingType
          }
        },
        answerText
      });
    }
  }

  else if (materialId === 'P17') {
    // Teka-Teki Silang Penjumlahan Bagan Besar
    const template1 = {
      grid: [
        // 0     1    2    3    4    5    6    7    8    9    10   11   12   13   14
        ['v1', '+', 'v2', '=', 'v3', '',  '',  '',  'v4', '+', 'v5', '=', 'v6', '',  ''], // R0
        ['+',  '',  '',   '',  '+',  '',  '',  '',  '+',  '',  '',   '',  '',   '',  ''], // R1
        ['v7', '',  '',   '',  'v8', '',  '',  '',  'v9', '+', 'v10','=', 'v11','',  ''], // R2
        ['=',  '',  '',   '',  '=',  '',  '',  '',  '=',  '',  '',   '',  '',   '',  ''], // R3
        ['v12','',  '',   '',  'v13','+', 'v14','=', 'v15','',  '',   '',  '',   '',  ''], // R4
        ['',   '',  '',   '',  '',   '',  '+',  '',  '+',  '',  '',   '',  '',   '',  ''], // R5
        ['',   '',  '',   '',  '',   '',  'v16','=', 'v17','+', 'v18','',  '',   '',  ''], // R6
        ['',   '',  '',   '',  '',   '',  '=',  '',  '=',  '',  '',   '',  '',   '',  ''], // R7
        ['',   '',  '',   '',  '',   '',  'v19','+', 'v21','=', 'v20','',  '',   '',  ''], // R8
        ['',   '',  '',   '',  '',   '',  '+',  '',  '',   '',  '+',  '',  '',   '',  ''], // R9
        ['',   '',  '',   '',  'v22','+', 'v23','=', 'v24','',  'v25','+', 'v26','=', 'v27'],// R10
        ['',   '',  '',   '',  '+',  '',  '=',  '',  '',   '',  '=',  '',  '',   '',  ''], // R11
        ['',   '',  '',   '',  'v28','',  'v29','',  '',   '',  'v30','',  '',   '',  ''], // R12
        ['',   '',  '',   '',  '=',  '',  '',   '',  '',   '',  '',   '',  '',   '',  ''], // R13
        ['',   '',  '',   '',  'v31','',  '',   '',  '',   '',  '',   '',  '',   '',  '']  // R14
      ],
      generate: () => {
        const v1 = getRandomInt(1, 4);
        const v2 = getRandomInt(1, 4);
        const v3 = v1 + v2;
        const v7 = getRandomInt(1, 4);
        const v12 = v1 + v7;
        const v8 = getRandomInt(1, 4);
        const v13 = v3 + v8;
        const v14 = getRandomInt(1, 4);
        const v15 = v13 + v14;

        const v4 = getRandomInt(1, v15 - 1);
        const v9 = v15 - v4;

        const v5 = getRandomInt(1, 4);
        const v6 = v4 + v5;
        const v10 = getRandomInt(1, 4);
        const v11 = v9 + v10;

        const v16 = getRandomInt(1, 4);
        const v19 = v14 + v16;
        const v17 = getRandomInt(1, 4);
        const v21 = v15 + v17;
        const v18 = v16 + v17;
        const v20 = v19 + v21;

        const v23 = getRandomInt(1, 4);
        const v29 = v19 + v23;
        const v22 = getRandomInt(1, 4);
        const v24 = v22 + v23;

        const v25 = getRandomInt(1, 4);
        const v30 = v20 + v25;
        const v26 = getRandomInt(1, 4);
        const v27 = v25 + v26;

        const v28 = getRandomInt(1, 4);
        const v31 = v22 + v28;

        const values = {
          v1, v2, v3, v4, v5, v6, v7, v8, v9, v10,
          v11, v12, v13, v14, v15, v16, v17, v18, v19, v21,
          v20, v22, v23, v24, v25, v26, v27, v28, v29, v30, v31
        };

        const hidden = [
          'v2', 'v12', 'v13', 'v14', 'v4', 'v11', 'v21',
          'v18', 'v20', 'v29', 'v25', 'v27', 'v22', 'v24'
        ];
        
        return { values, hidden };
      }
    };

    const template2 = {
      grid: [
        // 0     1    2    3    4    5    6    7    8    9    10   11   12   13   14
        ['v1', '+', 'v2', '=', 'v3', '',  '',  '',  'v4', '+', 'v5', '=', 'v6', '',  ''], // 0
        ['',   '',  '',   '',  '+',  '',  '',  '',  '',   '',  '+',  '',  '',   '',  ''], // 1
        ['',   '',  '',   '',  'v8', '+', 'v9', '=', 'v10','',  'v11','',  '',   '',  ''], // 2
        ['',   '',  '',   '',  '=',  '',  '+',  '',  '',   '',  '=',  '',  '',   '',  ''], // 3
        ['v12','+', 'v13','=', 'v14','',  'v15','',  '',   '',  'v16','+', 'v17','=', 'v18'],// 4
        ['+',  '',  '',   '',  '',   '',  '=',  '',  '',   '',  '',   '',  '',   '',  ''], // 5
        ['v19','',  '',   '',  '',   '',  'v20','+', 'v21','=', 'v22','',  '',   '',  ''], // 6
        ['=',  '',  '',   '',  '',   '',  '+',  '',  '',   '',  '',   '',  '',   '',  ''], // 7
        ['v23','+', 'v24','=', 'v25','',  'v26','',  '',   '',  '',   '',  '',   '',  ''], // 8
        ['',   '',  '',   '',  '+',  '',  '=',  '',  '',   '',  '',   '',  '',   '',  ''], // 9
        ['',   '',  '',   '',  'v27','+', 'v28','=', 'v29','',  '',   '',  '',   '',  ''], // 10
        ['',   '',  '',   '',  '=',  '',  '',   '',  '',   '',  '',   '',  '',   '',  ''], // 11
        ['',   '',  '',   '',  'v30','',  '',   '',  '',   '',  '',   '',  '',   '',  '']  // 12
      ],
      generate: () => {
        const v1 = getRandomInt(1, 4);
        const v2 = getRandomInt(1, 4);
        const v3 = v1 + v2;
        const v8 = getRandomInt(1, 4);
        const v14 = v3 + v8;
        const v13 = getRandomInt(1, v14 - 1);
        const v12 = v14 - v13;
        const v4 = getRandomInt(1, 4);
        const v5 = getRandomInt(1, 4);
        const v6 = v4 + v5;
        const v11 = getRandomInt(1, 4);
        const v16 = v5 + v11;
        const v17 = getRandomInt(1, 4);
        const v18 = v16 + v17;
        const v9 = getRandomInt(1, 4);
        const v10 = v8 + v9;
        const v15 = getRandomInt(1, 4);
        const v20 = v9 + v15;
        const v21 = getRandomInt(1, 4);
        const v22 = v20 + v21;
        const v19 = getRandomInt(1, 4);
        const v23 = v12 + v19;
        const v24 = getRandomInt(1, 4);
        const v25 = v23 + v24;
        const v26 = getRandomInt(1, 4);
        const v28 = v20 + v26;
        const v27 = getRandomInt(1, 4);
        const v29 = v27 + v28;
        const v30 = v25 + v27;

        return {
          values: {
            v1, v2, v3, v4, v5, v6, v8, v9, v10,
            v11, v12, v13, v14, v15, v16, v17, v18, v19,
            v20, v21, v22, v23, v24, v25, v26, v27, v28, v29, v30
          },
          hidden: [
            'v2', 'v8', 'v13', 'v5', 'v11', 'v17',
            'v9', 'v15', 'v21', 'v19', 'v24', 'v26', 'v27'
          ]
        };
      }
    };

    const template3 = {
      grid: [
        // 0     1    2    3    4    5    6    7    8    9    10   11   12   13   14
        ['',   '',  '',   '',  'v1', '+', 'v2', '=', 'v3', '',  '',   '',  '',   '',  ''], // 0
        ['',   '',  '',   '',  '+',  '',  '',   '',  '+',  '',  '',   '',  '',   '',  ''], // 1
        ['',   '',  'v4', '+', 'v5', '=', 'v6', '',  'v7', '+', 'v8', '=', 'v9', '',  ''], // 2
        ['',   '',  '',   '',  '=',  '',  '+',  '',  '=',  '',  '+',  '',  '',   '',  ''], // 3
        ['v10','+', 'v11','=', 'v12','',  'v13','+', 'v14','=', 'v15','',  '',   '',  ''], // 4
        ['+',  '',  '',   '',  '+',  '',  '=',  '',  '',   '',  '=',  '',  '',   '',  ''], // 5
        ['v16','',  '',   '',  'v17','',  'v18','',  '',   '',  'v19','+', 'v20','=', 'v21'],// 6
        ['=',  '',  '',   '',  '=',  '',  '',   '',  '',   '',  '',   '',  '+',  '',  ''], // 7
        ['v22','+', 'v23','=', 'v24','',  '',   '',  '',   '',  '',   '',  'v25','',  ''], // 8
        ['',   '',  '+',  '',  '',   '',  '',   '',  '',   '',  '',   '',  '=',  '',  ''], // 9
        ['',   '',  'v26','+', 'v27','=', 'v28','',  '',   '',  '',   '',  'v29','',  ''], // 10
        ['',   '',  '=',  '',  '',   '',  '',   '',  '',   '',  '',   '',  '',   '',  ''], // 11
        ['',   '',  'v30','',  '',   '',  'v31','+', 'v32','=', 'v33','',  '',   '',  '']  // 12
      ],
      generate: () => {
        const v1 = getRandomInt(1, 4);
        const v2 = getRandomInt(1, 4);
        const v3 = v1 + v2;
        const v5 = getRandomInt(1, 4);
        const v12 = v1 + v5;
        const v10 = getRandomInt(1, v12 - 1);
        const v11 = v12 - v10;
        const v4 = getRandomInt(1, 4);
        const v6 = v4 + v5;
        const v7 = getRandomInt(1, 4);
        const v14 = v3 + v7;
        const v8 = getRandomInt(1, 4);
        const v9 = v7 + v8;
        const v13 = getRandomInt(1, 4);
        const v15 = v13 + v14;
        const v18 = v6 + v13;
        const v19 = v8 + v15;
        const v20 = getRandomInt(1, 4);
        const v21 = v19 + v20;
        const v25 = getRandomInt(1, 4);
        const v29 = v20 + v25;
        const v16 = getRandomInt(1, 4);
        const v22 = v10 + v16;
        const min_v17 = Math.max(1, v22 - v12 + 1);
        const v17 = getRandomInt(min_v17, min_v17 + 3);
        const v24 = v12 + v17;
        const v23 = v24 - v22;
        const v26 = getRandomInt(1, 4);
        const v30 = v23 + v26;
        const v27 = getRandomInt(1, 4);
        const v28 = v26 + v27;
        const v31 = getRandomInt(1, 4);
        const v32 = getRandomInt(1, 4);
        const v33 = v31 + v32;

        return {
          values: {
            v1, v2, v3, v4, v5, v6, v7, v8, v9, v10,
            v11, v12, v13, v14, v15, v16, v17, v18, v19, v20,
            v21, v22, v23, v24, v25, v26, v27, v28, v29, v30,
            v31, v32, v33
          },
          hidden: [
            'v2', 'v5', 'v11', 'v14', 'v13', 'v20', 'v16',
            'v17', 'v26', 'v27', 'v32', 'v4', 'v8', 'v25'
          ]
        };
      }
    };

    const crosswordTemplates = [template1, template2, template3];

    for (let i = 0; i < total; i++) {
      const template = crosswordTemplates[i % crosswordTemplates.length];
      const { values, hidden } = template.generate();

      list.push({
        questionText: `Teka-Teki Silang Penjumlahan`,
        displayFormat: 'crossword_puzzle',
        digits: {
          a: 0, b: 0, op: '+',
          crosswordData: {
            grid: template.grid,
            values,
            hidden
          }
        },
        answerText: 'Sesuai dengan logika penjumlahan.'
      });
    }
  }

  else if (materialId === 'P18') {
    // Teka-Teki Visual Pohon
    const targetPairs: Array<Array<'A' | 'B' | 'C' | 'D' | 'H'>> = [
      ['H', 'A'], ['H', 'B'], ['H', 'C'], ['H', 'D'],
      ['A', 'C'], ['A', 'D'], ['B', 'C'], ['B', 'D']
    ];
    
    for (let i = 0; i < total; i++) {
      const H = getRandomInt(3, 8);
      const hB = getRandomInt(6, 12);
      const hA = H + hB; // 9 to 20
      
      const hC = getRandomInt(2, 7);
      const hD = H + hC; // 5 to 15
      
      const themeId = i % 4; // Rotate through 4 tree themes
      const missingTargets = targetPairs[i % targetPairs.length];
      
      const targetNames = missingTargets.map(t => t === 'H' ? 'selisih tanah (H)' : `pohon ${t}`).join(' dan ');
      const questionText = `Penjumlahan Bilangan Yang Hasilnya 10 Sampai 20\nTemukan tinggi ${targetNames} yang dimaksud!`;
      
      const steps = [];
      if (missingTargets.includes('H')) {
        if (!missingTargets.includes('A') && !missingTargets.includes('B')) {
          steps.push(`Selisih tanah H = ${hA} - ${hB} = ${H}.`);
        } else {
          steps.push(`Selisih tanah H = ${hD} - ${hC} = ${H}.`);
        }
        const other = missingTargets.find(t => t !== 'H');
        if (other === 'A') steps.push(`Maka, Pohon A = B + H = ${hB} + ${H} = ${hA}.`);
        if (other === 'B') steps.push(`Maka, Pohon B = A - H = ${hA} - ${H} = ${hB}.`);
        if (other === 'C') steps.push(`Maka, Pohon C = D - H = ${hD} - ${H} = ${hC}.`);
        if (other === 'D') steps.push(`Maka, Pohon D = C + H = ${hC} + ${H} = ${hD}.`);
      } else {
        steps.push(`Diketahui selisih tanah H = ${H}.`);
        if (missingTargets.includes('A')) steps.push(`Pohon A = B + H = ${hB} + ${H} = ${hA}.`);
        if (missingTargets.includes('B')) steps.push(`Pohon B = A - H = ${hA} - ${H} = ${hB}.`);
        if (missingTargets.includes('C')) steps.push(`Pohon C = D - H = ${hD} - ${H} = ${hC}.`);
        if (missingTargets.includes('D')) steps.push(`Pohon D = C + H = ${hC} + ${H} = ${hD}.`);
      }
      const answerText = steps.join(' ');

      list.push({
        questionText,
        displayFormat: 'tree_puzzle',
        digits: {
          a: 0, b: 0, op: '+',
          treeData: {
            hA, hB, hC, hD, H, themeId, missingTargets
          }
        },
        answerText
      });
    }
  }

  else if (materialId === 'P19') {
    // Penjumlahan Mendatar Bilangan >= 2 Angka
    const unique: any[] = [];
    if (rLevel === 'Rendah') {
      // 3 angka + 2 angka, atau 3 angka + 3 angka
      for (let i = 0; i < total * 2; i++) {
        const a = getRandomInt(100, 999);
        const b = i % 2 === 0 ? getRandomInt(10, 99) : getRandomInt(100, 999);
        unique.push({ a, b });
      }
    } else if (rLevel === 'Sedang') {
      // 4 angka + 3 angka, atau 4 angka + 4 angka
      for (let i = 0; i < total * 2; i++) {
        const a = getRandomInt(1000, 9999);
        const b = i % 2 === 0 ? getRandomInt(100, 999) : getRandomInt(1000, 9999);
        unique.push({ a, b });
      }
    } else {
      // 5 angka + 4 angka, atau 5 angka + 5 angka
      for (let i = 0; i < total * 2; i++) {
        const a = getRandomInt(10000, 99999);
        const b = getRandomInt(1000, 99999);
        unique.push({ a, b });
      }
    }
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      if (Math.random() > 0.5) {
        list.push({
          questionText: `${item.b} + ${item.a} =`,
          displayFormat: 'horizontal',
          digits: { a: item.b, b: item.a, op: '+' },
          answerText: (item.a + item.b).toString()
        });
      } else {
        list.push({
          questionText: `${item.a} + ${item.b} =`,
          displayFormat: 'horizontal',
          digits: { a: item.a, b: item.b, op: '+' },
          answerText: (item.a + item.b).toString()
        });
      }
    });
  }

    const formatDots = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\b\d{4,}\b/g, (match) => {
      return parseInt(match).toLocaleString('id-ID');
    });
  };

  return list.map((q, idx) => ({ 
    ...q, 
    id: idx + 1, 
    questionText: formatDots(q.questionText), 
    answerText: formatDots(q.answerText) 
  } as Question));
}

// ==========================================
// PENGURANGAN GENERATORS
// ==========================================
function generatePengurangan(materialId: string, total: number, rLevel: 'Rendah' | 'Sedang' | 'Tinggi'): Question[] {
  const list: Omit<Question, 'id'>[] = [];

  if (materialId === 'K1') {
    // Pengurangan kurang dari 5 (a <= 5, b <= a, hasil 0-5)
    const unique: any[] = [];
    for (let a = 1; a <= 5; a++) {
      for (let b = 0; b <= a; b++) {
        unique.push({ a, b });
      }
    }
    unique.sort((x, y) => x.a - y.a || x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} - ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '-' },
        answerText: (item.a - item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'K2') {
    // Pengurangan kurang dari 10 (a <= 10, b <= a)
    const unique: any[] = [];
    for (let a = 1; a <= 10; a++) {
      for (let b = 0; b <= a; b++) {
        unique.push({ a, b });
      }
    }
    unique.sort((x, y) => x.a - y.a || x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} - ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '-' },
        answerText: (item.a - item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'K3') {
    // Pengurangan bilangan belasan (kurang dari 20) tanpa simpan/pinjam (no borrowing)
    const unique: any[] = [];
    for (let a = 11; a <= 19; a++) {
      const unitsA = a % 10;
      for (let b = 1; b <= 9; b++) {
        if (unitsA >= b) {
          unique.push({ a, b });
        }
      }
    }
    unique.sort((x, y) => x.a - y.a || x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} - ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '-' },
        answerText: (item.a - item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'K4') {
    // Pengurangan dari Bilangan 10: 10 - n (where n is 1-9)
    const unique: any[] = [];
    for (let b = 1; b <= 9; b++) {
      unique.push({ a: 10, b });
    }
    // Sort randomly or by difference to ensure variation
    unique.sort((x, y) => x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} - ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '-' },
        answerText: (item.a - item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'K5') {
    // Pengurangan bilangan kurang dari 20 dengan borrowing (meminjam)
    // a in 11-19, b in 1-9, unitsA < b
    const unique: any[] = [];
    for (let a = 11; a <= 18; a++) {
      const unitsA = a % 10;
      for (let b = 1; b <= 9; b++) {
        if (unitsA < b) {
          unique.push({ a, b });
        }
      }
    }
    unique.sort((x, y) => x.a - y.a || x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} - ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '-' },
        answerText: (item.a - item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'K6') {
    // Bilangan Dua Angka atau Tiga Angka Mendatar
    const unique: any[] = [];
    // Generate a good list of 2-digit subtractions first, then some 3-digit
    for (let a = 20; a <= 99; a++) {
      const b = getRandomInt(10, a - 5);
      unique.push({ a, b });
    }
    unique.sort((x, y) => x.a - y.a);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} - ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '-' },
        answerText: (item.a - item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'K7') {
    // Pengurangan Bilangan Tiga Angka (Bersusun)
    const unique: any[] = [];
    for (let i = 0; i < total * 2; i++) {
      const a = getRandomInt(200, 999);
      const b = getRandomInt(100, a - 50);
      unique.push({ a, b });
    }
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a}\n${item.b}`,
        displayFormat: 'vertical',
        digits: { a: item.a, b: item.b, op: '-' },
        answerText: (item.a - item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'K8') {
    // Pengurangan Bilangan Empat Angka atau Lebih (Bersusun)
    const unique: any[] = [];
    for (let i = 0; i < total * 2; i++) {
      const a = getRandomInt(2000, 9999);
      const b = getRandomInt(1000, a - 500);
      unique.push({ a, b });
    }
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a}\n${item.b}`,
        displayFormat: 'vertical',
        digits: { a: item.a, b: item.b, op: '-' },
        answerText: (item.a - item.b).toString()
      });
    });
  } 

    const formatDots = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\b\d{4,}\b/g, (match) => {
      return parseInt(match).toLocaleString('id-ID');
    });
  };

  return list.map((q, idx) => ({ 
    ...q, 
    id: idx + 1, 
    questionText: formatDots(q.questionText), 
    answerText: formatDots(q.answerText) 
  } as Question));
}

// ==========================================
// PERKALIAN GENERATORS
// ==========================================
function generatePerkalian(
  materialId: string,
  total: number,
  rLevel: 'Rendah' | 'Sedang' | 'Tinggi',
  multFormat?: 'mendatar' | 'bersusun'
): Question[] {
  const list: Omit<Question, 'id'>[] = [];

  if (materialId === 'X0') {
    // Perkalian X0 (Konsep Perkalian Gasing) - Gasing Notation: a□b (a kelompok berisi b)
    const unique: any[] = [];
    
    // Add standard comparison cases at the top to highlight processes (2□3 and 3□2)
    unique.push({ a: 2, b: 3 });
    unique.push({ a: 3, b: 2 });
    unique.push({ a: 4, b: 5 });
    unique.push({ a: 5, b: 4 });

    // Generate basic pairs for conceptual understanding (a group, b size per group)
    for (let a = 2; a <= 5; a++) {
      for (let b = 2; b <= 5; b++) {
        // Avoid duplicate additions
        if ((a === 2 && b === 3) || (a === 3 && b === 2) || (a === 4 && b === 5) || (a === 5 && b === 4)) {
          continue;
        }
        unique.push({ a, b });
      }
    }
    // Also include some others to remain safe
    unique.push({ a: 2, b: 1 });
    unique.push({ a: 3, b: 1 });
    unique.push({ a: 1, b: 3 });
    unique.push({ a: 1, b: 4 });

    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      const subB = toSubscript(item.b);
      list.push({
        questionText: `${item.a}□${subB} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '□' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X1') {
    // Perkalian 1 (Fokus pada perkalian dengan angka 1: bilangan x 1 = bilangan itu sendiri)
    const unique: any[] = [];
    for (let a = 1; a <= 15; a++) {
      unique.push({ a, b: 1 });
      unique.push({ a: 1, b: a });
    }
    // Ensure unique elements lists
    const uniqueMap = new Map();
    unique.forEach(u => uniqueMap.set(`${u.a}x${u.b}`, u));
    const dedupedUnique = Array.from(uniqueMap.values());

    const fitted = generateFittedList(dedupedUnique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X2') {
    // Perkalian 10
    const unique: any[] = [];
    for (let a = 1; a <= 50; a++) {
      unique.push({ a, b: 10 });
      if (a <= 15) {
        unique.push({ a: 10, b: a });
      }
    }
    unique.sort((x, y) => (x.a === 10 ? x.b : x.a) - (y.a === 10 ? y.b : y.a));
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X3') {
    // Perkalian 2
    const unique: any[] = [];
    for (let a = 1; a <= 10; a++) {
      unique.push({ a, b: 2 });
      unique.push({ a: 2, b: a });
    }
    unique.sort((x, y) => (x.a === 2 ? x.b : x.a) - (y.a === 2 ? y.b : y.a));
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X4') {
    // Perkalian 9
    const unique: any[] = [];
    for (let a = 1; a <= 10; a++) {
      unique.push({ a, b: 9 });
      unique.push({ a: 9, b: a });
    }
    unique.sort((x, y) => (x.a === 9 ? x.b : x.a) - (y.a === 9 ? y.b : y.a));
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X5') {
    // Perkalian 5
    const unique: any[] = [];
    for (let a = 1; a <= 10; a++) {
      unique.push({ a, b: 5 });
      unique.push({ a: 5, b: a });
    }
    unique.sort((x, y) => (x.a === 5 ? x.b : x.a) - (y.a === 5 ? y.b : y.a));
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X6') {
    // Perkalian 5 Khusus (6x5, 7x5, 8x5)
    const unique = [
      { a: 6, b: 5 }, { a: 5, b: 6 },
      { a: 7, b: 5 }, { a: 5, b: 7 },
      { a: 8, b: 5 }, { a: 5, b: 8 }
    ];
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X7') {
    // Perkalian Bilangan yang Sama (1-9 saja)
    const unique: any[] = [];
    for (let a = 1; a <= 9; a++) {
      unique.push({ a, b: a });
    }
    unique.sort((x, y) => x.a - y.a);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X8') {
    // Perkalian 3 dan 4
    const unique: any[] = [];
    for (let a = 1; a <= 10; a++) {
      unique.push({ a, b: 3 });
      unique.push({ a: 3, b: a });
      unique.push({ a: a, b: 4 });
      unique.push({ a: 4, b: a });
    }
    unique.sort((x, y) => (x.a * x.b) - (y.a * y.b));
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X9') {
    // Pengulangan Perkalian 2–5
    const unique: any[] = [];
    for (let a = 2; a <= 5; a++) {
      for (let b = 1; b <= 10; b++) {
        unique.push({ a, b });
      }
    }
    unique.sort((x, y) => (x.a * x.b) - (y.a * y.b));
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X10') {
    // Perkalian 6, 7, dan 8
    const unique: any[] = [];
    for (let a = 6; a <= 8; a++) {
      for (let b = 1; b <= 10; b++) {
        unique.push({ a, b });
      }
    }
    unique.sort((x, y) => (x.a * x.b) - (y.a * y.b));
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X11') {
    // Pengulangan Perkalian Lengkap 1–10
    const unique: any[] = [];
    for (let a = 1; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) {
        unique.push({ a, b });
      }
    }
    unique.sort((x, y) => (x.a * x.b) - (y.a * y.b));
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X12') {
    // Perkalian 2 Angka × 1 Angka Tingkat 1 (Tanpa Simpan)
    // Tens * digit and units * digit are < 10. e.g., 12 * 3, 23 * 2, 41 * 2
    const unique: any[] = [];
    for (let a = 11; a <= 94; a++) {
      const pul = Math.floor(a / 10);
      const sat = a % 10;
      for (let b = 2; b <= 9; b++) {
        if (pul * b < 10 && sat * b < 10) {
          unique.push({ a, b });
        }
      }
    }
    unique.sort((x, y) => x.a - y.a);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      if (multFormat === 'bersusun') {
        list.push({
          questionText: `${item.a}\n${item.b}`,
          displayFormat: 'vertical',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: (item.a * item.b).toString()
        });
      } else {
        list.push({
          questionText: `${item.a} × ${item.b} =`,
          displayFormat: 'horizontal',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: (item.a * item.b).toString()
        });
      }
    });
  } 
  
  else if (materialId === 'X13') {
    // Perkalian 2 Angka × 1 Angka Tingkat 2 (Dengan simpanan)
    const unique: any[] = [];
    for (let a = 11; a <= 99; a++) {
      const pul = Math.floor(a / 10);
      const sat = a % 10;
      for (let b = 2; b <= 9; b++) {
        const carries = (sat * b) >= 10 || (pul * b) >= 10;
        if (carries) {
          unique.push({ a, b });
        }
      }
    }
    unique.sort((x, y) => x.a - y.a);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      if (multFormat === 'bersusun') {
        list.push({
          questionText: `${item.a}\n${item.b}`,
          displayFormat: 'vertical',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: (item.a * item.b).toString()
        });
      } else {
        list.push({
          questionText: `${item.a} × ${item.b} =`,
          displayFormat: 'horizontal',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: (item.a * item.b).toString()
        });
      }
    });
  } 
  
  else if (materialId === 'X14') {
    // Perkalian 2 Angka × 2 Angka Tingkat 1 (Tanpa simpanan) e.g., 12 x 13, 21 x 32
    // Stitched: silang <= 9, puluh_kali <= 9, sat_kali <= 9
    const unique: any[] = [];
    for (let a = 11; a <= 44; a++) {
      const aTens = Math.floor(a / 10);
      const aUnits = a % 10;
      for (let b = 11; b <= 44; b++) {
        const bTens = Math.floor(b / 10);
        const bUnits = b % 10;
        
        const tensMul = aTens * bTens;
        const crossSum = (aTens * bUnits) + (aUnits * bTens);
        const unitsMul = aUnits * bUnits;

        if (tensMul < 10 && crossSum < 10 && unitsMul < 10) {
          unique.push({ a, b });
        }
      }
    }
    unique.sort((x, y) => x.a - y.a || x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      if (multFormat === 'bersusun') {
        list.push({
          questionText: `${item.a}\n${item.b}`,
          displayFormat: 'vertical',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: (item.a * item.b).toString()
        });
      } else {
        list.push({
          questionText: `${item.a} × ${item.b} =`,
          displayFormat: 'horizontal',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: (item.a * item.b).toString()
        });
      }
    });
  } 
  
  else if (materialId === 'X15') {
    // Perkalian 2 Angka × 2 Angka Tingkat 2 (Simpanan ringan)
    const unique: any[] = [];
    for (let a = 11; a <= 50; a++) {
      for (let b = 11; b <= 50; b++) {
        const prod = a * b;
        if (prod > 100 && prod < 1000) {
          unique.push({ a, b });
        }
      }
    }
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      if (multFormat === 'bersusun') {
        list.push({
          questionText: `${item.a}\n${item.b}`,
          displayFormat: 'vertical',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: (item.a * item.b).toString()
        });
      } else {
        list.push({
          questionText: `${item.a} × ${item.b} =`,
          displayFormat: 'horizontal',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: (item.a * item.b).toString()
        });
      }
    });
  } 
  
  else if (materialId === 'X16') {
    // Perkalian 2 Angka × 2 Angka Tingkat 3 (Umum)
    const unique: any[] = [];
    for (let i = 0; i < total * 3; i++) {
      const a = getRandomInt(12, 98);
      const b = getRandomInt(12, 98);
      unique.push({ a, b });
    }
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      if (multFormat === 'bersusun') {
        list.push({
          questionText: `${item.a}\n${item.b}`,
          displayFormat: 'vertical',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: (item.a * item.b).toString()
        });
      } else {
        list.push({
          questionText: `${item.a} × ${item.b} =`,
          displayFormat: 'horizontal',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: (item.a * item.b).toString()
        });
      }
    });
  } 
  
  else if (materialId === 'X17') {
    // Perkalian khusus bilangan dekat 100 (90 sampai 99)
    const unique: any[] = [];
    for (let a = 90; a <= 99; a++) {
      for (let b = 90; b <= 99; b++) {
        unique.push({ a, b });
      }
    }
    unique.sort((x, y) => x.a - y.a || x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X18') {
    // Perkalian khusus dekat 50 (46 sampai 55)
    const unique: any[] = [];
    for (let a = 46; a <= 55; a++) {
      for (let b = 46; b <= 55; b++) {
        unique.push({ a, b });
      }
    }
    unique.sort((x, y) => x.a - y.a || x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X19') {
    // Perkalian bilangan berakhiran nol
    const unique: any[] = [];
    for (let aBase = 1; aBase <= 20; aBase++) {
      for (let bBase = 1; bBase <= 20; bBase++) {
        unique.push({ a: aBase * 10, b: bBase * 10 });
        if (aBase <= 5) {
          unique.push({ a: aBase * 100, b: bBase * 10 });
        }
      }
    }
    unique.sort((x, y) => (x.a * x.b) - (y.a * y.b));
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X20') {
    // Perkalian 3 Angka × 1 Angka
    const unique: any[] = [];
    for (let i = 0; i < total * 2; i++) {
      const a = getRandomInt(101, 499);
      const b = getRandomInt(2, 9);
      unique.push({ a, b });
    }
    unique.sort((x, y) => x.a - y.a);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X21') {
    // Perkalian 3 Angka × 2 Angka
    const unique: any[] = [];
    for (let i = 0; i < total * 2; i++) {
      const a = getRandomInt(101, 399);
      const b = getRandomInt(11, 49);
      unique.push({ a, b });
    }
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'X22') {
    // Perkalian 3 Angka × 3 Angka
    const unique: any[] = [];
    for (let i = 0; i < total * 2; i++) {
      const a = getRandomInt(101, 299);
      const b = getRandomInt(101, 299);
      unique.push({ a, b });
    }
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} × ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '×' },
        answerText: (item.a * item.b).toString()
      });
    });
  }

    const formatDots = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\b\d{4,}\b/g, (match) => {
      return parseInt(match).toLocaleString('id-ID');
    });
  };

  return list.map((q, idx) => ({ 
    ...q, 
    id: idx + 1, 
    questionText: formatDots(q.questionText), 
    answerText: formatDots(q.answerText) 
  } as Question));
}

// ==========================================
// PEMBAGIAN GENERATORS
// ==========================================
function generatePembagian(materialId: string, total: number, rLevel: 'Rendah' | 'Sedang' | 'Tinggi'): Question[] {
  const list: Omit<Question, 'id'>[] = [];

  if (materialId === 'B1') {
    // B1 - PERSIAPAN PEMBAGIAN: Hubungan perkalian dan pembagian (8 × □ = 24 atau □ × 7 = 56)
    const unique: any[] = [];
    for (let b = 2; b <= 10; b++) {
      for (let c = 2; c <= 10; c++) {
        unique.push({ a: b * c, b, c });
      }
    }
    unique.sort((x, y) => x.a - y.a || x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach((item, idx) => {
      const isMissingFirst = idx % 2 === 0;
      if (isMissingFirst) {
        list.push({
          questionText: `□ × ${item.c} = ${item.a}`,
          displayFormat: 'horizontal',
          digits: { a: item.a, b: item.c, op: '×' },
          answerText: item.b.toString()
        });
      } else {
        list.push({
          questionText: `${item.b} × □ = ${item.a}`,
          displayFormat: 'horizontal',
          digits: { a: item.a, b: item.b, op: '×' },
          answerText: item.c.toString()
        });
      }
    });
  } 
  
  else if (materialId === 'B2') {
    // B2 - DRILL PEMBAGIAN DASAR (No remainder, 1-digit divisor, quotient 1-10)
    const unique: any[] = [];
    for (let b = 2; b <= 10; b++) {
      for (let c = 2; c <= 10; c++) {
        unique.push({ a: b * c, b });
      }
    }
    unique.sort((x, y) => x.a - y.a || x.b - y.b);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} ÷ ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '÷' },
        answerText: (item.a / item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'B3') {
    // B3 - DRILL PEMBAGIAN LANJUTAN (Place values: multiples of 10/100, no remainder)
    const unique: any[] = [];
    for (let b = 2; b <= 10; b++) {
      for (let c = 2; c <= 10; c++) {
        unique.push({ a: b * c * 10, b });
        if (b * c * 100 <= 1000) {
          unique.push({ a: b * c * 100, b });
        }
      }
    }
    unique.sort((x, y) => x.a - y.a);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} ÷ ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '÷' },
        answerText: (item.a / item.b).toString()
      });
    });
  } 
  
  else if (materialId === 'B4') {
    // B4 - PEMBAGIAN DENGAN SISA (DASAR) (e.g. 13 ÷ 3 = 4 sisa 1)
    const unique: any[] = [];
    for (let b = 2; b <= 9; b++) {
      for (let c = 2; c <= 9; c++) {
        const exact = b * c;
        for (let r = 1; r < b; r++) {
          unique.push({ a: exact + r, b, c, sisa: r });
        }
      }
    }
    unique.sort((x, y) => x.a - y.a);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} ÷ ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '÷' },
        answerText: `${item.c} sisa ${item.sisa}`
      });
    });
  } 
  
  else if (materialId === 'B5') {
    // B5 - PEMBAGIAN BERSISA DENGAN BILANGAN 1 ANGKA (e.g. 73 ÷ 4 = 18 sisa 1)
    const unique: any[] = [];
    for (let b = 2; b <= 9; b++) {
      for (let c = 11; c <= 99; c++) {
        const exact = b * c;
        for (let r = 1; r < b; r++) {
          if (exact + r <= 999) {
            unique.push({ a: exact + r, b, c, sisa: r });
          }
        }
      }
    }
    unique.sort((x, y) => x.a - y.a);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} ÷ ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '÷' },
        answerText: `${item.c} sisa ${item.sisa}`
      });
    });
  } 
  
  else if (materialId === 'B6') {
    // B6 - PEMBAGIAN DENGAN BILANGAN DUA ANGKA (e.g. 156 ÷ 13 = 12)
    const unique: any[] = [];
    for (let c = 5; c <= 25; c++) {
      for (let b = 11; b <= 25; b++) {
        unique.push({ a: c * b, b });
      }
    }
    unique.sort((x, y) => x.a - y.a);
    const fitted = generateFittedList(unique, total, rLevel);
    fitted.forEach(item => {
      list.push({
        questionText: `${item.a} ÷ ${item.b} =`,
        displayFormat: 'horizontal',
        digits: { a: item.a, b: item.b, op: '÷' },
        answerText: (item.a / item.b).toString()
      });
    });
  }

    const formatDots = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\b\d{4,}\b/g, (match) => {
      return parseInt(match).toLocaleString('id-ID');
    });
  };

  return list.map((q, idx) => ({ 
    ...q, 
    id: idx + 1, 
    questionText: formatDots(q.questionText), 
    answerText: formatDots(q.answerText) 
  } as Question));
}
