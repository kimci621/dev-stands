<template>
  <div class="auth-page">
    <div class="auth-shell">
      <div class="mb-8">
        <div
          class="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-pink to-brand-teal text-xl font-black text-brand-wine shadow-[0_18px_46px_rgba(218,123,147,0.24)]"
        >
          S
        </div>
        <h1 class="text-3xl font-black tracking-normal text-white">
          Вход в систему
        </h1>
        <p class="mt-2 text-sm text-slate-400">
          Займите стенд и покажите команде, что он недоступен.
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="handleLogin">
        <div class="space-y-2">
          <label class="block text-sm font-bold text-slate-200">Email</label>
          <div class="relative">
            <i class="pi pi-envelope pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <InputText
              v-model="email"
              type="email"
              class="w-full rounded-2xl py-3 pl-11 pr-4"
              placeholder="your@email.com"
              required
              autofocus
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-slate-200">Пароль</label>
          <div class="relative">
            <i class="pi pi-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <InputText
              v-model="password"
              type="password"
              class="w-full rounded-2xl py-3 pl-11 pr-4"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div
          v-if="error"
          class="rounded-2xl border border-brand-pink/35 bg-brand-wine/60 p-4 text-sm font-bold text-pink-100"
        >
          <i class="pi pi-exclamation-triangle mr-2 text-brand-pink"></i>
          {{ error }}
        </div>

        <Button
          type="submit"
          label="Войти"
          class="w-full border-0 bg-brand-pink py-3 text-brand-wine shadow-lg shadow-brand-pink/20"
          :loading="loading"
        />
      </form>

      <p class="mt-8 text-center text-sm text-slate-400">
        Нет аккаунта?
        <NuxtLink
          to="/register"
          class="font-black text-pink-100 underline decoration-brand-pink/50 underline-offset-4"
        >
          Зарегистрироваться
        </NuxtLink>
      </p>
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

if (isLoggedIn.value) {
  router.replace("/");
}

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
.auth-page {
  @apply flex min-h-screen items-center justify-center bg-surface-950 px-4 py-10 text-slate-100;
}

.auth-shell {
  @apply w-full max-w-md rounded-[1.6rem] border border-white/10 bg-surface-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-10;
}
</style>
