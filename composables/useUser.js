// Композабл для управления пользователем и аутентификацией
export const useUser = () => {
  const user = ref({ id: null, name: "", email: "" });
  const isLoggedIn = computed(() => !!user.value && !!user.value.email);

  const STORAGE_KEY = "stand-manager-user";

  /**
   * Загружает пользователя из localStorage
   */
  const loadUserFromStorage = () => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          user.value = userData;
        } catch (error) {
          console.warn("Ошибка при загрузке данных пользователя:", error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  };

  /**
   * Сохраняет пользователя в localStorage
   */
  const saveUserToStorage = () => {
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value));
    }
  };

  /**
   * Очищает данные пользователя
   */
  const clearUser = () => {
    user.value = { id: null, name: "", email: "" };
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  /**
   * Регистрация пользователя через API
   */
  const register = async (name, email, password) => {
    const { register: apiRegister } = useApi();
    const res = await apiRegister(name, email, password);
    user.value = res;
    saveUserToStorage();
    return res;
  };

  /**
   * Вход пользователя через API
   */
  const login = async (email, password) => {
    const { login: apiLogin } = useApi();
    const res = await apiLogin(email, password);
    user.value = res;
    saveUserToStorage();
    return res;
  };

  /**
   * Выход пользователя
   */
  const logout = () => {
    clearUser();
  };

  // Инициализация при создании композабла
  loadUserFromStorage();

  return {
    user: readonly(user),
    isLoggedIn,
    register,
    login,
    logout,
    clearUser,
    loadUserFromStorage,
    saveUserToStorage,
  };
};
