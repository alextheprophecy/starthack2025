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
    },
  },
  plugins: [],
}; 