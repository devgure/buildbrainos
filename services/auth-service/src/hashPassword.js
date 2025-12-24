const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Usage: node src/hashPassword.js "plaintext-password" "email"
const [,, pwd, email] = process.argv
if (!pwd || !email) {
  console.error('Usage: node src/hashPassword.js <password> <email>')
  process.exit(2)
}
const hash = bcrypt.hashSync(pwd, 10)
const usersPath = path.join(__dirname, 'models', 'users.json')
let users = []
try { users = JSON.parse(fs.readFileSync(usersPath, 'utf8')||'[]') } catch (e) { users=[] }
const existing = users.find(u => u.email === email)
if (existing) {
  existing.passwordHash = hash
} else {
  users.push({id: `u_${Date.now()}`, email, role: 'admin', passwordHash: hash})
}
fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))
console.log('Wrote hashed password to', usersPath)