"use client";

import React, { useState, useEffect } from 'react';
import HFCBrandTitle from '@/components/HFCBrandTitle';
import { CheckCircle2, Loader2 } from 'lucide-react';

// Add fade animations and mobile-optimized styles
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0.5;
      transform: translateY(-5px);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }
  
  @keyframes pulse-glow {
    0%, 100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-fadeOut {
    animation: fadeOut 0.5s ease-out forwards;
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  /* Prevent scrolling during loading */
  body:has(.enhanced-loader-active) {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }
`;

interface LoadingStep {
  id: string;
  label: string;
  duration: number; // in milliseconds
}

interface EnhancedLoaderProps {
  theme?: 'hfc' | 'default';
  steps?: LoadingStep[];
  completedSteps?: Set<string>;
  currentStep?: string;
}

const defaultSteps: LoadingStep[] = [
  { id: 'reviews', label: 'Loading review data', duration: 800 },
  { id: 'agents', label: 'Loading agent information', duration: 600 },
  { id: 'departments', label: 'Loading departments', duration: 500 },
  { id: 'metrics', label: 'Calculating metrics', duration: 700 },
];

export default function EnhancedLoader({ 
  theme = 'default',
  steps = defaultSteps,
  completedSteps: externalCompletedSteps,
  currentStep: externalCurrentStep
}: EnhancedLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  const isHFC = theme === 'hfc';
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  // Use external state if provided (real loading), otherwise simulate
  const useRealProgress = externalCompletedSteps !== undefined && externalCurrentStep !== undefined;

  useEffect(() => {
    if (useRealProgress && externalCompletedSteps && externalCurrentStep) {
      // Use real progress from parent component
      setCompletedSteps(externalCompletedSteps);
      
      // Find current step index
      const currentIndex = steps.findIndex(step => step.id === externalCurrentStep);
      if (currentIndex !== -1) {
        setCurrentStepIndex(currentIndex);
      }
      
      // Calculate real progress based on completed steps
      const completedCount = externalCompletedSteps.size;
      const realProgress = (completedCount / steps.length) * 100;
      setProgress(realProgress);
      
      return; // Don't run simulation
    }

    // Fallback: Simulated progress for when real data isn't available
    let elapsedTime = 0;
    let currentIndex = 0;

    const interval = setInterval(() => {
      elapsedTime += 50;
      
      // Calculate overall progress
      const overallProgress = Math.min((elapsedTime / totalDuration) * 100, 100);
      setProgress(overallProgress);

      // Check which step we should be on
      let stepTime = 0;
      for (let i = 0; i < steps.length; i++) {
        stepTime += steps[i].duration;
        if (elapsedTime < stepTime) {
          currentIndex = i;
          break;
        }
      }

      setCurrentStepIndex(currentIndex);

      // Mark previous steps as completed
      const newCompleted = new Set<string>();
      for (let i = 0; i < currentIndex; i++) {
        newCompleted.add(steps[i].id);
      }
      setCompletedSteps(newCompleted);

      // Stop when we've gone through all steps
      if (elapsedTime >= totalDuration) {
        clearInterval(interval);
        // Mark all steps as completed
        const allCompleted = new Set(steps.map(s => s.id));
        setCompletedSteps(allCompleted);
        setProgress(100);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [steps, totalDuration, useRealProgress, externalCompletedSteps, externalCurrentStep]);

  return (
    <>
      <style>{styles}</style>
      <div className={`enhanced-loader-active fixed inset-0 flex items-center justify-center overflow-hidden ${
        isHFC 
          ? 'bg-gradient-to-br from-[#2c5f8d] via-[#1e5a8e] to-[#164670]' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
      }`} style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)', paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
      
      {/* Animated background elements for HFC */}
      {isHFC && (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#f5b942]/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </>
      )}
      
      <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-md px-6 sm:px-8 relative z-10">
        {/* HFC Brand Logo */}
        {isHFC && (
          <div className="mb-2 sm:mb-4 animate-fadeIn">
            <HFCBrandTitle size="lg" showSubtitle={false} />
          </div>
        )}
        
        {/* Spinner with multiple layers - mobile optimized */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 my-4">
          {/* Outer glow pulse */}
          <div className={`absolute inset-0 rounded-full blur-xl opacity-30 animate-ping ${
            isHFC ? 'bg-[#f5b942]' : 'bg-indigo-600 dark:bg-indigo-400'
          }`} 
          style={{ animationDuration: '2s' }}
          />
          
          {/* Middle pulse ring */}
          <div className={`absolute inset-2 rounded-full animate-ping opacity-20 ${
            isHFC ? 'bg-[#f5b942]' : 'bg-indigo-500 dark:bg-indigo-500'
          }`} 
          style={{ animationDuration: '1.5s' }}
          />
          
          {/* Static background ring */}
          <div className={`absolute inset-0 border-[3px] sm:border-4 rounded-full ${
            isHFC 
              ? 'border-white/10 bg-white/5' 
              : 'border-gray-300/30 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50'
          }`} />
          
          {/* Primary spinning gradient ring */}
          <div className={`absolute inset-0 border-[3px] sm:border-4 rounded-full border-transparent animate-spin ${
            isHFC 
              ? 'border-t-[#f5b942] border-r-[#f5b942]/60 border-b-[#f5b942]/30' 
              : 'border-t-indigo-600 border-r-indigo-500 border-b-indigo-400 dark:border-t-indigo-400 dark:border-r-indigo-500 dark:border-b-indigo-600'
          }`} 
          style={{ animationDuration: '0.8s' }}
          />
          
          {/* Secondary counter-spinning ring */}
          <div className={`absolute inset-3 border-[2px] rounded-full border-transparent animate-spin ${
            isHFC 
              ? 'border-l-white/40 border-b-white/20' 
              : 'border-l-indigo-400/40 border-b-indigo-300/20 dark:border-l-indigo-500/40 dark:border-b-indigo-600/20'
          }`} 
          style={{ animationDuration: '1.2s', animationDirection: 'reverse' }}
          />
          
          {/* Center dot */}
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <div className={`w-2 h-2 rounded-full ${
              isHFC ? 'bg-[#f5b942]' : 'bg-indigo-600 dark:bg-indigo-400'
            }`} />
          </div>
        </div>

        {/* Progress Bar - Enhanced */}
        <div className="w-full space-y-2">
          <div className={`relative h-2 sm:h-2.5 rounded-full overflow-hidden backdrop-blur-sm ${
            isHFC ? 'bg-white/10 shadow-inner' : 'bg-gray-200 dark:bg-gray-700 shadow-inner'
          }`}>
            {/* Shimmer effect on track */}
            <div className={`absolute inset-0 animate-shimmer`} />
            
            {/* Progress fill with gradient */}
            <div 
              className={`relative h-full transition-all duration-500 ease-out ${
                isHFC 
                  ? 'bg-gradient-to-r from-[#f5b942] via-[#ffc557] to-[#f5b942] shadow-lg shadow-[#f5b942]/30' 
                  : 'bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 shadow-lg shadow-indigo-500/30'
              }`}
              style={{ 
                width: `${progress}%`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s linear infinite'
              }}
            >
              {/* Glowing edge */}
              <div className={`absolute right-0 top-0 bottom-0 w-1 blur-sm ${
                isHFC ? 'bg-white' : 'bg-white dark:bg-indigo-200'
              }`} />
            </div>
          </div>
          
          {/* Progress percentage with better styling */}
          <div className="flex items-center justify-center gap-2">
            <div className={`text-sm sm:text-base font-bold tabular-nums ${
              isHFC ? 'text-[#f5b942]' : 'text-indigo-600 dark:text-indigo-400'
            }`}>
              {Math.round(progress)}%
            </div>
            <div className={`text-xs font-medium ${
              isHFC ? 'text-white/50' : 'text-gray-500 dark:text-gray-400'
            }`}>
              Complete
            </div>
          </div>
        </div>

        {/* Loading Steps - Enhanced */}
        <div className="w-full space-y-3 min-h-[60px] sm:min-h-[70px]">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            // Only show current step, hide completed and pending ones
            if (isPending || isCompleted) return null;

            return (
              <div 
                key={step.id}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-500 animate-fadeIn ${
                  isHFC 
                    ? 'bg-white/5 backdrop-blur-sm border border-white/10' 
                    : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50'
                }`}
              >
                {/* Status Icon with glow */}
                <div className="relative flex-shrink-0">
                  <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${
                    isHFC ? 'bg-[#f5b942]' : 'bg-indigo-500 dark:bg-indigo-400'
                  }`} />
                  <div className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full ${
                    isHFC 
                      ? 'bg-gradient-to-br from-[#f5b942] to-[#e8a825]' 
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400'
                  }`}>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
                  </div>
                </div>

                {/* Step Label */}
                <div className="flex-1">
                  <div className={`text-sm sm:text-base font-semibold ${
                    isHFC ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {step.label}
                  </div>
                  <div className={`text-xs mt-0.5 ${
                    isHFC ? 'text-white/50' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Please wait...
                  </div>
                </div>

                {/* Animation dots */}
                <div className="flex gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                    isHFC ? 'bg-[#f5b942]' : 'bg-indigo-600 dark:bg-indigo-400'
                  }`} style={{ animationDelay: '0ms' }} />
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                    isHFC ? 'bg-[#f5b942]' : 'bg-indigo-600 dark:bg-indigo-400'
                  }`} style={{ animationDelay: '150ms' }} />
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                    isHFC ? 'bg-[#f5b942]' : 'bg-indigo-600 dark:bg-indigo-400'
                  }`} style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimated time remaining - Enhanced */}
        <div className={`text-center space-y-1 mt-2`}>
          <div className={`text-xs sm:text-sm font-medium ${
            isHFC ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {progress < 100 ? (
              <>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-2" />
                Estimated time: <span className="font-bold">{Math.ceil((totalDuration - (progress / 100 * totalDuration)) / 1000)}s</span>
              </>
            ) : (
              <>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-2" />
                Almost ready...
              </>
            )}
          </div>
          <div className={`text-[10px] sm:text-xs ${
            isHFC ? 'text-white/40' : 'text-gray-400 dark:text-gray-500'
          }`}>
            Setting up your dashboard experience
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
