// API route для Vercel/Nuxt - POST /api/stands

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.stands) {
      throw createError({
        statusCode: 400,
        statusMessage: "Отсутствуют данные стендов",
      });
    }

    // Инициализируем данные если не существуют
    if (!globalThis.standsData) {
      globalThis.standsData = {
        stands: body.stands,
        lastReset: Date.now(),
      };
    } else {
      // Обновляем данные
      globalThis.standsData.stands = body.stands;
    }

    console.log("Стенды обновлены через API");

    return {
      stands: globalThis.standsData.stands,
      lastReset: globalThis.standsData.lastReset,
      timestamp: Date.now(),
      message: "Стенды успешно обновлены",
    };
  } catch (error) {
    console.error("Ошибка в POST /api/stands:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера",
    });
  }
});
