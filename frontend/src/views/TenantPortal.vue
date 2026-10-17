<template>
  <main class="min-vh-100 bg-light">
    <header class="bg-primary text-white shadow-sm">
      <div class="container py-3 d-flex justify-content-between align-items-center gap-3">
        <div><h1 class="h5 mb-1">Cổng thông tin người thuê</h1><p class="mb-0 small opacity-75">Xin chào, {{ profile.name || username }}</p></div>
        <div class="d-flex gap-2"><button class="btn btn-outline-light btn-sm" @click="showPasswordModal = true"><i class="bi bi-key me-1"></i>Đổi mật khẩu</button><button class="btn btn-outline-light btn-sm" @click="handleLogout"><i class="bi bi-box-arrow-right me-1"></i>Đăng xuất</button></div>
      </div>
    </header>
    <section class="container py-4">
      <div class="row g-3 mb-4">
        <div class="col-md-4"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="text-muted small mb-1">Trạng thái thanh toán tháng {{ formatMonth(summary.month) }}</div><span v-if="summary.billing" class="badge fs-6" :class="paymentStatusClass(summary.billing.status)">{{ paymentStatus(summary.billing.status) }}</span><span v-else class="badge text-bg-secondary fs-6">Chưa có hóa đơn</span><button v-if="summary.billing && summary.billing.status !== 'cancelled'" class="btn btn-outline-primary btn-sm d-block mt-3" :disabled="openingPayment" @click="openPaymentPage"><span v-if="openingPayment" class="spinner-border spinner-border-sm me-1"></span><i v-else class="bi bi-credit-card me-1"></i>Xem hóa đơn</button></div></div></div>
        <div class="col-md-4"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="text-muted small mb-1">Số tiền đã thanh toán tháng này</div><strong class="text-success fs-4">{{ formatCurrency(summary.paid_amount) }}</strong></div></div></div>
        <div class="col-md-4"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="text-muted small mb-1">Tổng đã thanh toán</div><strong class="text-primary fs-4">{{ formatCurrency(total) }}</strong></div></div></div>
      </div>
      <div class="d-flex justify-content-between align-items-end mb-3"><div><h2 class="h4 mb-1">Lịch sử thanh toán</h2><p class="text-muted mb-0">Các hóa đơn đã được xác nhận thanh toán.</p></div></div>
      <div class="card border-0 shadow-sm"><div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr><th>Tháng</th><th>Phòng</th><th class="text-end">Số tiền</th><th>Ghi chú</th></tr></thead><tbody><tr v-if="loading"><td colspan="4" class="text-center py-5 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Đang tải...</td></tr><tr v-else-if="!billings.length"><td colspan="4" class="text-center py-5 text-muted">Chưa có hóa đơn đã thanh toán.</td></tr><tr v-for="billing in billings" :key="billing._id"><td>{{ formatMonth(billing.month) }}</td><td class="fw-semibold">{{ billing.room_no }}</td><td class="text-end fw-bold text-success">{{ formatCurrency(billing.total_price) }}</td><td>{{ billing.note || '—' }}</td></tr></tbody></table></div></div>
    </section>
    <div v-if="showPasswordModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" @click.self="closePasswordModal">
      <div class="card shadow border-0 password-card"><div class="card-body p-4"><div class="d-flex justify-content-between align-items-center mb-3"><h2 class="h5 mb-0">Đổi mật khẩu</h2><button class="btn-close" :disabled="changingPassword" @click="closePasswordModal"></button></div><div v-if="passwordError" class="alert alert-danger py-2">{{ passwordError }}</div><div v-if="passwordSuccess" class="alert alert-success py-2">{{ passwordSuccess }}</div><form @submit.prevent="changeTenantPassword"><div class="mb-3"><label class="form-label">Mật khẩu hiện tại</label><input v-model="passwordForm.currentPassword" type="password" class="form-control" autocomplete="current-password" required></div><div class="mb-3"><label class="form-label">Mật khẩu mới</label><input v-model="passwordForm.newPassword" type="password" class="form-control" minlength="8" autocomplete="new-password" required><div class="form-text">Ít nhất 8 ký tự.</div></div><div class="mb-3"><label class="form-label">Xác nhận mật khẩu mới</label><input v-model="passwordForm.confirmPassword" type="password" class="form-control" autocomplete="new-password" required></div><button class="btn btn-primary w-100" :disabled="changingPassword">{{ changingPassword ? 'Đang lưu...' : 'Lưu mật khẩu mới' }}</button></form></div></div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'
import { getUsername, logout } from '../services/auth.js'
import { changePassword } from '../services/auth.js'

const router = useRouter()
const username = getUsername()
const profile = ref({})
const billings = ref([])
const summary = ref({ month: '', billing: null, paid_amount: 0 })
const loading = ref(true)
const showPasswordModal = ref(false)
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const openingPayment = ref(false)
const total = computed(() => billings.value.reduce((sum, bill) => sum + (bill.total_price || 0), 0))
const formatCurrency = value => (value || 0).toLocaleString('vi-VN') + ' đ'
const formatMonth = value => value?.length === 6 ? `${value.slice(4)}/${value.slice(0, 4)}` : value || '—'
const paymentStatus = status => ({ paid: 'Đã thanh toán', unpaid: 'Chưa thanh toán', draft: 'Chờ xác nhận', cancelled: 'Đã hủy' }[status] || 'Chưa thanh toán')
const paymentStatusClass = status => ({ paid: 'text-bg-success', unpaid: 'text-bg-warning', draft: 'text-bg-secondary', cancelled: 'text-bg-danger' }[status] || 'text-bg-warning')
function handleLogout() { logout(); router.push('/login') }
async function openPaymentPage() { if (!summary.value.billing) return; openingPayment.value = true; try { const response = await api.post('/tenant-portal/payment-link', { billing_id: summary.value.billing._id }); window.open(`/shared-billing/${response.data.share_token}`, '_blank', 'noopener') } catch (error) { alert(error.response?.data?.message || 'Không thể mở trang thanh toán.') } finally { openingPayment.value = false } }
function closePasswordModal() { if (!changingPassword.value) { showPasswordModal.value = false; passwordError.value = ''; passwordSuccess.value = ''; passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' } } }
async function changeTenantPassword() { passwordError.value = ''; passwordSuccess.value = ''; if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) { passwordError.value = 'Xác nhận mật khẩu mới không khớp.'; return } changingPassword.value = true; try { await changePassword(passwordForm.value.currentPassword, passwordForm.value.newPassword); passwordSuccess.value = 'Đổi mật khẩu thành công.'; passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' } } catch (error) { passwordError.value = error.response?.data?.message || 'Không thể đổi mật khẩu.' } finally { changingPassword.value = false } }
onMounted(async () => { try { const [profileRes, billingRes, summaryRes] = await Promise.all([api.get('/tenant-portal/profile'), api.get('/tenant-portal/payment-history'), api.get('/tenant-portal/payment-summary')]); profile.value = profileRes.data; billings.value = billingRes.data; summary.value = summaryRes.data } finally { loading.value = false } })
</script>

<style scoped>
.modal-backdrop-custom { position: fixed; inset: 0; z-index: 1050; background: rgba(0, 0, 0, .5); }
.password-card { width: 100%; max-width: 440px; }
</style>
