<template>
  <div
    class="w-screen min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-4 md:px-6 lg:px-16 xl:px-24 mt-24"
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
              Sign Up for Your Account
            </p>
            <span class="m-0 text-xs max-w-[90%] text-center text-[#8B8E98]">
              Sign up now to get started with our app and enjoy a seamless
              experience. Plus, discover more about Jackie's Gold!
            </span>
          </div>

          <form @submit.prevent="register" class="w-full">
            <div 
              class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 my-2"
            >
              <div class="w-full flex flex-col gap-2">
                <label class="font-semibold text-xs text-gray-400"
                  >First Name</label
                >
                <input
                  v-model="firstname"
                  class="border rounded-lg px-3 py-2  text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                  placeholder="John"
                />
                <p v-if="errorMessages.firstname" class="text-red-500 text-xs">
                  {{ errorMessages.firstname }}
                </p>
              </div>

              <div class="w-full flex flex-col gap-2 my-2">
                <label class="font-semibold text-xs text-gray-400"
                  >Last Name</label
                >
                <input
                  v-model="lastname"
                  class="border rounded-lg px-3 py-2  text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                  placeholder="Doe"
                />
                <p v-if="errorMessages.lastname" class="text-red-500 text-xs">
                  {{ errorMessages.lastname }}
                </p>
              </div>
            </div>

            <div
              class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 my-2"
            >
              <div class="w-full flex flex-col gap-2">
                <label class="font-semibold text-xs text-gray-400"
                  >Email Address</label
                >
                <input
                  v-model="email"
                  type="email"
                  class="border rounded-lg px-3 py-2  text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                  placeholder="example@gmail.com"
                />
                <p v-if="errorMessages.email" class="text-red-500 text-xs">
                  {{ errorMessages.email }}
                </p>
              </div>

              <div class="w-full flex flex-col gap-2 my-2">
                <label class="font-semibold text-xs text-gray-400"
                  >Phone Number</label
                >
                <input
                  v-model="phonenumber"
                  class="border rounded-lg px-3 py-2  text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                  placeholder="09468213121"
                />
                <p
                  v-if="errorMessages.phonenumber"
                  class="text-red-500 text-xs"
                >
                  {{ errorMessages.phonenumber }}
                </p>
              </div>
            </div>

            <div class="w-full flex flex-col gap-2 my-2">
              <label class="font-semibold text-xs text-gray-400"
                >Password</label
              >
              <input
                v-model="password"
                type="password"
                class="border rounded-lg px-3 py-2  text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                placeholder="••••••"
              />
              <p v-if="errorMessages.password" class="text-red-500 text-xs">
                {{ errorMessages.password }}
              </p>
            </div>

            <div class="w-full flex flex-col gap-2 my-2">
              <label class="font-semibold text-xs text-gray-400"
                >Confirm Password</label
              >
              <input
                v-model="confirmPassword"
                type="password"
                class="border rounded-lg px-3 py-2  text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                placeholder="••••••"
              />
              <p
                v-if="errorMessages.confirmPassword"
                class="text-red-500 text-xs"
              >
                {{ errorMessages.confirmPassword }}
              </p>
            </div>

            <div class="mt-5 text-center">
              <button
                :disabled="loading"
                type="submit"
                class="w-1/2 py-3 px-8 bg-black hover:bg-black focus:ring-offset-gray-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none"
              >
                {{ loading ? "Registering..." : "Register" }}
              </button>

              <p class="mt-4 text-sm max-w-[90%] text-center text-[#8B8E98]">
                Already have an account?
                <RouterLink to="/login" class="text-black"
                  >Sign in here!</RouterLink
                >
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "../../axios";
import { useToast } from 'vue-toastification';

const toast = useToast();

const firstname = ref("");
const lastname = ref("");
const email = ref("");
const phonenumber = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const errorMessages = ref({});

const register = async () => {
  loading.value = true;
  errorMessages.value = {};

  try {
    const response = await axios.post('/api/register', {
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      phonenumber: phonenumber.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    });

    if (response.status === 200) {
      toast.success('Registration successful. Please check your email for verification.');
      // Clear the form after successful registration
      firstname.value = '';
      lastname.value = '';
      email.value = '';
      phonenumber.value = '';
      password.value = '';
      confirmPassword.value = '';
    }
  } catch (error) {
    if (error.response && error.response.data) {
      errorMessages.value = error.response.data.data || {}; // Adjust if error structure changes
    } else {
      toast.error(error);
    }
  } finally {
    loading.value = false;
  }
};

</script>
