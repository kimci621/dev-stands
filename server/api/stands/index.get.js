// API route для получения стендов - GET /api/stands
// Работа с Supabase

import { useSupabase } from "~/composables/useSupabase";

export default defineEventHandler(async (event) => {
  try {
    const { getStands, initializeDefaultData } = useSupabase();

    // Инициализируем дефолтные данные если их нет
    await initializeDefaultData();

    // Получаем стенды
    const result = await getStands();

    return result;
  } catch (error) {
    console.error("Ошибка получения стендов:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка чтения базы данных",
    });
  }
});
