<template>
  <section class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Veranstaltungen</h2>
      <button class="btn btn-primary" @click="openEventForm(null)">Neue Veranstaltung</button>
    </div>

    <p v-if="loading" class="empty">Lade Veranstaltungen...</p>
    <ErrorMessage v-else-if="loadError" :message="loadError" />
    <p v-else-if="allEvents.length === 0" class="empty">Noch keine Veranstaltungen. Leg die erste an!</p>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <article v-for="event in allEvents" :key="event.id" class="card p-6 space-y-4">
        <header class="flex justify-between items-start gap-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ event.name }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(event.date) }}</p>
          </div>
          <span :class="['badge', status(event).classes]">{{ status(event).label }}</span>
        </header>

        <div>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {{ event.participants.length }} Teilnehmer,
            {{ event.participants.filter(p => p.has_message).length }} mit Wunschliste
          </p>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="participant in event.participants"
              :key="participant.user_id"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <span :title="participant.has_message ? 'Hat eine Wunschliste' : 'Noch keine Wunschliste'">
                {{ participant.has_message ? '✅' : '⏳' }}
              </span>
              {{ participant.name }}
              <button
                v-if="!event.drawn_at"
                class="ml-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                :title="`${participant.name} entfernen`"
                @click="confirmRemove(event, participant)"
              >
                ✕
              </button>
            </li>
          </ul>
        </div>

        <div class="flex flex-wrap gap-2">
          <template v-if="!event.drawn_at">
            <button class="btn btn-secondary" @click="openAddParticipants(event)">Teilnehmer hinzufügen</button>
            <button class="btn btn-success" :disabled="event.participants.length < 2" @click="confirmDraw(event)">
              Auslosen
            </button>
          </template>
          <button v-else-if="!isPast(event.date)" class="btn btn-secondary" @click="confirmResetDraw(event)">
            Auslosung zurücksetzen
          </button>
          <button class="btn btn-secondary" @click="openEventForm(event)">Bearbeiten</button>
          <button class="btn btn-danger" @click="confirmDelete(event)">Löschen</button>
        </div>
      </article>
    </div>

    <!-- Create or edit an event -->
    <Modal v-if="eventForm" @close="eventForm = null">
      <template #title>{{ eventForm.id ? 'Veranstaltung bearbeiten' : 'Neue Veranstaltung' }}</template>
      <template #content>
        <form class="space-y-4" @submit.prevent="saveEvent">
          <div>
            <label class="label" for="event-name">Name</label>
            <input id="event-name" v-model.trim="eventForm.name" class="input" required maxlength="100" placeholder="Weihnachten 2026" />
          </div>
          <div>
            <label class="label" for="event-date">Datum</label>
            <input id="event-date" v-model="eventForm.date" type="date" class="input" required />
          </div>
          <ErrorMessage :message="formError" />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-secondary" @click="eventForm = null">Abbrechen</button>
            <button type="submit" class="btn btn-primary" :disabled="busy">{{ busy ? 'Speichert...' : 'Speichern' }}</button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Add participants -->
    <Modal v-if="addingTo" @close="addingTo = null">
      <template #title>Teilnehmer zu {{ addingTo.name }} hinzufügen</template>
      <template #content>
        <div class="space-y-4">
          <p v-if="addableUsers.length === 0" class="text-gray-600 dark:text-gray-300">Alle Benutzer sind schon dabei.</p>
          <template v-else>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" :checked="selectedUserIds.length === addableUsers.length" @change="toggleAll" />
              Alle auswählen
            </label>
            <div class="max-h-80 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <label v-for="user in addableUsers" :key="user.id" class="flex items-center gap-2 text-gray-900 dark:text-white">
                <input v-model="selectedUserIds" type="checkbox" :value="user.id" />
                {{ user.name }}
              </label>
            </div>
          </template>
          <ErrorMessage :message="formError" />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-secondary" @click="addingTo = null">Abbrechen</button>
            <button class="btn btn-primary" :disabled="busy || selectedUserIds.length === 0" @click="addParticipants">
              {{ busy ? 'Fügt hinzu...' : 'Hinzufügen' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <ConfirmDialog
      v-if="confirmation"
      :title="confirmation.title"
      :message="confirmation.message"
      :confirm-label="confirmation.label"
      :action="confirmation.action"
      @close="confirmation = null"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { admin } from '../../api'
import { formatDate, isPast } from '../../format'
import { useToast } from '../../composables/useToast'
import ConfirmDialog from '../ConfirmDialog.vue'
import ErrorMessage from '../ErrorMessage.vue'
import Modal from '../Modal.vue'

const { showToast } = useToast()

const allEvents = ref([])
const users = ref([])
const loading = ref(true)
const loadError = ref('')
const busy = ref(false)
const formError = ref('')

async function load() {
  try {
    [allEvents.value, users.value] = await Promise.all([admin.events(), admin.users()])
    loadError.value = ''
  } catch (error) {
    loadError.value = error.message
  } finally {
    loading.value = false
  }
}

onMounted(load)

function status(event) {
  if (isPast(event.date)) return { label: 'Vorbei', classes: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' }
  if (event.drawn_at) return { label: 'Ausgelost', classes: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' }
  return { label: 'Offen', classes: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' }
}

// Runs a change, reloads the events and shows the toast, or shows the error in the open form
async function run(change, successMessage) {
  busy.value = true
  formError.value = ''
  try {
    await change()
    await load()
    showToast(successMessage)
    return true
  } catch (error) {
    formError.value = error.message
    return false
  } finally {
    busy.value = false
  }
}

// Create and edit
const eventForm = ref(null)

function openEventForm(event) {
  eventForm.value = event ? { id: event.id, name: event.name, date: event.date } : { id: null, name: '', date: '' }
  formError.value = ''
}

async function saveEvent() {
  const { id, name, date } = eventForm.value
  const saved = await run(
    () => (id ? admin.updateEvent(id, { name, date }) : admin.createEvent({ name, date })),
    id ? 'Veranstaltung gespeichert' : 'Veranstaltung angelegt'
  )
  if (saved) eventForm.value = null
}

// Participants
const addingTo = ref(null)
const selectedUserIds = ref([])

const addableUsers = computed(() => {
  if (!addingTo.value) return []
  const participantIds = new Set(addingTo.value.participants.map(p => p.user_id))
  return users.value.filter(user => !participantIds.has(user.id))
})

function openAddParticipants(event) {
  addingTo.value = event
  selectedUserIds.value = []
  formError.value = ''
}

function toggleAll() {
  selectedUserIds.value = selectedUserIds.value.length === addableUsers.value.length
    ? []
    : addableUsers.value.map(user => user.id)
}

async function addParticipants() {
  const eventId = addingTo.value.id
  const count = selectedUserIds.value.length
  const added = await run(
    () => Promise.all(selectedUserIds.value.map(userId => admin.addParticipant(eventId, userId))),
    count === 1 ? '1 Teilnehmer hinzugefügt' : `${count} Teilnehmer hinzugefügt`
  )
  if (added) addingTo.value = null
}

// Actions that need a confirmation
const confirmation = ref(null)

function confirmRemove(event, participant) {
  confirmation.value = {
    title: 'Teilnehmer entfernen',
    message: `${participant.name} aus ${event.name} entfernen? Die Wunschliste wird dabei gelöscht.`,
    label: 'Entfernen',
    action: async () => {
      await admin.removeParticipant(event.id, participant.user_id)
      await load()
      showToast(`${participant.name} entfernt`)
    }
  }
}

function confirmDraw(event) {
  const missing = event.participants.filter(p => !p.has_message).map(p => p.name)
  confirmation.value = {
    title: `${event.name} auslosen`,
    message: 'Danach kann niemand mehr beitreten oder verlassen. Wunschlisten können bis zum Tag der Veranstaltung geändert werden.'
      + (missing.length ? ` Noch ohne Wunschliste: ${missing.join(', ')}.` : ''),
    label: 'Auslosen',
    action: async () => {
      const result = await admin.draw(event.id)
      await load()
      // Normally the last 2 events are avoided, fewer only if that was impossible
      const avoided = result.history_events_avoided
      if (avoided >= 2) showToast('Ausgelost!')
      else if (avoided === 1) showToast('Ausgelost! Nur Paare aus der letzten Veranstaltung wurden vermieden.')
      else showToast('Ausgelost! Wiederholungen ließen sich diesmal nicht vermeiden.')
    }
  }
}

function confirmResetDraw(event) {
  confirmation.value = {
    title: 'Auslosung zurücksetzen',
    message: `Alle Paare von ${event.name} werden gelöscht. Danach können wieder Teilnehmer beitreten oder verlassen und du kannst neu auslosen.`,
    label: 'Zurücksetzen',
    action: async () => {
      await admin.resetDraw(event.id)
      await load()
      showToast('Auslosung zurückgesetzt')
    }
  }
}

function confirmDelete(event) {
  confirmation.value = {
    title: 'Veranstaltung löschen',
    message: `${event.name} mit allen Wunschlisten und Paaren löschen? Das lässt sich nicht rückgängig machen.`,
    label: 'Löschen',
    action: async () => {
      await admin.deleteEvent(event.id)
      await load()
      showToast('Veranstaltung gelöscht')
    }
  }
}
</script>
