// API route для Nuxt - GET /api/stands
// Работа с файловой JSON-базой

import { promises as fs } from "fs";
import { join } from "path";

// Путь к файлу с "базой данных"
const dataPath = join(process.cwd(), "server/data/stands.json");

/**
 * Читает данные стендов из файла
 * @returns {Promise<Object>} данные стендов
 */
async function readStandsData() {
  const raw = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(raw);
}

export default defineEventHandler(async (event) => {
  try {
    const data = await readStandsData();
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
