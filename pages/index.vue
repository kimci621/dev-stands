<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Заголовок приложения -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Логотип и название -->
          <div class="flex items-center gap-3">
            <i class="pi pi-server text-2xl text-blue-600"></i>
            <h1 class="text-2xl font-bold text-gray-800">
              Управление стендами
            </h1>
          </div>

          <!-- Профиль пользователя -->
          <UserProfile />
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Статус подключения -->
      <div v-if="!isConnected" class="mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            <span class="text-red-700 font-medium">
              Нет подключения к серверу
            </span>
          </div>
        </div>
      </div>

      <!-- Таймер автосброса -->
      <div class="mb-8">
        <AutoReleaseTimer
          :last-reset="lastReset"
          :show-reset-button="true"
          @manual-reset="handleManualReset"
        />
      </div>

      <!-- Общая статистика -->
      <div class="mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Общая статистика</h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="stat-card">
              <div class="stat-value text-blue-600">{{ statistics.total }}</div>
              <div class="stat-label">Всего стендов</div>
            </div>

            <div class="stat-card">
              <div class="stat-value text-stand-free">
                {{ statistics.free }}
              </div>
              <div class="stat-label">Свободно</div>
            </div>

            <div class="stat-card">
              <div class="stat-value text-stand-occupied">
                {{ statistics.occupied }}
              </div>
              <div class="stat-label">Занято</div>
            </div>

            <div class="stat-card">
              <div class="stat-value text-purple-600">
                {{ statistics.occupancyRate }}%
              </div>
              <div class="stat-label">Загрузка</div>
            </div>
          </div>

          <!-- Стенды пользователя -->
          <div
            v-if="userStands.length > 0"
            class="mt-6 pt-6 border-t border-gray-200"
          >
            <h3 class="text-lg font-semibold text-gray-800 mb-3">
              Ваши стенды ({{ userStands.length }})
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="stand in userStands"
                :key="stand.id"
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {{ stand.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Загрузка -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="flex items-center gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-blue-600"></i>
          <span class="text-lg text-gray-600">Загрузка стендов...</span>
        </div>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <i class="pi pi-times-circle text-red-500"></i>
            <span class="text-red-700 font-medium">Ошибка загрузки</span>
          </div>
          <p class="text-red-600 text-sm">{{ error }}</p>
          <Button
            @click="initialize"
            icon="pi pi-refresh"
            label="Попробовать снова"
            class="p-button-sm mt-3"
          />
        </div>
      </div>

      <!-- Группы стендов -->
      <div v-else class="space-y-8">
        <Transition name="fade" mode="out-in">
          <StandGroup
            group-name="frontend"
            :stands="stands.frontend"
            @occupy="handleOccupy"
            @release="handleRelease"
          />
        </Transition>

        <Transition name="fade" mode="out-in">
          <StandGroup
            group-name="backend"
            :stands="stands.backend"
            @occupy="handleOccupy"
            @release="handleRelease"
          />
        </Transition>
      </div>

      {{ stands }}
    </main>

    <!-- Футер -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600">
            Система управления стендами разработки
          </p>

          <div class="flex items-center gap-4">
            <span
              class="flex items-center gap-1 text-xs"
              :class="isConnected ? 'text-green-600' : 'text-red-600'"
            >
              <i
                class="pi"
                :class="isConnected ? 'pi-check-circle' : 'pi-times-circle'"
              ></i>
              {{ isConnected ? "Подключено" : "Отключено" }}
            </span>

            <span class="text-xs text-gray-500"> v1.0.0 </span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Toast уведомления -->
    <Toast position="top-right" />
  </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";

// Композаблы
const {
  stands,
  lastReset,
  isLoading,
  error,
  isConnected,
  getUserStands,
  getStatistics,
  occupyStand,
  releaseStand,
  performReset,
  initialize,
} = useStands();

const { user, isLoggedIn } = useUser();
const router = useRouter();
const toast = useToast();

// Редирект на /login, если не залогинен
if (!isLoggedIn.value) {
  router.replace("/login");
}

// Вычисляемые свойства с мемоизацией
const userStands = computed(() => getUserStands.value);
const statistics = computed(() => getStatistics.value);

/**
 * Обрабатывает занятие стенда
 * @param {number} standId - ID стенда
 */
const handleOccupy = async (standId) => {
  if (!isLoggedIn.value) {
    toast.add({
      severity: "warn",
      summary: "Внимание",
      detail: "Необходимо указать ваше имя перед занятием стенда",
      life: 5000,
    });
    return;
  }

  try {
    await occupyStand(standId);

    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Стенд успешно занят",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: err.message || "Не удалось занять стенд",
      life: 5000,
    });
  }
};

/**
 * Обрабатывает освобождение стенда
 * @param {number} standId - ID стенда
 */
const handleRelease = async (standId) => {
  try {
    await releaseStand(standId);

    toast.add({
      severity: "info",
      summary: "Освобождено",
      detail: "Стенд успешно освобожден",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: err.message || "Не удалось освободить стенд",
      life: 5000,
    });
  }
};

/**
 * Обрабатывает принудительный сброс всех стендов
 */
const handleManualReset = async () => {
  try {
    await performReset();

    toast.add({
      severity: "info",
      summary: "Сброс выполнен",
      detail: "Все стенды были сброшены",
      life: 5000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: err.message || "Не удалось выполнить сброс",
      life: 5000,
    });
  }
};

// Инициализация при монтировании компонента
onMounted(async () => {
  try {
    await initialize();
  } catch (err) {
    console.error("Ошибка инициализации:", err);
  }
});

// Мета-теги для страницы
useHead({
  title: "Управление стендами разработки",
  meta: [
    {
      name: "description",
      content:
        "Система управления стендами разработки для команд фронтенда и бэкенда",
    },
  ],
});
</script>

<style scoped>
.stat-card {
  @apply text-center;
}

.stat-value {
  @apply text-3xl font-bold mb-1;
}

.stat-label {
  @apply text-sm text-gray-600;
}

/* Анимации для загрузки */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pi-spin {
  animation: spin 1s linear infinite;
}

/* Адаптивность */
@media (max-width: 768px) {
  .stat-value {
    @apply text-2xl;
  }

  .grid-cols-2 {
    @apply grid-cols-1;
  }

  .md\:grid-cols-4 {
    @apply grid-cols-2;
  }
}

/* Улучшенная типографика */
h1,
h2,
h3 {
  font-family: "Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* Плавные переходы */
* {
  transition: all 0.2s ease-in-out;
}

/* Анимации для плавного появления/исчезновения */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Предотвращение layout shift */
.stand-group {
  min-height: 200px;
}

/* Оптимизация перерисовки */
.stat-card {
  will-change: auto;
  transform: translateZ(0);
}
</style>
