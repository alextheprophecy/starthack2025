/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e1432f', // red base color
          light: '#fce7e6',   // light pink
        },
        white: '#ffffff',
      },
      fontFamily: {
        sans: ['HelveticaNeue', 'Helvetica', 'Arial', 'sans-serif'],
        'helvetica': ['HelveticaNeue', 'Helvetica', 'Arial', 'sans-serif'],
        'helvetica-light': ['HelveticaNeueLight', 'Helvetica', 'Arial', 'sans-serif'],
        'helvetica-medium': ['HelveticaNeueMedium', 'Helvetica', 'Arial', 'sans-serif'],
        'helvetica-bold': ['HelveticaNeueBold', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        red: {
          600: '#e10a0a', // Virgin-style red
          700: '#c50909', // Darker red for hover states
          100: '#fee2e2', // Light red for backgrounds
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
    },
  },
  plugins: [],
}; 