<template>
  <div class="app-layout">
    <!-- Sidebar Overlay (mobile) -->
    <div
      class="sidebar-overlay"
      :class="{ active: sidebarOpen }"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column flex-shrink-0 p-3 text-white" :class="{ open: sidebarOpen }">
      <!-- Close button (mobile) -->
      <button class="sidebar-close-btn d-lg-none" @click="sidebarOpen = false" aria-label="Đóng menu">
        <i class="bi bi-x-lg"></i>
      </button>

      <div class="text-center mb-4">
        <div class="brand-icon mb-2 mx-auto">
          <i class="bi bi-building fs-3"></i>
        </div>
        <h5 class="fw-bold">Home Rental</h5>
        <small class="text-white-50">Quản lý nhà trọ</small>
      </div>
      <hr>
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
          <router-link to="/dashboard" class="nav-link text-white" :class="{ active: isActive('/dashboard') }" @click="closeSidebarOnMobile">
            <i class="bi bi-speedometer2 me-2"></i>
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/rooms" class="nav-link text-white" :class="{ active: isActive('/rooms') }" @click="closeSidebarOnMobile">
            <i class="bi bi-door-open me-2"></i>
            Phòng trọ
          </router-link>
        </li>
        <li>
          <router-link to="/users" class="nav-link text-white" :class="{ active: isActive('/users') }" @click="closeSidebarOnMobile">
            <i class="bi bi-people me-2"></i>
            Người thuê
          </router-link>
        </li>
        <li>
          <router-link to="/contracts" class="nav-link text-white" :class="{ active: isActive('/contracts') }" @click="closeSidebarOnMobile">
            <i class="bi bi-file-text me-2"></i>
            Hợp đồng
          </router-link>
        </li>
        <li>
          <router-link to="/monthly-billing" class="nav-link text-white" :class="{ active: isActive('/monthly-billing') }" @click="closeSidebarOnMobile">
            <i class="bi bi-currency-dollar me-2"></i>
            Hóa đơn
          </router-link>
        </li>
        <li>
          <router-link to="/expenses" class="nav-link text-white" :class="{ active: isActive('/expenses') }" @click="closeSidebarOnMobile">
            <i class="bi bi-receipt me-2"></i>
            Chi phí
          </router-link>
        </li>
        <li>
          <router-link to="/settings" class="nav-link text-white" :class="{ active: isActive('/settings') }" @click="closeSidebarOnMobile">
            <i class="bi bi-gear me-2"></i>
            Cài đặt
          </router-link>
        </li>
      </ul>
      <hr>
      <div class="dropdown">
        <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle me-2 fs-5"></i>
          <strong>{{ username }}</strong>
        </a>
        <ul class="dropdown-menu dropdown-menu-dark text-small shadow">
          <li><a class="dropdown-item" href="#" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</a></li>
        </ul>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Bar -->
      <header class="topbar d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom">
        <div class="d-flex align-items-center gap-3">
          <!-- Hamburger Toggle Button -->
          <button class="sidebar-toggle-btn d-lg-none" @click="sidebarOpen = true" aria-label="Mở menu">
            <i class="bi bi-list fs-4"></i>
          </button>
          <div>
            <h4 class="mb-0 fw-bold">{{ pageTitle }}</h4>
            <small class="text-muted">{{ pageSubtitle }}</small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="text-muted small d-none d-sm-inline">
            <i class="bi bi-calendar3 me-1"></i>
            {{ currentDate }}
          </span>
          <button class="btn btn-outline-secondary btn-sm" @click="handleLogout">
            <i class="bi bi-box-arrow-right me-1"></i>Đăng xuất
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="content p-4">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUsername, logout } from '../services/auth.js'

defineProps({
  pageTitle: { type: String, default: '' },
  pageSubtitle: { type: String, default: '' }
})

const router = useRouter()
const route = useRoute()
const username = ref(getUsername() || 'Admin')
const sidebarOpen = ref(false)

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

function isActive(path) {
  return route.path === path
}

function closeSidebarOnMobile() {
  if (window.innerWidth < 992) {
    sidebarOpen.value = false
  }
}

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f6fa;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #2c3e50 0%, #3498db 100%);
  flex-shrink: 0;
  position: relative;
  transition: transform 0.3s ease;
}

.brand-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.nav-pills .nav-link {
  border-radius: 8px;
  margin-bottom: 2px;
  transition: all 0.2s;
}

.nav-pills .nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-pills .nav-link.active {
  background: rgba(255, 255, 255, 0.2);
}

/* Close button inside sidebar */
.sidebar-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
}

.sidebar-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ===== TOGGLE BUTTON (topbar) ===== */
.sidebar-toggle-btn {
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: #495057;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar-toggle-btn:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

/* ===== OVERLAY ===== */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  opacity: 0;
  pointer-events: none; /* không chặn click khi ẩn */
  transition: opacity 0.3s ease;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  min-width: 0;
}

.topbar {
  min-height: 60px;
}

.content {
  flex: 1;
  overflow-y: auto;
}

/* ===== RESPONSIVE (tablet & mobile < 992px) ===== */
@media (max-width: 991.98px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    width: 260px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    pointer-events: none; /* vẫn không chặn click khi đang ẩn */
  }

  .sidebar-overlay.active {
    opacity: 1;
    pointer-events: all; /* chỉ chặn click khi overlay đang hiện */
  }
}
</style>
