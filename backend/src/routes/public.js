/**
 * Public routes - No authentication required
 */
const express = require('express')
const MonthlyBilling = require('../models/monthly_billing')
const Setting = require('../models/setting')

const router = express.Router()

// GET /api/public/settings - Lấy thông tin thanh toán công khai cho người thuê
router.get('/settings', async (req, res) => {
  try {
    const doc = await Setting.findOne({ key: 'app' })
    if (!doc) {
      return res.json({ payment_qr: '', payment_account_number: '', payment_account_name: '', payment_bank_name: '' })
    }
    res.json({
      payment_qr: doc.payment_qr || '',
      payment_account_number: doc.payment_account_number || '',
      payment_account_name: doc.payment_account_name || '',
      payment_bank_name: doc.payment_bank_name || ''
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/public/billing/:token - Get billing by share token (public)
router.get('/billing/:token', async (req, res) => {
  try {
    const billing = await MonthlyBilling.findOne({ share_token: req.params.token })
      .populate('room_id', 'room_no')
      .populate('user_id', 'name phone email')

    if (!billing) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại hoặc link đã hết hạn' })
    }

    res.json(billing)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

