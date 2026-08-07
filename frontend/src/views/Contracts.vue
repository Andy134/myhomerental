<template>
  <AppLayout pageTitle="Quản lý hợp đồng" pageSubtitle="Danh sách hợp đồng thuê phòng">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-primary" @click="openAddModal">
        <i class="bi bi-plus-lg me-1"></i>Thêm hợp đồng
      </button>
      <span class="text-muted small">Tổng: <strong>{{ contracts.length }}</strong></span>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Mã HĐ</th>
              <th>Phòng</th>
              <th>Người thuê</th>
              <th>Giá</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
<tbody>
<tr v-if="loading">
              <td colspan="8" class="text-center py-5 text-muted">
                <div class="spinner-border text-primary mb-2" role="status">
                  <span class="visually-hidden">Đang tải...</span>
                </div>
                <div>Đang tải dữ liệu...</div>
              </td>
            </tr>
            <tr v-else-if="contracts.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                Chưa có hợp đồng nào
              </td>
            </tr>
            <tr v-for="c in contracts" :key="c._id">
              <td class="fw-semibold">{{ c.code }}</td>
              <td>{{ c.room_no }}</td>
              <td>{{ c.user_id?.name || '--' }}</td>
              <td>{{ formatCurrency(c.price) }}</td>
              <td>{{ formatDate(c.start_date) }}</td>
              <td>{{ formatDate(c.end_date) }}</td>
              <td>
                <span class="badge" :class="statusBadge(c.status)">{{ statusLabel(c.status) }}</span>
              </td>
<td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" title="Sửa" @click="openEditModal(c)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-info me-1" title="Soạn hợp đồng" @click="openContractPrint(c)">
                  <i class="bi bi-printer"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Xóa" @click="confirmDelete(c)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" id="contractModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Sửa hợp đồng' : 'Thêm hợp đồng' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSave">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Mã hợp đồng <span class="text-danger">*</span></label>
                  <input v-model="form.code" class="form-control" required placeholder="VD: HD-001" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Phòng <span class="text-danger">*</span></label>
                  <select v-model="form.room_id" class="form-select" required @change="onRoomChange">
                    <option value="">-- Chọn phòng --</option>
                    <option v-for="r in rooms" :key="r._id" :value="r._id">{{ r.room_no }} - {{ formatCurrency(r.price) }}</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Người thuê <span class="text-danger">*</span></label>
                  <select v-model="form.user_id" class="form-select" required>
                    <option value="">-- Chọn người thuê --</option>
                    <option v-for="u in users" :key="u._id" :value="u._id">{{ u.name }} - {{ u.phone }}</option>
                  </select>
                </div>
<div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Tiền cọc</label>
                  <MoneyInput v-model="form.predict_price" />
                </div>
              </div>
              <div class="row">
<div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Ngày bắt đầu <span class="text-danger">*</span></label>
                  <DatePicker v-model="form.start_date" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Ngày kết thúc <span class="text-danger">*</span></label>
                  <DatePicker v-model="form.end_date" required />
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-semibold">Số người ở</label>
                  <input v-model.number="form.number_of_members" type="number" class="form-control" min="1" />
                </div>
<div class="col-md-4 mb-3">
                  <label class="form-label fw-semibold">Giá phòng</label>
                  <MoneyInput v-model="form.price" readonly />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-semibold">Đơn giá điện (kWh)</label>
                  <MoneyInput v-model="form.electric_price" />
                </div>
              </div>
              <div class="row">
<div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Đơn giá nước (người)</label>
                  <MoneyInput v-model="form.water_price" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Phí dịch vụ (người)</label>
                  <MoneyInput v-model="form.service_fee" />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Trạng thái</label>
                  <select v-model="form.status" class="form-select">
                    <option value="active">Đang hiệu lực</option>
                    <option value="expired">Hết hạn</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Ghi chú</label>
                  <textarea v-model="form.note" class="form-control" rows="1"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
<button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                {{ saving ? 'Đang lưu...' : 'Lưu' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h6 class="modal-title">Xác nhận xóa</h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            Bạn có chắc muốn xóa hợp đồng <strong>{{ deleteTarget?.code }}</strong>?
          </div>
<div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
<button type="button" class="btn btn-danger" @click="handleDelete" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ deleting ? 'Đang xóa...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contract Print Modal -->
    <div class="modal fade" id="contractPrintModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Soạn hợp đồng - {{ printTarget?.code }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="!template" class="text-center py-4 text-muted">
              <i class="bi bi-exclamation-triangle fs-2 d-block mb-2"></i>
              Chưa có mẫu hợp đồng. Vui lòng vào <router-link to="/settings">Cài đặt</router-link> để soạn mẫu hợp đồng trước.
            </div>
            <div v-else class="contract-print-preview" id="contract-content" v-html="renderedContent"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" @click="handlePrintContract" :disabled="!template">
              <i class="bi bi-printer me-1"></i>In hợp đồng
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import AppLayout from '../components/AppLayout.vue'
import MoneyInput from '../components/MoneyInput.vue'
import DatePicker from '../components/DatePicker.vue'
import api from '../services/api.js'

const contracts = ref([])
const rooms = ref([])
const users = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)

// Print contract state
const template = ref('')
const printTarget = ref(null)
let contractPrintModal = null

const defaultForm = {
  code: '', room_id: '', room_no: '', user_id: '',
  predict_price: 0, start_date: '', end_date: '',
  number_of_members: 1, price: 0, electric_price: 0,
  water_price: 0, service_fee: 0, status: 'active', note: ''
}
const form = ref({ ...defaultForm })

function formatCurrency(v) { return (v || 0).toLocaleString('vi-VN') + ' đ' }
function formatDate(d) {
  if (!d || d.length !== 8) return d || ''
  return `${d.substring(0, 2)}-${d.substring(2, 4)}-${d.substring(4, 8)}`
}
function statusLabel(s) { return { active: 'Đang hiệu lực', expired: 'Hết hạn', cancelled: 'Đã hủy' }[s] || s }
function statusBadge(s) { return { active: 'bg-success', expired: 'bg-secondary', cancelled: 'bg-danger' }[s] || 'bg-secondary' }

// Map dữ liệu hợp đồng để thay thế các biến (placeholder) trong mẫu
function contractData(c) {
  const now = new Date()
  return {
    code: c.code,
    room_no: c.room_no,
    user_name: c.user_id?.name || '--',
    user_phone: c.user_id?.phone || '',
    deposit: formatCurrency(c.predict_price),
    start_date: formatDate(c.start_date),
    end_date: formatDate(c.end_date),
    room_price: formatCurrency(c.price),
    electric_price: formatCurrency(c.electric_price),
    water_price: formatCurrency(c.water_price),
    service_fee: formatCurrency(c.service_fee),
    number_of_members: c.number_of_members || 1,
    current_day: String(now.getDate()).padStart(2, '0'),
    current_month: String(now.getMonth() + 1).padStart(2, '0'),
    current_year: now.getFullYear()
  }
}

// Nội dung hợp đồng sau khi thay thế biến
const renderedContent = computed(() => {
  if (!template.value || !printTarget.value) return ''
  let html = template.value
  const data = contractData(printTarget.value)
  Object.keys(data).forEach(k => {
    html = html.split('{{' + k + '}}').join(String(data[k]))
  })
  return html
})

let contractModal = null
let deleteModal = null

onMounted(async () => {
  await Promise.all([loadContracts(), loadRooms(), loadUsers(), loadTemplate()])
  contractModal = new Modal(document.getElementById('contractModal'))
  deleteModal = new Modal(document.getElementById('deleteModal'))
  contractPrintModal = new Modal(document.getElementById('contractPrintModal'))
})

async function loadTemplate() {
  try {
    const res = await api.get('/settings')
    template.value = res.data.contract_template || ''
  } catch (e) {
    console.error('Load contract template failed:', e)
  }
}

async function loadContracts() {
  loading.value = true
  try { contracts.value = (await api.get('/contracts')).data }
  catch (e) { console.error(e) }
  finally { loading.value = false }
}
async function loadRooms() {
  try { rooms.value = (await api.get('/rooms')).data }
  catch (e) { console.error(e) }
}
async function loadUsers() {
  try { users.value = (await api.get('/users')).data }
  catch (e) { console.error(e) }
}

function onRoomChange() {
  const room = rooms.value.find(r => r._id === form.value.room_id)
  if (room) {
    form.value.room_no = room.room_no
    form.value.price = room.price
  }
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { ...defaultForm }
  contractModal.show()
}

function openEditModal(c) {
  isEditing.value = true
  editingId.value = c._id
  form.value = {
    code: c.code, room_id: c.room_id?._id || c.room_id,
    room_no: c.room_no, user_id: c.user_id?._id || c.user_id,
    predict_price: c.predict_price, start_date: c.start_date,
    end_date: c.end_date, number_of_members: c.number_of_members,
    price: c.price, electric_price: c.electric_price,
    water_price: c.water_price, service_fee: c.service_fee,
    status: c.status, note: c.note
  }
  contractModal.show()
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value) await api.put(`/contracts/${editingId.value}`, form.value)
    else await api.post('/contracts', form.value)
    contractModal.hide()
    await loadContracts()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi lưu') }
  finally { saving.value = false }
}

function confirmDelete(c) {
  deleteTarget.value = c
  deleteModal.show()
}

async function handleDelete() {
  deleting.value = true
  try {
    await api.delete(`/contracts/${deleteTarget.value._id}`)
    deleteModal.hide()
    await loadContracts()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi xóa') }
  finally { deleting.value = false }
}

function openContractPrint(c) {
  printTarget.value = c
  contractPrintModal.show()
}

function handlePrintContract() {
  const content = document.getElementById('contract-content')
  if (!content) return

  const printWindow = window.open('', '_blank', 'width=800,height=600')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hợp đồng thuê phòng - ${printTarget.value?.code || ''}</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      ${content.innerHTML}
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()

// Chờ render xong rồi in
  setTimeout(() => {
    printWindow.print()
  }, 500)
}
</script>

<style scoped>
.contract-print-preview {
  font-family: 'Times New Roman', serif;
  line-height: 1.6;
}

.contract-print-preview :deep(h1),
.contract-print-preview :deep(h2) {
  text-align: center;
}
</style>

