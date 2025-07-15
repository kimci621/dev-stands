import Aura from "@primeuix/themes/aura";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  compatibilityDate: "2024-07-15",
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

  // Конфигурация Supabase
  runtimeConfig: {
    public: {
      supabaseUrl: "https://wtzkeiycwhmlsctzfugz.supabase.co",
      supabaseAnonKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0emtlaXljd2htbHNjdHpmdWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTk3MzMsImV4cCI6MjA2ODEzNTczM30.Qzqy7ZfcRn_M_fHbFcXBGKdxT-cbCiLELWxztYUFqVM",
    },
  },
});
