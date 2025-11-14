'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Hide navigation on the login page (root path)
  const isLoginPage = pathname === '/';
  
  // Don't render nav components until mounted to avoid flash
  const showNav = mounted && !isLoginPage;
  
  return (
    <>
      {showNav && <TopNav />}
      <main className={isLoginPage ? '' : 'pt-16'}>
        {children}
      </main>
    </>
  );
}
