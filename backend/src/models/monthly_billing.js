/**
 * Monthly billing model
 */
const mongoose = require('mongoose')
const status = require('../../status.json')

const monthlyBillingSchema = new mongoose.Schema({
  month:            { type: String, required: true },  // yyyymm
  room_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  room_no:          { type: String, required: true },
  user_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  old_electric:     { type: Number, default: 0 },
  new_electric:     { type: Number, default: 0 },
  electric_price:   { type: Number, default: 0 },
  water_price:      { type: Number, default: 0 },
  number_of_members:{ type: Number, default: 1 },
  service_fee:      { type: Number, default: 0 },
  room_price:       { type: Number, default: 0 },
  total_price:      { type: Number, default: 0 },
  status:           { type: String, enum: status.billing, default: 'draft' },
  note:             { type: String, default: '' },
  share_token:      { type: String, default: null, index: true, sparse: true }
}, {
  timestamps: true
})

module.exports = mongoose.model('MonthlyBilling', monthlyBillingSchema)

