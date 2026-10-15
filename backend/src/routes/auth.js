/**
 * Authentication routes
 */
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Account = require('../models/account')

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

module.exports = router
