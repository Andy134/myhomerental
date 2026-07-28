/**
 * Expense routes - CRUD
 */
const express = require('express')
const Expense = require('../models/expense')
const authenticate = require('../middleware/auth')

const router = express.Router()

// GET /api/expenses - List all expenses
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {}
    if (req.query.start_date) filter.date = { $gte: req.query.start_date }
    if (req.query.end_date) filter.date = { ...filter.date, $lte: req.query.end_date }
    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 })
    res.json(expenses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/expenses/:id - Get expense by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    res.json(expense)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/expenses - Create expense
router.post('/', authenticate, async (req, res) => {
  try {
    const expense = new Expense(req.body)
    const saved = await expense.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/expenses/:id - Update expense
router.put('/:id', authenticate, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    res.json(expense)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id)
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

