import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f4c81',
          light: '#1a6bb5',
          dark: '#0a355a',
        },
        success: '#16a34a',
        warning: '#ca8a04',
        danger: '#dc2626',
        neutral: '#6b7280',
        background: '#f8fafc',
        foreground: '#0f172a',
        border: '#e2e8f0',
      },
    },
  },
  plugins: [],
}

export default config
