/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
 
  theme: {
    extend: {
      colors: {
        blue: '#267FFF',
        bluelight: '#6495ED',
      }
    },
  },
  plugins: [],
}