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

  // Настройка для Vercel
  // nitro: {
  // preset: "vercel",
  // devProxy удалён, чтобы не было проксирования на несуществующий Express
  // },
});
