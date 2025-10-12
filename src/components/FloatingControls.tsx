"use client";

import Link from 'next/link';
import { ThemeToggleButton } from '@/components/tailadmin/common/ThemeToggleButton';

export default function FloatingControls() {
  return (
    <div className="fixed left-4 bottom-4 z-50">
      <div className="flex flex-col gap-2 items-center">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-2 shadow-lg border border-white/10">
          <ThemeToggleButton />
        </div>
        <Link href="/settings" className="mt-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-2 text-sm text-white/90 shadow-lg border border-white/10">Settings</Link>
      </div>
    </div>
  );
}
