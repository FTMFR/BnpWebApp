<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '@/design-system/atoms'
import Modal from '@/design-system/molecules/Modal.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { ChangeMyPasswordRequest } from '@/shared/api/types'
import { changeMyPasswordSchema } from '@/shared/validation/schemas/auth'
import { useAuthStore } from '@/stores/auth'
import { usePermissionsStore } from '@/stores/permission'
import { useToastStore } from '@/stores/toast'
import { AxiosError } from 'axios'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const router = useRouter()
const toastStore = useToastStore()
const authStore = useAuthStore()
const permissionStore = usePermissionsStore()
const isSubmitting = ref(false)
const showReLoginModal = ref(false)

const formData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const errors = reactive<Record<string, string>>({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

function clearErrors() {
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmNewPassword = ''
}

function validate(): boolean {
  clearErrors()
  const result = changeMyPasswordSchema.safeParse(formData)
  if (result.success) return true
  result.error.issues.forEach((issue) => {
    const path = issue.path[0] as string
    if (path in errors) errors[path] = issue.message
  })
  return false
}

const handleSubmit = async () => {
  if (!validate()) return
  isSubmitting.value = true
  try {
    const body: ChangeMyPasswordRequest = {
      CurrentPassword: formData.currentPassword,
      NewPassword: formData.newPassword,
      ConfirmNewPassword: formData.confirmNewPassword,
    }
    await apiClient.post(endpoints.auth.changePassword, body)
    authStore.clear()
    permissionStore.clearPermissions()
    showReLoginModal.value = true
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const data = error.response.data as { message?: string; errors?: string[] | string }
      if (data.message) {
        toastStore.showToast(data.message, 'error', 6000)
      }
      if (data.errors) {
        if (Array.isArray(data.errors)) {
          data.errors.forEach((msg: string) => toastStore.showToast(msg, 'error', 6000))
        } else if (typeof data.errors === 'string') {
          toastStore.showToast(data.errors, 'error', 6000)
        }
      }
      if (!data.message && !data.errors) {
        toastStore.showToast('خطا در تغییر رمز عبور', 'error', 5000)
      }
    } else {
      toastStore.showToast('خطا در تغییر رمز عبور', 'error', 5000)
    }
  } finally {
    isSubmitting.value = false
  }
}

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const goToLogin = () => {
  showReLoginModal.value = false
  emit('update:modelValue', false)
  emit('close')
  router.push('/login')
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="تغییر رمز عبور"
    size="sm"
    :close-on-backdrop="false"
    :close-on-escape="!showReLoginModal"
    @update:model-value="showReLoginModal ? goToLogin() : close()"
    @close="showReLoginModal ? goToLogin() : close()"
  >
    <!-- After success: token invalidated, user must sign in again -->
    <p v-if="showReLoginModal" class="text-foreground text-center py-2">لطفا دوباره وارد شوید.</p>
    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <FormField
        v-model="formData.currentPassword"
        label="رمز عبور فعلی"
        type="password"
        placeholder="رمز عبور فعلی را وارد کنید"
        :error-message="errors.currentPassword || undefined"
        autocomplete="current-password"
      />
      <FormField
        v-model="formData.newPassword"
        label="رمز عبور جدید"
        type="password"
        placeholder="رمز عبور جدید را وارد کنید"
        :error-message="errors.newPassword || undefined"
        autocomplete="new-password"
      />
      <FormField
        v-model="formData.confirmNewPassword"
        label="تکرار رمز عبور جدید"
        type="password"
        placeholder="رمز عبور جدید را دوباره وارد کنید"
        :error-message="errors.confirmNewPassword || undefined"
        autocomplete="new-password"
      />
    </form>
    <template #footer>
      <div v-if="showReLoginModal" class="flex text-white justify-end">
        <BaseButton variant="default" @click="goToLogin">ورود</BaseButton>
      </div>
      <div v-else class="flex text-white justify-end gap-3">
        <BaseButton variant="outline" @click="close">انصراف</BaseButton>
        <BaseButton variant="default" type="button" @click="handleSubmit" :disabled="isSubmitting">
          {{ isSubmitting ? 'در حال ارسال...' : 'تغییر رمز عبور' }}
        </BaseButton>
      </div>
    </template>
  </Modal>
</template>
