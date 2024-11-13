<script setup>
import { onMounted, ref } from "vue";
import { parseJwt } from "@/stores/jwt";
import axios from "../../../axios";
import { useToast } from 'vue-toastification';

const toast = useToast();

const userInfo = ref([]);
const decode = ref();
const token = localStorage.getItem("token");
const firstname = ref('');
const lastname = ref('');
const email = ref('');
const phonenumber = ref('');
const gender = ref('');
const birth = ref('');
const password = ref('');
const newpassword = ref('');
const confirmpassword = ref('');
const isEditing = ref(false);
const buttonText = ref('Edit Profile');

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
      `/api/account/${decode.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      userInfo.value = response.data.data;
      firstname.value = userInfo.value[0].firstname;
      lastname.value = userInfo.value[0].lastname;
      email.value = userInfo.value[0].email;
      phonenumber.value = userInfo.value[0].phonenumber;
      gender.value = userInfo.value[0].gender;
      birth.value = userInfo.value[0].birth;
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

const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
  buttonText.value = isEditing.value ? 'Save Changes' : 'Edit Profile';
};

const saveChanges = async () => {
  try {
    buttonText.value = 'Saving...';

    const response = await axios.put(
      `/api/account/${decode.value.id}`,
      {
        firstname: firstname.value,
        lastname: lastname.value,
        email: email.value,
        phonenumber: phonenumber.value,
        gender: gender.value,
        birth: birth.value,
        password: password.value,
        newpassword: newpassword.value,
        confirmpassword: confirmpassword.value
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // Handle success response
    if (response.status === 200) {
      toast.success(response.data.data); // Show success message
      refreshData();
      buttonText.value = 'Edit Profile';
      isEditing.value = false;
    }
  } catch (error) {
    buttonText.value = 'Edit Profile';

    // Handle error response
    if (error.response && error.response.data && error.response.data.data) {
      toast.error(error.response.data.data); // Show error message
    } else {
      toast.error('An error occurred: ' + error.message); // Show generic error message
    }
  }
};

onMounted(refreshData);
</script>

<template>
  <div
    class="h-full px-4 md:px-6 lg:px-16 xl:px-24 w-full mt-24 py-6 max-h-[500px] overflow-y-auto"
  >
    <div class="w-full">
   
      <h1 class="text-2xl font-semibold mb-4">My Account</h1>
      <p>Account details</p>
      <div class="flex items-center justify-center">
        <div
          class="w-full lg:w-2/3 xl:w-2/3 min-h-96 px-8 py-6 mt-4 text-left bg-white dark:bg-gray-900 rounded-xl shadow-lg"
        >
          <div
            class="flex flex-col justify-center items-center h-full select-none"
          >
            <div
              class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2"
            >
              <div class="w-full flex flex-col gap-2">
                <label class="font-semibold text-xs text-gray-400"
                  >First Name</label
                >
                <input
                  v-model="firstname"
                  :disabled="!isEditing"
                  class="border rounded-lg px-3 py-2 mb-5 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                  placeholder="First Name"
                />
              </div>
              <div class="w-full flex flex-col gap-2">
                <label class="font-semibold text-xs text-gray-400"
                  >Last Name</label
                >
                <input
                  v-model="lastname"
                  :disabled="!isEditing"
                  class="border rounded-lg px-3 py-2 mb-5 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                  placeholder="Last Name"
                />
              </div>
            </div>
          </div>
          <div
            class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2"
          >
            <div class="w-full flex flex-col gap-2">
              <label class="font-semibold text-xs text-gray-400"
                >Email Address</label
              >
              <input
                v-model="email"
                type="email"
                :disabled="!isEditing"
                class="border rounded-lg px-3 py-2 mb-5 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                placeholder="Email Address"
              />
            </div>
            <div class="w-full flex flex-col gap-2">
              <label class="font-semibold text-xs text-gray-400"
                >Phone Number</label
              >
              <input
                v-model="phonenumber"
                :disabled="!isEditing"
                class="border rounded-lg px-3 py-2 mb-5 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                placeholder="Phone Number"
              />
            </div>
          </div>
          <div
            class="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2"
          >
            <div class="w-full flex flex-col gap-2">
              <label class="font-semibold text-xs text-gray-400">Gender</label>
              <input
                v-model="gender"
                :disabled="!isEditing"
                type="text"
                class="border rounded-lg px-3 py-2 mb-5 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
                placeholder="Gender"
              />
            </div>
            <div class="w-full flex flex-col gap-2">
              <label class="font-semibold text-xs text-gray-400"
                >Date of Birth</label
              >
              <input
                v-model="birth"
                :disabled="!isEditing"
                type="date"
                class="border rounded-lg px-3 py-2 mb-5 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
              />
            </div>
          </div>
          <div class="w-full flex flex-col gap-2">
            <label class="font-semibold text-xs text-gray-400"
              >Current Password</label
            >
            <input
              v-model="password"
              :disabled="!isEditing"
              type="password"
              class="border rounded-lg px-3 py-2 mb-5 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
              placeholder="••••••••"
            />
          </div>
          <div class="w-full flex flex-col gap-2">
            <label class="font-semibold text-xs text-gray-400"
              >New Password</label
            >
            <input
              v-model="newpassword"
              :disabled="!isEditing"
              type="password"
              class="border rounded-lg px-3 py-2 mb-5 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
              placeholder="••••••••"
            />
          </div>
          <div class="w-full flex flex-col gap-2">
            <label class="font-semibold text-xs text-gray-400"
              >Confirm Password</label
            >
            <input
              v-model="confirmpassword"
              :disabled="!isEditing"
              type="password"
              class="border rounded-lg px-3 py-2 mb-5 text-sm w-full outline-none dark:border-gray-500 dark:bg-gray-900"
              placeholder="••••••••"
            />
          </div>
          <div class="mt-5 text-center">
            <button
              @click="isEditing ? saveChanges() : toggleEditMode()"
              
              class="py-3 px-8 text-white w-full  text-center text-base font-semibold shadow-md focus:outline-none bg-black rounded-lg cursor-pointer select-none"
            >
              {{ buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
