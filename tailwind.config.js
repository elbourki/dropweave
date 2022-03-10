const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        muted: "#30363d",
        highlight: "#21262d",
      },
      fontFamily: {
        sans: ["DM Sans", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
