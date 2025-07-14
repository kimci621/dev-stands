<template>
  <div id="app">
    <!-- Основное содержимое приложения -->
    <NuxtPage />
  </div>
</template>

<script setup>
// Мета-информация приложения
useHead({
  title: "Управление стендами разработки",
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      name: "description",
      content:
        "Минималистичное веб-приложение для управления стендами разработки",
    },
    { name: "author", content: "Stand Manager Team" },
  ],
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});
</script>

<style>
/* Глобальные стили */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-family: "Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f9fafb;
  color: #1f2937;
  line-height: 1.6;
}

/* Улучшенная прокрутка для webkit браузеров */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Фокус для доступности */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Глобальные утилитарные классы */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Кастомизация PrimeVue компонентов */
.p-toast {
  z-index: 9999;
}

.p-toast .p-toast-message {
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.p-dialog {
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.p-dialog-header {
  border-radius: 12px 12px 0 0;
}

/* Глобальные стили для инпутов */
.p-inputtext {
  color: #1f2937 !important;
  background-color: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(8px);
}

.p-inputtext:focus {
  background-color: white !important;
  color: #111827 !important;
}

.p-inputtext::placeholder {
  color: #9ca3af !important;
}

/* Анимации появления */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Адаптивная типографика */
@media (max-width: 640px) {
  html {
    font-size: 14px;
  }
}

@media (min-width: 1024px) {
  html {
    font-size: 16px;
  }
}

/* Темная тема (опционально) */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #111827;
    color: #f9fafb;
  }

  ::-webkit-scrollbar-track {
    background: #374151;
  }

  ::-webkit-scrollbar-thumb {
    background: #6b7280;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  /* Инпуты в темной теме */
  .p-inputtext {
    color: #f9fafb !important;
    background-color: rgba(31, 41, 55, 0.5) !important;
  }

  .p-inputtext:focus {
    background-color: #374151 !important;
    color: #f9fafb !important;
  }

  .p-inputtext::placeholder {
    color: #6b7280 !important;
  }
}

/* Печать */
@media print {
  .no-print {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
  }
}

/* Уменьшение анимаций для пользователей с предпочтением */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
