<template>
  <div class="max-w-4xl mx-auto p-6 bg-background rounded-lg shadow-md mt-32">
    <h1 class="text-2xl font-bold text-foreground mb-4">
      Cash Installment Plan
    </h1>
    <p class="text-muted-foreground mb-6">pay at your own terms</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label class="block text-muted-foreground">First Name</label>
        <input
          v-model="form.firstName"
          type="text"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter your first name"
        />
      </div>
      <div>
        <label class="block text-muted-foreground">Last Name</label>
        <input
          v-model="form.lastName"
          type="text"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter your last name"
        />
      </div>
      <div>
        <label class="block text-muted-foreground">Country/Region</label>
        <input
          v-model="form.country"
          type="text"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter your country/region"
        />
      </div>
      <div>
        <label class="block text-muted-foreground">Street Address</label>
        <input
          v-model="form.streetAddress"
          type="text"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter your street address"
        />
      </div>
      <div>
        <label class="block text-muted-foreground">Town/City</label>
        <input
          v-model="form.townCity"
          type="text"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter your town/city"
        />
      </div>
      <div>
        <label class="block text-muted-foreground">State/County</label>
        <input
          v-model="form.stateCounty"
          type="text"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter your state/county"
        />
      </div>
      <div>
        <label class="block text-muted-foreground">PostCode/ZIP</label>
        <input
          v-model="form.postcode"
          type="text"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter your postcode/ZIP"
        />
      </div>
      <div>
        <label class="block text-muted-foreground">Phone Number</label>
        <input
          v-model="form.phoneNumber"
          type="text"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter your phone number"
        />
      </div>
      <div>
        <label class="block text-muted-foreground">Email Address</label>
        <input
          v-model="form.email"
          type="email"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter your email address"
        />
      </div>
    </div>

    <h2 class="text-xl font-bold text-foreground mb-4">PRODUCT DETAILS</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label class="block text-muted-foreground">Item Name</label>
        <select
          v-model="form.itemName"
          class="mt-1 p-2 border border-border rounded w-full"
        >
          <option
            v-for="(item, index) in items"
            :key="index"
            :value="item.productName"
          >
            {{ item.productName }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-muted-foreground">Size</label>
        <select
          v-model="form.size"
          class="mt-1 p-2 border border-border rounded w-full"
        >
          <option value="sm">Small</option>
          <option value="sm">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>
      <div>
        <label class="block text-muted-foreground">Color</label>
         <input
         v-model="form.color"
          type="text"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter color"
        />
      </div>
      <div>
        <label class="block text-muted-foreground">Karat</label>
        <input
          v-model="form.karat"
          type="text"
          class="mt-1 p-2 border border-border rounded w-full"
          placeholder="Enter karat"
        />
      </div>
      <div class="col-span-2">
        <label class="block text-muted-foreground"
          >Upload a photo of jewelry you want to purchase</label
        >
        <input
          type="file"
          @change="handleFileUpload"
          class="mt-1 p-2 border border-border rounded w-full"
        />
      </div>
    </div>

    <div class="flex items-center mb-4">
      <input v-model="form.agreeTerms" type="checkbox" class="mr-2" />
      <span class="text-muted-foreground"
        >Yes, I agree with the Terms and Conditions</span
      >
    </div>

    <button
      @click="submitForm"
      class="bg-black text-white hover:bg-black p-2 rounded-lg w-full"
    >
      SEND
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../../../axios";
import { useToast } from 'vue-toastification';

const toast = useToast();

const form = ref({
  firstName: "",
  lastName: "",
  country: "",
  streetAddress: "",
  townCity: "",
  stateCounty: "",
  postcode: "",
  phoneNumber: "",
  email: "",
  itemName: "",
  size: "",
  color: "Yellow Gold",
  karat: "",
  agreeTerms: false,
});

const items = ref([]);

const refreshData = async () => {
  try {
    const response = await axios.get(
      `/api/get-item/1/100`,
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
const imageFile = ref(null);

const handleFileUpload = (event) => {
  imageFile.value = event.target.files[0];
};

const submitForm = async () => {
  const formData = new FormData();
  for (const key in form.value) {
    formData.append(key, form.value[key]);
  }
  if (imageFile.value) {
    formData.append("image_path", imageFile.value);
  }

  try {
    const response = await axios.post(
      "/api/installment-plan",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      console.log("Form submitted successfully", response.data);
          for (const key in form.value) {
        form.value[key] = key === 'agreeTerms' ? false : "";
      }
      // Clear file input
      imageFile.value = null;

      // Reset file input element
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
      toast.success("Submitted successfully");
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.data) {
      toast.error(error.response.data.data); // Show error message
    } else {
      toast.error('An error occurred: ' + error.message); // Show generic error message
    }
  }
};
onMounted(refreshData);
</script>
