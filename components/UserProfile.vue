<template>
  <div class="user-profile">
    <Button
      v-if="!isLoggedIn"
      icon="pi pi-sign-in"
      label="Войти"
      class="border-white/15 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
      @click="goLogin"
    />

    <div v-else class="flex items-center gap-2">
      <div
        class="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-xl sm:flex"
      >
        <div
          class="grid h-9 w-9 place-items-center rounded-full bg-brand-pink text-sm font-black text-brand-wine"
        >
          {{ initials }}
        </div>
        <div class="max-w-[190px] leading-tight">
          <p class="truncate text-sm font-black text-white">{{ user.name }}</p>
          <p class="truncate text-xs text-slate-400">{{ user.email }}</p>
        </div>
      </div>

      <Button
        icon="pi pi-sign-out"
        label="Выйти"
        class="border-white/10 bg-white/[0.03] text-slate-200 hover:bg-brand-pink/15 hover:text-pink-50"
        @click="logoutAndGoLogin"
      />
    </div>
  </div>
</template>

<script setup>
const { user, isLoggedIn, logout } = useUser();
const router = useRouter();

const initials = computed(() => {
  const source = user.value.name || user.value.email || "U";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
});

const goLogin = () => {
  router.push("/login");
};

const logoutAndGoLogin = () => {
  logout();
  router.push("/login");
};
</script>
