<template>
  <div
    class="fixed top-0 left-0 h-screen w-screen z-40 bg-gradient-to-r from-slate-200 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-black dark:text-white"
  >
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="text-center">
        <h1 v-if="reportIssue" class="text-5xl font-bold mb-4">
          Thank You!
        </h1>
        <p
          v-if="reportIssue === 'success'"
          class="text-xl font-medium mt-4"
        >
          Your privacy is important to us.
        </p>
        <p v-if="reportIssue" class="mt-4 mb-8">
          If this email address was used without your consent, please know that no further action is needed on your part. Ensure that your email address is secure and protected.
        </p>
     
         <a
          href="/"
          class="px-6 py-3 bg-white font-bold font-semibold rounded-full hover:bg-purple-100 transition duration-300 ease-in-out dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
           Return to Homepage
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
const reportIssue = ref(""); 

const verifyPin = async () => {
  const pinId = route.params.pinId;
  const userId = route.query.id; 
  try {
    const response = await axios.get(
      `/api/remove/${pinId}`,
      { params: { userId } }
    );

    if (response.status === 200) {
      reportIssue.value = "success";
    } 
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

onMounted(() => {
  verifyPin();
});
</script>
