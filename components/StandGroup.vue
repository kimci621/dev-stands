<template>
  <div class="stand-group animate-slide-up">
    <!-- Заголовок группы -->
    <div class="group-header">
      <h2
        class="text-3xl font-bold text-neutral-800 mb-4 flex items-center gap-3"
      >
        <div
          class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium"
        >
          <i class="pi pi-server text-white text-lg"></i>
        </div>
        {{ groupTitle }}
      </h2>

      <!-- Статистика группы -->
      <div class="flex items-center gap-6 mb-6">
        <div
          class="stat-item bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-soft"
        >
          <span class="stat-label">Всего:</span>
          <span class="stat-value text-primary-700">{{ totalStands }}</span>
        </div>

        <div
          class="stat-item bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-soft"
        >
          <span class="stat-label">Свободно:</span>
          <span class="stat-value text-stand-free-700">{{ freeStands }}</span>
        </div>

        <div
          class="stat-item bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-soft"
        >
          <span class="stat-label">Занято:</span>
          <span class="stat-value text-stand-occupied-700">{{
            occupiedStands
          }}</span>
        </div>

        <!-- Прогресс-бар заполненности -->
        <div class="flex-1 ml-6">
          <div class="w-full bg-neutral-200 rounded-full h-3 shadow-inner">
            <div
              class="bg-gradient-to-r from-stand-occupied-500 to-stand-occupied-600 h-3 rounded-full transition-all duration-500 shadow-soft"
              :style="{ width: `${occupancyPercentage}%` }"
            ></div>
          </div>
          <span class="text-sm text-neutral-600 mt-2 font-medium">
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
      <div
        class="w-20 h-20 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex items-center justify-center mb-6"
      >
        <i class="pi pi-server text-4xl text-neutral-400"></i>
      </div>
      <p class="text-neutral-500 text-xl font-medium">Стенды отсутствуют</p>
      <p class="text-neutral-400 text-sm mt-2">
        Добавьте стенды для начала работы
      </p>
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
  @apply bg-white/70 backdrop-blur-sm rounded-3xl shadow-soft border border-white/50 p-8;
}

.group-header {
  @apply border-b border-neutral-200/50 pb-6 mb-8;
}

.stat-item {
  @apply flex items-center gap-2 transition-all duration-300 hover:shadow-medium hover:scale-105;
}

.stat-label {
  @apply text-sm text-neutral-600 font-medium;
}

.stat-value {
  @apply text-xl font-bold;
}

.stands-grid {
  @apply grid gap-6;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

.empty-state {
  @apply flex 
    flex-col 
    items-center 
    justify-center 
    py-16 
    text-center;
}

/* Адаптивность */
@media (max-width: 768px) {
  .stands-grid {
    grid-template-columns: 1fr;
  }

  .group-header {
    @apply pb-4 mb-6;
  }

  .stat-item {
    @apply p-2;
  }

  .stat-value {
    @apply text-lg;
  }
}

/* Анимации */
.stand-group {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
