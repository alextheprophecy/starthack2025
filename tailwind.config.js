/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
      }
    },
  },
  plugins: [],
}; 