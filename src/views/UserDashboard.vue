<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'events'"
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'events'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            Veranstaltungen
          </button>
          <button
            @click="activeTab = 'assignments'"
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'assignments'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            Meine Zuteilungen
          </button>
        </nav>
      </div>

      <!-- Events Tab -->
      <div v-if="activeTab === 'events'" class="space-y-6">
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Lade Veranstaltungen...</p>
        </div>

        <div v-else-if="events.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="text-5xl mb-4">🎅</div>
          <p class="text-gray-500 dark:text-gray-300">Noch keine Veranstaltungen verfügbar.</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Schau später nochmal vorbei oder kontaktiere deinen Admin!</p>
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="event in events"
            :key="event.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-all border border-transparent dark:border-gray-700"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ event.event_name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(event.date) }}</p>
              </div>
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded',
                  getStatusClass(event.status)
                ]"
              >
                {{ translateStatus(event.status) }}
              </span>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-600 dark:text-gray-300">
                <span class="font-medium">Teilnehmer:</span> {{ event.participant_count }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                @click="viewEventStatus(event.id)"
                class="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
              >
                Details ansehen
              </button>
              <button
                v-if="(event.status === 'Draft' || event.status === 'Open') && !event.is_participant"
                @click="instantJoinEvent(event)"
                class="text-sm px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
              >
                Beitreten
              </button>
              <button
                v-if="event.is_participant && (event.status === 'Draft' || event.status === 'Open')"
                @click="confirmLeaveEvent(event)"
                class="text-sm px-3 py-1 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 transition font-medium"
              >
                Verlassen
              </button>
              <button
                v-if="event.is_participant && (event.status === 'Draft' || event.status === 'Open') && !event.has_message"
                @click="viewAndEditMessage(event)"
                class="text-sm px-3 py-1 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition font-medium"
              >
                Nachricht hinzufügen
              </button>
              <button
                v-if="event.is_participant && (event.status === 'Draft' || event.status === 'Open') && event.has_message"
                @click="viewAndEditMessage(event)"
                class="text-sm px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
              >
                Nachricht bearbeiten
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Assignments Tab -->
      <div v-if="activeTab === 'assignments'" class="space-y-6">
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Lade Zuteilungen...</p>
        </div>

        <div v-else-if="assignments.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="text-5xl mb-4">🎁</div>
          <p class="text-gray-500 dark:text-gray-300">Noch keine Zuteilungen.</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Tritt einer Veranstaltung bei und warte, bis der Admin die Wichtel zuteilt!</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="assignment in assignments"
            :key="assignment.event_id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-red-500 dark:border-red-400"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ assignment.event_name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(assignment.event_date) }}</p>
              </div>
              <span class="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold rounded">
                Aktiv
              </span>
            </div>

            <div class="bg-gradient-to-r from-red-50 to-green-50 dark:from-red-900/40 dark:to-green-900/40 p-5 rounded-lg mb-4 border border-red-100 dark:border-red-800">
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">🎅 Du bist der Wichtel für:</p>
              <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ assignment.recipient_name }}</p>
            </div>

            <div v-if="assignment.recipient_message" class="bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded">
              <p class="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">💝 Wunschliste:</p>
              <p class="text-gray-700 dark:text-gray-200 leading-relaxed">{{ assignment.recipient_message }}</p>
            </div>
            <div v-else class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border border-gray-200 dark:border-gray-600">
              <p class="text-sm text-gray-500 dark:text-gray-400 italic">Keine Wunschliste angegeben</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Join Event Modal -->
    <Modal v-if="showJoinModal && selectedEvent" size="large" @close="showJoinModal = false">
      <template #title>{{ selectedEvent.event_name }} beitreten</template>
      <template #content>
        <form @submit.prevent="submitJoinEvent" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deine Wunschliste (Optional)
            </label>
            <textarea
              v-model="joinMessage"
              rows="15"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Teile deine Geschenkwünsche, Interessen oder Wunschliste..."
            ></textarea>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Das hilft deinem Wichtel, das perfekte Geschenk für dich auszuwählen!
            </p>
          </div>

          <div v-if="joinError" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ joinError }}</p>
          </div>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showJoinModal = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              :disabled="joinLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition"
            >
              {{ joinLoading ? 'Trete bei...' : 'Beitreten' }}
            </button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Event Status Modal -->
    <Modal v-if="showStatusModal && eventStatus" @close="showStatusModal = false">
      <template #title>{{ eventStatus.event_name }}</template>
      <template #content>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Datum</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(eventStatus.event_date) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <span :class="['px-2 py-1 text-xs font-semibold rounded', getStatusClass(eventStatus.status)]">
                {{ translateStatus(eventStatus.status) }}
              </span>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Deine Teilnahme</p>
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded',
                  eventStatus.is_participant 
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                ]"
              >
                {{ eventStatus.is_participant ? 'Beigetreten' : 'Nicht beigetreten' }}
              </span>
            </div>

            <div v-if="eventStatus.is_participant">
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
                <span v-if="eventStatus.has_message" class="text-green-600 dark:text-green-400">✓ Wunschliste hinzugefügt</span>
                <span v-else class="text-orange-600 dark:text-orange-400">⚠ Noch keine Wunschliste</span>
              </p>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Update Message Modal -->
    <Modal v-if="showUpdateMessageModal" size="large" @close="showUpdateMessageModal = false">
      <template #title>Wunschliste aktualisieren</template>
      <template #content>
        <form @submit.prevent="submitUpdateMessage" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deine Wunschliste
            </label>
            <textarea
              v-model="updateMessage"
              rows="15"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Teile deine Geschenkwünsche, Interessen oder Wunschliste..."
            ></textarea>
          </div>

          <div v-if="updateError" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ updateError }}</p>
          </div>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showUpdateMessageModal = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              :disabled="updateLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition"
            >
              {{ updateLoading ? 'Aktualisiere...' : 'Aktualisieren' }}
            </button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Leave Event Confirmation Modal -->
    <Modal v-if="showLeaveModal && selectedEvent" @close="showLeaveModal = false">
      <template #title>Veranstaltung verlassen</template>
      <template #content>
        <div class="space-y-4">
          <p class="text-gray-700 dark:text-gray-300">
            Bist du sicher, dass du <strong>{{ selectedEvent.event_name }}</strong> verlassen möchtest?
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Deine Wunschliste wird gelöscht und du musst erneut beitreten, wenn du deine Meinung änderst.
          </p>

          <div v-if="leaveError" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ leaveError }}</p>
          </div>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showLeaveModal = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Abbrechen
            </button>
            <button
              @click="submitLeaveEvent"
              :disabled="leaveLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition"
            >
              {{ leaveLoading ? 'Verlasse...' : 'Verlassen' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { userAPI } from '../utils/api'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import Modal from '../components/Modal.vue'

const { user } = useAuth()
const { showToast } = useToast()

const activeTab = ref('events')
const loading = ref(false)
const events = ref([])
const assignments = ref([])

// Join event
const showJoinModal = ref(false)
const selectedEvent = ref(null)
const joinMessage = ref('')
const joinError = ref('')
const joinLoading = ref(false)

// Event status
const showStatusModal = ref(false)
const eventStatus = ref(null)

// Update message
const showUpdateMessageModal = ref(false)
const updateMessage = ref('')
const updateError = ref('')
const updateLoading = ref(false)
const currentEventId = ref(null)

// Leave event
const showLeaveModal = ref(false)
const leaveError = ref('')
const leaveLoading = ref(false)

onMounted(() => {
  loadEvents()
  loadAssignments()
})

const loadEvents = async () => {
  try {
    loading.value = true
    events.value = await userAPI.getEvents()
  } catch (error) {
    console.error('Failed to load events:', error)
  } finally {
    loading.value = false
  }
}

const loadAssignments = async () => {
  try {
    loading.value = true
    assignments.value = await userAPI.getAssignments()
  } catch (error) {
    console.error('Failed to load assignments:', error)
  } finally {
    loading.value = false
  }
}

const instantJoinEvent = async (event) => {
  try {
    await userAPI.joinEvent(event.id, null)
    loadEvents()
    showToast('Successfully joined the event!', 'success')
  } catch (error) {
    showToast(error.response?.data?.detail || 'Failed to join event', 'error')
  }
}

const joinEventWithMessage = (event) => {
  selectedEvent.value = event
  joinMessage.value = ''
  joinError.value = ''
  showJoinModal.value = true
}

const submitJoinEvent = async () => {
  try {
    joinLoading.value = true
    joinError.value = ''
    await userAPI.joinEvent(selectedEvent.value.id, joinMessage.value || null)
    showJoinModal.value = false
    loadEvents()
    showToast('Successfully joined the event!', 'success')
  } catch (error) {
    joinError.value = error.response?.data?.detail || 'Failed to join event'
  } finally {
    joinLoading.value = false
  }
}

const viewEventStatus = async (eventId) => {
  try {
    eventStatus.value = await userAPI.getEventStatus(eventId)
    showStatusModal.value = true
  } catch (error) {
    console.error('Failed to load event status:', error)
  }
}

const viewAndEditMessage = async (event) => {
  try {
    // Load full event status to get current message
    const status = await userAPI.getEventStatus(event.id)
    currentEventId.value = event.id
    updateMessage.value = status.message || ''
    showUpdateMessageModal.value = true
  } catch (error) {
    console.error('Failed to load event details:', error)
  }
}

const submitUpdateMessage = async () => {
  try {
    updateLoading.value = true
    updateError.value = ''
    await userAPI.updateMessage(currentEventId.value, updateMessage.value)
    showUpdateMessageModal.value = false
    loadEvents()
    showToast('Wishlist updated successfully!', 'success')
  } catch (error) {
    updateError.value = error.response?.data?.detail || 'Failed to update message'
  } finally {
    updateLoading.value = false
  }
}

const confirmLeaveEvent = (event) => {
  selectedEvent.value = event
  leaveError.value = ''
  showLeaveModal.value = true
}

const submitLeaveEvent = async () => {
  try {
    leaveLoading.value = true
    leaveError.value = ''
    await userAPI.leaveEvent(selectedEvent.value.id)
    showLeaveModal.value = false
    loadEvents()
    showToast('Successfully left the event!', 'success')
  } catch (error) {
    leaveError.value = error.response?.data?.detail || 'Failed to leave event'
  } finally {
    leaveLoading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  const classes = {
    'Draft': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    'Open': 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
    'Assigned': 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
    'Closed': 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
  }
  return classes[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

const translateStatus = (status) => {
  const translations = {
    'Draft': 'Entwurf',
    'Open': 'Offen',
    'Assigned': 'Zugeteilt',
    'Closed': 'Geschlossen'
  }
  return translations[status] || status
}
</script>

