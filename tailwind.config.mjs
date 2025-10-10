import { join } from 'path'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}'),
    join(__dirname, 'app/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': 'var(--color-brand-primary)',
        'brand-accent': 'var(--color-brand-accent)',
        'brand-alert': 'var(--color-brand-alert)',
        'background-app': 'var(--color-background-app)',
        'background-surface': 'var(--color-background-surface)',
        'background-elevated': 'var(--color-background-elevated)',
        'background-subtle': 'var(--color-background-subtle)',
        'background-overlay': 'var(--color-background-overlay)',
        'signal-gold': 'var(--color-signal-gold)',
        'signal-platinum': 'var(--color-signal-platinum)',
        'signal-positive': 'var(--color-signal-positive)',
        'signal-caution': 'var(--color-signal-caution)',
        'signal-negative': 'var(--color-signal-negative)',
      },
      fontFamily: {
        display: ["var(--font-display)", 'Space Grotesk', 'Inter', 'system-ui'],
        sans: ["var(--font-sans)", 'Inter', 'system-ui'],
        mono: ["var(--font-mono)", 'IBM Plex Mono', 'ui-monospace'],
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '28px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 10px 30px -20px rgba(11, 31, 51, 0.25)',
        elevated: '0 25px 65px -35px rgba(11, 31, 51, 0.35)',
        elevatedStrong: '0 35px 85px -30px rgba(11, 31, 51, 0.45)',
        overlay: '0 20px 60px rgba(6, 12, 20, 0.45)',
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shine: 'shine 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
