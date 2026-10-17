/**
 * User model (renter)
 */
const mongoose = require('mongoose')
const status = require('../../status.json')

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  phone:    { type: String, default: '' },
  email:    { type: String, default: '' },
  // Tenant portal credentials. The hash is never returned by default.
  login_username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password_hash: { type: String, select: false },
  is_active: { type: Boolean, default: true },
  document: { type: String, default: '' },
  personal_number: { type: String, default: '' },
  date_of_birth: { type: String, default: '' },
  permanent_address: { type: String, default: '' },
  note:     { type: String, default: '' }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)
