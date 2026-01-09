import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Deep Medical Teal
        primary: {
          50: '#e6f7f7',
          100: '#ccefef',
          200: '#99dfdf',
          300: '#66cfcf',
          400: '#33bfbf',
          500: '#00a0a0',
          600: '#008080', // Main primary
          700: '#006666',
          800: '#004d4d',
          900: '#003333',
        },
        // Secondary - Warm Coral for CTAs
        secondary: {
          50: '#fff5f2',
          100: '#ffe6e0',
          200: '#ffc9b8',
          300: '#ffab90',
          400: '#ff8e68',
          500: '#ff7040', // Main secondary
          600: '#e55a2b',
          700: '#cc4520',
          800: '#993316',
          900: '#66220e',
        },
        // Accent - Trust Blue
        accent: {
          50: '#e8f4fc',
          100: '#d1e9f9',
          200: '#a3d4f3',
          300: '#75bfed',
          400: '#47aae7',
          500: '#1995e1', // Main accent
          600: '#1477b4',
          700: '#0f5987',
          800: '#0a3b5a',
          900: '#051e2d',
        },
        // Healthcare-specific grays
        healthcare: {
          background: '#f8fafa',
          card: '#ffffff',
          border: '#e2e8f0',
          text: '#1e293b',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': `
          radial-gradient(at 40% 20%, rgba(0, 128, 128, 0.15) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(25, 149, 225, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(0, 128, 128, 0.1) 0px, transparent 50%),
          radial-gradient(at 80% 50%, rgba(255, 112, 64, 0.08) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(25, 149, 225, 0.1) 0px, transparent 50%)
        `,
        'hero-pattern': `
          linear-gradient(135deg, rgba(0, 128, 128, 0.03) 25%, transparent 25%),
          linear-gradient(225deg, rgba(0, 128, 128, 0.03) 25%, transparent 25%),
          linear-gradient(45deg, rgba(0, 128, 128, 0.03) 25%, transparent 25%),
          linear-gradient(315deg, rgba(0, 128, 128, 0.03) 25%, transparent 25%)
        `,
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'healthcare': '0 4px 20px -2px rgba(0, 128, 128, 0.08)',
        'healthcare-lg': '0 10px 40px -5px rgba(0, 128, 128, 0.12)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.04), 0 8px 32px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.06), 0 12px 48px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
