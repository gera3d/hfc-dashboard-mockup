"use client";

import React, { useState, useEffect } from 'react';
import HFCBrandTitle from '@/components/HFCBrandTitle';
import { CheckCircle2, Loader2 } from 'lucide-react';

// Add fade animations
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
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-fadeOut {
    animation: fadeOut 0.5s ease-out forwards;
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
      <div className={`fixed inset-0 flex items-center justify-center ${
        isHFC 
          ? 'bg-gradient-to-br from-[#2c5f8d] via-[#1e5a8e] to-[#164670]' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
      }`}>
      <div className="flex flex-col items-center gap-8 w-full max-w-md px-6">
        {/* HFC Brand Logo */}
        {isHFC && (
          <div className="mb-2">
            <HFCBrandTitle size="xl" showSubtitle={false} />
          </div>
        )}
        
        {/* Spinner with pulse effect */}
        <div className="relative w-20 h-20">
          {/* Outer pulse ring */}
          <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
            isHFC ? 'bg-[#f5b942]' : 'bg-indigo-600 dark:bg-indigo-400'
          }`} 
          style={{ animationDuration: '2s' }}
          />
          
          {/* Static ring */}
          <div className={`absolute inset-0 border-4 rounded-full ${
            isHFC 
              ? 'border-white/20' 
              : 'border-gray-300/50 dark:border-gray-700/50'
          }`} />
          
          {/* Spinning gradient ring */}
          <div className={`absolute inset-0 border-4 rounded-full border-transparent animate-spin ${
            isHFC 
              ? 'border-t-[#f5b942] border-r-[#f5b942]/50' 
              : 'border-t-indigo-600 border-r-indigo-400 dark:border-t-indigo-400 dark:border-r-indigo-500'
          }`} 
          style={{ animationDuration: '1s' }}
          />
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className={`h-2 rounded-full overflow-hidden ${
            isHFC ? 'bg-white/10' : 'bg-gray-200 dark:bg-gray-700'
          }`}>
            <div 
              className={`h-full transition-all duration-300 ease-out ${
                isHFC 
                  ? 'bg-gradient-to-r from-[#f5b942] to-[#e8a825]' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Progress percentage */}
          <div className={`text-xs text-center mt-2 font-medium ${
            isHFC ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {Math.round(progress)}%
          </div>
        </div>

        {/* Loading Steps */}
        <div className="w-full space-y-3 min-h-[60px]">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            // Only show current step, hide completed and pending ones
            if (isPending || isCompleted) return null;

            return (
              <div 
                key={step.id}
                className="flex items-center gap-3 transition-all duration-500 animate-fadeIn"
              >
                {/* Status Icon */}
                <div className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${
                  isHFC ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>

                {/* Step Label */}
                <div className={`text-sm font-semibold transition-colors duration-200 ${
                  isHFC ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                  {step.label}
                </div>

                {/* Animation for current step */}
                <div className={`ml-auto flex gap-1 ${
                  isHFC ? 'opacity-60' : 'opacity-50'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimated time remaining */}
        <div className={`text-xs ${
          isHFC ? 'text-white/50' : 'text-gray-400 dark:text-gray-500'
        }`}>
          {progress < 100 ? (
            <>Estimated time: {Math.ceil((totalDuration - (progress / 100 * totalDuration)) / 1000)}s</>
          ) : (
            <>Almost ready...</>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
