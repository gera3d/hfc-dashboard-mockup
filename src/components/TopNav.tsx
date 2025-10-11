'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggleButton } from '@/components/tailadmin/common/ThemeToggleButton';

export default function TopNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${
      theme === 'hfc' 
        ? 'bg-gradient-to-r from-[#1e5a8e] to-[#2673b0] shadow-md' 
        : 'bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800'
    }`}>
      {/* Main Navigation Bar */}
      <div className="px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            {theme === 'hfc' ? (
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white tracking-tight">
                    Health
                  </span>
                  <span className="text-xl font-bold text-[#f5b942]">
                    for California
                  </span>
                </div>
                <span className="text-xs text-white/70 font-medium">Reviews Dashboard</span>
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            )}
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </nav>
  );
}


