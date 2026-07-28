<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card card shadow-lg border-0">
        <div class="card-body p-5">
          <!-- Logo / Brand -->
          <div class="text-center mb-4">
            <div class="brand-icon mb-3">
              <i class="bi bi-building fs-1"></i>
            </div>
            <h2 class="fw-bold text-primary mb-1">Home Rental</h2>
            <p class="text-muted small">Hệ thống quản lý nhà trọ</p>
          </div>

          <!-- Error Alert -->
          <div v-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{{ error }}</div>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleSubmit" novalidate>
            <!-- Username -->
            <div class="mb-3">
              <label for="username" class="form-label fw-semibold text-secondary">
                <i class="bi bi-person-fill me-1"></i>Tên đăng nhập
              </label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-person"></i>
                </span>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  class="form-control border-start-0 ps-0"
                  placeholder="Nhập tên đăng nhập"
                  :disabled="loading"
                  autocomplete="username"
                  required
                />
              </div>
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label for="password" class="form-label fw-semibold text-secondary">
                <i class="bi bi-lock-fill me-1"></i>Mật khẩu
              </label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-lock"></i>
                </span>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control border-start-0 ps-0 border-end-0"
                  placeholder="Nhập mật khẩu"
                  :disabled="loading"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="input-group-text bg-light border-start-0"
                  @click="showPassword = !showPassword"
                  :disabled="loading"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center"
              :disabled="loading || !username || !password"
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              <i v-else class="bi bi-box-arrow-in-right me-2"></i>
              {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </form>

          <!-- Footer -->
          <div class="text-center mt-4">
            <p class="text-muted small mb-0">
              <i class="bi bi-shield-lock me-1"></i>
              Trang quản trị dành cho chủ nhà trọ
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/auth.js'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

async function handleSubmit() {
  // Reset error
  error.value = ''

  // Basic validation
  if (!username.value.trim() || !password.value.trim()) {
    error.value = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
    return
  }

  loading.value = true

  try {
    await login(username.value.trim(), password.value)
    // Redirect to dashboard on success
    router.push('/dashboard')
  } catch (err) {
    const message =
      err.response?.data?.message ||
      'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.'
    error.value = message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  border-radius: 1rem;
  overflow: hidden;
}

.brand-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
}

.form-control:focus {
  box-shadow: none;
  border-color: #667eea;
}

.input-group:focus-within .input-group-text {
  border-color: #667eea;
}

.input-group-text {
  background-color: #f8f9fa;
  transition: border-color 0.15s ease-in-out;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: opacity 0.2s ease-in-out, transform 0.1s ease-in-out;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.65;
}

.alert-danger {
  border-radius: 0.5rem;
  font-size: 0.9rem;
}
</style>

