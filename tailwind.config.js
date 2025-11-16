/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'confetti': 'confetti 0.5s ease-in-out',
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
