<template>
  <div class="min-h-screen bg-background-primary dark:bg-background-inverse p-4 sm:p-6">
    <div class="max-w-2xl mx-auto">
      <div
        class="bg-card-background border border-border-default rounded-xl p-4 sm:p-6 md:p-8 shadow-sm"
      >
        <div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white flex-shrink-0"
          >
            <BaseIcon
              name="ShieldCheck"
              :size="20"
              :stroke-width="2.5"
              icon-class="text-white sm:w-6 sm:h-6"
            />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-foreground m-0 truncate">
              تنظیمات تایید دو مرحله‌ای
            </h1>
            <p class="text-xs sm:text-sm font-normal text-muted-foreground m-0 mt-1 truncate">
              مدیریت امنیت حساب کاربری
            </p>
          </div>
        </div>

        <div
          v-if="errorMessage"
          class="flex items-center gap-3 p-3.5 px-4 bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 dark:border-red-500/40 rounded-xl text-danger-500 dark:text-danger-400 text-sm font-medium mb-6"
          role="alert"
        >
          <BaseIcon
            name="AlertCircle"
            :size="20"
            :stroke-width="2"
            icon-class="flex-shrink-0 text-danger-500 dark:text-danger-400"
          />
          <span>{{ errorMessage }}</span>
        </div>

        <div
          v-if="successMessage"
          class="flex items-center gap-3 p-3.5 px-4 bg-green-500/10 dark:bg-green-500/15 border border-green-500/30 dark:border-green-500/40 rounded-xl text-green-600 dark:text-green-400 text-sm font-medium mb-6"
          role="alert"
        >
          <BaseIcon
            name="CheckCircle"
            :size="20"
            :stroke-width="2"
            icon-class="flex-shrink-0 text-green-600 dark:text-green-400"
          />
          <span>{{ successMessage }}</span>
        </div>

        <!-- MFA Status -->
        <div class="mb-4 sm:mb-6">
          <div
            class="flex items-center justify-between p-3 sm:p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-lg sm:rounded-xl border border-border-default gap-3"
          >
            <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <BaseIcon
                name="ShieldCheck"
                :size="20"
                :stroke-width="2"
                :icon-class="`flex-shrink-0 ${mfaEnabled ? 'text-green-600' : 'text-muted-foreground'} sm:w-6 sm:h-6`"
              />
              <div class="min-w-0">
                <p class="text-sm sm:text-base font-semibold text-foreground m-0 truncate">
                  {{ mfaEnabled ? 'فعال' : 'غیرفعال' }}
                </p>
                <p class="text-xs sm:text-sm text-muted-foreground m-0 mt-1 line-clamp-2">
                  {{ mfaEnabled ? 'تایید دو مرحله‌ای فعال است' : 'تایید دو مرحله‌ای غیرفعال است' }}
                </p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="mfaEnabled"
                @change="handleToggleMfa"
                :disabled="isLoading || isToggling"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
              ></div>
            </label>
          </div>
        </div>

        <!-- Info Box -->
        <div v-if="mfaEnabled" class="mb-6 space-y-4">
          <div
            class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
          >
            <div class="flex items-start gap-3">
              <BaseIcon
                name="Info"
                :size="20"
                :stroke-width="2"
                icon-class="text-blue-600 dark:text-blue-400 mt-0.5"
              />
              <div class="flex-1">
                <p class="text-sm text-blue-900 dark:text-blue-200 m-0 font-medium mb-1">
                  تایید دو مرحله‌ای فعال است
                </p>
                <p class="text-sm text-blue-800 dark:text-blue-300 m-0">
                  هنگام ورود به سیستم، کد تایید به شماره موبایل شما ارسال می‌شود.
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="setupData && (setupData.qrCodeImage || setupData.manualEntryKey)"
            class="p-4 bg-slate-50/80 dark:bg-slate-800/80 border border-border-default rounded-xl"
          >
            <div class="flex items-start gap-3">
              <BaseIcon name="QrCode" :size="20" :stroke-width="2" icon-class="text-primary-500" />
              <div class="flex-1 space-y-3">
                <p class="text-sm font-semibold text-foreground m-0">اتصال برنامه احراز هویت</p>
                <div v-if="setupData.qrCodeImage" class="flex justify-center">
                  <img
                    :src="setupData.qrCodeImage"
                    alt="MFA QR"
                    class="w-40 h-40 object-contain bg-white rounded-lg border border-border-default p-2"
                  />
                </div>
                <div v-if="setupData.manualEntryKey" class="text-xs text-muted-foreground">
                  کد دستی:
                  <span class="font-mono text-foreground">{{ setupData.manualEntryKey }}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="setupData?.recoveryCodes?.length"
            class="p-4 bg-slate-50/80 dark:bg-slate-800/80 border border-border-default rounded-xl"
          >
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-2">
                <BaseIcon name="Key" :size="18" :stroke-width="2" icon-class="text-primary-500" />
                <p class="text-sm font-semibold text-foreground m-0">کدهای بازیابی</p>
              </div>
              <BaseButton variant="outline" size="sm" @click="copyRecoveryCodes">
                کپی
              </BaseButton>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="code in setupData.recoveryCodes"
                :key="code"
                class="px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-border-default rounded-lg"
              >
                {{ code }}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end">
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="isToggling"
              @click="handleRegenerateCodes"
            >
              بازسازی کدهای بازیابی
            </BaseButton>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-3 sm:pt-4 border-t border-border-default">
          <router-link
            to="/dashboard"
            class="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-foreground bg-transparent border border-border-default rounded-lg sm:rounded-xl cursor-pointer transition-colors no-underline hover:bg-slate-50 dark:hover:bg-slate-800 text-center"
          >
            بازگشت به داشبورد
          </router-link>
        </div>
      </div>
    </div>
  </div>

  <Modal
    v-model="showPasswordModal"
    title="تایید رمز عبور"
    size="sm"
    :close-on-backdrop="false"
    @close="cancelPasswordModal"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        برای ادامه، رمز عبور فعلی خود را وارد کنید.
      </p>
      <FormField
        label="رمز عبور فعلی"
        type="password"
        input-id="mfa-password"
        autocomplete="current-password"
        :model-value="confirmationPassword"
        :error-message="passwordError || undefined"
        @update:model-value="(val) => (confirmationPassword = String(val))"
        required
      />
    </div>
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <BaseButton variant="outline" :disabled="isToggling" @click="cancelPasswordModal">
          انصراف
        </BaseButton>
        <BaseButton
          variant="default"
          class="!text-white"
          :loading="isToggling"
          :disabled="isToggling"
          @click="confirmPasswordAction"
        >
          تایید
        </BaseButton>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseButton, BaseIcon } from '@/design-system/atoms'
import Modal from '@/design-system/molecules/Modal.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { AxiosError } from 'axios'
import type { ChangePasswordRequest, MfaResponse, MfaSetupResponse, MfaStatusResponse } from '@/shared/api/types'

interface MfaSetupData {
  recoveryCodes: string[]
  qrCodeImage: string | null
  manualEntryKey: string | null
}

type PendingAction = 'enable' | 'disable' | 'regenerate' | null

const mfaEnabled = ref(false)
const isLoading = ref(false)
const isToggling = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const setupData = ref<MfaSetupData | null>(null)
const showPasswordModal = ref(false)
const confirmationPassword = ref('')
const passwordError = ref('')
const pendingAction = ref<PendingAction>(null)
const previousMfaEnabled = ref<boolean | null>(null)

async function loadMfaStatus() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await apiClient.get<MfaStatusResponse>(endpoints.auth.mfa.status)
    mfaEnabled.value = normalizeMfaStatus(response.data)
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

function handleToggleMfa(event: Event) {
  if (isToggling.value) return
  const target = event.target as HTMLInputElement
  const shouldEnable = target.checked

  previousMfaEnabled.value = !shouldEnable
  openPasswordModal(shouldEnable ? 'enable' : 'disable')
}

function handleRegenerateCodes() {
  if (isToggling.value) return
  openPasswordModal('regenerate')
}

function openPasswordModal(action: PendingAction) {
  pendingAction.value = action
  confirmationPassword.value = ''
  passwordError.value = ''
  showPasswordModal.value = true
}

function cancelPasswordModal() {
  if (pendingAction.value === 'enable' || pendingAction.value === 'disable') {
    revertToggle()
  }
  showPasswordModal.value = false
  pendingAction.value = null
  confirmationPassword.value = ''
  passwordError.value = ''
}

async function confirmPasswordAction() {
  if (!confirmationPassword.value) {
    passwordError.value = 'لطفاً رمز عبور فعلی را وارد کنید.'
    return
  }

  isToggling.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const payload: ChangePasswordRequest = {
    CurrentPassword: confirmationPassword.value,
  }

  try {
    if (pendingAction.value === 'enable') {
      const response = await apiClient.post<MfaSetupResponse>(endpoints.auth.mfa.enable, payload)
      setupData.value = normalizeMfaSetupResponse(response.data)
      successMessage.value = 'تایید دو مرحله‌ای با موفقیت فعال شد.'
    }

    if (pendingAction.value === 'disable') {
      await apiClient.post<MfaResponse>(endpoints.auth.mfa.disable, payload)
      setupData.value = null
      successMessage.value = 'تایید دو مرحله‌ای با موفقیت غیرفعال شد.'
    }

    if (pendingAction.value === 'regenerate') {
      const response = await apiClient.post<MfaSetupResponse>(
        endpoints.auth.mfa.regenerateRecoveryCodes,
        payload,
      )
      setupData.value = normalizeMfaSetupResponse(response.data) || setupData.value
      successMessage.value = 'کدهای بازیابی جدید ایجاد شد.'
    }

    if (pendingAction.value === 'enable' || pendingAction.value === 'disable') {
      previousMfaEnabled.value = null
    }

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    if (pendingAction.value === 'enable' || pendingAction.value === 'disable') {
      revertToggle()
    }
    errorMessage.value = getErrorMessage(error)
  } finally {
    isToggling.value = false
    showPasswordModal.value = false
    pendingAction.value = null
    confirmationPassword.value = ''
  }
}

function revertToggle() {
  if (previousMfaEnabled.value !== null) {
    mfaEnabled.value = previousMfaEnabled.value
  }
  previousMfaEnabled.value = null
}

function copyRecoveryCodes() {
  if (!setupData.value?.recoveryCodes?.length) {
    return
  }

  const text = setupData.value.recoveryCodes.join('\n')

  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        successMessage.value = 'کدهای بازیابی کپی شد.'
        setTimeout(() => {
          successMessage.value = ''
        }, 2000)
      })
      .catch(() => {
        errorMessage.value = 'کپی کدها با خطا مواجه شد.'
      })
  } else {
    errorMessage.value = 'مرورگر از کپی خودکار پشتیبانی نمی‌کند.'
  }
}

function normalizeMfaStatus(data: MfaStatusResponse | Record<string, unknown>) {
  const record = data as Record<string, unknown>
  const value =
    record.enabled ?? record.Enabled ?? record.isEnabled ?? record.IsEnabled

  return typeof value === 'boolean' ? value : false
}

function normalizeMfaSetupResponse(data: MfaSetupResponse | Record<string, unknown> | null) {
  if (!data || typeof data !== 'object') {
    return null
  }

  const record = data as Record<string, unknown>
  const getString = (keys: string[]) => {
    for (const key of keys) {
      if (typeof record[key] === 'string' && record[key]) {
        return record[key] as string
      }
    }
    return null
  }

  const getRecoveryCodes = () => {
    const codes = record.RecoveryCodes ?? record.recoveryCodes
    if (Array.isArray(codes)) {
      return codes.filter((code) => typeof code === 'string') as string[]
    }
    if (typeof codes === 'string') {
      return codes.split(/[\s,]+/).filter(Boolean)
    }
    return []
  }

  let qrCodeImage = getString([
    'qrCodeImage',
    'QrCodeImage',
    'qrCodeImageUrl',
    'QrCodeImageUrl',
    'qrCodeUri',
    'QrCodeUri',
  ])

  if (qrCodeImage && !qrCodeImage.startsWith('data:') && !qrCodeImage.startsWith('http')) {
    qrCodeImage = `data:image/png;base64,${qrCodeImage}`
  }

  const manualEntryKey = getString(['manualEntryKey', 'ManualEntryKey', 'sharedKey', 'SharedKey'])

  return {
    recoveryCodes: getRecoveryCodes(),
    qrCodeImage,
    manualEntryKey,
  }
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string; errors?: unknown }>

    if (axiosError.response?.data) {
      const data = axiosError.response.data

      if (typeof data === 'object') {
        if ('message' in data && typeof data.message === 'string') {
          return data.message
        }
        if ('error' in data && typeof data.error === 'string') {
          return data.error
        }
        if ('errors' in data) {
          const errors = data.errors
          if (Array.isArray(errors) && errors.length > 0) {
            return errors[0] as string
          }
        }
      }
    }

    if (axiosError.request && !axiosError.response) {
      return 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.'
    }
  }

  return error instanceof Error
    ? error.message
    : 'خطایی در تغییر وضعیت تایید دو مرحله‌ای رخ داده است.'
}

onMounted(() => {
  loadMfaStatus()
})
</script>
