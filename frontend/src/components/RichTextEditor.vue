<template>
  <div class="rich-editor">
    <!-- Toolbar -->
    <div class="editor-toolbar d-flex flex-wrap align-items-center gap-1 p-2 border">
      <button type="button" class="btn btn-outline-secondary btn-sm" title="In đậm" @mousedown.prevent="exec('bold')">
        <i class="bi bi-type-bold"></i>
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="In nghiêng" @mousedown.prevent="exec('italic')">
        <i class="bi bi-type-italic"></i>
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="Gạch chân" @mousedown.prevent="exec('underline')">
        <i class="bi bi-type-underline"></i>
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="Gạch ngang" @mousedown.prevent="exec('strikeThrough')">
        <i class="bi bi-type-strikethrough"></i>
      </button>
      <div class="vr mx-1"></div>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="Tiêu đề 1" @mousedown.prevent="exec('formatBlock', 'h1')">
        H1
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="Tiêu đề 2" @mousedown.prevent="exec('formatBlock', 'h2')">
        H2
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="Đoạn văn" @mousedown.prevent="exec('formatBlock', 'p')">
        ¶
      </button>
      <div class="vr mx-1"></div>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="Danh sách không số" @mousedown.prevent="exec('insertUnorderedList')">
        <i class="bi bi-list-ul"></i>
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="Danh sách có số" @mousedown.prevent="exec('insertOrderedList')">
        <i class="bi bi-list-ol"></i>
      </button>
      <div class="vr mx-1"></div>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="Căn trái" @mousedown.prevent="exec('justifyLeft')">
        <i class="bi bi-text-left"></i>
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="Căn giữa" @mousedown.prevent="exec('justifyCenter')">
        <i class="bi bi-text-center"></i>
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm" title="Căn phải" @mousedown.prevent="exec('justifyRight')">
        <i class="bi bi-text-right"></i>
      </button>

      <!-- Chèn placeholder -->
      <div class="vr mx-1"></div>
      <select class="form-select form-select-sm" style="width: auto;" @change="insertPlaceholder($event)">
        <option value="">Chèn biến...</option>
        <option v-for="p in placeholders" :key="p.value" :value="p.value">{{ p.label }}</option>
      </select>

      <!-- Chèn ảnh / Chữ ký -->
      <div class="vr mx-1"></div>
      <button type="button" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" title="Chèn ảnh hoặc chữ ký cá nhân (PNG, JPG)" @click="openImageModal">
        <i class="bi bi-image"></i>
        <span>Chèn ảnh / Chữ ký</span>
      </button>
    </div>

    <!-- Editable area -->
    <div
      ref="editorEl"
      class="editor-area form-control"
      contenteditable="true"
      :style="{ minHeight: minHeight + 'px' }"
      @input="onInput"
      @keyup="saveSelection"
      @mouseup="saveSelection"
    ></div>

    <!-- Modal Chèn Ảnh / Chữ ký -->
    <div v-if="showImageModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fs-6 fw-bold">
              <i class="bi bi-image me-2 text-primary"></i>Chèn ảnh / Chữ ký cá nhân
            </h5>
            <button type="button" class="btn-close" @click="showImageModal = false"></button>
          </div>
          <div class="modal-body">
            <!-- Navigation tabs -->
            <ul class="nav nav-pills nav-fill mb-3">
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link btn-sm"
                  :class="{ active: imageTab === 'upload' }"
                  @click="imageTab = 'upload'"
                >
                  <i class="bi bi-upload me-1"></i>Tải từ máy (PNG, JPG)
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link btn-sm"
                  :class="{ active: imageTab === 'url' }"
                  @click="imageTab = 'url'"
                >
                  <i class="bi bi-link-45deg me-1"></i>Đường dẫn URL
                </button>
              </li>
            </ul>

            <!-- Tab: Upload từ máy -->
            <div v-if="imageTab === 'upload'" class="mb-3">
              <label class="form-label fw-semibold small">Chọn tệp ảnh chữ ký (PNG / JPG / WEBP)</label>
              <input type="file" accept="image/*" class="form-control form-control-sm" @change="onImageFileChange" />
              <small class="text-muted d-block mt-1">
                <i class="bi bi-info-circle me-1"></i>Khuyên dùng ảnh PNG nền trong suốt để làm chữ ký cá nhân.
              </small>
            </div>

            <!-- Tab: URL -->
            <div v-else class="mb-3">
              <label class="form-label fw-semibold small">Đường dẫn URL của ảnh</label>
              <input
                v-model.trim="imageUrl"
                type="url"
                class="form-control form-control-sm"
                placeholder="https://example.com/signature.png"
                @input="imagePreview = imageUrl"
              />
            </div>

            <!-- Xem trước ảnh -->
            <div v-if="imagePreview" class="mb-3">
              <label class="form-label fw-semibold small">Xem trước ảnh:</label>
              <div class="image-preview-container p-2 text-center border rounded bg-light">
                <img :src="imagePreview" alt="Preview" :style="{ maxHeight: imgMaxHeight + 'px' }" class="img-fluid" />
              </div>
            </div>

            <!-- Tùy chỉnh kích thước hiển thị -->
            <div class="mb-3">
              <label class="form-label fw-semibold small">Chiều cao chữ ký / ảnh:</label>
              <div class="d-flex align-items-center gap-2">
                <button
                  v-for="h in [80, 120, 180]"
                  :key="h"
                  type="button"
                  class="btn btn-sm"
                  :class="imgMaxHeight === h ? 'btn-primary' : 'btn-outline-secondary'"
                  @click="imgMaxHeight = h"
                >
                  {{ h }}px {{ h === 120 ? '(Chuẩn)' : '' }}
                </button>
                <div class="input-group input-group-sm ms-auto" style="max-width: 120px;">
                  <input v-model.number="imgMaxHeight" type="number" min="20" max="600" class="form-control" />
                  <span class="input-group-text">px</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" @click="showImageModal = false">Hủy</button>
            <button type="button" class="btn btn-primary btn-sm" :disabled="!imagePreview && !imageUrl" @click="insertImage">
              <i class="bi bi-check-lg me-1"></i>Chèn vào hợp đồng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholders: { type: Array, default: () => [] },
  minHeight: { type: Number, default: 300 }
})

const emit = defineEmits(['update:modelValue'])

const editorEl = ref(null)
const innerHtml = ref(props.modelValue || '')

// State Modal chèn ảnh
const showImageModal = ref(false)
const imageTab = ref('upload') // 'upload' | 'url'
const imageUrl = ref('')
const imagePreview = ref('')
const imgMaxHeight = ref(120) // Mặc định 120px phù hợp làm chữ ký
let savedRange = null

// Danh sách placeholder mặc định (nếu không truyền vào)
const defaultPlaceholders = [
  { value: '{{code}}', label: 'Mã hợp đồng' },
  { value: '{{room_no}}', label: 'Số phòng' },
  { value: '{{user_name}}', label: 'Tên người thuê' },
  { value: '{{user_phone}}', label: 'Số điện thoại' },
  { value: '{{user_id_number}}', label: 'CMND/CCCD' },
  { value: '{{user_date_of_birth}}', label: 'Ngày tháng năm sinh' },
  { value: '{{user_permanent_address}}', label: 'Địa chỉ thường trú' },
  { value: '{{user_address}}', label: 'Địa chỉ thường trú (tương thích mẫu cũ)' },
  { value: '{{start_date}}', label: 'Ngày bắt đầu' },
  { value: '{{end_date}}', label: 'Ngày kết thúc' },
  { value: '{{deposit}}', label: 'Tiền cọc' },
  { value: '{{room_price}}', label: 'Giá phòng' },
  { value: '{{electric_price}}', label: 'Đơn giá điện' },
  { value: '{{water_price}}', label: 'Đơn giá nước' },
  { value: '{{service_fee}}', label: 'Phí dịch vụ' },
  { value: '{{number_of_members}}', label: 'Số người ở' },
  { value: '{{user_signature}}', label: 'Chữ ký người thuê' }
]

const placeholders = computed(() => props.placeholders.length ? props.placeholders : defaultPlaceholders)

// Đồng bộ khi modelValue thay đổi từ bên ngoài
watch(() => props.modelValue, (val) => {
  if (val !== editorEl.value?.innerHTML) {
    editorEl.value.innerHTML = val || ''
    innerHtml.value = val || ''
  }
})

function saveSelection() {
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0) {
    // Chỉ lưu range nếu vùng chọn nằm trong editorEl
    const range = sel.getRangeAt(0)
    if (editorEl.value && editorEl.value.contains(range.commonAncestorContainer)) {
      savedRange = range.cloneRange()
    }
  }
}

function restoreSelection() {
  if (savedRange) {
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(savedRange)
  }
}

function openImageModal() {
  saveSelection()
  imageUrl.value = ''
  imagePreview.value = ''
  imageTab.value = 'upload'
  imgMaxHeight.value = 120
  showImageModal.value = true
}

function onImageFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('Tệp quá lớn. Vui lòng chọn tệp ảnh nhỏ hơn 5MB.')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    imagePreview.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

function insertImage() {
  const src = imagePreview.value || imageUrl.value
  if (!src) return

  if (editorEl.value) {
    editorEl.value.focus()
  }
  restoreSelection()

  const h = imgMaxHeight.value || 120
  const imgHtml = `<img src="${src}" style="max-height: ${h}px; width: auto; vertical-align: middle; margin: 4px;" alt="Chữ ký / Ảnh" />`

  document.execCommand('insertHTML', false, imgHtml)
  showImageModal.value = false
  onInput()
}

function exec(command, value = null) {
  document.execCommand(command, false, value)
  onInput()
}

function insertPlaceholder(e) {
  const val = e.target.value
  if (!val) return
  const el = editorEl.value
  el.focus()
  document.execCommand('insertText', false, val)
  e.target.value = ''
  onInput()
}

function onInput() {
  innerHtml.value = editorEl.value?.innerHTML || ''
  emit('update:modelValue', innerHtml.value)
}

onMounted(() => {
  editorEl.value.innerHTML = props.modelValue || ''
})
</script>

<style scoped>
.editor-area {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  overflow-y: auto;
  line-height: 1.6;
}

.editor-area:focus {
  box-shadow: none;
}

.editor-area :deep(img) {
  max-width: 100%;
  object-fit: contain;
}

.image-preview-container {
  max-height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}
</style>
