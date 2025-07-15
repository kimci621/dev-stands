// API route для сброса всех стендов - POST /api/stands/reset
// Работа с Supabase

import { useSupabase } from "~/composables/useSupabase";

export default defineEventHandler(async (event) => {
  try {
    const { resetAllStands } = useSupabase();

    // Сбрасываем все стенды
    await resetAllStands();

    return {
      success: true,
      message: "Все стенды успешно сброшены",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Ошибка сброса стендов:", error);

    throw createError({
      statusCode: 500,
      statusMessage: `Ошибка сброса стендов: ${error.message}`,
    });
  }
});
