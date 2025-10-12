'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggleButton } from '@/components/tailadmin/common/ThemeToggleButton';

export default function HFCFooter() {
  const { theme } = useTheme();
  if (theme !== 'hfc') return null;

  return (
    <footer className="fixed bottom-4 left-0 right-0 flex items-center justify-center pointer-events-auto z-40">
      <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-4 shadow-lg border border-white/10">
        <ThemeToggleButton />
        <Link href="/settings" className="text-sm text-white/90 hover:underline">Settings</Link>
      </div>
    </footer>
  );
}
