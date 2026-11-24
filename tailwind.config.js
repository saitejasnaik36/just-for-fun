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
        shield: {
          orange: '#FF6A1A',
          amber: '#F59E0B',
          cyan: '#00F0FF',
          blue: '#38BDF8',
          red: '#EF4444',
          emerald: '#10B981',
          dark: '#080C14',
          panel: '#0D1424',
          border: 'rgba(56, 189, 248, 0.2)'
        }
      },
      fontFamily: {
        tech: ['"Orbitron"', '"Chakra Petch"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
