<script setup>
import { onMounted, ref, computed } from "vue";
import { parseJwt } from "@/stores/jwt";
import axios from "../../../axios";
import { useToast } from "vue-toastification";

const toast = useToast();

const token = localStorage.getItem("token");
const decode = ref();
const items = ref([]);
const selectedOrderDetails = ref(null);
const selectedShippingDetails = ref([]);
const shippingIndex = ref(null);
const showModal = ref(false);
const searchQuery = ref("");
const orderID = ref();
if (token) {
  try {
    decode.value = parseJwt(token);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    decode.value = {};
  }
}

const refreshData = async () => {
  try {
    const response = await axios.get(
      `/api/get-order/1/${decode.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      items.value = response.data.data;
      console.log(items.value);
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

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}
const openShipping = (order, index) => {
  shippingIndex.value = index;
  selectedShippingDetails.value[index] = JSON.parse(order.shipping_address);
};

const closeShipping = () => {
  shippingIndex.value = null;
};
function openOrderDetails(order) {
  selectedOrderDetails.value = JSON.parse(order.order_details);
  showModal.value = true;
}

function closeOrderDetails() {
  showModal.value = false;
  selectedOrderDetails.value = null;
}

function totalAlltotal(orderDetails) {
  return orderDetails.reduce((accum, item) => accum + item.total, 0);
}

// Computed property to filter items based on the search query
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  const query = searchQuery.value.toLowerCase();
  return items.value.filter(
    (order) =>
      order.order_details.toLowerCase().includes(query) ||
      formatDate(order.created_at).toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
  );
});

const cancelled = async (id) => {
  orderID.value = id;

  try {
    const response = await axios.put(
      `/api/cancelled-order/${orderID.value}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      refreshData();
      toast.success("Success: Item cancelled successfully!");
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

const confirmed = async (id) => {
  orderID.value = id;

  try {
    const response = await axios.put(
      `/api/confirmed-order/${orderID.value}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      refreshData();
      toast.success("Success: Item confirmed successfully!");
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
  refreshData();
  getItemSize();
});
</script>
<template>
  <div
    class="bg-gray-100 h-full px-4 md:px-6 lg:px-16 xl:px-24 w-full mt-24 py-6"
  >
    <div class="w-full">
      <div class="flex items-center justify-end mb-4">
        <div class="bg-white p-2 rounded-lg">
          <i class="fas fa-search mr-2"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="outline-none"
            placeholder="Search item"
          />
        </div>
      </div>
      <h1 class="text-2xl font-semibold mb-4">My Account</h1>
      <p class="pb-2">Orders</p>
      <div class="w-full">
        <div class="w-full">
          <div
            class="bg-white rounded-lg shadow-md p-6 mb-4 min-w-[500px] overflow-x-auto"
          >
            <table class="w-full">
              <thead>
                <tr>
                  <th class="text-left font-semibold">Order No.</th>
                  <th class="text-left font-semibold">Date of Order</th>
                  <th class="text-left font-semibold">Order</th>
                  <th class="text-left font-semibold">Shipping</th>
                  <th class="text-left font-semibold">Track Order</th>
                  <th class="text-left font-semibold">Total Cost</th>
                  <th class="text-left font-semibold">Status</th>
                  <th class="text-left font-semibold">Action</th>
                  <th class="text-left font-semibold">Receive</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(order, index) in filteredItems"
                  :key="index"
                  v-show="order.status !== 'delivered'"
                >
                  <td>{{ index + 1 }}</td>
                  <td class="py-4">{{ formatDate(order.created_at) }}</td>
                  <td class="py-4">
                    <button
                      @click="openOrderDetails(order)"
                      class="py-2 px-3 border rounded-lg"
                    >
                      View
                    </button>
                    <div v-if="order === selectedOrderDetails">
                      <tr
                        v-for="(item, indexChild) in JSON.parse(
                          order.order_details
                        )"
                        :key="indexChild"
                      >
                        <td>
                          <img
                            class="h-16 w-16 mr-4"
                            :src="`/images/${item.image}`"
                            alt="Product image"
                          />
                        </td>
                        <td>{{ item.name }}</td>
                        <td>{{ item.size }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ item.price.toFixed(2) }}</td>
                        <td>{{ item.total.toFixed(2) }}</td>
                      </tr>
                    </div>
                  </td>
                  <td class="py-4">
                    <button
                      @click="openShipping(order, index)"
                      class="py-2 px-3 border rounded-lg"
                    >
                      View
                    </button>
                  </td>

                  <td class="py-4">
                    <a
                      href="https://www.lbcexpress.com/"
                      class="py-2 px-3 border rounded-lg"
                      >Click</a
                    >
                  </td>
                  <td class="py-4">
                    {{
                      totalAlltotal(JSON.parse(order.order_details)).toFixed(2)
                    }}
                  </td>
                  <td class="py-4">{{ order.status }}</td>
                  <td class="py-4">
                    <button
                      v-if="
                        !(
                          order.status === 'shipped' ||
                          order.status === 'delivered' ||
                          order.status === 'cancelled' ||
                          order.status === 'rejected'
                        )
                      "
                      class="py-2 px-3 border rounded-lg"
                      @click="cancelled(order.id)"
                    >
                      Cancel
                    </button>
                    <button
                      v-if="order.status === 'shipped'"
                      class="py-2 px-3 border rounded-lg"
                    >
                      Shipped
                    </button>
                    <button
                      v-if="order.status === 'delivered'"
                      class="py-2 px-3 border rounded-lg"
                    >
                      Delivered
                    </button>
                    <button
                      v-if="order.status === 'cancelled'"
                      class="py-2 px-3 border rounded-lg"
                    >
                      Cancelled
                    </button>
                  </td>
                  <td class="py-4">
                    <button
                      class="py-2 px-3 border rounded-lg"
                      v-if="order.status === 'shipped'"
                      @click="confirmed(order.id)"
                    >
                      Confirm
                    </button>
                    <button
                      class="py-2 px-3 border rounded-lg"
                      v-if="
                        order.status === 'shipping' ||
                        order.status === 'pending'
                      "
                      disabled
                    >
                      Waiting
                    </button>
                    <button
                      class="py-2 px-3 border rounded-lg"
                      v-if="order.status === 'delivered'"
                      disabled
                    >
                      Delivered
                    </button>
                    <button
                      class="py-2 px-3 border rounded-lg"
                      v-if="order.status === 'cancelled'"
                      disabled
                    >
                      Cancelled
                    </button>
                  </td>
                </tr>
                <!-- More product rows -->
              </tbody>
            </table>
          </div>
        </div>
        <!-- delivered -->
        <h1 class="my-2">Delivered</h1>
        <div
          class="bg-white rounded-lg shadow-md p-6 mb-4 min-w-[500px] overflow-x-auto"
        >
          <table class="w-full">
            <thead>
              <tr>
                <th class="text-left font-semibold">Order No.</th>
                <th class="text-left font-semibold">Date of Order</th>
                <th class="text-left font-semibold">Order</th>
                <th class="text-left font-semibold">Shipping</th>
                <th class="text-left font-semibold">Track Order</th>
                <th class="text-left font-semibold">Total Cost</th>
                <th class="text-left font-semibold">Status</th>
                <th class="text-left font-semibold">Action</th>
                <th class="text-left font-semibold">Receive</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(order, index) in filteredItems"
                :key="index"
                v-show="order.status === 'delivered'"
              >
                <td>{{ index + 1 }}</td>
                <td class="py-4">
                  {{ formatDate(order.created_at) }} {{ order.status }}
                </td>
                <td class="py-4">
                  <button
                    @click="openOrderDetails(order)"
                    class="py-2 px-3 border rounded-lg"
                  >
                    View
                  </button>
                  <div v-if="order === selectedOrderDetails">
                    <tr
                      v-for="(item, indexChild) in JSON.parse(
                        order.order_details
                      )"
                      :key="indexChild"
                    >
                      <td>
                        <img
                          class="h-16 w-16 mr-4"
                          :src="`/images/${item.image}`"
                          alt="Product image"
                        />
                      </td>
                      <td>{{ item.name }}</td>
                      <td>{{ item.size }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.price.toFixed(2) }}</td>
                      <td>{{ item.total.toFixed(2) }}</td>
                    </tr>
                  </div>
                </td>
                <td class="py-4">
                  <button
                    @click="openShipping(order, index)"
                    class="py-2 px-3 border rounded-lg"
                  >
                    View
                  </button>
                </td>

                <td class="py-4">
                  <a
                    href="https://www.lbcexpress.com/"
                    class="py-2 px-3 border rounded-lg"
                    >Click</a
                  >
                </td>
                <td class="py-4">
                  {{
                    totalAlltotal(JSON.parse(order.order_details)).toFixed(2)
                  }}
                </td>
                <td class="py-4">{{ order.status }}</td>
                <td class="py-4">
                  <button
                    v-if="
                      !(
                        order.status === 'shipped' ||
                        order.status === 'delivered' ||
                        order.status === 'cancelled' ||
                        order.status === 'rejected'
                      )
                    "
                    class="py-2 px-3 border rounded-lg"
                    @click="cancelled(order.id)"
                  >
                    Cancel
                  </button>
                  <button
                    v-if="order.status === 'shipped'"
                    class="py-2 px-3 border rounded-lg"
                  >
                    Shipped
                  </button>
                  <button
                    v-if="order.status === 'delivered'"
                    class="py-2 px-3 border rounded-lg"
                  >
                    Delivered
                  </button>
                  <button
                    v-if="order.status === 'cancelled'"
                    class="py-2 px-3 border rounded-lg"
                  >
                    Cancelled
                  </button>
                </td>
                <td class="py-4">
                  <button
                    class="py-2 px-3 border rounded-lg"
                    v-if="order.status === 'shipped'"
                    @click="confirmed(order.id)"
                  >
                    Confirm
                  </button>
                  <button
                    class="py-2 px-3 border rounded-lg"
                    v-if="
                      order.status === 'shipping' || order.status === 'pending'
                    "
                    disabled
                  >
                    Waiting
                  </button>
                  <button
                    class="py-2 px-3 border rounded-lg"
                    v-if="order.status === 'delivered'"
                    disabled
                  >
                    Delivered
                  </button>
                  <button
                    class="py-2 px-3 border rounded-lg"
                    v-if="order.status === 'cancelled'"
                    disabled
                  >
                    Cancelled
                  </button>
                </td>
              </tr>
              <!-- More product rows -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 w-full md:w-2/3 lg:w-2/3">
        <h2 class="text-xl font-semibold mb-4">Order Details</h2>
        <table class="w-full">
          <thead>
            <tr>
              <th class="text-left font-semibold">Image</th>
              <th class="text-left font-semibold">Name</th>
              <th class="text-left font-semibold">Size</th>
              <th class="text-left font-semibold">Quantity</th>
              <th class="text-left font-semibold">Price</th>
              <th class="text-left font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in selectedOrderDetails" :key="index">
              <td>
                <img
                  class="h-16 w-16"
                  :src="`/images/${item.image}`"
                  alt="Product image"
                />
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.size }} (
                <span v-for="inch in inches" :key="inch.id" v-show="inch.id==item.id">
                {{item.size==='sm'? inch.smInches: item.size==='md'? inch.mdInches: item.size==='lg'? inch.lgInches:''}})
                </span></td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.price.toFixed(2) }}</td>
              <td>{{ item.total.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-4 flex justify-end">
          <button
            @click="closeOrderDetails"
            class="py-2 px-4 bg-red-500 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- shipping -->
    <div
      v-if="shippingIndex !== null"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75"
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
            class="py-2 px-4 bg-red-500 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
