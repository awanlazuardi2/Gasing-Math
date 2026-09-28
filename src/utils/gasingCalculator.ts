/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

export function toSuperscript(num: number | string): string {
  const str = String(num);
  return str
    .split('')
    .map((char) => SUPERSCRIPTS[char] || char)
    .join('');
}

export interface GasingStepNode {
  base: string; // The main large digit or front number (e.g. "12" or "4")
  carry?: number; // The small carry number on top (superscript) (e.g. 1 in ¹4)
  colIndex?: number;
  label?: string; // e.g. "Ratusan", "Puluhan", "Satuan"
}

export interface GasingStepDetail {
  stepNumber: number;
  title: string;
  expression: string;
  explanation: string;
  hasSmallNumber: boolean;
  smallNumber?: number;
}

export interface GasingCalculationResult {
  operation: '+' | '-' | '×' | '÷';
  num1: string;
  num2: string;
  nodes: GasingStepNode[]; // For rendering the intermediate notation with small numbers on top
  topCarries: (number | null)[]; // For vertical columns above digits [carryCol0, carryCol1, carryCol2]
  steps: GasingStepDetail[];
  finalAnswer: string;
  summaryNotation: string; // e.g. "12 ¹4 8 ➔ 1348"
}

/**
 * Calculates step-by-step GASING arithmetic with small numbers on top (superscript).
 */
export function calculateGasingSteps(
  rawNum1: string | number,
  rawNum2: string | number,
  rawOp: string
): GasingCalculationResult | null {
  const op = (rawOp === '*' || rawOp === 'x' ? '×' : rawOp === '/' || rawOp === ':' ? '÷' : rawOp) as
    | '+'
    | '-'
    | '×'
    | '÷';

  const n1Str = String(rawNum1).replace(/[^0-9]/g, '');
  const n2Str = String(rawNum2).replace(/[^0-9]/g, '');

  if (!n1Str || !n2Str) return null;

  const n1 = parseInt(n1Str, 10);
  const n2 = parseInt(n2Str, 10);

  if (isNaN(n1) || isNaN(n2)) return null;

  if (op === '+') {
    return calculateGasingAddition(n1Str, n2Str);
  } else if (op === '×') {
    return calculateGasingMultiplication(n1Str, n2Str);
  } else if (op === '-') {
    return calculateGasingSubtraction(n1Str, n2Str);
  } else if (op === '÷') {
    return calculateGasingDivision(n1Str, n2Str);
  }

  return null;
}

/**
 * GASING ADDITION (Penjumlahan dari Depan):
 * Example: 865 + 483
 * Left to right:
 * Col 0 (Ratusan): 8 + 4 = 12
 * Col 1 (Puluhan): 6 + 8 = 14 ➔ angka besar 4, angka kecil 1 di atas (¹4)
 * Col 2 (Satuan): 5 + 3 = 8 ➔ angka besar 8
 * Notasi: 12 ¹4 8
 * Penggabungan: 12 + 1 = 13, 4, 8 ➔ 1348
 */
function calculateGasingAddition(n1Str: string, n2Str: string): GasingCalculationResult {
  const maxLen = Math.max(n1Str.length, n2Str.length);
  const p1 = n1Str.padStart(maxLen, '0');
  const p2 = n2Str.padStart(maxLen, '0');

  const nodes: GasingStepNode[] = [];
  const steps: GasingStepDetail[] = [];
  const topCarries: (number | null)[] = new Array(maxLen).fill(null);

  const columnNames = ['Satuan', 'Puluhan', 'Ratusan', 'Ribuan', 'Puluh Ribuan', 'Ratus Ribuan'];

  for (let i = 0; i < maxLen; i++) {
    const d1 = parseInt(p1[i], 10);
    const d2 = parseInt(p2[i], 10);
    const sum = d1 + d2;
    const colName = columnNames[maxLen - 1 - i] || `Kolom ${i + 1}`;

    if (i === 0 && maxLen > 1) {
      // First (leftmost) column of multi-digit: write full sum (e.g. 8+4 = 12)
      nodes.push({
        base: String(sum),
        carry: 0,
        colIndex: i,
        label: colName,
      });
      steps.push({
        stepNumber: i + 1,
        title: `Kolom ${colName} (Depan)`,
        expression: `${d1} + ${d2} = ${sum}`,
        explanation: `Kerjakan dari depan: ${d1} + ${d2} = ${sum}. Tulis langsung ${sum}.`,
        hasSmallNumber: false,
      });
    } else {
      // Single digit with bridge 10 (e.g. 6+5=11 -> 1 kecil, 1 besar) OR subsequent columns:
      if (sum >= 10) {
        const carry = Math.floor(sum / 10);
        const baseDigit = sum % 10;
        nodes.push({
          base: String(baseDigit),
          carry: carry,
          colIndex: i,
          label: colName,
        });
        topCarries[i] = carry;
        steps.push({
          stepNumber: i + 1,
          title: `Kolom ${colName}`,
          expression: `${d1} + ${d2} = ${sum}`,
          explanation: `Jumlahkan: ${d1} + ${d2} = ${sum}. Tulis angka besar ${baseDigit} dan angka kecil ${toSuperscript(carry)} di atas!`,
          hasSmallNumber: true,
          smallNumber: carry,
        });
      } else {
        nodes.push({
          base: String(sum),
          carry: 0,
          colIndex: i,
          label: colName,
        });
        steps.push({
          stepNumber: i + 1,
          title: `Kolom ${colName}`,
          expression: `${d1} + ${d2} = ${sum}`,
          explanation: `Jumlahkan: ${d1} + ${d2} = ${sum}. Tulis angka ${sum}.`,
          hasSmallNumber: false,
        });
      }
    }
  }

  // Final Answer calculation
  const total = parseInt(n1Str, 10) + parseInt(n2Str, 10);
  const finalAnswer = String(total);

  // Merge step explanation
  const hasAnyCarry = nodes.some((n) => (n.carry ?? 0) > 0);
  if (hasAnyCarry) {
    const mergeParts: string[] = [];
    nodes.forEach((n, idx) => {
      if (idx === 0) {
        mergeParts.push(n.base);
      } else if (n.carry && n.carry > 0) {
        mergeParts.push(`${toSuperscript(n.carry)}${n.base}`);
      } else {
        mergeParts.push(n.base);
      }
    });

    steps.push({
      stepNumber: steps.length + 1,
      title: 'Gabungkan Angka Kecil',
      expression: `${mergeParts.join(' ')} ➔ ${finalAnswer}`,
      explanation: `Tambahkan setiap angka kecil di atas ke angka di depannya: hasil akhirnya adalah ${finalAnswer}.`,
      hasSmallNumber: true,
    });
  }

  // Summary notation string (e.g. "12 ¹4 8 ➔ 1348")
  const notationStr =
    nodes
      .map((n, idx) => (idx === 0 ? n.base : n.carry && n.carry > 0 ? `${toSuperscript(n.carry)}${n.base}` : n.base))
      .join(' ') + ` ➔ ${finalAnswer}`;

  return {
    operation: '+',
    num1: n1Str,
    num2: n2Str,
    nodes,
    topCarries,
    steps,
    finalAnswer,
    summaryNotation: notationStr,
  };
}

/**
 * GASING MULTIPLICATION (Perkalian dari Depan):
 * Example: 47 × 6
 * Step 1: 4 × 6 = 24
 * Step 2: 7 × 6 = 42 ➔ angka kecil ⁴ di atas angka 2 (²⁴ ⁴2)
 * Merge: 24 + 4 = 28 ➔ 282
 */
function calculateGasingMultiplication(n1Str: string, n2Str: string): GasingCalculationResult {
  const nodes: GasingStepNode[] = [];
  const steps: GasingStepDetail[] = [];
  const multiplier = parseInt(n2Str, 10);
  const digits = n1Str.split('').map((d) => parseInt(d, 10));

  digits.forEach((digit, idx) => {
    const prod = digit * multiplier;
    if (idx === 0 && digits.length > 1) {
      nodes.push({ base: String(prod), carry: 0 });
      steps.push({
        stepNumber: idx + 1,
        title: `Kalikan Digit Depan (${digit} × ${multiplier})`,
        expression: `${digit} × ${multiplier} = ${prod}`,
        explanation: `Kalikan dari depan: ${digit} × ${multiplier} = ${prod}. Tulis langsung ${prod}.`,
        hasSmallNumber: false,
      });
    } else {
      if (prod >= 10) {
        const carry = Math.floor(prod / 10);
        const base = prod % 10;
        nodes.push({ base: String(base), carry });
        steps.push({
          stepNumber: idx + 1,
          title: digits.length === 1 ? `Kalikan (${digit} × ${multiplier})` : `Kalikan Digit Berikutnya (${digit} × ${multiplier})`,
          expression: `${digit} × ${multiplier} = ${prod}`,
          explanation: `Kalikan: ${digit} × ${multiplier} = ${prod}. Tulis angka besar ${base} dengan angka kecil ${toSuperscript(carry)} di atas!`,
          hasSmallNumber: true,
          smallNumber: carry,
        });
      } else {
        nodes.push({ base: String(prod), carry: 0 });
        steps.push({
          stepNumber: idx + 1,
          title: digits.length === 1 ? `Kalikan (${digit} × ${multiplier})` : `Kalikan Digit Berikutnya (${digit} × ${multiplier})`,
          expression: `${digit} × ${multiplier} = ${prod}`,
          explanation: `Kalikan: ${digit} × ${multiplier} = ${prod}. Tulis ${prod}.`,
          hasSmallNumber: false,
        });
      }
    }
  });

  const finalTotal = parseInt(n1Str, 10) * multiplier;
  const finalAnswer = String(finalTotal);

  const hasAnyCarry = nodes.some((n) => (n.carry ?? 0) > 0);
  if (hasAnyCarry) {
    steps.push({
      stepNumber: steps.length + 1,
      title: 'Gabungkan Angka Kecil',
      expression: `Gabungkan angka kecil ke depan ➔ ${finalAnswer}`,
      explanation: `Tambahkan angka kecil ke angka di depannya untuk mendapatkan hasil akhir ${finalAnswer}.`,
      hasSmallNumber: true,
    });
  }

  const notationStr =
    nodes
      .map((n, idx) => (idx === 0 ? n.base : n.carry && n.carry > 0 ? `${toSuperscript(n.carry)}${n.base}` : n.base))
      .join(' ') + ` ➔ ${finalAnswer}`;

  return {
    operation: '×',
    num1: n1Str,
    num2: n2Str,
    nodes,
    topCarries: [],
    steps,
    finalAnswer,
    summaryNotation: notationStr,
  };
}

/**
 * GASING SUBTRACTION (Pengurangan dari Depan):
 * Example: 73 - 28
 * Step 1: 7 - 2 = 5
 * Step 2: 3 - 8 (tidak cukup) ➔ tukar 1 puluhan dari 5 jadi 4, tulis angka kecil ¹⁰ di atas 3 ➔ 13 - 8 = 5
 * Hasil: 45
 */
function calculateGasingSubtraction(n1Str: string, n2Str: string): GasingCalculationResult {
  const steps: GasingStepDetail[] = [];
  const nodes: GasingStepNode[] = [];
  const finalAns = String(parseInt(n1Str, 10) - parseInt(n2Str, 10));

  const maxLen = Math.max(n1Str.length, n2Str.length);
  const p1 = n1Str.padStart(maxLen, '0');
  const p2 = n2Str.padStart(maxLen, '0');

  let currentLead = parseInt(p1[0], 10) - parseInt(p2[0], 10);
  nodes.push({ base: String(currentLead), carry: 0 });

  steps.push({
    stepNumber: 1,
    title: 'Kurangkan Digit Depan',
    expression: `${p1[0]} - ${p2[0]} = ${currentLead}`,
    explanation: `Kurangkan dari depan: ${p1[0]} - ${p2[0]} = ${currentLead}.`,
    hasSmallNumber: false,
  });

  for (let i = 1; i < maxLen; i++) {
    const d1 = parseInt(p1[i], 10);
    const d2 = parseInt(p2[i], 10);

    if (d1 < d2) {
      // Need borrowing (GASING: tukar puluhan di depan dan beri angka kecil 10 di atas)
      nodes.push({ base: String(d1 + 10 - d2), carry: 10 });
      steps.push({
        stepNumber: i + 1,
        title: `Digit Berikutnya (${d1} < ${d2})`,
        expression: `Tukar 1 puluhan di depan: ${d1} + ¹⁰ - ${d2} = ${d1 + 10 - d2}`,
        explanation: `Karena ${d1} lebih kecil dari ${d2}, kurangi angka depan sebesar 1 dan beri angka kecil ¹⁰ di atas ${d1} sehingga menjadi ${d1 + 10} - ${d2} = ${d1 + 10 - d2}.`,
        hasSmallNumber: true,
        smallNumber: 10,
      });
    } else {
      nodes.push({ base: String(d1 - d2), carry: 0 });
      steps.push({
        stepNumber: i + 1,
        title: `Kurangkan Digit Berikutnya`,
        expression: `${d1} - ${d2} = ${d1 - d2}`,
        explanation: `Kurangkan langsung: ${d1} - ${d2} = ${d1 - d2}.`,
        hasSmallNumber: false,
      });
    }
  }

  return {
    operation: '-',
    num1: n1Str,
    num2: n2Str,
    nodes,
    topCarries: [],
    steps,
    finalAnswer: finalAns,
    summaryNotation: `Langkah GASING ➔ ${finalAns}`,
  };
}

/**
 * GASING DIVISION (Pembagian dari Depan):
 * Example: 852 ÷ 4
 * Step 1: 8 ÷ 4 = 2 sisa 0
 * Step 2: 5 ÷ 4 = 1 sisa 1 (tulis angka kecil ¹ di atas 2 ➔ ¹2)
 * Step 3: 12 ÷ 4 = 3
 * Hasil: 213
 */
function calculateGasingDivision(n1Str: string, n2Str: string): GasingCalculationResult {
  const steps: GasingStepDetail[] = [];
  const nodes: GasingStepNode[] = [];
  const divisor = parseInt(n2Str, 10);

  let remainder = 0;
  const digits = n1Str.split('').map((d) => parseInt(d, 10));
  let finalAnsDigits = '';

  digits.forEach((d, idx) => {
    const currentVal = remainder * 10 + d;
    const quotientDigit = Math.floor(currentVal / divisor);
    const newRemainder = currentVal % divisor;

    if (idx === 0) {
      nodes.push({ base: String(quotientDigit), carry: 0 });
      steps.push({
        stepNumber: idx + 1,
        title: `Bagi Digit Depan (${d} ÷ ${divisor})`,
        expression: `${d} ÷ ${divisor} = ${quotientDigit} ${newRemainder > 0 ? `(sisa ${newRemainder})` : ''}`,
        explanation: `${d} dibagi ${divisor} menghasilkan ${quotientDigit}${newRemainder > 0 ? `, sisa ${newRemainder} ditulis kecil di atas digit berikutnya.` : '.'}`,
        hasSmallNumber: newRemainder > 0,
        smallNumber: newRemainder,
      });
    } else {
      nodes.push({ base: String(quotientDigit), carry: remainder > 0 ? remainder : 0 });
      steps.push({
        stepNumber: idx + 1,
        title: `Bagi Digit Berikutnya (${remainder > 0 ? `${toSuperscript(remainder)}${d}` : d} ÷ ${divisor})`,
        expression: `${currentVal} ÷ ${divisor} = ${quotientDigit} ${newRemainder > 0 ? `(sisa ${newRemainder})` : ''}`,
        explanation: `${currentVal} dibagi ${divisor} menghasilkan ${quotientDigit}${newRemainder > 0 ? `, sisa ${newRemainder} ditulis kecil di atas digit berikutnya.` : '.'}`,
        hasSmallNumber: remainder > 0,
        smallNumber: remainder,
      });
    }

    finalAnsDigits += String(quotientDigit);
    remainder = newRemainder;
  });

  // Remove leading zeros if any
  const cleanFinal = String(parseInt(finalAnsDigits, 10));

  return {
    operation: '÷',
    num1: n1Str,
    num2: n2Str,
    nodes,
    topCarries: [],
    steps,
    finalAnswer: remainder > 0 ? `${cleanFinal} sisa ${remainder}` : cleanFinal,
    summaryNotation: `Langkah GASING ➔ ${cleanFinal}${remainder > 0 ? ` sisa ${remainder}` : ''}`,
  };
}

export interface GasingInteractiveSlot {
  id: string; // e.g. 'g_0_small', 'g_0_base', 'final_0', 'sisa_0'
  type: 'small' | 'base' | 'final' | 'sisa';
  colIndex?: number;
  label: string;
  expected: string;
  maxLength: number;
}

export interface QuestionSlotsResult {
  gasingData: GasingCalculationResult | null;
  needsMerge: boolean;
  hasSmallNumbers: boolean;
  slots: GasingInteractiveSlot[];
  stepSlots: GasingInteractiveSlot[];
  finalSlots: GasingInteractiveSlot[];
  sisaSlot?: GasingInteractiveSlot;
}

/**
 * Extracts all interactive slots for a given Question, including
 * small superscript carry slots, big base digit slots, and final answer slots.
 * Ensures no answer leakage in labels/placeholders, and accurately determines
 * whether intermediate steps actually require a separate "Gabung" row.
 */
export function getQuestionInteractiveSlots(q: any): QuestionSlotsResult {
  // Pasangan 10: Pure single-digit partner input, no carries or intermediate steps
  if (q?.digits?.targetSum === 10 || q?.digits?.missingPosition) {
    const expectedAns = String(q.answerText || '').trim();
    const partnerSlot: GasingInteractiveSlot = {
      id: 'final_0',
      type: 'final',
      label: 'Pasangan 10',
      expected: expectedAns,
      maxLength: 1,
    };
    return {
      gasingData: null,
      stepSlots: [],
      needsMerge: false,
      hasSmallNumbers: false,
      slots: [partnerSlot],
      finalSlots: [partnerSlot],
    };
  }

  let num1 = '';
  let num2 = '';
  let opSymbol = '+';

  if (q.digits) {
    num1 = String(q.digits.a);
    num2 = String(q.digits.b);
    opSymbol = q.digits.op;
  } else if (q.questionText) {
    const match = q.questionText.match(/([0-9.]+)\s*([\+\-\*xX:÷/])\s*([0-9.]+)/);
    if (match) {
      num1 = match[1].replace(/\./g, '');
      opSymbol = match[2];
      num2 = match[3].replace(/\./g, '');
    }
  }

  const gasingData = calculateGasingSteps(num1, num2, opSymbol);
  const stepSlots: GasingInteractiveSlot[] = [];

  const hasCarry = gasingData ? gasingData.nodes.some((n) => !!(n.carry && n.carry > 0)) : false;
  const nodeDirectStr = gasingData ? gasingData.nodes.map((n) => n.base).join('') : '';
  const finalRawStr = gasingData ? gasingData.finalAnswer.replace(/[^0-9]/g, '') : '';

  // Does this question genuinely require a separate "Gabung" row?
  // Only if there are multiple columns and at least one carry that must be added to a neighbor column,
  // or if intermediate base values need to be combined/borrowed into the final answer.
  const needsMerge = Boolean(
    gasingData &&
      ((hasCarry && gasingData.nodes.length > 1) ||
        (nodeDirectStr.length > 0 && nodeDirectStr !== finalRawStr && gasingData.nodes.length > 1))
  );

  if (gasingData && gasingData.nodes && gasingData.nodes.length > 0) {
    gasingData.nodes.forEach((node, i) => {
      if (node.carry && node.carry > 0) {
        stepSlots.push({
          id: `g_${i}_small`,
          type: 'small',
          colIndex: i,
          label: 'Angka kecil',
          expected: String(node.carry),
          maxLength: 1,
        });
        stepSlots.push({
          id: `g_${i}_base`,
          type: 'base',
          colIndex: i,
          label: 'Angka besar',
          expected: node.base,
          maxLength: Math.max(1, node.base.length),
        });
      } else if (needsMerge) {
        stepSlots.push({
          id: `g_${i}_base`,
          type: 'base',
          colIndex: i,
          label: 'Angka',
          expected: node.base,
          maxLength: Math.max(1, node.base.length),
        });
      }
    });
  }

  // Final Answer Slots
  const finalSlots: GasingInteractiveSlot[] = [];
  const rawAns = q.answerText || (gasingData ? gasingData.finalAnswer : '');
  const isRemainder = rawAns.toLowerCase().includes('sisa');

  let quotientStr = rawAns;
  let remainderStr = '';

  if (isRemainder) {
    const parts = rawAns.toLowerCase().split('sisa');
    quotientStr = (parts[0] || '').replace(/[^0-9]/g, '');
    remainderStr = (parts[1] || '').replace(/[^0-9]/g, '');
  } else {
    quotientStr = rawAns.replace(/[^0-9]/g, '');
  }

  if (quotientStr.length === 0) {
    quotientStr = '0';
  }

  // If question does NOT need merge, the slots under the problem ARE the final slots directly
  for (let j = 0; j < quotientStr.length; j++) {
    finalSlots.push({
      id: `final_${j}`,
      type: 'final',
      label: `Digit ${j + 1}`,
      expected: quotientStr[j],
      maxLength: 1,
    });
  }

  let sisaSlot: GasingInteractiveSlot | undefined = undefined;
  if (isRemainder && remainderStr) {
    sisaSlot = {
      id: 'sisa_0',
      type: 'sisa',
      label: 'Sisa Bagi',
      expected: remainderStr,
      maxLength: Math.max(1, remainderStr.length),
    };
  }

  // Slots available to input:
  // If single-digit with carry (e.g. 6+5): stepSlots has small + base
  // If needsMerge: stepSlots + finalSlots
  // If !needsMerge and no small numbers (e.g. 870+103): only finalSlots
  let slots: GasingInteractiveSlot[] = [];
  if (hasCarry && gasingData?.nodes.length === 1) {
    // e.g. 6 + 5: student enters small 1 and base 1, no Gabung row needed
    slots = [...stepSlots, ...(sisaSlot ? [sisaSlot] : [])];
  } else if (needsMerge) {
    slots = [...stepSlots, ...finalSlots, ...(sisaSlot ? [sisaSlot] : [])];
  } else {
    slots = [...finalSlots, ...(sisaSlot ? [sisaSlot] : [])];
  }

  return {
    gasingData,
    needsMerge,
    hasSmallNumbers: hasCarry,
    slots,
    stepSlots: (hasCarry && gasingData?.nodes.length === 1) || needsMerge ? stepSlots : [],
    finalSlots: hasCarry && gasingData?.nodes.length === 1 ? [] : finalSlots,
    sisaSlot,
  };
}
