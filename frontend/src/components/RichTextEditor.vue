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
    </div>

<!-- Editable area -->
    <div
      ref="editorEl"
      class="editor-area form-control"
      contenteditable="true"
      :style="{ minHeight: minHeight + 'px' }"
      @input="onInput"
    ></div>
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

// Danh sách placeholder mặc định (nếu không truyền vào)
const defaultPlaceholders = [
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

const placeholders = computed(() => props.placeholders.length ? props.placeholders : defaultPlaceholders)

// Đồng bộ khi modelValue thay đổi từ bên ngoài
watch(() => props.modelValue, (val) => {
  if (val !== editorEl.value?.innerHTML) {
    editorEl.value.innerHTML = val || ''
    innerHtml.value = val || ''
  }
})

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
  innerHtml.value = editorEl.value.innerHTML
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
</style>
