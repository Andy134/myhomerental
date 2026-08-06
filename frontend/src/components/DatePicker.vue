<template>
  <input
    :value="inputValue"
    type="date"
    class="form-control"
    :min="min"
    :max="max"
    :required="required"
    @input="onInput"
  />
</template>

<script setup>
import { computed } from 'vue'
import { toDateInput, fromDateInput } from '../services/format.js'

const props = defineProps({
  // Giá trị lưu trong db: ddmmyyyy (string)
  modelValue: { type: String, default: '' },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  required: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const inputValue = computed(() => toDateInput(props.modelValue))

function onInput(e) {
  const dbValue = fromDateInput(e.target.value)
  emit('update:modelValue', dbValue)
}
</script>
