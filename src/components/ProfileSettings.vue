<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Name and email -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Mein Profil</h2>
        <button v-if="!editingProfile" class="btn btn-secondary" @click="startEditProfile">Bearbeiten</button>
      </div>

      <dl v-if="!editingProfile" class="space-y-4">
        <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</dt>
          <dd class="text-lg text-gray-900 dark:text-white">{{ user?.name }}</dd>
        </div>
        <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">E-Mail</dt>
          <dd class="text-lg text-gray-900 dark:text-white">{{ user?.email }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rolle</dt>
          <dd class="text-lg text-gray-900 dark:text-white">{{ user?.is_admin ? 'Administrator' : 'Teilnehmer' }}</dd>
        </div>
      </dl>

      <form v-else class="space-y-4" @submit.prevent="saveProfile">
        <div>
          <label class="label" for="profile-name">Name</label>
          <input id="profile-name" v-model.trim="profile.name" class="input" required maxlength="50" />
        </div>
        <div>
          <label class="label" for="profile-email">E-Mail</label>
          <input id="profile-email" v-model.trim="profile.email" type="email" class="input" required />
        </div>
        <ErrorMessage :message="profileError" />
        <div class="flex justify-end gap-2">
          <button type="button" class="btn btn-secondary" @click="editingProfile = false">Abbrechen</button>
          <button type="submit" class="btn btn-primary" :disabled="profileBusy">
            {{ profileBusy ? 'Speichert...' : 'Speichern' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Password -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Passwort</h2>
        <button v-if="!editingPassword" class="btn btn-secondary" @click="startEditPassword">Ändern</button>
      </div>

      <form v-if="editingPassword" class="space-y-4" @submit.prevent="savePassword">
        <div>
          <label class="label" for="current-password">Aktuelles Passwort</label>
          <input id="current-password" v-model="password.current" type="password" class="input" required autocomplete="current-password" />
        </div>
        <div>
          <label class="label" for="new-password">Neues Passwort (mindestens 8 Zeichen)</label>
          <input id="new-password" v-model="password.new" type="password" class="input" required minlength="8" autocomplete="new-password" />
        </div>
        <div>
          <label class="label" for="confirm-password">Neues Passwort wiederholen</label>
          <input id="confirm-password" v-model="password.confirm" type="password" class="input" required minlength="8" autocomplete="new-password" />
        </div>
        <ErrorMessage :message="passwordError" />
        <div class="flex justify-end gap-2">
          <button type="button" class="btn btn-secondary" @click="editingPassword = false">Abbrechen</button>
          <button type="submit" class="btn btn-primary" :disabled="passwordBusy">
            {{ passwordBusy ? 'Speichert...' : 'Passwort ändern' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { me } from '../api'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import ErrorMessage from './ErrorMessage.vue'

const { user, setUser } = useAuth()
const { showToast } = useToast()

const editingProfile = ref(false)
const profile = ref({ name: '', email: '' })
const profileError = ref('')
const profileBusy = ref(false)

function startEditProfile() {
  profile.value = { name: user.value.name, email: user.value.email }
  profileError.value = ''
  editingProfile.value = true
}

async function saveProfile() {
  profileBusy.value = true
  profileError.value = ''
  try {
    setUser(await me.update(profile.value))
    editingProfile.value = false
    showToast('Profil gespeichert')
  } catch (error) {
    profileError.value = error.message
  } finally {
    profileBusy.value = false
  }
}

const editingPassword = ref(false)
const password = ref({ current: '', new: '', confirm: '' })
const passwordError = ref('')
const passwordBusy = ref(false)

function startEditPassword() {
  password.value = { current: '', new: '', confirm: '' }
  passwordError.value = ''
  editingPassword.value = true
}

async function savePassword() {
  if (password.value.new !== password.value.confirm) {
    passwordError.value = 'Die neuen Passwörter stimmen nicht überein'
    return
  }
  passwordBusy.value = true
  passwordError.value = ''
  try {
    await me.changePassword(password.value.current, password.value.new)
    editingPassword.value = false
    showToast('Passwort geändert')
  } catch (error) {
    passwordError.value = error.message
  } finally {
    passwordBusy.value = false
  }
}
</script>
