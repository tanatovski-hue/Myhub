/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#06070d',
        surface: { DEFAULT: '#11131c', glass: 'rgba(17,19,28,0.86)', elevated: '#161925', input: '#181b26' },
        brand: { DEFAULT: '#2563eb', hover: '#1d4ed8', soft: 'rgba(37,99,235,0.15)' },
        emerald: { DEFAULT: '#10b981', soft: 'rgba(16,185,129,0.14)' },
        amber: { DEFAULT: '#f59e0b', soft: 'rgba(245,158,11,0.14)' },
        danger: { DEFAULT: '#ef4444', soft: 'rgba(239,68,68,0.14)' },
        whatsapp: '#16a34a',
        telegram: '#0284c7',
        ink: { primary: '#f3f4f6', secondary: '#9ca3af', muted: '#6b7280' },
      },
      borderColor: {
        subtle: 'rgba(255,255,255,0.07)',
        hover: 'rgba(255,255,255,0.16)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { sm: '8px', md: '10px', lg: '14px' },
    },
  },
  plugins: [],
};
