/**
 * User routes - CRUD
 */
const express = require('express')
const User = require('../models/user')
const Account = require('../models/account')
const { authenticate, authorize } = require('../middleware/auth')
const bcrypt = require('bcryptjs')

const router = express.Router()
router.use(authenticate, authorize('admin'))

// GET /api/users - List all users
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/users/:id - Get user by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/users - Create user
router.post('/', authenticate, async (req, res) => {
  try {
    const { password, login_username, ...profile } = req.body
    const normalizedUsername = login_username?.trim().toLowerCase()
    if (normalizedUsername && !password) return res.status(400).json({ message: 'Cần đặt mật khẩu khi tạo tài khoản người thuê' })
    if (password && !normalizedUsername) return res.status(400).json({ message: 'Cần nhập tên đăng nhập cho người thuê' })
    if (password && password.length < 8) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' })
    if (normalizedUsername && await Account.exists({ username: normalizedUsername })) return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' })
    const user = new User({
      ...profile,
      login_username: normalizedUsername || undefined,
      password_hash: password ? await bcrypt.hash(password, 12) : undefined
    })
    const saved = await user.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/users/:id - Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { password, login_username, ...profile } = req.body
    const normalizedUsername = login_username?.trim().toLowerCase()
    if (password && password.length < 8) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' })
    if (normalizedUsername && await Account.exists({ username: normalizedUsername })) return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' })
    const update = { ...profile, login_username: normalizedUsername || undefined }
    if (password) update.password_hash = await bcrypt.hash(password, 12)
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/users/:id - Delete user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

