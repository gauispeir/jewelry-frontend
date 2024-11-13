<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "../../../axios";

const showModal = ref(false);
const page = ref(1);
const itemName = ref("");
const showDetailModal = ref(false);
const showProductDetailModal = ref(false);
const tableData = ref([]);
const selectedItem = ref(null);
const selectedProductItem = ref(null);

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
      `/api/installment-plan/${page.value}/10/${itemName.value}`,
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

function viewDetails(item) {
  selectedItem.value = item;
  showDetailModal.value = true;
}
function viewProductDetails(item) {
  selectedProductItem.value = item;
  showProductDetailModal.value = true;
}
</script>

<template>
  <div class="h-full px-4 md:px-6  w-full mt-24 py-6">
    <div class="w-full  shadow-lg p-4 rounded-md border">
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
                <th class="text-left font-semibold">No.</th>
                <th class="text-left font-semibold">First Name</th>
                <th class="text-left font-semibold">Last Name</th>
                <th class="text-left font-semibold">Customer details</th>

                <th class="text-left font-semibold">Product details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in tableData" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ item.first_name }}</td>
                <td>{{ item.last_name }}</td>
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
                    @click="viewProductDetails(item)"
                    class="text-slate-800 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
                  >
                    View
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
            <button class="p-2 border rounded-md bg-black text-white" @click="prev">Prev</button>
            <button class="px-4">{{ page }}</button>
            <button class="p-2 border rounded-md bg-black text-white" @click="next">Next</button>
          </section>
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
          <p class="border p-2 my-2 rounded-md"><strong>First Name:</strong> {{ selectedItem.first_name }}</p>
          <p class="border p-2 my-2 rounded-md"><strong>Last Name:</strong> {{ selectedItem.last_name }}</p>
          <p class="border p-2 my-2 rounded-md"><strong>Email:</strong> {{ selectedItem.email }}</p>
          <p class="border p-2 my-2 rounded-md"><strong>Phone number:</strong> {{ selectedItem.phone_number }}</p>
          </section>
          <section>
          <p class="border p-2 my-2 rounded-md"><strong>Country:</strong> {{ selectedItem.country }}</p>
          <p class="border p-2 my-2 rounded-md"><strong>Address:</strong> {{ selectedItem.street_address }}</p>
          <p class="border p-2 my-2 rounded-md"><strong>City:</strong> {{ selectedItem.town_city }}</p>
          <p class="border p-2 my-2 rounded-md"><strong>Zip code:</strong> {{ selectedItem.postcode }}</p>
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

    <!-- View Product Details Modal -->
    <div
      v-if="showProductDetailModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-30"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 lg:w-2/3 max-h-[600px] overflow-y-auto"
      >
        <div class="flex justify-between mb-4">
          <h2 class="text-2xl font-bold">Product Details</h2>
          <button
            @click="showProductDetailModal = false"
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
        <div class="grid lg:grid-cols-2 xl:grid-cols-2 gap-3">
          <p>
            <img
              :src="`https://jewelry-backend-rh2w.onrender.com/images/${selectedProductItem.image_path}`"
              alt="Product Image"
              class="w-full h-full object-cover rounded-lg"
            />
          </p>
          <div>
             <p class="border p-2 my-2 rounded-md">
            <strong>Product name:</strong> {{ selectedProductItem.item_name }}
          </p>
          <p class="border p-2 my-2 rounded-md"><strong>Size:</strong> {{ selectedProductItem.size }}</p>
          <p class="border p-2 my-2 rounded-md"><strong>Color:</strong> {{ selectedProductItem.color }}</p>
          <p class="border p-2 my-2 rounded-md"><strong>Karat:</strong> {{ selectedProductItem.karat }}</p>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button
            @click="showProductDetailModal = false"
            class="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
