<script setup>
import { ref } from "vue";
import { useMenuStore } from "../../stores/menu";
const store = useMenuStore();
const menu = ref(false);
const showSettings = ref(false);
const openMenu = () => {
  store.setMenu((menu.value = !menu.value));
};
const openSettings = () => {
  showSettings.value = !showSettings.value;
};
const closeModal = () => {
  showSettings.value = !showSettings.value;
};
const logout = () => {
  localStorage.removeItem("token");
  location.reload();
};
</script>

<template>
  <div class="p-2 bg-white border-b flex px-4">
    <div class="flex lg:flex-1 w-full">
      <RouterLink to="/">
        <span class="sr-only">Your Company</span>
        <img class="h-16" src="../../assets/logo.png" alt="" />
      </RouterLink>
    </div>
    <div class="flex items-center gap-4">
      <i class="fas fa-cogs text-xl lg:mr-4 xl:mr-4" @click="openSettings"></i>
      <div
        class="border fixed top-14 p-3 right-12 rounded-lg bg-white w-[150px]"
        v-if="showSettings"
      >
        <div class="flex items-center justify-end">
          <i
            class="fas fa-times hover:border hover:rounded-lg p-2"
            @click="closeModal"
          ></i>
        </div>
        <RouterLink to="/views/admin/profile" class="hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
          <i class="fas fa-user mr-2"></i> Account
        </RouterLink>
        <!-- <div> <i class="fas fa-key"></i></div> -->
        <div
          class="my-2 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
          @click="logout"
        >
          <i class="fas fa-sign-out mr-2"></i> Logout
        </div>
      </div>
      <button
        v-if="menu"
        @click="openMenu()"
        id="menu-button"
        class="text-black focus:outline-none flex items-center lg:hidden xl:hidden"
      >
        <svg
          class="w-10 h-10 p-2 border rounded-lg"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>

      <button
        v-else
        @click="openMenu()"
        id="menu-button"
        class="text-black focus:outline-none flex items-center lg:hidden xl:hidden"
      >
        <svg
          class="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16m-7 6h7"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>