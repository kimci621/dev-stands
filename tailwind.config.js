/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        "stand-free": "#22c55e", // Зеленый для свободных стендов
        "stand-occupied": "#ef4444", // Красный для занятых стендов
        "stand-card": "#f3f4f6", // Серый фон карточек
      },
    },
  },
  plugins: [],
};
