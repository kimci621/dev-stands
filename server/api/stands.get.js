// API route для Vercel/Nuxt - GET /api/stands

// Используем глобальное хранилище для serverless функций
if (!globalThis.standsData) {
  globalThis.standsData = {
    stands: {
      frontend: [
        {
          id: 1,
          name: "Frontend Stand 1",
          status: "free",
          occupiedBy: null,
          occupiedAt: null,
        },
        {
          id: 2,
          name: "Frontend Stand 2",
          status: "free",
          occupiedBy: null,
          occupiedAt: null,
        },
        {
          id: 3,
          name: "Frontend Stand 3",
          status: "free",
          occupiedBy: null,
          occupiedAt: null,
        },
      ],
      backend: [
        {
          id: 4,
          name: "Backend Stand 1",
          status: "free",
          occupiedBy: null,
          occupiedAt: null,
        },
        {
          id: 5,
          name: "Backend Stand 2",
          status: "free",
          occupiedBy: null,
          occupiedAt: null,
        },
        {
          id: 6,
          name: "Backend Stand 3",
          status: "free",
          occupiedBy: null,
          occupiedAt: null,
        },
      ],
    },
    lastReset: Date.now(),
  };
}

/**
 * Проверка необходимости автоматического сброса
 */
function checkAutoReset() {
  const now = new Date();
  const lastResetDate = new Date(globalThis.standsData.lastReset);

  // Если прошло 24 часа или время сейчас 00:00
  if (
    now.getDate() !== lastResetDate.getDate() ||
    (now.getHours() === 0 && now.getMinutes() === 0)
  ) {
    // Сброс всех стендов
    Object.values(globalThis.standsData.stands).forEach((group) => {
      group.forEach((stand) => {
        stand.status = "free";
        stand.occupiedBy = null;
        stand.occupiedAt = null;
      });
    });
    globalThis.standsData.lastReset = Date.now();
    console.log("Автоматический сброс стендов выполнен");
  }
}

export default defineEventHandler(async (event) => {
  try {
    checkAutoReset(); // Проверяем необходимость сброса

    return {
      stands: globalThis.standsData.stands,
      lastReset: globalThis.standsData.lastReset,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Ошибка в GET /api/stands:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера",
    });
  }
});
