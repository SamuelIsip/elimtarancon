module.exports = {
  content: ["./*.html", "./js/**/*.js", "./node_modules/flowbite/**/*.js"],
  theme: {
    fontFamily: {
      mono: ["Monotype Corsiva", "serif"],
    },
    extend: {
      animation: {
        fadeIn: "fadeIn 1s ease-out 0.2s 1 forwards",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
