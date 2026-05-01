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
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
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
  background:
    radial-gradient(
      circle at 18% 0%,
      rgba(218, 123, 147, 0.16),
      transparent 32rem
    ),
    radial-gradient(
      circle at 90% 10%,
      rgba(55, 110, 111, 0.2),
      transparent 30rem
    ),
    #071012;
  color: #edf7f8;
  line-height: 1.6;
}

/* Улучшенная прокрутка для webkit браузеров */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0b171a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #376e6f;
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #da7b93;
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
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background: #0b171a;
  color: #edf7f8;
  border: 1px solid rgba(218, 123, 147, 0.22);
}

.p-dialog {
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  background: #0b171a;
  color: #edf7f8;
  border: 1px solid rgba(218, 123, 147, 0.22);
}

.p-dialog-header {
  border-radius: 20px 20px 0 0;
  background: #0b171a;
  color: #edf7f8;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.p-dialog-content {
  background: #0b171a;
  color: #edf7f8;
}

.p-dialog .p-dialog-header-icon {
  color: #d8e7e8;
}

/* Глобальные стили для инпутов */
.p-inputtext {
  color: #edf7f8 !important;
  background-color: rgba(16, 31, 35, 0.9) !important;
  backdrop-filter: blur(8px);
  border-color: rgba(255, 255, 255, 0.12) !important;
}

.p-inputtext:focus {
  background-color: #14282b !important;
  color: #ffffff !important;
  border-color: #da7b93 !important;
  box-shadow: 0 0 0 3px rgba(218, 123, 147, 0.15) !important;
}

.p-inputtext::placeholder {
  color: #8ca5a7 !important;
}

.p-select {
  color: #edf7f8 !important;
  background-color: rgba(16, 31, 35, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

.p-select:not(.p-disabled).p-focus {
  border-color: #da7b93 !important;
  box-shadow: 0 0 0 3px rgba(218, 123, 147, 0.15) !important;
}

.p-select-label,
.p-select-dropdown {
  color: #edf7f8 !important;
}

.p-select-overlay {
  background: #0b171a !important;
  color: #edf7f8 !important;
  border: 1px solid rgba(218, 123, 147, 0.22) !important;
}

.p-select-option {
  color: #d8e7e8 !important;
}

.p-select-option.p-focus,
.p-select-option.p-select-option-selected {
  background: rgba(218, 123, 147, 0.16) !important;
  color: #ffffff !important;
}

.p-button {
  border-radius: 14px;
  font-weight: 700;
}

.p-button:focus {
  box-shadow: 0 0 0 3px rgba(218, 123, 147, 0.16) !important;
}

.p-radiobutton .p-radiobutton-box {
  background: rgba(16, 31, 35, 0.9);
  border-color: rgba(255, 255, 255, 0.18);
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
