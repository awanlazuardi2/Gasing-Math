/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Loader2
} from 'lucide-react';
import { WorksheetPaper } from './WorksheetPaper';
import { exportWorksheetToPdf } from '../utils/pdfGenerator';
import { WorksheetHeaderData, GasingMaterial, OperationType, Question } from '../types';

interface FullscreenPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  isPrinting?: boolean;
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
}

export const FullscreenPreviewModal: React.FC<FullscreenPreviewModalProps> = ({
  isOpen,
  onClose,
  onPrint,
  isPrinting = false,
  headerData,
  selectedMaterial,
  operation,
  totalQuestions,
  questions,
  showAnswers,
  showNumbers,
  layoutColumns,
  p11Format = 'vertikal',
  multiplicationFormat = 'mendatar',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  // Scale and Pan state
  const [scale, setScale] = useState<number>(1);
  const [fitScale, setFitScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(true);
  const [paperHeight, setPaperHeight] = useState<number>(1150);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Standard A4 width in pixels at 96 DPI (~210mm)
  const A4_WIDTH_PX = 794;

  // Measure paper actual unscaled height dynamically
  useEffect(() => {
    if (!isOpen || !paperRef.current) return;
    const updateHeight = () => {
      if (paperRef.current) {
        setPaperHeight(paperRef.current.offsetHeight || 1150);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(paperRef.current);
    return () => observer.disconnect();
  }, [isOpen, questions, showAnswers]);

  // Calculate fit scale based on viewport width
  const calculateFitScale = useCallback(() => {
    if (!containerRef.current) return 1;
    const containerWidth = containerRef.current.clientWidth;
    // Provide a comfortable padding (16px on mobile: 8px on left, 8px on right)
    const availableWidth = Math.max(containerWidth - 16, 260);
    const calculatedFit = Math.min(1.0, availableWidth / A4_WIDTH_PX);
    setFitScale(calculatedFit);
    return calculatedFit;
  }, []);

  // Initialize and handle window resize
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure container is mounted and measured accurately
    const timer = setTimeout(() => {
      const initialFit = calculateFitScale();
      setScale(initialFit);
      setPan({ x: 0, y: 0 });
    }, 50);

    const handleResize = () => {
      const newFit = calculateFitScale();
      // If user was roughly at fit scale, update it
      setScale((prev) => (Math.abs(prev - fitScale) < 0.05 ? newFit : prev));
    };

    window.addEventListener('resize', handleResize);

    // Auto dismiss pinch hint after 6 seconds
    const hintTimer = setTimeout(() => {
      setShowHint(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hintTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, calculateFitScale]);

  // Touch tracking refs
  const touchStateRef = useRef<{
    isPinching: boolean;
    initialDistance: number;
    initialScale: number;
    initialCenter: { x: number; y: number };
    initialPan: { x: number; y: number };
    lastTouch: { x: number; y: number };
    lastTapTime: number;
  }>({
    isPinching: false,
    initialDistance: 0,
    initialScale: 1,
    initialCenter: { x: 0, y: 0 },
    initialPan: { x: 0, y: 0 },
    lastTouch: { x: 0, y: 0 },
    lastTapTime: 0,
  });

  // Native non-passive touch listeners for smooth pinch gesture
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two fingers detected -> START PINCH
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const centerX = (t1.clientX + t2.clientX) / 2;
        const centerY = (t1.clientY + t2.clientY) / 2;

        touchStateRef.current = {
          ...touchStateRef.current,
          isPinching: true,
          initialDistance: Math.max(dist, 10),
          initialScale: scale,
          initialCenter: { x: centerX, y: centerY },
          initialPan: { ...pan },
        };
        setIsPinching(true);
        setShowHint(false);
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStateRef.current.lastTouch = { x: t.clientX, y: t.clientY };

        // Double tap detection to quickly toggle zoom
        const now = Date.now();
        if (now - touchStateRef.current.lastTapTime < 300) {
          e.preventDefault();
          // Double tap toggles between fitScale and 1.0 (or 1.4 if already 1.0)
          setScale((currentScale) => {
            if (Math.abs(currentScale - fitScale) < 0.1) {
              setPan({ x: 0, y: 0 });
              return 1.0;
            } else {
              setPan({ x: 0, y: 0 });
              return fitScale;
            }
          });
        }
        touchStateRef.current.lastTapTime = now;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStateRef.current.isPinching) {
        // Prevent default browser zoom or viewport pull
        e.preventDefault();

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const { initialDistance, initialScale, initialCenter, initialPan } = touchStateRef.current;

        if (initialDistance > 0) {
          const pinchFactor = currentDist / initialDistance;
          // Clamp scale between 0.35 and 3.0
          const newScale = Math.min(Math.max(initialScale * pinchFactor, 0.35), 3.0);

          // Calculate center shift for natural pinch-panning
          const currentCenterX = (t1.clientX + t2.clientX) / 2;
          const currentCenterY = (t1.clientY + t2.clientY) / 2;
          const deltaX = currentCenterX - initialCenter.x;
          const deltaY = currentCenterY - initialCenter.y;

          setScale(newScale);
          setPan({
            x: initialPan.x + deltaX,
            y: initialPan.y + deltaY,
          });
        }
      } else if (e.touches.length === 1 && !touchStateRef.current.isPinching) {
        // One finger drag: always allow vertical pan so user can scroll down through all questions,
        // and allow horizontal pan when zoomed in
        const t = e.touches[0];
        const deltaX = t.clientX - touchStateRef.current.lastTouch.x;
        const deltaY = t.clientY - touchStateRef.current.lastTouch.y;

        touchStateRef.current.lastTouch = { x: t.clientX, y: t.clientY };
        setPan((prev) => {
          const allowX = scale > fitScale * 1.05;
          return {
            x: allowX ? prev.x + deltaX : prev.x,
            y: prev.y + deltaY,
          };
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStateRef.current.isPinching = false;
        setIsPinching(false);
      }
      if (e.touches.length === 1) {
        touchStateRef.current.lastTouch = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isOpen, scale, fitScale, pan]);

  // Trackpad / mouse wheel pinch (with Ctrl key)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.35), 3.0));
    }
  };

  // Mouse drag support for desktop/trackpad
  const isMouseDownRef = useRef(false);
  const mouseStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    isMouseDownRef.current = true;
    mouseStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const deltaX = e.clientX - mouseStartPos.current.x;
    const deltaY = e.clientY - mouseStartPos.current.y;
    mouseStartPos.current = { x: e.clientX, y: e.clientY };
    setPan((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  // Quick zoom helper functions
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev * 0.8, 0.35));
  };

  const handleResetFit = () => {
    setScale(fitScale);
    setPan({ x: 0, y: 0 });
  };

  const handleZoom100 = () => {
    setScale(1.0);
    setPan({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col no-print select-none touch-none"
    >
      {/* 1. Modal Header Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-3 flex items-center justify-between text-white shrink-0 z-10 shadow-md font-display">
        <div className="flex items-center gap-2.5">
          <span className="bg-emerald-600 text-white p-1.5 sm:p-2 rounded-xl shadow-xs">
            <Printer className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-slate-100">
              <span>Pratinjau Kertas A4 (Layar Penuh)</span>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-950/80 border border-emerald-700/60 text-[10px] text-emerald-300 font-mono rounded-md">
                Pinch to Zoom
              </span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans">
              Cubit layar untuk perbesar/perkecil tata letak KOP dan naskah soal
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (paperRef.current) {
                const materialName = selectedMaterial ? selectedMaterial.title.replace(/[^a-zA-Z0-9]/g, "_") : "Worksheet";
                const instansiPrefix = headerData.schoolName?.trim() ? `${headerData.schoolName.trim().replace(/[^a-zA-Z0-9]/g, "_")}_` : "";
                const fileName = `LKPD_${instansiPrefix}${selectedMaterial?.code || operation}_${materialName}.pdf`;
                try {
                  setIsExportingPdf(true);
                  await exportWorksheetToPdf(paperRef.current, fileName, setIsExportingPdf);
                } catch (err) {
                  console.error("PDF export failed:", err);
                  onPrint();
                } finally {
                  setIsExportingPdf(false);
                }
              } else {
                onPrint();
              }
            }}
            disabled={isExportingPdf || isPrinting}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs px-3 sm:px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60 select-none"
          >
            {isExportingPdf || isPrinting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyiapkan PDF...</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Unduh PDF</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer"
            title="Tutup Pratinjau (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Gesture Canvas Viewport */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col items-center justify-start p-2 cursor-grab active:cursor-grabbing select-none"
      >
        {/* Scaled Layout Wrapper: perfectly centers the paper visually in DOM on any screen */}
        <div
          style={{
            width: `${Math.round(A4_WIDTH_PX * scale)}px`,
            height: `${Math.round(paperHeight * scale)}px`,
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
            transition: isPinching ? 'none' : 'transform 0.08s ease-out, width 0.08s ease-out, height 0.08s ease-out',
          }}
          className="relative mx-auto mt-2 sm:mt-4 mb-28 shrink-0 flex items-start justify-center"
        >
          {/* Scaled A4 Paper Container with exact same WorksheetPaper as printable document */}
          <div
            ref={paperRef}
            style={{
              width: `${A4_WIDTH_PX}px`,
              minWidth: `${A4_WIDTH_PX}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              transition: isPinching ? 'none' : 'transform 0.08s ease-out',
            }}
            className="text-left absolute top-0 left-0 select-text"
          >
            <WorksheetPaper
              headerData={headerData}
              selectedMaterial={selectedMaterial}
              operation={operation}
              totalQuestions={totalQuestions}
              questions={questions}
              showAnswers={showAnswers}
              showNumbers={showNumbers}
              layoutColumns={(layoutColumns > 3 ? 3 : layoutColumns) as 1 | 2 | 3}
              p11Format={p11Format}
              multiplicationFormat={multiplicationFormat}
              containerId="fullscreen-paper-sheet"
              isInteractivePreview={true}
            />
          </div>
        </div>
      </div>

      {/* 3. Floating Quick Zoom Controls (Mobile & Desktop) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-auto">
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-emerald-950/95 text-emerald-200 border border-emerald-700/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium shadow-2xl flex items-center gap-1.5 whitespace-nowrap pointer-events-none font-sans"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
            <span>Cubit layar dengan 2 jari untuk zoom in / out</span>
          </motion.div>
        )}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl text-white font-display">
        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl active:scale-95 transition-all cursor-pointer"
          title="Perkecil (Zoom Out)"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Current Scale Badge */}
        <button
          onClick={handleResetFit}
          className="px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 hover:text-white bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-colors"
          title="Klik untuk Fit Lebar Layar"
        >
          {Math.round(scale * 100)}%
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl active:scale-95 transition-all cursor-pointer"
          title="Perbesar (Zoom In)"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>

        {/* Fit to Screen */}
        <button
          onClick={handleResetFit}
          className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            Math.abs(scale - fitScale) < 0.05
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Sesuaikan dengan Layar Penuh"
        >
          Fit
        </button>

        {/* 100% Actual Scale */}
        <button
          onClick={handleZoom100}
          className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            Math.abs(scale - 1.0) < 0.05
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Ukuran Asli Kertas 100%"
        >
          100%
        </button>

        {/* Reset Pan/Position */}
        <button
          onClick={() => {
            handleResetFit();
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl active:scale-95 transition-colors cursor-pointer"
          title="Reset Posisi & Zoom"
          aria-label="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        </div>
      </div>

      {/* PDF Exporting Progress Modal Overlay */}
      {isExportingPdf && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none pointer-events-auto font-sans">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
              <Printer className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1 font-display">
              Menyiapkan Dokumen PDF...
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Menyusun halaman A4 siap cetak dengan resolusi tinggi. Mohon tunggu beberapa saat.
            </p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full animate-pulse w-3/4"></div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
