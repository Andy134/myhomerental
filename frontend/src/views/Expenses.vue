<template>
  <AppLayout pageTitle="Quản lý chi phí" pageSubtitle="Danh sách các khoản chi">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-primary" @click="openAddModal">
        <i class="bi bi-plus-lg me-1"></i>Thêm chi phí
      </button>
      <span class="text-muted small">Tổng chi: <strong>{{ formatCurrency(totalAmount) }}</strong></span>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Ngày</th>
              <th>Mô tả</th>
              <th>Số tiền</th>
              <th>Ghi chú</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="expenses.length === 0">
              <td colspan="5" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                Chưa có chi phí nào
              </td>
            </tr>
            <tr v-for="e in expenses" :key="e._id">
              <td>{{ formatDate(e.date) }}</td>
              <td class="fw-semibold">{{ e.description }}</td>
              <td class="text-danger fw-bold">{{ formatCurrency(e.amount) }}</td>
              <td>{{ e.note || '--' }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" title="Sửa" @click="openEditModal(e)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Xóa" @click="confirmDelete(e)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" id="expenseModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Sửa chi phí' : 'Thêm chi phí' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSave">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Ngày <span class="text-danger">*</span></label>
                <input v-model="form.date" class="form-control" required placeholder="ddmmyyyy" maxlength="8" />
                <small class="text-muted">Định dạng: DDMMYYYY (VD: 01012024)</small>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Mô tả <span class="text-danger">*</span></label>
                <input v-model="form.description" class="form-control" required placeholder="Nội dung chi phí" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Số tiền <span class="text-danger">*</span></label>
                <input v-model.number="form.amount" type="number" class="form-control" required min="0" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Ghi chú</label>
                <textarea v-model="form.note" class="form-control" rows="2"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
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
            Xóa chi phí <strong>{{ deleteTarget?.description }}</strong>?
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="handleDelete" :disabled="deleting">
              {{ deleting ? 'Đang xóa...' : 'Xóa' }}
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
import api from '../services/api.js'

const expenses = ref([])
const saving = ref(false)
const deleting = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)

const defaultForm = { date: '', description: '', amount: 0, note: '' }
const form = ref({ ...defaultForm })

function formatCurrency(v) { return (v || 0).toLocaleString('vi-VN') + ' đ' }

function formatDate(d) {
  if (!d || d.length !== 8) return d || ''
  return `${d.substring(0, 2)}-${d.substring(2, 4)}-${d.substring(4, 8)}`
}

const totalAmount = computed(() => expenses.value.reduce((s, e) => s + (e.amount || 0), 0))

let expenseModal = null
let deleteModal = null

onMounted(() => {
  loadExpenses()
  expenseModal = new Modal(document.getElementById('expenseModal'))
  deleteModal = new Modal(document.getElementById('deleteModal'))
})

async function loadExpenses() {
  try { expenses.value = (await api.get('/expenses')).data }
  catch (e) { console.error(e) }
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { ...defaultForm }
  expenseModal.show()
}

function openEditModal(e) {
  isEditing.value = true
  editingId.value = e._id
  form.value = { date: e.date, description: e.description, amount: e.amount, note: e.note }
  expenseModal.show()
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value) await api.put(`/expenses/${editingId.value}`, form.value)
    else await api.post('/expenses', form.value)
    expenseModal.hide()
    await loadExpenses()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi lưu') }
  finally { saving.value = false }
}

function confirmDelete(e) {
  deleteTarget.value = e
  deleteModal.show()
}

async function handleDelete() {
  deleting.value = true
  try {
    await api.delete(`/expenses/${deleteTarget.value._id}`)
    deleteModal.hide()
    await loadExpenses()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi xóa') }
  finally { deleting.value = false }
}
</script>
