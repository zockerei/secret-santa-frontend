import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      console.error('❌ Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        data: error.response.data,
        headers: error.response.headers
      })
    } else if (error.request) {
      console.error('❌ Network Error - No response received:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: 'Backend might be down or CORS issue',
        error: error.message
      })
    } else {
      console.error('❌ Error:', error.message)
    }
    
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/register')
      
      if (!isAuthEndpoint) {
        console.warn('🔒 Token expired or invalid - redirecting to login')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// ============ AUTH API ============
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  }
}

// ============ USER API ============
export const userAPI = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me')
    return response.data
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/users/me', profileData)
    return response.data
  },
  
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword
    })
    return response.data
  },
  
  getEvents: async () => {
    const response = await api.get('/users/events')
    return response.data
  },
  
  joinEvent: async (eventId, message = null) => {
    const response = await api.post('/users/events/join', {
      event_id: eventId,
      message
    })
    return response.data
  },
  
  updateMessage: async (eventId, message) => {
    const response = await api.put(`/users/events/${eventId}/message`, {
      message
    })
    return response.data
  },
  
  getAssignments: async () => {
    const response = await api.get('/users/assignments')
    return response.data
  },
  
  getEventStatus: async (eventId) => {
    const response = await api.get(`/users/events/${eventId}/status`)
    return response.data
  },
  
  leaveEvent: async (eventId) => {
    const response = await api.delete(`/users/events/${eventId}/leave`)
    return response.data
  }
}

// ============ ADMIN API ============
export const adminAPI = {
  // User Management
  getAllUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data
  },
  
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData)
    return response.data
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData)
    return response.data
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  },
  
  // Event Management
  getAllEvents: async () => {
    const response = await api.get('/admin/events')
    return response.data
  },
  
  getEvent: async (eventId) => {
    const response = await api.get(`/admin/events/${eventId}`)
    return response.data
  },
  
  createEvent: async (eventData) => {
    const response = await api.post('/admin/events', eventData)
    return response.data
  },
  
  updateEvent: async (eventId, eventData) => {
    const response = await api.put(`/admin/events/${eventId}`, eventData)
    return response.data
  },
  
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/admin/events/${eventId}`)
    return response.data
  },
  
  // Event Actions
  assignEvent: async (eventId, historyEventIds = null) => {
    const response = await api.post(`/admin/events/${eventId}/assign`, {
      history_event_ids: historyEventIds
    })
    return response.data
  },
  
  assignManual: async (eventId, assignments) => {
    const response = await api.post(`/admin/events/${eventId}/assign-manual`, { assignments })
    return response.data
  },
  
  closeEvent: async (eventId) => {
    const response = await api.post(`/admin/events/${eventId}/close`)
    return response.data
  },
  
  reopenEvent: async (eventId) => {
    const response = await api.post(`/admin/events/${eventId}/reopen`)
    return response.data
  },
  
  getEventStatistics: async (eventId) => {
    const response = await api.get(`/admin/events/${eventId}/statistics`)
    return response.data
  },
  
  getAssignmentHistory: async (eventId) => {
    const response = await api.get(`/admin/events/${eventId}/history`)
    return response.data
  },
  
  getMatchingParticipantEvents: async (eventId) => {
    const response = await api.get(`/admin/events/${eventId}/matching-participant-events`)
    return response.data
  },
  
  getParticipantsWithoutMessages: async (eventId) => {
    const response = await api.get(`/admin/events/${eventId}/participants-without-messages`)
    return response.data
  },
  
  addParticipant: async (eventId, userId) => {
    const response = await api.post(`/admin/events/${eventId}/add-participant?user_id=${userId}`)
    return response.data
  },
  
  removeParticipant: async (eventId, userId) => {
    const response = await api.delete(`/admin/events/${eventId}/participants/${userId}`)
    return response.data
  },
  
  updateParticipantMessage: async (eventId, userId, message) => {
    const response = await api.put(`/admin/events/${eventId}/participants/${userId}/message`, {
      message
    })
    return response.data
  },
  
  deleteParticipantMessage: async (eventId, userId) => {
    const response = await api.delete(`/admin/events/${eventId}/participants/${userId}/message`)
    return response.data
  },
  
  // Event Names
  getEventNames: async () => {
    const response = await api.get('/admin/event-names')
    return response.data
  },
  
  createEventName: async (name) => {
    const response = await api.post('/admin/event-names', { name })
    return response.data
  }
}

export default api
