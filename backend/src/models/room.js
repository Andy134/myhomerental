/**
 * Room model
 */
const mongoose = require('mongoose')
const status = require('../../status.json')

const roomSchema = new mongoose.Schema({
  room_no:    { type: String, required: true, unique: true },
  info:       { type: String, default: '' },
  price:      { type: Number, required: true },
  status:     { type: String, enum: status.room, default: 'available' },
  note:       { type: String, default: '' }
}, {
  timestamps: true
})

module.exports = mongoose.model('Room', roomSchema)

