<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav class="-mb-px flex space-x-8 overflow-x-auto">
          <button
            @click="activeTab = 'events'"
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'events'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            Events
          </button>
          <button
            @click="activeTab = 'archive'"
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'archive'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            Archive
          </button>
          <button
            @click="activeTab = 'users'"
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'users'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            Users
          </button>
        </nav>
      </div>

      <!-- Events Tab -->
      <div v-if="activeTab === 'events'" class="space-y-6">
        <!-- Create Event Button -->
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Events</h2>
          <button
            @click="showCreateEventModal = true"
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Create Event
          </button>
        </div>

        <!-- Events List -->
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Loading events...</p>
        </div>

        <div v-else-if="events.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p class="text-gray-500 dark:text-gray-400">No events yet. Create your first event!</p>
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="event in activeEvents"
            :key="event.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-all"
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
                {{ event.status }}
              </span>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-600 dark:text-gray-300">
                <span class="font-medium">Participants:</span> {{ event.participant_count }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                @click="viewEventDetails(event.id)"
                class="text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
              >
                Details
              </button>
              <button
                @click="editEvent(event)"
                class="text-sm px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition"
              >
                Edit
              </button>
              <button
                v-if="event.status === 'Draft' || event.status === 'Open'"
                @click="openAssignmentOptions(event.id)"
                :disabled="event.participant_count < 2"
                class="text-sm px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
              </button>
              <button
                v-if="event.status === 'Draft' || event.status === 'Open'"
                @click="openManualAssignment(event.id)"
                :disabled="event.participant_count < 2"
                class="text-sm px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-100 dark:hover:bg-purple-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Manual Assign
              </button>
              <button
                v-if="event.status === 'Assigned'"
                @click="closeEvent(event.id)"
                class="text-sm px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
              <button
                v-if="event.status === 'Closed'"
                @click="reopenEvent(event.id)"
                class="text-sm px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition"
              >
                Reopen
              </button>
              <button
                @click="confirmDeleteEvent(event)"
                class="text-sm px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Archive Tab -->
      <div v-if="activeTab === 'archive'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Archived Events</h2>
        </div>

        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Loading archived events...</p>
        </div>

        <div v-else-if="archivedEvents.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="text-5xl mb-4">📦</div>
          <p class="text-gray-500 dark:text-gray-300">No archived events.</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Closed events will appear here.</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="event in archivedEvents"
            :key="event.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-gray-400 dark:border-gray-600"
          >
            <!-- Collapsible Header -->
            <button
              @click="toggleArchiveEvent(event.id)"
              class="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ event.event_name }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(event.date) }}</p>
                  </div>
                  <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-semibold rounded ml-4">
                    Closed
                  </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-medium">Participants:</span> {{ event.participant_count }}
                </p>
              </div>
              <svg
                :class="[
                  'w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform duration-200 ml-4 flex-shrink-0',
                  expandedArchiveEvents.has(event.id) ? 'rotate-180' : ''
                ]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Expandable Details -->
            <div v-show="expandedArchiveEvents.has(event.id)" class="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex flex-wrap gap-2 pt-4">
                <button
                  @click="viewEventDetails(event.id)"
                  class="text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                >
                  View Details
                </button>
                <button
                  @click="reopenEvent(event.id)"
                  class="text-sm px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition"
                >
                  Reopen Event
                </button>
                <button
                  @click="confirmDeleteEvent(event)"
                  class="text-sm px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <!-- Create User Button -->
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Users</h2>
          <button
            @click="openCreateUserModal"
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Create User
          </button>
        </div>

        <!-- Users List -->
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Loading users...</p>
        </div>

        <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in users" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {{ user.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded',
                      user.is_admin ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    ]"
                  >
                    {{ user.is_admin ? 'Admin' : 'User' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="editUser(user)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4 transition"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDeleteUser(user)"
                    class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Event Modal -->
    <Modal v-if="showCreateEventModal" @close="closeEventModal">
      <template #title>{{ editingEvent ? 'Edit Event' : 'Create New Event' }}</template>
      <template #content>
        <form @submit.prevent="saveEvent" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Name</label>
            <input
              v-model="newEvent.event_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Christmas 2024"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Date</label>
            <input
              v-model="newEvent.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div v-if="eventError" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ eventError }}</p>
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="closeEventModal"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="eventLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition"
            >
              {{ eventLoading ? 'Saving...' : (editingEvent ? 'Save' : 'Create') }}
            </button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Create User Modal -->
    <Modal v-if="showCreateUserModal" @close="showCreateUserModal = false">
      <template #title>{{ editingUser ? 'Edit User' : 'Create New User' }}</template>
      <template #content>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              v-model="newUser.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              v-model="newUser.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div v-if="!editingUser">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              v-model="newUser.password"
              type="password"
              :required="!editingUser"
              minlength="8"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Change Password (optional)
            </label>
            <input
              v-model="newUser.password"
              type="password"
              minlength="8"
              placeholder="Leave empty to keep current password"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter a new password (min. 8 characters) or leave empty to keep current password
            </p>
          </div>
          <div class="flex items-center">
            <input
              v-model="newUser.is_admin"
              type="checkbox"
              id="is_admin"
              class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label for="is_admin" class="ml-2 block text-sm text-gray-900 dark:text-gray-200">
              Administrator
            </label>
          </div>
          <div v-if="userError" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ userError }}</p>
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="closeUserModal"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="userLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition"
            >
              {{ userLoading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Event Details Modal -->
    <Modal v-if="showEventDetailsModal && selectedEvent" @close="showEventDetailsModal = false" size="large">
      <template #title>
        <div class="flex items-center justify-between">
          <span>{{ selectedEvent.event_name }} - Details</span>
          <button
            @click="editEventFromDetails"
            class="text-sm px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition"
          >
            Edit Event
          </button>
        </div>
      </template>
      <template #content>
        <div class="space-y-6">
          <!-- Event Info -->
          <div class="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(selectedEvent.date) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <span :class="['px-2 py-1 text-xs font-semibold rounded', getStatusClass(selectedEvent.status)]">
                {{ selectedEvent.status }}
              </span>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Participants</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ selectedEvent.participant_count }}</p>
            </div>
          </div>

          <!-- Participants Section -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Participants</h3>
              <button
                v-if="selectedEvent.status === 'Draft' || selectedEvent.status === 'Open'"
                @click="openAddParticipantModal"
                class="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Add Participants
              </button>
            </div>

            <div v-if="selectedEvent.participants && selectedEvent.participants.length > 0" class="space-y-2">
              <div
                v-for="participant in selectedEvent.participants"
                :key="participant.user_id"
                class="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div class="flex-1">
                  <p class="font-medium text-gray-900 dark:text-white">{{ participant.user_name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    <span v-if="participant.has_message" class="text-green-600 dark:text-green-400">✓ Message added</span>
                    <span v-else class="text-gray-400 dark:text-gray-500">No message yet</span>
                  </p>
                  <p v-if="participant.is_assigned && participant.gifter_name" class="text-sm text-blue-600 dark:text-blue-400">
                    Receiving from: {{ participant.gifter_name }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="openEditMessageModal(participant)"
                    class="text-sm px-2 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                    title="Edit message"
                  >
                    {{ participant.has_message ? 'Edit' : 'Add' }} Message
                  </button>
                  <button
                    v-if="participant.has_message"
                    @click="confirmDeleteMessage(participant)"
                    class="text-sm px-2 py-1 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition"
                    title="Delete message"
                  >
                    Delete Msg
                  </button>
                  <button
                    v-if="selectedEvent.status === 'Draft' || selectedEvent.status === 'Open'"
                    @click="removeParticipant(selectedEvent.id, participant.user_id)"
                    class="text-sm px-2 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition"
                    title="Remove from event"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400 text-sm">No participants yet</p>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Add Participant Modal -->
    <Modal v-if="showAddParticipantModal" @close="showAddParticipantModal = false">
      <template #title>Add Participants</template>
      <template #content>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between items-center mb-3">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Users (click to select/deselect)</label>
              <button
                v-if="availableUsers.length > 0"
                @click="toggleSelectAll"
                class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
              >
                {{ selectedUserIds.length === availableUsers.length ? 'Deselect All' : 'Select All' }}
              </button>
            </div>
            
            <div v-if="availableUsers.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>All users are already participants</p>
            </div>
            
            <div v-else class="max-h-80 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-600 rounded-md p-2">
              <div
                v-for="user in availableUsers"
                :key="user.id"
                @click="toggleUserSelection(user.id)"
                :class="[
                  'p-3 rounded-lg cursor-pointer transition-all',
                  selectedUserIds.includes(user.id)
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                    : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                  </div>
                  <div v-if="selectedUserIds.includes(user.id)" class="text-blue-600 dark:text-blue-400 text-xl">
                    ✓
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedUserIds.length > 0" class="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
            <p class="text-sm text-blue-700 dark:text-blue-400">
              {{ selectedUserIds.length }} participant{{ selectedUserIds.length > 1 ? 's' : '' }} selected
            </p>
          </div>
          
          <div v-if="participantError" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ participantError }}</p>
          </div>
          
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showAddParticipantModal = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              @click="addParticipants"
              :disabled="selectedUserIds.length === 0 || participantLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition"
            >
              {{ participantLoading ? 'Adding...' : `Add ${selectedUserIds.length || ''} Participant${selectedUserIds.length !== 1 ? 's' : ''}` }}
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Edit Participant Message Modal -->
    <Modal v-if="showEditMessageModal && editingParticipant" size="large" @close="showEditMessageModal = false">
      <template #title>{{ editingParticipant.has_message ? 'Edit' : 'Add' }} Message for {{ editingParticipant.user_name }}</template>
      <template #content>
        <form @submit.prevent="saveParticipantMessage" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wishlist / Message
            </label>
            <MarkdownEditor
              v-model="participantMessage"
              :rows="15"
              placeholder="Enter wishlist or message for this participant..."
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This will be visible to the person who is assigned to give a gift to {{ editingParticipant.user_name }}.
            </p>
          </div>
          
          <div v-if="messageError" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ messageError }}</p>
          </div>
          
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showEditMessageModal = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="messageLoading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {{ messageLoading ? 'Saving...' : 'Save Message' }}
            </button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Confirmation Modal -->
    <Modal v-if="showConfirmModal" @close="showConfirmModal = false">
      <template #title>Confirm {{ confirmAction }}</template>
      <template #content>
        <p class="mb-4 text-gray-700 dark:text-gray-300">{{ confirmMessage }}</p>
        <div class="flex justify-end gap-2">
          <button
            @click="showConfirmModal = false"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            @click="executeConfirmAction"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </template>
    </Modal>

    <!-- Manual Assignment Modal -->
    <Modal v-if="showManualAssignmentModal && manualAssignmentEvent" @close="showManualAssignmentModal = false" size="large">
      <template #title>Manual Assignment - {{ manualAssignmentEvent.event_name }}</template>
      <template #content>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Assign each participant to the person they will give a gift to. Each person must give to exactly one person and receive from exactly one person.
          </p>
          
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div
              v-for="participant in manualAssignmentEvent.participants"
              :key="participant.user_id"
              class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div class="flex items-center gap-4">
                <div class="flex-1">
                  <p class="font-medium text-gray-900 dark:text-white">{{ participant.user_name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">will give a gift to:</p>
                </div>
                <div class="flex-1">
                  <select
                    v-model="manualAssignments[participant.user_id]"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Select recipient --</option>
                    <option
                      v-for="recipient in getAvailableRecipients(participant.user_id)"
                      :key="recipient.user_id"
                      :value="recipient.user_id"
                    >
                      {{ recipient.user_name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div v-if="manualAssignmentError" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ manualAssignmentError }}</p>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
            <p class="text-sm text-blue-800 dark:text-blue-300">
              <strong>Validation:</strong> 
              {{ Object.keys(manualAssignments).length }} / {{ manualAssignmentEvent.participants?.length || 0 }} assigned
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="showManualAssignmentModal = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              @click="submitManualAssignment"
              :disabled="manualAssignmentLoading"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {{ manualAssignmentLoading ? 'Assigning...' : 'Assign Manually' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Assignment Options Modal -->
    <Modal v-if="showAssignmentOptionsModal" @close="showAssignmentOptionsModal = false" size="large">
      <template #title>Assignment Options</template>
      <template #content>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Choose which previous events to consider to avoid repeat assignments.
          </p>

          <div v-if="loadingMatchingEvents" class="text-center py-4">
            <p class="text-gray-500 dark:text-gray-400">Loading matching events...</p>
          </div>

          <div v-else>
            <div v-if="matchingEvents.length > 0" class="space-y-3">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Found {{ matchingEvents.length }} event(s) with the same participants:
              </p>
              
              <div class="space-y-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <label class="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="selectedHistoryEvents.length === 0"
                    @change="selectedHistoryEvents = []"
                    class="mt-1"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">No history checking (fresh start)</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Ignore all previous assignments</p>
                  </div>
                </label>

                <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                <label
                  v-for="event in matchingEvents"
                  :key="event.event_id"
                  class="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="event.event_id"
                    v-model="selectedHistoryEvents"
                    class="mt-1"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">{{ event.event_name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(event.event_date) }} • {{ event.status }}
                    </p>
                  </div>
                </label>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
                <p class="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> Selected events will be used to avoid repeat gifting assignments.
                  {{ selectedHistoryEvents.length === 0 ? 'Currently no history checking.' : `Checking against ${selectedHistoryEvents.length} event(s).` }}
                </p>
              </div>
            </div>

            <div v-else class="text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-gray-600 dark:text-gray-300">No previous events found with the same participants.</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">This will be a fresh assignment.</p>
            </div>
          </div>

          <div v-if="assignmentError" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ assignmentError }}</p>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="showAssignmentOptionsModal = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              @click="performAssignment"
              :disabled="assignmentLoading"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition"
            >
              {{ assignmentLoading ? 'Assigning...' : 'Assign Now' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
 
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminAPI } from '../utils/api'
import { useToast } from '../composables/useToast'
import Modal from '../components/Modal.vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'

const { toasts, showToast } = useToast()

const activeTab = ref('events')
const loading = ref(false)
const events = ref([])
const users = ref([])
const selectedEvent = ref(null)
const expandedArchiveEvents = ref(new Set())

// Event modals
const showCreateEventModal = ref(false)
const showEventDetailsModal = ref(false)
const editingEvent = ref(null)
const eventError = ref('')
const eventLoading = ref(false)
const newEvent = ref({
  event_name: '',
  date: ''
})

// User modals
const showCreateUserModal = ref(false)
const editingUser = ref(null)
const userError = ref('')
const userLoading = ref(false)
const newUser = ref({
  name: '',
  email: '',
  password: '',
  is_admin: false
})

// Participant modals
const showAddParticipantModal = ref(false)
const selectedUserIds = ref([])
const participantError = ref('')
const participantLoading = ref(false)

// Confirmation modal
const showConfirmModal = ref(false)
const confirmAction = ref('')
const confirmMessage = ref('')
const confirmCallback = ref(null)

// Manual assignment modal
const showManualAssignmentModal = ref(false)
const manualAssignmentEvent = ref(null)
const manualAssignments = ref({})
const manualAssignmentError = ref('')
const manualAssignmentLoading = ref(false)

// Assignment options modal
const showAssignmentOptionsModal = ref(false)
const assignmentEventId = ref(null)
const matchingEvents = ref([])
const selectedHistoryEvents = ref([])
const loadingMatchingEvents = ref(false)
const assignmentError = ref('')
const assignmentLoading = ref(false)

// Edit message modal
const showEditMessageModal = ref(false)
const editingParticipant = ref(null)
const participantMessage = ref('')
const messageError = ref('')
const messageLoading = ref(false)

const availableUsers = computed(() => {
  if (!selectedEvent.value || !selectedEvent.value.participants) return users.value
  const participantIds = selectedEvent.value.participants.map(p => p.user_id)
  return users.value.filter(u => !participantIds.includes(u.id))
})

const activeEvents = computed(() => {
  return events.value.filter(e => e.status !== 'Closed')
})

const archivedEvents = computed(() => {
  return events.value.filter(e => e.status === 'Closed')
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Newest first
})

const toggleArchiveEvent = (eventId) => {
  if (expandedArchiveEvents.value.has(eventId)) {
    expandedArchiveEvents.value.delete(eventId)
  } else {
    expandedArchiveEvents.value.add(eventId)
  }
}

const getAvailableRecipients = (gifterId) => {
  if (!manualAssignmentEvent.value?.participants) return []
  
  const assignedRecipients = Object.entries(manualAssignments.value)
    .filter(([id]) => parseInt(id) !== gifterId)
    .map(([, recipientId]) => parseInt(recipientId))
    .filter(id => id)
  
  return manualAssignmentEvent.value.participants.filter(
    p => p.user_id !== gifterId && !assignedRecipients.includes(p.user_id)
  )
}

onMounted(() => {
  loadEvents()
  loadUsers()
})

const loadEvents = async () => {
  try {
    loading.value = true
    events.value = await adminAPI.getAllEvents()
  } catch (error) {
    console.error('Failed to load events:', error)
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    loading.value = true
    users.value = await adminAPI.getAllUsers()
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const saveEvent = async () => {
  try {
    eventLoading.value = true
    eventError.value = ''
    
    const eventData = {
      event_name: newEvent.value.event_name,
      date: new Date(newEvent.value.date).toISOString()
    }
    
    if (editingEvent.value) {
      await adminAPI.updateEvent(editingEvent.value.id, eventData)
      showToast('Event updated successfully!', 'success')
    } else {
      await adminAPI.createEvent(eventData)
      showToast('Event created successfully!', 'success')
    }
    
    closeEventModal()
    loadEvents()
  } catch (error) {
    eventError.value = error.response?.data?.detail || 'Failed to save event'
  } finally {
    eventLoading.value = false
  }
}

const editEvent = (event) => {
  editingEvent.value = event
  newEvent.value = {
    event_name: event.event_name,
    date: event.date.split('T')[0] // Convert ISO date to YYYY-MM-DD for input
  }
  showCreateEventModal.value = true
}

const editEventFromDetails = () => {
  editEvent(selectedEvent.value)
  showEventDetailsModal.value = false
}

const closeEventModal = () => {
  showCreateEventModal.value = false
  editingEvent.value = null
  newEvent.value = { event_name: '', date: '' }
  eventError.value = ''
}

const saveUser = async () => {
  try {
    userLoading.value = true
    userError.value = ''
    
    if (editingUser.value) {
      // Update user details
      await adminAPI.updateUser(editingUser.value.id, {
        name: newUser.value.name,
        email: newUser.value.email,
        is_admin: newUser.value.is_admin
      })
      
      // Update password separately if provided
      if (newUser.value.password && newUser.value.password.trim() !== '') {
        await adminAPI.updateUserPassword(editingUser.value.id, newUser.value.password)
      }
      
      showToast('User updated successfully!', 'success')
    } else {
      await adminAPI.createUser(newUser.value)
      showToast('User created successfully!', 'success')
    }
    
    closeUserModal()
    loadUsers()
  } catch (error) {
    userError.value = error.response?.data?.detail || 'Failed to save user'
  } finally {
    userLoading.value = false
  }
}

const openCreateUserModal = () => {
  // Reset state for creating a new user
  editingUser.value = null
  newUser.value = { name: '', email: '', password: '', is_admin: false }
  userError.value = ''
  showCreateUserModal.value = true
}

const editUser = (user) => {
  editingUser.value = user
  newUser.value = {
    name: user.name,
    email: user.email,
    is_admin: user.is_admin
  }
  showCreateUserModal.value = true
}

const closeUserModal = () => {
  showCreateUserModal.value = false
  editingUser.value = null
  newUser.value = { name: '', email: '', password: '', is_admin: false }
  userError.value = ''
}

const viewEventDetails = async (eventId) => {
  try {
    selectedEvent.value = await adminAPI.getEvent(eventId)
    showEventDetailsModal.value = true
  } catch (error) {
    console.error('Failed to load event details:', error)
  }
}

const openAssignmentOptions = async (eventId) => {
  try {
    assignmentEventId.value = eventId
    loadingMatchingEvents.value = true
    assignmentError.value = ''
    selectedHistoryEvents.value = []
    showAssignmentOptionsModal.value = true
    
    const response = await adminAPI.getMatchingParticipantEvents(eventId)
    matchingEvents.value = response.matching_events || []
  } catch (error) {
    assignmentError.value = 'Failed to load matching events'
    matchingEvents.value = []
  } finally {
    loadingMatchingEvents.value = false
  }
}

const performAssignment = async () => {
  try {
    assignmentLoading.value = true
    assignmentError.value = ''
    
    const historyEventIds = selectedHistoryEvents.value.length > 0 
      ? selectedHistoryEvents.value 
      : []
    
    await adminAPI.assignEvent(assignmentEventId.value, historyEventIds)
    showAssignmentOptionsModal.value = false
    loadEvents()
    showToast('Secret Santa pairs assigned successfully!', 'success')
  } catch (error) {
    assignmentError.value = error.response?.data?.detail || 'Failed to assign Secret Santa pairs'
  } finally {
    assignmentLoading.value = false
  }
}

const assignEvent = async (eventId) => {
  try {
    await adminAPI.assignEvent(eventId)
    loadEvents()
    showToast('Secret Santa pairs assigned successfully!', 'success')
  } catch (error) {
    showToast(error.response?.data?.detail || 'Failed to assign Secret Santa pairs', 'error')
  }
}

const openManualAssignment = async (eventId) => {
  try {
    manualAssignmentEvent.value = await adminAPI.getEvent(eventId)
    manualAssignments.value = {}
    manualAssignmentError.value = ''
    showManualAssignmentModal.value = true
  } catch (error) {
    showToast('Failed to load event details', 'error')
  }
}

const submitManualAssignment = async () => {
  try {
    manualAssignmentLoading.value = true
    manualAssignmentError.value = ''
    
    const participants = manualAssignmentEvent.value.participants
    
    // Validate all participants have assignments
    if (Object.keys(manualAssignments.value).length !== participants.length) {
      manualAssignmentError.value = 'All participants must be assigned'
      manualAssignmentLoading.value = false
      return
    }
    
    // Validate no one is assigned to themselves
    for (const [gifterId, recipientId] of Object.entries(manualAssignments.value)) {
      if (parseInt(gifterId) === parseInt(recipientId)) {
        manualAssignmentError.value = 'A person cannot give to themselves'
        manualAssignmentLoading.value = false
        return
      }
    }
    
    // Validate everyone receives exactly once
    const recipients = Object.values(manualAssignments.value)
    const uniqueRecipients = new Set(recipients)
    if (uniqueRecipients.size !== recipients.length) {
      manualAssignmentError.value = 'Each person must receive from exactly one person'
      manualAssignmentLoading.value = false
      return
    }
    
    // Convert to the format expected by the API
    const assignments = Object.entries(manualAssignments.value).map(([gifter_id, recipient_id]) => ({
      gifter_user_id: parseInt(gifter_id),
      recipient_user_id: parseInt(recipient_id)
    }))
    
    await adminAPI.assignManual(manualAssignmentEvent.value.id, assignments)
    showManualAssignmentModal.value = false
    loadEvents()
    showToast('Manual assignments completed successfully!', 'success')
  } catch (error) {
    manualAssignmentError.value = error.response?.data?.detail || 'Failed to assign manually'
  } finally {
    manualAssignmentLoading.value = false
  }
}

const closeEvent = async (eventId) => {
  try {
    await adminAPI.closeEvent(eventId)
    loadEvents()
    showToast('Event closed successfully!', 'success')
  } catch (error) {
    showToast(error.response?.data?.detail || 'Failed to close event', 'error')
  }
}

const reopenEvent = async (eventId) => {
  try {
    await adminAPI.reopenEvent(eventId)
    loadEvents()
    showToast('Event reopened successfully!', 'success')
  } catch (error) {
    showToast(error.response?.data?.detail || 'Failed to reopen event', 'error')
  }
}

const openAddParticipantModal = () => {
  selectedUserIds.value = []
  participantError.value = ''
  showAddParticipantModal.value = true
}

const toggleUserSelection = (userId) => {
  const index = selectedUserIds.value.indexOf(userId)
  if (index > -1) {
    selectedUserIds.value.splice(index, 1)
  } else {
    selectedUserIds.value.push(userId)
  }
}

const toggleSelectAll = () => {
  if (selectedUserIds.value.length === availableUsers.value.length) {
    selectedUserIds.value = []
  } else {
    selectedUserIds.value = availableUsers.value.map(u => u.id)
  }
}

const addParticipants = async () => {
  try {
    participantLoading.value = true
    participantError.value = ''
    
    // Add all selected participants
    const promises = selectedUserIds.value.map(userId => 
      adminAPI.addParticipant(selectedEvent.value.id, userId)
    )
    
    await Promise.all(promises)
    
    showAddParticipantModal.value = false
    selectedUserIds.value = []
    await viewEventDetails(selectedEvent.value.id)
    loadEvents()
    
    const count = promises.length
    showToast(
      `${count} participant${count > 1 ? 's' : ''} added successfully!`, 
      'success'
    )
  } catch (error) {
    participantError.value = error.response?.data?.detail || 'Failed to add participants'
  } finally {
    participantLoading.value = false
  }
}

const removeParticipant = async (eventId, userId) => {
  try {
    await adminAPI.removeParticipant(eventId, userId)
    await viewEventDetails(eventId)
    loadEvents()
    showToast('Participant removed successfully!', 'success')
  } catch (error) {
    showToast(error.response?.data?.detail || 'Failed to remove participant', 'error')
  }
}

const openEditMessageModal = async (participant) => {
  try {
    // Reload event details to get the latest message
    const eventDetails = await adminAPI.getEvent(selectedEvent.value.id)
    const fullParticipant = eventDetails.participants.find(p => p.user_id === participant.user_id)
    
    editingParticipant.value = fullParticipant || participant
    participantMessage.value = fullParticipant?.message || ''
    messageError.value = ''
    showEditMessageModal.value = true
  } catch (error) {
    console.error('Failed to load participant message:', error)
    // Fallback to what we have
    editingParticipant.value = participant
    participantMessage.value = participant.message || ''
    messageError.value = ''
    showEditMessageModal.value = true
  }
}

const saveParticipantMessage = async () => {
  try {
    messageLoading.value = true
    messageError.value = ''
    
    await adminAPI.updateParticipantMessage(
      selectedEvent.value.id,
      editingParticipant.value.user_id,
      participantMessage.value
    )
    
    showEditMessageModal.value = false
    await viewEventDetails(selectedEvent.value.id)
    loadEvents()
    showToast('Message saved successfully!', 'success')
  } catch (error) {
    messageError.value = error.response?.data?.detail || 'Failed to save message'
  } finally {
    messageLoading.value = false
  }
}

const confirmDeleteMessage = (participant) => {
  confirmAction.value = 'Delete Message'
  confirmMessage.value = `Are you sure you want to delete the message for ${participant.user_name}?`
  confirmCallback.value = async () => {
    try {
      await adminAPI.deleteParticipantMessage(selectedEvent.value.id, participant.user_id)
      showConfirmModal.value = false
      await viewEventDetails(selectedEvent.value.id)
      loadEvents()
      showToast('Message deleted successfully!', 'success')
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to delete message', 'error')
    }
  }
  showConfirmModal.value = true
}

const confirmDeleteEvent = (event) => {
  confirmAction.value = 'Delete Event'
  confirmMessage.value = `Are you sure you want to delete "${event.event_name}"? This action cannot be undone.`
  confirmCallback.value = async () => {
    try {
      await adminAPI.deleteEvent(event.id)
      showConfirmModal.value = false
      loadEvents()
      showToast('Event deleted successfully!', 'success')
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to delete event', 'error')
    }
  }
  showConfirmModal.value = true
}

const confirmDeleteUser = (user) => {
  confirmAction.value = 'Delete User'
  confirmMessage.value = `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`
  confirmCallback.value = async () => {
    try {
      await adminAPI.deleteUser(user.id)
      showConfirmModal.value = false
      loadUsers()
      showToast('User deleted successfully!', 'success')
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to delete user', 'error')
    }
  }
  showConfirmModal.value = true
}

const executeConfirmAction = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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
</script>

