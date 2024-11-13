<script setup>
import HeaderComponent from "./components/HeaderComponent.vue";
import Adminheader from "./components/admin/HeaderComponent.vue";
import SideComponent from "./components/admin/SideComponent.vue";
import FooterComponent from "./components/FooterComponent.vue";
import { RouterView } from "vue-router";
import axios from "../axios";
import { ref, onMounted, computed, onBeforeMount, onBeforeUnmount} from "vue";
import { parseJwt } from "@/stores/jwt";
import { useMenuStore } from './stores/menu';

// Reactive variable to store data
const data = ref(null);
const user = ref("admin");

// Function to refresh data from the API
const refreshData = async () => {
  try {
    const response = await axios.get("/api/validate", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.status === 200) {
      data.value = response.data.data;
    }
  } catch (error) {
    if (error && error.response) {
      if (error.response.status === 403 && error.response.data.message === "Token expired") {
        localStorage.removeItem("token");
        location.reload();
      }
    }
  }
};

const token = localStorage.getItem("token");
let decoded = {};

if (token) {
  try {
    decoded = parseJwt(token);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    decoded = {};
  }
}

const store = useMenuStore();
const role = decoded.role;
console.log(role);


const checkWindowSize = () => {
  if (window.innerWidth < 1024) { // lg in Tailwind corresponds to 1024px
    store.menu = true; // Open menu on screens smaller than lg
  } else {
    store.menu = false; // Close menu on larger screens
  }
};

// Watch window resize and update menu visibility
onMounted(() => {
  refreshData();
  checkWindowSize(); // Check size on initial load
  window.addEventListener('resize', checkWindowSize); // Listen for resize events
});

// Cleanup event listener when component is unmounted
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkWindowSize);
});

// Computed property for menu visibility
const isMenuOpen = computed(() => store.getMenu);
</script>


<template>
  <main>
    <HeaderComponent v-if="role !== user" />
    <RouterView v-if="role !== user" />
    <FooterComponent v-if="role !== user" />
    <Adminheader class="fixed top-0 left-0 z-20 w-full" v-if="role === user" />
    <main v-if="role === user" class="flex w-full">
      <!-- Sidebar: Visibility based on store.menu and screen size -->
      <SideComponent
        class="w-[300px] h-full fixed lg:static xl:relative bg-white lg:block xl:block z-10 "
        :class="{ hidden: !isMenuOpen }" 
      />
      <RouterView class="w-full" />
    </main>
  </main>
</template>

