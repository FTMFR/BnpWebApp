import { ref } from 'vue'

const defaultTitle = 'عدم دسترسی'
const defaultMessage = 'شما دسترسی لازم برای این عملیات را ندارید. برای دسترسی به این بخش، با مدیر سیستم تماس بگیرید.'

/**
 * Reusable composable for showing the access-denied modal.
 * Use when user tries an action (Create/Edit/Delete) without permission.
 */
export function useAccessDenied() {
  const showAccessDeniedModal = ref(false)
  const accessDeniedMessage = ref(defaultMessage)
  const accessDeniedTitle = ref(defaultTitle)

  const openAccessDeniedModal = (options?: { title?: string; message?: string }) => {
    accessDeniedTitle.value = options?.title ?? defaultTitle
    accessDeniedMessage.value = options?.message ?? defaultMessage
    showAccessDeniedModal.value = true
  }

  const closeAccessDeniedModal = () => {
    showAccessDeniedModal.value = false
  }

  return {
    showAccessDeniedModal,
    accessDeniedTitle,
    accessDeniedMessage,
    openAccessDeniedModal,
    closeAccessDeniedModal,
  }
}
