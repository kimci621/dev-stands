<template>
  <div class="stand-group">
    <!-- Заголовок группы -->
    <div class="group-header">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        {{ groupTitle }}
      </h2>

      <!-- Статистика группы -->
      <div class="flex items-center gap-4 mb-4">
        <div class="stat-item">
          <span class="stat-label">Всего:</span>
          <span class="stat-value">{{ totalStands }}</span>
        </div>

        <div class="stat-item">
          <span class="stat-label">Свободно:</span>
          <span class="stat-value text-stand-free">{{ freeStands }}</span>
        </div>

        <div class="stat-item">
          <span class="stat-label">Занято:</span>
          <span class="stat-value text-stand-occupied">{{
            occupiedStands
          }}</span>
        </div>

        <!-- Прогресс-бар заполненности -->
        <div class="flex-1 ml-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-stand-occupied h-2 rounded-full transition-all duration-300"
              :style="{ width: `${occupancyPercentage}%` }"
            ></div>
          </div>
          <span class="text-xs text-gray-500 mt-1">
            {{ occupancyPercentage }}% занятости
          </span>
        </div>
      </div>
    </div>

    <!-- Список стендов -->
    <div class="stands-grid">
      <StandCard
        v-for="stand in memoizedStands"
        :key="stand.key"
        :stand="stand"
        @occupy="handleOccupy"
        @release="handleRelease"
      />
    </div>

    <!-- Пустое состояние -->
    <div v-if="stands.length === 0" class="empty-state">
      <i class="pi pi-server text-4xl text-gray-400 mb-4"></i>
      <p class="text-gray-500 text-lg">Стенды отсутствуют</p>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";

// Props
const props = defineProps({
  groupName: {
    type: String,
    required: true,
  },
  stands: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["occupy", "release"]);

// Композаблы
const toast = useToast();

/**
 * Заголовок группы
 */
const groupTitle = computed(() => {
  const titles = {
    frontend: "Фронтенд стенды",
    backend: "Бэкенд стенды",
  };
  return titles[props.groupName] || props.groupName;
});

/**
 * Статистика стендов в группе (мемоизировано для предотвращения дёргания)
 */
const totalStands = computed(() => props.stands.length);

const freeStands = computed(
  () => props.stands.filter((stand) => stand.status === "free").length
);

const occupiedStands = computed(
  () => props.stands.filter((stand) => stand.status === "occupied").length
);

const occupancyPercentage = computed(() => {
  if (totalStands.value === 0) return 0;
  return Math.round((occupiedStands.value / totalStands.value) * 100);
});

// Мемоизированный список для предотвращения лишних перерисовок
const memoizedStands = computed(() => {
  return props.stands.map((stand) => ({
    ...stand,
    key: `${stand.id}-${stand.status}-${stand.occupiedBy || "free"}`,
  }));
});

/**
 * Обрабатывает занятие стенда
 * @param {number} standId - ID стенда
 */
const handleOccupy = async (standId) => {
  try {
    emit("occupy", standId);

    const stand = props.stands.find((s) => s.id === standId);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: `Стенд "${stand?.name}" успешно занят`,
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось занять стенд",
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
    emit("release", standId);

    const stand = props.stands.find((s) => s.id === standId);
    toast.add({
      severity: "info",
      summary: "Освобождено",
      detail: `Стенд "${stand?.name}" освобожден`,
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось освободить стенд",
      life: 5000,
    });
  }
};
</script>

<style scoped>
.stand-group {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}

.group-header {
  @apply border-b border-gray-100 pb-4 mb-6;
}

.stat-item {
  @apply flex items-center gap-1;
}

.stat-label {
  @apply text-sm text-gray-600;
}

.stat-value {
  @apply text-lg font-semibold;
}

.stands-grid {
  @apply grid gap-4;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.empty-state {
  @apply flex 
    flex-col 
    items-center 
    justify-center 
    py-12 
    text-center;
}

/* Адаптивная сетка для мобильных устройств */
@media (max-width: 640px) {
  .stands-grid {
    @apply grid-cols-1;
  }

  .group-header {
    @apply space-y-2;
  }

  .group-header .flex {
    @apply flex-wrap gap-2;
  }
}

/* Анимация для прогресс-бара */
.bg-stand-occupied {
  transition: width 0.3s ease-in-out;
}

/* Улучшенная видимость статистики */
.stat-item:not(:last-child)::after {
  content: "•";
  @apply text-gray-300 ml-4;
}

/* Стили для тёмной темы (если потребуется в будущем) */
@media (prefers-color-scheme: dark) {
  .stand-group {
    @apply bg-gray-800 border-gray-700;
  }

  .group-header {
    @apply border-gray-700;
  }

  .stat-label {
    @apply text-gray-400;
  }

  .stat-value {
    @apply text-gray-200;
  }
}
</style>
