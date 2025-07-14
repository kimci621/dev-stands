// Композабл для управления пользователем
export const useUser = () => {
  const userName = ref("");
  const isUserNameSet = computed(() => userName.value.trim().length > 0);

  const STORAGE_KEY = "stand-manager-user";

  /**
   * Загружает имя пользователя из localStorage
   */
  const loadUserFromStorage = () => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          userName.value = userData.userName || "";
        } catch (error) {
          console.warn("Ошибка при загрузке данных пользователя:", error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  };

  /**
   * Сохраняет имя пользователя в localStorage
   */
  const saveUserToStorage = () => {
    if (process.client) {
      const userData = {
        userName: userName.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }
  };

  /**
   * Устанавливает имя пользователя
   * @param {string} name - новое имя пользователя
   * @returns {boolean} успешность операции
   */
  const setUserName = (name) => {
    const trimmedName = name.trim();

    // Простая валидация
    if (trimmedName.length < 2) {
      throw new Error("Имя должно содержать минимум 2 символа");
    }

    if (trimmedName.length > 50) {
      throw new Error("Имя не должно превышать 50 символов");
    }

    userName.value = trimmedName;
    saveUserToStorage();

    return true;
  };

  /**
   * Очищает данные пользователя
   */
  const clearUser = () => {
    userName.value = "";
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  /**
   * Проверяет валидность имени пользователя
   * @param {string} name - имя для проверки
   * @returns {Object} результат валидации
   */
  const validateUserName = (name) => {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return { valid: false, message: "Имя не может быть пустым" };
    }

    if (trimmedName.length < 2) {
      return {
        valid: false,
        message: "Имя должно содержать минимум 2 символа",
      };
    }

    if (trimmedName.length > 50) {
      return { valid: false, message: "Имя не должно превышать 50 символов" };
    }

    // Проверка на спецсимволы (разрешены только буквы, цифры, пробелы, дефисы)
    const validChars = /^[a-zA-Zа-яА-Я0-9\s\-]+$/;
    if (!validChars.test(trimmedName)) {
      return {
        valid: false,
        message: "Имя может содержать только буквы, цифры, пробелы и дефисы",
      };
    }

    return { valid: true, message: "" };
  };

  // Инициализация при создании композабла
  loadUserFromStorage();

  return {
    userName: readonly(userName),
    isUserNameSet,
    setUserName,
    clearUser,
    validateUserName,
    loadUserFromStorage,
  };
};
