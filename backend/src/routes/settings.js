/**
 * Settings routes - Lấy & cập nhật cấu hình hệ thống
 */
const express = require('express')
const Setting = require('../models/setting')
const authenticate = require('../middleware/auth')

const router = express.Router()

// Helper: lấy document settings (tạo nếu chưa tồn tại)
async function getSettingsDoc() {
  let doc = await Setting.findOne({ key: 'app' })
  if (!doc) {
    doc = await Setting.create({ key: 'app' })
  }
  return doc
}

// GET /api/settings - Lấy cấu hình
router.get('/', authenticate, async (req, res) => {
  try {
    const doc = await getSettingsDoc()
    res.json(doc)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/settings - Cập nhật cấu hình
router.put('/', authenticate, async (req, res) => {
  try {
    const doc = await getSettingsDoc()

    const fields = ['payment_qr', 'payment_account_number', 'payment_account_name', 'payment_bank_name']

    // Chỉ cập nhật các trường được gửi lên
    fields.forEach(f => {
      if (req.body[f] !== undefined) doc[f] = req.body[f]
    })

    // Validate dung lượng mã QR (base64) — tránh payload quá lớn
    if (doc.payment_qr && doc.payment_qr.length > 2_500_000) {
      return res.status(400).json({ message: 'Mã QR quá lớn. Vui lòng chọn ảnh nhỏ hơn (~2MB).' })
    }

    await doc.save()
    res.json(doc)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

module.exports = router

