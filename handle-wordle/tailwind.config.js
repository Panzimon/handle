/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6aaa64',
        secondary: '#c9b458',
        neutral: '#787c7e',
      },
    },
  },
  plugins: [],
}