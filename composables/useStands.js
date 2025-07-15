// Композабл для управления стендами
export const useStands = () => {
  const { getStands, updateStands, resetStands } = useApi();
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
  const POLLING_INTERVAL = 3000; // 3 секунды

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
   * Сохраняет стенды на сервер
   */
  const saveStands = async () => {
    try {
      const response = await updateStands(stands.value);
      lastReset.value = response.lastReset;
      console.log("Стенды сохранены:", response);
    } catch (err) {
      error.value = err.message;
      console.error("Ошибка при сохранении стендов:", err);
      // В случае ошибки - перезагружаем стенды с сервера
      await fetchStands();
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
    if (!user.value.name) {
      throw new Error("Необходимо указать имя пользователя");
    }

    const result = findStandById(standId);
    if (!result) {
      throw new Error("Стенд не найден");
    }

    const { stand } = result;

    if (stand.status === "occupied") {
      throw new Error(`Стенд уже занят пользователем: ${stand.occupiedBy}`);
    }

    // Обновляем локально
    stand.status = "occupied";
    stand.occupiedBy = user.value.name;
    stand.occupiedAt = Date.now();

    // Сохраняем на сервер
    await saveStands();

    console.log(`Стенд ${stand.name} занят пользователем ${user.value.name}`);
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
    if (stand.occupiedBy !== user.value.name) {
      throw new Error(`Только ${stand.occupiedBy} может освободить этот стенд`);
    }

    // Обновляем локально
    stand.status = "free";
    stand.occupiedBy = null;
    stand.occupiedAt = null;

    // Сохраняем на сервер
    await saveStands();

    console.log(`Стенд ${stand.name} освобожден`);
    return true;
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
          stand.occupiedBy === user.value.name
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
   * Инициализация композабла
   */
  const initialize = async () => {
    await fetchStands();
    startPolling();
  };

  // Очистка при размонтировании
  onUnmounted(() => {
    stopPolling();
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
    performReset,
    findStandById,
    initialize,

    // Управление polling
    startPolling,
    stopPolling,
  };
};
