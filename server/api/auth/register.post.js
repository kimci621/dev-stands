// API route для регистрации - POST /api/auth/register
// Работа с Supabase

import { useSupabase } from "~/composables/useSupabase";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, email, password } = body;

    // Валидация данных
    if (!name || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Имя, email и пароль обязательны",
      });
    }

    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: "Пароль должен содержать минимум 6 символов",
      });
    }

    const { getUserByEmail, createUser } = useSupabase();

    // Проверяем, не существует ли пользователь с таким email
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: "Пользователь с таким email уже существует",
      });
    }

    // Создаем нового пользователя
    const newUser = await createUser({
      name,
      email,
      password, // В реальном проекте используйте bcrypt для хеширования
    });

    // Возвращаем данные пользователя (без пароля)
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      message: "Пользователь успешно зарегистрирован",
    };
  } catch (error) {
    console.error("Ошибка регистрации:", error);

    if (error.statusCode) {
      throw error;
    }

    // Обработка ошибок Supabase
    if (error.code === "23505") {
      // Unique constraint violation
      throw createError({
        statusCode: 409,
        statusMessage: "Пользователь с таким email уже существует",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка сервера при регистрации",
    });
  }
});
