<template>
  <div class="shadow-lg h-screen border-r pt-24 px-4 pb-12">
    <RouterLink
      to="/views/dashboard"
      :class="[
        'inline-block w-full p-2 rounded-lg font-semibold my-1',
        isActive('/views/dashboard')
          ? 'bg-black text-white'
          : 'hover:bg-black bg-black  text-white',
      ]"
    >
      <i class="fas fa-home p-2 rounded-md mr-2"></i>
      <a> Dashboard </a>
    </RouterLink>
    <RouterLink
      to="/views/product"
      :class="[
        'inline-block w-full p-2 rounded-lg font-semibold my-1',
        isActive('/views/product')
          ? 'bg-gray-100 text-black'
          : 'hover:bg-gray-50 text-black',
      ]"
    >
      <i class="fas fa-box p-2 rounded-md mr-2"></i>
      <a> Product </a>
    </RouterLink>
    <RouterLink
      to="/views/order"
      :class="[
        'inline-block w-full p-2 rounded-lg font-semibold my-1',
        isActive('/views/order')
          ? 'bg-gray-100 text-black'
          : 'hover:bg-gray-50 text-black',
      ]"
    >
      <i class="fas fa-clipboard-list p-2 rounded-md mr-2"></i>
      <a> Orders </a>
    </RouterLink>
    <RouterLink
      to="/views/customer"
      :class="[
        'inline-block w-full p-2 rounded-lg font-semibold my-1',
        isActive('/views/customer')
          ? 'bg-gray-100 text-black'
          : 'hover:bg-gray-50 text-black',
      ]"
    >
      <i class="fas fa-user p-2 rounded-md mr-2"></i>
      <a> Customer </a>
    </RouterLink>
    <RouterLink
      to="/views/report"
      :class="[
        'inline-block w-full p-2 rounded-lg font-semibold my-1',
        isActive('/views/report')
          ? 'bg-gray-100 text-black'
          : 'hover:bg-gray-50 text-black',
      ]"
    >
      <i class="fas fa-chart-line p-2 rounded-md mr-2"></i>
      <a> Report </a>
    </RouterLink>
      <RouterLink
      to="/views/reviews"
      :class="[
        'inline-block w-full p-2 rounded-lg font-semibold my-1',
        isActive('/views/reviews')
          ? 'bg-gray-100 text-black'
          : 'hover:bg-gray-50 text-black',
      ]"
    >
      <i class="fas fa-message p-2 rounded-md mr-2"></i>
      <a> Reviews </a>
    </RouterLink>
    <RouterLink
      to="/views/layaway"
      :class="[
        'inline-block w-full p-2 rounded-lg font-semibold my-1',
        isActive('/views/layaway')
          ? 'bg-gray-100 text-black'
          : 'hover:bg-gray-50 text-black',
      ]"
    >
      <i class="fas fa-wallet p-2 rounded-md mr-2"></i>
      <a> Lay-away </a>
    </RouterLink>
    <RouterLink
      to="/views/message"
      :class="[
        'inline-block w-full p-2 rounded-lg font-semibold my-1',
        isActive('/views/message')
          ? 'bg-gray-100 text-black'
          : 'hover:bg-gray-50 text-black',
      ]"
    >
      <i class="fas fa-message p-2 rounded-md mr-2"></i>
      <a> Inbox </a>
    </RouterLink>
  
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const isActive = (path) => {
  return route.path === path;
};
</script>
