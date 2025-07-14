import Aura from "@primeuix/themes/aura";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // Отключаем SSR для полностью frontend решения
  ssr: false,

  modules: ["@nuxtjs/tailwindcss", "@primevue/nuxt-module"],

  css: ["primeicons/primeicons.css"],

  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
  },

  // Автоимпорты компонентов
  components: true,

  // Импорт композаблов
  imports: {
    dirs: ["composables"],
  },

  // Настройка для корректной работы с API
  nitro: {
    devProxy: {
      "/api": {
        target: "http://localhost:3001/api",
        changeOrigin: true,
      },
    },
  },
});
