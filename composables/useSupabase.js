import { createClient } from "@supabase/supabase-js";

let supabase = null;

const getStandKey = (stand) => `${stand.type}::${stand.name}`;

const DEFAULT_STANDS = [
	// Frontend стенды
	{ name: "FE Dev", type: "frontend", status: "Свободен" },
	{ name: "FE Dev2", type: "frontend", status: "Свободен" },
	{ name: "FE Dev3", type: "frontend", status: "Свободен" },
	{ name: "FE Dev4", type: "frontend", status: "Свободен" },
	{ name: "FE Dev5", type: "frontend", status: "Свободен" },
	{ name: "FE Dev6", type: "frontend", status: "Свободен" },
	{ name: "FE Dev7", type: "frontend", status: "Свободен" },
	{ name: "FE AWS Dev", type: "frontend", status: "Свободен" },
	{
		name: "FE LoadTest",
		type: "frontend",
		status: "Свободен",
	},
	// BE стенды
	{
		name: "BE Deploy LoadTest",
		type: "backend",
		status: "Свободен",
	},
	{ name: "BE Dev", type: "backend", status: "Свободен" },
	{ name: "BE Dev2", type: "backend", status: "Свободен" },
	{ name: "BE Dev3", type: "backend", status: "Свободен" },
	{ name: "BE Dev4", type: "backend", status: "Свободен" },
	{ name: "BE Dev5", type: "backend", status: "Свободен" },
	{ name: "BE Dev6", type: "backend", status: "Свободен" },
	{ name: "BE Dev7", type: "backend", status: "Свободен" },
	{ name: "BE Dev8", type: "backend", status: "Свободен" },
	{
		name: "BE LoadTest",
		type: "backend",
		status: "Свободен",
	},
	{ name: "BE Mobile1", type: "backend", status: "Свободен" },
	{ name: "BE Mobile2", type: "backend", status: "Свободен" },
	{ name: "BE Mobile3", type: "backend", status: "Свободен" },
];

const UNIQUE_DEFAULT_STANDS = Array.from(
  new Map(DEFAULT_STANDS.map((stand) => [getStandKey(stand), stand])).values()
);

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

    async getStandById(standId) {
      const { data, error } = await supabase
        .from("stands")
        .select("*")
        .eq("id", standId)
        .single();

      if (error) throw error;
      return data;
    },

    // Метод для безопасной инициализации данных без удаления существующих записей
    async ensureDefaultStands() {
      const { data: existingStands, error: existingError } = await supabase
        .from("stands")
        .select("name, type");

      if (existingError) throw existingError;

      const existingKeys = new Set(
        (existingStands || []).map((stand) => getStandKey(stand))
      );

      const missingStands = UNIQUE_DEFAULT_STANDS.filter(
        (stand) => !existingKeys.has(getStandKey(stand))
      );

      if (missingStands.length === 0) {
        return {
          inserted: 0,
          skipped: UNIQUE_DEFAULT_STANDS.length,
        };
      }

      const { error } = await supabase.from("stands").insert(missingStands);

      if (error) throw error;

      console.log(`Added ${missingStands.length} missing default stands`);

      return {
        inserted: missingStands.length,
        skipped: UNIQUE_DEFAULT_STANDS.length - missingStands.length,
      };
    },

    // Метод для сброса просроченных стендов
    async resetExpiredStands() {
      const now = new Date().toISOString();

      // Находим просроченные стенды
      const { data: expiredStands, error: selectError } = await supabase
        .from("stands")
        .select("*")
        .not("ended_at", "is", null)
        .not("ended_at", "is", "")
        .not("ended_at", "is", undefined)
        .lte("ended_at", now);

      if (selectError) throw selectError;

      if (!expiredStands || expiredStands.length === 0) {
        return {
          count: 0,
          stands: [],
        };
      }

      // Сбрасываем просроченные стенды
      const { data: updatedStands, error: updateError } = await supabase
        .from("stands")
        .update({
          status: "Свободен",
          occupied_by: null,
          occupied_at: null,
          ended_at: null,
        })
        .not("ended_at", "is", null)
        .not("ended_at", "is", "")
        .not("ended_at", "is", undefined)
        .lte("ended_at", now)
        .select();

      if (updateError) throw updateError;

      console.log(
        `Сброшено ${updatedStands?.length || 0} просроченных стендов`
      );

      return {
        count: updatedStands?.length || 0,
        stands: updatedStands || [],
      };
    },
  };
};
