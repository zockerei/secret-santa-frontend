import { computed, ref } from 'vue'
import { auth, me } from '../api'

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

// Shared by every component, and kept in localStorage so a reload stays logged in
const token = ref(localStorage.getItem('token'))
const user = ref(storedUser())

const isAuthenticated = computed(() => !!token.value)
const isAdmin = computed(() => !!user.value?.is_admin)

function setUser(value) {
  user.value = value
  localStorage.setItem('user', JSON.stringify(value))
}

async function login(email, password) {
  const data = await auth.login(email, password)
  token.value = data.access_token
  localStorage.setItem('token', data.access_token)
  setUser(data.user)
}

function logout() {
  token.value = null
  user.value = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Picks up changes made elsewhere, e.g. the admin giving someone admin rights
async function refreshUser() {
  if (token.value) setUser(await me.get())
}

export function useAuth() {
  return { user, isAuthenticated, isAdmin, login, logout, setUser, refreshUser }
}
