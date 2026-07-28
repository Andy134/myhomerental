/**
 * Monthly billing routes - CRUD + Generate by month
 */
const express = require('express')
const MonthlyBilling = require('../models/monthly_billing')
const Contract = require('../models/contract')
const authenticate = require('../middleware/auth')
const crypto = require('crypto')

const router = express.Router()

// GET /api/monthly-billings - List all billings
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {}
    if (req.query.month) filter.month = req.query.month
    const billings = await MonthlyBilling.find(filter)
      .populate('room_id', 'room_no')
      .populate('user_id', 'name')
      .sort({ createdAt: -1 })
    res.json(billings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/monthly-billings/:id - Get billing by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const billing = await MonthlyBilling.findById(req.params.id)
      .populate('room_id', 'room_no')
      .populate('user_id', 'name')
    if (!billing) return res.status(404).json({ message: 'Billing not found' })
    res.json(billing)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/monthly-billings/generate - Generate billings for a month
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { month, force } = req.body
    if (!month) return res.status(400).json({ message: 'Month is required (yyyymm)' })

    // Check if billings already exist for this month
    const existing = await MonthlyBilling.findOne({ month })
    if (existing) {
      if (!force) {
        return res.status(400).json({ message: 'Billings for this month already exist. Use force=true to regenerate.' })
      }
      // Delete all existing billings for this month before regenerating
      await MonthlyBilling.deleteMany({ month })
    }

    // Get active contracts
    const contracts = await Contract.find({ status: 'active' })
      .populate('room_id', 'room_no')
      .populate('user_id', 'name')

    if (contracts.length === 0) return res.status(400).json({ message: 'No active contracts found' })

    const billings = contracts.map(contract => {
      const roomPrice = contract.price || 0
      const serviceFee = contract.service_fee || 0
      const numMembers = contract.number_of_members || 1
      const waterPrice = contract.water_price || 0
      const waterFee = waterPrice * numMembers
      const serviceCost = serviceFee * numMembers
      const totalPrice = roomPrice + waterFee + serviceCost

      return {
        month,
        room_id: contract.room_id._id,
        room_no: contract.room_no,
        user_id: contract.user_id._id,
        old_electric: 0,
        new_electric: 0,
        electric_price: contract.electric_price || 0,
        water_price: waterPrice,
        number_of_members: numMembers,
        service_fee: serviceFee,
        room_price: roomPrice,
        total_price: totalPrice,
        status: 'draft',
        note: ''
      }
    })

    const saved = await MonthlyBilling.insertMany(billings)
    res.status(201).json(saved)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/monthly-billings/:id - Update billing
router.put('/:id', authenticate, async (req, res) => {
  try {
    const billing = await MonthlyBilling.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!billing) return res.status(404).json({ message: 'Billing not found' })
    res.json(billing)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/monthly-billings/:id - Delete billing
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const billing = await MonthlyBilling.findByIdAndDelete(req.params.id)
    if (!billing) return res.status(404).json({ message: 'Billing not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/monthly-billings/month/:month - Delete all billings for a month
router.delete('/month/:month', authenticate, async (req, res) => {
  try {
    const { month } = req.params
    const result = await MonthlyBilling.deleteMany({ month })
    res.json({ message: `Deleted ${result.deletedCount} billing(s) for month ${month}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/monthly-billings/:id/share - Generate or get share token
router.post('/:id/share', authenticate, async (req, res) => {
  try {
    const billing = await MonthlyBilling.findById(req.params.id)
    if (!billing) return res.status(404).json({ message: 'Billing not found' })

    // Generate share token if not exists
    if (!billing.share_token) {
      billing.share_token = crypto.randomBytes(16).toString('hex')
      await billing.save()
    }

    const shareUrl = `${req.protocol}://${req.get('host')}/shared-billing/${billing.share_token}`

    res.json({
      share_token: billing.share_token,
      share_url: shareUrl
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

