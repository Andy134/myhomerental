/**
 * Authentication routes
 */
const express = require('express')
const jwt = require('jsonwebtoken')
const admConfig = require('../../adm.json')

const router = express.Router()

/**
 * POST /api/auth/login
 * Authenticate admin user and return JWT token
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  // Check credentials from adm.json
  if (username !== admConfig.username || password !== admConfig.password) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // Generate JWT
  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )

  res.json({ token, username: admConfig.username })
})

module.exports = router
