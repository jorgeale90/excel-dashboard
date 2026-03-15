/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        // Dark mode colors (default)
        surface: {
          DEFAULT: '#0d1117',
          card:    '#161b22',
          hover:   '#1c2230',
          border:  '#21262d'
        },
        // Light mode colors
        'surface-light': {
          DEFAULT: '#ffffff',
          card:    '#f6f8fa',
          hover:   '#f3f4f6',
          border:  '#e5e7eb'
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
