import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { parseJwt } from '@/stores/jwt';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/api/verify-pin/:pinId/:userId',
      name: 'VerifyPin',
      component: () => import('../views/VerifyView.vue'),
    },
    {
      path: '/api/remove/:pinId',
      name: 'ReportIssue',
      component: () => import('../views/ReportView.vue'),
    },
    {
      path: '/views/home',
      name: 'view-home',
      component: () => import('../views/customers/HomeView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/shop',
      name: 'view-shop',
      component: () => import('../views/customers/ShopView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/about',
      name: 'view-about',
      component: () => import('../views/customers/AboutView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/contact',
      name: 'view-contact',
      component: () => import('../views/customers/ContactView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/cart',
      name: 'view-cart',
      component: () => import('../views/customers/CartView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/account-details',
      name: 'view-account-details',
      component: () => import('../views/customers/AccountView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/address',
      name: 'view-address',
      component: () => import('../views/customers/AddressView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/orders',
      name: 'view-orders',
      component: () => import('../views/customers/OrderView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/cancel',
      name: 'view-cancel',
      component: () => import('../views/customers/CancelView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/success',
      name: 'view-success',
      component: () => import('../views/customers/SuccessView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/installment',
      name: 'view-installment',
      component: () => import('../views/customers/InstallmentView.vue'),
      meta: { requiresAuth: 'customer' }
    },
    {
      path: '/views/dashboard',
      name: 'dashboard',
      component: () => import('../views/administrator/DashboardView.vue'),
      meta: { requiresAuth: 'admin' }
    },
    {
      path: '/views/product',
      name: 'product',
      component: () => import('../views/administrator/ProductView.vue'),
      meta: { requiresAuth: 'admin' }
    },
    {
      path: '/views/customer',
      name: 'customer',
      component: () => import('../views/administrator/CustomerView.vue'),
      meta: { requiresAuth: 'admin' }
    },
    {
      path: '/views/message',
      name: 'message',
      component: () => import('../views/administrator/MessageView.vue'),
      meta: { requiresAuth: 'admin' }
    },
    {
      path: '/views/order',
      name: 'order',
      component: () => import('../views/administrator/OrderView.vue'),
      meta: { requiresAuth: 'admin' }
    },
    {
      path: '/views/layaway',
      name: 'layaway',
      component: () => import('../views/administrator/LayawayView.vue'),
      meta: { requiresAuth: 'admin' }
    },
    {
      path: '/views/report',
      name: 'report',
      component: () => import('../views/administrator/ReportView.vue'),
      meta: { requiresAuth: 'admin' }
    },
    {
      path: '/views/admin/profile',
      name: 'adminProfile',
      component: () => import('../views/administrator/ProfileView.vue'),
      meta: { requiresAuth: 'admin' }
    },
    {
      path: '/views/reviews',
      name: 'accountAdmin',
      component: () => import('../views/administrator/ReviewsView.vue'),
      meta: { requiresAuth: 'admin' }
    },
  ]
});
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  let decoded = {};

  if (token) {
    try {
      decoded = parseJwt(token);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      decoded = {};
    }
  }
  const role = decoded.role;
  console.log('sdsad'+role)
  if (to.meta.requiresAuth) {
    if (token) {

      if (to.meta.requiresAuth === role) {
        next();
      } else {

        if (role === 'admin') {
          next({ name: 'dashboard' });
        } else if (role === 'customer') {
          next({ name: 'view-home' });
        } else {
          next({ name: 'home' });
        }
      }
    } else {
      next({ name: 'home' });
    }
  } else {

    if (token) {

      if (role === 'admin') {
        next({ name: 'dashboard' });
      } else if (role === 'customer') {
        next({ name: 'view-home' });
      } else {
        next();
      }
    } else {
      next(); // Continue to the route if not authenticated
    }
  }
});

export default router
