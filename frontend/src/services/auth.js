import api from './api.js'

const TOKEN_KEY = 'token'
const USERNAME_KEY = 'username'
const ROLE_KEY = 'role'

/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} { token, username }
 */
export async function login(username, password, expectedRole) {
  const response = await api.post('/auth/login', { username, password, role: expectedRole })
  const { token, role } = response.data

  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, response.data.name || response.data.username || username)
  localStorage.setItem(ROLE_KEY, role)

  return response.data
}

/**
 * Change the password of the authenticated account.
 */
export async function changePassword(currentPassword, newPassword) {
  const response = await api.put('/auth/change-password', { currentPassword, newPassword })
  return response.data
}

/**
 * Logout - clear stored credentials
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(ROLE_KEY)
  window.location.href = '/login'
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY)
}

/**
 * Get current username
 * @returns {string|null}
 */
export function getUsername() {
  return localStorage.getItem(USERNAME_KEY)
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY)
}
