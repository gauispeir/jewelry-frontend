<template>
  <div
    class="w-screen min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-4 md:px-6 lg:px-16 xl:px-24"
  >
    <div class="relative py-3 w-full md:w-1/2 lg:w-1/2 xl:w-1/2">
      <div
        class="min-h-96 px-8 py-6 mt-4 text-left bg-white dark:bg-gray-900 rounded-xl shadow-lg"
      >
        <div
          class="flex flex-col justify-center items-center h-full select-none"
        >
          <div class="flex flex-col items-center justify-center gap-2 mb-8">
            <p class="m-0 text-[24px] font-semibold dark:text-white">
              Login to your Account
            </p>
            <span class="m-0 text-xs max-w-[90%] text-center text-[#8B8E98]">
              Get started with our app and enjoy a seamless experience. Discover
              more about Jackie's Gold!
            </span>
          </div>
          <form @submit.prevent="login" class="w-full">
            <div class="w-full flex flex-col gap-2 my-2">
              <label class="font-semibold text-xs text-gray-400">Email</label>
              <input
                v-model="email"
                class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                placeholder="example@gmail.com"
                type="email"
              />
              <p v-if="errorMessages.email" class="text-red-500 text-xs">
                {{ errorMessages.email }}
              </p>
            </div>
            <div class="w-full flex flex-col gap-2 my-2">
              <label class="font-semibold text-xs text-gray-400"
                >Password</label
              >
              <input
                v-model="password"
                type="password"
                class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                placeholder="••••••••"
              />
              <p v-if="errorMessages.password" class="text-red-500 text-xs">
                {{ errorMessages.password }}
              </p>
            </div>
            <div class="mt-5 text-center">
              <button
                :disabled="loading"
                type="submit"
                class="w-1/2 py-3 px-8 bg-black hover:bg-black focus:ring-offset-gray-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none"
              >
                {{ loading ? "Logging in..." : "Login" }}
              </button>
              <p class="mt-4 text-sm max-w-[90%] text-center text-[#8B8E98]">
                Don't have an account yet?
                <RouterLink to="/register" class="text-black"
                  >Sign up here!</RouterLink
                >
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- error toast -->
    <div
      v-if="errorMessages.general"
      class="fixed top-0 left-10 z-30 bg-red-200 border-l-[5px] border-red-500 px-6 py-4 mx-2 my-4 rounded-md text-lg flex items-center mx-auto max-w-lg transform transition-transform duration-500 ease-in-out delay-300"
    >
      <svg viewBox="0 0 24 24" class="text-red-600 w-5 h-5 sm:w-5 sm:h-5 mr-3">
        <path
          fill="currentColor"
          d="M11.983,0a12.206,12.206,0,0,0-8.51,3.653A11.8,11.8,0,0,0,0,12.207,11.779,11.779,0,0,0,11.8,24h.214A12.111,12.111,0,0,0,24,11.791h0A11.766,11.766,0,0,0,11.983,0ZM10.5,16.542a1.476,1.476,0,0,1,1.449-1.53h.027a1.527,1.527,0,0,1,1.523,1.47,1.475,1.475,0,0,1-1.449,1.53h-.027A1.529,1.529,0,0,1,10.5,16.542ZM11,12.5v-6a1,1,0,0,1,2,0v6a1,1,0,1,1-2,0Z"
        ></path>
      </svg>
      <span class="text-red-800">
        {{ errorMessages.general }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "../../axios";
import { useToast } from 'vue-toastification';

const toast = useToast();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessages = ref({});

const login = async () => {
  loading.value = true;
  errorMessages.value = {};

  try {
    const response = await axios.post("/api/login", {
      email: email.value,
      password: password.value,
    });

    if (response.status === 200) {
      const token = response.data.token; // assuming the token is in the response data
      localStorage.setItem("token", token); // save the token to localStorage
      toast.success("Login successful!");
      location.reload();
      // Redirect to dashboard or another page
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      // Map backend errors to frontend error messages
      errorMessages.value = error.response.data.errors;
    } else {
      toast.error(error.response.data.data);
     
    }
  } finally {
    loading.value = false;
  }
};
</script>
