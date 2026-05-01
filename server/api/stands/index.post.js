// API route для обновления стенда - POST /api/stands
// Работа с Supabase

import { useSupabase } from "~/composables/useSupabase";
import {
  getAuditRequestContext,
  writeAuditLog,
} from "~/server/utils/auditLog";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { standId, action, user } = body;

    if (!action) {
      throw createError({
        statusCode: 400,
        statusMessage: "action обязателен",
      });
    }

    const {
      createStand,
      deleteStand,
      getStandById,
      getStandByNameAndType,
      updateStand,
    } = useSupabase();

    let updates = {};
    let previousStand = null;
    let updatedStand = null;

    const normalizeStandName = (value) =>
      typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

    const normalizeStandType = (value) =>
      typeof value === "string" ? value.trim().toLowerCase() : "";

    const requireStandId = () => {
      if (!standId) {
        throw createError({
          statusCode: 400,
          statusMessage: "standId обязателен",
        });
      }
    };

    if (action === "occupy") {
      requireStandId();

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
      requireStandId();

      updates = {
        status: "Свободен",
        occupied_by: null,
        occupied_at: null,
        ended_at: null,
        task_url: null,
        comment: null,
      };
    } else if (action === "set_task_url") {
      requireStandId();

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
      requireStandId();

      updates = {
        task_url: null,
      };
    } else if (action === "set_ended_at") {
      requireStandId();

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
      requireStandId();

      updates = {
        ended_at: null,
      };
    } else if (action === "set_comment") {
      requireStandId();

      updates = {
        comment: body.comment,
      };
    } else if (action === "create_stand") {
      const name = normalizeStandName(body.name);
      const type = normalizeStandType(body.type);

      if (!user || !user.email) {
        throw createError({
          statusCode: 400,
          statusMessage: "Данные пользователя обязательны для создания стенда",
        });
      }

      if (!name || name.length < 2) {
        throw createError({
          statusCode: 400,
          statusMessage: "Название стенда должно быть не короче 2 символов",
        });
      }

      if (!["frontend", "backend"].includes(type)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Тип стенда должен быть frontend или backend",
        });
      }

      const existingStand = await getStandByNameAndType(name, type);
      if (existingStand) {
        throw createError({
          statusCode: 409,
          statusMessage: "Стенд с таким названием и типом уже существует",
        });
      }

      updatedStand = await createStand({
        name,
        type,
        status: "Свободен",
      });

      await writeAuditLog({
        event: "stands.create_stand",
        standId: updatedStand.id,
        userEmail: user.email,
        request: getAuditRequestContext(event),
        previousStand: null,
        updatedStand,
        updates: { name, type, status: "Свободен" },
      });

      return {
        success: true,
        stand: updatedStand,
        message: "Стенд успешно создан",
      };
    } else if (action === "update_stand_meta") {
      requireStandId();

      const name = normalizeStandName(body.name);
      const type = normalizeStandType(body.type);

      if (!user || !user.email) {
        throw createError({
          statusCode: 400,
          statusMessage:
            "Данные пользователя обязательны для редактирования стенда",
        });
      }

      if (!name || name.length < 2) {
        throw createError({
          statusCode: 400,
          statusMessage: "Название стенда должно быть не короче 2 символов",
        });
      }

      if (!["frontend", "backend"].includes(type)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Тип стенда должен быть frontend или backend",
        });
      }

      previousStand = await getStandById(standId);
      const existingStand = await getStandByNameAndType(name, type);
      if (existingStand && existingStand.id !== standId) {
        throw createError({
          statusCode: 409,
          statusMessage: "Стенд с таким названием и типом уже существует",
        });
      }

      updates = { name, type };
    } else if (action === "delete_stand") {
      requireStandId();

      if (!user || !user.email) {
        throw createError({
          statusCode: 400,
          statusMessage: "Данные пользователя обязательны для удаления стенда",
        });
      }

      previousStand = await getStandById(standId);
      updatedStand = await deleteStand(standId);

      await writeAuditLog({
        event: "stands.delete_stand",
        standId,
        userEmail: user.email,
        request: getAuditRequestContext(event),
        previousStand,
        updatedStand: null,
        updates: null,
      });

      return {
        success: true,
        stand: updatedStand,
        message: "Стенд успешно удален",
      };
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "Неизвестное действие",
      });
    }

    if (!previousStand) {
      previousStand = await getStandById(standId);
    }

    // Обновляем стенд
    updatedStand = await updateStand(standId, updates);

    await writeAuditLog({
      event: `stands.${action}`,
      standId,
      userEmail: user?.email || null,
      request: getAuditRequestContext(event),
      previousStand,
      updatedStand,
      updates,
    });

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
