// Helper format cho tiền tệ và ngày tháng theo rules trong docs/06-rules.md
// - Tiền: format hiển thị có ngăn cách phần nghìn, VD: 10.000.000 đ
// - Date: format trong db là ddmmyyyy (string), UI dùng date picker (yyyy-mm-dd)

/**
 * Format số tiền hiển thị kèm đơn vị 'đ'
 * @param {number|string} v
 * @returns {string}
 */
export function formatCurrency(v) {
  return (Number(v) || 0).toLocaleString('vi-VN') + ' đ'
}

/**
 * Định dạng chuỗi số khi đang nhập (thêm dấu chấm ngăn cách phần nghìn).
 * Chỉ giữ lại chữ số và dấu chấm, bỏ mọi ký tự khác.
 * @param {string} value
 * @returns {string}
 */
export function formatMoneyInput(value) {
  if (value == null) return ''
  // Chỉ giữ chữ số
  const digits = String(value).replace(/[^\d]/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('vi-VN')
}

/**
 * Chuyển chuỗi tiền đang hiển thị (có dấu chấm) về số nguyên.
 * @param {string} value
 * @returns {number}
 */
export function parseMoney(value) {
  if (value == null) return 0
  const digits = String(value).replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

/**
 * Chuyển date từ định dạng db (ddmmyyyy) sang format date input (yyyy-mm-dd).
 * @param {string} d
 * @returns {string}
 */
export function toDateInput(d) {
  if (!d || d.length !== 8) return d || ''
  return `${d.substring(4, 8)}-${d.substring(2, 4)}-${d.substring(0, 2)}`
}

/**
 * Chuyển date từ format date input (yyyy-mm-dd) sang định dạng db (ddmmyyyy).
 * @param {string} d
 * @returns {string}
 */
export function fromDateInput(d) {
  if (!d) return ''
  const parts = String(d).split('-')
  if (parts.length !== 3) return d
  return `${parts[2]}${parts[1]}${parts[0]}`
}

/**
 * Format date hiển thị từ định dạng db (ddmmyyyy) sang dd-mm-yyyy.
 * @param {string} d
 * @returns {string}
 */
export function formatDate(d) {
  if (!d || d.length !== 8) return d || ''
  return `${d.substring(0, 2)}-${d.substring(2, 4)}-${d.substring(4, 8)}`
}

/**
 * Format tháng hiển thị từ ddmmyyyy hoặc yyyymm -> mm/yyyy
 * @param {string} m
 * @returns {string}
 */
export function formatMonth(m) {
  if (!m || m.length !== 6) return m || ''
  return `${m.substring(4, 6)}/${m.substring(0, 4)}`
}
