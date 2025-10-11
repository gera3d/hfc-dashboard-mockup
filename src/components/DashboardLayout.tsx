'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import TopNav from '@/components/TopNav';
import { DateRange } from '@/data/dataService';

interface DashboardLayoutProps {
  children: ReactNode;
  selectedRange?: DateRange;
  compareMode?: boolean;
  onRangeChange?: (range: DateRange) => void;
  onCompareModeChange?: (enabled: boolean) => void;
  dateRanges?: Record<string, DateRange>;
}

export default function DashboardLayout({
  children,
  selectedRange,
  compareMode,
  onRangeChange,
  onCompareModeChange,
  dateRanges
}: DashboardLayoutProps) {
  const { theme } = useTheme();
  
  return (
    <>
      <TopNav 
        selectedRange={selectedRange}
        compareMode={compareMode}
        onRangeChange={onRangeChange}
        onCompareModeChange={onCompareModeChange}
        dateRanges={dateRanges}
      />
      <main className={theme === 'hfc' ? 'pt-20' : 'pt-16'}>
        {children}
      </main>
    </>
  );
}
