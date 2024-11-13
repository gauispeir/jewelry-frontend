<script setup>
import axios from "../../../axios";
import { ref, onMounted, computed, watch } from "vue";
import { parseJwt } from "@/stores/jwt";
import { useToast } from "vue-toastification";

const toast = useToast();
const items = ref([]);
const token = localStorage.getItem("token");
const decode = ref();
const isProceedCheckout = ref(false);
const selectedCart = ref([]);
const region = ref("");
const address = ref("");
const town = ref("");
const zip = ref("");
const state = ref("");
const userInfo = ref([]);
const availableSize = ref(["sm", "md", "lg"]);
const paymentButtonText = ref("Proceed to Payment");
const selectedAddress = ref("Shipping address");

const otherRegion = ref("");
const otherAddress = ref("");
const otherTown = ref("");
const otherState = ref("");
const otherZip = ref("");
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
      `/api/get-cart/1/${decode.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      items.value = response.data.data.map((item) => ({
        ...item,
        selectedSize: item.size ? item.size : availableSize.value[0], // Initialize selectedSize as an empty string
        quantity: item.quantity || 1,
        totalPrice: item.price,
        isChecked: false,
      }));
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
  try {
    const response = await axios.get(
      `/api/user/${decode.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      userInfo.value = response.data.data;
      console.log(userInfo.value);
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

const increaseQuantity = (item) => {
  if (
    (item.selectedSize === "sm" && item.sm > item.quantity) ||
    (item.selectedSize === "md" && item.md > item.quantity) ||
    (item.selectedSize === "lg" && item.lg > item.quantity)
  ) {
    console.log(item.sm);
    item.quantity++;
    calculateTotalPrice(item);
  } else {
    if (item.selectedSize) {
      toast.error("Request exceeds available stock.");
    } else {
      toast.error("Select size first");
    }
  }
};

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
    calculateTotalPrice(item);
  }
};

const calculateTotalPrice = (item) => {
  item.totalPrice = item.quantity * item.price;
};

const totalSum = computed(() => {
  return items.value.reduce((sum, item) => {
    return item.isChecked ? sum + item.totalPrice : sum;
  }, 0);
});
const removeItem = async (id) => {
  try {
    const response = await axios.put(
      `/api/delete-item-cart/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      toast.success("Success: Remove to the cart successfully!");
      if(items.value.length===1){
         items.value = [];
      }
      refreshData();
      console.log(items.value)
    } else {
      toast.error("Unexpected status code: " + response.status);
    }
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.message;
      toast.error(errorMessage);
    } else if (error.request) {
      toast.error("No response received from server.");
    } else {
      toast.error("Error: " + error.message);
    }
  }
};

watch(
  items,
  () => {
    items.value.forEach((item) => calculateTotalPrice(item));
  },
  { deep: true }
);

onMounted(() => {
  refreshData();
});

const initiateCheckout = () => {
  selectedCart.value = items.value
    .filter((item) => item.isChecked)
    .map((item) => ({
      id: item.id,
      item_id: item.item_id,
      name: item.productName,
      image: item.productImage,
      size: item.selectedSize || item.size, // Adjust according to selection logic
      quantity: item.quantity,
      price: item.price,
      total: item.totalPrice,
      amount: item.totalPrice * 100,
      currency: "PHP",
    }));
  if (selectedCart.value.length > 0) {
    console.log(selectedCart.value);
    isProceedCheckout.value = !isProceedCheckout.value;
  }
};
let datas;
let defaultAddress;

const initiatePayment = async () => {
  paymentButtonText.value = "Process..";
  if (region.value || address.value || town.value || state.value || zip.value) {
    datas = {
      user_id: decode.value.id,
      region: region.value,
      address: address.value,
      town: town.value,
      state: state.value,
      zip: zip.value,
    };
  } else {
    defaultAddress = {
      region: otherRegion.value || userInfo.value[0].region,
      address: otherAddress.value || userInfo.value[0].address,
      town: otherTown.value || userInfo.value[0].town,
      state: otherState.value || userInfo.value[0].state,
      zip: otherZip.value || userInfo.value[0].zip,
    };
  }
  try {
    const selectedItems = items.value
      .filter((item) => item.isChecked)
      .map((item) => ({
        id:item.item_id,
        name: item.productName,
        image: item.productImage,
        size: item.selectedSize, // Adjust according to selection logic
        quantity: item.quantity,
        price: item.price,
        total: item.totalPrice,
        amount: item.price * 100,
        currency: "PHP",
      }));
    const selected = items.value
      .filter((item) => item.isChecked)
      .map((item) => ({
        item_id: item.item_id,
        size: item.selectedSize, // Adjust according to selection logic
        quantity: item.quantity,
      }));

    console.log("selected",selected);

    const totalAmount = selectedItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const selectedProductIds = selectedCart.value.map((item) => item.id);
    const {
      data: { clientSecret },
    } = await axios.post(
      "/api/create-payment-intent", // use https
      {
        amount: totalAmount,
        currency: "PHP",
      }
    );

    // Create Checkout Session
    const { data } = await axios.post(
      "/api/paymongo-checkout", //use https
      {
        clientSecret,
        items: selectedItems,
        id: decode.value.id,
        datas: datas,
        selectedId: selectedProductIds,
        selected: selected,
        defaultAddress: defaultAddress,
      }
    );

    // Redirect to checkout URL
    if (data.checkoutUrl) {
      paymentButtonText.value = "Proceed to Payment";
      window.location.href = data.checkoutUrl;
    } else {
      toast.error("Checkout URL is undefined");
      paymentButtonText.value = "Proceed to Payment";
    }
  } catch (error) {
    toast.error("Payment initiation failed:", error);
    paymentButtonText.value = "Proceed to Payment";
  }
};
</script>
<template>
  <div
    class="bg-gray-100 h-full px-4 md:px-6 lg:px-16 xl:px-24 w-full mt-24 py-6"
  >
    <div class="w-full">
      <div class="flex items-center justify-end">
        <!-- <div class="bg-white p-2 rounded-lg">
          <i class="fas fa-search mr-2"></i>
          <input type="text" class="outline-none" placeholder="Search item" />
        </div> -->
      </div>
      <h1 class="text-2xl font-semibold mb-4 mt-4">Shopping Cart</h1>
      <div class="w-full">
        <div class="w-full">
          <div
            class="bg-white rounded-lg shadow-md p-6 mb-4 min-w-[500px] overflow-x-auto"
          >
            <table class="w-full min-w-[500px] overflow-x-auto">
              <thead>
                <tr>
                  <th></th>
                  <th class="text-left font-semibold">Product Image</th>
                  <th class="text-left font-semibold">Product Name</th>
                  <th class="text-left font-semibold">Size & Quantity</th>
                  <th class="text-left font-semibold">Quantity</th>
                  <th class="text-left font-semibold">Price</th>
                  <th class="text-left font-semibold">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in items" :key="index">
                  <td class="py-4">
                    <input
                      type="checkbox"
                      v-model="item.isChecked"
                      class="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
                    />
                  </td>
                  <td class="py-4">
                    <div class="flex items-center">
                      <img
                        class="h-16 w-16 mr-4"
                        :src="`https://jewelry-backend-rh2w.onrender.com/images/${item.productImage}`"
                        alt="Product image"
                      />
                    </div>
                  </td>
                  <td class="py-4">{{ item.productName }} </td>
                  <td class="py-4 relative pr-2">
                    <select
                      v-model="item.selectedSize"
                      class="block mt-1 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option
                        v-for="size in availableSize"
                        :key="size"
                        :value="size"
                        :disabled="
                          (size === 'sm' && item.sm == 0) ||
                          (size === 'md' && item.md == 0) ||
                          (size === 'lg' && item.lg == 0)
                        "
                      >
                        {{
                          size === "sm"
                            ? `Qty: ${item.sm} , sm-(size: ${item.smInches})`
                            : size === "md"
                            ? `Qty: ${item.md} , md-(size: ${item.mdInches})`
                            : size === "lg"
                            ? `Qty: ${item.lg} , lg-(size: ${item.lgInches})`
                            : ""
                        }}
                      </option>
                    </select>
                  </td>

                  <td class="py-4">
                    <div class="flex items-center">
                      <button
                        @click="decreaseQuantity(item)"
                        class="border rounded-md py-2 px-4 mr-2"
                      >
                        -
                      </button>
                      <span class="text-center w-8">{{ item.quantity }}</span>
                      <button
                        @click="increaseQuantity(item)"
                        class="border rounded-md py-2 px-4 ml-2"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td class="py-4">{{ item.price.toFixed(2) }}</td>
                  <td class="py-4">{{ item.totalPrice.toFixed(2) }}</td>
                  <td class="py-4">
                    <i
                      @click="removeItem(item.id)"
                      class="fas fa-times bg-black px-2 py-1 rounded-sm text-white cursor-pointer"
                    ></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="font-semibold">Total: {{ totalSum.toFixed(2) }}</div>
          <div>
            <button
              @click="initiateCheckout"
              class="bg-primary text-white py-2 px-4 rounded-lg bg-black"
            >
              Proceed to Checkout
            </button>

            <!--  -->
            <div
              v-if="isProceedCheckout"
              class="w-screen min-h-screen flex bg-white items-center fixed top-0 left-0 z-40 justify-center bg-gray-50 dark:bg-gray-800 md:px-6 lg:px-16 xl:px-24"
            >
              <div class="relative w-full md:w-1/2 lg:w-1/2 xl:w-1/2">
                <div
                  class="px-8 py-6 text-left bg-white dark:bg-gray-900 rounded-xl xl:shadow-lg xl:shadow-lg max-h-[630px] overflow-y-auto"
                >
                  <div class="flex flex-col justify-center h-full select-none">
                    <div class="font-semibold text-2xl my-1 text-gray-500">
                      Checkout Details
                    </div>
                    <hr class="my-2" />
                    <div>
                      <div class="grid grid-cols-3">
                        <div class="text-gray-500 font-semibold my-2">
                          Product
                        </div>
                        <div class="text-gray-500 font-semibold my-2">
                          price
                        </div>
                        <div class="text-gray-500 font-semibold my-2">
                          Quantity
                        </div>
                      </div>
                      <div
                        v-for="(selected, index) in selectedCart"
                        :key="index"
                        class="grid grid-cols-3"
                      >
                        <div class="text-gray-500">{{ selected.name }}</div>
                        <div class="text-gray-500">
                          {{ selected.price.toFixed(2) }}
                        </div>
                        <div class="text-gray-500">{{ selected.quantity }}</div>
                      </div>
                      <div class="font-semibold text-gray-500 my-2">
                        Total Price: {{ totalSum.toFixed(2) }}
                      </div>
                    </div>
                    <hr class="my-2" />
                    <select
                      id="address-select"
                      v-model="selectedAddress"
                      class="block w-[200px] mt-1 border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="Shipping address">Shipping address</option>
                      <option value="Use other Address">
                        Use other Address
                      </option>
                    </select>
                    <form
                      class="w-full"
                      v-if="selectedAddress === 'Shipping address'"
                    >
                      <div
                        class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 my-2 flex items-center"
                      >
                        <div
                          class="w-full flex flex-col gap-2"
                          v-if="userInfo[0].firstname"
                        >
                          <label class="font-semibold text-xs text-gray-400"
                            >First Name</label
                          >
                          <input
                            disabled
                            type="text"
                            :value="`${userInfo[0].firstname}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder="John"
                          />
                        </div>

                        <div
                          class="w-full flex flex-col gap-2 my-2"
                          v-if="userInfo[0].lastname"
                        >
                          <label class="font-semibold text-xs text-gray-400"
                            >Last Name</label
                          >
                          <input
                            disabled
                            :value="`${userInfo[0].lastname}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <div
                        class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 my-2 flex items-center"
                      >
                        <div
                          class="w-full flex flex-col gap-2"
                          v-if="userInfo[0].email"
                        >
                          <label class="font-semibold text-xs text-gray-400"
                            >Email</label
                          >
                          <input
                            disabled
                            type="text"
                            :value="`${userInfo[0].email}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder="John"
                          />
                        </div>

                        <div
                          class="w-full flex flex-col gap-2 my-2"
                          v-if="userInfo[0].phonenumber"
                        >
                          <label class="font-semibold text-xs text-gray-400"
                            >Phone Number</label
                          >
                          <input
                            disabled
                            :value="`${userInfo[0].phonenumber}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <h1 class="font-semibold">Shipping Address</h1>
                      <div
                        class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 my-2 flex items-center"
                      >
                        <div class="w-full flex flex-col gap-2">
                          <label class="font-semibold text-xs text-gray-400"
                            >Country/Region</label
                          >
                          <input
                            v-if="!userInfo[0].region"
                            type="text"
                            v-model="region"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                          <input
                            v-else
                            disabled
                            type="text"
                            :value="`${userInfo[0].region}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                        </div>

                        <div class="w-full flex flex-col gap-2 my-2">
                          <label class="font-semibold text-xs text-gray-400"
                            >Street Address</label
                          >
                          <input
                            v-if="!userInfo[0].address"
                            type="text"
                            v-model="address"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                          <input
                            v-else
                            type="text"
                            disabled
                            :value="`${userInfo[0].address}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                        </div>
                      </div>
                      <div
                        class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 my-2 flex items-center"
                      >
                        <div class="w-full flex flex-col gap-2">
                          <label class="font-semibold text-xs text-gray-400"
                            >Town/City</label
                          >
                          <input
                            v-if="!userInfo[0].town"
                            type="text"
                            v-model="town"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                          <input
                            v-else
                            disabled
                            :value="`${userInfo[0].town}`"
                            type="text"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                        </div>

                        <div class="w-full flex flex-col gap-2 my-2">
                          <label class="font-semibold text-xs text-gray-400"
                            >State/Country</label
                          >
                          <input
                            v-if="!userInfo[0].state"
                            v-model="state"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                          <input
                            v-else
                            disabled
                            :value="`${userInfo[0].state}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                        </div>
                      </div>

                      <div class="w-full flex flex-col gap-2 my-2" v-if="true">
                        <label class="font-semibold text-xs text-gray-400"
                          >Post code/Zip</label
                        >
                        <input
                          v-if="!userInfo[0].zip"
                          type="text"
                          v-model="zip"
                          class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                          placeholder=""
                          required
                        />
                        <input
                          v-else
                          type="text"
                          disabled
                          :value="`${userInfo[0].zip}`"
                          class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                          placeholder=""
                          required
                        />
                      </div>

                      <div class="mt-5 text-center">
                        <div
                          @click="initiatePayment"
                          class="bg-primary text-white py-2 px-4 rounded-lg bg-black"
                        >
                          {{ paymentButtonText }}
                        </div>
                      </div>
                    </form>
                    <!-- other adrress -->
                    <form
                      class="w-full"
                      v-if="selectedAddress === 'Use other Address'"
                    >
                      <div
                        class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 my-2 flex items-center"
                      >
                        <div
                          class="w-full flex flex-col gap-2"
                          v-if="userInfo[0].firstname"
                        >
                          <label class="font-semibold text-xs text-gray-400"
                            >First Name</label
                          >
                          <input
                            disabled
                            type="text"
                            :value="`${userInfo[0].firstname}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder="John"
                          />
                        </div>

                        <div
                          class="w-full flex flex-col gap-2 my-2"
                          v-if="userInfo[0].lastname"
                        >
                          <label class="font-semibold text-xs text-gray-400"
                            >Last Name</label
                          >
                          <input
                            disabled
                            :value="`${userInfo[0].lastname}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <div
                        class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 my-2 flex items-center"
                      >
                        <div
                          class="w-full flex flex-col gap-2"
                          v-if="userInfo[0].email"
                        >
                          <label class="font-semibold text-xs text-gray-400"
                            >Email</label
                          >
                          <input
                            disabled
                            type="text"
                            :value="`${userInfo[0].email}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder="John"
                          />
                        </div>

                        <div
                          class="w-full flex flex-col gap-2 my-2"
                          v-if="userInfo[0].phonenumber"
                        >
                          <label class="font-semibold text-xs text-gray-400"
                            >Phone Number</label
                          >
                          <input
                            disabled
                            :value="`${userInfo[0].phonenumber}`"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <h1 class="font-semibold">Shipping Address</h1>
                      <div
                        class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 my-2 flex items-center"
                      >
                        <div class="w-full flex flex-col gap-2">
                          <label class="font-semibold text-xs text-gray-400"
                            >Country/Region</label
                          >
                          <input
                            type="text"
                            v-model="otherRegion"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                        </div>

                        <div class="w-full flex flex-col gap-2 my-2">
                          <label class="font-semibold text-xs text-gray-400"
                            >Street Address</label
                          >
                          <input
                            type="text"
                            v-model="otherAddress"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                        </div>
                      </div>
                      <div
                        class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 my-2 flex items-center"
                      >
                        <div class="w-full flex flex-col gap-2">
                          <label class="font-semibold text-xs text-gray-400"
                            >Town/City</label
                          >
                          <input
                            type="text"
                            v-model="otherTown"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                        </div>

                        <div class="w-full flex flex-col gap-2 my-2">
                          <label class="font-semibold text-xs text-gray-400"
                            >State/Country</label
                          >
                          <input
                            v-model="otherState"
                            class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                            placeholder=""
                            required
                          />
                        </div>
                      </div>

                      <div class="w-full flex flex-col gap-2 my-2" v-if="true">
                        <label class="font-semibold text-xs text-gray-400"
                          >Post code/Zip</label
                        >
                        <input
                          type="text"
                          v-model="otherZip"
                          class="border rounded-lg px-3 py-2 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                          placeholder=""
                          required
                        />
                      </div>

                      <div class="mt-5 text-center">
                        <div
                          @click="initiatePayment"
                          class="bg-primary text-white py-2 px-4 rounded-lg bg-black"
                        >
                          {{ paymentButtonText }}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <!--  -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
