// API route для сброса просроченных стендов - POST /api/stands/reset-expired
// Работа с Supabase

import { useSupabase } from "~/composables/useSupabase";

export default defineEventHandler(async (event) => {
  try {
    const { resetExpiredStands } = useSupabase();

    // Сбрасываем просроченные стенды
    const result = await resetExpiredStands();

    return {
      success: true,
      message: `Сброшено ${result.count} просроченных стендов`,
      resetCount: result.count,
      stands: result.stands,
    };
  } catch (error) {
    console.error("Ошибка сброса просроченных стендов:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка сброса просроченных стендов",
    });
  }
});
