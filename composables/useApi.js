// Композабл для работы с Nuxt API routes
export const useApi = () => {
  // Всегда используем встроенные Nuxt API routes
  const baseUrl = "/api";

  /**
   * Выполняет GET запрос к API
   * @param {string} endpoint - конечная точка API
   * @returns {Promise<Object>} ответ от сервера
   */
  const get = async (endpoint) => {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP ошибка! статус: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка GET запроса к ${endpoint}:`, error);
      throw error;
    }
  };

  /**
   * Выполняет POST запрос к API
   * @param {string} endpoint - конечная точка API
   * @param {Object} data - данные для отправки
   * @returns {Promise<Object>} ответ от сервера
   */
  const post = async (endpoint, data = {}) => {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ошибка! статус: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка POST запроса к ${endpoint}:`, error);
      throw error;
    }
  };

  /**
   * Получает все стенды с сервера
   * @returns {Promise<Object>} данные стендов
   */
  const getStands = async () => {
    return await get("/stands");
  };

  /**
   * Обновляет стенды на сервере
   * @param {Object} stands - объект со стендами
   * @returns {Promise<Object>} ответ сервера
   */
  const updateStands = async (stands) => {
    return await post("/stands", { stands });
  };

  /**
   * Выполняет сброс всех стендов
   * @returns {Promise<Object>} ответ сервера
   */
  const resetStands = async () => {
    return await post("/reset");
  };

  /**
   * Проверяет работоспособность сервера
   * @returns {Promise<Object>} статус сервера
   */
  const healthCheck = async () => {
    return await get("/health");
  };

  return {
    get,
    post,
    getStands,
    updateStands,
    resetStands,
    healthCheck,
  };
};
