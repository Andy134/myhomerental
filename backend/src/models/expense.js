/**
 * Expense model
 */
const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  date:        { type: String, required: true },
  description: { type: String, required: true },
  amount:      { type: Number, required: true },
  note:        { type: String, default: '' }
}, {
  timestamps: true
})

module.exports = mongoose.model('Expense', expenseSchema)

