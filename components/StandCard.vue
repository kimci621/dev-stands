<template>
  <div class="stand-card" :class="cardClasses">
    <div class="flex items-center justify-between p-4">
      <!-- Информация о стенде -->
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-800 mb-1">
          {{ stand.name }}
        </h3>

        <div class="flex items-center gap-2">
          <span class="status-badge" :class="statusClasses">
            <i :class="statusIcon" class="mr-1"></i>
            {{ statusText }}
          </span>

          <!-- Время занятия -->
          <span
            v-if="stand.occupiedAt && stand.status === 'occupied'"
            class="text-xs text-gray-500"
          >
            {{ formatOccupiedTime }}
          </span>
        </div>

        <!-- Пользователь, занявший стенд -->
        <div v-if="stand.occupiedBy" class="mt-2">
          <span class="text-sm text-gray-600">
            Занят: <strong>{{ stand.occupiedBy }}</strong>
          </span>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="flex flex-col gap-2 ml-4">
        <Button
          v-if="canOccupy"
          @click="handleOccupy"
          :loading="isLoading"
          icon="pi pi-lock"
          label="Занять"
          class="p-button-success p-button-sm"
        />

        <Button
          v-if="canRelease"
          @click="handleRelease"
          :loading="isLoading"
          icon="pi pi-unlock"
          label="Освободить"
          class="p-button-danger p-button-sm"
        />

        <!-- Информационная кнопка для стендов, занятых другими -->
        <Button
          v-if="isOccupiedByOther"
          disabled
          icon="pi pi-lock"
          label="Занят"
          class="p-button-secondary p-button-sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";

// Props
const props = defineProps({
  stand: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(["occupy", "release"]);

// Композаблы
const { userName } = useUser();
const toast = useToast();

// Локальное состояние
const isLoading = ref(false);

/**
 * Вычисляемые свойства для состояния стенда
 */
const isFree = computed(() => props.stand.status === "free");
const isOccupied = computed(() => props.stand.status === "occupied");
const isOccupiedByCurrentUser = computed(
  () => isOccupied.value && props.stand.occupiedBy === userName.value
);
const isOccupiedByOther = computed(
  () => isOccupied.value && props.stand.occupiedBy !== userName.value
);

/**
 * Вычисляемые свойства для действий
 */
const canOccupy = computed(() => isFree.value && userName.value);
const canRelease = computed(() => isOccupiedByCurrentUser.value);

/**
 * Стили карточки в зависимости от статуса
 */
const cardClasses = computed(() => ({
  "border-stand-free bg-green-50": isFree.value,
  "border-stand-occupied bg-red-50": isOccupied.value,
  "ring-2 ring-blue-300": isOccupiedByCurrentUser.value,
}));

/**
 * Стили статуса
 */
const statusClasses = computed(() => ({
  "bg-stand-free text-white": isFree.value,
  "bg-stand-occupied text-white": isOccupied.value,
}));

/**
 * Иконка статуса
 */
const statusIcon = computed(() => ({
  "pi pi-unlock": isFree.value,
  "pi pi-lock": isOccupied.value,
}));

/**
 * Текст статуса
 */
const statusText = computed(() => {
  if (isFree.value) return "Свободен";
  if (isOccupiedByCurrentUser.value) return "Занят вами";
  return "Занят";
});

/**
 * Форматированное время занятия стенда
 */
const formatOccupiedTime = computed(() => {
  if (!props.stand.occupiedAt) return "";

  const occupiedDate = new Date(props.stand.occupiedAt);
  const now = new Date();
  const diffInMinutes = Math.floor((now - occupiedDate) / (1000 * 60));

  if (diffInMinutes < 1) return "только что";
  if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ч назад`;

  return occupiedDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
});

/**
 * Обрабатывает занятие стенда
 */
const handleOccupy = async () => {
  if (!userName.value) {
    toast.add({
      severity: "warn",
      summary: "Внимание",
      detail: "Необходимо указать ваше имя перед занятием стенда",
      life: 5000,
    });
    return;
  }

  try {
    isLoading.value = true;
    emit("occupy", props.stand.id);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось занять стенд",
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};

/**
 * Обрабатывает освобождение стенда
 */
const handleRelease = async () => {
  try {
    isLoading.value = true;
    emit("release", props.stand.id);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось освободить стенд",
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.stand-card {
  @apply border-2 
    rounded-lg 
    bg-white 
    shadow-sm 
    hover:shadow-md 
    transition-all 
    duration-200;
}

.status-badge {
  @apply px-2 
    py-1 
    rounded-full 
    text-xs 
    font-medium 
    flex 
    items-center;
}

/* Кастомные стили для кнопок */
:deep(.p-button-sm) {
  @apply px-3 py-1 text-sm;
}

:deep(.p-button-success) {
  @apply bg-stand-free border-stand-free;
}

:deep(.p-button-success:hover) {
  @apply bg-green-600 border-green-600;
}

:deep(.p-button-danger) {
  @apply bg-stand-occupied border-stand-occupied;
}

:deep(.p-button-danger:hover) {
  @apply bg-red-600 border-red-600;
}

:deep(.p-button-secondary) {
  @apply bg-gray-500 border-gray-500;
}

/* Анимация при наведении */
.stand-card:hover {
  transform: translateY(-1px);
}

/* Специальное выделение для стендов текущего пользователя */
.stand-card.ring-2 {
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1),
    0 2px 4px -1px rgba(59, 130, 246, 0.06), 0 0 0 3px rgba(59, 130, 246, 0.3);
}
</style>
