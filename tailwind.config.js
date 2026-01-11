/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bronze: '#CD7F32',
        gold: '#D4AF37',
      }
    },
  },
  plugins: [],
}