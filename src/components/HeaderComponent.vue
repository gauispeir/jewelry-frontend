<script setup>
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

const isSettingShow = ref(false);
const show = ref(false);
const openSetting = () => {
  isSettingShow.value = true;
};
const closeSetting = () => {
  isSettingShow.value = false;
};
const open = () => {
  show.value = true;
};
const close = () => {
  show.value = false;
};
const token = localStorage.getItem("token");
const logout=()=>{
  localStorage.removeItem("token");
  location.reload();
}
</script>

<template>
  <header
    class="bg-white flex items-center justify-between w-full py-4 px-4 md:px-6 lg:px-16 xl:px-24 bg-white fixed top-0 z-20"
  >
    <nav class="flex w-full items-center justify-center">
      <div class="flex lg:flex-1 w-full">
        <RouterLink :to="token ? '/views/home' : '/'" class="-m-1.5 p-1.5">
          <span class="sr-only">Your Company</span>
          <img class="h-16" src="../assets/logo.png" alt="logo" />
        </RouterLink>
      </div>
      <div class="hidden lg:flex xl:flex items-center gap-x-6">
        <!-- Home link with active class -->
        <RouterLink
          :to="token ? '/views/home' : '/'"
          class="text-sm font-semibold leading-6 text-gray-900"
          :class="{ 'border-b': $route.path === (token ? '/views/home' : '/') }"
        >
          HOME
        </RouterLink>
        
        <!-- Shop link -->
        <RouterLink
          v-if="token"
          to="/views/shop"
          class="text-sm font-semibold leading-6 text-gray-900"
          :class="{ 'border-b': $route.path === '/views/shop' }"
        >
          SHOP
        </RouterLink>

        <!-- About link -->
        <RouterLink
          :to="token ? '/views/about' : '/about'"
          class="text-sm font-semibold leading-6 text-gray-900"
          :class="{ 'border-b': $route.path === (token ? '/views/about' : '/about') }"
        >
          ABOUT
        </RouterLink>

        <!-- Contact link -->
        <RouterLink
          :to="token ? '/views/contact' : '/contact'"
          class="text-sm font-semibold leading-6 text-gray-900"
          :class="{ 'border-b': $route.path === (token ? '/views/contact' : '/contact') }"
        >
          CONTACT
        </RouterLink>

        <!-- Cart link -->
        <RouterLink
          v-if="token"
          to="/views/cart"
          class="bg-gray-50 hover:bg-gray-100 py-4 px-4 rounded-full flex items-center justify-center"
          :class="{ 'border-b': $route.path === '/views/cart' }"
        >
          <i class="fas fa-shopping-cart"></i>
        </RouterLink>

        <!-- Settings dropdown -->
        <nav v-if="token">
          <div>
            <span @click="openSetting" class="bg-gray-50 hover:bg-gray-100 py-4 px-4 rounded-full flex items-center justify-center"><i class="fas fa-user"></i></span>
            <div class="relative w-full" v-if="isSettingShow">
              <div
                class="absolute border right-0 py-1 px-3 rounded-md bg-white shadow-md"
              >
                <div class="w-[170px] grid grid-cols-1">
                  <p class="flex items-center justify-end">
                    <i
                      class="fas fa-times py-2 px-1 rounded-md hover:text-gray-800"
                      @click="closeSetting"
                    ></i>
                  </p>
                  <RouterLink
                    to="/views/account-details"
                    class="hover:bg-gray-100 py-2 px-2 rounded-md"
                    :class="{ 'border-b': $route.path === '/views/account-details' }"
                  >
                    Account details
                  </RouterLink>
                  <RouterLink
                    to="/views/address"
                    class="hover:bg-gray-100 py-2 px-2 rounded-md"
                    :class="{ 'border-b': $route.path === '/views/address' }"
                  >
                    Address
                  </RouterLink>
                  <RouterLink
                    to="/views/orders"
                    class="hover:bg-gray-100 py-2 px-2 rounded-md"
                    :class="{ 'border-b': $route.path === '/views/orders' }"
                  >
                    Orders
                  </RouterLink>
                  <span class="hover:bg-gray-100 py-2 px-2 rounded-md cursor-pointer" @click="logout">Logout</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <!-- Login & Register links -->
        <RouterLink
          to="/login"
          v-if="!token"
          class="text-sm text-white font-semibold leading-6 bg-black py-2 px-4 rounded-md"
        >
          LOGIN
        </RouterLink>
        <RouterLink
          to="/register"
          v-if="!token"
          class="text-sm text-white font-semibold leading-6 bg-black py-2 px-4 rounded-md"
        >
          REGISTER
        </RouterLink>
      </div>

      <!-- Mobile menu toggle button -->
      <button
        v-if="!show"
        id="menu-button"
        @click="open"
        class="text-gray-600 focus:outline-none flex lg:hidden xl:hidden items-center"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
      </button>

      <!-- Close mobile menu button -->
      <button
        id="menu-button"
        v-if="show"
        @click="close"
        class="text-gray-600 focus:outline-none flex lg:hidden xl:hidden items-center"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Mobile menu -->
         <div
        v-if="show"
        class="shadow-lg border-r pt-12 px-4 fixed top-0 left-0 bg-white h-screen w-[300px] lg:hidden xl:hidden"
      >
        <RouterLink  @click="close"
          :to="token ? '/views/home' : '/'"
          class="w-full inline-block p-3 hover:bg-black hover:text-white text-white bg-black rounded-lg font-semibold my-1"
        >
          <i class="fas fa-home p-3 text-white rounded-md mr-2"></i>
          <a> Home </a>
        </RouterLink>
        <RouterLink @click="close"
          to="/views/shop"
          v-if="token"
          class="w-full inline-block p-3 hover:bg-gray-50 rounded-lg font-semibold my-1"
        >
          <i class="fas fa-clipboard-list p-3 rounded-md mr-2"></i>
          <a> Shop</a>
        </RouterLink>
        <RouterLink @click="close"
          :to="token ? '/views/about' : '/about'"
          class="w-full inline-block p-3 hover:bg-gray-50 rounded-lg font-semibold my-1"
        >
          <i class="fas fa-shop p-3 rounded-md mr-2"></i>
          <a> About </a>
        </RouterLink>
        <RouterLink  @click="close"  :to="token ? '/views/contact' : '/contact'" class="w-full inline-block p-3 hover:bg-gray-50 rounded-lg font-semibold my-1">
          <i class="fas fa-phone p-3 rounded-md mr-2"></i>
          <a> Contact </a>
        </RouterLink>
        <RouterLink @click="close" v-if="token" to="/views/cart" class="w-full inline-block p-3 hover:bg-gray-50 rounded-lg font-semibold my-1">
          <i class="fas fa-shopping-cart p-3 rounded-md mr-2"></i>
          <a>Add to Cart</a>
        </RouterLink>
        <RouterLink @click="close" v-if="token" to="/views/account-details" class="w-full inline-block p-3 hover:bg-gray-50 rounded-lg font-semibold my-1">
          <i class="fas fa-user p-3 rounded-md mr-2"></i>
          <a> Account </a>
        </RouterLink>
        <RouterLink @click="close" v-if="token"  to="/views/address" class="w-full inline-block p-3 hover:bg-gray-50 rounded-lg font-semibold my-1">
          <i class="fas fa-location p-3 rounded-md mr-2"></i>
          <a > Address </a>
        </RouterLink>
        <RouterLink @click="close" v-if="token" to="/views/orders" class="w-full inline-block p-3 hover:bg-gray-50 rounded-lg font-semibold my-1">
          <i class="fas fa-list p-3 rounded-md mr-2"></i>
          <a > Orders</a>
        </RouterLink>
         <RouterLink @click="close" v-if="!token" to="/login" class="w-full inline-block p-3 hover:bg-gray-50 rounded-lg font-semibold my-1">
          <i class="fas fa-sign-in p-3 rounded-md mr-2"></i>
          <a >Login</a>
        </RouterLink>
         <RouterLink @click="close" v-if="!token" to="/register" class="w-full inline-block p-3 hover:bg-gray-50 rounded-lg font-semibold my-1">
          <i class="fas fa-sign-out p-3 rounded-md mr-2"></i>
          <a >register</a>
        </RouterLink>
      </div>
    </nav>
  </header>
</template>
