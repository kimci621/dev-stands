// API route для Nuxt - POST /api/stands
// Работа с файловой JSON-базой

import { promises as fs } from "fs";
import { join } from "path";

const dataPath = join(process.cwd(), "server/data/stands.json");

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
 * @param {Object} data - новые данные
 */
async function writeStandsData(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    if (!body.stands) {
      throw createError({
        statusCode: 400,
        statusMessage: "Нет данных стендов",
      });
    }
    // Читаем текущие данные
    const data = await readStandsData();
    // Обновляем
    data.stands = body.stands;
    // Сохраняем обратно
    await writeStandsData(data);
    return {
      stands: data.stands,
      lastReset: data.lastReset,
      timestamp: Date.now(),
      message: "Стенды успешно обновлены",
    };
  } catch (error) {
    console.error("Ошибка в POST /api/stands:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка записи базы данных",
    });
  }
});
