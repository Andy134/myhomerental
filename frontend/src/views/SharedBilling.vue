<template>
  <div class="shared-billing-container">
    <div class="container py-4">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="text-muted">Đang tải thông tin hóa đơn...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-5">
        <i class="bi bi-exclamation-triangle-fill text-danger fs-1 d-block mb-3"></i>
        <h5 class="text-danger">Không tìm thấy hóa đơn</h5>
        <p class="text-muted">{{ error }}</p>
      </div>

      <!-- Billing Detail -->
      <div v-else class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Header -->
          <div class="text-center mb-4">
            <h3 class="fw-bold mb-1">PHIẾU THU TIỀN NHÀ</h3>
            <p class="text-muted mb-0">Tháng {{ formatMonth(billing.month) }}</p>
          </div>

          <!-- Card -->
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <!-- Tenant Info -->
              <div class="row mb-4">
                <div class="col-6">
                  <small class="text-muted d-block">Phòng</small>
                  <strong class="fs-5">{{ billing.room_no }}</strong>
                </div>
                <div class="col-6 text-end">
                  <small class="text-muted d-block">Người thuê</small>
                  <strong>{{ billing.user_id?.name || '--' }}</strong>
                </div>
              </div>

              <hr />

              <!-- Billing Details Table -->
              <table class="table table-borderless mb-0">
                <tbody>
                  <tr v-if="(billing.room_price || 0) > 0">
                    <td class="ps-0 text-muted">Tiền phòng</td>
                    <td class="text-end fw-bold">{{ formatCurrency(billing.room_price) }}</td>
                  </tr>
                  <tr v-if="electricFee(billing) > 0">
                    <td class="ps-0 text-muted">
                      Điện ({{ billing.old_electric || 0 }} → {{ billing.new_electric || 0 }})
                      <small class="d-block text-muted">
                        {{ Math.max(0, (billing.new_electric || 0) - (billing.old_electric || 0)) }} kWh × {{ formatCurrency(billing.electric_price) }}/kWh
                      </small>
                    </td>
                    <td class="text-end fw-bold">
                      {{ formatCurrency(electricFee(billing)) }}
                    </td>
                  </tr>
                  <tr v-if="waterFee(billing) > 0">
                    <td class="ps-0 text-muted">
                      Nước
                      <small class="d-block text-muted">{{ billing.number_of_members || 1 }} người × {{ formatCurrency(billing.water_price) }}/người</small>
                    </td>
                    <td class="text-end fw-bold">{{ formatCurrency(waterFee(billing)) }}</td>
                  </tr>
                  <tr v-if="serviceFee(billing) > 0">
                    <td class="ps-0 text-muted">
                      Phí dịch vụ
                      <small class="d-block text-muted">{{ billing.number_of_members || 1 }} người × {{ formatCurrency(billing.service_fee) }}/người</small>
                    </td>
                    <td class="text-end fw-bold">{{ formatCurrency(serviceFee(billing)) }}</td>
                  </tr>
                  <tr :class="hasAnyItem(billing) ? 'border-top' : 'border-0'">
                    <td class="ps-0 pt-3">
                      <strong class="fs-5">TỔNG CỘNG</strong>
                    </td>
                    <td class="text-end pt-3">
                      <strong class="fs-5 text-primary">{{ formatCurrency(billing.total_price) }}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              <hr />

              <!-- Status & Note -->
              <div class="row">
                <div class="col-6">
                  <small class="text-muted d-block">Trạng thái</small>
                  <span class="badge fs-6 mt-1" :class="statusBadge(billing.status)">
                    {{ statusLabel(billing.status) }}
                  </span>
                </div>
                <div class="col-6 text-end" v-if="billing.note">
                  <small class="text-muted d-block">Ghi chú</small>
                  <span>{{ billing.note }}</span>
                </div>
              </div>
            </div>
          </div>

<!-- Payment Info -->
          <div v-if="hasPaymentInfo" class="card border-0 shadow-sm mt-4">
            <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
              <h5 class="fw-bold mb-0">
                <i class="bi bi-credit-card me-2"></i>Thông tin thanh toán
              </h5>
            </div>
            <div class="card-body">
              <div class="row align-items-center g-3">
                <div class="col-auto" v-if="paymentInfo.payment_qr">
                  <img :src="paymentInfo.payment_qr" alt="Mã QR thanh toán" class="payment-qr" />
                </div>
                <div class="col">
                  <table class="table table-borderless mb-0">
                    <tbody>
                      <tr v-if="paymentInfo.payment_bank_name">
                        <td class="ps-0 text-muted" style="width: 140px;">Ngân hàng</td>
                        <td class="fw-semibold">{{ paymentInfo.payment_bank_name }}</td>
                      </tr>
                      <tr v-if="paymentInfo.payment_account_number">
                        <td class="ps-0 text-muted">Số tài khoản</td>
                        <td class="fw-bold">{{ paymentInfo.payment_account_number }}</td>
                      </tr>
                      <tr v-if="paymentInfo.payment_account_name">
                        <td class="ps-0 text-muted">Tên người nhận</td>
                        <td class="fw-semibold">{{ paymentInfo.payment_account_name }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <small class="text-muted d-block mt-2">
                    <i class="bi bi-info-circle me-1"></i>
                    Vui lòng chuyển khoản đúng số tiền trong hóa đơn và ghi rõ nội dung chuyển khoản.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center mt-4">
            <p class="text-muted small mb-0">
              <i class="bi bi-info-circle me-1"></i>
              Hóa đơn được tạo bởi hệ thống quản lý nhà trọ HomeRental
            </p>
            <button class="btn btn-outline-primary mt-2" @click="window.print()">
              <i class="bi bi-printer me-1"></i>In phiếu thu
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const billing = ref(null)
const loading = ref(true)
const error = ref('')

const paymentInfo = ref({ payment_qr: '', payment_account_number: '', payment_account_name: '', payment_bank_name: '' })

const hasPaymentInfo = computed(() => {
  const p = paymentInfo.value
  return !!(p.payment_qr || p.payment_account_number || p.payment_account_name || p.payment_bank_name)
})

function formatCurrency(v) {
  return (v || 0).toLocaleString('vi-VN') + ' đ'
}

function electricFee(b) {
  return Math.max(0, (b.new_electric || 0) - (b.old_electric || 0)) * (b.electric_price || 0)
}

function waterFee(b) {
  return (b.water_price || 0) * (b.number_of_members || 1)
}

function serviceFee(b) {
  return (b.service_fee || 0) * (b.number_of_members || 1)
}

function hasAnyItem(b) {
  return (b.room_price || 0) > 0 || electricFee(b) > 0 || waterFee(b) > 0 || serviceFee(b) > 0
}

function formatMonth(m) {
  if (!m || m.length !== 6) return m || ''
  return `${m.substring(4, 6)}/${m.substring(0, 4)}`
}

function statusLabel(s) {
  return { draft: 'Bản nháp', unpaid: 'Chưa thu', paid: 'Đã thu', cancelled: 'Hủy' }[s] || s
}

function statusBadge(s) {
  return { draft: 'bg-secondary', unpaid: 'bg-warning', paid: 'bg-success', cancelled: 'bg-danger' }[s] || 'bg-secondary'
}

onMounted(async () => {
  const token = route.params.token
  try {
    const res = await axios.get(`/api/public/billing/${token}`)
    billing.value = res.data
  } catch (e) {
    error.value = e.response?.data?.message || 'Hóa đơn không tồn tại hoặc link đã hết hạn'
  } finally {
    loading.value = false
  }

  // Lấy thông tin thanh toán công khai (không cần bắt buộc thành công)
  try {
    const res = await axios.get('/api/public/settings')
    paymentInfo.value = res.data || paymentInfo.value
  } catch (e) {
    console.error('Failed to load payment settings:', e)
  }
})
</script>

<style scoped>
.shared-billing-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.payment-qr {
  width: 180px;
  height: 180px;
  object-fit: contain;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 4px;
  background: #fff;
}
</style>

