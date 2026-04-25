/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/popup/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          dark: '#1a1a1a',
        },
        muted: {
          DEFAULT: '#f4f4f5',
          dark: '#27272a',
        },
      },
    },
  },
  plugins: [],
}
