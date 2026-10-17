/**
 * Tenant-only portal. Every query is constrained by the tenant id in the JWT;
 * a tenant can never request another tenant's bills.
 */
const express = require('express')
const MonthlyBilling = require('../models/monthly_billing')
const User = require('../models/user')
const { authenticate, authorize } = require('../middleware/auth')
const crypto = require('crypto')

const router = express.Router()
router.use(authenticate, authorize('tenant'))
router.use(async (req, res, next) => {
  try {
    const tenantExists = await User.exists({ _id: req.user.tenant_id, is_active: true })
    if (!tenantExists) return res.status(401).json({ message: 'Tài khoản người thuê không còn hoạt động' })
    next()
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/payment-history', async (req, res) => {
  try {
    const billings = await MonthlyBilling.find({ user_id: req.user.tenant_id, status: 'paid' })
      .select('month room_no total_price note status createdAt')
      .sort({ month: -1 })
    res.json(billings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Summary for the current calendar month in Vietnam, used by the tenant portal.
router.get('/payment-summary', async (req, res) => {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit'
    }).formatToParts(new Date())
    const year = parts.find(part => part.type === 'year').value
    const month = parts.find(part => part.type === 'month').value
    const currentMonth = `${year}${month}`
    const billing = await MonthlyBilling.findOne({ user_id: req.user.tenant_id, month: currentMonth })
      .select('month room_no total_price status')

    res.json({
      month: currentMonth,
      billing: billing || null,
      paid_amount: billing?.status === 'paid' ? billing.total_price : 0
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create or retrieve a share link only for this tenant's billing.
router.post('/payment-link', async (req, res) => {
  try {
    const { billing_id } = req.body
    if (!billing_id) return res.status(400).json({ message: 'Thiếu mã hóa đơn' })

    const billing = await MonthlyBilling.findOne({ _id: billing_id, user_id: req.user.tenant_id })
    if (!billing) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' })
    if (billing.status === 'cancelled') return res.status(400).json({ message: 'Hóa đơn đã hủy' })

    if (!billing.share_token) {
      billing.share_token = crypto.randomBytes(16).toString('hex')
      await billing.save()
    }
    res.json({ share_token: billing.share_token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.tenant_id).select('name phone email')
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người thuê' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
