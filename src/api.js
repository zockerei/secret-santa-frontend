// The backend, reached through /api: nginx forwards it in production, the Vite proxy in development

let onUnauthorized = () => {}

// Called when the login has expired or is invalid
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

async function request(method, path, body) {
  const headers = {}
  const token = localStorage.getItem('token')
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    })
  } catch {
    throw new Error('Der Server ist nicht erreichbar')
  }

  if (response.status === 401 && path !== '/auth/login') onUnauthorized()
  if (!response.ok) throw new Error(await errorMessage(response))
  return response.status === 204 ? null : response.json()
}

// The backend's error text: a string, or a list for invalid input
async function errorMessage(response) {
  try {
    const { detail } = await response.json()
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map(error => error.msg).join(', ')
  } catch {
    // Not JSON, e.g. when the backend is down and nginx answers
  }
  return `Fehler ${response.status}`
}

export const auth = {
  login: (email, password) => request('POST', '/auth/login', { email, password })
}

export const me = {
  get: () => request('GET', '/me'),
  update: (changes) => request('PATCH', '/me', changes),
  changePassword: (currentPassword, newPassword) =>
    request('PUT', '/me/password', { current_password: currentPassword, new_password: newPassword })
}

export const events = {
  list: () => request('GET', '/events'),
  join: (eventId) => request('POST', `/events/${eventId}/join`),
  leave: (eventId) => request('DELETE', `/events/${eventId}/join`),
  setMessage: (eventId, message) => request('PUT', `/events/${eventId}/message`, { message })
}

export const admin = {
  users: () => request('GET', '/admin/users'),
  createUser: (user) => request('POST', '/admin/users', user),
  updateUser: (userId, changes) => request('PATCH', `/admin/users/${userId}`, changes),
  deleteUser: (userId) => request('DELETE', `/admin/users/${userId}`),

  events: () => request('GET', '/admin/events'),
  createEvent: (event) => request('POST', '/admin/events', event),
  updateEvent: (eventId, changes) => request('PATCH', `/admin/events/${eventId}`, changes),
  deleteEvent: (eventId) => request('DELETE', `/admin/events/${eventId}`),
  addParticipant: (eventId, userId) => request('PUT', `/admin/events/${eventId}/participants/${userId}`),
  removeParticipant: (eventId, userId) => request('DELETE', `/admin/events/${eventId}/participants/${userId}`),
  draw: (eventId) => request('POST', `/admin/events/${eventId}/draw`),
  resetDraw: (eventId) => request('DELETE', `/admin/events/${eventId}/draw`)
}
