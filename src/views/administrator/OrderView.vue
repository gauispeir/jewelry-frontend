<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "../../../axios";
import { useToast } from "vue-toastification";

const toast = useToast();

const showModal = ref(false);
const orderID = ref();
const page = ref(1);
const itemName = ref("");
const showDetailModal = ref(false);
const tableData = ref([]);
const selectedItem = ref(null);
const selectedOrder = ref(null);
const showOrderModal = ref(false);
const selectedShippingDetails = ref([]);
const shippingIndex = ref(null);
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
      `/api/get-order/user/${page.value}/10/${itemName.value}`,
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
const inches = ref([]);
const getItemSize = async () => {
  try {
    const response = await axios.get(
      `/api/get-item/order`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      inches.value = response.data.data;
      console.log("inches", inches.value);
    }
  } catch (error) {
    if (error && error.response) {
      if (error.response.status === 403) {
        if (error.response.data.message === "Token expired") {
          localStorage.removeItem("token");
          location.reload();
        }
      }
    }
  }
};
onMounted(() => {
  fetchData();
  getItemSize();
});
const openShipping = (order, index) => {
  shippingIndex.value = index;
  selectedShippingDetails.value[index] = JSON.parse(order.shipping_address);
};

const closeShipping = () => {
  shippingIndex.value = null;
};

const viewOrders = (item) => {
  selectedOrder.value = item;
  showOrderModal.value = true;
};

const approved = async (id) => {
  orderID.value = id;
  try {
    const response = await axios.put(
      `/api/approved-order/${orderID.value}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      fetchData();
      toast.success("Success: Item approved successfully!");
    } else {
      toast.error("Unexpected status code: " + response.status);
    }
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message;
      toast.error(errorMessage);
    }
  }
};
const rejected = async (id) => {
  orderID.value = id;

  try {
    const response = await axios.put(
      `/api/rejected-order/${orderID.value}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      fetchData();
      toast.success("Success: Item rejected successfully!");
    } else {
      toast.error("Unexpected status code: " + response.status);
    }
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message;
      toast.error(errorMessage);
    }
  }
};
const delivered = async (id) => {
  orderID.value = id;

  try {
    const response = await axios.put(
      `/api/delivered-order/${orderID.value}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      fetchData();
      toast.success("Success: Item delivered successfully!");
    } else {
      toast.error("Unexpected status code: " + response.status);
    }
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message;
      toast.error(errorMessage);
    }
  }
};
function getOverallTotal(order) {
  return order.reduce((sum, item) => sum + item.total, 0);
}
function dateNow(date) {
  const createdAt = new Date(date);

  const options = { year: "numeric", month: "short", day: "2-digit" };

  const formattedDate = createdAt.toLocaleDateString("en-US", options);
  return formattedDate;
}
function viewDetails(item) {
  selectedItem.value = item;
  showDetailModal.value = true;
}
</script>

<template>
  <div class="h-full px-4 md:px-6 w-full mt-24 py-6">
    <div class="w-full shadow-lg p-4 rounded-md border p-3">
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
                <th class="text-left font-semibold">Date of order</th>
                <th class="text-left font-semibold">Customer</th>
                <th class="text-left font-semibold">Order</th>
                <th class="text-left font-semibold">Shipping</th>
                <th class="text-left font-semibold">Total cost</th>
                <th class="text-left font-semibold">Payment Method</th>
                <th class="text-left font-semibold">Status</th>
                <th class="text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in tableData" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ dateNow(item.created_at) }}</td>

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
                    @click="viewOrders(item)"
                    class="text-slate-800 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
                  >
                    View
                  </button>
                </td>
                <td class="py-4">
                  <button
                    @click="openShipping(item, index)"
                    class="py-2 px-3 border rounded-lg"
                  >
                    View
                  </button>
                </td>
                <td>
                  {{
                    getOverallTotal(JSON.parse(item.order_details)).toFixed(2)
                  }}
                </td>
                <td>Gcash</td>
                <td>
                  <span
                    class="p-1 rounded-sm"
                    :class="{ 'bg-green-50': item.status === 'delivered' }"
                    >{{ item.status }}</span
                  >
                </td>
                <td>
                  <button
                    v-if="item.status === 'pending'"
                    @click="approved(item.id)"
                    class="text-slate-800 text-sm bg-white hover:bg-slate-100 border mr-3 border-slate-200 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
                  >
                    Approve
                  </button>
                  <button
                    v-if="item.status === 'pending'"
                    @click="rejected(item.id)"
                    class="text-slate-800 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
                  >
                    Reject
                  </button>
                  <button
                    v-if="item.status === 'shipping'"
                    @click="delivered(item.id)"
                    class="text-slate-800 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
                  >
                    Delivered
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
    <div
      v-if="showOrderModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-30"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 lg:w-2/3 max-h-[600px] overflow-y-auto"
      >
        <div class="flex justify-between mb-4">
          <h2 class="text-2xl font-bold">Order Details</h2>
          <button
            @click="showOrderModal = false"
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
        <div class="grid grid-cols-6 m-2 font-semibold">
          <p>Product image</p>
          <p>Product name</p>
          <p>Size</p>
          <p>Quantity</p>
          <p>Price</p>
          <p>Sub Total</p>
        </div>
        <div
          class="grid grid-cols-6 items-center m-2"
          v-for="(order, index) in JSON.parse(selectedOrder.order_details)"
          :key="index"
        >
          <p>
            <img
              :src="`https://jewelry-backend-rh2w.onrender.com/images/${order.image}`"
              alt="Product Image"
              class="w-16 h-16 object-cover"
            />
          </p>
          <p>{{ order.name }}</p>
          <p>
            {{ order.size }}

            <span
              v-for="inch in inches"
              :key="inch.id"
              v-show="inch.id == order.id"
            >
              ({{
                order.size === "sm"
                  ? inch.smInches
                  : order.size === "md"
                  ? inch.mdInches
                  : order.size === "lg"
                  ? inch.lgInches
                  : ""
              }})
            </span>
          </p>
          <p>{{ order.quantity }}</p>
          <p>{{ order.price.toFixed(2) }}</p>
          <p>{{ order.total.toFixed(2) }}</p>
        </div>
        <div class="flex justify-end mt-4">
          <button
            @click="showOrderModal = false"
            class="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="shippingIndex !== null"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-30"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 w-full md:w-2/3 lg:w-2/3">
        <h2 class="text-xl font-semibold mb-4">Shipping Address</h2>
        <table class="w-full">
          <thead>
            <tr>
              <th class="text-left font-semibold">Region</th>
              <th class="text-left font-semibold">Address</th>
              <th class="text-left font-semibold">Town</th>
              <th class="text-left font-semibold">State</th>
              <th class="text-left font-semibold">Zip</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {{ selectedShippingDetails[shippingIndex].region }}
              </td>
              <td>{{ selectedShippingDetails[shippingIndex].address }}</td>
              <td>{{ selectedShippingDetails[shippingIndex].town }}</td>
              <td>{{ selectedShippingDetails[shippingIndex].state }}</td>
              <td>{{ selectedShippingDetails[shippingIndex].zip }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-4 flex justify-end">
          <button
            @click="closeShipping"
            class="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
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
          <p class="border p-2 my-2 rounded-md">
            <strong>First Name:</strong> {{ selectedItem.firstname }}
          </p>
          <p class="border p-2 my-2 rounded-md">
            <strong>Last Name:</strong> {{ selectedItem.lastname }}
          </p>
          <p class="border p-2 my-2 rounded-md">
            <strong>Email:</strong> {{ selectedItem.email }}
          </p>
          <p class="border p-2 my-2 rounded-md">
            <strong>Phone Number:</strong> {{ selectedItem.phoneNumber }}
          </p>
          <p class="border p-2 my-2 rounded-md">
            <strong>Gender:</strong> {{ selectedItem.gender }}
          </p>
          <p class="border p-2 my-2 rounded-md">
            <strong>Date of birth:</strong> {{ selectedItem.birth }}
          </p>
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
