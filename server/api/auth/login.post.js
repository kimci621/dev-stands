// API route для аутентификации - POST /api/auth/login
// Работа с Supabase

import { useSupabase } from "~/composables/useSupabase";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password } = body;

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email и пароль обязательны",
      });
    }

    const { getUserByEmail } = useSupabase();

    // Ищем пользователя по email
    const user = await getUserByEmail(email);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Неверный email или пароль",
      });
    }

    // Проверяем пароль (в реальном проекте используйте bcrypt)
    if (user.password !== password) {
      throw createError({
        statusCode: 401,
        statusMessage: "Неверный email или пароль",
      });
    }

    // Возвращаем данные пользователя (без пароля)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error("Ошибка входа:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка сервера при входе",
    });
  }
});
