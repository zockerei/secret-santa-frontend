/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#dc2626',
          green: '#16a34a',
          gold: '#ca8a04',
        }
      }
    },
  },
  plugins: [],
}
