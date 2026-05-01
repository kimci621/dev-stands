<template>
  <section class="stand-group">
    <div class="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div class="mb-3 flex items-center gap-3">
          <div
            class="grid h-10 w-10 place-items-center rounded-2xl border border-brand-pink/25 bg-brand-pink/15 text-brand-pink"
          >
            <i class="pi pi-server"></i>
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
          <span class="stat-chip border-white/10 bg-white/[0.04] text-slate-300">
            {{ occupancyPercentage }}%
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

    <div v-if="filteredStands.length > 0" class="stands-grid">
      <StandCard
        v-for="stand in filteredStands"
        :key="stand.key"
        :stand="stand"
        :allow-comment-edit="props.allowCommentEdit"
        @occupy="handleOccupy"
        @release="handleRelease"
        @task-url-updated="handleTaskUrlChanged"
        @task-url-removed="handleTaskUrlChanged"
        @ended-at-updated="handleEndedAtChanged"
        @ended-at-removed="handleEndedAtChanged"
        @comment-change="handleCommentChange"
      />
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
  </section>
</template>

<script setup>
import InputText from "primevue/inputtext";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";

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

const toast = useToast();

const groupTitle = computed(() => {
  const titles = {
    frontend: "Фронтенд стенды",
    backend: "Бэкенд стенды",
  };
  return titles[props.groupName] || props.groupName;
});

const tempFilteredStands = computed(() => props.stands || []);

const totalStands = computed(() => tempFilteredStands.value.length);

const freeStands = computed(
  () =>
    tempFilteredStands.value.filter((stand) => stand.status === "free").length
);

const occupiedStands = computed(
  () =>
    tempFilteredStands.value.filter((stand) => stand.status === "occupied")
      .length
);

const occupancyPercentage = computed(() => {
  if (totalStands.value === 0) return 0;
  return Math.round((occupiedStands.value / totalStands.value) * 100);
});

const statusOptions = [
  { value: "all", label: "Все" },
  { value: "free", label: "Свободные" },
  { value: "occupied", label: "Занятые" },
];

const statusFilter = ref("all");
const searchQuery = ref("");

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

const handleOccupy = async (standId) => {
  try {
    emit("occupy", standId);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось занять стенд",
      life: 5000,
    });
  }
};

const handleRelease = async (standId) => {
  try {
    emit("release", standId);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.message || "Не удалось освободить стенд",
      life: 5000,
    });
  }
};

function handleTaskUrlChanged(e) {
  emit("refresh-stands", e);
}

function handleEndedAtChanged(e) {
  emit("refresh-stands", e);
}

function handleCommentChange(standId, comment) {
  emit("comment-change", standId, comment);
}
</script>

<style scoped>
.stand-group {
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

.stands-grid {
  column-count: 2;
  column-gap: 14px;
}

.empty-state {
  @apply flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center;
}

@media (max-width: 640px) {
  .stands-grid {
    column-count: 1;
  }

  .segmented-control {
    @apply overflow-x-auto;
  }

  .segmented-button {
    @apply whitespace-nowrap;
  }
}
</style>
