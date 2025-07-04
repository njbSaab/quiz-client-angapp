const { join } = require("path"); // Импорт функции join из модуля path

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, "src/**/*.{html,ts}"), // Укажите пути к Angular файлам
  ],
  theme: {
    extend: {
      colors: {
        "bright-blue": "var(--bright-blue)",
        "electric-violet": "var(--electric-violet)",
        "french-violet": "var(--french-violet)",
        "vivid-pink": "var(--vivid-pink)",
        "hot-red": "var(--hot-red)",
        "orange-red": "var(--orange-red)",
        "gray-900": "var(--gray-900)",
        "gray-700": "var(--gray-700)",
        "gray-400": "var(--gray-400)",
      },
      backgroundImage: {
        "vertical-gradient": "var(--red-to-pink-to-purple-vertical-gradient)",
        "horizontal-gradient":
          "var(--red-to-pink-to-purple-horizontal-gradient)",
        "purple-gradient": "var(--purple-vertical-gradient)",
        "top-purple-gradient": "var(--top-purple-vertical-gradient)",
        "card-gradient": "var(--card-gradient)",
      },
    },
  },
  plugins: [require("daisyui")], // Подключение DaisyUI
  daisyui: {
    themes: [
      {
        bumblebee: {
          primary: "oklch(53.18% 0.28 296.97)",
          secondary: "oklch(47.66% 0.246 305.88)",
          accent: "oklch(69.02% 0.277 332.77)",
          neutral: "#e6e6e6",
          "base-100": "#ffffff",
        },
      },
      {
        dracula: {
          primary: "oklch(47.66% 0.246 305.88)",
          secondary: "oklch(53.18% 0.28 296.97)",
          accent: "oklch(69.02% 0.277 332.77)",
          neutral: "#3c3c3c",
          "base-100": "#282a36",
        },
      },
    ], // Укажите темы
  },
};
