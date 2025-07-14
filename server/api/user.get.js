// API route для получения информации о пользователе
// GET /api/user?email=...

import { promises as fs } from "fs";
import { join } from "path";

const usersPath = join(process.cwd(), "server/data/users.json");

async function readUsers() {
  const raw = await fs.readFile(usersPath, "utf-8");
  return JSON.parse(raw);
}

export default defineEventHandler(async (event) => {
  const email = getQuery(event).email;
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: "Email обязателен" });
  }
  const users = await readUsers();
  const user = users.find((u) => u.email === email);
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Пользователь не найден",
    });
  }
  // Возвращаем без пароля
  return { id: user.id, name: user.name, email: user.email };
});
