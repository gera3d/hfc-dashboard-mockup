'use client';

import { useEffect, useRef, useState } from 'react';

interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number; // Delay in milliseconds before animation starts
  duration?: number; // Animation duration in milliseconds
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'; // Slide direction
  className?: string;
  once?: boolean; // Whether to animate only once
}

export default function FadeInSection({
  children,
  delay = 0,
  duration = 600,
  direction = 'up',
  className = '',
  once = true
}: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated)) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
        } else if (!once && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '50px' // Start animation slightly before element enters viewport
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay, once, hasAnimated]);

  // Calculate transform based on direction
  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translateY(30px)';
        case 'down':
          return 'translateY(-30px)';
        case 'left':
          return 'translateX(30px)';
        case 'right':
          return 'translateX(-30px)';
        case 'none':
        default:
          return 'none';
      }
    }
    return 'translate(0, 0)';
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {children}
    </div>
  );
}
