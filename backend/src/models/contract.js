/**
 * Contract model
 */
const mongoose = require('mongoose')
const status = require('../../status.json')

const contractSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true },
  room_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  room_no:       { type: String, required: true },
  user_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  predict_price: { type: Number, default: 0 },
  start_date:    { type: String, required: true },
  end_date:      { type: String, required: true },
  number_of_members: { type: Number, default: 1 },
  price:         { type: Number, required: true },
  electric_price: { type: Number, default: 0 },
  water_price:   { type: Number, default: 0 },
  service_fee:   { type: Number, default: 0 },
  status:        { type: String, enum: status.contract, default: 'active' },
  note:          { type: String, default: '' }
}, {
  timestamps: true
})

module.exports = mongoose.model('Contract', contractSchema)

