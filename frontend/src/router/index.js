import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Rooms from '../views/Rooms.vue'
import Users from '../views/Users.vue'
import Contracts from '../views/Contracts.vue'
import MonthlyBilling from '../views/MonthlyBilling.vue'
import PaymentHistory from '../views/PaymentHistory.vue'
import Expenses from '../views/Expenses.vue'
import Settings from '../views/Settings.vue'
import TenantPortal from '../views/TenantPortal.vue'
import { getRole } from '../services/auth.js'

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
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: Rooms,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: Contracts,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/monthly-billing',
    name: 'MonthlyBilling',
    component: MonthlyBilling,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/payment-history',
    name: 'PaymentHistory',
    component: PaymentHistory,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: Expenses,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/tenant-portal',
    name: 'TenantPortal',
    component: TenantPortal,
    meta: { requiresAuth: true, roles: ['tenant'] }
  },
  {
    path: '/shared-billing/:token',
    name: 'SharedBilling',
    component: () => import('../views/SharedBilling.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/sign-contract/:token',
    name: 'SignContract',
    component: () => import('../views/SignContract.vue'),
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
  const role = getRole()
  
  if (to.meta.requiresAuth && !token) {
    // Not logged in → redirect to login
    next({ name: 'Login' })
  } else if (token && !role) {
    // Sessions created before role-based access was introduced must log in again.
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    next({ name: 'Login' })
  } else if (to.meta.roles && !to.meta.roles.includes(role)) {
    next(role === 'tenant' ? { name: 'TenantPortal' } : { name: 'Dashboard' })
  } else if (to.name === 'Login' && token) {
    // Already logged in → redirect to dashboard
    next(role === 'tenant' ? { name: 'TenantPortal' } : { name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
