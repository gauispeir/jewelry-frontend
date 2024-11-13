<script setup>
import axios from "../../../axios";
import { onMounted, ref } from "vue";
import { Bar } from "vue-chartjs";
import { Chart as ChartJS, registerables } from "chart.js";

const countCustomer = ref(0);
const countItem = ref(0);
const countOrder = ref(0);

const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

const refreshData = async () => {
  try {
    const response = await axios.get(`/api/user`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    countCustomer.value = response.data.data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }
};

const refreshItem = async () => {
  try {
    const response = await axios.get(`/api/item`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    countItem.value = response.data.data;
  } catch (error) {
    console.error("Error fetching item data:", error);
  }
};

const refreshOrder = async () => {
  try {
    const response = await axios.get(`/api/get-order`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    countOrder.value = response.data.data;
  } catch (error) {
    console.error("Error fetching order data:", error);
  }
};

ChartJS.register(...registerables);

const data = ref([]);
const barChartData = ref({
  labels: [],
  datasets: [{ label: "Total Sales (PHP)", backgroundColor: "#111", data: [] }],
});
const orders = ref([]);
const isDataReady = ref(false);

async function fetchData() {
  try {
    const response = await axios.get(`/api/chart-item`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    data.value = response.data.data;
    processData();
  } catch (error) {
    console.error("Error fetching chart data:", error);
  }
}

const processData = () => {
  const productSales = {};
  const combinedOrders = {};

  data.value.forEach((order) => {
    if (order.status === "delivered") {
      const orderDetails = JSON.parse(order.order_details);
      orderDetails.forEach((item) => {
        const formattedAmount = (item.amount / 100).toFixed(2);
        const totalAmount = parseFloat(formattedAmount) * item.quantity;

        if (combinedOrders[item.name]) {
          combinedOrders[item.name].quantity += item.quantity;
          combinedOrders[item.name].amount += totalAmount;
          combinedOrders[item.name].price = item.price;
        } else {
          combinedOrders[item.name] = {
            productName: item.name,
            price: item.price,
            amount: totalAmount,
            quantity: item.quantity,
            date: order.created_at,
          };
        }

        if (productSales[item.name]) {
          productSales[item.name] += totalAmount;
        } else {
          productSales[item.name] = totalAmount;
        }
      });
    }
  });

  barChartData.value.labels = Object.keys(productSales);
  barChartData.value.datasets[0].data = Object.values(productSales);

  orders.value = Object.values(combinedOrders);
  isDataReady.value = true;
};

onMounted(() => {
  fetchData();
  refreshItem();
  refreshData();
  refreshOrder();
});
</script>
<template>
  <div class="w-screen mt-12">
    <div class="grid gap-4 lg:gap-8 md:grid-cols-3 p-8 pt-20">
      <!-- Total Customers -->
      <div class="relative p-6 rounded-2xl bg-white shadow dark:bg-gray-800 border">
        <div class="space-y-2">
          <div class="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-500 dark:text-gray-400">
            <span>Total customers</span>
          </div>
          <div class="text-3xl dark:text-gray-100">
            {{ countCustomer.length ? countCustomer[0].total_verified_users - 1 : "" }}
          </div>
        </div>
      </div>

      <!-- Total Products -->
      <div class="relative p-6 rounded-2xl bg-white shadow dark:bg-gray-800 border">
        <div class="space-y-2">
          <div class="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-500 dark:text-gray-400">
            <span>Total products</span>
          </div>
          <div class="text-3xl dark:text-gray-100">
            {{ countItem.length ? countItem[0].total_item : "" }}
          </div>
        </div>
      </div>

      <!-- Total Orders -->
      <div class="relative p-6 rounded-2xl bg-white shadow dark:bg-gray-800 border">
        <div class="space-y-2">
          <div class="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-500 dark:text-gray-400">
            <span>Total orders</span>
          </div>
          <div class="text-3xl dark:text-gray-100">
            {{ countOrder.length ? countOrder[0].total_order : "" }}
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="max-h-[400px] overflow-y-auto px-4 sm:px-6">
      <div class="text-center mb-8 border rounded-lg">
        <Bar v-if="isDataReady" :data="barChartData" class="p-4 sm:p-6 lg:p-12" />
        <p v-else class="p-5">No order yet.</p>
      </div>

      <!-- Orders List Section -->
      <div v-if="isDataReady && orders.length" class="my-8">
        <h2 class="text-xl font-semibold mb-4 text-center">List of orders for {{ currentMonth }}.</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th class="border-b px-4 py-2 text-left">Order ID</th>
                <th class="border-b px-4 py-2 text-left">Product Name</th>
                <th class="border-b px-4 py-2 text-left">Amount (PHP)</th>
                <th class="border-b px-4 py-2 text-left">Sub Total (PHP)</th>
                <th class="border-b px-4 py-2 text-left">Quantity</th>
                <th class="border-b px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in orders" :key="index">
                <td class="border-b px-4 py-2">{{ index + 1 }}</td>
                <td class="border-b px-4 py-2">{{ order.productName }}</td>
                <td class="border-b px-4 py-2">{{ order.price.toFixed(2) }}</td>
                <td class="border-b px-4 py-2">{{ order.amount.toFixed(2) }}</td>
                <td class="border-b px-4 py-2">{{ order.quantity }}</td>
                <td class="border-b px-4 py-2">{{ new Date(order.date).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!orders.length" class="mt-4 text-center">No orders available.</p>
      </div>
    </div>
  </div>
</template>
