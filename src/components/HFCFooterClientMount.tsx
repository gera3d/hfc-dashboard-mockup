"use client";

import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import HFCFooter from './HFCFooter';

export default function HFCFooterClientMount() {
  useEffect(() => {
    const el = document.getElementById('hfc-footer-root');
    if (!el) return;
    // If already mounted, skip
    if ((el as any).__mounted) return;
    try {
      const root = createRoot(el);
      root.render(<HFCFooter />);
      (el as any).__mounted = true;
    } catch (err) {
      console.error('Error mounting HFCFooter:', err);
    }
  }, []);

  return null;
}
