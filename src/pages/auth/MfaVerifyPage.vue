<template>
  <AuthLayout>
    <div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:hidden">
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
        <h2 class="text-lg sm:text-xl font-semibold text-foreground m-0 truncate">سیستم مالی</h2>
        <p class="text-xs sm:text-sm font-normal text-muted-foreground m-0 truncate">
          مدیریت هوشمند دارایی
        </p>
      </div>
    </div>

    <div class="w-full max-w-full min-w-0">
      <div class="mb-6 sm:mb-8">
        <div class="flex items-center gap-2 mb-2 sm:mb-3">
          <BaseIcon
            name="ShieldCheck"
            :size="18"
            :stroke-width="2"
            icon-class="text-primary-500 sm:w-5 sm:h-5"
          />
          <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-foreground m-0">
            تایید دو مرحله‌ای
          </h1>
        </div>
        <p class="text-xs sm:text-sm md:text-base font-normal text-muted-foreground m-0">
          <span v-if="maskedMobileNumber">
            کد تایید به شماره <span dir="ltr" class="inline-block">{{ maskedMobileNumber }}</span> ارسال شده است
          </span>
          <span v-else>کد تایید ارسال شده را وارد کنید</span>
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 sm:gap-5" novalidate>
      <!-- OTP Inputs (6 boxes, same width as title row above) -->
      <div class="flex flex-col gap-3 w-full max-w-full min-w-0 overflow-hidden">
        <label class="text-sm font-medium text-foreground text-right">کد تایید</label>
        <div
          dir="ltr"
          class="flex w-full max-w-full min-w-0 gap-1.5 sm:gap-2 flex-nowrap overflow-hidden"
        >
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            :ref="(el) => setInputRef(el, index)"
            v-model="otpDigits[index]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="flex-1 min-w-0 max-w-[3.5rem] h-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-input-background border-2 border-border-default rounded-lg sm:rounded-xl transition-all outline-none text-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-200 basis-0"
            :class="{
              'border-danger-500': errorMessage && otpDigits[index],
            }"
            @input="handleOtpInput(index, $event)"
            @keydown="handleKeyDown(index, $event)"
            @paste="handlePaste($event)"
          />
        </div>
        <p
          v-if="errorMessage"
          class="text-sm sm:text-base text-danger-500 mt-1 text-right break-words min-w-0"
        >
          {{ errorMessage }}
        </p>
      </div>

      <!-- CAPTCHA Section – only when login/resend response included CaptchaId and CaptchaImage -->
      <div v-if="captchaRequired" class="flex flex-col gap-3">
        <label class="text-sm font-medium text-foreground text-center">کد امنیتی</label>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div class="w-full sm:max-w-[200px] md:max-w-[220px] flex flex-col items-center">
            <input
              v-model="captchaValue"
              type="text"
              placeholder="کد نمایش داده شده را وارد کنید"
              class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base bg-input-background border border-border-default rounded-lg sm:rounded-xl transition-all outline-none text-foreground box-border text-center focus:border-primary-500"
              :class="{
                'border-danger-500': captchaError,
              }"
            />
            <p
              v-if="captchaError"
              class="text-xs sm:text-sm text-danger-500 mt-1 text-center break-words min-w-0 w-full"
            >
              {{ captchaError }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div
              class="w-24 h-11 sm:w-28 sm:h-12 md:w-32 md:h-12 bg-input-background border border-border-default rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden shrink-0"
            >
              <img
                v-if="captchaImage"
                :src="captchaImage"
                alt="کد امنیتی"
                class="w-full h-full object-contain"
              />
              <div v-else class="flex items-center justify-center p-2">
                <BaseIcon
                  name="RefreshCw"
                  :size="20"
                  :stroke-width="2"
                  icon-class="text-muted-foreground animate-spin"
                />
              </div>
            </div>
            <button
              type="button"
              @click.prevent="refreshCaptcha"
              class="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-input-background border border-border-default hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer shrink-0"
              :disabled="isRefreshingCaptcha"
              aria-label="دریافت کد امنیتی جدید"
            >
              <BaseIcon
                name="RefreshCw"
                :size="20"
                :stroke-width="2"
                :icon-class="isRefreshingCaptcha ? 'text-muted-foreground animate-spin' : 'text-primary-500'"
              />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="errorMessage && !otpDigits.some((d) => d)"
        id="mfa-error"
        class="flex items-center gap-3 p-3.5 px-4 bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 dark:border-red-500/40 rounded-xl text-danger-500 dark:text-danger-400 text-sm font-medium mt-2 animate-[slideIn_0.3s_ease-out]"
        role="alert"
        aria-live="polite"
      >
        <BaseIcon
          name="AlertCircle"
          :size="20"
          :stroke-width="2"
          icon-class="flex-shrink-0 text-danger-500 dark:text-danger-400"
        />
        <span>{{ errorMessage }}</span>
      </div>

      <button
        type="submit"
        :disabled="isVerifying || !isOtpComplete || (captchaRequired && !captchaValue)"
        class="w-full max-w-full h-12 sm:h-14 md:h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg cursor-pointer transition-all duration-300 ease-in-out mt-4 sm:mt-6 md:mt-8 relative box-border overflow-hidden hover:not(:disabled):from-primary-600 hover:not(:disabled):to-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
        :aria-label="isVerifying ? 'در حال تایید' : 'تایید'"
      >
        <span class="relative z-10 flex items-center justify-center gap-3">
          <span v-if="isVerifying" aria-hidden="true">در حال تایید...</span>
          <span v-else class="flex items-center justify-center gap-3" aria-hidden="true">
            تایید
            <BaseIcon
              name="ArrowLeft"
              :size="20"
              :stroke-width="2"
              icon-class="transition-transform duration-300 ease-in-out group-hover:translate-x-1"
            />
          </span>
        </span>
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000 ease-in-out group-hover:translate-x-full"
          aria-hidden="true"
        ></div>
      </button>

      <div class="flex items-center justify-center pt-2">
        <button
          type="button"
          @click.prevent.stop="onResendOtpClick"
          :disabled="isResending || resendCooldown > 0"
          class="text-sm font-semibold text-primary-500 bg-transparent border-0 cursor-pointer p-1 transition-colors hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="resendCooldown > 0">ارسال مجدد (<span dir="rtl" class="inline-block">{{ resendCooldown }} ثانیه</span>)</span>
          <span v-else>ارسال مجدد کد</span>
        </button>
      </div>

      <router-link
        to="/login"
        class="w-full max-w-full h-12 sm:h-14 md:h-16 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg cursor-pointer transition-all duration-300 ease-in-out border-2 border-border-default bg-transparent text-muted-foreground no-underline mt-4 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground hover:border-primary-500/50"
      >
        بازگشت به صفحه ورود
      </router-link>
    </form>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AuthLayout } from '@/design-system/templates'
import { BaseIcon } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useAuthStore } from '@/stores/auth'
import type { AxiosError } from 'axios'
import type { ComponentPublicInstance } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const otpInputRefs = ref<(HTMLInputElement | ComponentPublicInstance | null)[]>([])
const errorMessage = ref('')
const isVerifying = ref(false)
const isResending = ref(false)
const resendCooldown = ref(0)
const maskedMobileNumber = ref<string | null>(null)
const mfaToken = ref<string | null>(null)

// CAPTCHA – when login/resend response has CaptchaId/CaptchaImage null, captcha is not shown and submit is OTP-only
const captchaRequired = ref(false)
const captchaId = ref<string | null>(null)
const captchaImage = ref<string | null>(null)
const captchaValue = ref('')
const captchaError = ref('')
const isRefreshingCaptcha = ref(false)

let cooldownInterval: NodeJS.Timeout | null = null

const isOtpComplete = computed(() => {
  return otpDigits.value.every((digit) => digit !== '')
})

function setInputRef(el: HTMLInputElement | ComponentPublicInstance | null, index: number) {
  if (el) {
    otpInputRefs.value[index] = el instanceof HTMLInputElement ? el : (el.$el as HTMLInputElement)
  }
}

/** Use captcha from sessionStorage (login response by default; overwritten by captcha API when user clicks regenerate). */
function useStoredCaptcha(): boolean {
  const id = sessionStorage.getItem('mfa_captcha_id')
  const image = sessionStorage.getItem('mfa_captcha_image')
  if (id && image) {
    captchaId.value = id
    captchaImage.value = image.startsWith('data:') ? image : `data:image/png;base64,${image}`
    captchaError.value = ''
    return true
  }
  return false
}

async function loadCaptcha() {
  try {
    const response = await apiClient.get<{
      id?: string
      image?: string
      captchaId?: string
      captchaImage?: string
      CaptchaId?: string
      CaptchaImage?: string
    }>(endpoints.auth.captcha)
    const data = response.data
    const id = data.captchaId ?? data.CaptchaId ?? data.id ?? null
    const rawImage = data.captchaImage ?? data.CaptchaImage ?? data.image ?? null
    if (id) captchaId.value = id
    if (rawImage) {
      captchaImage.value = rawImage.startsWith('data:') ? rawImage : `data:image/png;base64,${rawImage}`
    }
    captchaError.value = ''
  } catch (error) {
    console.error('Failed to load captcha:', error)
  }
}

// Step 4: refresh captcha — GET captcha API only (no resend-otp)
async function refreshCaptcha() {
  captchaValue.value = ''
  captchaError.value = ''
  isRefreshingCaptcha.value = true
  try {
    await loadCaptcha()
    if (captchaId.value) sessionStorage.setItem('mfa_captcha_id', captchaId.value)
    if (captchaImage.value) sessionStorage.setItem('mfa_captcha_image', captchaImage.value)
  } finally {
    isRefreshingCaptcha.value = false
  }
}

function getOtpCode(): string {
  return otpDigits.value.join('')
}

function handleOtpInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '').substring(0, 1)

  otpDigits.value[index] = value
  errorMessage.value = ''

  // Auto-focus to next input
  if (value && index < 5) {
    nextTick(() => {
      const nextInput = otpInputRefs.value[index + 1] as HTMLInputElement
      if (nextInput) {
        nextInput.focus()
      }
    })
  }

  // When OTP complete: focus captcha input if required, else focus submit button
  if (value && index === 5 && isOtpComplete.value) {
    nextTick(() => {
      if (captchaRequired.value) {
        const captchaInput = document.querySelector(
          'input[type="text"][placeholder*="کد نمایش"]',
        ) as HTMLInputElement
        if (captchaInput) captchaInput.focus()
      } else {
        const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement
        if (submitBtn) submitBtn.focus()
      }
    })
  }
}

function handleKeyDown(index: number, event: KeyboardEvent) {
  // Handle backspace
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    const prevInput = otpInputRefs.value[index - 1] as HTMLInputElement
    if (prevInput) {
      prevInput.focus()
      otpDigits.value[index - 1] = ''
    }
  }

  // Handle arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    const prevInput = otpInputRefs.value[index - 1] as HTMLInputElement
    if (prevInput) {
      prevInput.focus()
    }
  }

  if (event.key === 'ArrowRight' && index < 5) {
    const nextInput = otpInputRefs.value[index + 1] as HTMLInputElement
    if (nextInput) {
      nextInput.focus()
    }
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/\D/g, '').substring(0, 6).split('')

  digits.forEach((digit, index) => {
    if (index < 6) {
      otpDigits.value[index] = digit
    }
  })

  // If 6 digits were pasted, focus captcha input (if required) or submit button
  if (digits.length === 6) {
    nextTick(() => {
      if (captchaRequired.value) {
        const captchaInput = document.querySelector(
          'input[type="text"][placeholder*="کد نمایش"]',
        ) as HTMLInputElement
        if (captchaInput) captchaInput.focus()
      } else {
        const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement
        if (submitBtn) submitBtn.focus()
      }
    })
  } else {
    // Focus on next empty input or last input
    const nextEmptyIndex = otpDigits.value.findIndex((d) => !d)
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex

    nextTick(() => {
      const input = otpInputRefs.value[focusIndex] as HTMLInputElement
      if (input) {
        input.focus()
      }
    })
  }
}

// MFA flow: (1) Login returns RequiresMfa + MfaToken + CaptchaId + CaptchaImage + OtpExpirySeconds.
// (2) This page shows OTP inputs + captcha from login only — no API call.
// (3) Resend OTP: call resend-otp API; response has new CaptchaId/CaptchaImage, OtpExpirySeconds — update UI.
// (4) Refresh captcha: call GET /api/Auth/captcha only when user clicks refresh.

onMounted(() => {
  maskedMobileNumber.value = sessionStorage.getItem('mfa_masked_mobile')
  mfaToken.value = sessionStorage.getItem('mfa_token')

  if (!mfaToken.value) {
    router.push('/login')
    return
  }

  // Step 2: display captcha from login response only when CaptchaId/CaptchaImage were present
  useStoredCaptcha()
  captchaRequired.value = !!(sessionStorage.getItem('mfa_captcha_id'))

  // Cooldown from login response (OtpExpirySeconds) so user sees when resend is available
  const expirySeconds = sessionStorage.getItem('mfa_otp_expiry_seconds')
  const cooldownSeconds = expirySeconds ? Math.max(0, parseInt(expirySeconds, 10)) : 60
  startCooldown(Number.isNaN(cooldownSeconds) ? 60 : cooldownSeconds)

  nextTick(() => {
    const firstInput = otpInputRefs.value[0] as HTMLInputElement
    if (firstInput) firstInput.focus()
  })
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})

function startCooldown(seconds: number) {
  resendCooldown.value = seconds
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && cooldownInterval) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

interface ResendOtpResponse {
  Success?: boolean
  Message?: string
  OtpExpirySeconds?: number
  MaskedMobileNumber?: string
  CaptchaId?: string
  CaptchaImage?: string
}

function onResendOtpClick(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  resendOtp()
}

async function resendOtp() {
  if (isResending.value || resendCooldown.value > 0) return

  isResending.value = true
  errorMessage.value = ''
  captchaValue.value = ''

  try {
    const { data } = await apiClient.post<ResendOtpResponse>(endpoints.auth.mfa.resendOtp, {
      MfaToken: mfaToken.value,
    })

    // Step 3: update captcha and cooldown from resend response; hide captcha if response has null null
    if (data.CaptchaId != null && data.CaptchaImage != null) {
      captchaRequired.value = true
      captchaId.value = data.CaptchaId
      sessionStorage.setItem('mfa_captcha_id', data.CaptchaId)
      const img = data.CaptchaImage.startsWith('data:') ? data.CaptchaImage : `data:image/png;base64,${data.CaptchaImage}`
      captchaImage.value = img
      sessionStorage.setItem('mfa_captcha_image', img)
    } else {
      captchaRequired.value = false
      captchaId.value = null
      captchaImage.value = null
      sessionStorage.removeItem('mfa_captcha_id')
      sessionStorage.removeItem('mfa_captcha_image')
    }
    if (data.MaskedMobileNumber != null) {
      maskedMobileNumber.value = data.MaskedMobileNumber
      sessionStorage.setItem('mfa_masked_mobile', data.MaskedMobileNumber)
    }
    const cooldownSeconds = data.OtpExpirySeconds != null ? Math.max(0, data.OtpExpirySeconds) : 60
    if (data.OtpExpirySeconds != null) {
      sessionStorage.setItem('mfa_otp_expiry_seconds', String(data.OtpExpirySeconds))
    }
    startCooldown(cooldownSeconds)

    otpDigits.value = ['', '', '', '', '', '']
    nextTick(() => {
      const firstInput = otpInputRefs.value[0] as HTMLInputElement
      if (firstInput) firstInput.focus()
    })
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isResending.value = false
  }
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

  return error instanceof Error ? error.message : 'خطایی در تایید کد رخ داده است.'
}

async function handleSubmit() {
  if (isVerifying.value || !isOtpComplete.value) return
  if (captchaRequired.value && !captchaValue.value) return
  if (captchaRequired.value && !captchaId.value) {
    captchaError.value = 'لطفاً کد امنیتی را وارد کنید.'
    return
  }

  if (!mfaToken.value) {
    router.push('/login')
    return
  }

  errorMessage.value = ''
  captchaError.value = ''
  isVerifying.value = true

  try {
    const code = getOtpCode()
    const body: Record<string, string> = {
      MfaToken: mfaToken.value,
      Otp: code,
      OtpCode: code,
      Code: code,
    }
    if (captchaRequired.value && captchaId.value != null) {
      body.CaptchaId = captchaId.value
      body.CaptchaValue = captchaValue.value
      body.CaptchaCode = captchaValue.value
    }

    const response = await apiClient.post<{
      Token: string
      PublicId: string
    }>(endpoints.auth.mfa.verify, body)

    // Clear MFA-related data from sessionStorage
    sessionStorage.removeItem('mfa_token')
    sessionStorage.removeItem('mfa_userName')
    sessionStorage.removeItem('mfa_otp_expiry_seconds')
    sessionStorage.removeItem('mfa_captcha_id')
    sessionStorage.removeItem('mfa_captcha_image')
    sessionStorage.removeItem('mfa_masked_mobile')

    // Store token in session (sessionStorage) and optionally user data
    try {
      const userResponse = await apiClient.get(endpoints.users.byId(response.data.PublicId))
      authStore.setAuth(response.data.Token, response.data.PublicId, userResponse.data)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      // Still store token so user is logged in; user can be loaded later
      authStore.setAuth(response.data.Token, response.data.PublicId)
    }

    // Redirect to dashboard (or query.redirect if present)
    const redirectPath = route.query.redirect as string | undefined
    router.push(redirectPath && redirectPath.startsWith('/') ? redirectPath : '/dashboard')
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
    if (captchaRequired.value) await refreshCaptcha()
    // Clear OTP on error
    otpDigits.value = ['', '', '', '', '', '']
    nextTick(() => {
      const firstInput = otpInputRefs.value[0] as HTMLInputElement
      if (firstInput) {
        firstInput.focus()
      }
    })
  } finally {
    isVerifying.value = false
  }
}
</script>

<style>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
