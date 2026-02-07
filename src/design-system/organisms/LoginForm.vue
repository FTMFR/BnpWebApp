<template>
  <AuthLayout>
    <div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:hidden">
      <div
        class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white flex-shrink-0"
      >
        <BaseIcon
          name="Shield"
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

    <div
      class="flex gap-2 sm:gap-3 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-border-default mb-6 sm:mb-8 w-full max-w-full box-border flex-shrink-0"
    >
      <router-link
        to="/login"
        class="flex-1 min-h-[2.5rem] sm:min-h-[3rem] px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-[1.0625rem] cursor-pointer transition-all duration-300 ease-in-out no-underline flex items-center justify-center box-border text-text-secondary bg-transparent border-0 hover:not(.auth-tab-active):text-foreground hover:not(.auth-tab-active):bg-white/50 dark:hover:not(.auth-tab-active):bg-white/10"
        active-class="bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-[0_20px_25px_-5px_rgba(37,99,235,0.3),0_10px_10px_-5px_rgba(37,99,235,0.2)]"
      >
        ورود
      </router-link>
      <router-link
        to="/register"
        class="flex-1 min-h-[2.5rem] sm:min-h-[3rem] px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-[1.0625rem] cursor-pointer transition-all duration-300 ease-in-out no-underline flex items-center justify-center box-border text-text-secondary bg-transparent border-0 hover:not(.auth-tab-active):text-foreground hover:not(.auth-tab-active):bg-white/50 dark:hover:not(.auth-tab-active):bg-white/10"
        active-class="bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-[0_20px_25px_-5px_rgba(37,99,235,0.3),0_10px_10px_-5px_rgba(37,99,235,0.2)]"
      >
        ثبت‌نام
      </router-link>
    </div>

    <div class="mb-6 sm:mb-8">
      <div class="flex items-center gap-2 mb-2 sm:mb-3">
        <BaseIcon
          name="Star"
          :size="18"
          :stroke-width="2"
          icon-class="text-primary-500 sm:w-5 sm:h-5"
        />
        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-foreground m-0">خوش آمدید!</h1>
      </div>
      <p class="text-xs sm:text-sm md:text-base font-normal text-muted-foreground m-0">
        به امنیت دسترسی داشته باشید و مدیریت مالی خود را آغاز کنید
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 sm:gap-5" novalidate>
      <FormField
        label="نام کاربری"
        :model-value="formData.userName"
        @update:model-value="(val) => setFieldValue('userName', val)"
        type="text"
        placeholder="نام کاربری"
        icon="Mail"
        input-id="userName"
        :error-message="touched.userName ? errors.userName : undefined"
        required
        autocomplete="username"
      />

      <FormField
        label="رمز عبور"
        :model-value="formData.password"
        @update:model-value="(val) => setFieldValue('password', val)"
        type="password"
        placeholder="رمز عبور"
        icon="Lock"
        input-id="password"
        :error-message="touched.password ? errors.password : undefined"
        required
        autocomplete="current-password"
      />

      <div class="flex items-center justify-between pt-1">
        <router-link
          to="/forgot-password"
          class="text-sm font-semibold text-primary-500 bg-transparent border-0 cursor-pointer p-1 transition-colors no-underline hover:text-primary-600"
        >
          فراموشی رمز عبور؟
        </router-link>
      </div>

      <button
        type="submit"
        class="w-full max-w-full h-12 sm:h-14 md:h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg cursor-pointer transition-all duration-300 ease-in-out mt-4 sm:mt-6 md:mt-8 relative box-border overflow-hidden hover:not(:disabled):from-primary-600 hover:not(:disabled):to-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
        :aria-label="isLoggingIn ? 'در حال پردازش ورود به سیستم' : 'ورود به سیستم'"
      >
        <span class="relative z-10 flex items-center justify-center gap-3">
          <span class="flex items-center justify-center gap-3" aria-hidden="true">
            ورود به سیستم
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
    </form>

    <SessionsModal
      v-model="showSessionsModal"
      :sessions="sessions"
      :sessions-info="maxSessionReached"
      :revoking-session-id="revokingSessionId"
      @revoke-session="handleRevokeSession"
      @close="handleCloseModal"
      @continue="handleContinue"
    />
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AuthLayout } from '@/design-system/templates'
import { BaseIcon } from '@/design-system/atoms'
import { useAuth } from '@/shared/composables/useAuth'
import { useForm } from '@/shared/validation/useForm'
import { loginSchema, type LoginFormData } from '@/shared/validation/schemas/auth'
import SessionsModal from './SessionsModal.vue'
import { useToastStore } from '@/stores/toast'
import FormField from '../molecules/FormField.vue'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const {
  loginAsync,
  isLoggingIn,
  fetchUser,
  checkSessions,
  sessions,
  revokeSession,
  maxSessionReached,
} = useAuth()

const showSessionsModal = ref(false)
const revokingSessionId = ref<string | null>(null)

const {
  values: formData,
  errors,
  touched,
  handleSubmit: formHandleSubmit,
  setFieldValue,
} = useForm<LoginFormData>({
  schema: loginSchema,
  initialValues: {
    userName: '',
    password: '',
  },
  onSubmit: async (values: LoginFormData) => {
    try {
      const loginResponse = await loginAsync({
        UserName: values.userName,
        Password: values.password,
      })

      if (loginResponse?.RequiresMfa && loginResponse.MfaToken) {
        sessionStorage.setItem('mfa_token', loginResponse.MfaToken)
        sessionStorage.setItem('mfa_userName', values.userName)
        if (loginResponse.OtpExpirySeconds != null) {
          sessionStorage.setItem('mfa_otp_expiry_seconds', String(loginResponse.OtpExpirySeconds))
        }
        // When CaptchaId/CaptchaImage are null, do not show captcha on verify page (OTP-only submit)
        if (loginResponse.CaptchaId == null || loginResponse.CaptchaImage == null) {
          sessionStorage.removeItem('mfa_captcha_id')
          sessionStorage.removeItem('mfa_captcha_image')
        } else {
          sessionStorage.setItem('mfa_captcha_id', loginResponse.CaptchaId)
          const img = loginResponse.CaptchaImage
          sessionStorage.setItem('mfa_captcha_image', img.startsWith('data:') ? img : `data:image/png;base64,${img}`)
        }
        if (loginResponse.MaskedMobileNumber != null && loginResponse.MaskedMobileNumber !== '') {
          sessionStorage.setItem('mfa_masked_mobile', loginResponse.MaskedMobileNumber)
        }

        router.push({ path: '/mfa/verify' })
        return
      }

      // Check sessions after successful login (before any other API calls)
      const sessionsData = await checkSessions()

      if (sessionsData?.isMaxSessionsReached && sessionsData.sessions.length > 0) {
        showSessionsModal.value = true
      }

      else {
        await fetchUserAfterLogin()
        const redirectPath = route.query.redirect as string | undefined
        router.push(redirectPath && redirectPath.startsWith('/') ? redirectPath : '/')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },
})

async function fetchUserAfterLogin() {
  try {
    await fetchUser()
  } catch (error) {
    console.error('Failed to fetch user after login:', error)
  }
}

async function handleSubmit() {
  try {
    await formHandleSubmit()
  } catch (error) {
    console.error('Login error:', error)
  }
}

const handleRevokeSession = async (sessionPublicId: string) => {
  revokingSessionId.value = sessionPublicId
  try {
    const success = await revokeSession(sessionPublicId)
    if (success) {
      toastStore.showToast('سشن با موفقیت پایان یافت', 'success', 3000)
    } else {
      toastStore.showToast('خطا در پایان دادن به سشن', 'error', 3000)
    }
  } finally {
    revokingSessionId.value = null
  }
}

const handleCloseModal = () => {
  showSessionsModal.value = false
}

const handleContinue = () => {
  showSessionsModal.value = false
}
</script>
