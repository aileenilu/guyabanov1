/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f9f4',
          100: '#dcf1e7',
          200: '#b8e3ce',
          300: '#86cead',
          400: '#50b285',
          500: '#2d9166',
          600: '#1f7451',
          700: '#1a5e42',
          800: '#174b36',
          900: '#133e2d',
          950: '#0a2319',
        },
        gold: {
          50: '#fefbea',
          100: '#fdf5c8',
          200: '#fbea8e',
          300: '#f8d84a',
          400: '#f4c41c',
          500: '#d4a50e',
          600: '#c8960a',
          700: '#a3720b',
          800: '#875a10',
          900: '#724a12',
          950: '#432706',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 165, 14, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 165, 14, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
