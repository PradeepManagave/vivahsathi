import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#570013',
          50: '#fff8f9',
          100: '#ffdada',
          200: '#ffb3b5',
          300: '#ff828a',
          400: '#e04a5c',
          500: '#800020',
          600: '#570013',
          700: '#4d0011',
          800: '#3d000d',
          900: '#2e000a',
          950: '#1a0005'
        },
        secondary: {
          DEFAULT: '#7b5800',
          50: '#fff8e6',
          100: '#ffdea6',
          200: '#fdc34d',
          300: '#f7bd48',
          400: '#d49a1e',
          500: '#7b5800',
          600: '#5d4200',
          700: '#4a3500',
          800: '#3d2c00',
          900: '#2e2200',
          950: '#1a1400'
        },
        accent: {
          gold: '#fdc34d',
          maroon: '#800020'
        },
        // Surface Colors (Warm cream palette)
        surface: {
          DEFAULT: '#fff8ef',
          50: '#ffffff',
          100: '#fbf3e4',
          200: '#f5edde',
          300: '#efe7d9',
          400: '#e9e2d3',
          500: '#e1d9cb',
          600: '#d4cabb'
        },
        // Semantic Colors
        success: '#1a7f37',
        warning: '#9a6700',
        error: '#ba1a1a',
        info: '#002a42'
      },
      fontFamily: {
        headline: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        body: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace']
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }]
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem'
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        'main': '80rem'
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
        'full': '9999px'
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(30, 27, 19, 0.04), 0 4px 24px -4px rgba(30, 27, 19, 0.08)',
        'medium': '0 4px 16px -4px rgba(30, 27, 19, 0.08), 0 8px 32px -8px rgba(30, 27, 19, 0.12)',
        'hard': '0 8px 24px -8px rgba(87, 0, 19, 0.2)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(30, 27, 19, 0.04)',
        'glow': '0 0 20px rgba(253, 195, 77, 0.3)',
        'glow-primary': '0 0 20px rgba(128, 0, 32, 0.3)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'marquee': 'marquee 25s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/4': '3 / 4',
        '5/6': '5 / 6',
        '6/5': '6 / 5',
        'cinema': '21 / 9'
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))'
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem'
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
          '3xl': '1536px'
        }
      },
      screens: {
        'xs': '475px',
        ...defaultTheme.screens
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100'
      },
      typography: (theme: (arg: string) => string) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.stone.700'),
            '--tw-prose-headings': theme('colors.stone.900'),
            '--tw-prose-links': theme('colors.primary.600'),
            maxWidth: '75ch'
          }
        },
        invert: {
          css: {
            '--tw-prose-body': theme('colors.stone.300'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': theme('colors.primary.400')
          }
        }
      })
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    require('tailwind-scrollbar')({ nocompatible: true })
  ]
};

export default config;
