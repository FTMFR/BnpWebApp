import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { Session, MySessionsResponse } from '@/shared/api/types'

export const useSessionModalStore = defineStore('sessionModal', () => {
  const showModal = ref(false)
  const sessions = ref<Session[]>([])
  const sessionsInfo = ref<MySessionsResponse | null>(null)
  const isLoading = ref(false)
  const isModalShown = ref(false) // Prevent duplicate modals
  const revokingSessionId = ref<string | null>(null)

  const openModal = async () => {
    // Prevent opening if already shown
    if (isModalShown.value) {
      return
    }

    isModalShown.value = true
    showModal.value = true
    await fetchSessions()
  }

  const closeModal = () => {
    showModal.value = false
    isModalShown.value = false
  }

  const fetchSessions = async (): Promise<MySessionsResponse | null> => {
    isLoading.value = true
    try {
      const response = await apiClient.get<MySessionsResponse>(endpoints.session.mySessions)
      const data = response.data
      sessions.value = data.sessions
      sessionsInfo.value = data
      return data
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const revokeSession = async (sessionPublicId: string): Promise<boolean> => {
    revokingSessionId.value = sessionPublicId
    try {
      await apiClient.post(endpoints.session.revokeSession(sessionPublicId))
      // Refresh sessions after revoke
      const updatedSessions = await fetchSessions()

      // If MaxSession is false after revoking, close the modal
      if (updatedSessions && !updatedSessions.isMaxSessionsReached) {
        closeModal()
      }

      return true
    } catch (error) {
      console.error('Failed to revoke session:', error)
      return false
    } finally {
      revokingSessionId.value = null
    }
  }

  const continueWithToken = () => {
    closeModal()
  }

  return {
    showModal,
    sessions,
    sessionsInfo,
    isLoading,
    isModalShown,
    revokingSessionId,
    openModal,
    closeModal,
    fetchSessions,
    revokeSession,
    continueWithToken,
  }
})
