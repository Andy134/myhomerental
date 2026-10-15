/**
 * Authentication routes
 */
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Account = require('../models/account')
const { authenticate, authorize } = require('../middleware/auth')

const router = express.Router()

/**
 * POST /api/auth/login
 * Authenticate an active account and return JWT token.
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  const normalizedUsername = username.trim().toLowerCase()
  const account = await Account.findOne({ username: normalizedUsername }).select('+password_hash')
  const isPasswordValid = account && account.is_active && await bcrypt.compare(password, account.password_hash)
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // Generate JWT
  const token = jwt.sign(
    { sub: account._id.toString(), username: account.username, role: account.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )

  res.json({ token, username: account.username, role: account.role })
})

/**
 * PUT /api/auth/change-password
 * Change the password of the currently authenticated administrator.
 */
router.put('/change-password', authenticate, authorize('admin'), async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ message: 'Current password and new password are required' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long' })
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'New password must be different from the current password' })
  }

  const account = await Account.findById(req.user.sub).select('+password_hash')
  if (!account || !account.is_active) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, account.password_hash)
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Current password is incorrect' })
  }

  account.password_hash = await bcrypt.hash(newPassword, 12)
  await account.save()

  res.json({ message: 'Password changed successfully' })
})

module.exports = router
