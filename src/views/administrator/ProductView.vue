<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "../../../axios";
import { useToast } from "vue-toastification";

const toast = useToast();

// Reactive state for the modal, form data, table data, and selected item
const showModal = ref(false);
const deleteModal = ref(false);
const deleteID = ref();
const page = ref(1);
const itemName = ref("");
const id = ref("");
const showModalEdit = ref(false);
const showDetailModal = ref(false); // For view details modal

watch(itemName, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    fetchData();
  }
});
const formData = ref({
  productImage: null,
  productName: "",
  price: 0,
  categories: "",
  description: "",
  color: "",
  karat: "",
  material: "",
  sm: 0, // Individual stock fields
  md: 0,
  lg: 0,
  smInches: "",
  mdInches: "",
  lgInches: "",
});
const formDataEdit = ref({
  productImage: null,
  productName: "",
  price: 0,
  categories: "",
  description: "",
  color: "",
  karat: "",
  material: "",
  sm: 0, // Individual stock fields
  md: 0,
  lg: 0,
  smInches: "",
  mdInches: "",
  lgInches: "",
});
const tableData = ref([]); // For holding the table data
const selectedItem = ref(null); // For holding the selected item's details

const next = () => {
  console.log(tableData.value.length);
  if (tableData.value.length > 1) {
    page.value++;
    fetchData();
  }
};
const prev = () => {
  if (page.value > 1) {
    page.value--;
    fetchData();
  }
};

// Fetch data on component mount
async function fetchData() {
  try {
    const response = await axios.get(
      `/api/get-item/${page.value}/10/${itemName.value}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    ); // Adjust page and limit as needed
    if (response.status === 200) {
      tableData.value = response.data.data;
    }
  } catch (error) {
    console.error("Error fetching data:", error);

    page.value--;
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
      `/api/delete-item/${deleteID.value}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      toast.success("Success: Product deleted successfully!");
      fetchData(); // Refresh table data after successful submission
    } else {
      toast.error("Unexpected status code: " + response.status);
    }
  } catch (error) {
    if (error.response) {
      // Handle specific status codes
      const errorMessage = error.response.data.message;
      toast.error(errorMessage);
    } else if (error.request) {
      // No response received
      toast.error("No response received from server.");
    } else {
      // Error setting up request
      toast.error("Error: " + error.message);
    }
  } finally {
    cancelDelete();
  }
};
// Methods to handle modals
function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
  showDetailModal.value = false; // Close detail modal as well
}
function closeModalEdit() {
  showModalEdit.value = false;
}

// Method to handle file input change
function handleFileChange(event) {
  const file = event.target.files[0];
  formData.value.productImage = file;
}

function handleFileChangeEdit(event) {
  const file = event.target.files[0];
  formDataEdit.value.productImage = file;
}

// Method to handle form submission
async function handleSubmit() {
  const data = new FormData();
  data.append("productImage", formData.value.productImage);
  data.append("productName", formData.value.productName);
  data.append("price", formData.value.price);
  data.append("categories", formData.value.categories);
  data.append("description", formData.value.description);
  data.append("color", formData.value.color);
  data.append("karat", formData.value.karat);
  data.append("material", formData.value.material);
  data.append("sm", formData.value.sm);
  data.append("md", formData.value.md);
  data.append("lg", formData.value.lg);
  data.append("smInches", formData.value.smInches);
  data.append("mdInches", formData.value.mdInches);
  data.append("lgInches", formData.value.lgInches);

  try {
    const response = await axios.post(
      "/api/add-item",
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200) {
      toast.success("Success: Product added successfully!");
      fetchData(); // Refresh table data after successful submission
    } else {
      toast.error("Unexpected status code: " + response.status);
    }
  } catch (error) {
    if (error.response) {
      // Handle specific status codes
      const errorMessage = error.response.data.message;
      toast.error(errorMessage);
    } else if (error.request) {
      // No response received
      toast.error("No response received from server.");
    } else {
      // Error setting up request
      toast.error("Error: " + error.message);
    }
  } finally {
    closeModal();
  }
}

async function handleSubmitEdit() {
  const data = new FormData();
  data.append("productImage", formDataEdit.value.productImage);
  data.append("productName", formDataEdit.value.productName);
  data.append("price", formDataEdit.value.price);
  data.append("categories", formDataEdit.value.categories);
  data.append("description", formDataEdit.value.description);
  data.append("color", formDataEdit.value.color);
  data.append("karat", formDataEdit.value.karat);
  data.append("material", formDataEdit.value.material);
  data.append("sm", formDataEdit.value.sm);
  data.append("md", formDataEdit.value.md);
  data.append("lg", formDataEdit.value.lg);
  data.append("smInches", formDataEdit.value.smInches);
  data.append("mdInches", formDataEdit.value.mdInches);
  data.append("lgInches", formDataEdit.value.lgInches);

  try {
    const response = await axios.put(
      `/api/edit-item/${id.value}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200) {
      toast.success("Success: Product edit successfully!");
      fetchData(); // Refresh table data after successful submission
    } else {
      toast.error("Unexpected status code: " + response.status);
    }
  } catch (error) {
    if (error.response) {
      // Handle specific status codes
      const errorMessage = error.response.data.message;
      toast.error(errorMessage);
    } else if (error.request) {
      // No response received
      toast.error("No response received from server.");
    } else {
      // Error setting up request
      toast.error("Error: " + error.message);
    }
  } finally {
    closeModalEdit();
  }
}

// Method to open the view details modal
function viewDetails(item) {
  selectedItem.value = item;
  showDetailModal.value = true;
}

function editDetails(item) {
  showModalEdit.value = true;
  id.value = item.id;
  formDataEdit.value.productImage = item.productImage;
  formDataEdit.value.productName = item.productName;
  formDataEdit.value.price = item.price;
  formDataEdit.value.categories = item.categories;
  formDataEdit.value.description = item.description;
  formDataEdit.value.color = item.color;
  formDataEdit.value.karat = item.karat;
  formDataEdit.value.material = item.material;
  formDataEdit.value.sm = item.sm;
  formDataEdit.value.md = item.md;
  formDataEdit.value.lg = item.lg;
  formDataEdit.value.smInches = item.smInches;
  formDataEdit.value.mdInches = item.mdInches;
  formDataEdit.value.lgInches = item.lgInches;
}
</script>
<template>
  <div class="h-full px-4 md:px-6 w-full mt-24 py-6">
    <div class="w-full shadow-lg p-4 rounded-md border">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="openModal"
          class="p-3 border rounded-lg bg-black text-white"
        >
          Add product
        </button>
        <div class="bg-white p-2 rounded-lg border">
          <i class="fas fa-search mr-2"></i>
          <input
            v-model="itemName"
            type="text"
            class="outline-none"
            placeholder="Search by product name"
          />
        </div>
      </div>

      <div class="w-full">
        <div class="bg-white p-6 mb-4 border-y max-h-[350px] overflow-y-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th class="text-left font-semibold">Product Image</th>
                <th class="text-left font-semibold">Product Name</th>
                <th class="text-left font-semibold">Price</th>
                <th class="text-left font-semibold">Categories</th>
                <th class="text-left font-semibold">Description</th>
                <th class="text-left font-semibold">Edit</th>
                <th class="text-left font-semibold">View</th>
                <th class="text-left font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in tableData" :key="item.id">
                <td>
                  <img
                    :src="`https://jewelry-backend-rh2w.onrender.com/images/${item.productImage}`"
                    alt="Product Image"
                    class="w-16 h-16 object-cover"
                  />
                </td>
                <td>{{ item.productName }}</td>
                <td>{{ item.price.toFixed(2) }}</td>
                <td>{{ item.categories }}</td>
                <td>{{ item.description }}</td>
                <td>
                  <button @click="editDetails(item)">
                    <span
                      ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </span>
                  </button>
                </td>
                <td>
                  <button @click="viewDetails(item)">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </span>
                  </button>
                </td>
                <td>
                  <button @click="deleteSubmit(item.id)">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </span>
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
              Prev</button
            ><button class="px-4">{{ page }}</button
            ><button
              class="p-2 border rounded-md bg-black text-white"
              @click="next"
            >
              Next
            </button>
          </section>
        </div>
      </div>
    </div>

    <!-- Modal for adding a new product -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-30"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 lg:w-2/3 max-h-[600px] overflow-y-auto"
      >
        <h2 class="text-xl font-semibold mb-4">Add New Product</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="space-y-4">
            <div>
              <label class="block font-semibold">Product Image</label>
              <input
                type="file"
                class="border p-2 rounded-lg w-full"
                @change="handleFileChange"
              />
            </div>
            <div>
              <label class="block font-semibold">Product Name</label>
              <input
                type="text"
                class="border p-2 rounded-lg w-full"
                v-model="formData.productName"
              />
            </div>
            <div>
              <label class="block font-semibold">Price</label>
              <input
                type="number"
                class="border p-2 rounded-lg w-full"
                v-model="formData.price"
              />
            </div>

            <div>
              <label class="block font-semibold">Categories</label>
              <input
                type="text"
                class="border p-2 rounded-lg w-full"
                v-model="formData.categories"
              />
            </div>
            <div>
              <label class="block font-semibold">Description</label>
              <textarea
                class="border p-2 rounded-lg w-full"
                v-model="formData.description"
              ></textarea>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block font-semibold">Color</label>
              <input
                type="text"
                class="border p-2 rounded-lg w-full"
                v-model="formData.color"
              />
            </div>
            <div>
              <label class="block font-semibold">Karat</label>
              <input
                type="text"
                class="border p-2 rounded-lg w-full"
                v-model="formData.karat"
              />
            </div>

            <div>
              <label class="block font-semibold">Material</label>
              <input
                type="text"
                class="border p-2 rounded-lg w-full"
                v-model="formData.material"
              />
            </div>
            <h1 class="block font-semibold">Stock & Size</h1>
            <section class="flex grid grid-cols-3 gap-2">
              <div>
                <label class="block font-semibold">Small</label>
                <div class="flex gap-2">
                  <input
                    type="number"
                    class="border p-2 rounded-lg w-full"
                    v-model="formData.sm"
                  />
                  <input
                    type="text"
                    class="border p-2 rounded-lg w-full"
                    placeholder="14–16 inches"
                    v-model="formData.smInches"
                  />
                </div>
              </div>
              <div>
                <label class="block font-semibold">Medium</label>
                <div class="flex gap-2">
                  <input
                    type="number"
                    class="border p-2 rounded-lg w-full"
                    v-model="formData.md"
                  />
                  <input
                    type="text"
                    class="border p-2 rounded-lg w-full"
                    placeholder="14–16 inches"
                    v-model="formData.mdInches"
                  />
                </div>
              </div>

              <div>
                <label class="block font-semibold">Large</label>
                <div class="flex gap-2">
                  <input
                    type="number"
                    class="border p-2 rounded-lg w-full"
                    v-model="formData.lg"
                  />
                  <input
                    type="text"
                    class="border p-2 rounded-lg w-full"
                    placeholder="14–16 inches"
                    v-model="formData.lgInches"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button
            @click="closeModal"
            class="bg-white text-black p-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            class="bg-black text-white p-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- edit modal -->
    <div
      v-if="showModalEdit"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-30"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 lg:w-2/3 max-h-[600px] overflow-y-auto"
      >
        <h2 class="text-xl font-semibold mb-4">Edit Product</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="space-y-4">
            <div>
              <label class="block font-semibold">Product Image</label>
              <input
                type="file"
                class="border p-2 rounded-lg w-full"
                @change="handleFileChangeEdit"
              />
            </div>
            <div>
              <label class="block font-semibold">Product Name</label>
              <input
                type="text"
                class="border p-2 rounded-lg w-full"
                v-model="formDataEdit.productName"
              />
            </div>
            <div>
              <label class="block font-semibold">Price</label>
              <input
                type="number"
                class="border p-2 rounded-lg w-full"
                v-model="formDataEdit.price"
              />
            </div>

            <div>
              <label class="block font-semibold">Categories</label>
              <input
                type="text"
                class="border p-2 rounded-lg w-full"
                v-model="formDataEdit.categories"
              />
            </div>
            <div>
              <label class="block font-semibold">Description</label>
              <textarea
                class="border p-2 rounded-lg w-full"
                v-model="formDataEdit.description"
              ></textarea>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block font-semibold">Color</label>
              <input
                type="text"
                class="border p-2 rounded-lg w-full"
                v-model="formDataEdit.color"
              />
            </div>
            <div>
              <label class="block font-semibold">Karat</label>
              <input
                type="text"
                class="border p-2 rounded-lg w-full"
                v-model="formDataEdit.karat"
              />
            </div>

            <div>
              <label class="block font-semibold">Material</label>
              <input
                type="text"
                class="border p-2 rounded-lg w-full"
                v-model="formDataEdit.material"
              />
            </div>
              <h1 class="block font-semibold">Stock & Size</h1>
            <section class="flex grid grid-cols-3 gap-2">
              <div>
                <label class="block font-semibold">Small</label>
                <div class="flex gap-2">
                  <input
                    type="number"
                    class="border p-2 rounded-lg w-full"
                    v-model="formDataEdit.sm"
                  />
                  <input
                    type="text"
                    class="border p-2 rounded-lg w-full"
                    placeholder="14–16 inches"
                    v-model="formDataEdit.smInches"
                  />
                </div>
              </div>
              <div>
                <label class="block font-semibold">Medium</label>
                <div class="flex gap-2">
                  <input
                    type="number"
                    class="border p-2 rounded-lg w-full"
                    v-model="formDataEdit.md"
                  />
                  <input
                    type="text"
                    class="border p-2 rounded-lg w-full"
                    placeholder="14–16 inches"
                    v-model="formDataEdit.mdInches"
                  />
                </div>
              </div>

              <div>
                <label class="block font-semibold">Large</label>
                <div class="flex gap-2">
                  <input
                    type="number"
                    class="border p-2 rounded-lg w-full"
                    v-model="formDataEdit.lg"
                  />
                  <input
                    type="text"
                    class="border p-2 rounded-lg w-full"
                    placeholder="14–16 inches"
                    v-model="formDataEdit.lgInches"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button
            @click="closeModalEdit"
            class="bg-white text-black p-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            @click="handleSubmitEdit"
            class="bg-black text-white p-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    <!-- delete -->
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
            Are you sure you want to delete this product?
          </h3>
          <a
            @click="handleDelete()"
            class="text-white bg-red-600 cursor-pointer hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2"
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
    <!-- Modal for viewing details -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-30"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 lg:w-2/3 max-h-[600px] overflow-y-auto"
      >
        <h2 class="text-xl font-semibold mb-4">Product Details</h2>
        <div class="grid lg:grid-cols-2 xl:grid-cols-2 gap-4">
          <section>
            <div>
              <img
                :src="`https://jewelry-backend-rh2w.onrender.com/images/${selectedItem.productImage}`"
                alt="Product Image"
                class="w-full h-full object-cover rounded-lg"
              />
            </div>
          </section>
          <section class="gap-2">
            <div>
              <strong>Product Name:</strong> {{ selectedItem.productName }}
            </div>
            <div>
              <strong>Price:</strong> {{ selectedItem.price.toFixed(2) }}
            </div>
            <div>
              <strong>Categories:</strong> {{ selectedItem.categories }}
            </div>

            <div>
              <strong>Description:</strong> {{ selectedItem.description }}
            </div>
            <div><strong>Color:</strong> {{ selectedItem.color }}</div>
            <div><strong>Karat:</strong> {{ selectedItem.karat }}</div>
            <div><strong>Material:</strong> {{ selectedItem.material }}</div>
            <div><strong>Stock (S):</strong> {{ selectedItem.sm }} - {{ selectedItem.smInches}}</div>
            <div><strong>Stock (M):</strong> {{ selectedItem.md }} - {{ selectedItem.mdInches}}</div>
            <div><strong>Stock (L):</strong> {{ selectedItem.lg }} - {{ selectedItem.lgInches}}</div>
            
            <div>
              <strong>Created:</strong>
              {{ new Date(selectedItem.created).toLocaleDateString() }}
            </div>
            <div>
              <strong>Updated:</strong>
              {{ new Date(selectedItem.updated).toLocaleDateString() }}
            </div>
          </section>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            @click="showDetailModal = false"
            class="bg-gray-300 text-gray-800 p-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
