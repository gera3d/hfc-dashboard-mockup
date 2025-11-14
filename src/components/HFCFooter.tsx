'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggleButton } from '@/components/tailadmin/common/ThemeToggleButton';
import { signOut } from '@/lib/supabase';
import { LogOut } from 'lucide-react';

export default function HFCFooter() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  
  // Don't show footer on login page (root path)
  if (theme !== 'hfc' || pathname === '/') return null;

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <footer className="mt-8 mb-8 flex items-center justify-center">
      <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-6 shadow-xl border border-white/20">
        <ThemeToggleButton />
        <div className="h-5 w-px bg-white/30"></div>
        <Link href="/settings" className="text-sm font-medium text-white hover:text-white/90 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
        <div className="h-5 w-px bg-white/30"></div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-white hover:text-white/90 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </footer>
  );
}
