/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import {
  GASING_DATABASE,
  OperationType,
  GasingMaterial,
  Question,
  WorksheetConfig,
  WorksheetHeaderData,
  PracticeAnswerItem
} from './types';
import { generateGasingWorksheet } from './utils/gasingGenerator';
import { getGasingPedagogy } from './utils/gasingPedagogy';
import { calculateGasingSteps, getQuestionInteractiveSlots } from './utils/gasingCalculator';
import GasingGuide from './components/GasingGuide';
import GasingDynamicVisualizer from './components/GasingDynamicVisualizer';
import P11GasingRenderer from './components/P11GasingRenderer';
import WorksheetHeader from './components/WorksheetHeader';
import WorksheetHeaderConfig from './components/WorksheetHeaderConfig';
import { WorksheetPaper } from './components/WorksheetPaper';
import { exportWorksheetToPdf } from './utils/pdfGenerator';
import { FullscreenPreviewModal } from './components/FullscreenPreviewModal';
import { PracticeQuestionCard } from './components/PracticeQuestionCard';
import { PracticeKeypad } from './components/PracticeKeypad';
import { PracticeHeaderBanner } from './components/PracticeHeaderBanner';
import { PracticePlaygroundHome } from './components/PracticePlaygroundHome';
import { PracticeFlashcardArena } from './components/PracticeFlashcardArena';
import { PracticeGridArena } from './components/PracticeGridArena';
import { PracticeSettingsModal } from './components/PracticeSettingsModal';
import { PracticeBadgesModal } from './components/PracticeBadgesModal';
import { PracticeStoryModal } from './components/PracticeStoryModal';
import { CompetitionModal } from './components/CompetitionModal';
import { OnboardingRoleHero, UserRole } from './components/OnboardingRoleHero';
import { KidsTopBar } from './components/KidsTopBar';
import { playSuccessStar, playGentleTryAgain, playBubblePop } from './utils/soundEffects';
import { recordSessionProgress, recordMaterialCompletion } from './utils/progressTracker';
import {
  ArrowLeft,
  Calculator,
  Printer,
  RotateCcw,
  Sparkles,
  Award,
  Zap,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Clock,
  List,
  Grid,
  ChevronRight,
  Info,
  Calendar,
  ThumbsUp,
  Download,
  AlertCircle,
  TrendingUp,
  Play,
  ExternalLink, X, Star, GraduationCap, Settings,
  ZoomIn, ZoomOut, Maximize2, Minimize2,
  Users,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


// Practice question card component is modularized in PracticeQuestionCard.tsx
const GridCell = PracticeQuestionCard;

export default function App() {
  // --- Standard Configuration States ---
  const [operation, setOperation] = useState<OperationType>('PENJUMLAHAN');
  const [materialId, setMaterialId] = useState<string>('P1');
  const [totalQuestions, setTotalQuestions] = useState<25 | 50 | 100 | 150 | 200>(25);
  const [layoutColumns, setLayoutColumns] = useState<1 | 2 | 3>(2);
  const [showAnswers, setShowAnswers] = useState<boolean>(true);
  const [randomLevel, setRandomLevel] = useState<'Rendah' | 'Sedang' | 'Tinggi'>('Sedang');
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [pedagogyTab, setPedagogyTab] = useState<'philosophy' | 'steps' | 'tips'>('steps');
  const [multiplicationFormat, setMultiplicationFormat] = useState<'mendatar' | 'bersusun'>('mendatar');
  const [p11Format, setP11Format] = useState<'vertikal' | 'horizontal'>('vertikal');
  const [k3AbstrakTab, setK3AbstrakTab] = useState<'tanpa_menukar' | 'menukar'>('tanpa_menukar');
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('gasing_onboarding_dismissed') !== 'true';
    } catch {
      return true;
    }
  });
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(() => {
    try {
      return (sessionStorage.getItem('gasing_selected_role') as UserRole) || null;
    } catch {
      return null;
    }
  });
  const [showCompetitionModal, setShowCompetitionModal] = useState<boolean>(false);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    try {
      sessionStorage.setItem('gasing_selected_role', role);
      sessionStorage.setItem('gasing_onboarding_dismissed', 'true');
    } catch {}
    setShowOnboarding(false);

    if (role === 'student') {
      setActiveTab('practice');
      setShowCompetitionModal(false);
    } else if (role === 'teacher') {
      setActiveTab('printable');
    } else if (role === 'parent') {
      setActiveTab('about');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseCompetitionModal = () => {
    setShowCompetitionModal(false);
    try {
      sessionStorage.setItem('gasing_comp_modal_dismissed', 'true');
    } catch {}
  };
  const [headerData, setHeaderData] = useState<WorksheetHeaderData>(() => {
    const defaultData: WorksheetHeaderData = {
      schoolName: 'MIN 3 LAMONGAN',
      schoolSubtext: 'Kecamatan Paciran, Kabupaten Lamongan',
      academicYear: '',
      timeAllocation: '',
      teacherName: '',
      logoType: 'preset:kemenag',
      customLogoUrl: '',
      instructionText: '',
      headerStyle: 'kedinasan',
    };

    try {
      const saved = localStorage.getItem('gasing_worksheet_header_data');
      if (saved) {
        return { ...defaultData, ...JSON.parse(saved) };
      }
      const legacySchool = localStorage.getItem('gasing_school_name');
      if (legacySchool && legacySchool.trim()) {
        return { ...defaultData, schoolName: legacySchool };
      }
    } catch {
      // ignore
    }
    return defaultData;
  });

  useEffect(() => {
    try {
      localStorage.setItem('gasing_worksheet_header_data', JSON.stringify(headerData));
      localStorage.setItem('gasing_school_name', headerData.schoolName);
    } catch {}
  }, [headerData]);

  const schoolName = headerData.schoolName;

  // --- Generated Worksheet State ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'printable' | 'practice' | 'about' | 'settings'>('printable');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false);
  const paperWrapperRef = useRef<HTMLDivElement>(null);
  const paperSheetRef = useRef<HTMLDivElement>(null);
  const [inlineScale, setInlineScale] = useState<number>(1);
  const [paperActualHeight, setPaperActualHeight] = useState<number>(1155);

  // Measure container and dynamically scale A4 paper on mobile/tablet screens
  useEffect(() => {
    const handleResize = () => {
      if (paperWrapperRef.current) {
        const containerWidth = paperWrapperRef.current.clientWidth;
        // On small screens, fit with comfortable margin
        const availableWidth = Math.max(containerWidth - 8, 200);
        if (availableWidth < 794) {
          setInlineScale(availableWidth / 794);
        } else {
          setInlineScale(1);
        }
      }
      if (paperSheetRef.current) {
        setPaperActualHeight(paperSheetRef.current.offsetHeight || 1155);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(handleResize);
      if (paperWrapperRef.current) ro.observe(paperWrapperRef.current);
      if (paperSheetRef.current) ro.observe(paperSheetRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [activeTab, questions, showAnswers]);

  // --- Live Flashcard Practicing Mode States ---
  const [flashcardMode, setFlashcardMode] = useState<'single' | 'grid'>('grid');
  const [showConceptGuide, setShowConceptGuide] = useState<boolean>(false);
  const [showGasingSteps, setShowGasingSteps] = useState<boolean>(true);
  const [practiceActive, setPracticeActive] = useState<boolean>(false);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState<number>(0);
  const [practiceInput, setPracticeInput] = useState<string>('');
  const [practiceSisaInput, setPracticeSisaInput] = useState<string>(''); // For remainder division
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, PracticeAnswerItem>>({});
  
  // --- Grid Practice States ---
  const [activeGridIndex, setActiveGridIndex] = useState<number>(0);
  const [activeGridPart, setActiveGridPart] = useState<'val' | 'sisa'>('val');
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingIndex, setGradingIndex] = useState<number>(-1);
  const [practiceStartTime, setPracticeStartTime] = useState<number>(0);
  const [practiceElapsed, setPracticeElapsed] = useState<number>(0);
  const [practiceEnded, setPracticeEnded] = useState<boolean>(false);
  const [practiceTimings, setPracticeTimings] = useState<number[]>([]); // hold ms per question
  const [practiceQuestionStartTime, setPracticeQuestionStartTime] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [questionAttempts, setQuestionAttempts] = useState<number>(0);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [flashcardState, setFlashcardState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Modals for Playground & Practice
  const [showPracticeSettingsModal, setShowPracticeSettingsModal] = useState<boolean>(false);
  const [showBadgesModal, setShowBadgesModal] = useState<boolean>(false);
  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);

  // Input ref to keep focus during flashcard mode
  const practiceInputRef = useRef<HTMLInputElement>(null);

  // --- Saved Worksheets History ---
  const [savedConfigs, setSavedConfigs] = useState<Array<{ id: string; name: string; date: string; config: WorksheetConfig }>>([]);



  // Load the first available material whenever the operation changes
  useEffect(() => {
    const materials = GASING_DATABASE[operation];
    if (materials && materials.length > 0) {
      // Find matching material or pick first
      const hasMatch = materials.some(m => m.id === materialId);
      if (!hasMatch) {
         setMaterialId(materials[0].id);
      }
    }
  }, [operation]);

  // Handle Worksheet Generation
  const handleGenerate = () => {
    const config: WorksheetConfig = {
      operation,
      materialId,
      totalQuestions,
      layoutColumns,
      showAnswers,
      randomLevel,
      showNumbers,
      multiplicationFormat,
      p11Format
    };
    const generated = generateGasingWorksheet(config);
    setQuestions(generated);

    // Reset practice module states
    setPracticeActive(false);
    setPracticeEnded(false);
    setPracticeAnswers({});
    setCurrentPracticeIndex(0);
    setPracticeInput('');
    setPracticeSisaInput('');
  };

  // Generate initially on mount, or whenever key config shifts
  useEffect(() => {
    handleGenerate();
  }, [operation, materialId, totalQuestions, randomLevel, showNumbers, multiplicationFormat, p11Format]);

  // Load saved configurations from localstorage
  useEffect(() => {
    const stored = localStorage.getItem('gasing_saved_configs');
    if (stored) {
      try {
        setSavedConfigs(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Track active learning session progress dynamically
  useEffect(() => {
    if (practiceActive && !practiceEnded && questions.length > 0) {
      const answeredCount = Object.keys(practiceAnswers).length;
      if (answeredCount > 0) {
        recordSessionProgress({
          operation,
          materialId,
          lastQuestionIndex: currentPracticeIndex,
          answeredCount,
          totalQuestions: questions.length
        });
      }
    }
  }, [practiceAnswers, currentPracticeIndex, practiceActive, practiceEnded, operation, materialId, questions.length]);

  // Save current worksheet config in localStorage history
  const handleSaveConfig = () => {
    const currentMat = GASING_DATABASE[operation].find(m => m.id === materialId);
    const newConfigItem = {
      id: Date.now().toString(),
      name: `${currentMat?.code || materialId} - ${currentMat?.title || 'Worksheet'} (${totalQuestions} Soal)`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      config: {
        operation,
        materialId,
        totalQuestions,
        layoutColumns,
        showAnswers,
        randomLevel,
        showNumbers
      }
    };
    const updated = [newConfigItem, ...savedConfigs].slice(0, 8); // maximum 8 items
    setSavedConfigs(updated);
    localStorage.setItem('gasing_saved_configs', JSON.stringify(updated));
  };

  const handleLoadSavedConfig = (saved: WorksheetConfig) => {
    setOperation(saved.operation);
    setMaterialId(saved.materialId);
    setTotalQuestions(saved.totalQuestions);
    setLayoutColumns(saved.layoutColumns);
    setShowAnswers(saved.showAnswers);
    setRandomLevel(saved.randomLevel);
    setShowNumbers(saved.showNumbers);
    setActiveTab('printable');
  };

  const handleDeleteSavedConfig = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedConfigs.filter(item => item.id !== id);
    setSavedConfigs(updated);
    localStorage.setItem('gasing_saved_configs', JSON.stringify(updated));
  };


  // --- Practice Simulation Logic ---
  const startPractice = () => {
    setPracticeAnswers({});
    setPracticeTimings([]);
    setCurrentPracticeIndex(0);
    setPracticeActive(true);
    setPracticeEnded(false);
    setPracticeInput('');
    setPracticeSisaInput('');
    setStreak(0);
    setBestStreak(0);
    setStarsEarned(0);
    setQuestionAttempts(0);
    setFirstTryCorrectCount(0);
    setRetryCount(0);
    setFlashcardState('idle');
    const now = Date.now();
    setPracticeStartTime(now);
    setPracticeQuestionStartTime(now);
    setPracticeElapsed(0);
  };

  const startFlashcardPractice = () => {
    setFlashcardMode('single');
    startPractice();
  };

  const startGridPractice = () => {
    setFlashcardMode('grid');
    setPracticeAnswers({});
    setPracticeTimings([]);
    setPracticeActive(true);
    setPracticeEnded(false);
    setActiveGridIndex(0);
    setActiveGridPart('val');
    setIsGrading(false);
    setGradingIndex(-1);
    const now = Date.now();
    setPracticeStartTime(now);
    setPracticeElapsed(0);
    const firstQ = questions[0];
    if (firstQ) {
      const { slots } = getQuestionInteractiveSlots(firstQ);
      if (slots.length > 0) {
        setPracticeAnswers({
          [firstQ.id]: { val: '', sisa: '', gasingInputs: {}, activeSlotId: slots[0].id }
        });
      }
    }
  };

  // Live stopwatch effect for elapsed time
  useEffect(() => {
    let interval: any;
    if (practiceActive && !practiceEnded) {
      interval = setInterval(() => {
        setPracticeElapsed(Math.floor((Date.now() - practiceStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [practiceActive, practiceEnded, practiceStartTime]);

  // Focus input automatically during Flashcard mode
  useEffect(() => {
    if (practiceActive && !practiceEnded && flashcardMode === 'single' && practiceInputRef.current) {
      practiceInputRef.current.focus();
    }
  }, [currentPracticeIndex, practiceActive, practiceEnded, flashcardMode]);

  const activeQuestion = questions[currentPracticeIndex];
  const isRemainderDivision = activeQuestion && activeQuestion.answerText.includes(' sisa ');

  const handleAnswerSubmit = (e?: React.FormEvent | string, overrideVal?: string) => {
    let finalVal = practiceInput;
    if (typeof e === 'string') {
      finalVal = e;
    } else if (overrideVal !== undefined) {
      finalVal = overrideVal;
    } else if (e && 'preventDefault' in e) {
      e.preventDefault();
    }

    if (!activeQuestion) return;
    if (flashcardState !== 'idle') return; // Prevent double submit during animation
    if (!finalVal.trim()) return; // Don't submit empty

    const now = Date.now();
    const timeSpentMs = now - practiceQuestionStartTime;

    // Evaluate correctness
    const isCorrect = activeQuestion.answerText === finalVal.trim()
        && (!isRemainderDivision || activeQuestion.sisaText === practiceSisaInput.trim());

    if (isCorrect) {
      playSuccessStar();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
      }
      setStarsEarned(prev => prev + 1);

      if (questionAttempts === 0) {
        setFirstTryCorrectCount(prev => prev + 1);
      } else {
        setRetryCount(prev => prev + 1);
      }

      // Record Answer
      const updatedAnswers = {
        ...practiceAnswers,
        [activeQuestion.id]: { val: finalVal, sisa: practiceSisaInput }
      };
      setPracticeAnswers(updatedAnswers);
      setFlashcardState('correct');

      // Berikan jeda reward 1500ms agar anak sempat melihat apresiasi, konfirmasi jawaban, bintang, dan combo
      setTimeout(() => {
        setFlashcardState('idle');
        setQuestionAttempts(0);
        setActiveGridIndex(0);
        setActiveGridPart('val');
        setIsGrading(false);
        setGradingIndex(-1);
        setPracticeTimings(prev => [...prev, timeSpentMs]);
        
        if (currentPracticeIndex < questions.length - 1) {
          setCurrentPracticeIndex(currentPracticeIndex + 1);
          setPracticeInput('');
          setPracticeSisaInput('');
          setPracticeQuestionStartTime(Date.now());
        } else {
          setPracticeEnded(true);
          setPracticeActive(false);
        }
      }, 1500);
    } else {
      // JAWABAN SALAH / KESEMPATAN KEDUA: Nada ramah, refleksi, coba lagi tanpa hukuman
      playGentleTryAgain();
      setStreak(0);
      setQuestionAttempts(prev => prev + 1);
      setFlashcardState('wrong');

      setTimeout(() => {
        setFlashcardState('idle');
        setPracticeInput('');
      }, 1100);
    }
  };

  // Instant practice skip/reset

  // --- Grid Practice Logic ---
  
  // Auto-scroll when active grid index changes
  useEffect(() => {
    if (practiceActive && flashcardMode === 'grid' && !isGrading) {
      const el = document.getElementById(`grid-cell-${activeGridIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeGridIndex, practiceActive, flashcardMode, isGrading]);

  // Grading animation effect
  useEffect(() => {
    if (isGrading && gradingIndex < questions.length) {
      const timer = setTimeout(() => {
        setGradingIndex(prev => prev + 1);
      }, 150); // fast cascade
      return () => clearTimeout(timer);
    } else if (isGrading && gradingIndex >= questions.length) {
      // Done grading
      setTimeout(() => {
        setPracticeEnded(true);
        setPracticeActive(false);
        setIsGrading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
    }
  }, [isGrading, gradingIndex, questions.length]);

  const startGrading = () => {
    setIsGrading(true);
    setGradingIndex(-1);
  };

  const checkQuestionCorrectness = (
    q: Question,
    ansObj: PracticeAnswerItem | undefined,
    isRemainder: boolean
  ): boolean => {
    if (!ansObj) return false;

    const normVal = (ansObj.val || '').trim().replace(/\./g, '').toLowerCase();
    const normAns = q.answerText.trim().replace(/\./g, '').toLowerCase();

    if (isRemainder) {
      const full = `${normVal} sisa ${(ansObj.sisa || '').trim()}`.toLowerCase();
      if (full === normAns) return true;
    } else if (normVal && normVal === normAns) {
      return true;
    }

    // Check if answered via small carry + base slots (e.g. 6+5 where small=1, base=1)
    if (ansObj.gasingInputs) {
      const small0 = ansObj.gasingInputs['g_0_small'] || '';
      const base0 = ansObj.gasingInputs['g_0_base'] || '';
      if (small0 && base0 && `${small0}${base0}` === normAns) {
        return true;
      }
      const { stepSlots, gasingData, needsMerge } = getQuestionInteractiveSlots(q);
      if (gasingData && gasingData.finalAnswer.replace(/\./g, '').toLowerCase() === normAns) {
        if (stepSlots.length > 0) {
          const allStepsMatch = stepSlots.every(st => {
            const val = ansObj.gasingInputs?.[st.id];
            if (!val) return false;
            if (st.expected && val !== st.expected) return false;
            return true;
          });
          // If the question does not need merge (e.g. single-digit 6+5), matching all step slots is sufficient
          if (!needsMerge && allStepsMatch) return true;
        }
      }
    }

    return false;
  };

  const handleAutoMerge = (idxToMerge: number) => {
    const targetQ = questions[idxToMerge];
    if (!targetQ) return;
    const { gasingData, stepSlots, sisaSlot } = getQuestionInteractiveSlots(targetQ);
    if (!gasingData) return;

    setPracticeAnswers(prev => {
      const curr = prev[targetQ.id] || { val: '', sisa: '', gasingInputs: {} };
      const updatedInputs = { ...(curr.gasingInputs || {}) };

      stepSlots.forEach(st => {
        if (st.expected) {
          updatedInputs[st.id] = st.expected;
        }
      });

      return {
        ...prev,
        [targetQ.id]: {
          ...curr,
          val: gasingData.finalAnswer,
          sisa: sisaSlot?.expected || curr.sisa,
          gasingInputs: updatedInputs,
          activeSlotId: 'final_0'
        }
      };
    });
  };

  const handleGridNumpad = (key: string) => {
    if (!practiceActive || isGrading || flashcardMode !== 'grid') return;
    
    const activeQ = questions[activeGridIndex];
    if (!activeQ) return;

    const { slots } = getQuestionInteractiveSlots(activeQ);
    
    setPracticeAnswers(prev => {
      const curr = prev[activeQ.id] || { val: '', sisa: '', gasingInputs: {} };
      const currentSlotId =
        curr.activeSlotId ||
        (slots.length > 0 ? slots[0].id : (activeGridPart === 'sisa' ? 'sisa_0' : 'final_0'));
      const activeSlot = slots.find(s => s.id === currentSlotId) || slots[0];
      
      if (key === 'ClearAll') {
        return {
          ...prev,
          [activeQ.id]: {
            val: '',
            sisa: '',
            gasingInputs: {},
            activeSlotId: slots[0]?.id || 'final_0'
          }
        };
      } else if (key === 'Backspace') {
        if (activeSlot && activeSlot.id.startsWith('g_')) {
          const currentSlotVal = curr.gasingInputs?.[activeSlot.id] || '';
          if (currentSlotVal.length > 0) {
            const updatedInputs = {
              ...(curr.gasingInputs || {}),
              [activeSlot.id]: currentSlotVal.slice(0, -1)
            };
            return {
              ...prev,
              [activeQ.id]: { ...curr, gasingInputs: updatedInputs }
            };
          } else {
            // Backtrack to previous slot
            const currIdx = slots.findIndex(s => s.id === activeSlot.id);
            if (currIdx > 0) {
              return {
                ...prev,
                [activeQ.id]: { ...curr, activeSlotId: slots[currIdx - 1].id }
              };
            }
          }
        } else if (activeSlot && activeSlot.id.startsWith('sisa')) {
          return {
            ...prev,
            [activeQ.id]: { ...curr, sisa: (curr.sisa || '').slice(0, -1) }
          };
        } else {
          if (curr.val.length > 0) {
            return {
              ...prev,
              [activeQ.id]: { ...curr, val: curr.val.slice(0, -1) }
            };
          } else {
            const currIdx = slots.findIndex(s => s.id === activeSlot?.id);
            if (currIdx > 0) {
              return {
                ...prev,
                [activeQ.id]: { ...curr, activeSlotId: slots[currIdx - 1].id }
              };
            }
          }
        }
        return prev;
      } else if (key === 'Enter') {
        return prev; // Navigation handled below
      } else if (/[0-9]/.test(key)) {
        if (activeSlot && activeSlot.id.startsWith('g_')) {
          const currSlotVal = curr.gasingInputs?.[activeSlot.id] || '';
          const maxLen = activeSlot.maxLength || 1;
          if (currSlotVal.length < maxLen) {
            const newSlotVal = currSlotVal + key;
            const updatedInputs = {
              ...(curr.gasingInputs || {}),
              [activeSlot.id]: newSlotVal
            };

            // Auto-advance to next slot if this slot reached max length
            let nextSlotId = activeSlot.id;
            const currSlotIdx = slots.findIndex(s => s.id === activeSlot.id);
            if (newSlotVal.length >= maxLen && currSlotIdx < slots.length - 1) {
              nextSlotId = slots[currSlotIdx + 1].id;
            }

            // Check if single-digit carry addition (e.g. 6+5: small=1, base=1 -> val='11')
            let updatedVal = curr.val;
            const stepSlots = slots.filter(s => s.id.startsWith('g_'));
            const allStepsFilled = stepSlots.length > 0 && stepSlots.every(s => (updatedInputs[s.id] || '').length >= s.maxLength);
            const hasFinalSlots = slots.some(s => s.id.startsWith('final'));

            if (!hasFinalSlots && allStepsFilled) {
              const smallVal = updatedInputs['g_0_small'] || '';
              const baseVal = updatedInputs['g_0_base'] || '';
              if (smallVal && baseVal) {
                updatedVal = `${smallVal}${baseVal}`;
              }
            }

            return {
              ...prev,
              [activeQ.id]: {
                ...curr,
                val: updatedVal,
                gasingInputs: updatedInputs,
                activeSlotId: nextSlotId
              }
            };
          }
        } else if (activeSlot && activeSlot.id.startsWith('sisa')) {
          if ((curr.sisa || '').length < 6) {
            return {
              ...prev,
              [activeQ.id]: { ...curr, sisa: (curr.sisa || '') + key }
            };
          }
        } else {
          // Final answer slot
          if (curr.val.length < 8) {
            const fIdxMatch = activeSlot?.id?.match(/^final_(\d+)$/);
            let newVal = curr.val || '';
            if (fIdxMatch) {
              const fIdx = parseInt(fIdxMatch[1], 10);
              const valArr = (curr.val || '').split('');
              while (valArr.length < fIdx) {
                valArr.push(' ');
              }
              valArr[fIdx] = key;
              newVal = valArr.join('').trimEnd();
            } else {
              newVal = (curr.val || '') + key;
            }

            const currSlotIdx = slots.findIndex(s => s.id === activeSlot?.id);
            let nextSlotId = activeSlot?.id;
            // Advance to next slot in current question if available
            if (activeSlot && currSlotIdx >= 0 && currSlotIdx < slots.length - 1) {
              nextSlotId = slots[currSlotIdx + 1].id;
            }
            return {
              ...prev,
              [activeQ.id]: {
                ...curr,
                val: newVal,
                activeSlotId: nextSlotId
              }
            };
          }
        }
      }
      return prev;
    });

    // Advance slot inside current question on Enter - NEVER jump unexpectedly to next question
    if (key === 'Enter') {
      const currAns = practiceAnswers[activeQ.id];
      const currentSlotId = currAns?.activeSlotId || (slots.length > 0 ? slots[0].id : 'final_0');
      const currSlotIdx = slots.findIndex(s => s.id === currentSlotId);

      if (currSlotIdx >= 0 && currSlotIdx < slots.length - 1) {
        // Advance to next slot in current question
        const nextSlot = slots[currSlotIdx + 1];
        setPracticeAnswers(prev => ({
          ...prev,
          [activeQ.id]: {
            ...(prev[activeQ.id] || { val: '', sisa: '', gasingInputs: {} }),
            activeSlotId: nextSlot.id
          }
        }));
        if (nextSlot.id.startsWith('sisa')) {
          setActiveGridPart('sisa');
        } else {
          setActiveGridPart('val');
        }
      } else if (currSlotIdx < 0 && slots.length > 0) {
        // Reset to first slot of current question if slotId wasn't found
        setPracticeAnswers(prev => ({
          ...prev,
          [activeQ.id]: {
            ...(prev[activeQ.id] || { val: '', sisa: '', gasingInputs: {} }),
            activeSlotId: slots[0].id
          }
        }));
      }
    }
  };

  // Keyboard listener for grid mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!practiceActive || isGrading || flashcardMode !== 'grid') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const activeQ = questions[activeGridIndex];
        if (activeQ) {
          const { slots } = getQuestionInteractiveSlots(activeQ);
          const currAns = practiceAnswers[activeQ.id];
          const currentSlotId = currAns?.activeSlotId || (slots[0]?.id);
          const currSlotIdx = slots.findIndex(s => s.id === currentSlotId);
          // Navigate to previous slot within the same question first
          if (currSlotIdx > 0) {
            const prevSlot = slots[currSlotIdx - 1];
            setPracticeAnswers(prev => ({
              ...prev,
              [activeQ.id]: {
                ...(prev[activeQ.id] || { val: '', sisa: '', gasingInputs: {} }),
                activeSlotId: prevSlot.id
              }
            }));
            if (prevSlot.id.startsWith('sisa')) setActiveGridPart('sisa');
            else setActiveGridPart('val');
            return;
          }
        }
        // At the first slot: move to previous question
        if (activeGridIndex > 0) {
          const prevQ = questions[activeGridIndex - 1];
          const { slots: prevSlots } = getQuestionInteractiveSlots(prevQ);
          setActiveGridIndex(activeGridIndex - 1);
          setActiveGridPart('val');
          if (prevSlots.length > 0) {
            setPracticeAnswers(prev => ({
              ...prev,
              [prevQ.id]: {
                ...(prev[prevQ.id] || { val: '', sisa: '', gasingInputs: {} }),
                activeSlotId: prevSlots[0].id
              }
            }));
          }
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const activeQ = questions[activeGridIndex];
        if (activeQ) {
          const { slots } = getQuestionInteractiveSlots(activeQ);
          const currAns = practiceAnswers[activeQ.id];
          const currentSlotId = currAns?.activeSlotId || (slots[0]?.id);
          const currSlotIdx = slots.findIndex(s => s.id === currentSlotId);
          // Navigate to next slot within the same question first
          if (currSlotIdx >= 0 && currSlotIdx < slots.length - 1) {
            const nextSlot = slots[currSlotIdx + 1];
            setPracticeAnswers(prev => ({
              ...prev,
              [activeQ.id]: {
                ...(prev[activeQ.id] || { val: '', sisa: '', gasingInputs: {} }),
                activeSlotId: nextSlot.id
              }
            }));
            if (nextSlot.id.startsWith('sisa')) setActiveGridPart('sisa');
            else setActiveGridPart('val');
            return;
          }
        }
        // At the last slot: move to next question
        if (activeGridIndex < questions.length - 1) {
          const nextQ = questions[activeGridIndex + 1];
          const { slots: nextSlots } = getQuestionInteractiveSlots(nextQ);
          setActiveGridIndex(activeGridIndex + 1);
          setActiveGridPart('val');
          if (nextSlots.length > 0) {
            setPracticeAnswers(prev => ({
              ...prev,
              [nextQ.id]: {
                ...(prev[nextQ.id] || { val: '', sisa: '', gasingInputs: {} }),
                activeSlotId: nextSlots[0].id
              }
            }));
          }
        }
      } else if (/[0-9]/.test(e.key) || e.key === 'Backspace' || e.key === 'Enter') {
        e.preventDefault();
        handleGridNumpad(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [practiceActive, isGrading, flashcardMode, activeGridIndex, activeGridPart, questions, practiceAnswers]);

  const handleResetPractice = () => {
    setPracticeActive(false);
    setPracticeEnded(false);
    setPracticeAnswers({});
    setCurrentPracticeIndex(0);
    setPracticeInput('');
    setPracticeSisaInput('');
    setPracticeTimings([]);
    setPracticeElapsed(0);
    setStreak(0);
    setBestStreak(0);
    setStarsEarned(0);
    setQuestionAttempts(0);
    setFirstTryCorrectCount(0);
    setRetryCount(0);
    setFlashcardState('idle');
    setActiveGridIndex(0);
    setActiveGridPart('val');
    setIsGrading(false);
    setGradingIndex(-1);
  };

  // Calculations for Reflex Metrics
  const calculatedStats = () => {
    let correctCount = 0;
    questions.forEach(q => {
      const userAnsObj = practiceAnswers[q.id];
      if (checkQuestionCorrectness(q, userAnsObj, isRemainderDivision)) {
        correctCount++;
      }
    });

    const averageReflexMs = practiceTimings.length > 0 
      ? practiceTimings.reduce((s, x) => s + x, 0) / practiceTimings.length
      : 0;

    const averageReflexSec = (averageReflexMs / 1000).toFixed(2);
    const accuracyPercent = Math.round((correctCount / questions.length) * 100);

    // Gamification & Star System
    let stars = 0;
    let message = 'Ayo Semangat Latihan Lagi! 🌱';
    let messageColor = 'text-slate-600';

    if (accuracyPercent === 100) {
      stars = 3;
      if (Number(averageReflexSec) <= 2.0) {
        message = 'Luar Biasa! Sempurna & Super Cepat! ⚡';
        messageColor = 'text-amber-500';
      } else {
        message = 'Hebat! Akurasi Sempurna! 🌟';
        messageColor = 'text-amber-500';
      }
    } else if (accuracyPercent >= 80) {
      stars = 2;
      message = 'Sangat Bagus! Sedikit Lagi Sempurna! 👍';
      messageColor = 'text-emerald-500';
    } else if (accuracyPercent >= 50) {
      stars = 1;
      message = 'Bagus! Terus Tingkatkan Akurasimu! 💪';
      messageColor = 'text-blue-500';
    }

    return {
      correctCount,
      accuracyPercent,
      stars,
      message,
      messageColor,
      averageReflexSec
    };
  };

  // Record material completion in curriculum when practice ends
  useEffect(() => {
    if (practiceEnded && questions.length > 0) {
      const stats = calculatedStats();
      recordMaterialCompletion({
        operation,
        materialId,
        score: stats.correctCount,
        totalQuestions: questions.length,
        accuracyPercent: stats.accuracyPercent,
        stars: stats.stars
      });
    }
  }, [practiceEnded]);

  const currentCorrectAnswersCount = useMemo(() => {
    let count = 0;
    questions.forEach(q => {
      const userAnsObj = practiceAnswers[q.id];
      if (!userAnsObj) return;

      const userFullString = isRemainderDivision
        ? `${userAnsObj.val.trim()} sisa ${userAnsObj.sisa?.trim()}`
        : userAnsObj.val.trim();

      if (userFullString.replace(/\./g, '').toLowerCase() === q.answerText.replace(/\./g, '').toLowerCase()) {
        count++;
      }
    });
    return count;
  }, [questions, practiceAnswers, isRemainderDivision]);

  const currentMatList = GASING_DATABASE[operation] || [];
  const currentMatIndex = currentMatList.findIndex(m => m.id === materialId);
  const nextMaterial = currentMatIndex >= 0 && currentMatIndex < currentMatList.length - 1
    ? currentMatList[currentMatIndex + 1]
    : null;

  const handleNextMaterial = () => {
    if (nextMaterial) {
      setMaterialId(nextMaterial.id);
      setTimeout(() => {
        startFlashcardPractice();
      }, 150);
    }
  };

  // Print state for download loading overlay
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Print command - converts to PDF and downloads directly
  const triggerPrint = async () => {
    const element = document.getElementById("main-worksheet-paper") || document.getElementById("paper-print-sheet");
    if (!element) return;

    const materialName = selectedMaterial ? selectedMaterial.title.replace(/[^a-zA-Z0-9]/g, "_") : "Worksheet";
    const instansiPrefix = schoolName.trim() ? `${schoolName.trim().replace(/[^a-zA-Z0-9]/g, "_")}_` : "";
    const fileName = `LKPD_${instansiPrefix}${selectedMaterial?.code || operation}_${materialName}.pdf`;

    try {
      setIsPrinting(true);
      await exportWorksheetToPdf(element, fileName, setIsPrinting);
    } catch (e) {
      console.error("Error generating PDF:", e);
      try {
        window.focus();
        window.print();
      } catch (printErr) {
        console.warn("Fallback print failed:", printErr);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  // Selected Material pedagogical notes details
  const selectedMaterial = GASING_DATABASE[operation].find(m => m.id === materialId) || GASING_DATABASE[operation][0];

  return (
    <div className={`min-h-screen flex flex-col antialiased ${showOnboarding ? 'bg-white text-slate-900' : 'bg-slate-50/70 text-slate-800 pb-12'}`} id="app-container">
      {/* HTML Styling for Print layout override */}
      <style>{`
        @media print {
          html, body, #root, #app-container, #content-pane {
            background-color: white !important;
            color: black !important;
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
          }
          #sidebar-config, #app-navigation, #tips-companion-header, #app-navbar, #tips-teaching, #saved-panel, .no-print {
            display: none !important;
          }
          #paper-print-sheet, #paper-zoom-wrapper {
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
            min-height: 0 !important;
            font-size: 14px !important;
            background: transparent !important;
            overflow: visible !important;
          }
          .bg-slate-50, .bg-slate-100, .bg-indigo-50, .bg-emerald-50, .bg-rose-50, .bg-amber-50, .gasing-pdf-block {
            background-color: transparent !important;
          }
          .border-slate-100, .border-slate-200, .border-slate-300 {
            border-color: #cbd5e1 !important;
          }
          .break-page-here {
            page-break-before: always !important;
            break-before: page !important;
          }
        }
      `}</style>

      {/* Role-Adaptive Top Bar - Hidden during Onboarding, Learning Hub, or Active Drill */}
      {!practiceActive && !showOnboarding && !(activeTab === 'practice' && !practiceActive && !practiceEnded) && (
        selectedRole === 'student' ? (
          <KidsTopBar
            starsCount={currentCorrectAnswersCount}
            totalQuestions={questions.length || 25}
            streakCount={streak}
            onOpenSettings={() => setShowPracticeSettingsModal(true)}
            onOpenRoleSwitcher={() => {
              setShowOnboarding(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSwitchToTeacher={() => {
              setSelectedRole('teacher');
              setActiveTab('printable');
              setShowOnboarding(false);
              try {
                sessionStorage.setItem('gasing_selected_role', 'teacher');
              } catch {}
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenBadges={() => setShowBadgesModal(true)}
          />
        ) : (
      <motion.nav 
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="no-print px-2 sm:px-4 pt-2 sticky top-0 z-40" 
        id="app-navbar"
      >
        <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl sm:rounded-3xl px-3 sm:px-6 py-2 sm:py-2.5 shadow-xs flex flex-col md:flex-row gap-2 sm:gap-3 items-center justify-between">
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div 
              onClick={() => {
                setShowOnboarding(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
              title="Kembali ke Beranda GASING"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <svg viewBox="0 0 48 48" className="w-6 h-6 select-none">
                  <polygon points="24,4 42,18 24,24 6,18" fill="#ffffff" opacity="0.95" />
                  <polygon points="6,18 24,24 24,44" fill="#047857" />
                  <polygon points="42,18 24,24 24,44" fill="#10b981" />
                  <polygon points="24,24 33,34 24,44 15,34" fill="#fde047" opacity="0.9" />
                  <circle cx="24" cy="44" r="2" fill="#ffffff" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-display">
                    GASING
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 tracking-wider font-display">
                    MATH
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-sans font-medium">Metode Prof. Yohanes Surya</p>
              </div>
            </div>

            {/* Quick Home button on mobile */}
            <button
              type="button"
              onClick={() => {
                setShowOnboarding(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
              title="Beranda"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation & Segmented Control */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 font-display">
            {/* Beranda Button */}
            <button
              type="button"
              id="nav-home-btn"
              onClick={() => {
                setShowOnboarding(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5 shrink-0 border border-slate-200 cursor-pointer"
              title="Buka Beranda GASING"
            >
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span>Beranda</span>
            </button>

            {/* Role Switcher Button */}
            <button
              type="button"
              id="nav-role-switcher-btn"
              onClick={() => {
                setShowOnboarding(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 select-none"
              title="Ganti Peran"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {selectedRole === 'student' ? 'Siswa' : selectedRole === 'teacher' ? 'Guru' : selectedRole === 'parent' ? 'Orang Tua' : 'Pilih Peran'}
              </span>
            </button>

            {/* Quick shortcut to Student Playground when in Teacher role */}
            {selectedRole === 'teacher' && (
              <button
                type="button"
                onClick={() => {
                  handleSelectRole('student');
                }}
                className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shrink-0 select-none"
                title="Kembali ke Ruang Bermain Siswa (Latihan GASING)"
              >
                <span>🎮</span>
                <span className="hidden sm:inline">Mode Siswa</span>
              </button>
            )}

            {/* 4 Tab Utama: Clean Modern Segmented Control */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('printable');
                  setShowOnboarding(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 select-none ${
                  !showOnboarding && activeTab === 'printable'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>📄</span>
                <span>Cetak</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('practice');
                  setShowOnboarding(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 select-none ${
                  !showOnboarding && activeTab === 'practice'
                    ? 'bg-amber-500 text-amber-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${!showOnboarding && activeTab === 'practice' ? 'fill-amber-950 text-amber-950' : 'text-amber-500'}`} />
                <span>Latihan</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('about');
                  setShowOnboarding(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 select-none ${
                  !showOnboarding && activeTab === 'about'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>🎓</span>
                <span>Filosofi</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowOnboarding(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 select-none ${
                  !showOnboarding && activeTab === 'settings'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Settings className={`w-3.5 h-3.5 ${!showOnboarding && activeTab === 'settings' ? 'text-white' : 'text-slate-600'}`} />
                <span>Atur</span>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>
        )
      )}

      {/* Welcome Competition Modal */}
      <CompetitionModal
        isOpen={showCompetitionModal}
        onClose={handleCloseCompetitionModal}
      />

      {/* Primary Workspace Layout */}
      <div className={`w-full mx-auto shrink-0 grow ${showOnboarding || (activeTab === 'practice' && !practiceActive && !practiceEnded) ? 'w-full max-w-full p-0 m-0' : (selectedRole === 'student' && activeTab === 'practice') ? 'max-w-3xl px-2.5 sm:px-6 mt-2 sm:mt-5 flex flex-col' : practiceActive ? 'max-w-3xl px-3 sm:px-6 mt-4 sm:mt-6 flex flex-col' : (activeTab === 'settings' ? 'max-w-4xl px-3 sm:px-6 mt-4 sm:mt-6 flex flex-col' : 'max-w-7xl px-3 sm:px-6 mt-4 sm:mt-6 flex flex-col')}`} id="content-pane">
        
        {/* MAIN PANEL CONTENT */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {showOnboarding ? (
              <OnboardingRoleHero
                key="onboarding-role-hero"
                onSelectRole={handleSelectRole}
                onOpenCompetitionModal={() => setShowCompetitionModal(true)}
                onSkip={() => {
                  setShowOnboarding(false);
                  try {
                    sessionStorage.setItem('gasing_onboarding_dismissed', 'true');
                  } catch {}
                }}
                onStartPractice={(op, matId, resumeIndex) => {
                  if (op) setOperation(op);
                  if (matId) setMaterialId(matId);
                  if (typeof resumeIndex === 'number' && resumeIndex >= 0) {
                    setCurrentPracticeIndex(resumeIndex);
                  }
                  setActiveTab('practice');
                  setShowOnboarding(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onStartPrintable={(op, matId) => {
                  if (op) setOperation(op);
                  if (matId) setMaterialId(matId);
                  setActiveTab('printable');
                  setShowOnboarding(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenPhilosophy={() => {
                  setActiveTab('about');
                  setShowOnboarding(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenSettings={() => {
                  setActiveTab('settings');
                  setShowOnboarding(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              <motion.div
                key={`tab-content-${activeTab}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14, scale: 0.99 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="w-full space-y-6"
              >
                {/* TAB CONTENT 1: PRINTABLE WORKSHEET */}
                {activeTab === 'printable' && (
            <div className="space-y-6">
              
              {/* Quick Settings Shortcut Bar on Printable */}
              <div className="no-print bg-white/95 backdrop-blur-md border-2 border-sky-100 p-3 sm:p-4 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-sans">
                  <span>KOP: <strong className="text-slate-900 font-display">{schoolName || 'Standar (GASING)'}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Materi: <strong className="text-slate-900 font-display">{selectedMaterial?.code} - {selectedMaterial?.title}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span className="font-display font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">{totalQuestions} Soal</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-display font-black text-sky-800 bg-sky-50 hover:bg-sky-100 active:scale-95 px-3.5 py-1.5 rounded-2xl border-2 border-sky-200 border-b-[3px] border-b-sky-300 flex items-center gap-1.5 transition-all cursor-pointer ml-auto select-none"
                >
                  <Settings className="w-3.5 h-3.5 text-sky-600" />
                  <span>Ubah KOP / Parameter</span>
                </button>
              </div>
              
              {/* Toolbar & Action Controls */}
              <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between bg-white/95 backdrop-blur-md border-2 border-pink-100/90 p-3.5 sm:p-4 rounded-3xl shadow-xs gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
                  <p className="text-xs text-slate-700 font-display font-black flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-sky-500 shrink-0" /> 
                    <span>Pratinjau Kertas A4 LKPD</span>
                  </p>

                  {/* Fullscreen Interactive Preview Button */}
                  <button
                    onClick={() => setIsFullscreenPreview(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-display font-black text-xs rounded-2xl border-2 border-sky-200 border-b-[3px] border-b-sky-300 transition-all active:scale-95 cursor-pointer shadow-2xs select-none"
                    title="Buka pratinjau lembar cetak layar penuh dengan fitur zoom & geser"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Layar Penuh (Zoom)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end font-display">
                  <button
                    onClick={handleGenerate}
                    className="bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 border-2 border-amber-200 border-b-[3px] border-b-amber-300 shadow-xs transition-all grow sm:grow-0 cursor-pointer select-none"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Acak Soal</span>
                  </button>
                  <button
                    onClick={triggerPrint}
                    disabled={isPrinting}
                    className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:scale-95 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 border-2 border-sky-400 border-b-[3px] border-b-sky-800 shadow-md shadow-sky-200 transition-all grow sm:grow-0 cursor-pointer disabled:opacity-60 select-none"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isPrinting ? 'Menyiapkan PDF...' : 'Cetak / Unduh PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Printable sheet area viewport container with automatic responsive scale */}
              <div 
                id="paper-zoom-wrapper"
                ref={paperWrapperRef}
                className="w-full flex flex-col items-center justify-start overflow-hidden pb-6 transition-all"
              >
                <div
                  style={{
                    width: `${Math.round(794 * inlineScale)}px`,
                    height: `${Math.round(paperActualHeight * inlineScale)}px`,
                  }}
                  className="relative shrink-0 select-none transition-all duration-150"
                >
                  <div
                    id="paper-print-sheet"
                    ref={paperSheetRef}
                    style={{
                      width: '794px',
                      transform: `scale(${inlineScale})`,
                      transformOrigin: 'top left',
                    }}
                    className="absolute top-0 left-0"
                  >
                    <WorksheetPaper
                      headerData={headerData}
                      selectedMaterial={selectedMaterial}
                      operation={operation}
                      totalQuestions={totalQuestions}
                      questions={questions}
                      showAnswers={showAnswers}
                      showNumbers={showNumbers}
                      layoutColumns={layoutColumns}
                      p11Format={p11Format}
                      multiplicationFormat={multiplicationFormat}
                      containerId="main-worksheet-paper"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: INTERACTIVE PRACTICE SIMULATOR */}
          {activeTab === 'practice' && (
            <div className="space-y-6">
              
              {/* PLAYGROUND HOME (When practice is not active or ended) */}
              {!practiceActive && !practiceEnded && (
                <PracticePlaygroundHome
                  operation={operation}
                  randomLevel={randomLevel}
                  onChangeRandomLevel={(lvl) => setRandomLevel(lvl)}
                  currentMaterial={selectedMaterial}
                  starsCount={currentCorrectAnswersCount}
                  streakCount={streak}
                  totalQuestions={totalQuestions}
                  onStartFlashcard={startFlashcardPractice}
                  onStartGrid={startGridPractice}
                  onOpenSettings={() => setShowPracticeSettingsModal(true)}
                  onOpenBadges={() => setShowBadgesModal(true)}
                  onToggleConceptGuide={() => setShowConceptGuide(!showConceptGuide)}
                  showConceptGuide={showConceptGuide}
                  onSelectQuickMaterial={(newOp, newMatId) => {
                    setOperation(newOp);
                    setMaterialId(newMatId);
                  }}
                  onSelectOperation={(newOp) => {
                    setOperation(newOp);
                    const defaultMat = GASING_DATABASE[newOp]?.[0];
                    if (defaultMat) {
                      setMaterialId(defaultMat.id);
                    }
                  }}
                  onSelectMaterial={(newMatId) => {
                    setMaterialId(newMatId);
                  }}
                  onSetTotalQuestions={(n) => setTotalQuestions(n)}
                  onBackToHome={() => {
                    setShowOnboarding(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenPrintable={() => {
                    setActiveTab('printable');
                    setShowOnboarding(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenPhilosophy={() => {
                    setActiveTab('about');
                    setShowOnboarding(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {/* TAHAP 1: VISUALISASI BELAJAR MANDIRI (Konkret & Abstrak) - Collapsible via Panduan Konsep */}
              <AnimatePresence>
                {showConceptGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="no-print bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl" id="tips-teaching">
                      
                      {/* 1. Judul Materi */}
                      <div className="border-b border-slate-800 pb-5 mb-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-600 text-white p-3 rounded-2xl shrink-0 flex items-center justify-center shadow-lg shadow-indigo-900/30 mt-0.5">
                            <BookOpen className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-3 py-1 rounded-full font-mono border border-indigo-500/30">
                                {selectedMaterial.code}
                              </span>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/20 tracking-wider uppercase">
                                ⚡ TAHAP 1: KONKRET & ABSTRAK
                              </span>
                            </div>
                            <h4 className="text-xl font-black text-white mt-1.5">{selectedMaterial.title}</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {selectedMaterial.id === 'B1' 
                                ? 'Membangun refleks hubungan antara perkalian dan pembagian secara spontan tanpa menghitung atau membayangkan kuantitas konkret.'
                                : selectedMaterial.id === 'B2'
                                  ? 'Pembagian adalah membagi secara ADIL dan MERATA.'
                                  : selectedMaterial.id === 'B3'
                                    ? 'Pembagian horizontal Gasing dikerjakan dari depan dengan sistem notasi coret dan sisa kecil secara konsisten.'
                                    : selectedMaterial.id === 'B4'
                                      ? 'Pembagian bersisa Gasing dipahami secara intuitif melalui pembagian adil, sisa, dan pencoretan digit yang selesai diproses.'
                                      : selectedMaterial.id === 'B6'
                                        ? 'Pembagian dengan bilangan pembagi dua angka menggunakan notasi coret horizontal dan sisa kecil GASING.'
                                        : `Belajar ${selectedMaterial.title.toLowerCase()} menggunakan konsep penemuan mandiri, pemicu visual, dan langkah berpikir bertahap Metode GASING.`
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 2. Visualisasi Belajar Mandiri (Simulasi Konkret & Abstrak) */}
                      <div className="space-y-6">
                        <GasingDynamicVisualizer
                          operation={operation}
                          materialId={selectedMaterial.id}
                          materialTitle={selectedMaterial.title}
                          materialCode={selectedMaterial.code}
                        />
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TAHAP 2: INTERACTIVE PRACTICE SIMULATOR (Drill Mencongak) */}
              {(practiceActive || practiceEnded) && (
              <div id="practice-workspace" className={`space-y-4 sm:space-y-6 pt-1 sm:pt-2 ${flashcardMode === 'single' ? 'flex flex-col min-h-[calc(100dvh-130px)] sm:min-h-0' : ''}`}>

                {/* Sleek In-Practice Header Bar - Grid Mode only */}
                {flashcardMode === 'grid' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 p-3 sm:p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleResetPractice}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        title="Kembali ke Taman Bermain"
                      >
                        <span>⬅️</span>
                        <span className="hidden sm:inline">Taman Bermain</span>
                        <span className="sm:hidden">Keluar</span>
                      </button>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl">
                        <span>📝 Lembar Grid</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-indigo-600 font-extrabold truncate max-w-[200px] sm:max-w-none">[{selectedMaterial.code}] {selectedMaterial.title}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl">
                        ⏱️ {practiceElapsed}s
                      </span>

                      <button
                        type="button"
                        onClick={() => setShowPracticeSettingsModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>⚙️ Pengaturan</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* PRACTICE VIEW: Drill Kilat Satu-Satu (Flashcard style) */}
                {flashcardMode === 'single' && (
                  <PracticeFlashcardArena
                    questions={questions}
                    currentMaterial={selectedMaterial}
                    currentPracticeIndex={currentPracticeIndex}
                    practiceAnswers={practiceAnswers}
                    practiceInput={practiceInput}
                    practiceSisaInput={practiceSisaInput}
                    flashcardState={flashcardState}
                    streak={streak}
                    bestStreak={bestStreak}
                    starsEarned={starsEarned}
                    questionAttempts={questionAttempts}
                    firstTryCorrectCount={firstTryCorrectCount}
                    retryCount={retryCount}
                    practiceElapsed={practiceElapsed}
                    practiceActive={practiceActive}
                    practiceEnded={practiceEnded}
                    p11Format={p11Format}
                    onAnswerSubmit={handleAnswerSubmit}
                    onInputChange={(val) => setPracticeInput(val.replace(/[^0-9.]/g, ''))}
                    onSisaInputChange={(val) => setPracticeSisaInput(val.replace(/[^0-9.]/g, ''))}
                    onResetPractice={handleResetPractice}
                    onRestartPractice={startFlashcardPractice}
                    onNextMaterial={nextMaterial ? handleNextMaterial : undefined}
                    nextMaterialCode={nextMaterial?.code}
                    calculatedStats={calculatedStats}
                  />
                )}

              {/* PRACTICE VIEW: Praktek Pengisian Grid (Worksheet View) */}
              {flashcardMode === 'grid' && (
                <PracticeGridArena
                  questions={questions}
                  currentMaterial={selectedMaterial}
                  materialId={materialId}
                  practiceActive={practiceActive}
                  practiceEnded={practiceEnded}
                  practiceElapsed={practiceElapsed}
                  practiceAnswers={practiceAnswers}
                  activeGridIndex={activeGridIndex}
                  activeGridPart={activeGridPart}
                  isGrading={isGrading}
                  gradingIndex={gradingIndex}
                  isRemainderDivision={isRemainderDivision}
                  p11Format={p11Format}
                  showNumbers={showNumbers}
                  showGasingSteps={showGasingSteps}
                  onSelectCell={(newIdx, part, slotId) => {
                    if (isGrading) return;
                    if (!practiceActive) {
                      setPracticeActive(true);
                      setPracticeStartTime(Date.now());
                    }
                    setActiveGridIndex(newIdx);
                    setActiveGridPart(part);
                    if (slotId) {
                      const targetQ = questions[newIdx];
                      if (targetQ) {
                        setPracticeAnswers(prev => ({
                          ...prev,
                          [targetQ.id]: {
                            ...(prev[targetQ.id] || { val: '', sisa: '', gasingInputs: {} }),
                            activeSlotId: slotId,
                          }
                        }));
                      }
                    }
                  }}
                  onAutoMerge={handleAutoMerge}
                  onStartGrid={startGridPractice}
                  onFinishGrid={() => {
                    setPracticeEnded(true);
                    setPracticeActive(false);
                  }}
                  onResetPractice={handleResetPractice}
                  checkQuestionCorrectness={checkQuestionCorrectness}
                  calculatedStats={calculatedStats}
                />
              )}
              </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 3: ABOUT FILOSOFI GASING */}
          {activeTab === 'about' && (
            <div className="space-y-4 max-w-5xl mx-auto" id="about-tab-container">
              {/* Back to practice button bar */}
              <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl px-4 py-3 shadow-2xs font-sans">
                <button
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    setActiveTab('practice');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer select-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Latihan</span>
                </button>
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-display">
                  Panduan & Filosofi GASING
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-10 md:p-12 shadow-xs">
                <GasingGuide />
              </div>
            </div>
          )}

          {/* TAB CONTENT 4: PENGATURAN KOP & PARAMETER LKPD */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto" id="settings-tab-pane">
              
              {/* Header Box */}
              <div className="bg-white/95 backdrop-blur-md border-2 border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-display">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                    <span>Pengaturan KOP & Parameter LKPD</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-sans">
                    Sesuaikan identitas madrasah/sekolah, jenis operasi hitung, materi kurikulum GASING, dan opsi cetak.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('printable');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:scale-95 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl border-2 border-sky-400 border-b-[3px] border-b-sky-800 shadow-md shadow-sky-200 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 select-none"
                >
                  <span>📄 Buka Lembar Cetak</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Main Settings Card */}
              <div className="bg-white/95 backdrop-blur-md border-2 border-sky-100 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
                
                {/* CONFIG KOP & IDENTITAS LKPD */}
                <WorksheetHeaderConfig data={headerData} onChange={setHeaderData} />

                <div className="pt-6 border-t border-slate-100 space-y-5">
                  <h3 className="font-display font-black text-slate-700 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <span>🔧 Parameter Materi & Soal</span>
                  </h3>

                  {/* OPERASI HITUNG */}
                  <div>
                    <label className="block text-xs font-display font-bold text-slate-500 uppercase tracking-wider mb-2">Operasi Hitung</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-display">
                      {(['PENJUMLAHAN', 'PENGURANGAN', 'PERKALIAN', 'PEMBAGIAN'] as OperationType[]).map((op) => (
                        <motion.button
                          key={op}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.90, transition: { type: "spring", stiffness: 600, damping: 12 } }}
                          onClick={() => {
                            playBubblePop();
                            setOperation(op);
                          }}
                          className={`text-xs sm:text-sm py-2.5 px-2 rounded-2xl font-black transition-colors border-2 border-b-[3px] cursor-pointer select-none ${
                            operation === op
                              ? 'bg-sky-500 border-sky-400 border-b-sky-700 text-white shadow-xs'
                              : 'bg-slate-50 border-slate-200 border-b-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {op === 'PENJUMLAHAN' && '➕ Tambah'}
                          {op === 'PENGURANGAN' && '➖ Kurang'}
                          {op === 'PERKALIAN' && '✖️ Kali'}
                          {op === 'PEMBAGIAN' && '➗ Bagi'}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* MATERI DROPDOWN */}
                  <div>
                    <label className="block text-xs font-display font-bold text-slate-500 uppercase tracking-wider mb-1.5">Materi Metode GASING</label>
                    <select
                      value={materialId}
                      onChange={(e) => setMaterialId(e.target.value)}
                      className="w-full text-sm bg-slate-50 border-2 border-slate-200 text-slate-800 py-3 px-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 font-display font-bold"
                    >
                      {GASING_DATABASE[operation].map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          {mat.code} - {mat.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* JUMLAH SOAL & LAYOUT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* JUMLAH SOAL */}
                    <div>
                      <label className="block text-xs font-display font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jumlah Soal</label>
                      <div className="flex flex-wrap gap-1.5 font-display">
                        {([25, 50, 100, 150, 200] as const).map((num) => (
                          <button
                            key={num}
                            onClick={() => setTotalQuestions(num)}
                            className={`text-xs px-3.5 py-2 rounded-2xl border-2 border-b-[3px] font-black transition-all cursor-pointer select-none ${
                              totalQuestions === num
                                ? 'bg-sky-500 border-sky-400 border-b-sky-700 text-white shadow-xs'
                                : 'bg-white border-slate-200 border-b-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* LAYOUT COLUMNS */}
                    <div>
                      <label className="block text-xs font-display font-bold text-slate-500 uppercase tracking-wider mb-1.5">Layout Kolom Cetak</label>
                      <div className="grid grid-cols-3 gap-1.5 font-display">
                        {([1, 2, 3] as const).map((col) => (
                          <button
                            key={col}
                            onClick={() => setLayoutColumns(col)}
                            className={`text-xs py-2 rounded-2xl border-2 border-b-[3px] font-black transition-all cursor-pointer select-none ${
                              layoutColumns === col
                                ? 'bg-pink-500 border-pink-400 border-b-pink-700 text-white shadow-xs'
                                : 'bg-white border-slate-200 border-b-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {col} Kolom
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* FORMAT SOAL X12 / X13 / X14 / X15 / X16 */}
                  {(materialId === 'X12' || materialId === 'X13' || materialId === 'X14' || materialId === 'X15' || materialId === 'X16') && (
                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 transition-all">
                      <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Format Soal GASING</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setMultiplicationFormat('mendatar')}
                          className={`text-xs py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                            multiplicationFormat === 'mendatar'
                              ? 'bg-amber-600 border-amber-600 text-white shadow'
                              : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
                          }`}
                        >
                          Bentuk Mendatar
                        </button>
                        <button
                          onClick={() => setMultiplicationFormat('bersusun')}
                          className={`text-xs py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                            multiplicationFormat === 'bersusun'
                              ? 'bg-amber-600 border-amber-600 text-white shadow'
                              : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
                          }`}
                        >
                          Bentuk Bersusun
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORMAT SOAL P11 */}
                  {materialId === 'P11' && (
                    <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200/70 transition-all">
                      <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Pilih Format Latihan</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setP11Format('vertikal')}
                          className={`text-xs py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                            p11Format === 'vertikal'
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                              : 'bg-white border-indigo-200 text-indigo-800 hover:bg-indigo-50'
                          }`}
                        >
                          Vertikal (Buku Gasing)
                        </button>
                        <button
                          onClick={() => setP11Format('horizontal')}
                          className={`text-xs py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                            p11Format === 'horizontal'
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                              : 'bg-white border-indigo-200 text-indigo-800 hover:bg-indigo-50'
                          }`}
                        >
                          Horizontal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TINGKAT ACAK, KUNCI JAWABAN, NOMOR SOAL */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* TINGKAT ACAK */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tingkat Acak (Urutan)</label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['Rendah', 'Sedang', 'Tinggi'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setRandomLevel(lvl)}
                            className={`text-xs py-2 rounded-xl border text-center transition-all font-semibold cursor-pointer ${
                              randomLevel === lvl
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* FORMAT JAWABAN */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kunci Jawaban</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setShowAnswers(true)}
                          className={`text-xs py-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                            showAnswers
                              ? 'bg-slate-900 border-slate-900 text-white font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Soal + Kunci
                        </button>
                        <button
                          onClick={() => setShowAnswers(false)}
                          className={`text-xs py-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                            !showAnswers
                              ? 'bg-slate-900 border-slate-900 text-white font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Soal Saja
                        </button>
                      </div>
                    </div>

                    {/* NOMOR SOAL */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nomor Soal</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setShowNumbers(true)}
                          className={`text-xs py-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                            showNumbers
                              ? 'bg-slate-100 border-indigo-200 text-indigo-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Ya
                        </button>
                        <button
                          onClick={() => setShowNumbers(false)}
                          className={`text-xs py-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                            !showNumbers
                              ? 'bg-slate-100 border-indigo-200 text-indigo-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Tidak
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* CTA Action Buttons */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => {
                      handleGenerate();
                      setActiveTab('printable');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>📄 Simpan & Buka Lembar Cetak</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Acak Ulang Soal
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    💾 Simpan Konfigurasi
                  </button>
                </div>

              </div>

              {/* HISTORICAL RECENT SAVED PANEL */}
              {savedConfigs.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4" id="saved-panel">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-500" /> Riwayat Konfigurasi Tersimpan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {savedConfigs.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleLoadSavedConfig(item.config)}
                        className="group border border-slate-100 hover:border-indigo-200 bg-slate-50 hover:bg-indigo-50/50 p-3 rounded-2xl cursor-pointer text-left transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSavedConfig(item.id, e)}
                          className="text-slate-300 hover:text-rose-500 rounded-md p-1 group-hover:text-slate-400 transition-colors shrink-0"
                          title="Hapus"
                        >
                          <span className="text-xs font-mono font-bold">×</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>


      {/* Docked Grid Numpad */}
      <AnimatePresence>
        {practiceActive && flashcardMode === 'grid' && !isGrading && !practiceEnded && (
          <PracticeKeypad
            activeGridIndex={activeGridIndex}
            totalQuestions={questions.length}
            onKeyPress={handleGridNumpad}
            onNext={() => {
              if (activeGridIndex < questions.length - 1) {
                const nextQ = questions[activeGridIndex + 1];
                const { slots: nextSlots } = getQuestionInteractiveSlots(nextQ);
                setActiveGridIndex(activeGridIndex + 1);
                setActiveGridPart('val');
                if (nextSlots.length > 0) {
                  setPracticeAnswers(prev => ({
                    ...prev,
                    [nextQ.id]: {
                      ...(prev[nextQ.id] || { val: '', sisa: '', gasingInputs: {} }),
                      activeSlotId: nextSlots[0].id
                    }
                  }));
                }
              }
            }}
            onPrev={() => {
              if (activeGridIndex > 0) {
                const prevQ = questions[activeGridIndex - 1];
                const { slots: prevSlots } = getQuestionInteractiveSlots(prevQ);
                setActiveGridIndex(activeGridIndex - 1);
                setActiveGridPart('val');
                if (prevSlots.length > 0) {
                  setPracticeAnswers(prev => ({
                    ...prev,
                    [prevQ.id]: {
                      ...(prev[prevQ.id] || { val: '', sisa: '', gasingInputs: {} }),
                      activeSlotId: prevSlots[0].id
                    }
                  }));
                }
              }
            }}
            isLastQuestion={activeGridIndex === questions.length - 1}
            isFirstQuestion={activeGridIndex === 0}
            isRemainderDivision={isRemainderDivision}
            activeGridPart={activeGridPart}
            onTogglePart={(part) => setActiveGridPart(part)}
            onFinish={() => {
              setPracticeEnded(true);
              setPracticeActive(false);
            }}
            currentAnswer={practiceAnswers[questions[activeGridIndex]?.id]}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPrinting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-sm w-full text-center space-y-4"
            >
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                  <Download className="w-5 h-5 text-indigo-600 absolute animate-bounce" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-950">
                  Menyiapkan Dokumen PDF
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Sistem sedang mengonversi Lembar Kerja Matematika GASING Anda ke format PDF resolusi tinggi...
                </p>
              </div>
              <div className="text-[10px] text-indigo-500 bg-indigo-50/50 py-1.5 px-3 rounded-lg inline-block font-medium font-sans">
                Mohon tunggu beberapa saat
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Print Sheet Preview Modal with Pinch-to-Zoom Gesture */}
      <AnimatePresence>
        {isFullscreenPreview && (
          <FullscreenPreviewModal
            isOpen={isFullscreenPreview}
            onClose={() => setIsFullscreenPreview(false)}
            onPrint={() => triggerPrint()}
            isPrinting={isPrinting}
            headerData={headerData}
            selectedMaterial={selectedMaterial}
            operation={operation}
            totalQuestions={totalQuestions}
            questions={questions}
            showAnswers={showAnswers}
            showNumbers={showNumbers}
            layoutColumns={layoutColumns}
            p11Format={p11Format}
            multiplicationFormat={multiplicationFormat}
          />
        )}
      </AnimatePresence>

      {/* Practice Settings Drawer / Modal (GASING Logic, Level, Operations, Materials) */}
      <PracticeSettingsModal
        isOpen={showPracticeSettingsModal}
        onClose={() => setShowPracticeSettingsModal(false)}
        operation={operation}
        onSelectOperation={(newOp) => {
          setOperation(newOp);
          handleResetPractice();
        }}
        randomLevel={randomLevel}
        onSelectLevel={(newLevel) => {
          setRandomLevel(newLevel);
          handleResetPractice();
        }}
        materials={GASING_DATABASE[operation] || []}
        selectedMaterialId={materialId}
        onSelectMaterial={(newMatId) => {
          setMaterialId(newMatId);
          handleResetPractice();
        }}
        onGenerateNewQuestions={() => {
          handleGenerate();
          handleResetPractice();
        }}
        onPrint={() => triggerPrint()}
        isGenerating={false}
        showConceptGuide={showConceptGuide}
        onToggleConceptGuide={() => setShowConceptGuide(!showConceptGuide)}
        showGasingSteps={showGasingSteps}
        onToggleGasingSteps={() => setShowGasingSteps(!showGasingSteps)}
        onOpenBadgesModal={() => {
          setShowPracticeSettingsModal(false);
          setShowBadgesModal(true);
        }}
        onOpenStoryModal={() => {
          setShowPracticeSettingsModal(false);
          setShowStoryModal(true);
        }}
      />

      {/* Practice Achievements / Badges Modal */}
      <PracticeBadgesModal
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        starsCount={currentCorrectAnswersCount}
        streakCount={streak}
      />

      {/* Practice Context Story Modal */}
      <PracticeStoryModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        material={selectedMaterial}
      />

    </div>
  );
}
