<template>
  <div
    class="fixed top-0 left-0 h-screen w-screen z-40 bg-gradient-to-r from-slate-200 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-black dark:text-white"
  >
    <div class="flex items-center justify-center min-h-screen px-2">
      <div class="text-center">
        <h1 v-if="verificationStatus === 'success'" class="text-9xl font-bold">
          Success
        </h1>
        <h1 v-if="verificationStatus === 'expired'" class="text-9xl font-bold">
          Expired
        </h1>
        <p
          v-if="verificationStatus === 'success'"
          class="text-2xl font-medium mt-4"
        >
          Your verification has been verified successfully!
        </p>
        <p
          v-if="verificationStatus === 'expired'"
          class="text-2xl font-medium mt-4"
        >
          The verification has expired or is invalid.
        </p>
        <p v-if="verificationStatus === 'success'" class="mt-4 mb-8">
          You can now proceed to your account.
        </p>
        <p v-if="verificationStatus === 'expired'" class="mt-4 mb-8">
          If you encounter any issues while creating your account, please
          contact our support team for assistance.
        </p>
        <a
          href="/"
          class="px-6 py-3 bg-white font-bold font-semibold rounded-full hover:bg-purple-100 transition duration-300 ease-in-out dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          Go Home
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../../axios";
import { useRoute } from "vue-router";

const route = useRoute();
const verificationStatus = ref(""); 

const verifyPin = async () => {
  const pinId = route.params.pinId;
  const userId = route.params.userId;
   const pin = route.query.pin; 
   console.log(pin)
  try {
    const response = await axios.get(
      `/api/verify-pin/${pinId}/${userId}`,
      { params: { pin } }
    );

    if (response.status === 200) {
      verificationStatus.value = "success";
    } else {
      verificationStatus.value = "expired";
    }
  } catch (error) {
    verificationStatus.value = "expired";
  }
};

onMounted(() => {
  verifyPin();
});
</script>
