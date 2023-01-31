/* eslint-disable no-undef */

module.exports = {
  content: [
    "./src/**/*.{tsx,ts,css}"
  ],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        currentColor: "currentColor",
        white: "#fff",
        black: "#000",
        back: "#282c34",
      }
    }
  },
  plugins: [
    require("tailwind-dracula")(),
  ],
  important: true
};