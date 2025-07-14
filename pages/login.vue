<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50 to-stand-free-50"
  >
    <div
      class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-large border border-white/50 p-10 w-full max-w-md animate-scale-in"
    >
      <!-- Логотип -->
      <div class="text-center mb-8">
        <div
          class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-medium mx-auto mb-4"
        >
          <i class="pi pi-sign-in text-white text-2xl"></i>
        </div>
        <h2
          class="text-3xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent"
        >
          Вход в систему
        </h2>
        <p class="text-neutral-600 mt-2">Управление стендами разработки</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-neutral-700"
            >Email</label
          >
          <div class="relative">
            <i
              class="pi pi-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
            ></i>
            <InputText
              v-model="email"
              type="email"
              class="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300"
              placeholder="your@email.com"
              required
              autofocus
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-neutral-700"
            >Пароль</label
          >
          <div class="relative">
            <i
              class="pi pi-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
            ></i>
            <InputText
              v-model="password"
              type="password"
              class="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div
          v-if="error"
          class="bg-stand-occupied-50 border border-stand-occupied-200 rounded-xl p-4"
        >
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-stand-occupied-600"></i>
            <span class="text-stand-occupied-700 text-sm font-medium">{{
              error
            }}</span>
          </div>
        </div>

        <Button
          type="submit"
          label="Войти в систему"
          class="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 border-primary-500 hover:from-primary-600 hover:to-primary-700 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105"
          :loading="loading"
        />
      </form>

      <div class="mt-8 text-center">
        <p class="text-neutral-600 text-sm">
          Нет аккаунта?
          <NuxtLink
            to="/register"
            class="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors duration-300"
          >
            Зарегистрироваться
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { login, isLoggedIn } = useUser();
const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

// Если уже залогинен — редирект на главную
if (isLoggedIn.value) {
  router.replace("/");
}

/**
 * Обработка входа
 */
const handleLogin = async () => {
  error.value = "";
  loading.value = true;
  try {
    await login(email.value, password.value);
    router.replace("/");
  } catch (e) {
    error.value = e?.data?.statusMessage || "Ошибка входа";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Кастомные стили для PrimeVue компонентов */
:deep(.p-inputtext) {
  @apply bg-white/50 backdrop-blur-sm;
}

:deep(.p-inputtext:focus) {
  @apply bg-white;
}

:deep(.p-button) {
  @apply font-semibold rounded-xl;
}

/* Анимация появления */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}
</style>
