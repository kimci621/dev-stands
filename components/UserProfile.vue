<template>
  <div class="user-profile">
    <div class="flex items-center gap-4">
      <Button
        v-if="!isLoggedIn"
        @click="goLogin"
        icon="pi pi-sign-in"
        label="Войти"
        class="p-button-outlined hover:shadow-medium transition-all duration-300"
      />
      <div v-else class="flex items-center gap-4">
        <div
          class="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-soft border border-white/50"
        >
          <div
            class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center"
          >
            <i class="pi pi-user text-white text-sm"></i>
          </div>
          <div class="text-sm">
            <span class="font-semibold text-neutral-800">{{ user.name }}</span>
            <div class="text-neutral-500 text-xs">{{ user.email }}</div>
          </div>
        </div>
        <Button
          @click="logoutAndGoLogin"
          icon="pi pi-sign-out"
          label="Выйти"
          class="p-button-text p-button-sm hover:shadow-medium transition-all duration-300"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const { user, isLoggedIn, logout } = useUser();
const router = useRouter();

const goLogin = () => {
  router.push("/login");
};

const logoutAndGoLogin = () => {
  logout();
  router.push("/login");
};
</script>

<style scoped>
.user-profile {
  @apply flex items-center;
}

/* Кастомные стили для кнопок */
:deep(.p-button-outlined) {
  @apply border-primary-300 text-primary-700 bg-white/50 backdrop-blur-sm hover:bg-primary-50 hover:border-primary-400;
}

:deep(.p-button-text) {
  @apply text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100;
}

:deep(.p-button-sm) {
  @apply px-3 py-2 text-sm font-medium rounded-xl;
}
</style>
