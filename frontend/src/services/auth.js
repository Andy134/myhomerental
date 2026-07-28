import api from './api.js'

const TOKEN_KEY = 'token'
const USERNAME_KEY = 'username'

/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} { token, username }
 */
export async function login(username, password) {
  const response = await api.post('/auth/login', { username, password })
  const { token } = response.data

  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)

  return response.data
}

/**
 * Logout - clear stored credentials
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
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
