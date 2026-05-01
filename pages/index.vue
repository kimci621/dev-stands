<template>
  <div class="min-h-screen bg-surface-950 text-slate-100">
    <header
      class="sticky top-0 z-50 border-b border-white/10 bg-surface-950/80 backdrop-blur-2xl"
    >
      <div class="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex min-w-0 items-center gap-4">
          <div
            class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-pink to-brand-teal text-lg font-black text-brand-wine shadow-[0_18px_46px_rgba(218,123,147,0.24)]"
          >
            S
          </div>
          <div class="min-w-0">
            <h1 class="truncate text-xl font-black tracking-normal text-white sm:text-2xl">
              Управление стендами
            </h1>
            <p class="hidden text-sm text-slate-400 sm:block">
              Быстро видно, что свободно, что занято и когда освободится
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/manage"
            class="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-brand-pink/35 hover:bg-brand-pink/15 hover:text-white sm:inline-flex"
          >
            <i class="pi pi-cog"></i>
            Редактирование
          </NuxtLink>
          <span
            class="hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold sm:inline-flex"
            :class="
              isConnected
                ? 'border-brand-teal/40 bg-brand-teal/15 text-teal-100'
                : 'border-brand-pink/40 bg-brand-wine/60 text-pink-100'
            "
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="isConnected ? 'bg-teal-300' : 'bg-brand-pink'"
            ></span>
            {{ isConnected ? "Подключено" : "Отключено" }}
          </span>
          <UserProfile />
        </div>
      </div>
    </header>

    <main class="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
      <aside class="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section class="rounded-[1.4rem] border border-white/10 bg-surface-900/75 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p class="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Обзор
          </p>
          <div class="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div
              v-for="metric in metrics"
              :key="metric.label"
              class="rounded-2xl border p-4"
              :class="metric.class"
            >
              <div class="text-3xl font-black leading-none">{{ metric.value }}</div>
              <div class="mt-2 text-sm font-semibold opacity-80">{{ metric.label }}</div>
            </div>
          </div>
        </section>

        <section class="rounded-[1.4rem] border border-white/10 bg-surface-900/75 p-4 backdrop-blur-xl">
          <p class="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Блоки
          </p>
          <div class="space-y-2">
            <button
              v-for="group in groupControls"
              :key="group.key"
              class="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-bold transition"
              :class="
                isGroupVisible(group.key)
                  ? 'border-brand-pink/35 bg-brand-pink/15 text-pink-50'
                  : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
              "
              @click="toggleGroup(group.key)"
            >
              <span>{{ group.label }}</span>
              <i
                class="pi"
                :class="isGroupVisible(group.key) ? 'pi-eye' : 'pi-eye-slash'"
              ></i>
            </button>
          </div>
        </section>
      </aside>

      <section class="min-w-0 space-y-5">
        <div
          v-if="!isConnected && !isLoading"
          class="rounded-2xl border border-brand-pink/35 bg-brand-wine/60 p-4 text-pink-50"
        >
          <div class="flex items-start gap-3">
            <i class="pi pi-exclamation-triangle mt-0.5 text-brand-pink"></i>
            <div>
              <p class="font-black">Нет подключения к серверу</p>
              <p class="mt-1 text-sm text-pink-100/75">Проверьте, что сервер запущен.</p>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="grid gap-4 md:grid-cols-2">
          <div
            v-for="index in 4"
            :key="index"
            class="h-48 animate-pulse rounded-[1.4rem] border border-white/10 bg-surface-900/70"
          ></div>
        </div>

        <div v-else-if="error" class="rounded-2xl border border-brand-pink/35 bg-brand-wine/60 p-5">
          <div class="mb-4 flex items-start gap-3">
            <i class="pi pi-times-circle mt-1 text-brand-pink"></i>
            <div>
              <p class="text-lg font-black text-white">Ошибка загрузки</p>
              <p class="mt-1 text-sm text-pink-100/80">{{ error }}</p>
            </div>
          </div>
          <Button
            icon="pi pi-refresh"
            label="Попробовать снова"
            class="border-brand-pink/40 bg-brand-pink text-brand-wine"
            @click="initialize"
          />
        </div>

        <template v-else>
          <StandGroup
            v-if="isGroupVisible('frontend')"
            group-name="frontend"
            :stands="stands.frontend"
            :allow-comment-edit="true"
            @occupy="handleOccupy"
            @release="handleRelease"
            @refresh-stands="refreshStands"
            @comment-change="handleCommentChange"
          />

          <StandGroup
            v-if="isGroupVisible('backend')"
            group-name="backend"
            :stands="stands.backend"
            :allow-comment-edit="true"
            @occupy="handleOccupy"
            @release="handleRelease"
            @refresh-stands="refreshStands"
            @comment-change="handleCommentChange"
          />

          <div
            v-if="!isGroupVisible('frontend') && !isGroupVisible('backend')"
            class="rounded-[1.4rem] border border-white/10 bg-surface-900/70 p-10 text-center"
          >
            <p class="text-lg font-black text-white">Все блоки скрыты</p>
            <p class="mt-2 text-sm text-slate-400">Включите Frontend или Backend в левой панели.</p>
          </div>
        </template>
      </section>
    </main>

    <Toast position="top-right" />
  </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const {
  stands,
  isLoading,
  error,
  isConnected,
  getUserStands,
  getStatistics,
  occupyStand,
  releaseStand,
  initialize,
  setComment,
  fetchStands,
} = useStands();

const { isLoggedIn } = useUser();
const router = useRouter();
const toast = useToast();

const groupVisibility = ref({
  frontend: true,
  backend: true,
});

const groupControls = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
];

onMounted(() => {
  const savedState = localStorage.getItem("standGroupVisibility");
  if (savedState) {
    try {
      groupVisibility.value = {
        ...groupVisibility.value,
        ...JSON.parse(savedState),
      };
    } catch (e) {
      console.error("Failed to load group visibility state", e);
    }
  }
});

watch(
  groupVisibility,
  (newValue) => {
    localStorage.setItem("standGroupVisibility", JSON.stringify(newValue));
  },
  { deep: true }
);

const isGroupVisible = (group) => groupVisibility.value[group] !== false;

const toggleGroup = (group) => {
  groupVisibility.value = {
    ...groupVisibility.value,
    [group]: !groupVisibility.value[group],
  };
};

if (!isLoggedIn.value) {
  router.replace("/login");
}

const userStands = computed(() => getUserStands.value);
const statistics = computed(() => getStatistics.value);

const metrics = computed(() => [
  {
    label: "Всего",
    value: statistics.value.total,
    class: "border-white/10 bg-white/[0.04] text-slate-100",
  },
  {
    label: "Свободно",
    value: statistics.value.free,
    class: "border-brand-teal/35 bg-brand-teal/20 text-teal-100",
  },
  {
    label: "Занято",
    value: statistics.value.occupied,
    class: "border-brand-pink/35 bg-brand-wine/55 text-pink-100",
  },
  {
    label: "Мои",
    value: userStands.value.length,
    class: "border-brand-pink/35 bg-brand-pink/15 text-pink-50",
  },
]);

const handleOccupy = async (standId) => {
  if (!isLoggedIn.value) {
    toast.add({
      severity: "warn",
      summary: "Внимание",
      detail: "Необходимо войти в систему перед занятием стенда",
      life: 5000,
    });
    return;
  }

  try {
    await occupyStand(standId);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Стенд успешно занят",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: err.message || "Не удалось занять стенд",
      life: 5000,
    });
  }
};

const handleRelease = async (standId) => {
  try {
    await releaseStand(standId);
    toast.add({
      severity: "info",
      summary: "Освобождено",
      detail: "Стенд успешно освобожден",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: err.message || "Не удалось освободить стенд",
      life: 5000,
    });
  }
};

const handleCommentChange = async (standId, comment) => {
  try {
    await setComment(standId, comment);
    await refreshStands();
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Комментарий обновлён",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: err.message || "Не удалось обновить комментарий",
      life: 5000,
    });
  }
};

async function refreshStands() {
  await fetchStands();
}

onMounted(async () => {
  try {
    await initialize();
  } catch (err) {
    console.error("Ошибка инициализации:", err);
  }
});

useHead({
  title: "Управление стендами разработки",
  meta: [
    {
      name: "description",
      content:
        "Система управления стендами разработки для команд фронтенда и бэкенда",
    },
  ],
});
</script>
