<template>
  <AppLayout pageTitle="Quản lý hóa đơn" pageSubtitle="Hóa đơn hàng tháng">
    <!-- Toolbar -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex gap-2 align-items-center">
        <div class="input-group" style="max-width: 250px;">
          <input v-model="selectedMonth" type="month" class="form-control" @change="loadBillings" />
        </div>
        <button class="btn btn-success" @click="openGenerateModal">
          <i class="bi bi-plus-circle me-1"></i>Tạo dữ liệu
        </button>
        <button class="btn btn-outline-danger" @click="confirmBulkDelete" :disabled="billings.length === 0">
          <i class="bi bi-trash me-1"></i>Xóa tất cả
        </button>
      </div>
      <span class="text-muted small">Tổng: <strong>{{ billings.length }}</strong></span>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Tháng</th>
              <th>Phòng</th>
              <th>Người thuê</th>
              <th>Điện (cũ)</th>
              <th>Điện (mới)</th>
              <th>Tiền điện</th>
              <th>Số người</th>
              <th>Phí dịch vụ</th>
              <th>Tiền nước</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="billings.length === 0">
              <td colspan="13" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                Chưa có hóa đơn nào. Chọn tháng và nhấn "Tạo dữ liệu"
              </td>
            </tr>
            <tr v-for="b in billings" :key="b._id">
              <td>{{ formatMonth(b.month) }}</td>
              <td class="fw-semibold">{{ b.room_no }}</td>
              <td>{{ b.user_id?.name || '--' }}</td>
              <td>{{ b.old_electric || 0 }}</td>
              <td>{{ b.new_electric || 0 }}</td>
              <td>{{ formatCurrency(Math.max(0, (b.new_electric || 0) - (b.old_electric || 0)) * (b.electric_price || 0)) }}</td>
              <td>{{ b.number_of_members }}</td>
              <td>{{ formatCurrency(b.service_fee) }}</td>
              <td>{{ formatCurrency((b.water_price || 0) * (b.number_of_members || 1)) }}</td>
              <td class="fw-bold">{{ formatCurrency(b.total_price) }}</td>
              <td>
                <span class="badge" :class="statusBadge(b.status)">{{ statusLabel(b.status) }}</span>
              </td>
              <td>{{ b.note || '--' }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" title="Sửa" @click="openEditModal(b)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-info me-1" title="In phiếu thu" @click="handlePrint(b)">
                  <i class="bi bi-printer"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" title="Chia sẻ" @click="handleShare(b)">
                  <i class="bi bi-share"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Xóa" @click="confirmDelete(b)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="billings.length > 0" class="table-light fw-bold">
            <tr>
              <td colspan="3" class="text-nowrap">Tổng số</td>
              <td>{{ computedTotals().old_electric }}</td>
              <td>{{ computedTotals().new_electric }}</td>
              <td>{{ formatCurrency(computedTotals().electric_fee) }}</td>
              <td>{{ computedTotals().number_of_members }}</td>
              <td>{{ formatCurrency(computedTotals().service_fee) }}</td>
              <td>{{ formatCurrency(computedTotals().water_fee) }}</td>
              <td class="fw-bold text-primary">{{ formatCurrency(computedTotals().total_price) }}</td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Generate Modal -->
    <div class="modal fade" id="generateModal" tabindex="-1">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title">Tạo dữ liệu hóa đơn</h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="mb-1">Chọn tháng để tạo dữ liệu:</p>
            <input v-model="generateMonth" type="month" class="form-control" />
            <div class="form-check mt-2">
              <input v-model="generateForce" class="form-check-input" type="checkbox" id="forceGenerate" />
              <label class="form-check-label text-danger" for="forceGenerate">
                <i class="bi bi-exclamation-triangle me-1"></i>Xóa dữ liệu cũ và tạo lại
              </label>
            </div>
            <small class="text-muted">Dữ liệu sẽ được tạo từ các hợp đồng đang hoạt động</small>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-success" @click="handleGenerate" :disabled="generating">
              {{ generating ? 'Đang tạo...' : 'Tạo' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal fade" id="billingModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sửa hóa đơn - {{ editTarget?.room_no }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSaveEdit">
            <div class="modal-body">
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Số điện cũ</label>
                  <input v-model.number="editForm.old_electric" type="number" class="form-control" min="0" />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Số điện mới</label>
                  <input v-model.number="editForm.new_electric" type="number" class="form-control" min="0" @input="calcTotal" />
                </div>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Số người</label>
                  <input v-model.number="editForm.number_of_members" type="number" class="form-control" min="1" @input="calcTotal" />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Phí dịch vụ</label>
                  <input v-model.number="editForm.service_fee" type="number" class="form-control" min="0" @input="calcTotal" />
                </div>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Đơn giá điện (đ/kWh)</label>
                  <input v-model.number="editForm.electric_price" type="number" class="form-control" min="0" @input="calcTotal" />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Đơn giá nước (đ/người)</label>
                  <input v-model.number="editForm.water_price" type="number" class="form-control" min="0" @input="calcTotal" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Tổng tiền</label>
                <input v-model.number="editForm.total_price" type="number" class="form-control fw-bold" min="0" />
                <small class="text-muted">Tự động tính: tiền phòng + (điện mới - cũ)*đơn giá điện + phí dịch vụ*người + tiền nước*người</small>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Trạng thái</label>
                  <select v-model="editForm.status" class="form-select">
                    <option value="draft">Bản nháp</option>
                    <option value="unpaid">Chưa thu</option>
                    <option value="paid">Đã thu</option>
                    <option value="cancelled">Hủy</option>
                  </select>
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Ghi chú</label>
                  <textarea v-model="editForm.note" class="form-control" rows="1"></textarea>
                </div>
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
            Xóa hóa đơn tháng {{ formatMonth(deleteTarget?.month) }} phòng <strong>{{ deleteTarget?.room_no }}</strong>?
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

    <!-- Bulk Delete Confirm Modal -->
    <div class="modal fade" id="bulkDeleteModal" tabindex="-1">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h6 class="modal-title">Xác nhận xóa tất cả</h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Xóa tất cả <strong>{{ billings.length }}</strong> hóa đơn tháng <strong>{{ formatMonth(selectedMonth?.replace('-', '')) }}</strong>?</p>
            <p class="text-danger mb-0"><small><i class="bi bi-exclamation-triangle me-1"></i>Hành động này không thể hoàn tác!</small></p>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="handleBulkDelete" :disabled="bulkDeleting">
              {{ bulkDeleting ? 'Đang xóa...' : 'Xóa tất cả' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Print Preview Modal -->
    <div class="modal fade" id="printModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">In phiếu thu - {{ printTarget?.room_no }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- Receipt Preview -->
            <div id="receipt-content" class="receipt-preview p-4">
              <div class="text-center mb-4">
                <h4 class="fw-bold mb-1">PHIẾU THU TIỀN NHÀ</h4>
                <p class="text-muted mb-0">Tháng {{ formatMonth(printTarget?.month) }}</p>
              </div>
              <hr />
              <div class="row mb-3">
                <div class="col-6">
                  <small class="text-muted">Phòng:</small>
                  <strong class="d-block fs-5">{{ printTarget?.room_no }}</strong>
                </div>
                <div class="col-6 text-end">
                  <small class="text-muted">Người thuê:</small>
                  <strong class="d-block">{{ printTarget?.user_id?.name || '--' }}</strong>
                </div>
              </div>
              <hr />
              <table class="table table-borderless mb-0">
                <tbody>
                  <tr v-if="(printTarget?.room_price || 0) > 0">
                    <td class="ps-0 text-muted">Tiền phòng</td>
                    <td class="text-end fw-bold">{{ formatCurrency(printTarget?.room_price) }}</td>
                  </tr>
                  <tr v-if="electricFee(printTarget) > 0">
                    <td class="ps-0 text-muted">
                      Điện ({{ printTarget?.old_electric || 0 }} → {{ printTarget?.new_electric || 0 }})
                      <small class="d-block text-muted">{{ Math.max(0, (printTarget?.new_electric || 0) - (printTarget?.old_electric || 0)) }} kWh × {{ formatCurrency(printTarget?.electric_price) }}/kWh</small>
                    </td>
                    <td class="text-end fw-bold">{{ formatCurrency(electricFee(printTarget)) }}</td>
                  </tr>
                  <tr v-if="waterFee(printTarget) > 0">
                    <td class="ps-0 text-muted">Nước <small class="d-block text-muted">{{ printTarget?.number_of_members || 1 }} người × {{ formatCurrency(printTarget?.water_price) }}/người</small></td>
                    <td class="text-end fw-bold">{{ formatCurrency(waterFee(printTarget)) }}</td>
                  </tr>
                  <tr v-if="serviceFee(printTarget) > 0">
                    <td class="ps-0 text-muted">Phí dịch vụ <small class="d-block text-muted">{{ printTarget?.number_of_members || 1 }} người × {{ formatCurrency(printTarget?.service_fee) }}/người</small></td>
                    <td class="text-end fw-bold">{{ formatCurrency(serviceFee(printTarget)) }}</td>
                  </tr>
                  <tr :class="hasAnyItem(printTarget) ? 'border-top' : 'border-0'">
                    <td class="ps-0 pt-3"><strong class="fs-5">TỔNG CỘNG</strong></td>
                    <td class="text-end pt-3"><strong class="fs-5 text-primary">{{ formatCurrency(printTarget?.total_price) }}</strong></td>
                  </tr>
                </tbody>
              </table>
              <hr />
              <div class="row">
                <div class="col-6">
                  <small class="text-muted">Trạng thái:</small>
                  <span class="badge ms-1" :class="statusBadge(printTarget?.status)">{{ statusLabel(printTarget?.status) }}</span>
                </div>
                <div class="col-6 text-end" v-if="printTarget?.note">
                  <small class="text-muted">Ghi chú:</small>
                  <span class="d-block">{{ printTarget?.note }}</span>
                </div>
              </div>
            </div>

            <!-- Share URL -->
            <hr />
            <div class="mb-2">
              <label class="form-label fw-semibold">
                <i class="bi bi-link-45deg me-1"></i>Link chia sẻ hóa đơn này
              </label>
              <div class="input-group">
                <input :value="printShareUrl" type="text" class="form-control" readonly ref="printUrlInput" @click="selectText($event)" />
                <button class="btn btn-outline-primary" @click="copyPrintUrl" :disabled="!printShareUrl">
                  <i class="bi bi-clipboard me-1"></i>Sao chép
                </button>
              </div>
              <small class="text-muted">Link này có thể gửi cho người thuê để xem chi tiết hóa đơn</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" @click="handlePrintReceipt">
              <i class="bi bi-printer me-1"></i>In phiếu thu
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div class="modal fade" id="shareModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chia sẻ hóa đơn - {{ shareTarget?.room_no }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="mb-2">Sao chép link bên dưới để gửi cho người thuê:</p>
            <div class="input-group">
              <input :value="shareUrl" type="text" class="form-control" readonly ref="shareUrlInput" @click="selectText($event)" />
              <button class="btn btn-outline-primary" @click="copyShareUrl" :disabled="!shareUrl">
                <i class="bi bi-clipboard me-1"></i>Sao chép
              </button>
            </div>
            <small class="text-muted d-block mt-1">
              <i class="bi bi-info-circle me-1"></i>
              Người nhận có thể xem chi tiết hóa đơn mà không cần đăng nhập
            </small>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-success" @click="copyShareUrl">
              <i class="bi bi-clipboard-check me-1"></i>Sao chép link
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

const billings = ref([])
const selectedMonth = ref('')
const saving = ref(false)
const deleting = ref(false)
const generating = ref(false)
const bulkDeleting = ref(false)
const generateMonth = ref('')
const generateForce = ref(false)
const editTarget = ref(null)
const deleteTarget = ref(null)

const editForm = ref({
  old_electric: 0, new_electric: 0,
  electric_price: 0, water_price: 0,
  number_of_members: 1, service_fee: 0,
  room_price: 0, total_price: 0,
  status: 'draft', note: ''
})

// Print & Share state
const printTarget = ref(null)
const shareTarget = ref(null)
const printShareUrl = ref('')
const shareUrl = ref('')
const printUrlInput = ref(null)
const shareUrlInput = ref(null)

function formatCurrency(v) { return (v || 0).toLocaleString('vi-VN') + ' đ' }

function electricFee(b) {
  return Math.max(0, (b?.new_electric || 0) - (b?.old_electric || 0)) * (b?.electric_price || 0)
}

function waterFee(b) {
  return (b?.water_price || 0) * (b?.number_of_members || 1)
}

function serviceFee(b) {
  return (b?.service_fee || 0) * (b?.number_of_members || 1)
}

function hasAnyItem(b) {
  return (b?.room_price || 0) > 0 || electricFee(b) > 0 || waterFee(b) > 0 || serviceFee(b) > 0
}

function computedTotals() {
  const totals = { old_electric: 0, new_electric: 0, number_of_members: 0, service_fee: 0, water_fee: 0, electric_fee: 0, total_price: 0 }
  billings.value.forEach(b => {
    totals.old_electric += b.old_electric || 0
    totals.new_electric += b.new_electric || 0
    totals.number_of_members += b.number_of_members || 0
    totals.service_fee += b.service_fee || 0
    totals.water_fee += (b.water_price || 0) * (b.number_of_members || 1)
    totals.electric_fee += Math.max(0, (b.new_electric || 0) - (b.old_electric || 0)) * (b.electric_price || 0)
    totals.total_price += b.total_price || 0
  })
  return totals
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

let generateModal = null
let billingModal = null
let deleteModal = null
let bulkDeleteModal = null
let printModal = null
let shareModal = null

onMounted(() => {
  // Set default to current month
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  selectedMonth.value = `${y}-${m}`
  generateMonth.value = selectedMonth.value

  loadBillings()
  generateModal = new Modal(document.getElementById('generateModal'))
  billingModal = new Modal(document.getElementById('billingModal'))
  deleteModal = new Modal(document.getElementById('deleteModal'))
  bulkDeleteModal = new Modal(document.getElementById('bulkDeleteModal'))
  printModal = new Modal(document.getElementById('printModal'))
  shareModal = new Modal(document.getElementById('shareModal'))
})

async function loadBillings() {
  if (!selectedMonth.value) return
  const month = selectedMonth.value.replace('-', '')
  try { billings.value = (await api.get(`/monthly-billings?month=${month}`)).data }
  catch (e) { console.error(e) }
}

function openGenerateModal() {
  generateModal.show()
}

async function handleGenerate() {
  if (!generateMonth.value) return alert('Vui lòng chọn tháng')
  generating.value = true
  try {
    const month = generateMonth.value.replace('-', '')
    await api.post('/monthly-billings/generate', { month, force: generateForce.value })
    generateModal.hide()
    selectedMonth.value = generateMonth.value
    await loadBillings()
  } catch (e) {
    alert(e.response?.data?.message || 'Lỗi khi tạo dữ liệu')
  } finally { generating.value = false }
}

function calcTotal() {
  const electricUsed = Math.max(0, (editForm.value.new_electric || 0) - (editForm.value.old_electric || 0))
  const electricCost = electricUsed * (editForm.value.electric_price || 0)
  const waterCost = (editForm.value.number_of_members || 1) * (editForm.value.water_price || 0)
  const serviceCost = (editForm.value.number_of_members || 1) * (editForm.value.service_fee || 0)
  editForm.value.total_price = (editForm.value.room_price || 0) + electricCost + waterCost + serviceCost
}

function openEditModal(b) {
  editTarget.value = b
  editForm.value = {
    old_electric: b.old_electric || 0, new_electric: b.new_electric || 0,
    electric_price: b.electric_price || 0,
    water_price: b.water_price || 0,
    number_of_members: b.number_of_members || 1,
    service_fee: b.service_fee || 0,
    room_price: b.room_price || 0,
    total_price: b.total_price || 0,
    status: b.status || 'draft',
    note: b.note || ''
  }
  billingModal.show()
}

async function handleSaveEdit() {
  saving.value = true
  try {
    await api.put(`/monthly-billings/${editTarget.value._id}`, editForm.value)
    billingModal.hide()
    await loadBillings()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi lưu') }
  finally { saving.value = false }
}

function confirmDelete(b) {
  deleteTarget.value = b
  deleteModal.show()
}

async function handleDelete() {
  deleting.value = true
  try {
    await api.delete(`/monthly-billings/${deleteTarget.value._id}`)
    deleteModal.hide()
    await loadBillings()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi xóa') }
  finally { deleting.value = false }
}

function confirmBulkDelete() {
  bulkDeleteModal.show()
}

async function handleBulkDelete() {
  if (!selectedMonth.value) return
  bulkDeleting.value = true
  try {
    const month = selectedMonth.value.replace('-', '')
    await api.delete(`/monthly-billings/month/${month}`)
    bulkDeleteModal.hide()
    await loadBillings()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi khi xóa tất cả') }
  finally { bulkDeleting.value = false }
}

// Print & Share handlers
async function getShareUrl(b) {
  try {
    const res = await api.post(`/monthly-billings/${b._id}/share`)
    // Tự tạo link từ origin của frontend (http://localhost:5173 khi dev, domain Vercel khi production)
    // Không dùng share_url từ backend vì qua Vite proxy Host header bị đổi thành localhost:3000
    const token = res.data.share_token
    return `${window.location.origin}/shared-billing/${token}`
  } catch (e) {
    alert(e.response?.data?.message || 'Lỗi khi tạo link chia sẻ')
    return null
  }
}

function selectText(event) {
  event.target.select()
  event.target.setSelectionRange(0, 99999)
}

async function copyToClipboard(text, inputRef) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      if (inputRef.value) {
        inputRef.value.select()
        inputRef.value.setSelectionRange(0, 99999)
        document.execCommand('copy')
      }
    }
    // Visual feedback
    const btn = inputRef.value?.nextElementSibling
    if (btn) {
      const originalHtml = btn.innerHTML
      btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Đã sao chép!'
      btn.classList.remove('btn-outline-primary')
      btn.classList.add('btn-success')
      setTimeout(() => {
        btn.innerHTML = originalHtml
        btn.classList.remove('btn-success')
        btn.classList.add('btn-outline-primary')
      }, 2000)
    }
  } catch (e) {
    console.error('Copy failed:', e)
  }
}

async function handlePrint(b) {
  const url = await getShareUrl(b)
  if (!url) return
  printTarget.value = b
  printShareUrl.value = url
  printModal.show()
}

function handlePrintReceipt() {
  const receiptContent = document.getElementById('receipt-content')
  if (!receiptContent) return

  const printWindow = window.open('', '_blank', 'width=800,height=600')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Phiếu thu - ${printTarget.value?.room_no || ''}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; }
        .text-center { text-align: center; }
        .fw-bold { font-weight: bold; }
        .fs-5 { font-size: 1.25rem; }
        .text-muted { color: #6c757d; }
        .text-primary { color: #0d6efd; }
        .text-end { text-align: right; }
        .mb-0 { margin-bottom: 0; }
        .mb-4 { margin-bottom: 1.5rem; }
        .mb-3 { margin-bottom: 1rem; }
        .ps-0 { padding-left: 0; }
        .pt-3 { padding-top: 1rem; }
        .d-block { display: block; }
        .badge {
          display: inline-block; padding: 0.35em 0.65em;
          font-size: 0.75em; font-weight: 700; line-height: 1;
          text-align: center; border-radius: 0.375rem;
        }
        .bg-secondary { background-color: #6c757d; color: white; }
        .bg-warning { background-color: #ffc107; color: #000; }
        .bg-success { background-color: #198754; color: white; }
        .bg-danger { background-color: #dc3545; color: white; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 0.5rem 0; }
        .border-top { border-top: 2px solid #dee2e6; }
        hr { border: none; border-top: 1px solid #dee2e6; margin: 1rem 0; }
        .row { display: flex; flex-wrap: wrap; }
        .col-6 { flex: 0 0 auto; width: 50%; }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      ${receiptContent.outerHTML}
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()

  // Wait for content to render then print
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

function copyPrintUrl() {
  copyToClipboard(printShareUrl.value, printUrlInput)
}

async function handleShare(b) {
  const url = await getShareUrl(b)
  if (!url) return
  shareTarget.value = b
  shareUrl.value = url
  shareModal.show()
}

function copyShareUrl() {
  copyToClipboard(shareUrl.value, shareUrlInput)
}
</script>
