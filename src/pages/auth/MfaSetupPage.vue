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
          class="flex items-center gap-3 p-3.5 px-4 bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 dark:border-red-500/40 rounded-xl text-danger-500 dark:text-danger-400 text-sm sm:text-base font-medium mb-6 break-words min-w-0"
          role="alert"
        >
          <BaseIcon
            name="AlertCircle"
            :size="20"
            :stroke-width="2"
            icon-class="flex-shrink-0 text-danger-500 dark:text-danger-400"
          />
          <span class="min-w-0">{{ errorMessage }}</span>
        </div>

        <div
          v-if="successMessage"
          class="flex items-center gap-3 p-3.5 px-4 bg-green-500/10 dark:bg-green-500/15 border border-green-500/30 dark:border-green-500/40 rounded-xl text-green-600 dark:text-green-400 text-sm sm:text-base font-medium mb-6 break-words min-w-0"
          role="alert"
        >
          <BaseIcon
            name="CheckCircle"
            :size="20"
            :stroke-width="2"
            icon-class="flex-shrink-0 text-green-600 dark:text-green-400"
          />
          <span class="min-w-0">{{ successMessage }}</span>
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
                :checked="mfaEnabled"
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

        <!-- Enable MFA: current password modal -->
        <Modal
          v-model="showEnablePasswordModal"
          title="فعال‌سازی تایید دو مرحله‌ای"
          size="sm"
          :close-on-backdrop="false"
        >
          <p class="text-sm text-muted-foreground mb-4">
            برای فعال‌سازی تایید دو مرحله‌ای، رمز عبور فعلی خود را وارد کنید.
          </p>
          <form @submit.prevent="submitEnableMfa" class="space-y-4">
            <FormField
              v-model="enableCurrentPassword"
              label="رمز عبور فعلی"
              type="password"
              placeholder="رمز عبور فعلی را وارد کنید"
              :error-message="enablePasswordError || undefined"
              autocomplete="current-password"
            />
          </form>
          <template #footer>
            <div class="flex justify-end gap-3">
              <BaseButton variant="outline" @click="cancelEnableMfa">انصراف</BaseButton>
              <BaseButton
                variant="default"
                :disabled="isToggling || !enableCurrentPassword.trim()"
                @click="submitEnableMfa"
              >
                {{ isToggling ? 'در حال ارسال...' : 'فعال‌سازی' }}
              </BaseButton>
            </div>
          </template>
        </Modal>

        <!-- Disable MFA: current password modal -->
        <Modal
          v-model="showDisablePasswordModal"
          title="غیرفعال‌سازی تایید دو مرحله‌ای"
          size="sm"
          :close-on-backdrop="false"
        >
          <p class="text-sm text-muted-foreground mb-4">
            برای غیرفعال‌سازی، رمز عبور فعلی خود را وارد کنید.
          </p>
          <form @submit.prevent="submitDisableMfa" class="space-y-4">
            <FormField
              v-model="disableCurrentPassword"
              label="رمز عبور فعلی"
              type="password"
              placeholder="رمز عبور فعلی را وارد کنید"
              :error-message="disablePasswordError || undefined"
              autocomplete="current-password"
            />
          </form>
          <template #footer>
            <div class="flex justify-end gap-3">
              <BaseButton variant="outline" @click="cancelDisableMfa">انصراف</BaseButton>
              <BaseButton
                variant="default"
                class="bg-danger-600 hover:bg-danger-700 text-white"
                :disabled="isToggling || !disableCurrentPassword.trim()"
                @click="submitDisableMfa"
              >
                {{ isToggling ? 'در حال ارسال...' : 'غیرفعال‌سازی' }}
              </BaseButton>
            </div>
          </template>
        </Modal>

        <!-- Recovery codes (after enable) -->
        <Modal
          v-model="showRecoveryCodesModal"
          title="کدهای بازیابی"
          size="md"
          :close-on-backdrop="false"
        >
          <p class="text-sm text-foreground mb-3">{{ recoveryCodesMessage }}</p>
          <p class="text-xs text-muted-foreground mb-3">
            این کدها را در جای امن ذخیره کنید. هر کد فقط یک بار قابل استفاده است.
          </p>
          <div
            class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border-default font-mono text-sm space-y-2 max-h-64 overflow-y-auto"
          >
            <div
              v-for="(code, i) in recoveryCodes"
              :key="i"
              class="flex items-center justify-between gap-2"
            >
              <span>{{ code }}</span>
              <BaseButton
                variant="ghost"
                size="sm"
                class="shrink-0"
                @click="copySingleCode(code)"
              >
                کپی
              </BaseButton>
            </div>
          </div>
          <template #footer>
            <div class="flex justify-end gap-3">
              <BaseButton variant="default" @click="copyAllRecoveryCodes">
                کپی همه
              </BaseButton>
              <BaseButton variant="outline" @click="closeRecoveryCodesModal">بستن</BaseButton>
            </div>
          </template>
        </Modal>

        <!-- Regenerate recovery codes modal -->
        <Modal
          v-model="showRegenerateModal"
          title="بازیابی کدهای بازیابی"
          size="sm"
          :close-on-backdrop="false"
        >
          <p class="text-sm text-muted-foreground mb-4">
            برای تولید مجدد کدهای بازیابی، رمز عبور فعلی خود را وارد کنید. کدهای قبلی دیگر معتبر نخواهند بود.
          </p>
          <form @submit.prevent="submitRegenerateCodes" class="space-y-4">
            <FormField
              v-model="regenerateCurrentPassword"
              label="رمز عبور فعلی"
              type="password"
              placeholder="رمز عبور فعلی را وارد کنید"
              :error-message="regeneratePasswordError || undefined"
              autocomplete="current-password"
            />
          </form>
          <template #footer>
            <div class="flex justify-end gap-3">
              <BaseButton variant="outline" @click="closeRegenerateModal">انصراف</BaseButton>
              <BaseButton
                variant="default"
                :disabled="isRegenerating || !regenerateCurrentPassword.trim()"
                @click="submitRegenerateCodes"
              >
                {{ isRegenerating ? 'در حال ارسال...' : 'تولید مجدد کدها' }}
              </BaseButton>
            </div>
          </template>
        </Modal>

        <!-- Regenerate recovery codes (new codes display) -->
        <Modal
          v-model="showRegeneratedCodesModal"
          title="کدهای بازیابی جدید"
          size="md"
          :close-on-backdrop="false"
        >
          <p class="text-sm text-foreground mb-3">{{ regeneratedCodesMessage }}</p>
          <div
            v-if="regeneratedCodes.length"
            class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border-default font-mono text-sm space-y-2 max-h-64 overflow-y-auto"
          >
            <div
              v-for="(code, i) in regeneratedCodes"
              :key="i"
              class="flex items-center justify-between gap-2"
            >
              <span>{{ code }}</span>
              <BaseButton variant="ghost" size="sm" class="shrink-0" @click="copySingleCode(code)">
                کپی
              </BaseButton>
            </div>
          </div>
          <template #footer>
            <div class="flex justify-end gap-3">
              <BaseButton
                v-if="regeneratedCodes.length"
                variant="default"
                @click="copyAllRegeneratedCodes"
              >
                کپی همه
              </BaseButton>
              <BaseButton variant="outline" @click="closeRegeneratedCodesModal">بستن</BaseButton>
            </div>
          </template>
        </Modal>

        <!-- Info Box -->
        <div
          v-if="mfaEnabled"
          class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mb-6"
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

        <!-- Regenerate recovery codes section (when MFA enabled) -->
        <div
          v-if="mfaEnabled"
          class="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/80 rounded-lg sm:rounded-xl border border-border-default mb-6"
        >
          <h3 class="text-sm sm:text-base font-semibold text-foreground mb-2">
            بازیابی کدهای بازیابی
          </h3>
          <p class="text-xs sm:text-sm text-muted-foreground mb-4">
            در صورت از دست دادن کدهای بازیابی می‌توانید کدهای جدید تولید کنید. کدهای قبلی دیگر معتبر نخواهند بود.
          </p>
          <BaseButton variant="outline" size="sm" @click="openRegenerateModal">
            تولید مجدد کدها
          </BaseButton>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseIcon, BaseButton } from '@/design-system/atoms'
import Modal from '@/design-system/molecules/Modal.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import type { AxiosError } from 'axios'

const toastStore = useToastStore()
const mfaEnabled = ref(false)
const isLoading = ref(false)
const isToggling = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Enable MFA modal
const showEnablePasswordModal = ref(false)
const enableCurrentPassword = ref('')
const enablePasswordError = ref('')

// Disable MFA modal
const showDisablePasswordModal = ref(false)
const disableCurrentPassword = ref('')
const disablePasswordError = ref('')

// Recovery codes (after enable)
const showRecoveryCodesModal = ref(false)
const recoveryCodesMessage = ref('')
const recoveryCodes = ref<string[]>([])

// Regenerate recovery codes
const showRegenerateModal = ref(false)
const regenerateCurrentPassword = ref('')
const regeneratePasswordError = ref('')
const isRegenerating = ref(false)
const showRegeneratedCodesModal = ref(false)
const regeneratedCodesMessage = ref('')
const regeneratedCodes = ref<string[]>([])

interface MfaStatusResponse {
  enabled?: boolean
  IsEnabled?: boolean
}

interface MfaEnableResponse {
  Success?: boolean
  Message?: string
  RecoveryCodes?: string[]
}

async function loadMfaStatus() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await apiClient.get<MfaStatusResponse>(endpoints.auth.mfa.status)
    const data = response.data
    mfaEnabled.value = data.IsEnabled ?? data.enabled ?? false
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

function handleToggleMfa() {
  if (isLoading.value || isToggling.value) return
  errorMessage.value = ''
  if (mfaEnabled.value) {
    // User turned ON -> show enable modal (current password)
    showEnablePasswordModal.value = true
    enableCurrentPassword.value = ''
    enablePasswordError.value = ''
  } else {
    // User turned OFF -> show disable modal (current password)
    showDisablePasswordModal.value = true
    disableCurrentPassword.value = ''
    disablePasswordError.value = ''
  }
}

async function submitEnableMfa() {
  if (!enableCurrentPassword.value.trim()) {
    enablePasswordError.value = 'رمز عبور فعلی الزامی است.'
    return
  }
  enablePasswordError.value = ''
  isToggling.value = true
  try {
    const response = await apiClient.post<MfaEnableResponse>(endpoints.auth.mfa.enable, {
      CurrentPassword: enableCurrentPassword.value,
    })
    const data = response.data
    showEnablePasswordModal.value = false
    enableCurrentPassword.value = ''
    mfaEnabled.value = true
    recoveryCodesMessage.value = data.Message ?? 'MFA با موفقیت فعال شد. کدهای بازیابی را در جای امن ذخیره کنید.'
    recoveryCodes.value = data.RecoveryCodes ?? []
    showRecoveryCodesModal.value = true
    successMessage.value = 'تایید دو مرحله‌ای با موفقیت فعال شد.'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    enablePasswordError.value = getErrorMessage(error)
  } finally {
    isToggling.value = false
  }
}

function cancelEnableMfa() {
  showEnablePasswordModal.value = false
  enableCurrentPassword.value = ''
  enablePasswordError.value = ''
  mfaEnabled.value = false
}

async function submitDisableMfa() {
  if (!disableCurrentPassword.value.trim()) {
    disablePasswordError.value = 'رمز عبور فعلی الزامی است.'
    return
  }
  disablePasswordError.value = ''
  isToggling.value = true
  try {
    await apiClient.post(endpoints.auth.mfa.disable, {
      CurrentPassword: disableCurrentPassword.value,
    })
    showDisablePasswordModal.value = false
    disableCurrentPassword.value = ''
    mfaEnabled.value = false
    successMessage.value = 'تایید دو مرحله‌ای با موفقیت غیرفعال شد.'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    disablePasswordError.value = getErrorMessage(error)
  } finally {
    isToggling.value = false
  }
}

function cancelDisableMfa() {
  showDisablePasswordModal.value = false
  disableCurrentPassword.value = ''
  disablePasswordError.value = ''
  mfaEnabled.value = true
}

function closeRecoveryCodesModal() {
  showRecoveryCodesModal.value = false
  recoveryCodes.value = []
}

function copyAllRecoveryCodes() {
  if (recoveryCodes.value.length === 0) return
  const text = recoveryCodes.value.join('\n')
  copyToClipboard(text)
  toastStore.showToast('کدهای بازیابی کپی شدند', 'success', 3000)
}

function copySingleCode(code: string) {
  copyToClipboard(code)
  toastStore.showToast('کد کپی شد', 'success', 2000)
}

function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
  } else {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}

function openRegenerateModal() {
  showRegenerateModal.value = true
  regenerateCurrentPassword.value = ''
  regeneratePasswordError.value = ''
}

function closeRegenerateModal() {
  showRegenerateModal.value = false
  regenerateCurrentPassword.value = ''
  regeneratePasswordError.value = ''
}

async function submitRegenerateCodes() {
  if (!regenerateCurrentPassword.value.trim()) {
    regeneratePasswordError.value = 'رمز عبور فعلی الزامی است.'
    return
  }
  regeneratePasswordError.value = ''
  isRegenerating.value = true
  try {
    const response = await apiClient.post<{ Message?: string; RecoveryCodes?: string[] }>(
      endpoints.auth.mfa.regenerateRecoveryCodes,
      {
        CurrentPassword: regenerateCurrentPassword.value,
      },
    )
    const data = response.data
    closeRegenerateModal()
    regeneratedCodesMessage.value = data.Message ?? 'کدهای بازیابی با موفقیت تولید شدند.'
    regeneratedCodes.value = data.RecoveryCodes ?? []
    showRegeneratedCodesModal.value = true
    toastStore.showToast('کدهای بازیابی با موفقیت تولید شدند', 'success', 3000)
  } catch (error) {
    regeneratePasswordError.value = getErrorMessage(error)
  } finally {
    isRegenerating.value = false
  }
}

function closeRegeneratedCodesModal() {
  showRegeneratedCodesModal.value = false
  regeneratedCodes.value = []
}

function copyAllRegeneratedCodes() {
  if (regeneratedCodes.value.length === 0) return
  const text = regeneratedCodes.value.join('\n')
  copyToClipboard(text)
  toastStore.showToast('کدهای بازیابی کپی شدند', 'success', 3000)
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string; Message?: string; error?: string }>

    if (axiosError.response?.data) {
      const data = axiosError.response.data

      if (typeof data === 'object') {
        if ('Message' in data && typeof data.Message === 'string') {
          return data.Message
        }
        if ('message' in data && typeof data.message === 'string') {
          return data.message
        }
        if ('error' in data && typeof data.error === 'string') {
          return data.error
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
