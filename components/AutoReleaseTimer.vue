<template>
  <div class="auto-release-timer">
    <div class="timer-container">
      <!-- Иконка -->
      <i class="pi pi-clock text-blue-600"></i>

      <!-- Информация о таймере -->
      <div class="timer-info">
        <span class="timer-label"> Автосброс стендов через: </span>
        <span class="timer-value" :class="timerClasses">
          {{ formattedTime }}
        </span>
      </div>

      <!-- Кнопка принудительного сброса (только для администраторов) -->
      <Button
        v-if="showResetButton"
        @click="handleManualReset"
        :loading="isResetting"
        icon="pi pi-refresh"
        label="Сбросить сейчас"
        class="p-button-outlined p-button-sm"
        severity="secondary"
      />
    </div>

    <!-- Прогресс-бар времени до сброса -->
    <div class="progress-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <span class="progress-text">
        {{ Math.round(progressPercentage) }}% дня прошло
      </span>
    </div>

    <!-- Дополнительная информация -->
    <div v-if="lastResetInfo" class="reset-info">
      <small class="text-gray-500">
        Последний сброс: {{ lastResetFormatted }}
      </small>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";

// Props
const props = defineProps({
  lastReset: {
    type: [Number, String],
    default: null,
  },
  showResetButton: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["manual-reset"]);

// Композаблы
const toast = useToast();

// Локальное состояние
const currentTime = ref(new Date());
const isResetting = ref(false);

// Обновление времени каждую секунду
let timeInterval = null;

onMounted(() => {
  timeInterval = setInterval(() => {
    const newTime = new Date();
    // Обновляем только если секунды изменились
    if (newTime.getSeconds() !== currentTime.value.getSeconds()) {
      currentTime.value = newTime;
    }
  }, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

/**
 * Вычисляет время до следующего сброса (полночь)
 */
const timeUntilReset = computed(() => {
  const now = currentTime.value;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const timeDiff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(timeDiff / 1000),
    totalMilliseconds: timeDiff,
  };
});

/**
 * Форматированное время
 */
const formattedTime = computed(() => {
  const { hours, minutes, seconds } = timeUntilReset.value;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

/**
 * Процент прогресса дня
 */
const progressPercentage = computed(() => {
  const now = currentTime.value;
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const msInDay = 24 * 60 * 60 * 1000;
  const msPassed = now.getTime() - startOfDay.getTime();

  return (msPassed / msInDay) * 100;
});

/**
 * Классы для таймера в зависимости от оставшегося времени
 */
const timerClasses = computed(() => {
  const { hours } = timeUntilReset.value;

  return {
    "text-red-600 font-bold": hours < 1, // Менее часа - красный
    "text-orange-600 font-semibold": hours < 3 && hours >= 1, // Менее 3 часов - оранжевый
    "text-blue-600": hours >= 3, // Более 3 часов - синий
  };
});

/**
 * Информация о последнем сбросе
 */
const lastResetInfo = computed(() => {
  return props.lastReset && !isNaN(new Date(props.lastReset).getTime());
});

const lastResetFormatted = computed(() => {
  if (!lastResetInfo.value) return "";

  const resetDate = new Date(props.lastReset);
  return resetDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

/**
 * Обрабатывает принудительный сброс
 */
const handleManualReset = async () => {
  try {
    isResetting.value = true;

    // Подтверждение от пользователя
    const confirmed = confirm(
      "Вы уверены, что хотите сбросить все стенды сейчас?"
    );
    if (!confirmed) return;

    emit("manual-reset");

    toast.add({
      severity: "info",
      summary: "Сброс выполнен",
      detail: "Все стенды были сброшены принудительно",
      life: 5000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось выполнить сброс",
      life: 5000,
    });
  } finally {
    isResetting.value = false;
  }
};

/**
 * Уведомление о приближающемся сбросе
 */
watch(
  () => timeUntilReset.value.hours,
  (newHours, oldHours) => {
    // Уведомление за час до сброса
    if (newHours === 0 && oldHours === 1) {
      toast.add({
        severity: "warn",
        summary: "Внимание!",
        detail: "Автоматический сброс стендов произойдёт через час",
        life: 10000,
      });
    }
  }
);

watch(
  () => timeUntilReset.value.minutes,
  (newMinutes, oldMinutes) => {
    // Уведомление за 10 минут до сброса
    if (
      newMinutes === 10 &&
      timeUntilReset.value.hours === 0 &&
      oldMinutes === 11
    ) {
      toast.add({
        severity: "warn",
        summary: "Внимание!",
        detail: "Автоматический сброс стендов произойдёт через 10 минут",
        life: 10000,
      });
    }

    // Уведомление за минуту до сброса
    if (
      newMinutes === 1 &&
      timeUntilReset.value.hours === 0 &&
      oldMinutes === 2
    ) {
      toast.add({
        severity: "error",
        summary: "Последнее предупреждение!",
        detail: "Автоматический сброс стендов произойдёт через 1 минуту",
        life: 15000,
      });
    }
  }
);
</script>

<style scoped>
.auto-release-timer {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200;
}

.timer-container {
  @apply flex items-center gap-3 mb-3;
}

.timer-info {
  @apply flex-1 flex items-center gap-2;
}

.timer-label {
  @apply text-sm text-gray-600;
}

.timer-value {
  @apply text-xl font-mono font-bold;
  font-feature-settings: "tnum";
  /* Предотвращение layout shift при изменении цифр */
  min-width: 80px;
  text-align: center;
}

.progress-container {
  @apply flex items-center gap-2 mb-2;
}

.progress-bar {
  @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-500 font-medium;
}

.reset-info {
  @apply pt-2 border-t border-blue-100;
}

/* Анимация пульсации для критичного времени */
.timer-value.text-red-600 {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Адаптивность для мобильных устройств */
@media (max-width: 640px) {
  .timer-container {
    @apply flex-col items-start gap-2;
  }

  .timer-info {
    @apply flex-col items-start gap-1;
  }

  .timer-value {
    @apply text-lg;
  }
}

/* Улучшенные стили для кнопки сброса */
:deep(.p-button-outlined) {
  @apply border-blue-300 text-blue-700;
}

:deep(.p-button-outlined:hover) {
  @apply bg-blue-50 border-blue-400;
}
</style>
