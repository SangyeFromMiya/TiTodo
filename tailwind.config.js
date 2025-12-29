/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Todoist color palette
        brand: {
          red: {
            DEFAULT: '#DC4C3E',
            50: '#FEF2F2',
            100: '#FEE2E2', 
            500: '#DC4C3E',
            600: '#B91C1C',
            700: '#991B1B',
          },
        },
        gray: {
          25: '#FAFAFA',
          50: '#F5F5F5',
          100: '#F4F4F6',
          200: '#E5E5E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#202020',
          950: '#171717',
          // Dark mode colors
          dark: {
            bg: '#1F1F1F',
            surface: '#2A2A2A',
            border: '#333333',
            text: '#E5E5E5',
            muted: '#A1A1AA',
          }
        },
        priority: {
          high: '#DC4C3E',
          medium: '#EAB308', 
          low: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        tibetan: ['Jomolhari', 'system-ui', 'serif'],
      },
      fontSize: {
        'tibetan': ['18px', { lineHeight: '2.0' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'task-complete': 'taskComplete 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        taskComplete: {
          '0%': { 
            opacity: '1', 
            transform: 'translateX(0) scale(1)' 
          },
          '50%': { 
            opacity: '0.5', 
            transform: 'translateX(-10px) scale(0.98)' 
          },
          '100%': { 
            opacity: '0', 
            transform: 'translateX(-100%) scale(0.95)' 
          },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
}