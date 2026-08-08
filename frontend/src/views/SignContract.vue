<template>
  <div class="sign-contract-page bg-light min-vh-100 py-4 px-2 px-md-4">
    <div class="container" style="max-width: 800px;">
      <!-- Header -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body text-center p-4">
          <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3" style="width: 56px; height: 56px;">
            <i class="bi bi-file-earmark-check fs-2"></i>
          </div>
          <h4 class="fw-bold mb-1">XÁC NHẬN KÝ HỢP ĐỒNG THUÊ PHÒNG</h4>
          <p class="text-muted mb-0 small">
            Vui lòng đọc kỹ thông tin hợp đồng bên dưới và thực hiện ký điện tử.
          </p>
        </div>
      </div>

      <!-- Loading / Error states -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <div class="mt-2 text-muted">Đang tải nội dung hợp đồng...</div>
      </div>

      <div v-else-if="errorMsg" class="card border-0 shadow-sm text-center p-5">
        <i class="bi bi-exclamation-triangle text-warning display-4 mb-3"></i>
        <h5 class="fw-bold">{{ errorMsg }}</h5>
        <p class="text-muted">Vui lòng kiểm tra lại liên kết hoặc liên hệ với chủ nhà.</p>
      </div>

      <template v-else>
        <!-- Trạng thái đã ký thành công -->
        <div v-if="contract?.tenant_signature" class="alert alert-success border-0 shadow-sm d-flex align-items-center gap-3 p-3 mb-4">
          <i class="bi bi-check-circle-fill fs-1 text-success"></i>
          <div>
            <h6 class="fw-bold mb-1">Hợp đồng đã được ký thành công!</h6>
            <small class="d-block text-secondary">
              Thời gian ký: {{ formatDateTime(contract.tenant_signed_at) }}
            </small>
          </div>
        </div>

        <!-- Khung hiển thị Hợp đồng -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white border-bottom fw-bold d-flex justify-content-between align-items-center">
            <span><i class="bi bi-file-text me-2 text-primary"></i>Mã HĐ: {{ contract?.code }}</span>
            <span class="badge bg-info">Phòng {{ contract?.room_no }}</span>
          </div>
          <div class="card-body p-3 p-md-4">
            <div class="contract-content border rounded p-3 bg-white" v-html="renderedContractHtml"></div>
          </div>
        </div>

        <!-- Khung Ký Tên dành cho người thuê -->
        <div class="card border-0 shadow-sm mb-5">
          <div class="card-header bg-white border-bottom fw-bold">
            <i class="bi bi-pen me-2 text-primary"></i>
            {{ contract?.tenant_signature ? 'Chữ ký điện tử của bạn' : 'Vẽ hoặc tải chữ ký cá nhân' }}
          </div>
          <div class="card-body p-3 p-md-4">
            <!-- Đã ký rồi -->
            <div v-if="contract?.tenant_signature" class="text-center py-3">
              <div class="border rounded p-3 d-inline-block bg-light mb-2">
                <img :src="contract.tenant_signature" alt="Chữ ký người thuê" style="max-height: 120px;" class="img-fluid" />
              </div>
              <p class="text-success small fw-semibold mb-0">
                <i class="bi bi-shield-check me-1"></i>Chữ ký đã được ghi nhận vào hệ thống
              </p>
            </div>

            <!-- Chưa ký: Form ký tên -->
            <div v-else>
              <!-- Selector phương thức ký -->
              <div class="btn-group w-100 mb-3" role="group">
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  :class="{ active: signMethod === 'draw' }"
                  @click="signMethod = 'draw'"
                >
                  <i class="bi bi-brush me-1"></i>Vẽ chữ ký trực tiếp
                </button>
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  :class="{ active: signMethod === 'upload' }"
                  @click="signMethod = 'upload'"
                >
                  <i class="bi bi-upload me-1"></i>Tải ảnh chữ ký (PNG)
                </button>
              </div>

              <!-- Phương thức 1: Vẽ trực tiếp trên Canvas -->
              <div v-show="signMethod === 'draw'" class="mb-3 text-center">
                <div class="canvas-wrapper border rounded p-1 position-relative bg-white">
                  <canvas
                    ref="canvasEl"
                    width="600"
                    height="200"
                    class="signature-canvas"
                    @mousedown="startDrawing"
                    @mousemove="draw"
                    @mouseup="stopDrawing"
                    @mouseleave="stopDrawing"
                    @touchstart.prevent="startDrawingTouch"
                    @touchmove.prevent="drawTouch"
                    @touchend.prevent="stopDrawing"
                  ></canvas>
                  <span v-if="isCanvasEmpty" class="canvas-placeholder text-muted">
                    Dùng ngón tay hoặc chuột vẽ chữ ký tại đây
                  </span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <small class="text-muted"><i class="bi bi-info-circle me-1"></i>Ký trên màn hình cảm ứng hoặc rê chuột</small>
                  <button type="button" class="btn btn-outline-danger btn-sm" @click="clearCanvas">
                    <i class="bi bi-eraser me-1"></i>Xóa vẽ lại
                  </button>
                </div>
              </div>

              <!-- Phương thức 2: Upload file PNG -->
              <div v-show="signMethod === 'upload'" class="mb-3">
                <label class="form-label fw-semibold small">Chọn tệp ảnh chữ ký (PNG/JPG)</label>
                <input type="file" accept="image/*" class="form-control form-control-sm" @change="onSignatureFileChange" />
                <div v-if="uploadedSignature" class="mt-3 text-center border rounded p-2 bg-light">
                  <img :src="uploadedSignature" alt="Preview Signature" style="max-height: 100px;" class="img-fluid" />
                </div>
              </div>

              <!-- Nút xác nhận ký -->
              <div class="mt-4">
                <button
                  type="button"
                  class="btn btn-success btn-lg w-100 py-3 fw-bold"
                  :disabled="signing"
                  @click="submitSignature"
                >
                  <span v-if="signing" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-check2-circle me-2"></i>
                  {{ signing ? 'Đang gửi chữ ký...' : 'XÁC NHẬN KÝ HỢP ĐỒNG' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const token = route.params.token

const loading = ref(true)
const signing = ref(false)
const errorMsg = ref('')
const contract = ref(null)
const template = ref('')

const signMethod = ref('draw') // 'draw' | 'upload'
const canvasEl = ref(null)
const isCanvasEmpty = ref(true)
const isDrawing = ref(false)
const uploadedSignature = ref('')

function formatCurrency(v) { return (v || 0).toLocaleString('vi-VN') + ' đ' }
function formatDate(d) {
  if (!d || d.length !== 8) return d || ''
  return `${d.substring(0, 2)}-${d.substring(2, 4)}-${d.substring(4, 8)}`
}
function formatDateTime(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleString('vi-VN')
}

// Render HTML hợp đồng
const renderedContractHtml = computed(() => {
  if (!template.value || !contract.value) return ''
  let html = template.value
  const c = contract.value
  const now = new Date()

  const sigImgHtml = c.tenant_signature
    ? `<img src="${c.tenant_signature}" style="max-height: 100px; vertical-align: middle; margin: 4px;" alt="Chữ ký người thuê" />`
    : `<span class="text-muted italic">[Chờ người thuê ký...]</span>`

  const data = {
    code: c.code,
    room_no: c.room_no,
    user_name: c.user_id?.name || '--',
    user_phone: c.user_id?.phone || '',
    user_id_number: c.user_id?.id_number || '',
    user_address: c.user_id?.address || '',
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
    current_year: now.getFullYear(),
    user_signature: sigImgHtml
  }

  Object.keys(data).forEach(k => {
    html = html.split('{{' + k + '}}').join(String(data[k]))
  })
  return html
})

async function loadContractData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api.get(`/public/contract/${token}`)
    contract.value = res.data.contract
    template.value = res.data.template || ''
    await nextTick()
    initCanvas()
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Không thể tải thông tin hợp đồng'
  } finally {
    loading.value = false
  }
}

// Canvas Handlers
function initCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = '#0d47a1' // Màu xanh biển (navy blue)
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

function getPos(e) {
  const canvas = canvasEl.value
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function startDrawing(e) {
  isDrawing.value = true
  isCanvasEmpty.value = false
  const ctx = canvasEl.value.getContext('2d')
  ctx.strokeStyle = '#0d47a1' // Màu xanh biển (navy blue)
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const pos = getPos(e)
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
}

function draw(e) {
  if (!isDrawing.value) return
  const ctx = canvasEl.value.getContext('2d')
  ctx.strokeStyle = '#0d47a1' // Màu xanh biển (navy blue)
  const pos = getPos(e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

function stopDrawing() {
  isDrawing.value = false
}

function startDrawingTouch(e) {
  if (!e.touches || e.touches.length === 0) return
  startDrawing(e.touches[0])
}

function drawTouch(e) {
  if (!e.touches || e.touches.length === 0) return
  draw(e.touches[0])
}

function clearCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  isCanvasEmpty.value = true
}

function onSignatureFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('Vui lòng chọn ảnh nhỏ hơn 5MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    uploadedSignature.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

async function submitSignature() {
  let signatureData = ''

  if (signMethod.value === 'draw') {
    if (isCanvasEmpty.value) {
      alert('Vui lòng vẽ chữ ký của bạn trước khi xác nhận!')
      return
    }
    signatureData = canvasEl.value.toDataURL('image/png')
  } else {
    if (!uploadedSignature.value) {
      alert('Vui lòng chọn ảnh chữ ký PNG!')
      return
    }
    signatureData = uploadedSignature.value
  }

  signing.value = true
  try {
    const res = await api.post(`/public/contract/${token}/sign`, {
      tenant_signature: signatureData
    })
    contract.value = res.data.contract
    alert('Ký hợp đồng thành công! Cảm ơn bạn.')
  } catch (e) {
    alert(e.response?.data?.message || 'Có lỗi xảy ra khi ký hợp đồng')
  } finally {
    signing.value = false
  }
}

onMounted(loadContractData)
</script>

<style scoped>
.contract-content {
  font-family: 'Times New Roman', serif;
  line-height: 1.6;
  max-height: 500px;
  overflow-y: auto;
}

.contract-content :deep(h1),
.contract-content :deep(h2) {
  text-align: center;
}

.contract-content :deep(img) {
  max-width: 100%;
  object-fit: contain;
}

.canvas-wrapper {
  background-color: #ffffff;
  touch-action: none;
}

.signature-canvas {
  width: 100%;
  height: 180px;
  background: #ffffff;
  cursor: crosshair;
}

.canvas-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  font-size: 0.9rem;
}
</style>
