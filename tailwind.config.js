/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        body: ['Outfit', 'sans-serif']
      },
      colors: {
        surface: {
          DEFAULT: '#0d1117',
          card:    '#161b22',
          hover:   '#1c2230',
          border:  '#21262d'
        },
        accent: {
          green:  '#39d353',
          red:    '#f85149',
          amber:  '#e3b341',
          blue:   '#58a6ff',
          purple: '#bc8cff'
        }
      }
    }
  },
  plugins: []
}
