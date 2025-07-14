// API route для Vercel/Nuxt - POST /api/reset

export default defineEventHandler(async (event) => {
  try {
    // Инициализируем данные если не существуют
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
    } else {
      // Сброс всех стендов
      Object.values(globalThis.standsData.stands).forEach((group) => {
        group.forEach((stand) => {
          stand.status = "free";
          stand.occupiedBy = null;
          stand.occupiedAt = null;
        });
      });
      globalThis.standsData.lastReset = Date.now();
    }

    console.log("Выполнен принудительный сброс стендов");

    return {
      stands: globalThis.standsData.stands,
      lastReset: globalThis.standsData.lastReset,
      timestamp: Date.now(),
      message: "Все стенды успешно сброшены",
    };
  } catch (error) {
    console.error("Ошибка при сбросе стендов:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера",
    });
  }
});
