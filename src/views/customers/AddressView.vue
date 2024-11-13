<script setup>
import axios from "../../../axios";
import { onMounted, ref } from "vue";
import { parseJwt } from "@/stores/jwt";
import { useToast } from "vue-toastification";

const toast = useToast();
const token = localStorage.getItem("token");

// State variables for user info
const firstname = ref("");
const lastname = ref("");
const email = ref("");
const phonenumber = ref("");

// State variables for billing address
const showBillingEdit = ref(false);

// State variables for shipping address
const shippingId = ref("");
const shippingRegion = ref("");
const shippingAddress = ref("");
const shippingZip = ref("");
const shippingTown = ref("");
const shippingState = ref("");
const showShippingEdit = ref(false);

const decode = ref();
const userInfo = ref([]);

if (token) {
  try {
    decode.value = parseJwt(token);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    decode.value = {};
  }
}

// Fetch user data on component mount
const refreshData = async () => {
  try {
    const response = await axios.get(
      `/api/account/${decode.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      userInfo.value = response.data.data;
      // Set initial values
      shippingId.value=userInfo.value[0].address_id;
      firstname.value = userInfo.value[0].firstname;
      lastname.value = userInfo.value[0].lastname;
      email.value = userInfo.value[0].email;
      phonenumber.value = userInfo.value[0].phonenumber;
      shippingRegion.value = userInfo.value[0].region;
      shippingAddress.value = userInfo.value[0].address;
      shippingZip.value = userInfo.value[0].zip;
      shippingTown.value = userInfo.value[0].town;
      shippingState.value = userInfo.value[0].state;
    }
  } catch (error) {
    if (error && error.response) {
      if (
        error.response.status === 403 &&
        error.response.data.message === "Token expired"
      ) {
        localStorage.removeItem("token");
        location.reload();
      }
    }
  }
};

// Function to handle form submissions for billing and shipping addresses
const updateBillingAddress = async () => {
  const data = {
    firstname: firstname.value,
    lastname: lastname.value,
    email: email.value,
    phonenumber: phonenumber.value,
  };

  try {
    const response = await axios.put(
      `/api/update-billing-address/${decode.value.id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      toast.success("Billing address updated successfully");
      refreshData(); // Refresh data to reflect changes
      showBillingEdit.value = false;
    }
  } catch (error) {
    toast.error("An error occurred: " + error.message); // Show error message
  }
};

const updateShippingAddress = async () => {
  const data = {
    region: shippingRegion.value,
    address: shippingAddress.value,
    town: shippingTown.value,
    state: shippingState.value,
    zip: shippingZip.value,
  };

  try {
    const response = await axios.put(
      `/api/update-shipping-address/${shippingId.value}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      toast.success("Shipping address updated successfully");
      refreshData(); // Refresh data to reflect changes
      showShippingEdit.value = false;
    }
  } catch (error) {
    toast.error("An error occurred: " + error.message); // Show error message
  }
};

// Function to toggle billing edit mode
const toggleBillingEdit = () => {
  showBillingEdit.value = !showBillingEdit.value;
};

// Function to toggle shipping edit mode
const toggleShippingEdit = () => {
  showShippingEdit.value = !showShippingEdit.value;
};

onMounted(refreshData);
</script>

<template>
  <div
    class="bg-gray-100 h-full px-4 md:px-6 lg:px-16 xl:px-24 w-full mt-24 py-6"
  >
    <div class="w-full">
      <h1 class="text-2xl font-semibold mb-4">Shopping Cart</h1>
      <p>Addresses</p>
      <div class="flex items-center justify-center">
        <div class="w-full lg:w-2/3 xl:w-2/3 shadow-lg bg-white rounded-md">
          <p class="text-center py-5">
            The following addresses will be used on the checkout page by default
          </p>
          <div class="w-full grid grid-cols-2 px-4 py-4">
            <!-- Billing Address Section -->
            <div>
              <p class="font-semibold py-3">Billing Address</p>
              <button
                @click="toggleBillingEdit"
                class="bg-black text-white px-4 py-2 rounded"
              >
                {{ showBillingEdit ? "Cancel" : "Edit" }}
              </button>
              <template v-if="!showBillingEdit">
                <p>{{ firstname }} {{ lastname }}</p>
                <p>{{ email }}</p>
                <p>{{ phonenumber }}</p>
              </template>
              <!-- Billing Modal -->
              <div
                v-if="showBillingEdit"
                class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <div class="bg-white p-6 rounded-md w-full max-w-md relative">
                  <button
                    @click="toggleBillingEdit"
                    class="absolute top-2 right-2 text-gray-600 text-2xl z-50"
                  >
                    &times;
                  </button>
                  <h2 class="text-xl font-semibold mb-4">
                    Edit Billing Address
                  </h2>
                  <form @submit.prevent="updateBillingAddress">
                    <input
                      v-model="firstname"
                      placeholder="First Name"
                      class="block mb-2 w-full border p-2 rounded"
                    />
                    <input
                      v-model="lastname"
                      placeholder="Last Name"
                      class="block mb-2 w-full border p-2 rounded"
                    />
                    <input
                      v-model="email"
                      type="email"
                      placeholder="Email"
                      class="block mb-2 w-full border p-2 rounded"
                    />
                    <input
                      v-model="phonenumber"
                      placeholder="Phone Number"
                      class="block mb-2 w-full border p-2 rounded"
                    />
                    <button
                      type="submit"
                      class="mt-2 bg-black text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <!-- Shipping Address Section -->
            <div>
              <p class="font-semibold py-3">Shipping Address</p>
              <button
                @click="toggleShippingEdit"
                class="bg-black text-white px-4 py-2 rounded"
              >
                {{ showShippingEdit ? "Cancel" : "Edit" }}
              </button>
              <template v-if="!showShippingEdit">
                <p>{{ firstname }} {{ lastname }}</p>
                <p>{{ shippingAddress }}</p>
                <p>{{ shippingZip }}</p>
              </template>
              <!-- Shipping Modal -->
              <div
                v-if="showShippingEdit"
                class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <div class="bg-white p-6 rounded-md w-full max-w-md relative">
                  <button
                    @click="toggleShippingEdit"
                    class="absolute top-2 right-2 text-gray-600 text-2xl z-50"
                  >
                    &times;
                  </button>
                  <h2 class="text-xl font-semibold mb-4">
                    Edit Shipping Address
                  </h2>
                  <form @submit.prevent="updateShippingAddress">
                    <input
                      v-model="shippingRegion"
                      placeholder="Region"
                      class="block mb-2 w-full border p-2 rounded"
                    />
                    <input
                      v-model="shippingAddress"
                      placeholder="Address"
                      class="block mb-2 w-full border p-2 rounded"
                    />
                    <input
                      v-model="shippingTown"
                      placeholder="Town"
                      class="block mb-2 w-full border p-2 rounded"
                    />
                    <input
                      v-model="shippingState"
                      placeholder="State"
                      class="block mb-2 w-full border p-2 rounded"
                    />
                    <input
                      v-model="shippingZip"
                      placeholder="Zip Code"
                      class="block mb-2 w-full border p-2 rounded"
                    />
                    <button
                      type="submit"
                      class="mt-2 bg-black text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
