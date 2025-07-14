<template>
  <div class="user-profile">
    <!-- Кнопка профиля -->
    <div class="flex items-center gap-3">
      <Button
        v-if="!isUserNameSet"
        @click="showModal = true"
        icon="pi pi-user-plus"
        label="Указать кто я"
        class="p-button-outlined"
      />

      <div v-else class="flex items-center gap-2">
        <span class="text-lg font-medium text-gray-700">
          Привет, {{ userName }}!
        </span>
        <Button
          @click="showModal = true"
          icon="pi pi-user-edit"
          label="Изменить"
          class="p-button-text p-button-sm"
        />
      </div>
    </div>

    <!-- Модальное окно -->
    <Dialog
      v-model:visible="showModal"
      :header="isUserNameSet ? 'Изменить имя' : 'Укажите ваше имя'"
      :modal="true"
      :closable="true"
      :draggable="false"
      class="w-96"
    >
      <div class="flex flex-col gap-4 bg-white px-6 py-4 rounded-2xl">
        <div class="field">
          <label
            for="username"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Ваше имя
          </label>
          <InputText
            id="username"
            v-model="inputName"
            :class="{ 'p-invalid': validationError }"
            placeholder="Введите ваше имя..."
            class="w-full"
            autofocus
            @keyup.enter="handleSave"
          />
          <small v-if="validationError" class="p-error">
            {{ validationError }}
          </small>
        </div>

        <div class="flex justify-end gap-2">
          <Button label="Отмена" @click="handleCancel" class="p-button-text" />
          <Button
            label="Сохранить"
            @click="handleSave"
            :disabled="!inputName.trim()"
            class="p-button"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
const { userName, isUserNameSet, setUserName, validateUserName } = useUser();

// Локальное состояние модального окна
const showModal = ref(false);
const inputName = ref("");
const validationError = ref("");

/**
 * Обрабатывает сохранение имени пользователя
 */
const handleSave = () => {
  try {
    const trimmedName = inputName.value.trim();

    // Валидация
    const validation = validateUserName(trimmedName);
    if (!validation.valid) {
      validationError.value = validation.message;
      return;
    }

    // Сохранение
    setUserName(trimmedName);

    // Закрытие модального окна
    showModal.value = false;
    resetForm();

    console.log("Имя пользователя сохранено:", trimmedName);
  } catch (error) {
    validationError.value = error.message;
  }
};

/**
 * Обрабатывает отмену ввода
 */
const handleCancel = () => {
  showModal.value = false;
  resetForm();
};

/**
 * Сбрасывает форму
 */
const resetForm = () => {
  inputName.value = "";
  validationError.value = "";
};

/**
 * Инициализация формы при открытии модального окна
 */
watch(showModal, (isVisible) => {
  if (isVisible) {
    inputName.value = userName.value || "";
    validationError.value = "";
  }
});
</script>

<style scoped>
.user-profile {
  @apply flex items-center;
}

/* Кастомные стили для диалога */
:deep(.p-dialog) {
  max-width: 90vw;
}

:deep(.p-dialog-header) {
  @apply bg-gray-50 border-b;
}

:deep(.p-dialog-content) {
  @apply p-6;
}

/* Стили для валидации */
:deep(.p-invalid) {
  @apply border-red-500;
}

.p-error {
  @apply text-red-500 text-xs mt-1;
}

/* Стили для кнопок */
:deep(.p-button-outlined) {
  @apply border-gray-300 text-gray-700;
}

:deep(.p-button-outlined:hover) {
  @apply bg-gray-50 border-gray-400;
}

:deep(.p-button-text) {
  @apply text-gray-900;
}

:deep(.p-button-text:hover) {
  @apply shadow-lg text-gray-900;
}
</style>
