// API route для Nuxt - GET /api/stands
// Работа с файловой JSON-базой

import { promises as fs } from "fs";
import { join } from "path";

// Путь к файлу с "базой данных"
const dataPath = join(process.cwd(), "server/data/stands.json");

// Дефолтные стенды
const defaultStands = {
  // Дефолтные стенды, соответствующие списку из запроса
  frontend: [
    {
      id: 1,
      name: "deploy_loadtest",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
    {
      id: 2,
      name: "deploy_dev",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
    {
      id: 3,
      name: "deploy_dev2",
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
      name: "deploy_dev3",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
    {
      id: 9,
      name: "deploy_aws_dev",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
  ],
  backend: [
    {
      id: 1,
      name: "deploy_loadtest",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
    {
      id: 2,
      name: "deploy_dev",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
    {
      id: 3,
      name: "deploy_dev2",
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
      name: "deploy_dev3",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
    {
      id: 9,
      name: "deploy_aws_dev",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
  ],
};

/**
 * Читает данные стендов из файла
 * @returns {Promise<Object>} данные стендов
 */
async function readStandsData() {
  const raw = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Записывает данные стендов в файл
 */
async function writeStandsData(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
}

export default defineEventHandler(async (event) => {
  try {
    let data = await readStandsData();
    // Если массивы пустые или отсутствуют — автоинициализация
    if (
      !data.stands ||
      !Array.isArray(data.stands.frontend) ||
      !Array.isArray(data.stands.backend) ||
      data.stands.frontend.length === 0 ||
      data.stands.backend.length === 0
    ) {
      data = {
        stands: defaultStands,
        lastReset: Date.now(),
      };
      await writeStandsData(data);
    }
    return {
      stands: data.stands,
      lastReset: data.lastReset,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Ошибка чтения stands.json:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка чтения базы данных",
    });
  }
});
