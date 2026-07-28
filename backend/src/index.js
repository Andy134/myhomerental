/**
 * Entry point - Home Rental Backend
 */
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const roomRoutes = require('./routes/rooms')
const userRoutes = require('./routes/users')
const contractRoutes = require('./routes/contracts')
const monthlyBillingRoutes = require('./routes/monthly_billings')
const expenseRoutes = require('./routes/expenses')
const publicRoutes = require('./routes/public')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/users', userRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/monthly-billings', monthlyBillingRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/public', publicRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })
