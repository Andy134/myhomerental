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
      .populate('user_id', 'name phone')
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
      .populate('user_id', 'name phone')
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

module.exports = router

