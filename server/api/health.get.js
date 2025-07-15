// API route для проверки здоровья - GET /api/health
// Проверяет доступность Supabase

import { useSupabase } from "~/composables/useSupabase";

export default defineEventHandler(async (event) => {
  try {
    const { supabase } = useSupabase();

    // Проверяем подключение к Supabase
    const { data, error, count } = await supabase
      .from("stands")
      .select("*", { count: "exact", head: true });

    if (error) {
      return {
        status: "ERROR",
        db: "connection_failed",
        timestamp: Date.now(),
        uptime: process.uptime(),
        message: "Не удается подключиться к Supabase",
        error: error.message,
      };
    }

    return {
      status: "OK",
      db: "connected",
      timestamp: Date.now(),
      uptime: process.uptime(),
      message: "API сервер и Supabase работают",
      stands_count: count || 0,
    };
  } catch (error) {
    console.error("Health check error:", error);

    return {
      status: "ERROR",
      db: "error",
      timestamp: Date.now(),
      uptime: process.uptime(),
      message: "Ошибка проверки состояния",
      error: error.message,
    };
  }
});
