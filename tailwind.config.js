/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        plum: { DEFAULT: '#E2C37E', deep: '#050403' },
        cream: '#F3EBDD',
        night: '#0B0908',
        beige: '#15110D',
        surface: '#1A1511',
        gold: '#C9A25C',
        ink: '#EDE5D6',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
