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

// Chạy local (npm start / node src/index.js) → kết nối MongoDB + listen
if (require.main === module) {
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
}

// Serverless (Vercel): cache kết nối MongoDB qua global để tái sử dụng.
// - serverSelectionTimeoutMS giảm từ 30s xuống 8s (dưới giới hạn 10s của Vercel Hobby)
// - bufferCommands: false → query không bị treo chờ (buffering timed out) khi chưa có kết nối
// - Nếu kết nối thất bại, xóa cache để lần gọi sau tự retry (tránh cache promise lỗi vĩnh viễn)
function connectDB() {
  if (global.mongooseCache) return global.mongooseCache
  global.mongooseCache = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    bufferCommands: false
  })
    .then(() => {
      console.log('Connected to MongoDB (serverless)')
      return mongoose.connection
    })
    .catch(err => {
      console.error('MongoDB connection error:', err.message)
      delete global.mongooseCache
      throw err
    })
  return global.mongooseCache
}

// Export async handler: đảm bảo MongoDB đã kết nối trước khi xử lý request.
// Tránh lỗi "Operation ... buffering timed out" khi request đến lúc connect chưa xong.
module.exports = async (req, res) => {
  try {
    await connectDB()
  } catch (err) {
    return res.status(500).json({ message: `Database connection failed: ${err.message}` })
  }
  return app(req, res)
}

