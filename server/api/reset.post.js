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
        name: "deploy_dev",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 2,
        name: "deploy_dev2",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 3,
        name: "deploy_dev3",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 4,
        name: "deploy_dev4",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 5,
        name: "deploy_dev5",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 6,
        name: "deploy_dev6",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 7,
        name: "deploy_dev7",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 8,
        name: "deploy_aws_dev",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 9,
        name: "deploy_loadtest",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
    ],
    backend: [
      {
        id: 1,
        name: "deploy_dev",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 2,
        name: "deploy_dev2",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 3,
        name: "deploy_dev3",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 4,
        name: "deploy_dev4",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 5,
        name: "deploy_dev5",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 6,
        name: "deploy_dev6",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 7,
        name: "deploy_dev7",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 8,
        name: "deploy_aws_dev",
        status: "free",
        occupiedBy: null,
        occupiedAt: null,
      },
      {
        id: 9,
        name: "deploy_loadtest",
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
