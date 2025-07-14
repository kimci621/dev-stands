// API route для регистрации пользователя
// POST /api/register
// Примитивная регистрация: имя, email, пароль (plain)

import { promises as fs } from "fs";
import { join } from "path";

const usersPath = join(process.cwd(), "server/data/users.json");

/**
 * Читает массив пользователей из файла
 */
async function readUsers() {
  const raw = await fs.readFile(usersPath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Записывает массив пользователей в файл
 */
async function writeUsers(users) {
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2), "utf-8");
}

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readBody(event);
  if (!name || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Все поля обязательны",
    });
  }
  const users = await readUsers();
  // Проверка уникальности email
  if (users.some((u) => u.email === email)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Пользователь с таким email уже существует",
    });
  }
  // Примитивная запись (id = timestamp)
  const user = { id: Date.now(), name, email, password };
  users.push(user);
  await writeUsers(users);
  // Возвращаем без пароля
  return { id: user.id, name: user.name, email: user.email };
});
