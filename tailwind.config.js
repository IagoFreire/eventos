/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          dark: '#B8860B',
        },
        beige: {
          DEFAULT: '#F5F5DC',
          dark: '#E8DCC4',
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
      },
      backdropBlur: {
        sm: '8px',
      },
    },
  },
  plugins: [],
}
