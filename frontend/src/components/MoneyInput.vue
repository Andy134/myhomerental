<template>
  <input
    :value="displayValue"
    type="text"
    inputmode="numeric"
    class="form-control"
    :class="{ 'text-end': alignRight }"
    :placeholder="placeholder"
    :readonly="readonly"
    :required="required"
    :min="min"
    @input="onInput"
    @blur="onBlur"
  />
</template>

<script setup>
import { computed } from 'vue'
import { formatMoneyInput, parseMoney } from '../services/format.js'

const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  placeholder: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  min: { type: [Number, String], default: 0 },
  alignRight: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'input'])

const displayValue = computed(() => formatMoneyInput(props.modelValue))

function onInput(e) {
  const raw = e.target.value
  const formatted = formatMoneyInput(raw)
  e.target.value = formatted
  const num = parseMoney(formatted)
  emit('update:modelValue', num)
  emit('input')
}

function onBlur(e) {
  // Đảm bảo hiển thị đúng định dạng khi rời khỏi ô
  e.target.value = formatMoneyInput(e.target.value)
}
</script>
