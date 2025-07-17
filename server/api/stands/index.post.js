// API route для обновления стенда - POST /api/stands
// Работа с Supabase

import { useSupabase } from "~/composables/useSupabase";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { standId, action, user } = body;

    if (!standId || !action) {
      throw createError({
        statusCode: 400,
        statusMessage: "standId и action обязательны",
      });
    }

    const { updateStand } = useSupabase();

    let updates = {};

    if (action === "occupy") {
      if (!user || !user.email) {
        throw createError({
          statusCode: 400,
          statusMessage: "Данные пользователя обязательны для захвата стенда",
        });
      }

      updates = {
        status: "Занят",
        occupied_by: user.email,
        occupied_at: new Date().toISOString(),
      };
    } else if (action === "release") {
      updates = {
        status: "Свободен",
        occupied_by: null,
        occupied_at: null,
      };
    } else if (action === "set_task_url") {
      if (!body.task_url || typeof body.task_url !== "string") {
        throw createError({
          statusCode: 400,
          statusMessage: "task_url обязателен и должен быть строкой",
        });
      }
      updates = {
        task_url: body.task_url,
      };
    } else if (action === "unset_task_url") {
      updates = {
        task_url: null,
      };
    } else if (action === "set_ended_at") {
      if (!body.ended_at) {
        throw createError({
          statusCode: 400,
          statusMessage: "ended_at обязателен",
        });
      }
      // Проверяем, что ended_at - валидная дата
      const endedAtDate = new Date(body.ended_at);
      if (isNaN(endedAtDate.getTime())) {
        throw createError({
          statusCode: 400,
          statusMessage: "ended_at должен быть валидной датой",
        });
      }
      updates = {
        ended_at: endedAtDate.toISOString(),
      };
    } else if (action === "unset_ended_at") {
      updates = {
        ended_at: null,
      };
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "Неизвестное действие",
      });
    }

    // Обновляем стенд
    const updatedStand = await updateStand(standId, updates);

    return {
      success: true,
      stand: updatedStand,
      message:
        action === "occupy"
          ? "Стенд успешно занят"
          : "Стенд успешно освобожден",
    };
  } catch (error) {
    console.error("Ошибка обновления стенда:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка обновления стенда",
    });
  }
});
