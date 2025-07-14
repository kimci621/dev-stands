// API route для Nuxt - POST /api/reset
// Работа с файловой JSON-базой

import { promises as fs } from "fs";
import { join } from "path";

const dataPath = join(process.cwd(), "server/data/stands.json");

// Начальные данные для сброса
const initialData = {
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
  lastReset: 0,
};

export default defineEventHandler(async (event) => {
  try {
    // Обновляем lastReset
    initialData.lastReset = Date.now();
    // Перезаписываем файл начальными данными
    await fs.writeFile(dataPath, JSON.stringify(initialData, null, 2), "utf-8");
    return {
      stands: initialData.stands,
      lastReset: initialData.lastReset,
      timestamp: Date.now(),
      message: "Все стенды успешно сброшены",
    };
  } catch (error) {
    console.error("Ошибка при сбросе стендов:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка сброса базы данных",
    });
  }
});
