import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import Home from './views/Home.vue'
import { setUnauthorizedHandler } from './api'
import { useAuth } from './composables/useAuth'

// Pages other than the home page are only loaded when they are opened (three.js alone is several 100 kB)
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: () => import('./views/Login.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('./views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: () => import('./views/Admin.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/let-it-draw', name: 'LetItDraw', component: () => import('./views/LetItDraw.vue') },
  { path: '/christmas-cannon', name: 'ChristmasCannon', component: () => import('./views/ChristmasCannon.vue') },
  { path: '/christmas-music', name: 'ChristmasMusic', component: () => import('./views/ChristmasMusic.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const { isAuthenticated, isAdmin, logout, refreshUser } = useAuth()

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) return '/login'
  if (to.meta.requiresAdmin && !isAdmin.value) return '/dashboard'
  if (to.name === 'Login' && isAuthenticated.value) return '/dashboard'
})

// An expired or invalid login sends the user back to the login page
setUnauthorizedHandler(() => {
  logout()
  router.push('/login')
})

createApp(App).use(router).mount('#app')

// Logged in from an earlier visit: get the current name, email and admin rights
refreshUser().catch(() => {})
