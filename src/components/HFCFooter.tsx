'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggleButton } from '@/components/tailadmin/common/ThemeToggleButton';

export default function HFCFooter() {
  const { theme } = useTheme();
  if (theme !== 'hfc') return null;

  return (
    <footer className="mt-8 mb-8 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-4 shadow-lg border border-white/10">
        <ThemeToggleButton />
        <Link href="/settings" className="text-sm text-white hover:text-white/80 transition-colors">Settings</Link>
      </div>
    </footer>
  );
}
