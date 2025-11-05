import { ref, computed } from 'vue'
import { authAPI, userAPI } from '../utils/api'
import { useRouter } from 'vue-router'

const user = ref(null)
const token = ref(localStorage.getItem('token'))

export function useAuth() {
  const router = useRouter()
  
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.is_admin || false)

  const login = async (credentials) => {
    const data = await authAPI.login(credentials)
    token.value = data.access_token
    user.value = data.user
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  const register = async (userData) => {
    const data = await authAPI.register(userData)
    return data
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const loadUser = async () => {
    if (token.value && !user.value) {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          user.value = JSON.parse(storedUser)
        } else {
          user.value = await userAPI.getCurrentUser()
          localStorage.setItem('user', JSON.stringify(user.value))
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        logout()
      }
    }
  }

  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken) {
      token.value = storedToken
    }
    
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        logout()
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    loadUser,
    initAuth
  }
}

