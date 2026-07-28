<template>
  <AppLayout pageTitle="Quản lý người thuê" pageSubtitle="Danh sách người thuê trọ">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-primary" @click="openAddModal">
        <i class="bi bi-plus-lg me-1"></i>Thêm người thuê
      </button>
      <span class="text-muted small">Tổng: <strong>{{ users.length }}</strong></span>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Tên</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Giấy tờ</th>
              <th>Ghi chú</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                Chưa có người thuê nào
              </td>
            </tr>
            <tr v-for="u in users" :key="u._id">
              <td class="fw-semibold">{{ u.name }}</td>
              <td>{{ u.phone || '--' }}</td>
              <td>{{ u.email || '--' }}</td>
              <td>{{ u.document || '--' }}</td>
              <td>{{ u.note || '--' }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" title="Sửa" @click="openEditModal(u)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Xóa" @click="confirmDelete(u)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" id="userModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Sửa người thuê' : 'Thêm người thuê' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSave">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Tên <span class="text-danger">*</span></label>
                <input v-model="form.name" class="form-control" required placeholder="Họ tên người thuê" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Điện thoại</label>
                <input v-model="form.phone" class="form-control" placeholder="Số điện thoại" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Email</label>
                <input v-model="form.email" type="email" class="form-control" placeholder="Email" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Giấy tờ</label>
                <input v-model="form.document" class="form-control" placeholder="CMND/CCCD" />
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
            Bạn có chắc muốn xóa <strong>{{ deleteTarget?.name }}</strong>?
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

const users = ref([])
const saving = ref(false)
const deleting = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)

const defaultForm = { name: '', phone: '', email: '', document: '', note: '' }
const form = ref({ ...defaultForm })

let userModal = null
let deleteModal = null

onMounted(() => {
  loadUsers()
  userModal = new Modal(document.getElementById('userModal'))
  deleteModal = new Modal(document.getElementById('deleteModal'))
})

async function loadUsers() {
  try { users.value = (await api.get('/users')).data }
  catch (e) { console.error(e) }
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { ...defaultForm }
  userModal.show()
}

function openEditModal(u) {
  isEditing.value = true
  editingId.value = u._id
  form.value = { ...u }
  userModal.show()
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value) await api.put(`/users/${editingId.value}`, form.value)
    else await api.post('/users', form.value)
    userModal.hide()
    await loadUsers()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi lưu') }
  finally { saving.value = false }
}

function confirmDelete(u) {
  deleteTarget.value = u
  deleteModal.show()
}

async function handleDelete() {
  deleting.value = true
  try {
    await api.delete(`/users/${deleteTarget.value._id}`)
    deleteModal.hide()
    await loadUsers()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi xóa') }
  finally { deleting.value = false }
}
</script>

