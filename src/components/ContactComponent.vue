<script setup>
import axios from "../../axios";
import { onMounted, ref } from "vue";
import { useToast } from "vue-toastification";

const toast = useToast();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const message = ref("");

const submit = async () => {
  const data = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    message: message.value,
  };

  try {
    const response = await axios.post(
      "/api/contact",
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 200) {
      message.value = "";
      firstName.value = "";
      lastName.value = "";
      message.value = "";
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
</script>

<template>
  <!-- source https://tailblocks.cc/ -->
  <section
    class="text-gray-600 body-font relative w-full px-4 md:px-6 lg:px-16 xl:px-24 mt-24"
  >
    <div class="py-5 mx-auto flex sm:flex-nowrap flex-wrap">
      <div
        class="w-full bg-gray-300 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative"
      >
        <iframe
          width="100%"
          height="100%"
          class="absolute inset-0"
          frameborder="0"
          title="map"
          marginheight="0"
          marginwidth="0"
          scrolling="no"
          src="https://maps.google.com/maps?width=100%&height=600&hl=en&q=%C4%B0zmir+(My%20Business%20Name)&ie=UTF8&t=&z=14&iwloc=B&output=embed"
          style="filter: grayscale(1) contrast(1.2) opacity(0.4)"
        ></iframe>
        <div class="bg-white relative flex flex-wrap py-6 rounded shadow-md">
          <div class="lg:w-1/2 px-6">
            <h2
              class="title-font font-semibold text-gray-900 tracking-widest text-xs"
            >
              ADDRESS
            </h2>
            <p class="mt-1">
             Barangay Bangbang P rodriguez st, Cebu city.
            </p>
          </div>
          <div class="lg:w-1/2 px-6 mt-4 lg:mt-0">
            <h2
              class="title-font font-semibold text-gray-900 tracking-widest text-xs"
            >
              EMAIL
            </h2>
            <a class="text-red-500 leading-relaxed">jackiegolddigger88@gmail.com</a>
            <h2
              class="title-font font-semibold text-gray-900 tracking-widest text-xs mt-4"
            >
              PHONE
            </h2>
            <p class="leading-relaxed">123-456-7890</p>
          </div>
        </div>
      </div>
      <form
        @submit.prevent="submit"
        class="w-full bg-white flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0"
      >
        <h2 class="text-gray-900 text-4xl mb-1 font-medium title-font">
          Contact Us
        </h2>
        <p class="leading-relaxed mb-5 text-gray-600">
          We’d love to hear from you! Whether you have questions about our
          collections, need assistance with an order, or simply want to learn
          more about Jackie’s Gold, our team is here to help.
        </p>
        <div class="flex w-full">
          <div class="relative mb-4 w-full mr-1">
            <label for="email" class="leading-7 text-sm text-gray-600"
              >First Name</label
            >
            <input
              v-model="firstName"
              type="text"
              id="firstName"
              name="firstName"
              class="w-full bg-white rounded border border-gray-300 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div class="relative mb-4 w-full">
            <label for="lastName" class="leading-7 text-sm text-gray-600"
              >Last Name</label
            >
            <input
              v-model="lastName"
              type="text"
              id="lastName"
              name="lastName"
              class="w-full bg-white rounded border border-gray-300 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
        </div>
        <div class="relative mb-4">
          <label for="email" class="leading-7 text-sm text-gray-600"
            >Email</label
          >
          <input
            v-model="email"
            type="email"
            id="email"
            name="email"
            class="w-full bg-white rounded border border-gray-300 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <div class="relative mb-4">
          <label for="message" class="leading-7 text-sm text-gray-600"
            >Message</label
          >
          <textarea
            v-model="message"
            id="message"
            name="message"
            class="w-full bg-white rounded border border-gray-300 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
          ></textarea>
        </div>
        <button
          type="submit"
          class="text-white bg-black border-0 py-3 px-6 focus:outline-none rounded-lg text-lg"
        >
          Submit
        </button>
      </form>
    </div>
  </section>
</template>