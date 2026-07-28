/**
 * Public routes - No authentication required
 */
const express = require('express')
const MonthlyBilling = require('../models/monthly_billing')

const router = express.Router()

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

