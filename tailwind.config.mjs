import { join } from 'path'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}'),
    join(__dirname, 'app/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Keep existing custom colors for backward compatibility
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
      borderRadius: {
        DEFAULT: '6px',  // Standard buttons, inputs
        sm: '4px',       // Badges
        md: '8px',       // Cards
        lg: '12px',      // Large cards
        xl: '16px',      // Hero sections
      },
      boxShadow: {
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
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
