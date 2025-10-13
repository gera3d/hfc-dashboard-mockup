'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // Animation duration in milliseconds
  decimals?: number; // Number of decimal places
  className?: string;
  suffix?: string; // Optional suffix like '%', '★', etc.
  prefix?: string; // Optional prefix like '$', etc.
}

export default function AnimatedNumber({
  value,
  duration = 800,
  decimals = 0,
  className = '',
  suffix = '',
  prefix = ''
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(value);
  const animationFrameRef = useRef<number | undefined>();
  const startTimeRef = useRef<number | undefined>();

  useEffect(() => {
    // If value hasn't changed, don't animate
    if (previousValue.current === value) {
      return;
    }

    setIsAnimating(true);
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();
    startTimeRef.current = startTime;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic for smooth deceleration)
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      // Calculate current value
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
        setIsAnimating(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span className={`${className} ${isAnimating ? 'transition-colors' : ''}`}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
