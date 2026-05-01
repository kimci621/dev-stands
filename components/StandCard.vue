<template>
  <article class="stand-card" :class="cardClasses">
    <div class="mb-4 flex items-start justify-between gap-4">
      <div class="min-w-0">
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <h3 class="truncate text-xl font-black tracking-normal text-white">
            {{ stand.name }}
          </h3>
          <span class="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-slate-400">
            {{ stand.type }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="status-badge" :class="statusClasses">
            <i :class="statusIcon"></i>
            {{ statusText }}
          </span>
          <span
            v-if="stand.occupiedAt && stand.status === 'occupied'"
            class="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-400"
          >
            {{ formatOccupiedTime }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 flex-col gap-2">
        <Button
          v-if="canOccupy"
          icon="pi pi-lock"
          label="Занять"
          class="border-0 bg-brand-pink text-brand-wine shadow-lg shadow-brand-pink/20 hover:bg-pink-300"
          :loading="isLoading"
          @click="handleOccupy"
        />
        <Button
          v-if="canRelease"
          icon="pi pi-unlock"
          label="Освободить"
          class="border-brand-pink/35 bg-brand-pink/15 text-pink-50 hover:bg-brand-pink/25"
          :loading="isLoading"
          @click="handleRelease"
        />
        <Button
          v-if="isOccupiedByOther"
          disabled
          icon="pi pi-lock"
          label="Занят"
          class="border-white/10 bg-white/[0.04] text-slate-400"
        />
      </div>
    </div>

    <div v-if="stand.occupiedBy" class="mb-4 grid gap-2 rounded-2xl border border-white/10 bg-black/10 p-3 text-sm">
      <div class="meta-row">
        <span>Кто</span>
        <strong>{{ stand.occupiedBy }}</strong>
      </div>
      <div v-if="stand.ended_at" class="meta-row">
        <span>До</span>
        <strong>{{ formatEndedAt }}</strong>
      </div>
    </div>

    <div class="space-y-3">
      <div v-if="stand.task_url || isOccupied" class="detail-block">
        <div class="detail-header">
          <span><i class="pi pi-link"></i> Задача</span>
          <div class="flex items-center gap-1">
            <Button
              v-if="stand.task_url"
              icon="pi pi-pencil"
              text
              rounded
              class="detail-icon"
              @click="openTaskModal"
            />
            <Button
              v-if="stand.task_url"
              icon="pi pi-times"
              text
              rounded
              class="detail-icon text-brand-pink"
              @click="unsetTaskUrl"
            />
          </div>
        </div>
        <a
          v-if="stand.task_url"
          :href="stand.task_url"
          target="_blank"
          class="mt-2 block break-all text-sm font-bold text-pink-100 underline decoration-brand-pink/50 underline-offset-4"
        >
          {{ taskUrl }}
        </a>
        <Button
          v-else
          icon="pi pi-plus"
          label="Указать ссылку"
          class="mt-2 border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
          @click="openTaskModal"
        />
      </div>

      <div v-if="isOccupied" class="detail-block">
        <div class="detail-header">
          <span><i class="pi pi-clock"></i> Время освобождения</span>
          <div class="flex items-center gap-1">
            <Button
              v-if="stand.ended_at"
              icon="pi pi-pencil"
              text
              rounded
              class="detail-icon"
              @click="openEndedAtModal"
            />
            <Button
              v-if="stand.ended_at"
              icon="pi pi-times"
              text
              rounded
              class="detail-icon text-brand-pink"
              @click="unsetEndedAt"
            />
          </div>
        </div>
        <p v-if="stand.ended_at" class="mt-2 text-sm font-bold text-slate-100">
          {{ formatEndedAt }}
        </p>
        <Button
          v-else
          icon="pi pi-plus"
          label="Установить время"
          class="mt-2 border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
          @click="openEndedAtModal"
        />
      </div>

      <div v-if="hasComment || canEditComment" class="detail-block">
        <div class="detail-header">
          <span><i class="pi pi-comment"></i> Комментарий</span>
          <div v-if="canEditComment" class="flex items-center gap-1">
            <Button
              v-if="hasComment"
              icon="pi pi-pencil"
              text
              rounded
              class="detail-icon"
              @click="openCommentModal"
            />
            <Button
              v-if="hasComment"
              icon="pi pi-times"
              text
              rounded
              class="detail-icon text-brand-pink"
              :loading="isCommentSaving"
              :disabled="isCommentSaving"
              @click="removeComment"
            />
          </div>
        </div>
        <p v-if="hasComment" class="mt-2 whitespace-pre-line text-sm text-slate-200">
          {{ localComment }}
        </p>
        <Button
          v-else-if="canEditComment"
          icon="pi pi-plus"
          label="Добавить комментарий"
          class="mt-2 border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
          @click="openCommentModal"
        />
      </div>
    </div>

    <Dialog
      v-model:visible="showTaskModal"
      header="Ссылка на задачу"
      :modal="true"
      :closable="true"
      :style="{ width: 'min(440px, calc(100vw - 32px))' }"
    >
      <form class="space-y-4" @submit.prevent="submitTaskUrl">
        <div>
          <label for="taskUrlInput" class="mb-2 block text-sm font-bold text-slate-200">
            Ссылка на задачу
          </label>
          <InputText
            id="taskUrlInput"
            v-model="taskUrlInput"
            class="w-full rounded-2xl"
            :class="{ 'border-brand-pink': urlError }"
            placeholder="https://..."
            required
            autofocus
          />
          <p v-if="urlError" class="mt-2 text-xs font-bold text-brand-pink">
            Введите корректную ссылку
          </p>
        </div>
        <Button
          type="submit"
          label="Сохранить"
          class="w-full border-0 bg-brand-pink text-brand-wine"
          :disabled="isLoading"
        />
      </form>
    </Dialog>

    <Dialog
      v-model:visible="showEndedAtModal"
      header="Время окончания занятия"
      :modal="true"
      :closable="true"
      :style="{ width: 'min(440px, calc(100vw - 32px))' }"
    >
      <form class="space-y-4" @submit.prevent="submitEndedAt">
        <div>
          <label for="endedAtInput" class="mb-2 block text-sm font-bold text-slate-200">
            Дата и время окончания
          </label>
          <DatePicker
            id="endedAtInput"
            v-model="endedAtInput"
            class="w-full"
            showTime
            hourFormat="24"
            dateFormat="dd/mm/yy"
            placeholder="Выберите дату и время"
            :minDate="new Date()"
            required
            autofocus
          />
          <p v-if="endedAtError" class="mt-2 text-xs font-bold text-brand-pink">
            {{ endedAtError }}
          </p>
        </div>
        <Button
          type="submit"
          label="Сохранить"
          class="w-full border-0 bg-brand-pink text-brand-wine"
          :disabled="isLoading"
        />
      </form>
    </Dialog>

    <Dialog
      v-model:visible="showCommentModal"
      header="Комментарий к стенду"
      :modal="true"
      :closable="true"
      :style="{ width: 'min(520px, calc(100vw - 32px))' }"
    >
      <form class="space-y-4" @submit.prevent="submitComment">
        <div>
          <label for="commentInput" class="mb-2 block text-sm font-bold text-slate-200">
            Комментарий
          </label>
          <Textarea
            id="commentInput"
            v-model="commentInput"
            rows="5"
            autoResize
            class="w-full rounded-2xl border-white/10 bg-surface-850/90 text-slate-100"
            placeholder="Опишите прогресс, блокеры или ссылку на PR"
          />
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <Button
            type="submit"
            label="Сохранить"
            class="border-0 bg-brand-pink text-brand-wine"
            :disabled="isCommentSaving"
            :loading="isCommentSaving"
          />
          <Button
            v-if="hasComment"
            type="button"
            label="Удалить"
            class="border-brand-pink/35 bg-brand-pink/15 text-pink-50"
            :disabled="isCommentSaving"
            @click="removeComment"
          />
        </div>
      </form>
    </Dialog>
  </article>
</template>

<script setup>
import { useToast } from "primevue/usetoast";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import Textarea from "primevue/textarea";
import { ref, computed, watch } from "vue";
import { useUser } from "~/composables/useUser";
import { useApi } from "~/composables/useApi";

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

const emit = defineEmits([
  "occupy",
  "release",
  "task-url-updated",
  "task-url-removed",
  "ended-at-updated",
  "ended-at-removed",
  "comment-change",
]);

const { user } = useUser();
const toast = useToast();
const { updateStand } = useApi();

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

function openTaskModal() {
  taskUrlInput.value = props.stand.task_url || "";
  urlError.value = false;
  showTaskModal.value = true;
}

function openEndedAtModal() {
  endedAtInput.value = props.stand.ended_at
    ? new Date(props.stand.ended_at)
    : null;
  endedAtError.value = "";
  showEndedAtModal.value = true;
}

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

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

const canOccupy = computed(() => isFree.value && !!user.value.email);
const canRelease = computed(() => isOccupiedByCurrentUser.value);
const canEditComment = computed(
  () => isOccupiedByCurrentUser.value && props.allowCommentEdit
);
const hasComment = computed(() => !!localComment.value);

const cardClasses = computed(() => ({
  "stand-card-free": isFree.value,
  "stand-card-occupied": isOccupied.value && !isOccupiedByCurrentUser.value,
  "stand-card-mine": isOccupiedByCurrentUser.value,
}));

const statusClasses = computed(() => ({
  "status-free": isFree.value,
  "status-occupied": isOccupied.value && !isOccupiedByCurrentUser.value,
  "status-mine": isOccupiedByCurrentUser.value,
}));

const statusIcon = computed(() => ({
  "pi pi-unlock": isFree.value,
  "pi pi-lock": isOccupied.value,
}));

const statusText = computed(() => {
  if (isFree.value) return "Свободен";
  if (isOccupiedByCurrentUser.value) return "Ваш стенд";
  return "Занят";
});

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

function openCommentModal() {
  commentInput.value = localComment.value;
  showCommentModal.value = true;
}

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
  @apply rounded-[1.35rem] border p-4 shadow-xl shadow-black/20 transition duration-200;
  height: fit-content;
  break-inside: avoid;
  display: inline-block;
  width: 100%;
  margin-bottom: 14px;
}

.stand-card:hover {
  transform: translateY(-2px);
}

.stand-card-free {
  @apply border-brand-teal/35 bg-gradient-to-br from-surface-850/95 to-brand-forest/70;
}

.stand-card-occupied {
  @apply border-brand-pink/35 bg-gradient-to-br from-brand-wine/70 to-surface-850/95;
}

.stand-card-mine {
  @apply border-brand-pink/60 bg-gradient-to-br from-brand-forest/80 to-brand-wine/50 ring-2 ring-brand-pink/25;
}

.status-badge {
  @apply inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black;
}

.status-free {
  @apply border-brand-teal/40 bg-brand-teal/20 text-teal-100;
}

.status-occupied {
  @apply border-brand-pink/40 bg-brand-pink/15 text-pink-100;
}

.status-mine {
  @apply border-brand-pink/50 bg-brand-pink text-brand-wine;
}

.meta-row {
  @apply flex items-center justify-between gap-3;
}

.meta-row span {
  @apply text-slate-500;
}

.meta-row strong {
  @apply min-w-0 truncate text-right text-slate-100;
}

.detail-block {
  @apply rounded-2xl border border-white/10 bg-white/[0.035] p-3;
}

.detail-header {
  @apply flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500;
}

.detail-header span {
  @apply flex items-center gap-2;
}

.detail-icon {
  @apply h-8 w-8 text-slate-300 hover:bg-white/[0.08];
}

:deep(.p-datepicker) {
  background: #0b171a;
  color: #edf7f8;
  border: 1px solid rgba(218, 123, 147, 0.22);
}

:deep(.p-datepicker-header) {
  background: #0b171a;
  color: #edf7f8;
}

:deep(.p-datepicker table td > span) {
  color: #edf7f8;
}

:deep(.p-datepicker table td.p-datepicker-today > span) {
  background: rgba(218, 123, 147, 0.18);
  color: #ffd7df;
}
</style>
