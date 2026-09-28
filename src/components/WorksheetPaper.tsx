/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
  WorksheetHeaderData,
  GasingMaterial,
  OperationType,
  Question,
} from '../types';
import { WorksheetHeader } from './WorksheetHeader';
import P11GasingRenderer from './P11GasingRenderer';

export interface WorksheetPaperProps {
  headerData: WorksheetHeaderData;
  selectedMaterial: GasingMaterial;
  operation: OperationType;
  totalQuestions: number;
  questions: Question[];
  showAnswers: boolean;
  showNumbers: boolean;
  layoutColumns: number;
  p11Format?: 'vertikal' | 'horizontal';
  multiplicationFormat?: 'mendatar' | 'bersusun';
  containerId?: string;
  isInteractivePreview?: boolean;
}

export function paginateQuestions(
  questions: Question[] = [],
  selectedMaterial?: GasingMaterial,
  layoutColumns: number = 2,
  p11Format: 'vertikal' | 'horizontal' = 'vertikal'
): Question[][] {
  if (!questions || questions.length === 0) return [[]];
  if (!selectedMaterial) return [[]];

  const firstQ = questions[0];
  const format = firstQ?.displayFormat || 'horizontal';

  // 1. Custom visual materials
  if (selectedMaterial.id === 'P15' || format === 'tree_puzzle') {
    return questions.map((q) => [q]);
  }
  if (selectedMaterial.id === 'P14' || format === 'crossword_puzzle') {
    return questions.map((q) => [q]);
  }
  if (selectedMaterial.id === 'P13' || format === 'triangle_magic') {
    return chunkArray(questions, 4, 6);
  }
  if (selectedMaterial.id === 'P12' || format === 'balance_scale') {
    return chunkArray(questions, 2, 3);
  }
  if (selectedMaterial.id === 'P10' || format === 'grid_2x2') {
    return chunkArray(questions, 8, 10);
  }

  // 2. P11 GASING with coret notation
  if (selectedMaterial.id === 'P11') {
    if (p11Format === 'vertikal') {
      const p1 = layoutColumns === 1 ? 4 : layoutColumns === 2 ? 8 : 12;
      const pNext = layoutColumns === 1 ? 6 : layoutColumns === 2 ? 12 : 18;
      return chunkArray(questions, p1, pNext);
    }
  }

  // 3. Vertical math format
  if (format === 'vertical') {
    const p1 = layoutColumns === 1 ? 7 : layoutColumns === 2 ? 14 : 21;
    const pNext = layoutColumns === 1 ? 9 : layoutColumns === 2 ? 18 : 27;
    return chunkArray(questions, p1, pNext);
  }

  // 4. Repeated addition steps
  if (format === 'repeated_add_step') {
    return chunkArray(questions, 16, 22);
  }

  // 5. Standard horizontal format
  const p1 = layoutColumns === 1 ? 14 : layoutColumns === 2 ? 26 : 45;
  const pNext = layoutColumns === 1 ? 18 : layoutColumns === 2 ? 36 : 54;
  return chunkArray(questions, p1, pNext);
}

function chunkArray<T>(items: T[] = [], page1Size: number, pageNextSize: number): T[][] {
  const result: T[][] = [];
  if (!items || items.length === 0) return [[]];
  if (items.length <= page1Size) {
    result.push([...items]);
    return result;
  }

  result.push(items.slice(0, page1Size));
  let remaining = items.slice(page1Size);

  while (remaining.length > 0) {
    result.push(remaining.slice(0, pageNextSize));
    remaining = remaining.slice(pageNextSize);
  }

  return result;
}

export const WorksheetPaper: React.FC<WorksheetPaperProps> = ({
  headerData,
  selectedMaterial,
  operation,
  totalQuestions,
  questions = [],
  showAnswers,
  showNumbers,
  layoutColumns = 2,
  p11Format = 'vertikal',
  multiplicationFormat,
  containerId = 'paper-print-sheet',
  isInteractivePreview = false,
}) => {
  const safeQuestions = questions || [];
  const safePages = paginateQuestions(
    safeQuestions,
    selectedMaterial,
    layoutColumns,
    p11Format === 'horizontal' ? 'horizontal' : 'vertikal'
  ) || [[]];
  const pages = safePages.length > 0 ? safePages : [[]];

  // Check if answer key fits on the last question page:
  // For small tests (<= 26 questions horizontal), answers fit on Page 1 nicely.
  const isHorizontal =
    safeQuestions.length > 0 &&
    ['horizontal', 'repeated_add_step'].includes(safeQuestions[0]?.displayFormat || '');
  const canFitAnswersOnLastPage =
    showAnswers &&
    pages.length === 1 &&
    safeQuestions.length <= 26 &&
    isHorizontal;

  const needsSeparateAnswerPage = showAnswers && !canFitAnswersOnLastPage;
  const totalPagesCount = pages.length + (needsSeparateAnswerPage ? 1 : 0);

  return (
    <div id={containerId} className="flex flex-col items-center w-full">
      {pages.map((pageQuestions, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const isLastQuestionPage = pageIdx === pages.length - 1;

        return (
          <div
            key={`page-${pageIdx}`}
            id={`worksheet-page-${pageIdx + 1}`}
            className="a4-worksheet-page bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-300 p-10 text-left relative flex flex-col justify-between mb-8 last:mb-0 select-text"
            style={{
              width: '794px',
              minWidth: '794px',
              maxWidth: '794px',
              height: '1123px',
              minHeight: '1123px',
              maxHeight: '1123px',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* TOP HEADER SECTION */}
            <div className="flex flex-col">
              {isFirstPage ? (
                <WorksheetHeader
                  headerData={headerData}
                  selectedMaterial={selectedMaterial}
                  operation={operation}
                  totalQuestions={totalQuestions}
                />
              ) : (
                <div className="flex items-center justify-between pb-3 mb-5 border-b-2 border-slate-800 text-xs text-slate-700 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-800 font-mono bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {selectedMaterial.code}
                    </span>
                    <span className="font-bold text-slate-800 uppercase tracking-wide font-display">
                      {selectedMaterial.title}
                    </span>
                  </div>
                  <div className="font-medium text-slate-500">
                    {headerData.schoolName || 'Worksheet Matematika GASING'}
                  </div>
                </div>
              )}

              {/* QUESTIONS GRID */}
              <div
                className={`grid gap-x-8 ${
                  safeQuestions.length > 0 &&
                  ['horizontal', 'repeated_add_step'].includes(safeQuestions[0]?.displayFormat || '')
                    ? 'gap-y-3'
                    : 'gap-y-6'
                } ${
                  selectedMaterial?.id === 'P15'
                    ? 'grid-cols-1'
                    : layoutColumns === 1
                    ? 'grid-cols-1'
                    : layoutColumns === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
                }`}
              >
                {pageQuestions.map((q) => {
                  const isP11 = selectedMaterial.id === 'P11';
                  const displayAsVertical = q.displayFormat === 'vertical';
                  const questionTextToRender = q.questionText;
                  const extraValsToRender = q.digits?.extraNumbers || [];

                  // P11 Gasing (vertikal)
                  if (isP11 && p11Format === 'vertikal') {
                    return (
                      <div
                        key={q.id}
                        className="flex flex-col items-center justify-start p-2 border border-slate-200 rounded-lg bg-slate-50/40 min-h-[140px]"
                      >
                        <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 font-bold mb-1 border-b border-slate-200 pb-1">
                          {showNumbers ? <span>No. {q.id}</span> : <span />}
                          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                            P11
                          </span>
                        </div>
                        <div className="flex items-end justify-center gap-2 w-full my-auto">
                          <P11GasingRenderer
                            numbers={[q.digits?.a ?? 0, q.digits?.b ?? 0, ...extraValsToRender]}
                            layout="vertical"
                            showAnswers={showAnswers}
                            size="sm"
                          />
                          <div className="flex flex-col items-center justify-end pb-1 font-mono text-slate-400 font-bold text-sm">
                            <span>+</span>
                          </div>
                        </div>
                        <div className="w-full border-t border-slate-300 mt-1 pt-1 flex justify-center">
                          <div className="font-mono font-black text-slate-900 px-2 py-0.5 text-xs text-center min-w-[36px]">
                            {showAnswers ? (
                              <span className="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded">
                                = {q.answerText}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold">...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // P11 Gasing (horizontal)
                  if (isP11 && p11Format === 'horizontal') {
                    return (
                      <div
                        key={q.id}
                        className="flex items-center justify-between py-2 border-b border-slate-100 min-h-[44px]"
                      >
                        <div className="flex items-center gap-2">
                          {showNumbers && (
                            <span className="font-mono text-xs text-slate-400 font-bold w-6">
                              {q.id}.
                            </span>
                          )}
                          <P11GasingRenderer
                            numbers={[q.digits?.a ?? 0, q.digits?.b ?? 0, ...extraValsToRender]}
                            layout="horizontal"
                            showAnswers={showAnswers}
                            size="sm"
                          />
                        </div>
                        <div className="font-mono font-black text-slate-900 border-b-2 border-slate-200 px-2 py-0.5 text-sm min-w-[44px] text-center">
                          {showAnswers ? (
                            <span className="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded">
                              {q.answerText}
                            </span>
                          ) : (
                            <span className="text-transparent select-none">??</span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Standard Vertical format (bersusun)
                  if (displayAsVertical) {
                    const lines = questionTextToRender.split('\n');
                    const num1Str = lines[0] || '';
                    const num2Str = lines[1] || '';
                    const opSymbol =
                      operation === 'addition'
                        ? '+'
                        : operation === 'subtraction'
                        ? '-'
                        : '×';

                    return (
                      <div
                        key={q.id}
                        className="flex items-start justify-center gap-4 py-2 border-b border-slate-100 min-h-[90px]"
                      >
                        {showNumbers && (
                          <span className="font-mono text-xs text-slate-400 font-bold w-6 pt-1">
                            {q.id}.
                          </span>
                        )}
                        <div className="flex flex-col items-end font-mono text-base font-bold text-slate-800 pr-2">
                          <div className="tracking-widest">{num1Str}</div>
                          <div className="flex items-center justify-end gap-2 tracking-widest">
                            <span className="text-xs text-slate-400">{opSymbol}</span>
                            <span>{num2Str}</span>
                          </div>
                          <div className="w-full border-b-2 border-slate-800 my-1"></div>
                          <div className="font-mono font-black text-slate-900 pt-0.5 text-sm min-h-[24px]">
                            {showAnswers ? (
                              <span className="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded">
                                {q.answerText}
                              </span>
                            ) : (
                              <span className="text-transparent select-none">??</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Repeated addition step
                  if (q.displayFormat === 'repeated_add_step') {
                    return (
                      <div
                        key={q.id}
                        className="flex flex-col justify-center py-2 border-b border-slate-100 min-h-[56px]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {showNumbers && (
                              <span className="font-mono text-xs text-slate-400 font-bold w-6">
                                {q.id}.
                              </span>
                            )}
                            <span className="font-mono text-sm font-semibold text-slate-800">
                              {q.questionText}
                            </span>
                          </div>
                          <div className="font-mono font-black text-slate-900 border-b-2 border-slate-200 px-2 py-0.5 text-sm min-w-[44px] text-center">
                            {showAnswers ? (
                              <span className="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded">
                                {q.answerText}
                              </span>
                            ) : (
                              <span className="text-transparent select-none">??</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 2x2 Grid (grid_2x2)
                  if (q.displayFormat === 'grid_2x2' && q.digits?.gridData) {
                    const { cells, rowSums, colSums, missingIndices } = q.digits.gridData;
                    const [a, b, c, d] = cells;
                    const [row1, row2] = rowSums;
                    const [col1, col2] = colSums;
                    const aIsMissing = missingIndices.includes(0);
                    const bIsMissing = missingIndices.includes(1);
                    const cIsMissing = missingIndices.includes(2);
                    const dIsMissing = missingIndices.includes(3);
                    return (
                      <div
                        key={q.id}
                        className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl bg-slate-50/50"
                      >
                        <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 font-bold mb-2">
                          {showNumbers ? <span>No. {q.id}</span> : <span />}
                          <span className="text-[10px] text-indigo-600 font-bold uppercase">Matriks</span>
                        </div>
                        <div className="inline-grid grid-cols-3 gap-1 font-mono text-sm font-bold">
                          <div className="w-9 h-9 border border-slate-300 bg-white flex items-center justify-center rounded">
                            {!aIsMissing ? a : showAnswers ? <span className="text-indigo-600 font-bold">{a}</span> : '...'}
                          </div>
                          <div className="w-9 h-9 border border-slate-300 bg-white flex items-center justify-center rounded">
                            {!bIsMissing ? b : showAnswers ? <span className="text-indigo-600 font-bold">{b}</span> : '...'}
                          </div>
                          <div className="w-9 h-9 flex items-center justify-center text-slate-500 font-bold bg-slate-100 rounded">
                            = {row1}
                          </div>
                          <div className="w-9 h-9 border border-slate-300 bg-white flex items-center justify-center rounded">
                            {!cIsMissing ? c : showAnswers ? <span className="text-indigo-600 font-bold">{c}</span> : '...'}
                          </div>
                          <div className="w-9 h-9 border border-slate-300 bg-white flex items-center justify-center rounded">
                            {!dIsMissing ? d : showAnswers ? <span className="text-indigo-600 font-bold">{d}</span> : '...'}
                          </div>
                          <div className="w-9 h-9 flex items-center justify-center text-slate-500 font-bold bg-slate-100 rounded">
                            = {row2}
                          </div>
                          <div className="w-9 h-9 flex items-center justify-center text-slate-500 font-bold bg-slate-100 rounded">
                            = {col1}
                          </div>
                          <div className="w-9 h-9 flex items-center justify-center text-slate-500 font-bold bg-slate-100 rounded">
                            = {col2}
                          </div>
                          <div className="w-9 h-9" />
                        </div>
                      </div>
                    );
                  }

                  // Default Horizontal question
                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between py-2 border-b border-slate-100 min-h-[44px]"
                    >
                      <div className="flex items-center gap-2">
                        {showNumbers && (
                          <span className="font-mono text-xs text-slate-400 font-bold w-6">
                            {q.id}.
                          </span>
                        )}
                        <span className="font-mono text-sm font-semibold text-slate-800">
                          {questionTextToRender}
                        </span>
                      </div>
                      <div className="font-mono font-black text-slate-900 border-b-2 border-slate-200 px-2 py-0.5 text-sm min-w-[44px] text-center">
                        {showAnswers ? (
                          <span className="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded">
                            {q.answerText}
                          </span>
                        ) : (
                          <span className="text-transparent select-none">??</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FIT-ON-PAGE ANSWER KEY (if small worksheet) */}
              {isLastQuestionPage && canFitAnswersOnLastPage && (
                <div className="mt-8 pt-4 border-t-2 border-slate-800">
                  <div className="flex items-center justify-center gap-1.5 mb-3 text-xs font-bold text-slate-900 uppercase tracking-widest font-sans">
                    <span>🔑 Kunci Jawaban</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1.5">
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        className="border border-slate-300 rounded overflow-hidden bg-white text-center flex flex-col"
                      >
                        <div className="h-4 bg-slate-100 border-b border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 font-sans">
                          No. {q.id}
                        </div>
                        <div className="h-6 flex items-center justify-center text-xs font-black text-slate-900 font-sans">
                          {q.answerText}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM FOOTER */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-sans mt-auto">
              <span>Lembar Kerja Peserta Didik (LKPD) - GASING Matematika</span>
              <span>
                Halaman {pageIdx + 1} dari {totalPagesCount}
              </span>
            </div>
          </div>
        );
      })}

      {/* DEDICATED SEPARATE ANSWER KEY PAGE (for larger worksheets) */}
      {needsSeparateAnswerPage && (
        <div
          id={`worksheet-page-${totalPagesCount}`}
          className="a4-worksheet-page bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-300 p-10 text-left relative flex flex-col justify-between mb-8 last:mb-0 select-text"
          style={{
            width: '794px',
            minWidth: '794px',
            maxWidth: '794px',
            height: '1123px',
            minHeight: '1123px',
            maxHeight: '1123px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-slate-800 text-xs text-slate-700 font-sans">
              <div className="flex items-center gap-2">
                <span className="font-black text-emerald-800 font-mono bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {selectedMaterial.code}
                </span>
                <span className="font-bold text-slate-800 uppercase tracking-wide font-display">
                  KUNCI JAWABAN — {selectedMaterial.title}
                </span>
              </div>
              <div className="font-medium text-slate-500">
                {headerData.schoolName || 'Worksheet Matematika GASING'}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-xl">🔑</span>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest text-center font-display">
                KUNCI JAWABAN LENGKAP ({safeQuestions.length} Butir Soal)
              </h3>
            </div>

            <div className="grid grid-cols-10 gap-2">
              {safeQuestions.map((q) => (
                <div
                  key={q.id}
                  className="border border-slate-300 rounded overflow-hidden bg-white text-center flex flex-col shadow-2xs"
                >
                  <div className="h-5 bg-slate-100 border-b border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 font-sans">
                    No. {q.id}
                  </div>
                  <div className="h-8 flex items-center justify-center text-xs font-black text-slate-900 font-sans">
                    {q.answerText}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-sans mt-auto">
            <span>Lembar Kerja Peserta Didik (LKPD) - GASING Matematika</span>
            <span>
              Halaman {totalPagesCount} dari {totalPagesCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
