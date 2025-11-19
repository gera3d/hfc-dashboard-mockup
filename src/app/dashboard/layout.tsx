"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/supabase';
import HFCFooter from '@/components/HFCFooter';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { session } = await getSession();
    if (!session) {
      router.push('/');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  };

  // No loading screen here - let the page component handle it
  // This prevents double-loading screens
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <>
      {children}
    </>
  );
}
