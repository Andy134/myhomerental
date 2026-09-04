/**
 * User model (renter)
 */
const mongoose = require('mongoose')
const status = require('../../status.json')

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  phone:    { type: String, default: '' },
  email:    { type: String, default: '' },
  document: { type: String, default: '' },
  personal_number: { type: String, default: '' },
  date_of_birth: { type: String, default: '' },
  permanent_address: { type: String, default: '' },
  note:     { type: String, default: '' }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)
