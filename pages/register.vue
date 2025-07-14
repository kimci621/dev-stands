<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Регистрация</h2>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Имя</label>
          <InputText v-model="name" class="w-full" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <InputText v-model="email" type="email" class="w-full" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Пароль</label>
          <InputText
            v-model="password"
            type="password"
            class="w-full"
            required
          />
        </div>
        <div v-if="error" class="p-error text-sm">{{ error }}</div>
        <Button
          type="submit"
          label="Зарегистрироваться"
          class="w-full"
          :loading="loading"
        />
      </form>
      <div class="mt-4 text-center text-sm">
        Уже есть аккаунт?
        <NuxtLink to="/login" class="text-blue-600 hover:underline"
          >Войти</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup>
const { register, isLoggedIn } = useUser();
const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

// Если уже залогинен — редирект на главную
if (isLoggedIn.value) {
  router.replace("/");
}

/**
 * Обработка регистрации
 */
const handleRegister = async () => {
  error.value = "";
  loading.value = true;
  try {
    await register(name.value, email.value, password.value);
    router.replace("/");
  } catch (e) {
    error.value = e?.data?.statusMessage || "Ошибка регистрации";
  } finally {
    loading.value = false;
  }
};
</script>
