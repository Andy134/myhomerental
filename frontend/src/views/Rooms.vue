<template>
  <AppLayout pageTitle="Quản lý phòng trọ" pageSubtitle="Danh sách các phòng trọ">
    <!-- Toolbar -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="openAddModal">
          <i class="bi bi-plus-lg me-1"></i>Thêm phòng
        </button>
      </div>
      <div class="text-muted small">
        Tổng số: <strong>{{ rooms.length }}</strong> phòng
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Mã phòng</th>
              <th>Thông tin</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rooms.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                Chưa có phòng trọ nào
              </td>
            </tr>
            <tr v-for="room in rooms" :key="room._id">
              <td class="fw-semibold">{{ room.room_no }}</td>
              <td>{{ room.info || '--' }}</td>
              <td>{{ formatCurrency(room.price) }}</td>
              <td>
                <span class="badge" :class="statusBadge(room.status)">
                  {{ statusLabel(room.status) }}
                </span>
              </td>
              <td>{{ room.note || '--' }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" title="Sửa" @click="openEditModal(room)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Xóa" @click="confirmDelete(room)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" id="roomModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Sửa phòng' : 'Thêm phòng' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSave">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Mã phòng <span class="text-danger">*</span></label>
                <input v-model="form.room_no" class="form-control" required placeholder="VD: P.101" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Thông tin</label>
                <textarea v-model="form.info" class="form-control" rows="2" placeholder="Mô tả phòng"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Giá <span class="text-danger">*</span></label>
                <input v-model.number="form.price" type="number" class="form-control" required min="0" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Trạng thái</label>
                <select v-model="form.status" class="form-select">
                  <option value="available">Trống</option>
                  <option value="occupied">Đang ở</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
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
            Bạn có chắc muốn xóa phòng <strong>{{ deleteTarget?.room_no }}</strong>?
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
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import AppLayout from '../components/AppLayout.vue'
import api from '../services/api.js'

const rooms = ref([])
const saving = ref(false)
const deleting = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)

const defaultForm = { room_no: '', info: '', price: 0, status: 'available', note: '' }
const form = ref({ ...defaultForm })

function formatCurrency(v) { return (v || 0).toLocaleString('vi-VN') + ' đ' }
function statusLabel(s) { return { available: 'Trống', occupied: 'Đang ở', maintenance: 'Bảo trì' }[s] || s }
function statusBadge(s) { return { available: 'bg-success', occupied: 'bg-primary', maintenance: 'bg-warning' }[s] || 'bg-secondary' }

let roomModal = null
let deleteModal = null

onMounted(() => {
  loadRooms()
  roomModal = new Modal(document.getElementById('roomModal'))
  deleteModal = new Modal(document.getElementById('deleteModal'))
})

async function loadRooms() {
  try { rooms.value = (await api.get('/rooms')).data }
  catch (e) { console.error(e) }
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { ...defaultForm }
  roomModal.show()
}

function openEditModal(room) {
  isEditing.value = true
  editingId.value = room._id
  form.value = { ...room }
  roomModal.show()
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/rooms/${editingId.value}`, form.value)
    } else {
      await api.post('/rooms', form.value)
    }
    roomModal.hide()
    await loadRooms()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi lưu') }
  finally { saving.value = false }
}

function confirmDelete(room) {
  deleteTarget.value = room
  deleteModal.show()
}

async function handleDelete() {
  deleting.value = true
  try {
    await api.delete(`/rooms/${deleteTarget.value._id}`)
    deleteModal.hide()
    await loadRooms()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi xóa') }
  finally { deleting.value = false }
}
</script>

