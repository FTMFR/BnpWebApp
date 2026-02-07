<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseIcon from '@/design-system/atoms/BaseIcon.vue'
import BaseButton from '@/design-system/atoms/BaseButton.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import Modal from '@/design-system/molecules/Modal.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import { useTheme, type ThemeMode } from '@/design-system/utilities/useTheme'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import type { AxiosError } from 'axios'

const toastStore = useToastStore()

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'تنظیمات', href: '/settings' },
]

const { theme, setTheme } = useTheme()

const modes: { value: ThemeMode; label: string; icon: 'Sun' | 'Moon' }[] = [
  { value: 'light', label: 'روشن', icon: 'Sun' },
  { value: 'dark', label: 'تاریک', icon: 'Moon' },
]

// ---------- MFA (inline, no route) ----------
const mfaEnabled = ref(false)
const mfaLoading = ref(false)
const mfaToggling = ref(false)
const mfaErrorMessage = ref('')
const mfaSuccessMessage = ref('')

const showEnablePasswordModal = ref(false)
const enableCurrentPassword = ref('')
const enablePasswordError = ref('')

const showDisablePasswordModal = ref(false)
const disableCurrentPassword = ref('')
const disablePasswordError = ref('')
const disableMfaJustSubmitted = ref(false)

const showRecoveryCodesModal = ref(false)
const recoveryCodesMessage = ref('')
const recoveryCodes = ref<string[]>([])

const showRegenerateModal = ref(false)
const regenerateCurrentPassword = ref('')
const regeneratePasswordError = ref('')
const isRegenerating = ref(false)
const showRegeneratedCodesModal = ref(false)
const regeneratedCodesMessage = ref('')
const regeneratedCodes = ref<string[]>([])

/** GET /SecuritySettings/mfa response (requires Security.Read permission) */
interface SecuritySettingsMfaResponse {
  IsEnabled?: boolean
  IsRequired?: boolean
  OtpLength?: number
  OtpExpirySeconds?: number
  RecoveryCodesCount?: number
  MaxFailedOtpAttempts?: number
  LockoutDurationMinutes?: number
}

interface MfaEnableResponse {
  Success?: boolean
  Message?: string
  RecoveryCodes?: string[]
}

async function loadMfaStatus() {
  mfaLoading.value = true
  mfaErrorMessage.value = ''
  try {
    const response = await apiClient.get<SecuritySettingsMfaResponse>(endpoints.securitySettings.mfa)
    const data = response.data
    mfaEnabled.value = data.IsEnabled ?? false
  } catch (error) {
    mfaErrorMessage.value = getMfaErrorMessage(error)
  } finally {
    mfaLoading.value = false
  }
}

function handleToggleMfa() {
  if (mfaLoading.value || mfaToggling.value) return
  mfaErrorMessage.value = ''
  if (mfaEnabled.value) {
    disableMfaJustSubmitted.value = false
    showDisablePasswordModal.value = true
    disableCurrentPassword.value = ''
    disablePasswordError.value = ''
  } else {
    showEnablePasswordModal.value = true
    enableCurrentPassword.value = ''
    enablePasswordError.value = ''
  }
}

async function submitEnableMfa() {
  if (!enableCurrentPassword.value.trim()) {
    enablePasswordError.value = 'رمز عبور فعلی الزامی است.'
    return
  }
  enablePasswordError.value = ''
  mfaToggling.value = true
  try {
    const response = await apiClient.post<MfaEnableResponse>(endpoints.auth.mfa.enable, {
      CurrentPassword: enableCurrentPassword.value,
    })
    const data = response.data
    showEnablePasswordModal.value = false
    enableCurrentPassword.value = ''
    mfaEnabled.value = true
    recoveryCodesMessage.value =
      data.Message ?? 'MFA با موفقیت فعال شد. کدهای بازیابی را در جای امن ذخیره کنید.'
    recoveryCodes.value = data.RecoveryCodes ?? []
    showRecoveryCodesModal.value = true
    mfaSuccessMessage.value = 'تایید دو مرحله‌ای با موفقیت فعال شد.'
    setTimeout(() => {
      mfaSuccessMessage.value = ''
    }, 3000)
  } catch (error) {
    enablePasswordError.value = getMfaErrorMessage(error)
  } finally {
    mfaToggling.value = false
  }
}

function cancelEnableMfa() {
  showEnablePasswordModal.value = false
  enableCurrentPassword.value = ''
  enablePasswordError.value = ''
}

async function submitDisableMfa() {
  if (!disableCurrentPassword.value.trim()) {
    disablePasswordError.value = 'رمز عبور فعلی الزامی است.'
    return
  }
  disablePasswordError.value = ''
  mfaToggling.value = true
  try {
    await apiClient.post(endpoints.auth.mfa.disable, {
      CurrentPassword: disableCurrentPassword.value,
    })
    disableMfaJustSubmitted.value = true
    showDisablePasswordModal.value = false
    disableCurrentPassword.value = ''
    mfaEnabled.value = false
    mfaSuccessMessage.value = 'تایید دو مرحله‌ای با موفقیت غیرفعال شد.'
    setTimeout(() => {
      mfaSuccessMessage.value = ''
    }, 3000)
  } catch (error) {
    disablePasswordError.value = getMfaErrorMessage(error)
  } finally {
    mfaToggling.value = false
  }
}

function cancelDisableMfa() {
  showDisablePasswordModal.value = false
  disableCurrentPassword.value = ''
  disablePasswordError.value = ''
  mfaEnabled.value = true
}

function onDisableMfaModalClose() {
  if (!disableMfaJustSubmitted.value) {
    mfaEnabled.value = true
  }
  disableMfaJustSubmitted.value = false
}

function closeRecoveryCodesModal() {
  showRecoveryCodesModal.value = false
  recoveryCodes.value = []
}

function copyAllRecoveryCodes() {
  if (recoveryCodes.value.length === 0) return
  copyToClipboard(recoveryCodes.value.join('\n'))
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
      { CurrentPassword: regenerateCurrentPassword.value },
    )
    const data = response.data
    closeRegenerateModal()
    regeneratedCodesMessage.value = data.Message ?? 'کدهای بازیابی با موفقیت تولید شدند.'
    regeneratedCodes.value = data.RecoveryCodes ?? []
    showRegeneratedCodesModal.value = true
    toastStore.showToast('کدهای بازیابی با موفقیت تولید شدند', 'success', 3000)
  } catch (error) {
    regeneratePasswordError.value = getMfaErrorMessage(error)
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
  copyToClipboard(regeneratedCodes.value.join('\n'))
  toastStore.showToast('کدهای بازیابی کپی شدند', 'success', 3000)
}

function getMfaErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string; Message?: string; error?: string }>
    if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
      const data = axiosError.response.data
      if ('Message' in data && typeof data.Message === 'string') return data.Message
      if ('message' in data && typeof data.message === 'string') return data.message
      if ('error' in data && typeof data.error === 'string') return data.error
    }
    if (axiosError.request && !axiosError.response) {
      return 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.'
    }
  }
  return error instanceof Error ? error.message : 'خطایی در تغییر وضعیت تایید دو مرحله‌ای رخ داده است.'
}

onMounted(() => {
  loadMfaStatus()
})
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card
        title="تنظیمات"
        description="تنظیمات نمایش و ظاهر برنامه"
        variant="elevated"
        padding="none"
        class="min-w-0"
      >
        <template #header></template>
        <div class="p-4 sm:p-6 space-y-6 min-w-0">
          <!-- Display mode (theme) -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 flex-wrap"
          >
            <div class="min-w-0">
              <h3 class="text-sm sm:text-base font-semibold text-foreground">حالت نمایش</h3>
              <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
                تم روشن یا تاریک برای رابط کاربری
              </p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                v-for="m in modes"
                :key="m.value"
                type="button"
                :aria-pressed="theme === m.value"
                :class="[
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
                  theme === m.value
                    ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                    : 'bg-card-background border-border-default text-foreground hover:bg-muted/50 hover:border-primary-200 dark:hover:border-primary-800',
                ]"
                @click="setTheme(m.value)"
              >
                <BaseIcon
                  :name="m.icon"
                  :size="18"
                  :stroke-width="2"
                  :icon-class="theme === m.value ? 'text-white' : 'text-muted-foreground'"
                />
                {{ m.label }}
              </button>
            </div>
          </div>

          <!-- MFA (same row style as theme) -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 flex-wrap"
          >
            <div class="min-w-0">
              <h3 class="text-sm sm:text-base font-semibold text-foreground">
                تنظیمات تایید دو مرحله‌ای
              </h3>
              <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
                فعال یا غیرفعال کردن تایید دو مرحله‌ای و مدیریت کدهای بازیابی
              </p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <div
                class="flex items-center justify-between p-3 sm:p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-lg sm:rounded-xl border border-border-default gap-3 min-w-0"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <BaseIcon
                    name="ShieldCheck"
                    :size="20"
                    :stroke-width="2"
                    :icon-class="`flex-shrink-0 ${mfaEnabled ? 'text-green-600' : 'text-muted-foreground'}`"
                  />
                  <span class="text-sm font-semibold text-foreground truncate">
                    {{ mfaEnabled ? 'فعال' : 'غیرفعال' }}
                  </span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    :checked="mfaEnabled"
                    :disabled="mfaLoading || mfaToggling"
                    class="sr-only peer"
                    @change="handleToggleMfa"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
                  />
                </label>
              </div>
            </div>
          </div>

          <!-- MFA error/success (inline) -->
          <div
            v-if="mfaErrorMessage"
            class="flex items-center gap-3 p-3.5 px-4 bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 dark:border-red-500/40 rounded-xl text-danger-500 dark:text-danger-400 text-sm font-medium break-words min-w-0"
            role="alert"
          >
            <BaseIcon name="AlertCircle" :size="20" :stroke-width="2" icon-class="flex-shrink-0 text-danger-500 dark:text-danger-400" />
            <span class="min-w-0">{{ mfaErrorMessage }}</span>
          </div>
          <div
            v-if="mfaSuccessMessage"
            class="flex items-center gap-3 p-3.5 px-4 bg-green-500/10 dark:bg-green-500/15 border border-green-500/30 dark:border-green-500/40 rounded-xl text-green-600 dark:text-green-400 text-sm font-medium break-words min-w-0"
            role="alert"
          >
            <BaseIcon name="CheckCircle" :size="20" :stroke-width="2" icon-class="flex-shrink-0 text-green-600 dark:text-green-400" />
            <span class="min-w-0">{{ mfaSuccessMessage }}</span>
          </div>

          <!-- MFA info + regenerate (when enabled) -->
          <template v-if="mfaEnabled">
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
              class="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/80 rounded-lg sm:rounded-xl border border-border-default"
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
          </template>
        </div>
      </Card>
    </div>

    <!-- Enable MFA modal -->
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
            :disabled="mfaToggling || !enableCurrentPassword.trim()"
            @click="submitEnableMfa"
          >
            {{ mfaToggling ? 'در حال ارسال...' : 'فعال‌سازی' }}
          </BaseButton>
        </div>
      </template>
    </Modal>

    <!-- Disable MFA modal -->
    <Modal
      v-model="showDisablePasswordModal"
      title="غیرفعال‌سازی تایید دو مرحله‌ای"
      size="sm"
      :close-on-backdrop="false"
      @close="onDisableMfaModalClose"
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
            :disabled="mfaToggling || !disableCurrentPassword.trim()"
            @click="submitDisableMfa"
          >
            {{ mfaToggling ? 'در حال ارسال...' : 'غیرفعال‌سازی' }}
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
          <BaseButton variant="ghost" size="sm" class="shrink-0" @click="copySingleCode(code)">
            کپی
          </BaseButton>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="default" @click="copyAllRecoveryCodes">کپی همه</BaseButton>
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

    <!-- Regenerated codes modal -->
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
  </DashboardLayout>
</template>
