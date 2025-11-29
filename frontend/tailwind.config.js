/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primexaGold: "#facc15",
        primexaDark: "#0a0a0a",
      },
    },
  },
  plugins: [],
};
