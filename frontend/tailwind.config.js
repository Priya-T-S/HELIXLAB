/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'accent': {
          'cyan': '#22d3ee',
          'blue': '#3b82f6',
          'indigo': '#6366f1',
          'emerald': '#10b981',
        },
        'bg': {
          'dark': '#0a1628',
          'darker': '#051018',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

