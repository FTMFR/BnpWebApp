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
          کد تایید به شماره {{ maskedMobileNumber }} ارسال شده است
        </span>
        <span v-else>کد تایید ارسال شده را وارد کنید</span>
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 sm:gap-5" novalidate>
      <!-- OTP Inputs (6 separate boxes) -->
      <div class="flex flex-col gap-3">
        <label class="text-sm font-medium text-foreground text-right">کد تایید</label>
        <div class="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            :ref="(el) => setInputRef(el, index)"
            v-model="otpDigits[index]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-lg sm:text-xl md:text-2xl font-bold bg-input-background border-2 border-border-default rounded-lg sm:rounded-xl transition-all outline-none text-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
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

      <!-- CAPTCHA Section -->
      <div class="flex flex-col gap-3">
        <label class="text-sm font-medium text-foreground text-right">کد امنیتی</label>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="flex-1">
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
              class="text-xs sm:text-sm text-danger-500 mt-1 text-right break-words min-w-0"
            >
              {{ captchaError }}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <div
              class="w-full sm:w-28 md:w-32 h-11 sm:h-12 bg-input-background border border-border-default rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary-500 transition-colors"
              @click="refreshCaptcha"
            >
              <img
                v-if="captchaImage"
                :src="captchaImage"
                alt="کد امنیتی"
                class="w-full h-full object-contain"
              />
              <div v-else class="flex items-center justify-center">
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
              @click="refreshCaptcha"
              class="text-xs text-primary-500 hover:text-primary-600 transition-colors bg-transparent border-0 cursor-pointer p-1"
            >
              بروزرسانی
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
        :disabled="isVerifying || !isOtpComplete || !captchaValue"
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
          @click="resendOtp"
          :disabled="isResending || resendCooldown > 0"
          class="text-sm font-semibold text-primary-500 bg-transparent border-0 cursor-pointer p-1 transition-colors hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="resendCooldown > 0">ارسال مجدد ({{ resendCooldown }})</span>
          <span v-else>ارسال مجدد کد</span>
        </button>
      </div>

      <div class="flex items-center justify-center pt-2">
        <router-link
          to="/login"
          class="text-sm font-semibold text-muted-foreground bg-transparent border-0 cursor-pointer p-1 transition-colors no-underline hover:text-foreground"
        >
          بازگشت به صفحه ورود
        </router-link>
      </div>
    </form>
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

// CAPTCHA
const captchaId = ref<string | null>(null)
const captchaImage = ref<string | null>(null)
const captchaValue = ref('')
const captchaError = ref('')

let cooldownInterval: NodeJS.Timeout | null = null

const isOtpComplete = computed(() => {
  return otpDigits.value.every((digit) => digit !== '')
})

function setInputRef(el: HTMLInputElement | ComponentPublicInstance | null, index: number) {
  if (el) {
    otpInputRefs.value[index] = el instanceof HTMLInputElement ? el : (el.$el as HTMLInputElement)
  }
}

/** Set captcha from login response (sessionStorage). Returns true if captcha was set. */
function useStoredCaptcha(): boolean {
  const id = sessionStorage.getItem('mfa_captcha_id')
  const image = sessionStorage.getItem('mfa_captcha_image')
  if (id && image) {
    captchaId.value = id
    // Backend may return raw base64 or already data URL
    captchaImage.value = image.startsWith('data:') ? image : `data:image/png;base64,${image}`
    captchaError.value = ''
    return true
  }
  return false
}

async function loadCaptcha() {
  try {
    const response = await apiClient.get<
      { id?: string; image?: string; CaptchaId?: string; CaptchaImage?: string }
    >(endpoints.auth.captcha)
    const data = response.data
    const id = data.CaptchaId ?? data.id ?? null
    const rawImage = data.CaptchaImage ?? data.image ?? null
    if (id) captchaId.value = id
    if (rawImage) {
      captchaImage.value = rawImage.startsWith('data:') ? rawImage : `data:image/png;base64,${rawImage}`
    }
    captchaError.value = ''
  } catch (error) {
    console.error('Failed to load captcha:', error)
  }
}

async function refreshCaptcha() {
  captchaValue.value = ''
  captchaError.value = ''
  await loadCaptcha()
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

  // Auto-submit when complete
  if (value && index === 5 && isOtpComplete.value) {
    nextTick(() => {
      // Focus on captcha input
      const captchaInput = document.querySelector(
        'input[type="text"][placeholder*="کد نمایش"]',
      ) as HTMLInputElement
      if (captchaInput) {
        captchaInput.focus()
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

  // If 6 digits were pasted, focus on captcha input
  if (digits.length === 6) {
    nextTick(() => {
      const captchaInput = document.querySelector(
        'input[type="text"][placeholder*="کد نمایش"]',
      ) as HTMLInputElement
      if (captchaInput) {
        captchaInput.focus()
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

onMounted(async () => {
  // Get masked mobile number from query params (from login redirect)
  maskedMobileNumber.value = (route.query.maskedMobile as string) || null

  // Get MFA token from sessionStorage
  mfaToken.value = sessionStorage.getItem('mfa_token')

  if (!mfaToken.value) {
    router.push('/login')
    return
  }

  // Use captcha from login response first; only fetch when refreshing or not present
  const hadStoredCaptcha = useStoredCaptcha()
  if (!hadStoredCaptcha) {
    await loadCaptcha()
  }

  // Cooldown: use OtpExpirySeconds from login response if stored, else 60
  const expirySeconds = sessionStorage.getItem('mfa_otp_expiry_seconds')
  const cooldownSeconds = expirySeconds ? Math.max(0, parseInt(expirySeconds, 10)) : 60
  startCooldown(Number.isNaN(cooldownSeconds) ? 60 : cooldownSeconds)

  // Focus first input
  nextTick(() => {
    const firstInput = otpInputRefs.value[0] as HTMLInputElement
    if (firstInput) {
      firstInput.focus()
    }
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

async function resendOtp() {
  if (isResending.value || resendCooldown.value > 0) return

  isResending.value = true
  errorMessage.value = ''

  try {
    await apiClient.post(endpoints.auth.mfa.resendOtp, {
      MfaToken: mfaToken.value,
    })
    startCooldown(60)
    // Clear OTP inputs
    otpDigits.value = ['', '', '', '', '', '']
    nextTick(() => {
      const firstInput = otpInputRefs.value[0] as HTMLInputElement
      if (firstInput) {
        firstInput.focus()
      }
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
  if (isVerifying.value || !isOtpComplete.value || !captchaValue.value) return

  if (!mfaToken.value) {
    router.push('/login')
    return
  }

  if (!captchaId.value) {
    captchaError.value = 'لطفاً کد امنیتی را وارد کنید.'
    return
  }

  errorMessage.value = ''
  captchaError.value = ''
  isVerifying.value = true

  try {
    const otpCode = getOtpCode()

    const response = await apiClient.post<{
      Token: string
      PublicId: string
    }>(endpoints.auth.mfa.verify, {
      MfaToken: mfaToken.value,
      OtpCode: otpCode,
      CaptchaId: captchaId.value,
      CaptchaValue: captchaValue.value,
    })

    // Clear MFA-related data from sessionStorage
    sessionStorage.removeItem('mfa_token')
    sessionStorage.removeItem('mfa_userName')
    sessionStorage.removeItem('mfa_captcha_id')
    sessionStorage.removeItem('mfa_captcha_image')
    sessionStorage.removeItem('mfa_otp_expiry_seconds')

    // Fetch user data and set auth
    try {
      const userResponse = await apiClient.get(endpoints.users.byId(response.data.PublicId))
      authStore.setAuth(response.data.Token, response.data.PublicId, userResponse.data)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }

    const redirectPath = route.query.redirect as string | undefined
    router.push(redirectPath && redirectPath.startsWith('/') ? redirectPath : '/')
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
    // Refresh captcha on error
    await refreshCaptcha()
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
