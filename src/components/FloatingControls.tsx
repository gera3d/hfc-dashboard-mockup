"use client";

import { useTheme } from '@/context/ThemeContext';

export default function FloatingControls() {
  const { theme } = useTheme();
  
  // Disabled - HFC theme uses footer instead
  if (theme === 'hfc') return null;
  
  return null;
}
