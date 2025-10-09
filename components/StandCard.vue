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
        <!-- Ссылка на задачу -->
        <div class="mt-4">
          <Button
            v-if="!stand.task_url"
            label="Указать ссылку на задачу"
            icon="pi pi-link"
            class="p-button-sm p-button-outlined text-primary-600 border-primary-300 hover:bg-primary-50"
            @click="openTaskModal"
          />
          <div v-else class="flex items-center gap-2 mt-2">
            <a
              :href="stand.task_url"
              target="_blank"
              class="text-primary-600 underline break-all"
              >{{ taskUrl }}</a
            >
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-0"
              @click="openTaskModal"
            />
            <Button
              icon="pi pi-times"
              class="p-button-text p-0 text-red-500"
              @click="unsetTaskUrl"
            />
          </div>
        </div>
        <!-- Время окончания -->
        <div class="mt-4" v-if="stand.occupiedBy">
          <Button
            v-if="!stand.ended_at"
            label="Установить время освобождения"
            icon="pi pi-clock"
            class="p-button-sm p-button-outlined text-orange-600 border-orange-300 hover:bg-orange-50"
            @click="openEndedAtModal"
          />
          <div v-else class="flex items-center gap-2 mt-2">
            <span
              class="text-orange-600 text-sm bg-orange-50 px-3 py-1 rounded-full"
            >
              <i class="pi pi-clock mr-1"></i>
              Окончание: {{ formatEndedAt }}
            </span>
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-0"
              @click="openEndedAtModal"
            />
            <Button
              icon="pi pi-times"
              class="p-button-text p-0 text-red-500"
              @click="unsetEndedAt"
            />
          </div>
        </div>
        <!-- Комментарий -->
        <div class="mt-4">
          <div v-if="hasComment" class="comment-block">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <p class="comment-label">Комментарий</p>
                <p class="comment-text">{{ localComment }}</p>
              </div>
              <div v-if="canEditComment" class="flex items-center gap-2">
                <Button
                  icon="pi pi-pencil"
                  class="p-button-text p-0"
                  @click="openCommentModal"
                />
                <Button
                  icon="pi pi-times"
                  class="p-button-text p-0 text-red-500"
                  :loading="isCommentSaving"
                  :disabled="isCommentSaving"
                  @click="removeComment"
                />
              </div>
            </div>
          </div>
          <Button
            v-else-if="canEditComment"
            label="Добавить комментарий"
            icon="pi pi-comment"
            class="p-button-sm p-button-outlined text-neutral-600 border-neutral-300 hover:bg-neutral-50"
            @click="openCommentModal"
          />
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
    <!-- Модалка для ввода/редактирования ссылки на задачу -->
    <Dialog
      v-model:visible="showTaskModal"
      header="Ссылка на задачу"
      :modal="true"
      :closable="true"
      :style="{ width: '400px' }"
    >
      <form @submit.prevent="submitTaskUrl">
        <div class="mb-4">
          <label
            for="taskUrlInput"
            class="block mb-2 text-sm font-medium text-neutral-700"
            >Ссылка на задачу</label
          >
          <InputText
            id="taskUrlInput"
            v-model="taskUrlInput"
            :class="['w-full', urlError ? 'border-red-500' : '']"
            placeholder="https://..."
            required
            autofocus
          />
          <div v-if="urlError" class="text-red-500 text-xs mt-1">
            Введите корректную ссылку
          </div>
        </div>
        <Button
          type="submit"
          label="Сохранить"
          class="w-full"
          :disabled="isLoading"
        />
      </form>
    </Dialog>
    <!-- Модалка для установки времени окончания -->
    <Dialog
      v-model:visible="showEndedAtModal"
      header="Время окончания занятия"
      :modal="true"
      :closable="true"
      :style="{ width: '400px' }"
    >
      <form @submit.prevent="submitEndedAt">
        <div class="mb-4">
          <label
            for="endedAtInput"
            class="block mb-2 text-sm font-medium text-neutral-700"
            >Дата и время окончания</label
          >
          <Calendar
            id="endedAtInput"
            v-model="endedAtInput"
            :class="['w-full', endedAtError ? 'border-red-500' : '']"
            showTime
            hourFormat="24"
            dateFormat="dd/mm/yy"
            placeholder="Выберите дату и время"
            :minDate="new Date()"
            required
            autofocus
          />
          <div v-if="endedAtError" class="text-red-500 text-xs mt-1">
            {{ endedAtError }}
          </div>
        </div>
        <Button
          type="submit"
          label="Сохранить"
          class="w-full"
          :disabled="isLoading"
        />
      </form>
    </Dialog>
    <!-- Модалка для комментария -->
    <Dialog
      v-model:visible="showCommentModal"
      header="Комментарий к стенду"
      :modal="true"
      :closable="true"
      :style="{ width: '480px' }"
    >
      <form @submit.prevent="submitComment">
        <div class="mb-4">
          <label
            for="commentInput"
            class="block mb-2 text-sm font-medium text-neutral-700"
            >Комментарий</label
          >
          <Textarea
            id="commentInput"
            v-model="commentInput"
            rows="5"
            autoResize
            class="w-full"
            placeholder="Опишите прогресс, блокеры или ссылку на PR"
          />
        </div>
        <div class="flex gap-3">
          <Button
            type="submit"
            label="Сохранить"
            class="flex-1"
            :disabled="isCommentSaving"
            :loading="isCommentSaving"
          />
          <Button
            v-if="hasComment"
            type="button"
            label="Удалить"
            class="p-button-outlined text-red-500 border-red-300 flex-1"
            :disabled="isCommentSaving"
            @click="removeComment"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Textarea from "primevue/textarea";
import { ref, computed, watch } from "vue";
import { useUser } from "~/composables/useUser";
import { useApi } from "~/composables/useApi";

// Props
const props = defineProps({
  stand: {
    type: Object,
    required: true,
  },
  allowCommentEdit: {
    type: Boolean,
    default: false,
  },
});
// Emits
const emit = defineEmits([
  "occupy",
  "release",
  "task-url-updated",
  "task-url-removed",
  "ended-at-updated",
  "ended-at-removed",
]);
// Композаблы
const { user } = useUser();
const toast = useToast();
const { updateStand } = useApi();
// Локальное состояние
const isLoading = ref(false);
const showTaskModal = ref(false);
const taskUrlInput = ref("");
const urlError = ref(false);
const showEndedAtModal = ref(false);
const endedAtInput = ref(null);
const endedAtError = ref("");
const showCommentModal = ref(false);
const commentInput = ref("");
const isCommentSaving = ref(false);
const localComment = ref(props.stand.comment || "");
const taskUrl = computed(() => {
  if (!props.stand?.task_url) return "";
  const taskUrlHasParams = props.stand.task_url.includes("?");
  if (taskUrlHasParams) {
    return props.stand.task_url.split("?")[0];
  }
  return props.stand.task_url;
});

watch(
  () => props.stand.comment,
  (value) => {
    localComment.value = value || "";
  }
);

// Открыть модалку для добавления/редактирования ссылки
function openTaskModal() {
  taskUrlInput.value = props.stand.task_url || "";
  urlError.value = false;
  showTaskModal.value = true;
}
// Открыть модалку для установки времени окончания
function openEndedAtModal() {
  endedAtInput.value = props.stand.ended_at
    ? new Date(props.stand.ended_at)
    : null;
  endedAtError.value = "";
  showEndedAtModal.value = true;
}
// Проверка валидности URL
function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
// Форматированное время окончания
const formatEndedAt = computed(() => {
  if (!props.stand.ended_at) return "";
  const date = new Date(props.stand.ended_at);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});
// Отправить ссылку на задачу
async function submitTaskUrl() {
  urlError.value = false;
  if (!isValidUrl(taskUrlInput.value)) {
    urlError.value = true;
    return;
  }
  isLoading.value = true;
  try {
    await updateStand(props.stand.id, "set_task_url", null, {
      task_url: taskUrlInput.value,
    });
    toast.add({
      severity: "success",
      summary: "Сохранено",
      detail: "Ссылка на задачу сохранена",
      life: 3000,
    });
    showTaskModal.value = false;
    // Сообщаем родителю об изменении ссылки
    emit("task-url-updated", {
      standId: props.stand.id,
      task_url: taskUrlInput.value,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось сохранить ссылку",
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
}
// Отправить время окончания
async function submitEndedAt() {
  endedAtError.value = "";
  if (!endedAtInput.value) {
    endedAtError.value = "Выберите дату и время";
    return;
  }
  if (endedAtInput.value < new Date()) {
    endedAtError.value = "Время окончания не может быть в прошлом";
    return;
  }
  isLoading.value = true;
  try {
    console.log("endedAtInput.value", endedAtInput.value.toISOString());
    await updateStand(props.stand.id, "set_ended_at", null, {
      ended_at: endedAtInput.value.toISOString(),
    });
    toast.add({
      severity: "success",
      summary: "Сохранено",
      detail: "Время окончания установлено",
      life: 3000,
    });
    showEndedAtModal.value = false;
    // Сообщаем родителю об изменении времени окончания
    emit("ended-at-updated", {
      standId: props.stand.id,
      ended_at: endedAtInput.value.toISOString(),
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось установить время окончания",
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
}
// Удалить ссылку на задачу
async function unsetTaskUrl() {
  isLoading.value = true;
  try {
    await updateStand(props.stand.id, "unset_task_url");
    toast.add({
      severity: "info",
      summary: "Ссылка удалена",
      detail: "Ссылка на задачу отвязана",
      life: 3000,
    });
    // Сообщаем родителю об удалении ссылки
    emit("task-url-removed", props.stand.id);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось удалить ссылку",
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
}
// Удалить время окончания
async function unsetEndedAt() {
  isLoading.value = true;
  try {
    await updateStand(props.stand.id, "unset_ended_at");
    toast.add({
      severity: "info",
      summary: "Время сброшено",
      detail: "Время окончания удалено",
      life: 3000,
    });
    // Сообщаем родителю об удалении времени окончания
    emit("ended-at-removed", props.stand.id);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось удалить время окончания",
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
}

/**
 * Вычисляемые свойства для состояния стенда
 */
const isFree = computed(() => props.stand.status === "free");
const isOccupied = computed(() => props.stand.status === "occupied");
const isOccupiedByCurrentUser = computed(
  () => isOccupied.value && props.stand.occupiedBy === user.value.email
);
const isOccupiedByOther = computed(
  () =>
    isOccupied.value &&
    props.stand.occupiedBy &&
    props.stand.occupiedBy !== user.value.email
);

/**
 * Вычисляемые свойства для действий
 */
const canOccupy = computed(() => isFree.value && !!user.value.email);
const canRelease = computed(() => isOccupiedByCurrentUser.value);
const canEditComment = computed(
  () => isOccupiedByCurrentUser.value && props.allowCommentEdit
);
const hasComment = computed(() => !!localComment.value);

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
  if (!user.value.email) {
    toast.add({
      severity: "warn",
      summary: "Внимание",
      detail: "Необходимо войти в систему перед занятием стенда",
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

/**
 * Открывает модалку редактирования комментария
 */
function openCommentModal() {
  commentInput.value = localComment.value;
  showCommentModal.value = true;
}

/**
 * Сохраняет комментарий к стенду
 */
async function submitComment() {
  isCommentSaving.value = true;
  try {
    const payloadComment = commentInput.value.trim();
    emit("comment-change", props.stand.id, payloadComment || null);
    localComment.value = payloadComment;
    showCommentModal.value = false;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось сохранить комментарий",
      life: 5000,
    });
  } finally {
    isCommentSaving.value = false;
  }
}

/**
 * Удаляет комментарий стенда
 */
async function removeComment() {
  isCommentSaving.value = true;
  try {
    commentInput.value = "";
    await submitComment();
    toast.add({
      severity: "info",
      summary: "Комментарий удалён",
      detail: "Комментарий очищен",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось удалить комментарий",
      life: 5000,
    });
  } finally {
    isCommentSaving.value = false;
  }
}
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

.comment-block {
  @apply bg-neutral-100/80 border border-neutral-200 rounded-2xl p-4 shadow-inner;
}

.comment-label {
  @apply text-xs font-semibold uppercase text-neutral-500 tracking-wide mb-2;
}

.comment-text {
  @apply text-sm text-neutral-700 whitespace-pre-line;
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
