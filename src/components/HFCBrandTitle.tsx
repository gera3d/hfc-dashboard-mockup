import React from 'react';

interface HFCBrandTitleProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export default function HFCBrandTitle({ 
  size = 'lg', 
  showSubtitle = true,
  className = '' 
}: HFCBrandTitleProps) {
  
  const sizeClasses = {
    sm: 'text-xl md:text-2xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-2xl md:text-3xl lg:text-4xl',
    xl: 'text-3xl md:text-4xl lg:text-5xl'
  };

  return (
    <div className={`text-center ${className}`}>
      <h1 className={`${sizeClasses[size]} text-white tracking-tight inline-block`} style={{ lineHeight: '1.1', letterSpacing: '-0.01em' }}>
        <span style={{ 
          fontWeight: 800, 
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
          color: 'white'
        }}>
          HEALTH
        </span>
        {' '}
        <span style={{ 
          color: '#f5b942', 
          fontStyle: 'italic', 
          fontWeight: 400, 
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '0.85em'
        }}>
          for
        </span>
        {' '}
        <span style={{ 
          fontWeight: 800, 
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
          color: 'white'
        }}>
          CALIFORNIA
        </span>
      </h1>
      {showSubtitle && (
        <p className="text-white/90 text-sm md:text-base font-light mt-1">
          Reviews Dashboard
        </p>
      )}
    </div>
  );
}
