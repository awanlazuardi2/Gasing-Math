/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OperationType, GasingMaterial, GASING_DATABASE } from '../types';

export interface CompletedMaterialRecord {
  operation: OperationType;
  materialId: string;
  materialCode: string;
  materialTitle: string;
  completedAt: string;
  score: number; // Jumlah jawaban benar
  totalQuestions: number;
  accuracyPercent: number;
  stars: number; // 1 - 3
}

export interface LastLearningActivity {
  operation: OperationType;
  materialId: string;
  materialCode: string;
  title: string;
  lastQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  accuracyPercent?: number;
  status: 'in_progress' | 'completed';
  updatedAt: string;
  nextMaterial?: {
    operation: OperationType;
    materialId: string;
    code: string;
    title: string;
  } | null;
}

export interface CurriculumProgressData {
  completedMaterials: Record<string, CompletedMaterialRecord>; // key: `${operation}:${materialId}`
  lastActivity: LastLearningActivity | null;
}

const STORAGE_KEY = 'gasing_curriculum_progress';
const LEGACY_KEY = 'gasing_last_activity';

const OPERATION_ORDER: OperationType[] = [
  'PENJUMLAHAN',
  'PENGURANGAN',
  'PERKALIAN',
  'PEMBAGIAN'
];

/**
 * Mendapatkan materi berikutnya sesuai urutan kurikulum GASING
 */
export function getNextCurriculumMaterial(
  operation: OperationType,
  currentMaterialId: string
): { operation: OperationType; materialId: string; code: string; title: string } | null {
  const materials = GASING_DATABASE[operation] || [];
  const currentIndex = materials.findIndex(m => m.id === currentMaterialId);

  if (currentIndex >= 0 && currentIndex < materials.length - 1) {
    const nextMat = materials[currentIndex + 1];
    return {
      operation,
      materialId: nextMat.id,
      code: nextMat.code,
      title: nextMat.title
    };
  }

  // Jika materi dalam operasi saat ini telah tuntas semua, arahkan ke materi pertama operasi selanjutnya
  const currentOpIndex = OPERATION_ORDER.indexOf(operation);
  if (currentOpIndex >= 0 && currentOpIndex < OPERATION_ORDER.length - 1) {
    const nextOp = OPERATION_ORDER[currentOpIndex + 1];
    const nextOpMaterials = GASING_DATABASE[nextOp] || [];
    if (nextOpMaterials.length > 0) {
      return {
        operation: nextOp,
        materialId: nextOpMaterials[0].id,
        code: nextOpMaterials[0].code,
        title: nextOpMaterials[0].title
      };
    }
  }

  return null;
}

/**
 * Membaca data progress kurikulum dari localStorage
 */
export function getCurriculumProgress(): CurriculumProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          completedMaterials: parsed.completedMaterials || {},
          lastActivity: parsed.lastActivity || null
        };
      }
    }

    // Migrasi atau fallback dari format legacy jika ada
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      try {
        const parsedLegacy = JSON.parse(legacy);
        if (parsedLegacy && parsedLegacy.title) {
          const op = (parsedLegacy.operation as OperationType) || 'PENJUMLAHAN';
          const matId = parsedLegacy.materialId || 'P1';
          const currentMat = GASING_DATABASE[op]?.find(m => m.id === matId);
          const answered = Math.round(((parsedLegacy.progressPercent || 4) / 100) * 25);

          return {
            completedMaterials: {},
            lastActivity: {
              operation: op,
              materialId: matId,
              materialCode: currentMat?.code || matId,
              title: currentMat?.title || parsedLegacy.title,
              lastQuestionIndex: Math.max(0, answered - 1),
              totalQuestions: 25,
              answeredCount: answered,
              accuracyPercent: parsedLegacy.progressPercent || 0,
              status: parsedLegacy.progressPercent >= 100 ? 'completed' : 'in_progress',
              updatedAt: new Date().toISOString()
            }
          };
        }
      } catch {}
    }
  } catch (err) {
    console.warn('Gagal membaca progress kurikulum GASING:', err);
  }

  return {
    completedMaterials: {},
    lastActivity: null
  };
}

/**
 * Menyimpan data progress kurikulum ke localStorage
 */
function saveCurriculumProgress(data: CurriculumProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Sinkronkan juga ringkasan ke legacy key agar kompatibel dengan widget lama jika ada
    if (data.lastActivity) {
      localStorage.setItem(
        LEGACY_KEY,
        JSON.stringify({
          title: data.lastActivity.title,
          operation: data.lastActivity.operation,
          materialId: data.lastActivity.materialId,
          progressPercent: data.lastActivity.status === 'completed' 
            ? 100 
            : Math.min(100, Math.round((data.lastActivity.answeredCount / Math.max(1, data.lastActivity.totalQuestions)) * 100))
        })
      );
    }
  } catch (err) {
    console.warn('Gagal menyimpan progress kurikulum GASING:', err);
  }
}

/**
 * Menyimpan progres sesi aktif (sedang mengerjakan latihan)
 */
export function recordSessionProgress(params: {
  operation: OperationType;
  materialId: string;
  lastQuestionIndex: number;
  answeredCount: number;
  totalQuestions: number;
  accuracyPercent?: number;
}): void {
  const currentProgress = getCurriculumProgress();
  const currentMat = GASING_DATABASE[params.operation]?.find(m => m.id === params.materialId);

  const updatedLastActivity: LastLearningActivity = {
    operation: params.operation,
    materialId: params.materialId,
    materialCode: currentMat?.code || params.materialId,
    title: currentMat?.title || `${params.operation} ${params.materialId}`,
    lastQuestionIndex: params.lastQuestionIndex,
    totalQuestions: params.totalQuestions,
    answeredCount: params.answeredCount,
    accuracyPercent: params.accuracyPercent,
    status: params.answeredCount >= params.totalQuestions ? 'completed' : 'in_progress',
    updatedAt: new Date().toISOString(),
    nextMaterial: getNextCurriculumMaterial(params.operation, params.materialId)
  };

  currentProgress.lastActivity = updatedLastActivity;
  saveCurriculumProgress(currentProgress);
}

/**
 * Mencatat materi yang berhasil diselesaikan oleh siswa (ketuntasan kurikulum)
 */
export function recordMaterialCompletion(params: {
  operation: OperationType;
  materialId: string;
  score: number;
  totalQuestions: number;
  accuracyPercent: number;
  stars: number;
}): void {
  const currentProgress = getCurriculumProgress();
  const currentMat = GASING_DATABASE[params.operation]?.find(m => m.id === params.materialId);
  const key = `${params.operation}:${params.materialId}`;

  const completionRecord: CompletedMaterialRecord = {
    operation: params.operation,
    materialId: params.materialId,
    materialCode: currentMat?.code || params.materialId,
    materialTitle: currentMat?.title || `${params.operation} ${params.materialId}`,
    completedAt: new Date().toISOString(),
    score: params.score,
    totalQuestions: params.totalQuestions,
    accuracyPercent: params.accuracyPercent,
    stars: params.stars
  };

  currentProgress.completedMaterials[key] = completionRecord;

  // Materi berikutnya sesuai alur kurikulum GASING
  const nextMat = getNextCurriculumMaterial(params.operation, params.materialId);

  currentProgress.lastActivity = {
    operation: params.operation,
    materialId: params.materialId,
    materialCode: currentMat?.code || params.materialId,
    title: currentMat?.title || `${params.operation} ${params.materialId}`,
    lastQuestionIndex: params.totalQuestions - 1,
    totalQuestions: params.totalQuestions,
    answeredCount: params.totalQuestions,
    accuracyPercent: params.accuracyPercent,
    status: 'completed',
    updatedAt: new Date().toISOString(),
    nextMaterial: nextMat
  };

  saveCurriculumProgress(currentProgress);
}

/**
 * Menghitung ringkasan statistik kurikulum untuk operasi tertentu atau keseluruhan
 */
export function getCurriculumStats(operation?: OperationType): {
  completedCount: number;
  totalCount: number;
  percent: number;
  completedKeys: string[];
} {
  const progress = getCurriculumProgress();
  
  if (operation) {
    const materials = GASING_DATABASE[operation] || [];
    const totalCount = materials.length;
    let completedCount = 0;
    const completedKeys: string[] = [];

    materials.forEach(mat => {
      const key = `${operation}:${mat.id}`;
      if (progress.completedMaterials[key]) {
        completedCount++;
        completedKeys.push(key);
      }
    });

    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return { completedCount, totalCount, percent, completedKeys };
  }

  // Keseluruhan 4 operasi dasar GASING
  let totalCount = 0;
  let completedCount = 0;
  const completedKeys: string[] = [];

  OPERATION_ORDER.forEach(op => {
    const materials = GASING_DATABASE[op] || [];
    totalCount += materials.length;
    materials.forEach(mat => {
      const key = `${op}:${mat.id}`;
      if (progress.completedMaterials[key]) {
        completedCount++;
        completedKeys.push(key);
      }
    });
  });

  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return { completedCount, totalCount, percent, completedKeys };
}
