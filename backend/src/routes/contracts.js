/**
 * Contract routes - CRUD
 */
const express = require('express')
const Contract = require('../models/contract')
const authenticate = require('../middleware/auth')

const router = express.Router()

// GET /api/contracts - List all contracts (populate room & user)
router.get('/', authenticate, async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('room_id', 'room_no price')
      .populate('user_id', 'name phone document personal_number date_of_birth permanent_address')
      .sort({ createdAt: -1 })
    res.json(contracts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/contracts/:id - Get contract by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('room_id', 'room_no price')
      .populate('user_id', 'name phone document personal_number date_of_birth permanent_address')
    if (!contract) return res.status(404).json({ message: 'Contract not found' })
    res.json(contract)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/contracts - Create contract
router.post('/', authenticate, async (req, res) => {
  try {
    const contract = new Contract(req.body)
    const saved = await contract.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/contracts/:id - Update contract
router.put('/:id', authenticate, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!contract) return res.status(404).json({ message: 'Contract not found' })
    res.json(contract)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/contracts/:id - Delete contract
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id)
    if (!contract) return res.status(404).json({ message: 'Contract not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/contracts/:id/share-token - Generate share token for signing contract
router.post('/:id/share-token', authenticate, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
    if (!contract) return res.status(404).json({ message: 'Hợp đồng không tồn tại' })

    if (!contract.share_token) {
      const crypto = require('crypto')
      contract.share_token = crypto.randomBytes(16).toString('hex')
      await contract.save()
    }

    const shareUrl = `${req.protocol}://${req.get('host')}/sign-contract/${contract.share_token}`
    res.json({
      share_token: contract.share_token,
      share_url: shareUrl
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/contracts/:id/reset-signature - Reset signature to recreate contract for re-signing
router.post('/:id/reset-signature', authenticate, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
    if (!contract) return res.status(404).json({ message: 'Hợp đồng không tồn tại' })

    // Xóa chữ ký cũ và thời gian ký
    contract.tenant_signature = ''
    contract.tenant_signed_at = null

    // Sinh share_token mới để link cũ không còn hiệu lực
    const crypto = require('crypto')
    contract.share_token = crypto.randomBytes(16).toString('hex')

    await contract.save()

    const shareUrl = `${req.protocol}://${req.get('host')}/sign-contract/${contract.share_token}`
    res.json({
      contract,
      share_token: contract.share_token,
      share_url: shareUrl
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

