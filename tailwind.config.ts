import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0a0e27',
        surface: '#141b3d',
        surface2: '#1a2347',
        'text-primary': '#ffffff',
        'text-secondary': '#a0aec0',
        statistician: '#6366f1',
        optimist: '#10b981',
        pessimist: '#f59e0b',
        contrarian: '#8b5cf6',
        expert: '#06b6d4',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
