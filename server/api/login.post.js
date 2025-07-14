// API route для входа пользователя
// POST /api/login
// Примитивная аутентификация: email + пароль (plain)

import { promises as fs } from "fs";
import { join } from "path";

const usersPath = join(process.cwd(), "server/data/users.json");

async function readUsers() {
  const raw = await fs.readFile(usersPath, "utf-8");
  return JSON.parse(raw);
}

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email и пароль обязательны",
    });
  }
  const users = await readUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Неверный email или пароль",
    });
  }
  // Возвращаем без пароля
  return { id: user.id, name: user.name, email: user.email };
});
