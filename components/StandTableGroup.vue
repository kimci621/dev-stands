<template>
  <section class="stand-table-group">
    <div class="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div class="mb-3 flex items-center gap-3">
          <div
            class="grid h-10 w-10 place-items-center rounded-2xl border border-brand-teal/25 bg-brand-teal/15 text-teal-100"
          >
            <i class="pi pi-table"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black tracking-normal text-white">
              {{ groupTitle }}
            </h2>
            <p class="text-sm text-slate-400">
              {{ freeStands }} свободно из {{ totalStands }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <span class="stat-chip border-white/10 bg-white/[0.04] text-slate-200">
            Всего {{ totalStands }}
          </span>
          <span class="stat-chip border-brand-teal/35 bg-brand-teal/20 text-teal-100">
            Свободно {{ freeStands }}
          </span>
          <span class="stat-chip border-brand-pink/35 bg-brand-wine/55 text-pink-100">
            Занято {{ occupiedStands }}
          </span>
        </div>
      </div>

      <div class="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
        <div class="relative min-w-0 lg:w-[360px]">
          <i class="pi pi-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <InputText
            v-model="searchQuery"
            placeholder="Поиск по стенду, владельцу, задаче"
            class="w-full rounded-2xl border-white/10 bg-surface-850/80 py-3 pl-11 pr-4 text-sm"
          />
        </div>

        <div class="segmented-control">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            class="segmented-button"
            :class="{ 'segmented-button-active': statusFilter === option.value }"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="mb-5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
      <div
        class="h-full rounded-full bg-gradient-to-r from-brand-pink to-brand-teal transition-all duration-500"
        :style="{ width: `${occupancyPercentage}%` }"
      ></div>
    </div>

    <div v-if="filteredStands.length > 0" class="overflow-hidden rounded-2xl border border-white/10">
      <div
        class="hidden grid-cols-[minmax(170px,1fr)_110px_minmax(160px,0.9fr)_130px_120px_128px] gap-4 border-b border-white/10 bg-black/15 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:grid"
      >
        <span>Стенд</span>
        <span>Статус</span>
        <span>Кто</span>
        <span>До</span>
        <span>Задача</span>
        <span class="text-right">Действия</span>
      </div>

      <article
        v-for="stand in filteredStands"
        :key="stand.key"
        class="grid gap-3 border-b border-white/10 bg-white/[0.025] p-4 last:border-b-0 hover:bg-white/[0.045] xl:grid-cols-[minmax(170px,1fr)_110px_minmax(160px,0.9fr)_130px_120px_128px] xl:items-center"
      >
        <div class="min-w-0">
          <p class="truncate text-base font-black text-white">{{ stand.name }}</p>
          <p class="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
            {{ typeLabel(stand.type) }}
          </p>
        </div>

        <div>
          <span class="status-badge" :class="statusClasses(stand)">
            {{ statusText(stand) }}
          </span>
        </div>

        <div class="min-w-0 text-sm text-slate-300">
          <span v-if="stand.occupiedBy || stand.occupied_by" class="block truncate">
            {{ stand.occupiedBy || stand.occupied_by }}
          </span>
          <span v-else class="text-slate-600">-</span>
        </div>

        <div class="text-sm text-slate-300">
          <span v-if="stand.ended_at">{{ formatDate(stand.ended_at) }}</span>
          <span v-else class="text-slate-600">-</span>
        </div>

        <div>
          <a
            v-if="stand.task_url"
            :href="stand.task_url"
            target="_blank"
            class="inline-flex items-center gap-2 rounded-full border border-brand-pink/30 bg-brand-pink/10 px-3 py-1.5 text-xs font-black text-pink-100 hover:bg-brand-pink/20"
          >
            <i class="pi pi-link"></i>
            Открыть
          </a>
          <span v-else class="text-sm text-slate-600">-</span>
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <Button
            v-if="canOccupy(stand)"
            icon="pi pi-lock"
            label="Занять"
            size="small"
            class="border-0 bg-brand-pink text-brand-wine"
            @click="emit('occupy', stand.id)"
          />
          <Button
            v-else-if="canRelease(stand)"
            icon="pi pi-unlock"
            label="Снять"
            size="small"
            class="border-brand-pink/35 bg-brand-pink/15 text-pink-50"
            @click="emit('release', stand.id)"
          />
          <Button
            v-else-if="stand.status === 'occupied'"
            icon="pi pi-lock"
            size="small"
            disabled
            class="border-white/10 bg-white/[0.04] text-slate-500"
          />
          <Button
            icon="pi pi-expand"
            size="small"
            text
            rounded
            aria-label="Открыть карточку"
            class="text-slate-300 hover:bg-white/[0.08]"
            @click="openStand(stand)"
          />
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <div
        class="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500"
      >
        <i class="pi pi-search text-2xl"></i>
      </div>
      <p class="text-lg font-black text-white">Ничего не найдено</p>
      <p class="mt-1 text-sm text-slate-400">Измените поиск или фильтр статуса.</p>
    </div>

    <Dialog
      v-model:visible="isStandOpen"
      modal
      header="Карточка стенда"
      :style="{ width: 'min(560px, calc(100vw - 32px))' }"
    >
      <StandCard
        v-if="selectedStand"
        :stand="selectedStand"
        :allow-comment-edit="props.allowCommentEdit"
        @occupy="emit('occupy', $event)"
        @release="emit('release', $event)"
        @task-url-updated="handleDetailsChanged"
        @task-url-removed="handleDetailsChanged"
        @ended-at-updated="handleDetailsChanged"
        @ended-at-removed="handleDetailsChanged"
        @comment-change="handleCommentChange"
      />
    </Dialog>
  </section>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { computed, ref } from "vue";
import { useUser } from "~/composables/useUser";

const props = defineProps({
  groupName: {
    type: String,
    required: true,
  },
  stands: {
    type: Array,
    default: () => [],
  },
  allowCommentEdit: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "occupy",
  "release",
  "refresh-stands",
  "comment-change",
]);

const { user } = useUser();
const statusFilter = ref("all");
const searchQuery = ref("");
const selectedStand = ref(null);
const isStandOpen = ref(false);

const groupTitle = computed(() => {
  const titles = {
    frontend: "Фронтенд стенды",
    backend: "Бэкенд стенды",
  };
  return titles[props.groupName] || props.groupName;
});

const statusOptions = [
  { value: "all", label: "Все" },
  { value: "free", label: "Свободные" },
  { value: "occupied", label: "Занятые" },
];

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

const filteredStands = computed(() => {
  let stands = props.stands || [];

  if (statusFilter.value === "free") {
    stands = stands.filter((stand) => stand.status === "free");
  } else if (statusFilter.value === "occupied") {
    stands = stands.filter((stand) => stand.status === "occupied");
  }

  const query = searchQuery.value.toLowerCase().trim();
  if (query) {
    stands = stands.filter((stand) => {
      const searchable = [
        stand.name,
        stand.type,
        stand.occupiedBy,
        stand.occupied_by,
        stand.task_url,
        stand.comment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }

  return stands.map((stand) => ({
    ...stand,
    key: `${stand.id}-${stand.status}-${stand.occupiedBy || "free"}-${
      stand.ended_at || "no-end"
    }-${stand.comment || "no-comment"}`,
  }));
});

const typeLabel = (type) =>
  type === "frontend" ? "Frontend" : type === "backend" ? "Backend" : type;

const canOccupy = (stand) => stand.status === "free" && !!user.value.email;
const canRelease = (stand) =>
  stand.status === "occupied" &&
  (stand.occupiedBy || stand.occupied_by) === user.value.email;
const isMine = (stand) =>
  stand.status === "occupied" &&
  (stand.occupiedBy || stand.occupied_by) === user.value.email;

const statusText = (stand) => {
  if (stand.status === "free") return "Свободен";
  if (isMine(stand)) return "Ваш";
  return "Занят";
};

const statusClasses = (stand) => ({
  "status-free": stand.status === "free",
  "status-mine": isMine(stand),
  "status-occupied": stand.status === "occupied" && !isMine(stand),
});

function formatDate(value) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function openStand(stand) {
  selectedStand.value = stand;
  isStandOpen.value = true;
}

function handleDetailsChanged(event) {
  emit("refresh-stands", event);
}

function handleCommentChange(standId, comment) {
  emit("comment-change", standId, comment);
}
</script>

<style scoped>
.stand-table-group {
  @apply rounded-[1.4rem] border border-white/10 bg-surface-900/75 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5;
}

.stat-chip {
  @apply inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-black;
}

.segmented-control {
  @apply flex rounded-2xl border border-white/10 bg-white/[0.04] p-1;
}

.segmented-button {
  @apply rounded-xl px-3 py-2 text-sm font-bold text-slate-400 transition hover:text-white;
}

.segmented-button-active {
  @apply bg-brand-pink text-brand-wine shadow-lg shadow-brand-pink/20 hover:text-brand-wine;
}

.status-badge {
  @apply inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-black;
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

.empty-state {
  @apply flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center;
}

@media (max-width: 640px) {
  .segmented-control {
    @apply overflow-x-auto;
  }

  .segmented-button {
    @apply whitespace-nowrap;
  }
}
</style>
