// API route для пересоздания всех стендов - POST /api/stands/recreate
// Работа с Supabase

import { useSupabase } from "~/composables/useSupabase";

export default defineEventHandler(async (event) => {
  try {
    const { recreateStands } = useSupabase();

    // Пересоздаем все стенды
    await recreateStands();

    return {
      success: true,
      message: "Все стенды успешно пересозданы",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Ошибка пересоздания стендов:", error);

    throw createError({
      statusCode: 500,
      statusMessage: `Ошибка пересоздания стендов: ${error.message}`,
    });
  }
});
