// Композабл для управления стендами
export const useStands = () => {
  const {
    getStands,
    updateStands,
    resetStands,
    resetExpiredStands,
    recreateStands,
  } = useApi();
  const { user } = useUser();

  // Реактивное состояние
  const stands = ref({
    frontend: [],
    backend: [],
  });

  const lastReset = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const isConnected = ref(false);

  // Интервал для polling
  let pollingInterval = null;
  const POLLING_INTERVAL = 10000; // 10 секунд

  // Интервал для проверки просроченных стендов
  let expiredCheckInterval = null;
  const EXPIRED_CHECK_INTERVAL = 30000; // 30 секунд

  /**
   * Загружает стенды с сервера
   * @param {boolean} showLoading - показывать ли индикатор загрузки
   */
  const fetchStands = async (showLoading = true) => {
    try {
      if (showLoading) {
        isLoading.value = true;
      }
      error.value = null;

      const response = await getStands();

      // Сравниваем данные перед обновлением, чтобы избежать лишних перерисовок
      const newData = JSON.stringify(response.stands);
      const currentData = JSON.stringify(stands.value);

      if (newData !== currentData) {
        stands.value = response.stands;
      }

      if (lastReset.value !== response.lastReset) {
        lastReset.value = response.lastReset;
      }

      isConnected.value = true;

      if (showLoading) {
        console.log("Стенды загружены:", response);
      }
    } catch (err) {
      error.value = err.message;
      isConnected.value = false;
      if (showLoading) {
        console.error("Ошибка при загрузке стендов:", err);
      }
    } finally {
      if (showLoading) {
        isLoading.value = false;
      }
    }
  };

  /**
   * Обновляет конкретный стенд на сервере
   * @param {number} standId - ID стенда
   * @param {string} action - действие ('occupy' или 'release')
   * @param {Object} userData - данные пользователя
   */
  const updateStandOnServer = async (standId, action, userData = null) => {
    try {
      const { updateStand } = useApi();
      const response = await updateStand(standId, action, userData);
      console.log(
        `Стенд ${standId} ${action === "occupy" ? "занят" : "освобожден"}:`,
        response
      );
      return response;
    } catch (err) {
      error.value = err.message;
      console.error("Ошибка при обновлении стенда:", err);
      // В случае ошибки - перезагружаем стенды с сервера
      await fetchStands();
      throw err;
    }
  };

  /**
   * Находит стенд по ID во всех группах
   * @param {number} standId - ID стенда
   * @returns {Object|null} найденный стенд и его группа
   */
  const findStandById = (standId) => {
    for (const [groupName, groupStands] of Object.entries(stands.value)) {
      const stand = groupStands.find((s) => s.id === standId);
      if (stand) {
        return { stand, group: groupName };
      }
    }
    return null;
  };

  /**
   * Занимает стенд для текущего пользователя
   * @param {number} standId - ID стенда
   * @returns {Promise<boolean>} успешность операции
   */
  const occupyStand = async (standId) => {
    if (!user.value.email) {
      throw new Error("Необходимо войти в систему");
    }

    const result = findStandById(standId);
    if (!result) {
      throw new Error("Стенд не найден");
    }

    const { stand } = result;

    if (stand.status === "occupied") {
      throw new Error(
        `Стенд уже занят пользователем: ${
          stand.occupiedBy || stand.occupied_by
        }`
      );
    }

    // Обновляем на сервере
    await updateStandOnServer(standId, "occupy", user.value);

    // Обновляем локально
    stand.status = "occupied";
    stand.occupiedBy = user.value.email; // Используем email как в новой схеме БД
    stand.occupied_by = user.value.email;
    stand.occupiedAt = Date.now();
    stand.occupied_at = new Date().toISOString();

    console.log(
      `Стенд ${stand.name} занят пользователем ${user.value.name} (${user.value.email})`
    );
    return true;
  };

  /**
   * Освобождает стенд
   * @param {number} standId - ID стенда
   * @returns {Promise<boolean>} успешность операции
   */
  const releaseStand = async (standId) => {
    const result = findStandById(standId);
    if (!result) {
      throw new Error("Стенд не найден");
    }

    const { stand } = result;

    if (stand.status === "free") {
      throw new Error("Стенд уже свободен");
    }

    // Проверяем, может ли пользователь освободить стенд
    const standOwner = stand.occupiedBy || stand.occupied_by;
    if (standOwner !== user.value.email) {
      throw new Error(`Только ${standOwner} может освободить этот стенд`);
    }

    // Обновляем на сервере
    await updateStandOnServer(standId, "release");

    // Обновляем локально
    stand.status = "free";
    stand.occupiedBy = null;
    stand.occupied_by = null;
    stand.occupiedAt = null;
    stand.occupied_at = null;
    stand.ended_at = null;
    stand.comment = null;
    stand.task_url = null;

    console.log(`Стенд ${stand.name} освобожден`);
    return true;
  };

  /**
   * Устанавливает комментарий для стенда
   * @param {number} standId - ID стенда
   * @param {string|null} comment - текст комментария
   * @returns {Promise<boolean>} успешность операции
   */
  const setComment = async (standId, comment) => {
    const { updateStand } = useApi();
    const result = findStandById(standId);
    if (!result) {
      throw new Error("Стенд не найден");
    }

    const { stand } = result;

    if (stand.status !== "occupied") {
      throw new Error("Нельзя добавить комментарий к свободному стенду");
    }

    const standOwner = stand.occupiedBy || stand.occupied_by;
    if (standOwner !== user.value.email) {
      throw new Error(`Только ${standOwner} может обновить комментарий`);
    }

    try {
      await updateStand(standId, "set_comment", null, { comment });
      stand.comment = comment;
      console.log(`Комментарий для стенда ${stand.name} обновлен`);
      return true;
    } catch (err) {
      error.value = err.message;
      console.error("Ошибка при обновлении комментария стенда:", err);
      await fetchStands(false);
      throw err;
    }
  };

  /**
   * Выполняет полный сброс всех стендов
   */
  const performReset = async () => {
    try {
      isLoading.value = true;
      const response = await resetStands();
      stands.value = response.stands;
      lastReset.value = response.lastReset;
      console.log("Выполнен сброс всех стендов");
    } catch (err) {
      error.value = err.message;
      console.error("Ошибка при сбросе стендов:", err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Получает все стенды, занятые текущим пользователем
   * @returns {Array} массив занятых стендов
   */
  const getUserStands = computed(() => {
    const userStands = [];
    Object.values(stands.value).forEach((group) => {
      group.forEach((stand) => {
        if (
          stand.status === "occupied" &&
          stand.occupiedBy === user.value.email
        ) {
          userStands.push(stand);
        }
      });
    });
    return userStands;
  });

  /**
   * Получает статистику использования стендов
   * @returns {Object} статистика
   */
  const getStatistics = computed(() => {
    let totalStands = 0;
    let occupiedStands = 0;

    Object.values(stands.value).forEach((group) => {
      totalStands += group.length;
      occupiedStands += group.filter(
        (stand) => stand.status === "occupied"
      ).length;
    });

    return {
      total: totalStands,
      occupied: occupiedStands,
      free: totalStands - occupiedStands,
      occupancyRate:
        totalStands > 0 ? Math.round((occupiedStands / totalStands) * 100) : 0,
    };
  });

  /**
   * Запускает polling для автоматического обновления
   */
  const startPolling = () => {
    if (pollingInterval) return;

    pollingInterval = setInterval(async () => {
      try {
        // Скрытое обновление без показа индикатора загрузки
        await fetchStands(false);
      } catch (err) {
        console.warn("Ошибка при polling обновлении:", err);
      }
    }, POLLING_INTERVAL);

    console.log("Polling запущен с интервалом", POLLING_INTERVAL, "мс");
  };

  /**
   * Останавливает polling
   */
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      console.log("Polling остановлен");
    }
  };

  /**
   * Проверяет и сбрасывает просроченные стенды
   * @param {boolean} forceFetch - принудительно обновить стенды после сброса
   */
  const checkExpiredStands = async (forceFetch = true) => {
    try {
      const response = await resetExpiredStands();
      if (response.resetCount > 0) {
        console.log(
          `Автоматически сброшено ${response.resetCount} просроченных стендов`
        );
        // Обновляем состояние стендов после сброса, только если требуется
        if (forceFetch) {
          await fetchStands(false);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn("Ошибка при проверке просроченных стендов:", err);
      return false;
    }
  };

  /**
   * Запускает проверку просроченных стендов
   */
  const startExpiredCheck = () => {
    if (expiredCheckInterval) return;

    // expiredCheckInterval = setInterval(
    //   checkExpiredStands,
    //   EXPIRED_CHECK_INTERVAL
    // );
    console.log(
      "Проверка просроченных стендов запущена с интервалом",
      EXPIRED_CHECK_INTERVAL,
      "мс"
    );
  };

  /**
   * Останавливает проверку просроченных стендов
   */
  const stopExpiredCheck = () => {
    if (expiredCheckInterval) {
      clearInterval(expiredCheckInterval);
      expiredCheckInterval = null;
      console.log("Проверка просроченных стендов остановлена");
    }
  };

  // Флаг для отслеживания инициализации
  const isInitialized = ref(false);

  /**
   * Инициализация композабла
   */
  const initialize = async () => {
    if (isInitialized.value) {
      return; // Уже инициализировано
    }

    try {
      await fetchStands();
      startPolling();
      startExpiredCheck();
      isInitialized.value = true;
    } catch (err) {
      console.error("Ошибка при инициализации:", err);
      throw err;
    }
  };

  // Очистка при размонтировании
  onUnmounted(() => {
    stopPolling();
    stopExpiredCheck();
  });

  return {
    // Состояние
    stands: readonly(stands),
    lastReset: readonly(lastReset),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isConnected: readonly(isConnected),

    // Вычисляемые свойства
    getUserStands,
    getStatistics,

    // Методы
    fetchStands,
    occupyStand,
    releaseStand,
    setComment,
    performReset,
    findStandById,
    initialize,
    recreateStands,
    updateStands,

    // Управление polling
    startPolling,
    stopPolling,

    // Управление проверкой просроченных стендов
    startExpiredCheck,
    stopExpiredCheck,
    checkExpiredStands,
  };
};
