<template>
  <div class="page">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verwaltung</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Hier siehst du, wer mitmacht und wer schon eine Wunschliste hat. Wer wen beschenkt und was in
        den Wunschlisten steht, bleibt auch für Admins geheim.
      </p>

      <TabBar v-model="activeTab" :tabs="tabs" />

      <EventsPanel v-if="activeTab === 'events'" />
      <UsersPanel v-if="activeTab === 'users'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TabBar from '../components/TabBar.vue'
import EventsPanel from '../components/admin/EventsPanel.vue'
import UsersPanel from '../components/admin/UsersPanel.vue'

const tabs = [
  { id: 'events', label: 'Veranstaltungen' },
  { id: 'users', label: 'Benutzer' }
]
const activeTab = ref('events')
</script>
