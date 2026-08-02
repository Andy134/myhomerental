/**
 * Test MongoDB connection - dùng URI từ biến môi trường MONGODB_URI
 * Chạy: cd backend && node test-mongo.js
 */
require('dotenv').config()
const mongoose = require('mongoose')

const uri = process.env.MONGODB_URI

if (!uri) {
  console.error('❌ Thiếu biến môi trường MONGODB_URI (kiểm tra backend/.env)')
  process.exit(1)
}

// Ẩn credential khi in URI (tránh lộ password ra console)
const masked = uri.replace(/\/\/[^@]+@/, '//***:***@')
console.log('🔌 Đang kết nối tới:', masked)
console.log('⏳ Vui lòng đợi tối đa 10 giây...\n')

mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log('✅ Kết nối MongoDB OK!')
    console.log('   → URI hợp lệ, network access mở, user/password đúng.')
    return mongoose.connection.close()
  })
  .then(() => {
    console.log('   → Đã đóng kết nối an toàn.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Kết nối MongoDB THẤT BẠI:')
    console.error('   ', err.message)
    console.error('\n🔎 Cách xử lý:')
    if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('   - Sai host trong connection string (phần sau mongodb+srv://)')
      console.error('   - Kiểm tra lại URI trên MongoDB Atlas → Connect → Drivers')
    } else if (err.message.includes('Authentication failed')) {
      console.error('   - Sai username hoặc password')
      console.error('   - Nếu password chứa ký tự đặc biệt, phải URL-encode (ví dụ @ → %40)')
    } else if (err.message.includes('timed out') || err.message.includes('ETIMEDOUT') || err.message.includes('ServerSelection')) {
      console.error('   - Network Access trên Atlas chưa mở cho IP của bạn')
      console.error('   - Vào Atlas → Network Access → Add IP → nhập 0.0.0.0/0')
      console.error('   - Hoặc IP máy bạn: mở https://whatismyipaddress.com')
    } else if (err.message.includes('bad auth')) {
      console.error('   - User không có quyền truy cập database')
      console.error('   - Vào Atlas → Database Access → cấp quyền readWrite')
    } else {
      console.error('   - Kiểm tra lại URI: không được còn dấu < >', 
        err.message.includes('<') || uri.includes('<') ? '(URI đang chứa < >!)' : '')
    }
    process.exit(1)
  })

