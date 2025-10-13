'use client';

import { useEffect, useState } from 'react';

interface AnimatedPreviewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'bottom';
  delay?: number;
}

export function AnimatedPreview({ children, direction = 'left', delay = 0 }: AnimatedPreviewProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Trigger a brief animation when content changes
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Animation duration
    
    return () => clearTimeout(timer);
  }, [children]); // Re-run when children change
  
  const animationClass = {
    left: isAnimating ? 'translate-x-[-4px]' : 'translate-x-0',
    right: isAnimating ? 'translate-x-[4px]' : 'translate-x-0',
    bottom: isAnimating ? 'translate-y-[4px]' : 'translate-y-0'
  }[direction];
  
  return (
    <div
      className={`transition-all duration-300 ease-out ${animationClass}`}
    >
      {children}
    </div>
  );
}
