/**
 * Test login API
 */
const http = require('http')

const username = process.env.ADMIN_USERNAME
const password = process.env.ADMIN_PASSWORD

if (!username || !password) {
  throw new Error('Set ADMIN_USERNAME and ADMIN_PASSWORD before running this test.')
}

const data = JSON.stringify({ username, password })

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = http.request(options, (res) => {
  let body = ''
  res.on('data', (chunk) => (body += chunk))
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    console.log('Response:', body)
    const json = JSON.parse(body)
    if (json.token) {
      console.log('✅ Login success! Token received')
    } else {
      console.log('❌ Login failed:', json.message)
    }
  })
})

req.on('error', (err) => {
  console.error('❌ Error:', err.message)
})

req.write(data)
req.end()
