<template>
  <div class="stand-card" :class="cardClasses">
    <div class="flex items-center justify-between p-6">
      <!-- Информация о стенде -->
      <div class="flex-1">
        <h3 class="text-xl font-bold text-neutral-800 mb-3">
          {{ stand.name }}
        </h3>

        <div class="flex items-center gap-3 mb-3">
          <span class="status-badge" :class="statusClasses">
            <i :class="statusIcon" class="mr-2"></i>
            {{ statusText }}
          </span>

          <!-- Время занятия -->
          <span
            v-if="stand.occupiedAt && stand.status === 'occupied'"
            class="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full"
          >
            {{ formatOccupiedTime }}
          </span>
        </div>

        <!-- Пользователь, занявший стенд -->
        <div v-if="stand.occupiedBy" class="mt-3">
          <span class="text-sm text-neutral-600 flex items-center gap-2">
            <i class="pi pi-user text-primary-500"></i>
            Занят:
            <strong class="text-neutral-800">{{ stand.occupiedBy }}</strong>
          </span>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="flex flex-col gap-3 ml-6">
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
const { user } = useUser();
const toast = useToast();

// Локальное состояние
const isLoading = ref(false);

/**
 * Вычисляемые свойства для состояния стенда
 */
const isFree = computed(() => props.stand.status === "free");
const isOccupied = computed(() => props.stand.status === "occupied");
const isOccupiedByCurrentUser = computed(
  () => isOccupied.value && props.stand.occupiedBy === user.value.name
);
const isOccupiedByOther = computed(
  () =>
    isOccupied.value &&
    props.stand.occupiedBy &&
    props.stand.occupiedBy !== user.value.name
);

/**
 * Вычисляемые свойства для действий
 */
const canOccupy = computed(() => isFree.value && !!user.value.name);
const canRelease = computed(() => isOccupiedByCurrentUser.value);

/**
 * Стили карточки в зависимости от статуса
 */
const cardClasses = computed(() => ({
  "border-stand-free-200 bg-gradient-to-br from-stand-free-50 to-stand-free-100":
    isFree.value,
  "border-stand-occupied-200 bg-gradient-to-br from-stand-occupied-50 to-stand-occupied-100":
    isOccupied.value,
  "ring-2 ring-primary-300 shadow-medium": isOccupiedByCurrentUser.value,
}));

/**
 * Стили статуса
 */
const statusClasses = computed(() => ({
  "bg-gradient-to-r from-stand-free-500 to-stand-free-600 text-white shadow-soft":
    isFree.value,
  "bg-gradient-to-r from-stand-occupied-500 to-stand-occupied-600 text-white shadow-soft":
    isOccupied.value,
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
  if (!user.value.name) {
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
    rounded-2xl 
    bg-white 
    shadow-soft 
    hover:shadow-medium
    transition-all duration-300 ease-out;
}

.stand-card:hover {
  transform: translateY(-2px);
}

.status-badge {
  @apply px-4 
    py-2 
    rounded-full 
    text-sm 
    font-semibold 
    flex 
    items-center
    transition-all duration-300;
}

/* Кастомные стили для кнопок */
:deep(.p-button-sm) {
  @apply px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300;
}

:deep(.p-button-success) {
  @apply bg-gradient-to-r from-stand-free-500 to-stand-free-600 border-stand-free-500 text-white shadow-soft;
}

:deep(.p-button-success:hover) {
  @apply from-stand-free-600 to-stand-free-700 border-stand-free-600 shadow-medium transform scale-105;
}

:deep(.p-button-danger) {
  @apply bg-gradient-to-r from-stand-occupied-500 to-stand-occupied-600 border-stand-occupied-500 text-white shadow-soft;
}

:deep(.p-button-danger:hover) {
  @apply from-stand-occupied-600 to-stand-occupied-700 border-stand-occupied-600 shadow-medium transform scale-105;
}

:deep(.p-button-secondary) {
  @apply bg-gradient-to-r from-neutral-400 to-neutral-500 border-neutral-400 text-white shadow-soft;
}

/* Специальное выделение для стендов текущего пользователя */
.stand-card.ring-2 {
  box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.15),
    0 4px 10px -2px rgba(59, 130, 246, 0.1), 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* Анимация при наведении */
.stand-card:hover .status-badge {
  transform: scale(1.05);
}
</style>
