<template>
  <AppLayout pageTitle="Cài đặt" pageSubtitle="Cấu hình hệ thống">
    <div class="row">
      <div class="col-lg-8">
<!-- Card: Tài khoản thanh toán -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
            <a
              class="d-flex align-items-center justify-content-between text-decoration-none text-dark"
              data-bs-toggle="collapse"
              href="#collapsePayment"
              role="button"
              aria-expanded="false"
              aria-controls="collapsePayment"
            >
              <div>
                <h5 class="fw-bold mb-0">
                  <i class="bi bi-credit-card me-2"></i>Tài khoản thanh toán
                </h5>
                <small class="text-muted">Thông tin này sẽ hiển thị trên phiếu thu dành cho người thuê</small>
              </div>
              <i class="bi bi-chevron-down chevron-icon"></i>
            </a>
          </div>
          <div class="collapse" id="collapsePayment">
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

<!-- Card: Mẫu hợp đồng -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
            <a
              class="d-flex align-items-center justify-content-between text-decoration-none text-dark"
              data-bs-toggle="collapse"
              href="#collapseContractTemplate"
              role="button"
              aria-expanded="false"
              aria-controls="collapseContractTemplate"
            >
              <div>
                <h5 class="fw-bold mb-0">
                  <i class="bi bi-file-earmark-text me-2"></i>Soạn mẫu hợp đồng
                </h5>
                <small class="text-muted">
                  Soạn nội dung mẫu hợp đồng. Chèn các biến để tự điền thông tin theo từng hợp đồng khi in.
                </small>
              </div>
              <i class="bi bi-chevron-down chevron-icon"></i>
            </a>
          </div>
          <div class="collapse" id="collapseContractTemplate">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Nội dung mẫu hợp đồng</label>
                <RichTextEditor v-model="form.contract_template" :min-height="350" />
              </div>

              <!-- Gợi ý biến -->
              <div class="mb-3">
                <small class="form-label fw-semibold d-block mb-2">Các biến có thể chèn:</small>
                <div class="placeholder-hints">
                  <code v-for="p in placeholders" :key="p.value" class="hint">{{ p.value }}</code>
                  <span class="text-muted small d-block mt-2">
                    <i class="bi bi-info-circle me-1"></i>
                    Khi soạn hợp đồng, các biến này sẽ được thay bằng thông tin tương ứng của từng phòng/hợp đồng.
                  </span>
                </div>
              </div>

              <div>
                <button type="button" class="btn btn-primary" @click="saveContractTemplate" :disabled="savingTemplate">
                  <i class="bi bi-check-lg me-1"></i>
                  {{ savingTemplate ? 'Đang lưu...' : 'Lưu mẫu hợp đồng' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import RichTextEditor from '../components/RichTextEditor.vue'
import api from '../services/api.js'

const saving = ref(false)
const savingTemplate = ref(false)

// Danh sách biến có thể chèn vào mẫu hợp đồng
const placeholders = [
  { value: '{{code}}', label: 'Mã hợp đồng' },
  { value: '{{room_no}}', label: 'Số phòng' },
  { value: '{{user_name}}', label: 'Tên người thuê' },
  { value: '{{user_phone}}', label: 'Số điện thoại' },
  { value: '{{user_id_number}}', label: 'CMND/CCCD' },
  { value: '{{user_address}}', label: 'Địa chỉ' },
  { value: '{{start_date}}', label: 'Ngày bắt đầu' },
  { value: '{{end_date}}', label: 'Ngày kết thúc' },
  { value: '{{deposit}}', label: 'Tiền cọc' },
  { value: '{{room_price}}', label: 'Giá phòng' },
  { value: '{{electric_price}}', label: 'Đơn giá điện' },
  { value: '{{water_price}}', label: 'Đơn giá nước' },
{ value: '{{service_fee}}', label: 'Phí dịch vụ' },
  { value: '{{number_of_members}}', label: 'Số người ở' },
  { value: '{{current_date}}', label: 'Ngày hiện tại (dd-mm-yyyy)' },
  { value: '{{current_day}}', label: 'Ngày hiện tại (dd)' },
  { value: '{{current_month}}', label: 'Ngày hiện tại (mm)' },
  { value: '{{current_year}}', label: 'Ngày hiện tại (yyyy)' }
]

const form = ref({
  payment_qr: '',
  payment_account_number: '',
  payment_account_name: '',
  payment_bank_name: '',
  contract_template: ''
})

async function loadSettings() {
  try {
    const res = await api.get('/settings')
    const d = res.data
    form.value = {
      payment_qr: d.payment_qr || '',
      payment_account_number: d.payment_account_number || '',
      payment_account_name: d.payment_account_name || '',
      payment_bank_name: d.payment_bank_name || '',
      contract_template: d.contract_template || ''
    }
  } catch (e) {
    console.error('Load settings failed:', e)
  }
}

async function saveContractTemplate() {
  savingTemplate.value = true
  try {
    await api.put('/settings', { contract_template: form.value.contract_template })
    alert('Đã lưu mẫu hợp đồng thành công!')
  } catch (e) {
    alert(e.response?.data?.message || 'Lỗi khi lưu mẫu hợp đồng')
  } finally {
    savingTemplate.value = false
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

/* Chevron xoay khi mở/đóng collapse */
.card-header .chevron-icon {
  transition: transform 0.2s ease;
  font-size: 1.1rem;
}

.card-header a[aria-expanded="true"] .chevron-icon {
  transform: rotate(180deg);
}

.hint {
  display: inline-block;
  background: #f1f3f5;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 2px 8px;
  margin: 0 4px 4px 0;
  font-size: 0.85em;
  color: #0d6efd;
}
</style>
