<template>
  <div class="mt-24 max-h-[550px] overflow-y-auto px-4 sm:px-6">
    <!-- Sales Summary Section -->
    <div class="mt-8 p-6 bg-white rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">
        Sales Summary for {{ new Date().toLocaleDateString('en-US', { month: 'long' }) }}
      </h2>
      <p><strong>Total Orders:</strong> {{ orders.length }}</p>
      <p><strong>Total Revenue (PHP):</strong> {{ totalRevenue.toFixed(2) }}</p>
    </div>

    <!-- Bar Chart Section (Total Sales and Quantity per Product) -->
    <div class="text-center my-8 border rounded-lg">
      <Bar v-if="isDataReady" :data="barChartData" class="p-4 sm:p-6 lg:p-12" />
      <p v-else class="py-3">No available order yet.</p>
    </div>

    <!-- Orders List Section -->
    <div v-if="isDataReady && orders.length" class="my-8">
      <h2 class="text-xl font-semibold mb-4 text-center">
        List of orders for {{ new Date().toLocaleDateString('en-US', { month: 'long' }) }}.
      </h2>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th class="border-b px-4 py-2 text-left">Order ID</th>
              <th class="border-b px-4 py-2 text-left">Product Name</th>
              <th class="border-b px-4 py-2 text-left">Price (PHP)</th>
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
      <p v-if="!orders.length" class="mt-4 p-3 text-center">No orders available.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, registerables } from 'chart.js';
import axios from '../../../axios';

// Register Chart.js components
ChartJS.register(...registerables);

// Reactive states
const data = ref([]);
const barChartData = ref({
  labels: [], // Product names
  datasets: [
    {
      label: 'Total Quantity Sold',
      backgroundColor: '#111', 
      data: [], // Quantity data per product
    },
    {
      label: 'Total Sales (PHP)',
      backgroundColor: '#111', 
      data: [], 
    },
  ],
});
const orders = ref([]);
const isDataReady = ref(false);
const totalRevenue = ref(0);

// Fetch data from API
async function fetchData() {
  try {
    const response = await axios.get(`/api/chart-item`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    data.value = response.data.data;
    processData(); // Process data after fetching
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Process the data for the charts and the orders list
function processData() {
  const productSales = {}; // Stores total sales per product
  const productQuantities = {}; // Stores total quantities per product
  const combinedOrders = {}; // Combines orders by product name
  totalRevenue.value = 0;

  data.value.forEach((order) => {
    if (order.status === 'delivered') {
      const orderDetails = JSON.parse(order.order_details);

      orderDetails.forEach((item) => {
        const formattedAmount = (item.amount / 100).toFixed(2);
        const totalAmount = parseFloat(formattedAmount) * item.quantity;
        totalRevenue.value += totalAmount;

        // Combine orders by product name
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

        // Update product sales and quantities
        productSales[item.name] = (productSales[item.name] || 0) + totalAmount;
        productQuantities[item.name] = (productQuantities[item.name] || 0) + item.quantity;
      });
    }
  });

  // Update Bar Chart Data
  barChartData.value.labels = Object.keys(productQuantities);
  barChartData.value.datasets[0].data = Object.values(productQuantities); // Quantity dataset
  barChartData.value.datasets[1].data = Object.values(productSales); // Sales dataset

  // Update orders list
  orders.value = Object.values(combinedOrders);

  // Mark data as ready for rendering
  isDataReady.value = true;
}

// Fetch data on component mount
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
}
</style>
