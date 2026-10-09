<template>
  <div class="page">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Hallo {{ user?.name }}!</h1>

      <TabBar v-model="activeTab" :tabs="tabs" />

      <!-- Upcoming events -->
      <section v-if="activeTab === 'events'">
        <p v-if="loading" class="empty">Lade Veranstaltungen...</p>
        <ErrorMessage v-else-if="loadError" :message="loadError" />
        <div v-else-if="upcomingEvents.length === 0" class="empty">
          <div class="text-5xl mb-4">🎅</div>
          <p>Gerade gibt es keine Veranstaltungen.</p>
        </div>

        <div v-else class="grid gap-4 lg:grid-cols-2">
          <article v-for="event in upcomingEvents" :key="event.id" class="card p-6 space-y-4">
            <header class="flex justify-between items-start gap-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ event.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(event.date) }} · {{ event.participant_count }} Teilnehmer
                </p>
              </div>
              <span
                :class="[
                  'badge',
                  event.drawn
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                    : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                ]"
              >
                {{ event.drawn ? 'Ausgelost' : 'Offen' }}
              </span>
            </header>

            <template v-if="event.recipient">
              <div class="bg-linear-to-r from-red-50 to-green-50 dark:from-red-900/40 dark:to-green-900/40 p-5 rounded-lg border border-red-100 dark:border-red-800">
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">🎅 Du bist Wichtel für</p>
                <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ event.recipient.name }}</p>
              </div>
              <WishList :title="`💝 Wunschliste von ${event.recipient.name}`" :content="event.recipient.message" />
            </template>
            <p v-else-if="event.is_participant" class="text-sm text-gray-600 dark:text-gray-300">
              Du bist dabei! Sobald ausgelost ist, siehst du hier, wen du beschenkst.
              <span v-if="!event.my_message" class="block mt-1 text-orange-600 dark:text-orange-400">
                Schreib noch deine Wunschliste, damit dein Wichtel weiß, was du dir wünschst.
              </span>
            </p>

            <div class="flex flex-wrap gap-2">
              <button v-if="!event.is_participant" class="btn btn-primary" :disabled="busy" @click="join(event)">
                Beitreten
              </button>
              <template v-else>
                <button class="btn btn-success" @click="openWishList(event)">
                  {{ event.my_message ? 'Meine Wunschliste bearbeiten' : 'Wunschliste schreiben' }}
                </button>
                <button v-if="!event.drawn" class="btn btn-danger" @click="leaveEvent = event">Verlassen</button>
              </template>
            </div>
          </article>
        </div>
      </section>

      <!-- Past events -->
      <section v-if="activeTab === 'archive'">
        <p v-if="loading" class="empty">Lade Archiv...</p>
        <div v-else-if="pastEvents.length === 0" class="empty">
          <div class="text-5xl mb-4">📦</div>
          <p>Vergangene Veranstaltungen erscheinen hier.</p>
        </div>

        <div v-else class="space-y-4">
          <details v-for="event in pastEvents" :key="event.id" class="card group">
            <summary class="flex items-center justify-between gap-4 p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ event.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(event.date) }}</p>
                <p v-if="event.recipient" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Du hast <strong>{{ event.recipient.name }}</strong> beschenkt
                </p>
              </div>
              <span class="text-gray-500 dark:text-gray-400 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div class="px-6 pb-6 space-y-4">
              <WishList
                v-if="event.recipient"
                :title="`💝 Wunschliste von ${event.recipient.name}`"
                :content="event.recipient.message"
              />
              <WishList title="📝 Deine Wunschliste" :content="event.my_message" mine />
            </div>
          </details>
        </div>
      </section>

      <ProfileSettings v-if="activeTab === 'profile'" />
    </div>

    <!-- Wish list editor -->
    <Modal v-if="wishListEvent" size="large" @close="wishListEvent = null">
      <template #title>Deine Wunschliste für {{ wishListEvent.name }}</template>
      <template #content>
        <form class="space-y-4" @submit.prevent="saveWishList">
          <MarkdownEditor
            v-model="wishListText"
            :rows="15"
            placeholder="Was wünschst du dir? Hobbys, Größen, Lieblingsfarben, was du auf keinen Fall möchtest..."
          />
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Nur dein Wichtel sieht deine Wunschliste. Du kannst sie bis zum Tag der Veranstaltung ändern.
          </p>
          <ErrorMessage :message="wishListError" />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-secondary" @click="wishListEvent = null">Abbrechen</button>
            <button type="submit" class="btn btn-primary" :disabled="busy">{{ busy ? 'Speichert...' : 'Speichern' }}</button>
          </div>
        </form>
      </template>
    </Modal>

    <ConfirmDialog
      v-if="leaveEvent"
      title="Veranstaltung verlassen"
      :message="`Möchtest du ${leaveEvent.name} wirklich verlassen? Deine Wunschliste wird dabei gelöscht.`"
      confirm-label="Verlassen"
      :action="leave"
      @close="leaveEvent = null"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { events } from '../api'
import { formatDate, isPast } from '../format'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import Modal from '../components/Modal.vue'
import ProfileSettings from '../components/ProfileSettings.vue'
import TabBar from '../components/TabBar.vue'
import WishList from '../components/WishList.vue'

const { user } = useAuth()
const { showToast } = useToast()

const tabs = [
  { id: 'events', label: 'Veranstaltungen' },
  { id: 'archive', label: 'Archiv' },
  { id: 'profile', label: 'Profil' }
]
const activeTab = ref('events')

const allEvents = ref([])
const loading = ref(true)
const loadError = ref('')
const busy = ref(false)

// The API returns the open events and every event you are in, newest first
const upcomingEvents = computed(() => allEvents.value.filter(event => !isPast(event.date)))
const pastEvents = computed(() => allEvents.value.filter(event => isPast(event.date) && event.is_participant))

async function load() {
  try {
    allEvents.value = await events.list()
    loadError.value = ''
  } catch (error) {
    loadError.value = error.message
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function join(event) {
  busy.value = true
  try {
    await events.join(event.id)
    await load()
    showToast(`Du bist bei ${event.name} dabei!`)
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    busy.value = false
  }
}

const leaveEvent = ref(null)

async function leave() {
  await events.leave(leaveEvent.value.id)
  await load()
  showToast(`Du hast ${leaveEvent.value.name} verlassen`)
}

const wishListEvent = ref(null)
const wishListText = ref('')
const wishListError = ref('')

function openWishList(event) {
  wishListEvent.value = event
  wishListText.value = event.my_message || ''
  wishListError.value = ''
}

async function saveWishList() {
  busy.value = true
  wishListError.value = ''
  try {
    await events.setMessage(wishListEvent.value.id, wishListText.value.trim() || null)
    wishListEvent.value = null
    await load()
    showToast('Wunschliste gespeichert')
  } catch (error) {
    wishListError.value = error.message
  } finally {
    busy.value = false
  }
}
</script>
