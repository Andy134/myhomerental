/**
 * Public routes - No authentication required
 */
const express = require('express')
const MonthlyBilling = require('../models/monthly_billing')
const Contract = require('../models/contract')
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

// GET /api/public/contract/:token - Lấy thông tin hợp đồng để người thuê xem và ký
router.get('/contract/:token', async (req, res) => {
  try {
    const contract = await Contract.findOne({ share_token: req.params.token })
      .populate('room_id', 'room_no price')
      .populate('user_id', 'name phone document personal_number address')

    if (!contract) {
      return res.status(404).json({ message: 'Hợp đồng không tồn tại hoặc đường dẫn đã hết hạn' })
    }

    const settingDoc = await Setting.findOne({ key: 'app' })
    const template = settingDoc?.contract_template || ''

    res.json({ contract, template })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/public/contract/:token/sign - Người thuê ký hợp đồng trực tuyến
router.post('/contract/:token/sign', async (req, res) => {
  try {
    const { tenant_signature } = req.body
    if (!tenant_signature) {
      return res.status(400).json({ message: 'Vui lòng cung cấp chữ ký cá nhân' })
    }

    const contract = await Contract.findOne({ share_token: req.params.token })
    if (!contract) {
      return res.status(404).json({ message: 'Hợp đồng không tồn tại hoặc đường dẫn đã hết hạn' })
    }

    contract.tenant_signature = tenant_signature
    contract.tenant_signed_at = new Date()
    await contract.save()

    res.json({ message: 'Ký hợp đồng thành công!', contract })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

