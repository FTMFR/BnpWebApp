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
      <FormInput
        label="نام کاربری"
        v-model="userName"
        type="text"
        placeholder="14521841"
        icon="Mail"
        input-id="userName"
        :error-message="errorMessage"
        required
        autocomplete="username"
        @clear-error="errorMessage = ''"
      />

      <FormInput
        label="رمز عبور"
        v-model="password"
        type="password"
        placeholder="••••••••"
        icon="Lock"
        input-id="password"
        :error-message="errorMessage"
        required
        autocomplete="current-password"
        @clear-error="errorMessage = ''"
      />

      <div class="flex items-center justify-between pt-1">
        <router-link
          to="/forgot-password"
          class="text-sm font-semibold text-primary-500 bg-transparent border-0 cursor-pointer p-1 transition-colors no-underline hover:text-primary-600"
        >
          فراموشی رمز عبور؟
        </router-link>
      </div>

      <div
        v-if="errorMessage"
        id="login-error"
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
        :disabled="isLoggingIn"
        class="w-full max-w-full h-12 sm:h-14 md:h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg cursor-pointer transition-all duration-300 ease-in-out mt-4 sm:mt-6 md:mt-8 relative box-border overflow-hidden hover:not(:disabled):from-primary-600 hover:not(:disabled):to-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
        :aria-label="isLoggingIn ? 'در حال پردازش ورود به سیستم' : 'ورود به سیستم'"
      >
        <span class="relative z-10 flex items-center justify-center gap-3">
          <span v-if="isLoggingIn" aria-hidden="true">در حال پردازش.</span>
          <span v-else class="flex items-center justify-center gap-3" aria-hidden="true">
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
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AuthLayout } from '@/design-system/templates'
import { FormInput } from '@/design-system/molecules'
import { BaseIcon } from '@/design-system/atoms'
import { useAuth } from '@/shared/composables/useAuth'
import type { AxiosError } from 'axios'

const route = useRoute()
const router = useRouter()
const { loginAsync, isLoggingIn, fetchUser } = useAuth()

const userName = ref('')
const password = ref('')
const errorMessage = ref('')

async function fetchUserAfterLogin() {
  try {
    // fetchUser از useAuth استفاده می‌کند که userQuery.refetch را صدا می‌زند
    // این اطمینان می‌دهد که user data بعد از login fetch شود
    await fetchUser()
  } catch (error) {
    console.error('Failed to fetch user after login:', error)
    // Don't throw - user can be fetched later if needed
    // در useAuth.ts، userQuery به صورت خودکار user را fetch می‌کند
  }
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>

    if (axiosError.response?.data) {
      const data = axiosError.response.data

      if (typeof data === 'object') {
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

  return error instanceof Error ? error.message : 'خطایی در ورود به سیستم رخ داده است.'
}

async function handleSubmit() {
  if (isLoggingIn.value) return

  if (!userName.value || !password.value) {
    errorMessage.value = 'لطفاً نام کاربری و رمز عبور را وارد کنید.'
    return
  }

  errorMessage.value = ''

  try {
    const loginResponse = await loginAsync({
      UserName: userName.value,
      Password: password.value,
    })

    // Check if MFA is required
    if (loginResponse?.RequiresMfa && loginResponse.MfaToken) {
      // Store MFA token temporarily
      sessionStorage.setItem('mfa_token', loginResponse.MfaToken)
      sessionStorage.setItem('mfa_userName', userName.value)

      router.push({
        path: '/mfa/verify',
        query: {
          maskedMobile: loginResponse.MaskedMobileNumber || undefined,
        },
      })
      return
    }

    await fetchUserAfterLogin()

    const redirectPath = route.query.redirect as string | undefined
    router.push(redirectPath && redirectPath.startsWith('/') ? redirectPath : '/')
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
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
