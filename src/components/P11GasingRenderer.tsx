import React from 'react';
import { motion } from 'motion/react';

interface P11GasingRendererProps {
  numbers: number[];
  layout?: 'horizontal' | 'vertical';
  showAnswers?: boolean;
  stepIndex?: number; // default to fully solved
  activeIndex?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function P11GasingRenderer({
  numbers,
  layout = 'horizontal',
  showAnswers = true,
  stepIndex = numbers.length,
  activeIndex = -1,
  className = "",
  size = 'md'
}: P11GasingRendererProps) {
  // Safe step index check
  const currentStep = stepIndex === undefined || stepIndex < 0 ? numbers.length : stepIndex;

  // Calculate slashes and small digits up to currentStep
  const slashes = Array(numbers.length).fill(false);
  const smallDigits = Array(numbers.length).fill(null);
  
  let currentSum = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    const isVisited = i <= currentStep;
    const prevSum = currentSum;
    const tempSum = prevSum + numbers[i];
    if (tempSum >= 10) {
      if (isVisited) {
        slashes[i] = true;
        smallDigits[i] = tempSum % 10;
      }
      currentSum = tempSum % 10;
    } else {
      if (isVisited) {
        slashes[i] = false;
        smallDigits[i] = null;
      }
      currentSum = tempSum;
    }
  }

  const coretCount = slashes.filter((x, idx) => x && idx <= currentStep).length;

  // Build the state representation for debugging as requested by the user
  const renderItems = numbers.map((num, idx) => {
    const isSlashed = showAnswers && slashes[idx];
    const smallDigit = showAnswers ? smallDigits[idx] : null;
    const isVisited = idx <= currentStep;
    return {
      value: num,
      crossed: isSlashed,
      remembered: smallDigit !== null ? smallDigit : undefined,
      processed: isVisited
    };
  });

  // Temporarily print the render state before rendering for active debugging
  console.log(`[P11GasingRenderer] Step ${currentStep}/${numbers.length}: Input numbers:`, numbers);
  console.table(renderItems);

  // Sizing styles
  const textSizes = {
    sm: {
      num: 'text-base font-bold',
      sign: 'text-xs mx-0.5',
      small: 'text-[9px] mt-0',
      wrap: 'gap-y-3 gap-x-0.5',
      vertH: 'h-6'
    },
    md: {
      num: 'text-xl font-bold',
      sign: 'text-sm mx-1',
      small: 'text-[11px] mt-0.5',
      wrap: 'gap-y-4 gap-x-1',
      vertH: 'h-8'
    },
    lg: {
      num: 'text-3xl font-black',
      sign: 'text-lg mx-1.5',
      small: 'text-sm mt-0.5',
      wrap: 'gap-y-6 gap-x-1.5',
      vertH: 'h-10'
    },
    xl: {
      num: 'text-5xl font-black',
      sign: 'text-2xl mx-2.5',
      small: 'text-lg mt-1',
      wrap: 'gap-y-8 gap-x-2.5',
      vertH: 'h-14'
    }
  };

  const currentSize = textSizes[size];

  // Top offsets for small digits in horizontal layout to avoid overlap and align perfectly
  const smallTopOffsets = {
    sm: '-top-3',
    md: '-top-4',
    lg: '-top-6',
    xl: '-top-8'
  };

  if (layout === 'horizontal') {
    return (
      <div className={`inline-flex flex-wrap items-center font-mono ${currentSize.wrap} ${className}`}>
        {numbers.map((num, idx) => {
          const isSlashed = showAnswers && slashes[idx];
          const smallDigit = showAnswers ? smallDigits[idx] : null;
          const isVisited = idx <= currentStep;
          const isActive = activeIndex === idx;
          const isLastDigit = idx === numbers.length - 1;
          const isCircled = (isSlashed && isVisited && smallDigit !== null && (isLastDigit || currentStep >= numbers.length));

          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span className={`text-slate-400 font-sans font-bold ${currentSize.sign}`}>
                  +
                </span>
              )}
              <div className="relative flex flex-col items-center justify-center px-1.5 py-0.5">
                <span className={`relative transition-all duration-150 ${
                  isActive ? 'text-indigo-700 scale-110 font-black' : 'text-slate-800'
                } ${currentSize.num}`}>
                  {num}
                  
                  {isSlashed && isVisited && (
                    <motion.span 
                      initial={{ width: 0 }}
                      animate={{ width: '130%' }}
                      className="absolute h-[3px] bg-red-600 left-[-15%] top-[45%] rounded transform -rotate-[35deg] origin-left pointer-events-none shadow-sm"
                      style={{ display: 'block' }}
                    />
                  )}

                  {isSlashed && isVisited && smallDigit !== null && (
                    <span 
                      className={`absolute left-1/2 font-black text-indigo-650 font-sans ${currentSize.small} ${
                        isCircled 
                          ? 'border border-indigo-600 rounded-[45%_55%_50%_45%] px-1 bg-indigo-50/50' 
                          : ''
                      }`}
                      style={{
                        top: size === 'sm' ? '-11px' : size === 'md' ? '-15px' : size === 'lg' ? '-23px' : '-35px',
                        transform: 'translateX(-50%)',
                        lineHeight: 1
                      }}
                    >
                      {smallDigit}
                    </span>
                  )}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  } else {
    // Vertical Layout
    return (
      <div className={`inline-flex flex-col items-end relative font-mono ${className}`} style={{ minWidth: size === 'sm' ? '40px' : size === 'md' ? '60px' : size === 'lg' ? '90px' : '140px' }}>
        {numbers.map((num, idx) => {
          const isSlashed = showAnswers && slashes[idx];
          const smallDigit = showAnswers ? smallDigits[idx] : null;
          const isVisited = idx <= currentStep;
          const isActive = activeIndex === idx;
          const isLastDigit = idx === numbers.length - 1;
          const isCircled = (isSlashed && isVisited && smallDigit !== null && (isLastDigit || currentStep >= numbers.length));

          return (
            <div 
              key={idx} 
              className={`relative flex items-center justify-end w-full transition-all duration-150 ${currentSize.vertH} ${
                isActive ? 'scale-110' : ''
              }`}
            >
              <span className={`relative inline-block ${
                isActive ? 'text-indigo-700 font-black' : 'text-slate-800'
              } ${currentSize.num}`}>
                {num}

                {isSlashed && isVisited && (
                  <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: '130%' }}
                    className="absolute h-[3px] bg-red-600 left-[-15%] top-[45%] rounded transform -rotate-[35deg] origin-left pointer-events-none shadow-sm"
                    style={{ display: 'block' }}
                  />
                )}

                {isSlashed && isVisited && smallDigit !== null && (
                  <span 
                    className={`absolute right-[115%] font-black text-indigo-650 font-sans ${currentSize.small} ${
                      isCircled 
                        ? 'border border-indigo-600 rounded-[45%_55%_50%_45%] px-0.5 bg-indigo-50/50' 
                        : ''
                    }`}
                    style={{
                      top: size === 'sm' ? '-2px' : size === 'md' ? '-3px' : size === 'lg' ? '-4px' : '-6px',
                      lineHeight: 1
                    }}
                  >
                    {smallDigit}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
}
