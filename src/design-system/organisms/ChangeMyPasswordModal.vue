<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '@/design-system/atoms'
import Modal from '@/design-system/molecules/Modal.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { ChangeMyPasswordRequest, PasswordPolicyResponseDto } from '@/shared/api/types'
import { changeMyPasswordSchema } from '@/shared/validation/schemas/auth'
import { useAuthStore } from '@/stores/auth'
import { usePermissionsStore } from '@/stores/permission'
import { useToastStore } from '@/stores/toast'
import { AxiosError } from 'axios'

const props = defineProps<{
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

const passwordPolicy = ref<PasswordPolicyResponseDto | null>(null)
const passwordPolicyError = ref('')
const validatePasswordError = ref('')
let validatePasswordTimeout: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 400

function clearErrors() {
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmNewPassword = ''
}

async function fetchPasswordPolicy() {
  passwordPolicyError.value = ''
  try {
    const response = await apiClient.get<PasswordPolicyResponseDto>(endpoints.auth.passwordPolicy)
    passwordPolicy.value = response.data
  } catch {
    passwordPolicy.value = null
    passwordPolicyError.value = ''
  }
}

function policyText(): string {
  const p = passwordPolicy.value
  if (!p) return ''
  const minLen = p.MinimumLength ?? p.minimumLength
  const maxLen = p.MaximumLength ?? p.maximumLength
  const needUpper = p.RequireUppercase ?? p.requireUppercase
  const needLower = p.RequireLowercase ?? p.requireLowercase
  const needDigit = p.RequireDigit ?? p.requireDigit
  const needSpecial = p.RequireSpecialCharacter ?? p.requireSpecialCharacter
  const specialChars = p.SpecialCharacters ?? p.specialCharacters
  const parts: string[] = []
  if (minLen != null) parts.push(`حداقل ${minLen} کاراکتر`)
  if (maxLen != null) parts.push(`حداکثر ${maxLen} کاراکتر`)
  if (needUpper) parts.push('شامل حرف بزرگ')
  if (needLower) parts.push('شامل حرف کوچک')
  if (needDigit) parts.push('شامل عدد')
  if (needSpecial) parts.push(`شامل کاراکتر خاص${specialChars ? ` (${specialChars})` : ''}`)
  return parts.length ? parts.join('، ') : ''
}

async function validatePasswordOnServer(password: string) {
  if (!password.trim()) {
    validatePasswordError.value = ''
    return
  }
  try {
    await apiClient.post(endpoints.auth.validatePassword, JSON.stringify(password), {
      headers: { 'Content-Type': 'application/json' },
    })
    validatePasswordError.value = ''
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const data = error.response.data as { message?: string; Message?: string }
      validatePasswordError.value = data.Message ?? data.message ?? 'رمز عبور معتبر نیست'
    } else {
      validatePasswordError.value = 'رمز عبور معتبر نیست'
    }
  }
}

function scheduleValidatePassword() {
  if (validatePasswordTimeout) clearTimeout(validatePasswordTimeout)
  validatePasswordTimeout = setTimeout(() => {
    validatePasswordOnServer(formData.newPassword)
    validatePasswordTimeout = null
  }, DEBOUNCE_MS)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      fetchPasswordPolicy()
      validatePasswordError.value = ''
    }
  },
)

watch(
  () => formData.newPassword,
  () => {
    scheduleValidatePassword()
  },
)

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
  validatePasswordError.value = ''
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
      <p
        v-if="policyText()"
        class="text-xs text-muted-foreground mb-1"
      >
        قوانین رمز عبور: {{ policyText() }}
      </p>
      <FormField
        v-model="formData.newPassword"
        label="رمز عبور جدید"
        type="password"
        placeholder="رمز عبور جدید را وارد کنید"
        :error-message="errors.newPassword || validatePasswordError || undefined"
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
