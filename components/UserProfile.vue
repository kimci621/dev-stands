<template>
  <div class="user-profile">
    <div class="flex items-center gap-3">
      <Button
        v-if="!isLoggedIn"
        @click="goLogin"
        icon="pi pi-sign-in"
        label="Войти"
        class="p-button-outlined"
      />
      <div v-else class="flex items-center gap-2">
        <span class="text-lg font-medium text-gray-700">
          {{ user.name }} <span class="text-gray-500">({{ user.email }})</span>
        </span>
        <Button
          @click="logoutAndGoLogin"
          icon="pi pi-sign-out"
          label="Выйти"
          class="p-button-text p-button-sm"
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
</style>
