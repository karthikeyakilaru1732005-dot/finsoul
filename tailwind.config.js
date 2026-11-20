/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#171D2B',
          light: '#252D3D',
          dark: '#101521',
          card: '#1D2535',
        },
        finsoul: {
          DEFAULT: '#F47B35',
          dark: '#DB6328',
          light: '#FFF1E7',
          muted: '#feebe0',
        },
        cream: {
          DEFAULT: '#F7F6F2',
          dark: '#EEECE5',
        },
        brandGreen: {
          DEFAULT: '#269B73',
          light: '#e8f7f2',
        },
        brandRed: {
          DEFAULT: '#E05252',
          light: '#fdf2f2',
        },
        borderCol: '#E5E2DA',
        subtext: '#737986',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
