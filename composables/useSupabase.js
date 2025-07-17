import { createClient } from "@supabase/supabase-js";

let supabase = null;

/**
 * Инициализация клиента Supabase
 */
function initSupabase() {
  if (!supabase) {
    const config = useRuntimeConfig();
    const supabaseUrl = config.public.supabaseUrl;
    const supabaseKey = config.public.supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase URL и ключ должны быть настроены в nuxt.config.ts"
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

/**
 * Composable для работы с Supabase
 * @returns {Object} объект с методами для работы с БД
 */
export const useSupabase = () => {
  const supabase = initSupabase();

  return {
    supabase,

    // Методы для работы с пользователями
    async getUsers() {
      const { data, error } = await supabase.from("users").select("*");

      if (error) throw error;
      return data;
    },

    async getUserByEmail(email) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },

    async createUser(userData) {
      const { data, error } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Методы для работы со стендами
    async getStands() {
      const { data, error } = await supabase
        .from("stands")
        .select("*")
        .order("name");

      if (error) throw error;

      // Преобразуем данные в структуру, ожидаемую фронтендом
      const stands = {
        frontend: [],
        backend: [],
      };

      // Разделяем стенды по типам
      data.forEach((stand) => {
        // Преобразуем статусы для совместимости с фронтендом
        const frontendStand = {
          ...stand,
          status: stand.status === "Занят" ? "occupied" : "free",
          occupiedBy: stand.occupied_by,
          occupiedAt: stand.occupied_at,
        };

        // Распределяем стенды по группам в зависимости от типа
        if (stand.type === "frontend") {
          stands.frontend.push(frontendStand);
        } else if (stand.type === "backend") {
          stands.backend.push(frontendStand);
        } else {
          // Для стендов с неизвестным типом (например "Обычный", "VIP") добавляем в обе группы
          stands.frontend.push(frontendStand);
          stands.backend.push({ ...frontendStand });
        }
      });

      return {
        stands,
        lastReset: Date.now(),
        timestamp: Date.now(),
      };
    },

    async updateStand(standId, updates) {
      const { data, error } = await supabase
        .from("stands")
        .update(updates)
        .eq("id", standId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async resetAllStands() {
      const { data, error } = await supabase
        .from("stands")
        .update({
          status: "Свободен",
          occupied_by: null,
          occupied_at: null,
        })
        .neq("id", "00000000-0000-0000-0000-000000000000") // Обновляем все записи
        .select();

      if (error) throw error;
      return data;
    },

    // Метод для принудительного пересоздания стендов
    async recreateStands() {
      // Удаляем все существующие стенды
      await supabase
        .from("stands")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      // Создаем новые стенды
      const defaultStands = [
        // Frontend стенды
        { name: "FE Deploy Dev", type: "frontend", status: "Свободен" },
        { name: "FE Deploy Dev2", type: "frontend", status: "Свободен" },
        { name: "FE Deploy Dev3", type: "frontend", status: "Свободен" },
        { name: "FE Deploy Dev4", type: "frontend", status: "Свободен" },
        { name: "FE Deploy Dev5", type: "frontend", status: "Свободен" },
        { name: "FE Deploy Dev6", type: "frontend", status: "Свободен" },
        { name: "FE Deploy Dev7", type: "frontend", status: "Свободен" },
        { name: "FE AWS Dev", type: "frontend", status: "Свободен" },
        {
          name: "FE Deploy LoadTest",
          type: "frontend",
          status: "Свободен",
        },
        // BE стенды
        {
          name: "BE Deploy LoadTest",
          type: "backend",
          status: "Свободен",
        },
        { name: "BE Deploy Dev", type: "backend", status: "Свободен" },
        { name: "BE Deploy Dev2", type: "backend", status: "Свободен" },
        { name: "BE Deploy Dev3", type: "backend", status: "Свободен" },
        { name: "BE Deploy Dev4", type: "backend", status: "Свободен" },
        { name: "BE Deploy Dev5", type: "backend", status: "Свободен" },
        { name: "BE Deploy Dev6", type: "backend", status: "Свободен" },
        { name: "BE Deploy Dev7", type: "backend", status: "Свободен" },
        { name: "BE AWS Dev", type: "backend", status: "Свободен" },
        {
          name: "BE Deploy LoadTest",
          type: "backend",
          status: "Свободен",
        },
        // BE стенды API-4
        { name: "BE API-4 Dev", type: "backend", status: "Свободен" },
        { name: "BE API-4 Dev2", type: "backend", status: "Свободен" },
        { name: "BE API-4 Dev3", type: "backend", status: "Свободен" },
        { name: "BE API-4 Dev4", type: "backend", status: "Свободен" },
        { name: "BE API-4 Dev5", type: "backend", status: "Свободен" },
        { name: "BE API-4 Dev6", type: "backend", status: "Свободен" },
        { name: "BE API-4 Dev7", type: "backend", status: "Свободен" },
        { name: "BE API-4 AWS Dev", type: "backend", status: "Свободен" },
        {
          name: "BE API-4 LoadTest",
          type: "backend",
          status: "Свободен",
        },
        // BE стенды OCTOBER
        { name: "BE OCTOBER Dev", type: "backend", status: "Свободен" },
        { name: "BE OCTOBER Dev2", type: "backend", status: "Свободен" },
        { name: "BE OCTOBER Dev3", type: "backend", status: "Свободен" },
        { name: "BE OCTOBER Dev4", type: "backend", status: "Свободен" },
        { name: "BE OCTOBER Dev5", type: "backend", status: "Свободен" },
        { name: "BE OCTOBER Dev6", type: "backend", status: "Свободен" },
        { name: "BE OCTOBER Dev7", type: "backend", status: "Свободен" },
        { name: "BE OCTOBER AWS Dev", type: "backend", status: "Свободен" },
        {
          name: "BE OCTOBER LoadTest",
          type: "backend",
          status: "Свободен",
        },
      ];

      const { error } = await supabase.from("stands").insert(defaultStands);

      if (error) throw error;
      console.log("Stands recreated with proper frontend/backend separation");
      return true;
    },

    // Метод для инициализации данных
    async initializeDefaultData() {
      // Проверяем, есть ли уже стенды с правильными типами
      const { data: existingStands } = await supabase
        .from("stands")
        .select("type")
        .in("type", ["frontend", "backend"]);

      if (existingStands && existingStands.length > 0) return; // Данные уже есть

      // Удаляем старые стенды с некорректными типами
      await supabase
        .from("stands")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      // Создаем дефолтные стенды
      const defaultStands = [
        // Frontend стенды
        {
          name: "Frontend Deploy LoadTest",
          type: "frontend",
          status: "Свободен",
        },
        { name: "Frontend Deploy Dev", type: "frontend", status: "Свободен" },
        { name: "Frontend Deploy Dev2", type: "frontend", status: "Свободен" },
        { name: "Frontend Deploy Dev3", type: "frontend", status: "Свободен" },
        { name: "Frontend Deploy Dev4", type: "frontend", status: "Свободен" },
        { name: "Frontend Deploy Dev5", type: "frontend", status: "Свободен" },
        { name: "Frontend AWS Dev", type: "frontend", status: "Свободен" },

        // BE стенды
        {
          name: "BE Deploy LoadTest",
          type: "backend",
          status: "Свободен",
        },
        { name: "BE Deploy Dev", type: "backend", status: "Свободен" },
        { name: "BE Deploy Dev2", type: "backend", status: "Свободен" },
        { name: "BE Deploy Dev3", type: "backend", status: "Свободен" },
        { name: "BE Deploy Dev4", type: "backend", status: "Свободен" },
        { name: "BE Deploy Dev5", type: "backend", status: "Свободен" },
        { name: "BE AWS Dev", type: "backend", status: "Свободен" },
      ];

      const { error } = await supabase.from("stands").insert(defaultStands);

      if (error) throw error;
      console.log("Default stands initialized with frontend/backend types");
    },
  };
};
