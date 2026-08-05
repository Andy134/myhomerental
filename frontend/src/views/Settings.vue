<template>
  <AppLayout pageTitle="Cài đặt" pageSubtitle="Cấu hình hệ thống">
    <div class="row">
      <div class="col-lg-8">
        <!-- Card: Tài khoản thanh toán -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-credit-card me-2"></i>Tài khoản thanh toán
            </h5>
            <small class="text-muted">Thông tin này sẽ hiển thị trên phiếu thu dành cho người thuê</small>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSave">
              <!-- QR Code -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Mã QR chuyển khoản</label>
                <div class="d-flex align-items-start gap-3">
                  <div class="qr-preview">
                    <img v-if="form.payment_qr" :src="form.payment_qr" alt="Mã QR" class="qr-image" />
                    <div v-else class="qr-placeholder">
                      <i class="bi bi-qr-code fs-1 text-muted"></i>
                      <small class="text-muted">Chưa có mã QR</small>
                    </div>
                  </div>
                  <div>
                    <div class="d-flex gap-2">
                      <label class="btn btn-outline-primary btn-sm mb-0">
                        <i class="bi bi-upload me-1"></i>Chọn ảnh QR
                        <input type="file" accept="image/*" class="d-none" @change="onFileChange" />
                      </label>
                      <button v-if="form.payment_qr" type="button" class="btn btn-outline-danger btn-sm" @click="removeQr">
                        <i class="bi bi-trash me-1"></i>Xóa
                      </button>
                    </div>
                    <small class="text-muted d-block mt-2">
                      <i class="bi bi-info-circle me-1"></i>
                      Chọn ảnh mã QR (JPG/PNG). Ảnh sẽ được lưu trực tiếp vào hệ thống.
                    </small>
                  </div>
                </div>
              </div>

              <hr />

              <!-- Account fields -->
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Số tài khoản</label>
                  <input v-model.trim="form.payment_account_number" class="form-control" placeholder="VD: 1234567890" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tên người nhận</label>
                  <input v-model.trim="form.payment_account_name" class="form-control" placeholder="VD: NGUYEN VAN A" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tên ngân hàng</label>
                  <input v-model.trim="form.payment_bank_name" class="form-control" placeholder="VD: Vietcombank" />
                </div>
              </div>

              <div class="mt-4">
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <i class="bi bi-check-lg me-1"></i>
                  {{ saving ? 'Đang lưu...' : 'Lưu cài đặt' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import api from '../services/api.js'

const saving = ref(false)

const form = ref({
  payment_qr: '',
  payment_account_number: '',
  payment_account_name: '',
  payment_bank_name: ''
})

async function loadSettings() {
  try {
    const res = await api.get('/settings')
    const d = res.data
    form.value = {
      payment_qr: d.payment_qr || '',
      payment_account_number: d.payment_account_number || '',
      payment_account_name: d.payment_account_name || '',
      payment_bank_name: d.payment_bank_name || ''
    }
  } catch (e) {
    console.error('Load settings failed:', e)
  }
}

function onFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  // Kiểm tra dung lượng (giới hạn ~2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB.')
    e.target.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    form.value.payment_qr = ev.target.result
  }
  reader.readAsDataURL(file)
}

function removeQr() {
  form.value.payment_qr = ''
}

async function handleSave() {
  saving.value = true
  try {
    await api.put('/settings', form.value)
    alert('Đã lưu cài đặt thành công!')
  } catch (e) {
    alert(e.response?.data?.message || 'Lỗi khi lưu cài đặt')
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>

<style scoped>
.qr-preview {
  width: 160px;
  height: 160px;
  flex-shrink: 0;
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #adb5bd;
}

.card {
  border-radius: 12px;
}
</style>
