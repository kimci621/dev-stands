// Плагин для автоматического сброса стендов в полночь
export default defineNuxtPlugin(() => {
  if (process.client) {
    /**
     * Проверка необходимости автоматического сброса
     */
    const checkAutoReset = async () => {
      try {
        const { useApi } = await import("~/composables/useApi");
        const api = useApi();

        // Просто вызываем API для проверки - логика сброса уже в server/api/stands.get.js
        await api.healthCheck();
      } catch (error) {
        console.warn("Ошибка при проверке автоматического сброса:", error);
      }
    };

    // Проверяем каждую минуту
    const intervalId = setInterval(checkAutoReset, 60000);

    // Очистка при размонтировании
    if (process.client) {
      window.addEventListener("beforeunload", () => {
        clearInterval(intervalId);
      });
    }

    console.log("🕛 Автоматический сброс стендов в полночь активирован");
  }
});
