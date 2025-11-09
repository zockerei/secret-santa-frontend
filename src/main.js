import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Dashboard from './views/Dashboard.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import UserDashboard from './views/UserDashboard.vue'
import LetItDraw from './views/LetItDraw.vue'
import ChristmasCannon from './views/ChristmasCannon.vue'
import ChristmasMusic from './views/ChristmasMusic.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/let-it-draw', name: 'LetItDraw', component: LetItDraw },
  { path: '/christmas-cannon', name: 'ChristmasCannon', component: ChristmasCannon },
  { path: '/christmas-music', name: 'ChristmasMusic', component: ChristmasMusic },
  { 
    path: '/dashboard', 
    name: 'Dashboard',
    component: Dashboard, 
    meta: { requiresAuth: true },
    redirect: (to) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.is_admin ? '/admin' : '/user'
    }
  },
  { 
    path: '/admin', 
    name: 'AdminDashboard',
    component: AdminDashboard, 
    meta: { requiresAuth: true, requiresAdmin: true } 
  },
  { 
    path: '/user', 
    name: 'UserDashboard',
    component: UserDashboard, 
    meta: { requiresAuth: true } 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // Redirect to login if route requires auth and no token
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  
  // Redirect non-admin users away from admin routes
  if (to.meta.requiresAdmin && !user.is_admin) {
    next('/user')
    return
  }
  
  // Redirect authenticated users away from login/register
  if ((to.name === 'Login' || to.name === 'Register') && token) {
    next('/dashboard')
    return
  }
  
  next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')

