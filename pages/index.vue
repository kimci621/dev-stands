<template>
  <div class="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
    <!-- Заголовок приложения -->
    <header
      class="bg-white/80 backdrop-blur-sm shadow-soft border-b border-neutral-200/50 sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Логотип и название -->
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium"
            >
              <i class="pi pi-server text-xl text-white"></i>
            </div>
            <h1
              class="text-2xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent"
            >
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
      <div v-if="!isConnected" class="mb-8 animate-fade-in">
        <div
          class="bg-stand-occupied-50 border border-stand-occupied-200 rounded-2xl p-6 shadow-soft"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-stand-occupied-100 rounded-full flex items-center justify-center"
            >
              <i
                class="pi pi-exclamation-triangle text-stand-occupied-600 text-lg"
              ></i>
            </div>
            <div>
              <span class="text-stand-occupied-800 font-semibold text-lg">
                Нет подключения к серверу
              </span>
              <p class="text-stand-occupied-600 text-sm mt-1">
                Проверьте, что сервер запущен
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Таймер автосброса -->
      <div class="mb-8 animate-slide-up hidden">
        <AutoReleaseTimer
          :last-reset="lastReset"
          :show-reset-button="false"
          @manual-reset="() => {}"
        />
      </div>

      <!-- Общая статистика -->
      <div class="mb-10 animate-slide-up">
        <div
          class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-soft border border-white/50 p-8"
        >
          <h2
            class="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3"
          >
            <div
              class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center"
            >
              <i class="pi pi-chart-bar text-white text-sm"></i>
            </div>
            Общая статистика
          </h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div
              class="stat-card bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200"
            >
              <div class="stat-value text-primary-700">
                {{ statistics.total }}
              </div>
              <div class="stat-label text-primary-600">Всего стендов</div>
            </div>

            <div
              class="stat-card bg-gradient-to-br from-stand-free-50 to-stand-free-100 border border-stand-free-200"
            >
              <div class="stat-value text-stand-free-700">
                {{ statistics.free }}
              </div>
              <div class="stat-label text-stand-free-600">Свободно</div>
            </div>

            <div
              class="stat-card bg-gradient-to-br from-stand-occupied-50 to-stand-occupied-100 border border-stand-occupied-200"
            >
              <div class="stat-value text-stand-occupied-700">
                {{ statistics.occupied }}
              </div>
              <div class="stat-label text-stand-occupied-600">Занято</div>
            </div>

            <div
              class="stat-card bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200"
            >
              <div class="stat-value text-neutral-700">
                {{ statistics.occupancyRate }}%
              </div>
              <div class="stat-label text-neutral-600">Загрузка</div>
            </div>
          </div>

          <!-- Стенды пользователя -->
          <div
            v-if="userStands.length > 0"
            class="mt-8 pt-8 border-t border-neutral-200/50"
          >
            <h3
              class="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2"
            >
              <i class="pi pi-user text-primary-600"></i>
              Ваши стенды ({{ userStands.length }})
            </h3>
            <div class="flex flex-wrap gap-3">
              <span
                v-for="stand in userStands"
                :key="stand.id"
                class="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-sm font-medium shadow-soft"
              >
                {{ stand.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Загрузка -->
      <div v-if="isLoading" class="flex justify-center py-16 animate-fade-in">
        <div
          class="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-soft"
        >
          <div
            class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
          ></div>
          <span class="text-lg text-neutral-700 font-medium"
            >Загрузка стендов...</span
          >
        </div>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="mb-8 animate-fade-in">
        <div
          class="bg-stand-occupied-50 border border-stand-occupied-200 rounded-2xl p-6 shadow-soft"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-stand-occupied-100 rounded-full flex items-center justify-center"
            >
              <i class="pi pi-times-circle text-stand-occupied-600 text-lg"></i>
            </div>
            <span class="text-stand-occupied-800 font-semibold text-lg"
              >Ошибка загрузки</span
            >
          </div>
          <p class="text-stand-occupied-600 text-sm mb-4">{{ error }}</p>
          <Button
            @click="initialize"
            icon="pi pi-refresh"
            label="Попробовать снова"
            class="p-button-sm"
          />
        </div>
      </div>

      <!-- Группы стендов -->
      <div v-else class="space-y-10">
        <Transition name="fade" mode="out-in">
          <StandGroup
            group-name="frontend"
            :stands="stands.frontend"
            :allow-comment-edit="true"
            @occupy="handleOccupy"
            @release="handleRelease"
            @refresh-stands="refreshStands"
            @comment-change="handleCommentChange"
          />
        </Transition>

        <Transition name="fade" mode="out-in">
          <StandGroup
            group-name="backend"
            :stands="stands.backend"
            :allow-comment-edit="true"
            @occupy="handleOccupy"
            @release="handleRelease"
            @refresh-stands="refreshStands"
            @comment-change="handleCommentChange"
          />
        </Transition>
      </div>
    </main>

    <!-- Футер -->
    <footer
      class="bg-white/80 backdrop-blur-sm border-t border-neutral-200/50 mt-20"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <p class="text-sm text-neutral-600">
            Система управления стендами разработки
          </p>

          <div class="flex items-center gap-6">
            <span
              class="flex items-center gap-2 text-sm font-medium"
              :class="
                isConnected ? 'text-stand-free-600' : 'text-stand-occupied-600'
              "
            >
              <div
                class="w-2 h-2 rounded-full"
                :class="
                  isConnected ? 'bg-stand-free-500' : 'bg-stand-occupied-500'
                "
              ></div>
              {{ isConnected ? "Подключено" : "Отключено" }}
            </span>

            <span
              class="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full"
              >v1.0.0</span
            >
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
  recreateStands,
  setComment,
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
 * Обрабатывает изменение комментария стенда
 * @param {number} standId - ID стенда
 * @param {string|null} comment - текст комментария
 */
const handleCommentChange = async (standId, comment) => {
  try {
    await setComment(standId, comment);
    await refreshStands();
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Комментарий обновлён",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: err.message || "Не удалось обновить комментарий",
      life: 5000,
    });
  }
};

/**
 * Обрабатывает принудительный сброс всех стендов
 */
const handleManualReset = async () => {
  try {
    // await performReset();
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

// Обновление списка стендов после изменения ссылки на задачу
const { fetchStands } = useStands();
async function refreshStands() {
  await fetchStands();
}

// Инициализация при монтировании компонента
onMounted(async () => {
  try {
    await initialize();
  } catch (err) {
    console.error("Ошибка инициализации:", err);
  }

  if (!window?.handleManualReset) {
    window.handleManualReset = handleManualReset;
  }

  if (!window?.recreateStands) {
    window.recreateStands = recreateStands;
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
  @apply text-center p-6 rounded-2xl transition-all duration-300 hover:shadow-medium hover:scale-105;
}

.stat-value {
  @apply text-4xl font-bold mb-2;
}

.stat-label {
  @apply text-sm font-medium;
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

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Адаптивность */
@media (max-width: 768px) {
  .stat-value {
    @apply text-3xl;
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
