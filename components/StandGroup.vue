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

    <!-- Фильтры -->
    <div
      class="flex items-center gap-6 mb-6"
      v-if="props.groupName === 'backend' || true"
    >
      <!-- Табы для backend -->
      <div
        v-if="props.groupName === 'backend'"
        class="flex gap-2 bg-neutral-100 rounded-xl p-1 shadow-inner animate-fade-in"
      >
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="selectedTab = tab"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-all duration-200',
            selectedTab === tab
              ? 'bg-green-500 text-white shadow-md scale-105'
              : 'text-neutral-700 hover:bg-green-100 hover:text-green-700',
          ]"
        >
          {{ tab }}
        </button>
      </div>
      <div
        class="flex items-center gap-2 bg-neutral-100 rounded-xl px-3 py-2 shadow-inner animate-fade-in"
      >
        <Checkbox
          v-model="showFreeOnly"
          :binary="true"
          :inputId="'freeOnlyCheckbox' + props.groupName"
          class="!w-5 !h-5"
        />
        <label
          :for="'freeOnlyCheckbox' + props.groupName"
          class="font-medium cursor-pointer select-none text-neutral-700"
        >
          Свободные
        </label>
      </div>
    </div>
    <!-- Список стендов -->
    <div class="stands-grid">
      <StandCard
        v-for="stand in filteredStands"
        :key="stand.key"
        :stand="stand"
        @occupy="handleOccupy"
        @release="handleRelease"
        @task-url-updated="handleTaskUrlChanged"
        @task-url-removed="handleTaskUrlChanged"
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
import { ref, computed } from "vue";
import Checkbox from "primevue/checkbox";

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

// Табы для backend-группы
const tabs = ["Все", "Deploy", "API-4", "October"];
const selectedTab = ref("Все");
// Состояние чекбокса "Свободные"
const showFreeOnly = ref(false);
/**
 * Фильтрует стенды по выбранному табу и чекбоксу "Свободные"
 */
const filteredStands = computed(() => {
  let stands = props.stands;
  // Фильтрация по табу (только для backend)
  if (props.groupName === "backend" && selectedTab.value !== "Все") {
    stands = stands.filter((s) =>
      s.name?.toLowerCase().includes(selectedTab.value.toLowerCase())
    );
  }
  // Фильтрация по "Свободные"
  if (showFreeOnly.value) {
    stands = stands.filter((s) => s.status === "free");
  }
  // Мемоизация ключа для StandCard
  return stands.map((stand) => ({
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

// Обработка обновления/удаления ссылки на задачу
function handleTaskUrlChanged() {
  // Пробрасываем событие наверх, чтобы родитель мог обновить список стендов
  emit("refresh-stands");
}
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

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
