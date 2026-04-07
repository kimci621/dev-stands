// API route для получения стендов - GET /api/stands
// Работа с Supabase

import { useSupabase } from "~/composables/useSupabase";
import {
  getAuditRequestContext,
  writeAuditLog,
} from "~/server/utils/auditLog";

export default defineEventHandler(async (event) => {
  try {
    const { getStands, ensureDefaultStands } = useSupabase();

    const initResult = await ensureDefaultStands();

    if (initResult.inserted > 0) {
      await writeAuditLog({
        event: "stands.ensure-defaults",
        source: "server/api/stands/index.get",
        inserted: initResult.inserted,
        skipped: initResult.skipped,
        request: getAuditRequestContext(event),
      });
    }

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
