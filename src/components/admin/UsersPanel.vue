<template>
  <section class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Benutzer</h2>
      <button class="btn btn-primary" @click="openUserForm(null)">Neuer Benutzer</button>
    </div>

    <p v-if="loading" class="empty">Lade Benutzer...</p>
    <ErrorMessage v-else-if="loadError" :message="loadError" />

    <div v-else class="card overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-Mail</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rolle</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'badge',
                  user.is_admin
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                ]"
              >
                {{ user.is_admin ? 'Admin' : 'Teilnehmer' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
              <button class="btn btn-secondary" @click="openUserForm(user)">Bearbeiten</button>
              <button v-if="user.id !== me?.id" class="btn btn-danger" @click="confirmDelete(user)">Löschen</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create or edit a user -->
    <Modal v-if="userForm" @close="userForm = null">
      <template #title>{{ userForm.id ? `${userForm.name} bearbeiten` : 'Neuer Benutzer' }}</template>
      <template #content>
        <form class="space-y-4" @submit.prevent="saveUser">
          <div>
            <label class="label" for="user-name">Name</label>
            <input id="user-name" v-model.trim="userForm.name" class="input" required maxlength="50" />
          </div>
          <div>
            <label class="label" for="user-email">E-Mail</label>
            <input id="user-email" v-model.trim="userForm.email" type="email" class="input" required />
          </div>
          <div>
            <label class="label" for="user-password">
              {{ userForm.id ? 'Neues Passwort (leer lassen, um es nicht zu ändern)' : 'Passwort (mindestens 8 Zeichen)' }}
            </label>
            <input
              id="user-password"
              v-model="userForm.password"
              type="password"
              class="input"
              :required="!userForm.id"
              minlength="8"
              autocomplete="new-password"
            />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-200">
            <input v-model="userForm.is_admin" type="checkbox" :disabled="userForm.id === me?.id" />
            Admin (kann Benutzer und Veranstaltungen verwalten)
          </label>
          <ErrorMessage :message="formError" />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-secondary" @click="userForm = null">Abbrechen</button>
            <button type="submit" class="btn btn-primary" :disabled="busy">{{ busy ? 'Speichert...' : 'Speichern' }}</button>
          </div>
        </form>
      </template>
    </Modal>

    <ConfirmDialog
      v-if="deleting"
      title="Benutzer löschen"
      :message="`${deleting.name} mit allen Wunschlisten löschen? Das lässt sich nicht rückgängig machen.`"
      confirm-label="Löschen"
      :action="deleteUser"
      @close="deleting = null"
    />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { admin } from '../../api'
import { useAuth } from '../../composables/useAuth'
import { useToast } from '../../composables/useToast'
import ConfirmDialog from '../ConfirmDialog.vue'
import ErrorMessage from '../ErrorMessage.vue'
import Modal from '../Modal.vue'

const { user: me, setUser } = useAuth()
const { showToast } = useToast()

const users = ref([])
const loading = ref(true)
const loadError = ref('')

async function load() {
  try {
    users.value = await admin.users()
    loadError.value = ''
  } catch (error) {
    loadError.value = error.message
  } finally {
    loading.value = false
  }
}

onMounted(load)

const userForm = ref(null)
const formError = ref('')
const busy = ref(false)

function openUserForm(user) {
  userForm.value = user
    ? { id: user.id, name: user.name, email: user.email, password: '', is_admin: user.is_admin }
    : { id: null, name: '', email: '', password: '', is_admin: false }
  formError.value = ''
}

async function saveUser() {
  const { id, password, ...fields } = userForm.value
  busy.value = true
  formError.value = ''
  try {
    if (id) {
      const updated = await admin.updateUser(id, password ? { ...fields, password } : fields)
      // Editing yourself changes the name in the navbar too
      if (id === me.value?.id) setUser(updated)
      showToast('Benutzer gespeichert')
    } else {
      await admin.createUser({ ...fields, password })
      showToast('Benutzer angelegt')
    }
    userForm.value = null
    await load()
  } catch (error) {
    formError.value = error.message
  } finally {
    busy.value = false
  }
}

const deleting = ref(null)

function confirmDelete(user) {
  deleting.value = user
}

async function deleteUser() {
  await admin.deleteUser(deleting.value.id)
  await load()
  showToast(`${deleting.value.name} gelöscht`)
}
</script>
