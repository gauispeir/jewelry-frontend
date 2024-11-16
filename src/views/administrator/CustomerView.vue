<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "../../../axios";
import { useToast } from "vue-toastification";

const toast = useToast();
const showModal = ref(false);
const deleteModal = ref(false);
const deleteID = ref();
const page = ref(1);
const itemName = ref("");
const showDetailModal = ref(false);
const tableData = ref([]);
const selectedItem = ref(null);

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
      `/api/user/${page.value}/10/${itemName.value}`,
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
      `/api/delete-user/${deleteID.value}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      toast.success("Success: User account deactivated successfully!");
      fetchData();
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

function viewDetails(item) {
  selectedItem.value = item;
  showDetailModal.value = true;
}
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
            placeholder="Search by name"
          />
        </div>
      </div>

      <div class="w-full">
        <div class="bg-white p-6 mb-4 border-y max-h-[400px] overflow-y-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th class="text-left font-semibold">No.</th>
                <th class="text-left font-semibold">First Name</th>
                <th class="text-left font-semibold">Last Name</th>
                <th class="text-left font-semibold">Email</th>
                <th class="text-left font-semibold">Phone Number</th>

                <th class="text-left font-semibold">View</th>
                <th class="text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in tableData" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ item.firstname }}</td>
                <td>{{ item.lastname }}</td>
                <td>{{ item.email }}</td>
                <td>{{ item.phonenumber }}</td>
                <td>
                  <button
                    @click="viewDetails(item)"
                    class="text-slate-800 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
                  >
                    View
                  </button>
                </td>
                <td>
                  <button
                    v-if="item.status === 'verified'"
                    @click="deleteSubmit(item.id)"
                    class="text-slate-800 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
                  >
                    Active
                  </button>
                  <button
                    v-else
                    :disabled="true"
                    class="text-slate-800 text-sm bg-red-100 text-red-700 rounded-lg font-medium p-1 inline-flex space-x-1 items-center"
                  >
                    Inactive
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
            Do you want to mark this user as inactive?
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

    <!-- View Details Modal -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-30"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 lg:w-2/3 max-h-[600px] overflow-y-auto"
      >
        <div class="flex justify-between mb-4">
          <h2 class="text-2xl font-bold">User Details</h2>
          <button
            @click="showDetailModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div class="grid xl:grid-cols-2 lg:grid-cols-2 gap-2">
          <section>
            <p class="border p-2 my-2 rounded-md">
              <strong>First Name:</strong> {{ selectedItem.firstname }}
            </p>
            <p class="border p-2 my-2 rounded-md">
              <strong>Last Name:</strong> {{ selectedItem.lastname }}
            </p>
            <p class="border p-2 my-2 rounded-md">
              <strong>Email:</strong> {{ selectedItem.email }}
            </p>
          </section>
          <section>
            <p class="border p-2 my-2 rounded-md">
              <strong>Phone Number:</strong> {{ selectedItem.phonenumber }}
            </p>
            <p class="border p-2 my-2 rounded-md">
              <strong>Gender:</strong> {{ selectedItem.gender }}
            </p>
            <p class="border p-2 my-2 rounded-md">
              <strong>Birth Date:</strong> {{ selectedItem.birth }}
            </p>
          </section>
        </div>
        <div class="flex justify-end mt-4">
          <button
            @click="showDetailModal = false"
            class="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
