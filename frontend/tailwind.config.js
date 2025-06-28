/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000',
        secondary: '#fff',
      },
    },
    backgroundColor: {
      black: '#000',
      white: '#fff',
    },
    textColor: {
      black: '#000',
      white: '#fff',
    },
  },
  plugins: [],
};
