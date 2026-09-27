export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0a0a',
          black: '#000000',
          yellow: '#fcee0a',
          blue: '#00f0ff',
          red: '#ff003c',
          purple: '#2C4669'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(to right, #2C4669 1px, transparent 1px), linear-gradient(to bottom, #2C4669 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
