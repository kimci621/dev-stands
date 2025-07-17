<template>
  <div class="auto-release-timer">
    <div class="timer-container">
      <!-- Иконка -->
      <i class="pi pi-clock text-blue-600"></i>

      <!-- Информация о последнем сбросе -->
      <div class="timer-info">
        <span class="timer-label"> Последний сброс: </span>
        <span class="timer-value">{{ lastResetFormatted }}</span>
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
const isResetting = ref(false);

const lastResetFormatted = computed(() => {
  if (!props.lastReset) return "-";
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
</script>

<style scoped>
.auto-release-timer {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200;
}

.timer-container {
  @apply flex items-center gap-3;
}

.timer-info {
  @apply flex-1 flex items-center gap-2;
}

.timer-label {
  @apply text-sm text-gray-600;
}

.timer-value {
  @apply text-xl text-gray-700 font-mono font-bold;
  font-feature-settings: "tnum";
  min-width: 80px;
  text-align: center;
}

/* Улучшенные стили для кнопки сброса */
:deep(.p-button-outlined) {
  @apply border-blue-300 text-blue-700;
}

:deep(.p-button-outlined:hover) {
  @apply bg-blue-50 border-blue-400;
}
</style>
