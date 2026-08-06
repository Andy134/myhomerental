/**
 * Setting model - Singleton settings document
 * Lưu cấu hình hệ thống. Chỉ có duy nhất 1 document (key: 'app')
 */
const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'app'
  },
// Tài khoản thanh toán
  payment_qr:            { type: String, default: '' },  // base64 data URL của mã QR
  payment_account_number:{ type: String, default: '' },  // số tài khoản
  payment_account_name:  { type: String, default: '' },  // tên người nhận
  payment_bank_name:     { type: String, default: '' },  // tên ngân hàng
  // Mẫu hợp đồng (HTML của WYSIWYG editor)
  contract_template:     { type: String, default: '' }   // template hợp đồng thuê phòng
}, {
  timestamps: true
})

module.exports = mongoose.model('Setting', settingSchema)

