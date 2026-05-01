<template>
  <div class="min-h-screen bg-surface-950 text-slate-100">
    <header
      class="sticky top-0 z-50 border-b border-white/10 bg-surface-950/80 backdrop-blur-2xl"
    >
      <div class="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex min-w-0 items-center gap-4">
          <NuxtLink
            to="/"
            class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-brand-pink/35 hover:bg-brand-pink/15"
            aria-label="Назад к стендам"
          >
            <i class="pi pi-arrow-left"></i>
          </NuxtLink>
          <div class="min-w-0">
            <h1 class="truncate text-xl font-black text-white sm:text-2xl">
              Редактирование стендов
            </h1>
            <p class="hidden text-sm text-slate-400 sm:block">
              Создание, переименование и удаление стендов с подтверждением
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/"
            class="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-brand-teal/35 hover:bg-brand-teal/15 hover:text-white sm:inline-flex"
          >
            <i class="pi pi-th-large"></i>
            Стенды
          </NuxtLink>
          <UserProfile />
        </div>
      </div>
    </header>

    <main class="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
      <aside class="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section class="rounded-[1.4rem] border border-white/10 bg-surface-900/75 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div class="mb-5 flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.18em] text-brand-pink">
                Новый стенд
              </p>
              <h2 class="mt-2 text-lg font-black text-white">Создать запись</h2>
            </div>
            <div class="grid h-11 w-11 place-items-center rounded-2xl bg-brand-pink/15 text-brand-pink">
              <i class="pi pi-plus"></i>
            </div>
          </div>

          <form class="space-y-4" @submit.prevent="requestCreate">
            <div>
              <label for="create-name" class="mb-2 block text-sm font-bold text-slate-300">
                Название
              </label>
              <InputText
                id="create-name"
                v-model="createForm.name"
                class="w-full"
                placeholder="Например, FE Dev9"
              />
            </div>

            <div>
              <label for="create-type" class="mb-2 block text-sm font-bold text-slate-300">
                Тип
              </label>
              <select
                id="create-type"
                v-model="createForm.type"
                class="stand-select w-full"
              >
                <option
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <Button
              type="submit"
              icon="pi pi-plus"
              label="Создать стенд"
              class="w-full border-brand-pink/40 bg-brand-pink text-brand-wine"
              :loading="isSaving"
            />
          </form>
        </section>

        <section class="rounded-[1.4rem] border border-white/10 bg-surface-900/75 p-5 backdrop-blur-xl">
          <p class="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Сводка
          </p>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="metric in metrics"
              :key="metric.label"
              class="rounded-2xl border p-3"
              :class="metric.class"
            >
              <div class="text-2xl font-black leading-none">{{ metric.value }}</div>
              <div class="mt-1 text-xs font-bold opacity-75">{{ metric.label }}</div>
            </div>
          </div>
        </section>
      </aside>

      <section class="min-w-0 space-y-5">
        <section class="rounded-[1.4rem] border border-white/10 bg-surface-900/75 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div class="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.18em] text-brand-teal">
                Список
              </p>
              <h2 class="mt-2 text-2xl font-black text-white">Все стенды</h2>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <span class="relative block sm:w-72">
                <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <InputText
                  v-model="searchQuery"
                  class="w-full pl-11"
                  placeholder="Поиск"
                />
              </span>
              <select
                v-model="typeFilter"
                class="stand-select sm:w-44"
              >
                <option
                  v-for="option in filterOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="isLoading" class="grid gap-3">
            <div
              v-for="index in 6"
              :key="index"
              class="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
            ></div>
          </div>

          <div v-else-if="error" class="rounded-2xl border border-brand-pink/35 bg-brand-wine/60 p-5">
            <p class="font-black text-white">Ошибка загрузки</p>
            <p class="mt-1 text-sm text-pink-100/80">{{ error }}</p>
            <Button
              icon="pi pi-refresh"
              label="Повторить"
              class="mt-4 border-brand-pink/40 bg-brand-pink text-brand-wine"
              @click="fetchStands"
            />
          </div>

          <div v-else-if="filteredStands.length === 0" class="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
            <p class="text-lg font-black text-white">Ничего не найдено</p>
            <p class="mt-2 text-sm text-slate-400">Измените поиск или фильтр.</p>
          </div>

          <div v-else class="overflow-hidden rounded-2xl border border-white/10">
            <div class="hidden grid-cols-[minmax(160px,1fr)_100px_100px_minmax(0,0.85fr)_96px] gap-4 border-b border-white/10 bg-black/15 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500 lg:grid">
              <span>Название</span>
              <span>Тип</span>
              <span>Статус</span>
              <span>Занят</span>
              <span class="text-right">Действия</span>
            </div>

            <article
              v-for="stand in filteredStands"
              :key="stand.id"
              class="grid gap-4 border-b border-white/10 bg-white/[0.025] p-4 last:border-b-0 hover:bg-white/[0.045] lg:grid-cols-[minmax(160px,1fr)_100px_100px_minmax(0,0.85fr)_96px] lg:items-center"
            >
              <div class="min-w-0">
                <p class="truncate text-base font-black text-white">{{ stand.name }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ stand.id }}</p>
              </div>

              <div>
                <span class="inline-flex rounded-full border border-brand-teal/35 bg-brand-teal/15 px-3 py-1 text-xs font-black uppercase text-teal-100">
                  {{ typeLabel(stand.type) }}
                </span>
              </div>

              <div>
                <span
                  class="inline-flex rounded-full border px-3 py-1 text-xs font-black"
                  :class="
                    stand.status === 'occupied'
                      ? 'border-brand-pink/35 bg-brand-wine/60 text-pink-100'
                      : 'border-brand-teal/35 bg-brand-teal/15 text-teal-100'
                  "
                >
                  {{ stand.status === "occupied" ? "Занят" : "Свободен" }}
                </span>
              </div>

              <div class="min-w-0 text-sm text-slate-300">
                <span v-if="stand.occupiedBy || stand.occupied_by" class="block truncate">
                  {{ stand.occupiedBy || stand.occupied_by }}
                </span>
                <span v-else class="text-slate-600">-</span>
              </div>

              <div class="flex justify-end gap-2">
                <Button
                  icon="pi pi-pencil"
                  severity="secondary"
                  rounded
                  text
                  aria-label="Редактировать"
                  @click="openEdit(stand)"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  rounded
                  text
                  aria-label="Удалить"
                  @click="requestDelete(stand)"
                />
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>

    <Dialog
      v-model:visible="isEditOpen"
      modal
      header="Редактировать стенд"
      :style="{ width: 'min(520px, calc(100vw - 32px))' }"
    >
      <form v-if="editStand" class="space-y-4" @submit.prevent="requestEdit">
        <div>
          <label for="edit-name" class="mb-2 block text-sm font-bold text-slate-300">
            Название
          </label>
          <InputText id="edit-name" v-model="editForm.name" class="w-full" />
        </div>

        <div>
          <label for="edit-type" class="mb-2 block text-sm font-bold text-slate-300">
            Тип
          </label>
          <select
            id="edit-type"
            v-model="editForm.type"
            class="stand-select w-full"
          >
            <option
              v-for="option in typeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div
          v-if="editStand.status === 'occupied'"
          class="rounded-2xl border border-brand-pink/35 bg-brand-wine/55 p-3 text-sm text-pink-100"
        >
          <i class="pi pi-exclamation-triangle mr-2 text-brand-pink"></i>
          Стенд занят. Изменится только название или тип, бронь сохранится.
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <Button
            type="submit"
            icon="pi pi-check"
            label="Сохранить"
            class="border-brand-pink/40 bg-brand-pink text-brand-wine"
            :loading="isSaving"
          />
          <Button
            type="button"
            icon="pi pi-times"
            label="Отмена"
            severity="secondary"
            outlined
            @click="isEditOpen = false"
          />
        </div>
      </form>
    </Dialog>

    <Dialog
      v-model:visible="confirmState.visible"
      modal
      :header="confirmState.header"
      :style="{ width: 'min(520px, calc(100vw - 32px))' }"
    >
      <div class="space-y-5">
        <div
          class="mt-2 flex items-center gap-4 rounded-2xl border p-4"
          :class="
            confirmState.danger
              ? 'border-brand-pink/25 bg-brand-wine/35'
              : 'border-brand-teal/25 bg-brand-teal/10'
          "
        >
          <div
            class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border"
            :class="
              confirmState.danger
                ? 'border-brand-pink/35 bg-brand-wine/60 text-brand-pink'
                : 'border-brand-teal/35 bg-brand-teal/15 text-teal-100'
            "
          >
            <i class="pi" :class="confirmState.icon"></i>
          </div>
          <p class="flex min-h-10 items-center text-sm leading-6 text-slate-200">
            {{ confirmState.message }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <Button
            :icon="confirmState.danger ? 'pi pi-trash' : 'pi pi-check'"
            :label="confirmState.acceptLabel"
            :class="
              confirmState.danger
                ? 'border-brand-pink/40 bg-brand-wine text-pink-100'
                : 'border-brand-pink/40 bg-brand-pink text-brand-wine'
            "
            :loading="isSaving"
            @click="acceptConfirm"
          />
          <Button
            icon="pi pi-times"
            label="Отмена"
            severity="secondary"
            outlined
            @click="confirmState.visible = false"
          />
        </div>
      </div>
    </Dialog>

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
  fetchStands,
  initialize,
  createManagedStand,
  updateManagedStand,
  deleteManagedStand,
} = useStands();
const { isLoggedIn } = useUser();
const router = useRouter();
const toast = useToast();

if (!isLoggedIn.value) {
  router.replace("/login");
}

const typeOptions = [
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
];

const filterOptions = [
  { label: "Все типы", value: "all" },
  ...typeOptions,
];

const createForm = reactive({
  name: "",
  type: "frontend",
});

const editForm = reactive({
  name: "",
  type: "frontend",
});

const editStand = ref(null);
const isEditOpen = ref(false);
const isSaving = ref(false);
const searchQuery = ref("");
const typeFilter = ref("all");
const confirmState = reactive({
  visible: false,
  header: "",
  message: "",
  icon: "pi-exclamation-triangle",
  acceptLabel: "Подтвердить",
  danger: false,
  onAccept: null,
});

const allStands = computed(() => {
  const seen = new Set();
  return [...stands.value.frontend, ...stands.value.backend]
    .filter((stand) => {
      if (seen.has(stand.id)) return false;
      seen.add(stand.id);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
});

const filteredStands = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return allStands.value.filter((stand) => {
    const matchesType = typeFilter.value === "all" || stand.type === typeFilter.value;
    const matchesQuery =
      !query ||
      [stand.name, stand.type, stand.occupiedBy, stand.occupied_by, stand.comment]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

    return matchesType && matchesQuery;
  });
});

const metrics = computed(() => [
  {
    label: "Всего",
    value: allStands.value.length,
    class: "border-white/10 bg-white/[0.04] text-slate-100",
  },
  {
    label: "FE",
    value: allStands.value.filter((stand) => stand.type === "frontend").length,
    class: "border-brand-teal/35 bg-brand-teal/15 text-teal-100",
  },
  {
    label: "BE",
    value: allStands.value.filter((stand) => stand.type === "backend").length,
    class: "border-brand-pink/35 bg-brand-pink/15 text-pink-50",
  },
]);

const typeLabel = (type) => {
  const option = typeOptions.find((item) => item.value === type);
  return option?.label || type;
};

const normalizeName = (value) => value.trim().replace(/\s+/g, " ");

const validateForm = (form) => {
  const name = normalizeName(form.name);

  if (name.length < 2) {
    toast.add({
      severity: "warn",
      summary: "Проверьте название",
      detail: "Название стенда должно быть не короче 2 символов",
      life: 4000,
    });
    return null;
  }

  if (!["frontend", "backend"].includes(form.type)) {
    toast.add({
      severity: "warn",
      summary: "Проверьте тип",
      detail: "Тип стенда должен быть Frontend или Backend",
      life: 4000,
    });
    return null;
  }

  return { name, type: form.type };
};

const hasDuplicate = (standData, ignoredId = null) =>
  allStands.value.some(
    (stand) =>
      stand.id !== ignoredId &&
      stand.name.toLowerCase() === standData.name.toLowerCase() &&
      stand.type === standData.type
  );

const requestCreate = () => {
  const standData = validateForm(createForm);
  if (!standData) return;

  if (hasDuplicate(standData)) {
    toast.add({
      severity: "warn",
      summary: "Дубликат",
      detail: "Стенд с таким названием и типом уже существует",
      life: 4000,
    });
    return;
  }

  openConfirm({
    header: "Создать стенд?",
    message: `Будет создан ${typeLabel(standData.type)} стенд "${standData.name}".`,
    icon: "pi pi-plus-circle",
    acceptLabel: "Создать",
    onAccept: async () => {
      await runAction(async () => {
        await createManagedStand(standData);
        createForm.name = "";
        toast.add({
          severity: "success",
          summary: "Создано",
          detail: `Стенд "${standData.name}" создан`,
          life: 3000,
        });
      });
    },
  });
};

const openEdit = (stand) => {
  editStand.value = stand;
  editForm.name = stand.name;
  editForm.type = stand.type;
  isEditOpen.value = true;
};

const requestEdit = () => {
  const standData = validateForm(editForm);
  if (!standData || !editStand.value) return;

  if (hasDuplicate(standData, editStand.value.id)) {
    toast.add({
      severity: "warn",
      summary: "Дубликат",
      detail: "Стенд с таким названием и типом уже существует",
      life: 4000,
    });
    return;
  }

  const oldName = editStand.value.name;
  const oldType = editStand.value.type;

  if (oldName === standData.name && oldType === standData.type) {
    isEditOpen.value = false;
    return;
  }

  openConfirm({
    header: "Сохранить изменения?",
    message: `Название: ${oldName} -> ${standData.name}. Тип: ${typeLabel(oldType)} -> ${typeLabel(standData.type)}.`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Сохранить",
    onAccept: async () => {
      await runAction(async () => {
        await updateManagedStand(editStand.value.id, standData);
        isEditOpen.value = false;
        toast.add({
          severity: "success",
          summary: "Сохранено",
          detail: "Стенд обновлен",
          life: 3000,
        });
      });
    },
  });
};

const requestDelete = (stand) => {
  const occupiedMessage =
    stand.status === "occupied"
      ? " Стенд сейчас занят: бронь, ссылка, время и комментарий будут удалены вместе со стендом."
      : "";

  openConfirm({
    header: "Удалить стенд?",
    message: `Стенд "${stand.name}" будет удален без восстановления.${occupiedMessage}`,
    icon: "pi pi-trash",
    acceptLabel: "Удалить",
    danger: true,
    onAccept: async () => {
      await runAction(async () => {
        await deleteManagedStand(stand.id);
        toast.add({
          severity: "success",
          summary: "Удалено",
          detail: `Стенд "${stand.name}" удален`,
          life: 3000,
        });
      });
    },
  });
};

const openConfirm = ({
  header,
  message,
  icon = "pi-exclamation-triangle",
  acceptLabel = "Подтвердить",
  danger = false,
  onAccept,
}) => {
  confirmState.header = header;
  confirmState.message = message;
  confirmState.icon = icon.replace("pi ", "");
  confirmState.acceptLabel = acceptLabel;
  confirmState.danger = danger;
  confirmState.onAccept = onAccept;
  confirmState.visible = true;
};

const acceptConfirm = async () => {
  const action = confirmState.onAccept;
  if (!action) return;

  await action();
  if (!isSaving.value) {
    confirmState.visible = false;
  }
};

const runAction = async (action) => {
  try {
    isSaving.value = true;
    await action();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: err.message || "Действие не выполнено",
      life: 5000,
    });
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  try {
    await initialize();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка загрузки",
      detail: err.message || "Не удалось загрузить стенды",
      life: 5000,
    });
  }
});

useHead({
  title: "Редактирование стендов",
  meta: [
    {
      name: "description",
      content: "Экран создания, редактирования и удаления стендов",
    },
  ],
});
</script>

<style scoped>
.stand-select {
  min-height: 44px;
  appearance: none;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background-color: rgba(16, 31, 35, 0.9);
  color: #edf7f8;
  padding: 0.75rem 3.25rem 0.75rem 0.9rem;
  font-weight: 600;
  outline: none;
  background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23D8E7E8' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"),
    linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.08) 1px, rgba(255,255,255,0.08) 2px, rgba(218,123,147,0.08) 2px);
  background-position: calc(100% - 14px) 50%, 100% 0;
  background-size: 18px 18px, 44px 100%;
  background-repeat: no-repeat, no-repeat;
  transition: border-color 0.18s ease, box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.stand-select:focus {
  border-color: #da7b93;
  box-shadow: 0 0 0 3px rgba(218, 123, 147, 0.15);
}

.stand-select:hover {
  border-color: rgba(218, 123, 147, 0.35);
  background-color: #14282b;
}
</style>
