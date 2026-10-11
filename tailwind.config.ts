import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Premium Design Tokens
        brand: {
          navy: '#0F172A',
          indigo: '#4F46E5',
          violet: '#7C3AED',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          surface: '#F8FAFC',
          border: '#E2E8F0',
          darkBg: '#090D16',
          darkCard: '#0F172A',
          darkBorder: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'premium': '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        'glow-indigo': '0 0 25px rgba(79, 70, 229, 0.25)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.25)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 1) 100%)',
        'gradient-dark-surface': 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(9, 13, 22, 1) 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
