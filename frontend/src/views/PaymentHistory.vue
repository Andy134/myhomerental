<template>
  <AppLayout pageTitle="Lịch sử thanh toán" pageSubtitle="Báo cáo tổng hợp các hóa đơn đã thanh toán">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
      <div>
        <div class="text-muted small">Tổng hóa đơn đã thu</div>
        <div class="fs-4 fw-bold text-success">{{ formatCurrency(totalAmount) }}</div>
      </div>
      <button class="btn btn-outline-primary" @click="openFilterModal">
        <i class="bi bi-funnel me-1"></i>Lọc báo cáo
        <span v-if="activeFilters.length" class="badge text-bg-primary ms-1">{{ activeFilters.length }}</span>
      </button>
    </div>

    <div v-if="activeFilters.length" class="d-flex flex-wrap align-items-center gap-2 mb-3">
      <span class="small text-muted">Đang lọc:</span>
      <span v-for="filter in activeFilters" :key="filter.key" class="badge rounded-pill text-bg-light border text-dark filter-badge">
        {{ filter.label }}
        <button type="button" class="btn-close ms-2" aria-label="Bỏ lọc" @click="removeFilter(filter.key)"></button>
      </span>
      <button class="btn btn-link btn-sm text-decoration-none p-0" @click="clearFilters">Xóa tất cả</button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <span class="fw-semibold">Danh sách đã thanh toán</span>
        <span class="text-muted small">{{ filteredBillings.length }} hóa đơn</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light"><tr>
            <th>Tháng</th><th>Phòng</th><th>Hợp đồng</th><th>Người thuê</th><th class="text-end">Tổng tiền</th><th>Ghi chú</th>
          </tr></thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="text-center py-5 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Đang tải dữ liệu...</td></tr>
            <tr v-else-if="!filteredBillings.length"><td colspan="6" class="text-center py-5 text-muted"><i class="bi bi-inbox fs-3 d-block mb-2"></i>Không tìm thấy hóa đơn đã thanh toán phù hợp.</td></tr>
            <tr v-for="billing in filteredBillings" :key="billing._id">
              <td>{{ formatMonth(billing.month) }}</td>
              <td class="fw-semibold">{{ billing.room_no }}</td>
              <td>{{ contractFor(billing)?.code || '--' }}</td>
              <td>{{ billing.user_id?.name || '--' }}</td>
              <td class="text-end fw-bold text-success">{{ formatCurrency(billing.total_price) }}</td>
              <td>{{ billing.note || '--' }}</td>
            </tr>
          </tbody>
          <tfoot v-if="filteredBillings.length" class="table-light"><tr><td colspan="4" class="fw-bold">Tổng cộng</td><td class="text-end fw-bold text-success">{{ formatCurrency(totalAmount) }}</td><td></td></tr></tfoot>
        </table>
      </div>
    </div>

    <div class="modal fade" id="paymentHistoryFilterModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title"><i class="bi bi-funnel me-2"></i>Lọc lịch sử thanh toán</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">
          <div class="mb-3"><label class="form-label">Phòng</label><select v-model="draftFilters.roomId" class="form-select"><option value="">Tất cả phòng</option><option v-for="room in rooms" :key="room._id" :value="room._id">{{ room.room_no }}</option></select></div>
          <div class="mb-3"><label class="form-label">Hợp đồng</label><select v-model="draftFilters.contractId" class="form-select"><option value="">Tất cả hợp đồng</option><option v-for="contract in contracts" :key="contract._id" :value="contract._id">{{ contract.code }} — Phòng {{ contract.room_no }}</option></select></div>
          <div class="mb-3"><label class="form-label">Người thuê</label><select v-model="draftFilters.userId" class="form-select"><option value="">Tất cả người thuê</option><option v-for="user in users" :key="user._id" :value="user._id">{{ user.name }}</option></select></div>
          <div class="row"><div class="col-md-6 mb-3 mb-md-0"><label class="form-label">Từ tháng</label><input v-model="draftFilters.fromMonth" type="month" class="form-control"></div><div class="col-md-6"><label class="form-label">Đến tháng</label><input v-model="draftFilters.toMonth" type="month" class="form-control"></div></div>
        </div>
        <div class="modal-footer"><button type="button" class="btn btn-link text-decoration-none me-auto" @click="resetDraft">Xóa bộ lọc</button><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button><button type="button" class="btn btn-primary" @click="applyFilters"><i class="bi bi-check-lg me-1"></i>Áp dụng</button></div>
      </div></div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'
import AppLayout from '../components/AppLayout.vue'
import api from '../services/api.js'

const billings = ref([]), rooms = ref([]), users = ref([]), contracts = ref([]), loading = ref(false)
const filters = ref({ roomId: '', contractId: '', userId: '', fromMonth: '', toMonth: '' })
const draftFilters = ref({ ...filters.value })
let filterModal

const idOf = value => typeof value === 'object' ? value?._id : value
const monthFromDate = value => {
  const date = String(value || '')
  // Hợp đồng lưu ngày theo định dạng ddmmyyyy, còn dữ liệu cũ có thể là yyyy-mm-dd.
  if (/^\d{8}$/.test(date)) return `${date.slice(4)}${date.slice(2, 4)}`
  return date.length >= 7 ? date.slice(0, 7).replace('-', '') : ''
}
function contractFor(billing) {
  const exact = contracts.value.filter(contract => idOf(contract.room_id) === idOf(billing.room_id) && idOf(contract.user_id) === idOf(billing.user_id))
  const inTerm = exact.find(contract => billing.month >= monthFromDate(contract.start_date) && billing.month <= monthFromDate(contract.end_date))
  return inTerm || exact[0]
}
const filteredBillings = computed(() => billings.value.filter(billing => {
  if (billing.status !== 'paid') return false
  const f = filters.value, contract = contractFor(billing)
  return (!f.roomId || idOf(billing.room_id) === f.roomId) && (!f.userId || idOf(billing.user_id) === f.userId) && (!f.contractId || contract?._id === f.contractId) && (!f.fromMonth || billing.month >= f.fromMonth.replace('-', '')) && (!f.toMonth || billing.month <= f.toMonth.replace('-', ''))
}))
const totalAmount = computed(() => filteredBillings.value.reduce((sum, billing) => sum + (billing.total_price || 0), 0))
const activeFilters = computed(() => {
  const f = filters.value, find = (items, id, field = 'name') => items.find(item => item._id === id)?.[field]
  return [
    f.roomId && { key: 'roomId', label: `Phòng: ${find(rooms.value, f.roomId, 'room_no')}` },
    f.contractId && { key: 'contractId', label: `Hợp đồng: ${find(contracts.value, f.contractId, 'code')}` },
    f.userId && { key: 'userId', label: `Người thuê: ${find(users.value, f.userId)}` },
    f.fromMonth && { key: 'fromMonth', label: `Từ: ${formatMonth(f.fromMonth.replace('-', ''))}` },
    f.toMonth && { key: 'toMonth', label: `Đến: ${formatMonth(f.toMonth.replace('-', ''))}` }
  ].filter(Boolean)
})
function formatCurrency(value) { return (value || 0).toLocaleString('vi-VN') + ' đ' }
function formatMonth(value) { return value?.length === 6 ? `${value.slice(4)}/${value.slice(0, 4)}` : value || '' }
function openFilterModal() { draftFilters.value = { ...filters.value }; filterModal.show() }
function applyFilters() { filters.value = { ...draftFilters.value }; filterModal.hide() }
function resetDraft() { draftFilters.value = { roomId: '', contractId: '', userId: '', fromMonth: '', toMonth: '' } }
function removeFilter(key) { filters.value = { ...filters.value, [key]: '' } }
function clearFilters() { filters.value = { roomId: '', contractId: '', userId: '', fromMonth: '', toMonth: '' } }
onMounted(async () => {
  filterModal = new Modal(document.getElementById('paymentHistoryFilterModal'))
  loading.value = true
  try {
    const [billingRes, roomRes, userRes, contractRes] = await Promise.all([api.get('/monthly-billings'), api.get('/rooms'), api.get('/users'), api.get('/contracts')])
    billings.value = billingRes.data; rooms.value = roomRes.data; users.value = userRes.data; contracts.value = contractRes.data
  } catch (error) { console.error('Không thể tải lịch sử thanh toán', error) }
  finally { loading.value = false }
})
</script>

<style scoped>
.filter-badge { display: inline-flex; align-items: center; padding: .45rem .6rem; font-weight: 500; }
.filter-badge .btn-close { width: .45rem; height: .45rem; font-size: .55rem; }
</style>
