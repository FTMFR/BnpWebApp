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

    <div class="mb-6 sm:mb-8">
      <div class="flex items-center gap-2 mb-2 sm:mb-3">
        <BaseIcon
          name="Key"
          :size="18"
          :stroke-width="2"
          icon-class="text-primary-500 sm:w-5 sm:h-5"
        />
        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-foreground m-0">
          بازیابی رمز عبور
        </h1>
      </div>
      <p class="text-xs sm:text-sm md:text-base font-normal text-muted-foreground m-0">
        نام کاربری یا ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 sm:gap-5" novalidate>
      <FormField
        label="نام کاربری یا ایمیل"
        v-model="userNameOrEmail"
        type="text"
        placeholder="نام کاربری یا آدرس ایمیل"
        icon="Mail"
        input-id="userNameOrEmail"
        :error-message="errorMessage"
        required
        autocomplete="username"
        @clear-error="errorMessage = ''"
      />

      <div
        v-if="errorMessage"
        id="forgot-password-error"
        class="flex items-center gap-3 p-3.5 px-4 bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 dark:border-red-500/40 rounded-xl text-danger-500 dark:text-danger-400 text-sm sm:text-base font-medium mt-2 animate-[slideIn_0.3s_ease-out] break-words min-w-0"
        role="alert"
        aria-live="polite"
      >
        <BaseIcon
          name="AlertCircle"
          :size="20"
          :stroke-width="2"
          icon-class="flex-shrink-0 text-danger-500 dark:text-danger-400"
        />
        <span class="min-w-0 break-words">{{ errorMessage }}</span>
      </div>

      <div
        v-if="successMessage"
        id="forgot-password-success"
        class="flex items-center gap-3 p-3.5 px-4 bg-green-500/10 dark:bg-green-500/15 border border-green-500/30 dark:border-green-500/40 rounded-xl text-green-600 dark:text-green-400 text-sm sm:text-base font-medium mt-2 animate-[slideIn_0.3s_ease-out] break-words min-w-0"
        role="alert"
        aria-live="polite"
      >
        <BaseIcon
          name="CheckCircle"
          :size="20"
          :stroke-width="2"
          icon-class="flex-shrink-0 text-green-600 dark:text-green-400"
        />
        <span class="min-w-0 break-words">{{ successMessage }}</span>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full max-w-full h-12 sm:h-14 md:h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg cursor-pointer transition-all duration-300 ease-in-out mt-4 sm:mt-6 md:mt-8 relative box-border overflow-hidden hover:not(:disabled):from-primary-600 hover:not(:disabled):to-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
        :aria-label="isSubmitting ? 'در حال ارسال درخواست' : 'ارسال لینک بازیابی'"
      >
        <span class="relative z-10 flex items-center justify-center gap-3">
          <span v-if="isSubmitting" aria-hidden="true">در حال ارسال...</span>
          <span v-else class="flex items-center justify-center gap-3" aria-hidden="true">
            ارسال لینک بازیابی
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
        <router-link
          to="/login"
          class="text-sm font-semibold text-primary-500 flex items-center gap-2 bg-transparent border-0 cursor-pointer p-1 transition-colors no-underline hover:text-primary-600"
        >
          <BaseIcon name="ArrowRight" :size="18" :stroke-width="2" icon-class="sm:w-5 sm:h-5" />
          بازگشت به صفحه ورود
        </router-link>
      </div>
    </form>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { useRouter } from 'vue-router'
import { AuthLayout } from '@/design-system/templates'
import { BaseIcon } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { AxiosError } from 'axios'

// const router = useRouter()

const userNameOrEmail = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

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

  return error instanceof Error ? error.message : 'خطایی در ارسال درخواست رخ داده است.'
}

async function handleSubmit() {
  if (isSubmitting.value) return

  if (!userNameOrEmail.value) {
    errorMessage.value = 'لطفاً نام کاربری یا ایمیل خود را وارد کنید.'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    await apiClient.post(endpoints.auth.forgotPassword, {
      userNameOrEmail: userNameOrEmail.value,
    })

    successMessage.value =
      'درخواست بازیابی رمز عبور با موفقیت ارسال شد. لطفاً ایمیل خود را بررسی کنید.'

    // Clear form after success
    userNameOrEmail.value = ''
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSubmitting.value = false
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
