/**
 * Account model for users who can access the management application.
 * This is intentionally separate from the renter `User` model.
 */
const mongoose = require('mongoose')

const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 100
  },
  password_hash: { type: String, required: true, select: false },
  role: {
    type: String,
    required: true,
    enum: ['admin'],
    default: 'admin'
  },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
})

module.exports = mongoose.model('Account', accountSchema)
