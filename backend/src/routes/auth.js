/**
 * Authentication routes
 */
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Account = require('../models/account')
const User = require('../models/user')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

/**
 * POST /api/auth/login
 * Authenticate an active account and return JWT token.
 */
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  const normalizedUsername = username.trim().toLowerCase()
  const account = await Account.findOne({ username: normalizedUsername }).select('+password_hash')
  const tenant = account ? null : await User.findOne({ login_username: normalizedUsername }).select('+password_hash')
  const principal = account || tenant
  const isPasswordValid = principal && principal.is_active && principal.password_hash && await bcrypt.compare(password, principal.password_hash)
  const actualRole = account ? account.role : 'tenant'
  if (!isPasswordValid || (role && role !== actualRole)) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // Generate JWT
  const token = jwt.sign(
    {
      sub: principal._id.toString(),
      username: account ? account.username : principal.login_username,
      role: actualRole,
      tenant_id: tenant ? tenant._id.toString() : undefined
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )

  res.json({
    token,
    username: account ? account.username : principal.login_username,
    name: account ? account.username : principal.name,
    role: actualRole
  })
})

/**
 * PUT /api/auth/change-password
 * Change the password of the currently authenticated account or tenant.
 */
router.put('/change-password', authenticate, async (req, res) => {
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

  const principal = req.user.role === 'tenant'
    ? await User.findById(req.user.tenant_id).select('+password_hash')
    : await Account.findById(req.user.sub).select('+password_hash')
  if (!principal || !principal.is_active) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, principal.password_hash)
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Current password is incorrect' })
  }

  principal.password_hash = await bcrypt.hash(newPassword, 12)
  await principal.save()

  res.json({ message: 'Password changed successfully' })
})

module.exports = router
