import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#1f2933',
        paper: '#f8fafc',
        moss: '#386641',
        rust: '#b45309',
        lake: '#2563eb'
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: [typography],
} satisfies Config;
