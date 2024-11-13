
<script setup>
import axios from "../../../axios";
import { ref, onMounted, watch, onUnmounted } from "vue";
import { parseJwt } from "@/stores/jwt";
import { useToast } from "vue-toastification";

const toast = useToast();

const bgImage = ref([
  "../../src/assets/bgImage.png",
  "../../src/assets/bgImage2.png",
]);

const currentIndex = ref(bgImage.value.length - 1); // Start from the last image

// Set up interval for automatic decrement
let interval;
onMounted(() => {
  interval = setInterval(() => {
    currentIndex.value =
      currentIndex.value > 0
        ? currentIndex.value - 1
        : bgImage.value.length - 1;
  }, 5000);
});

onUnmounted(() => {
  clearInterval(interval);
});

const nextImage = () => {
  if (currentIndex.value != 1) {
    currentIndex.value++;
    console.log(currentIndex.value);
  }
};

// Function to go to the previous image
const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// Reactive variable to store data
const items = ref([]);
const userInfo = ref([]);
const reviews = ref([]);
const rating = ref([]);
const row = ref(10);
const more = ref(10);
const itemIndex = ref();
const selectedSizes = ref();
const quantity = ref(1);
const token = localStorage.getItem("token");
const decode = ref("");
const isShowDropdown = ref(false);
const starRate = ref(0);
const message = ref("");
const email = ref("");
const itemName = ref("");
const categories = ref([]);
const showCategory = ref(false);
const paymentButtonText = ref("Proceed to Payment");

const otherRegion = ref("");
const otherAddress = ref("");
const otherTown = ref("");
const otherState = ref("");
const otherZip = ref("");

const region = ref("");
const address = ref("");
const town = ref("");
const zip = ref("");
const state = ref("");
const selectedAddress = ref("Shipping address");

const dataForm = ref({
  name: "",
  image: "",
  size: "",
  quantity: "",
  price: "",
  total: "",
  user_id: "",
  item_id: "",
  amount: "",
  currency: "PHP", // Keep the currency as static
});

const isBuyNow = ref(false);

const BuyNow = async (id, item) => {
  
  if(selectedSizes.value){
isBuyNow.value = true;
  dataForm.value.name = item.productName;
  dataForm.value.image = item.productImage;
  dataForm.value.size = selectedSizes.value;
  dataForm.value.quantity = quantity.value;
  dataForm.value.price = item.price;
  dataForm.value.total = item.price * quantity.value;
  dataForm.value.user_id = decode.value.id;
  dataForm.value.item_id = id;
  dataForm.value.amount = item.price * 100;
  }else{
    toast.error("Size required!");
  }
};



let datas;
let defaultAddress;

const initiatePayment = async () => {
  paymentButtonText.value = "Process..";
  if (region.value || address.value || town.value || state.value || zip.value) {
    datas = {
      user_id: dataForm.value.user_id,
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
   
    const selected = [
      {
        item_id: dataForm.value.item_id,
        size: [dataForm.value.size],
        quantity: dataForm.value.quantity,
      },
    ];
    const selectedItems = [
      {
        name: dataForm.value.name,
        image: dataForm.value.image,
        size: dataForm.value.size,
        quantity: dataForm.value.quantity,
        price: dataForm.value.price,
        total: dataForm.value.total,
        amount: dataForm.value.amount,
        currency: "PHP",
      },
    ];

    const totalAmount = Math.round(dataForm.value.total * 100); 

    const selectedProductIds = [dataForm.value.item_id];
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

watch(itemName, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    refreshData();
  }
});

if (token) {
  try {
    decode.value = parseJwt(token);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    decode.value = {};
  }
}

const decrement = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const increment = () => {
  quantity.value++;
};

const refreshUserData = async () => {
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
      email.value = userInfo.value[0].email;
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
const refreshData = async () => {
  try {
    const response = await axios.get(
      `/api/get-item/1/${more.value}/${itemName.value}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      items.value = response.data.data;
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

const ratingData = async () => {
  try {
    const response = await axios.get(`/api/get-rate`);
    if (response.status === 200) {
      rating.value = response.data.data;
    }
  } catch (error) {
    if (error && error.response) {
      if (error.response.status === 403) {
        location.reload();
      }
    }
  }
};

const reviewData = async () => {
  try {
    const response = await axios.get(`/api/get-review`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.status === 200) {
      reviews.value = response.data.data;
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

const categoriesData = async () => {
  try {
    const response = await axios.get(`/api/get-category`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.status === 200) {
      categories.value = response.data.data;
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
const seeMore = () => {
  more.value = more.value + row.value;
  refreshData();
  console.log(more.value);
};

const openItem = (index) => {
  itemIndex.value = index;
};

const back = () => {
  itemIndex.value = false;
};
const dropdown = () => {
  isShowDropdown.value = !isShowDropdown.value;
};

const addToCart = async (id) => {
  if (token) {
    try {
      decode.value = parseJwt(token);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      decode = {};
    }
  }

  const data = {
    user_id: decode.value.id,
    item_id: id,
    quantity: quantity.value,
    size: selectedSizes.value,
  };

  try {
    const response = await axios.post(
      "/api/add-cart",
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      toast.success(response.data.data);
    }
  } catch (error) {
    if (error.response) {
      if (error.response.data.data) {
        toast.error(error.response.data.data);
      } else {
        toast.error(error.response.data.data);
      }
    }
  }
};
const rate = (num) => {
  if (num === 1) {
    starRate.value = 1;
    message.value = `⭐ -${email.value}: \n`;
  } else if (num === 2) {
    starRate.value = 2;
    message.value = `⭐⭐ -${email.value}: \n`;
  } else if (num === 3) {
    starRate.value = 3;
    message.value = `⭐⭐⭐ -${email.value}: \n`;
  } else if (num === 4) {
    starRate.value = 4;
    message.value = `⭐⭐⭐⭐ -${email.value}: \n`;
  } else if (num === 5) {
    starRate.value = 5;
    message.value = `⭐⭐⭐⭐⭐ -${email.value}: \n`;
  }
};

const review = async (item_id) => {
  const data = {
    user_id: decode.value.id,
    item_id: item_id,
    message: message.value,
    rate: starRate.value,
  };
  try {
    const response = await axios.post(
      "/api/add-review",
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      message.value = "";
      starRate.value = 0;
      reviewData();
      ratingData();
      toast.success(response.data.data);
    }
  } catch (error) {
    if (error.response) {
      if (error.response.data.data) {
        toast.error(error.response.data.data);
      } else {
        toast.error(error.response.data.data);
      }
    }
  }
};
function findRating(rating, id) {
  return rating.find((r) => r.item_id === id);
}

function reviewCheck(item_id, user_id) {
  let check = false; // Reset 'check' on every function call
  reviews.value.forEach((review) => {
    if (review.item_id === item_id && review.user_id === user_id) {
      check = true;
    }
  });
  return check; // Return the value of 'check' directly
}
// best item
const bestItems = ref([]);
const bestItemIndex = ref();

const openBestItem = (index) => {
  bestItemIndex.value = index;
};
const backBestItem = () => {
  bestItemIndex.value = false;
};
const bestItemData = async () => {
  try {
    const response = await axios.get(`/api/best-item`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.status === 200) {
      bestItems.value = response.data.data;
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

const category = () => {
  showCategory.value = true;
};

const searchCategory = (categories) => {
  itemName.value = categories;
  showCategory.value = false;
};
onMounted(() => {
  refreshData();
  reviewData();
  refreshUserData();
  ratingData();
  bestItemData();
  categoriesData();
});
</script>
<template>
  <main class="py-4 px-4 md:px-6 lg:px-16 xl:px-24 mt-24">
<!-- checkout -->

    <div
      v-if="isBuyNow"
      class="w-screen min-h-screen flex bg-white items-center fixed top-0 left-0 justify-center bg-gray-50 dark:bg-gray-800 md:px-6 lg:px-16 xl:px-24 z-50"
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
                <div class="text-gray-500 font-semibold my-2">Product</div>
                <div class="text-gray-500 font-semibold my-2">price</div>
                <div class="text-gray-500 font-semibold my-2">Quantity</div>
              </div>
            <div key="index" class="grid grid-cols-3">
                <div class="text-gray-500">{{dataForm.name}}</div>
                <div class="text-gray-500">{{dataForm.price.toFixed(2)}}</div>
                <div class="text-gray-500">{{dataForm.quantity}}</div>
              </div>
              <div class="font-semibold text-gray-500 my-2">Total Price: {{dataForm.price.toFixed(2)}}</div>
            </div>
            <hr class="my-2" />
            <select
              id="address-select"
              v-model="selectedAddress"
              class="block w-[200px] mt-1 border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="Shipping address">Shipping address</option>
              <option value="Use other Address">Use other Address</option>
            </select>
            <form class="w-full" v-if="selectedAddress === 'Shipping address'">
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
            <form class="w-full" v-if="selectedAddress === 'Use other Address'">
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
    <div class="flex items-center justify-between pb-6">
      <section class="flex items-center justify-center text-center">
        <nav class="flex items-center gap-2">
          <i class="fas fa-sliders text-[23px]" @click="category"></i>
        </nav>
      </section>
      <div class="bg-gray-100 p-2 rounded-lg">
        <i class="fas fa-search mr-4"></i>
        <input
          v-model="itemName"
          type="text"
          class="outline-none bg-gray-100"
          placeholder="Search by product name"
        />
      </div>
    </div>

    <!-- categories modal -->
    <div
      v-if="showCategory"
      class="shadow-lg border-r  px-4 fixed top-0 left-0 bg-white h-screen w-[300px] z-20"
    >
    <div class="flex items-end justify-end">
     <span class="px-3 py-2 text-[24px] cursor-pointer" @click="showCategory=false">&times;</span>
   </div>
      <nav
        class="w-full inline-block p-3 hover:bg-black hover:text-white text-white bg-black rounded-lg font-semibold my-1"
      >
        <i class="fas fa-list p-3 text-white rounded-md mr-2"></i>
        <a> Categories </a>
      </nav>
      <nav
        v-for="(category, index) in categories"
        :key="index"
        @click="searchCategory(category.categories)"
        class="w-full inline-block py-2 px-4 hover:bg-gray-50 rounded-lg font-semibold my-1 cursor-pointer"
      >
        <a> {{ category.categories }} </a>
      </nav>
    </div>
    <!--  -->

    <h1 class="text-2xl md:text-4xl lg:text-4xl xl:text-4xl font-semibold">
      What's New
    </h1>
    <div
      class="w-full h-full fixed top-0 left-0 z-40 bg-white flex items-center"
      v-if="items[itemIndex]"
    >
      <div class="w-full max-h-[700px] overflow-y-auto">
        <div class="px-6 mt-12">
          <button
            class="flex items-center text-primary hover:text-primary-dark border p-2 rounded-lg"
            @click="back()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div
          class="grid lg:grid-cols-2 xl:grid-cols-2 p-6 bg-background rounded-lg w-full"
        >
          <form @submit.prevent="review(items[itemIndex].id)">
            <img
              aria-hidden="true"
              alt="Product Image"
              :src="`https://jewelry-backend-rh2w.onrender.com/images/${items[itemIndex].productImage}`"
              class="w-full h-auto max-h-[400px] object-cover rounded-lg"
            />

            <div
              v-if="reviewCheck(items[itemIndex].id, decode.id) !== true"
              class="mt-4"
            >
              <div class="text-muted-foreground">
                Rate our products: {{ starRate !== 0 ? starRate : "" }}
              </div>
              <div class="grid grid-cols-1">
                <div class="flex">
                  <div
                    class="flex mr-4 hover:border-b"
                    :class="starRate === 1 ? 'border-b border-black' : ''"
                    @click="rate(1)"
                  >
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                  </div>
                  <div class="flex mr-4 hover:border-b" @click="rate(2)">
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                  </div>
                  <div class="flex mr-4 hover:border-b" @click="rate(3)">
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                  </div>
                  <div class="flex mr-4 hover:border-b" @click="rate(4)">
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                  </div>
                  <div class="flex mr-4 hover:border-b" @click="rate(5)">
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                  </div>
                </div>
              </div>

              <p class="text-muted-foreground mt-2">Feedback</p>

              <textarea
                v-model="message"
                name=""
                id=""
                class="w-full border rounded-lg h-[70px] p-2"
              ></textarea>
              <button class="bg-black text-white py-2 px-4 rounded-lg">
                Submit
              </button>
            </div>
            <div>
              <h3 class="text-lg font-semibold my-3">
                Reviews ({{
                  findRating(rating, items[itemIndex].id)
                    ? findRating(rating, items[itemIndex].id).average_rating
                    : "0.0"
                }})
              </h3>

              <div
                v-for="(review, index) in reviews"
                :key="index"
                v-show="items[itemIndex].id === review.item_id"
                class="border p-2 rounded-md my-1"
              >
                <td>{{ review.message }}</td>
              </div>
            </div>
          </form>

          <form
            @submit.prevent="addToCart(items[itemIndex].id)"
            class="lg:ml-6 xl:ml-6 w-full mt-12 lg:mt-0 xl:mt-0"
          >
            <h2 class="text-2xl font-bold">
              {{ items[itemIndex].productName }}
            </h2>
            <p class="text-muted-foreground mt-2">
              {{ items[itemIndex].description }}
            </p>
            <div class="mt-4">
              <label for="size" class="block text-sm font-medium"
                >Size Option:</label
              >
              <div class="relative inline-block text-left">
                <div
                  @click="dropdown"
                  class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Select Sizes
                  <svg
                    class="-mr-1 ml-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 01.707 1.707l-4 4a1 1 0 01-1.414 0l-4-4A1 1 0 012.293 4.293l4-4A1 1 0 0110 3zM2 6a1 1 0 011.707-.707l4 4A1 1 0 019 11H3.414L2 9.586 2 6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div
                  v-if="isShowDropdown"
                  class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                >
                  <div class="py-1">
                    <label
                      class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="radio"
                        v-model="selectedSizes"
                        value="sm"
                        class="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
                      />
                      <span class="ml-2">small - {{items[itemIndex].smInches}}</span>
                    </label>
                    <label
                      class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="radio"
                        v-model="selectedSizes"
                        value="md"
                        class="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
                      />
                      <span class="ml-2">medium - {{items[itemIndex].mdInches}}</span>
                    </label>
                    <label
                      class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="radio"
                        v-model="selectedSizes"
                        value="lg"
                        class="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
                      />
                      <span class="ml-2">large - {{items[itemIndex].lgInches}}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-2xl font-bold text-primary mt-2">
              {{ items[itemIndex].price.toFixed(2) }}
            </div>
            <div class="flex items-center mt-4">
              <div class="flex items-center overflow-hidden mx-2">
                <div
                  @click="decrement"
                  class="px-2 bg-black rounded-full text-white hover:bg-black"
                >
                  -
                </div>
                <input
                  type="number"
                  v-model="quantity"
                  min="1"
                  class="w-16 text-center outline-none overflow-hidden rounded-lg bg-white border py-1 mx-2"
                  disabled
                />
                <div
                  @click="increment"
                  class="px-2 bg-black rounded-full text-white hover:bg-black"
                >
                  +
                </div>
              </div>
              <button
                class="ml-4 bg-black text-white py-2 px-4 rounded-lg"
                type="submit"
              >
                Add to cart
              </button>
              <button
                class="ml-4 bg-black text-white py-2 px-4 rounded-lg"
                type="button"
               @click="BuyNow(items[itemIndex].id, items[itemIndex])"
              >
                Buy Now
              </button>
            </div>
            <div class="mt-6">
              <h3 class="text-lg font-semibold">Additional Information</h3>
              <ul class="list-disc list-inside mt-2">
                <li><strong>Color: </strong> {{ items[itemIndex].color }}</li>
                <li>
                  <strong>Gold Metal: </strong>{{ items[itemIndex].karat }}
                </li>
                <li>
                  <strong>Material: </strong>{{ items[itemIndex].material }}
                </li>
                <li>
                  <strong>Size Options: </strong
                  >{{ items[itemIndex].sm > 0 ? "small" : "" }},
                  {{ items[itemIndex].md > 0 ? "medium" : "" }},
                  {{ items[itemIndex].lg > 0 ? "large" : "" }}
                </li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- above is the modal of product -->
    <section class="mb-12">
      <div class="w-full py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-10">
          <div
            class="rounded overflow-hidden shadow-lg"
            v-for="(item, index) in items"
            :key="index"
            @click="openItem(index)"
          >
            <a href="#"></a>
            <div class="relative">
              <img
                class="w-full max-h-[300px] object-cover"
                :src="`https://jewelry-backend-rh2w.onrender.com/images/${item.productImage}`"
                alt="Sunset in the mountains"
              />
              <div
                class="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25"
              ></div>
            </div>
            <div class="px-6 py-4">
              <a
                href="#"
                class="font-semibold text-lg inline-block hover:text-indigo-600 transition duration-500 ease-in-out"
                >{{ item.productName }}</a
              >
              <p class="text-gray-500 text-sm">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
      <p class="text-center">
        <span
          @click="seeMore"
          class="hover:text-gray-400 cursor-pointer border p-3 rounded-lg"
          >See more</span
        >
      </p>
    </section>

    <!-- modal for best seller -->
    <div
      class="w-full h-full fixed top-0 left-0 z-40 bg-white flex items-center"
      v-if="bestItems[bestItemIndex]"
    >
      <div class="w-full max-h-[700px] overflow-y-auto">
        <div class="px-6 mt-12">
          <button
            class="flex items-center text-primary hover:text-primary-dark border p-2 rounded-lg"
            @click="backBestItem()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div
          class="grid lg:grid-cols-2 xl:grid-cols-2 p-6 bg-background rounded-lg w-full"
        >
          <form @submit.prevent="review(bestItems[bestItemIndex].id)">
            <img
              aria-hidden="true"
              alt="Product Image"
              :src="`https://jewelry-backend-rh2w.onrender.com/images/${bestItems[bestItemIndex].productImage}`"
              class="w-full h-auto max-h-[400px] object-cover rounded-lg"
            />

            <div
              v-if="
                reviewCheck(bestItems[bestItemIndex].id, decode.id) !== true
              "
              class="mt-4"
            >
              <div class="text-muted-foreground">
                Rate our products: {{ starRate !== 0 ? starRate : "" }}
              </div>
              <div class="grid grid-cols-1">
                <div class="flex">
                  <div
                    class="flex mr-4 hover:border-b"
                    :class="starRate === 1 ? 'border-b border-black' : ''"
                    @click="rate(1)"
                  >
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                  </div>
                  <div class="flex mr-4 hover:border-b" @click="rate(2)">
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                  </div>
                  <div class="flex mr-4 hover:border-b" @click="rate(3)">
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                  </div>
                  <div class="flex mr-4 hover:border-b" @click="rate(4)">
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                  </div>
                  <div class="flex mr-4 hover:border-b" @click="rate(5)">
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                    <span class="text-yellow-500 cursor-pointer">⭐</span>
                  </div>
                </div>
              </div>

              <p class="text-muted-foreground mt-2">Feedback</p>

              <textarea
                v-model="message"
                name=""
                id=""
                class="w-full border rounded-lg h-[70px] p-2"
              ></textarea>
              <button class="bg-black text-white py-2 px-4 rounded-lg">
                Submit
              </button>
            </div>
            <div>
              <h3 class="text-lg font-semibold my-3">
                Reviews ({{
                  findRating(rating, bestItems[bestItemIndex].id)
                    ? findRating(rating, bestItems[bestItemIndex].id)
                        .average_rating
                    : "0.0"
                }})
              </h3>

              <div
                v-for="(review, index) in reviews"
                :key="index"
                v-show="bestItems[bestItemIndex].id === review.item_id"
                class="border p-2 rounded-md my-1"
              >
                <td>{{ review.message }}</td>
              </div>
            </div>
          </form>

          <form
            @submit.prevent="addToCart(bestItems[bestItemIndex].id)"
            class="lg:ml-6 xl:ml-6 w-full mt-12 lg:mt-0 xl:mt-0"
          >
            <h2 class="text-2xl font-bold">
              {{ bestItems[bestItemIndex].productName }}
            </h2>
            <p class="text-muted-foreground mt-2">
              {{ bestItems[bestItemIndex].description }}
            </p>
            <div class="mt-4">
              <label for="size" class="block text-sm font-medium"
                >Size Option:</label
              >
              <div class="relative inline-block text-left">
                <div
                  @click="dropdown"
                  class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Select Sizes
                  <svg
                    class="-mr-1 ml-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 01.707 1.707l-4 4a1 1 0 01-1.414 0l-4-4A1 1 0 012.293 4.293l4-4A1 1 0 0110 3zM2 6a1 1 0 011.707-.707l4 4A1 1 0 019 11H3.414L2 9.586 2 6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div
                  v-if="isShowDropdown"
                  class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                >
                  <div class="py-1">
                    <label
                      class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="radio"
                        v-model="selectedSizes"
                        value="sm"
                        class="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
                      />
                      <span class="ml-2">small - {{bestItems[bestItemIndex].smInches}}</span>
                    </label>
                    <label
                      class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="radio"
                        v-model="selectedSizes"
                        value="md"
                        class="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
                      />
                      <span class="ml-2">medium - {{bestItems[bestItemIndex].mdInches}}</span>
                    </label>
                    <label
                      class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="radio"
                        v-model="selectedSizes"
                        value="lg"
                        class="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
                      />
                      <span class="ml-2">large - {{bestItems[bestItemIndex].lgInches}}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-2xl font-bold text-primary mt-2">
              {{ bestItems[bestItemIndex].price.toFixed(2) }}
            </div>
            <div class="flex items-center mt-4">
              <div class="flex items-center overflow-hidden mx-2">
                <div
                  @click="decrement"
                  class="px-2 bg-black rounded-full text-white hover:bg-black"
                >
                  -
                </div>
                <input
                  type="number"
                  v-model="quantity"
                  min="1"
                  class="w-16 text-center outline-none overflow-hidden rounded-lg bg-white border py-1 mx-2"
                  disabled
                />
                <div
                  @click="increment"
                  class="px-2 bg-black rounded-full text-white hover:bg-black"
                >
                  +
                </div>
              </div>
              <button
                class="ml-4 bg-black text-white py-2 px-4 rounded-lg"
                type="submit"
              >
                Add to cart
              </button>
               <button
                class="ml-4 bg-black text-white py-2 px-4 rounded-lg"
                type="button"
               @click="BuyNow(bestItems[bestItemIndex].id, bestItems[bestItemIndex])"
              >
                Buy Now
              </button>
            </div>
            <div class="mt-6">
              <h3 class="text-lg font-semibold">Additional Information</h3>
              <ul class="list-disc list-inside mt-2">
                <li>
                  <strong>Color: </strong> {{ bestItems[bestItemIndex].color }}
                </li>
                <li>
                  <strong>Gold Metal: </strong
                  >{{ bestItems[bestItemIndex].karat }}
                </li>
                <li>
                  <strong>Material: </strong
                  >{{ bestItems[bestItemIndex].material }}
                </li>
                <li>
                  <strong>Size Options: </strong
                  >{{ bestItems[bestItemIndex].sm > 0 ? "small" : "" }},
                  {{ bestItems[bestItemIndex].md > 0 ? "medium" : "" }},
                  {{ bestItems[bestItemIndex].lg > 0 ? "large" : "" }}
                </li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!--  -->
    <h1 class="text-2xl md:text-4xl lg:text-4xl xl:text-4xl font-semibold">
      Best Sellers
    </h1>
    <section>
      <div class="w-full py-12 w-full">
        <div
          class="w-full gap-3 grid-cols-1 grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
        >
          <div
            class="rounded overflow-hidden shadow-lg"
            v-for="(item, index) in bestItems"
            :key="index"
            @click="openBestItem(index)"
          >
            <a href="#"></a>
            <div class="relative">
              <a href="#">
                <img
                  class="w-full"
                  :src="`https://jewelry-backend-rh2w.onrender.com/images/${item.productImage}`"
                  alt="Sunset in the mountains"
                />
                <div
                  class="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25"
                ></div>
              </a>
            </div>
            <div class="px-6 py-4">
              <a
                href="#"
                class="font-semibold text-lg inline-block hover:text-indigo-600 transition duration-500 ease-in-out"
                >{{ item.productName }}</a
              >
              <p class="text-gray-500 text-sm">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
