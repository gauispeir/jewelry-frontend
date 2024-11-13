<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "../../../axios";

import { useToast } from 'vue-toastification';

const toast = useToast();

const showModal = ref(false);
const deleteModal = ref(false);
const deleteID = ref();
const page = ref(1);
const itemName = ref("");
const tableData = ref([]);

watch(itemName, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    fetchData();
  }
});

const next = () => {
  if (tableData.value.length - 1 > 0) {
    fetchData();
    tableData.value = {};
    if (tableData.value.length > 0) {
      page.value++;
    }
  }
};

const prev = () => {
  if (page.value > 1) {
    page.value--;
    fetchData();
  }
};

async function fetchData() {
  try {
    const response = await axios.get(
      `/api/get-review-admin/${page.value}/10/${itemName.value}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    ); // Adjust page and limit as needed
    tableData.value = response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

onMounted(() => {
  fetchData();
});

const deleteSubmit = (id) => {
  deleteModal.value = true;
  deleteID.value = id;
};

const cancelDelete = () => {
  deleteID.value = null;
  deleteModal.value = false;
};

const handleDelete = async () => {
  try {
    const response = await axios.put(
      `/api/delete-review/${deleteID.value}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      fetchData();
      toast.success("Success: Review hide successfully!");
    } else {
      toast.error("Unexpected status code: " + response.status);
    }
  } catch (error) {
    const errorMessage = error.response
      ? `Error ${error.response.status}: ${
          error.response.data || "An error occurred"
        }`
      : error.request
      ? "No response received from server."
      : "Error: " + error.message;
    toast.error(errorMessage);
  } finally {
    cancelDelete();
  }
};


</script>

<template>
  <div class="h-full px-4 md:px-6 w-full mt-24 py-6">
    <div class="w-full shadow-lg p-4 rounded-md border">
      <div class="flex items-center justify-end mb-4">
        <div class="bg-white p-2 rounded-lg border">
          <i class="fas fa-search mr-2"></i>
          <input
            v-model="itemName"
            type="text"
            class="outline-none"
            placeholder="Search item"
          />
        </div>
      </div>

      <div class="w-full">
        <div class="bg-white p-6 mb-4 border-y max-h-[400px] overflow-y-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th class="text-left font-semibold">
                  No. 
                </th>
        
                <th class="text-left font-semibold">message</th>

              
                <th class="text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in tableData" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ item.message }}</td>
              
                <td>
                  <button
                    @click="deleteSubmit(item.id)"
                    class="text-slate-800 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
                  >
                    Hide
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between">
          <section v-if="!itemName">
            Showing {{ (page - 1) * 10 + 1 }} to
            {{ (page - 1) * 10 + 1 + (tableData.length - 1) }} of entries
          </section>
          <section v-else>Showing {{ tableData.length }} entries</section>
          <section>
            <button
              class="p-2 border rounded-md bg-black text-white"
              @click="prev"
            >
              Prev
            </button>
            <button class="px-4">{{ page }}</button>
            <button
              class="p-2 border rounded-md bg-black text-white"
              @click="next"
            >
              Next
            </button>
          </section>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="deleteModal"
      class="fixed top-0 left-0 flex items-center justify-center h-screen w-screen"
    >
      <div class="border rounded-lg shadow relative max-w-sm bg-white">
        <div class="flex justify-end p-2">
          <button
            @click="cancelDelete"
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div class="p-6 pt-0 text-center">
          <svg
            class="w-20 h-20 text-red-600 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 class="text-xl font-normal text-gray-500 mt-5 mb-6">
            Are you sure you want to hide this comment?
          </h3>
          <a
            @click="handleDelete()"
            class="text-white bg-red-600 hover:bg-red-800 cursor-pointer focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2"
          >
            Yes, I'm sure
          </a>
          <a
            @click="cancelDelete"
            class="text-gray-900 bg-white cursor-pointer hover:bg-gray-100 focus:ring-4 focus:ring-cyan-200 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center"
          >
            No, cancel
          </a>
        </div>
      </div>
    </div>

  </div>
</template>
