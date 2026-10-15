const bcrypt = require('bcryptjs')
const Account = require('../models/account')

/**
 * Creates the first administrator only when the accounts collection is empty.
 * ADMIN_USERNAME and ADMIN_PASSWORD must be configured outside source control.
 */
async function ensureInitialAdmin() {
  const accountCount = await Account.countDocuments()
  if (accountCount > 0) return

  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!username || !password) {
    throw new Error('No account exists. Set ADMIN_USERNAME and ADMIN_PASSWORD to create the initial admin.')
  }

  const password_hash = await bcrypt.hash(password, 12)
  try {
    await Account.create({ username, password_hash, role: 'admin' })
    console.log(`Initial admin account created for ${username}`)
  } catch (err) {
    // A concurrent serverless invocation may have created it first.
    if (err?.code !== 11000) throw err
  }
}

module.exports = ensureInitialAdmin
