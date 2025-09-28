import { designTokens, type ThemeMode } from './design-tokens'

export function applyTheme(mode: ThemeMode = 'light') {
  const root = document.documentElement
  
  // Apply color tokens
  root.style.setProperty('--color-brand-primary', designTokens.colors.brand.primary)
  root.style.setProperty('--color-brand-accent', designTokens.colors.brand.accent)
  root.style.setProperty('--color-brand-alert', designTokens.colors.brand.alert)
  
  root.style.setProperty('--color-background-app', designTokens.colors.background.app)
  root.style.setProperty('--color-background-surface', designTokens.colors.background.surface)
  root.style.setProperty('--color-background-elevated', designTokens.colors.background.elevated)
  root.style.setProperty('--color-background-subtle', designTokens.colors.background.subtle)
  root.style.setProperty('--color-background-overlay', designTokens.colors.background.overlay)
  
  root.style.setProperty('--color-signal-gold', designTokens.colors.signal.gold)
  root.style.setProperty('--color-signal-platinum', designTokens.colors.signal.platinum)
  root.style.setProperty('--color-signal-positive', designTokens.colors.signal.positive)
  root.style.setProperty('--color-signal-caution', designTokens.colors.signal.caution)
  root.style.setProperty('--color-signal-negative', designTokens.colors.signal.negative)
  
  // Apply typography tokens
  root.style.setProperty('--font-display', designTokens.typography.families.display)
  root.style.setProperty('--font-sans', designTokens.typography.families.sans)
  root.style.setProperty('--font-mono', designTokens.typography.families.mono)
}

export function useTheme() {
  if (typeof window !== 'undefined') {
    applyTheme('light')
  }
}