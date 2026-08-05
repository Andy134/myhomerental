import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Rooms from '../views/Rooms.vue'
import Users from '../views/Users.vue'
import Contracts from '../views/Contracts.vue'
import MonthlyBilling from '../views/MonthlyBilling.vue'
import Expenses from '../views/Expenses.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: Rooms,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAuth: true }
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: Contracts,
    meta: { requiresAuth: true }
  },
  {
    path: '/monthly-billing',
    name: 'MonthlyBilling',
    component: MonthlyBilling,
    meta: { requiresAuth: true }
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: Expenses,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/shared-billing/:token',
    name: 'SharedBilling',
    component: () => import('../views/SharedBilling.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard - check auth
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    // Not logged in → redirect to login
    next({ name: 'Login' })
  } else if (to.name === 'Login' && token) {
    // Already logged in → redirect to dashboard
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
