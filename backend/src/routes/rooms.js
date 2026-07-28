/**
 * Room routes - CRUD
 */
const express = require('express')
const Room = require('../models/room')
const authenticate = require('../middleware/auth')

const router = express.Router()

// GET /api/rooms - List all rooms
router.get('/', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 })
    res.json(rooms)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/rooms/:id - Get room by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json(room)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/rooms - Create room
router.post('/', authenticate, async (req, res) => {
  try {
    const room = new Room(req.body)
    const saved = await room.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/rooms/:id - Update room
router.put('/:id', authenticate, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json(room)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/rooms/:id - Delete room
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

