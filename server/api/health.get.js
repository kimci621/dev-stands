// API route для Nuxt - GET /api/health
// Проверяет доступность "базы данных" (stands.json)

import { promises as fs } from "fs";
import { join } from "path";

const dataPath = join(process.cwd(), "server/data/stands.json");

export default defineEventHandler(async (event) => {
  try {
    await fs.access(dataPath);
    return {
      status: "OK",
      db: "available",
      timestamp: Date.now(),
      uptime: process.uptime(),
      message: "API сервер и база данных работают",
    };
  } catch (e) {
    return {
      status: "ERROR",
      db: "not found",
      timestamp: Date.now(),
      uptime: process.uptime(),
      message: "Файл базы данных не найден",
    };
  }
});
