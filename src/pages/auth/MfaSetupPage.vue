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
import { BaseIcon } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { AxiosError } from 'axios'

const mfaEnabled = ref(true)
const isLoading = ref(false)
const isToggling = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function loadMfaStatus() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await apiClient.get<{ enabled: boolean }>(endpoints.auth.mfa.status)
    mfaEnabled.value = response.data.enabled
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

async function handleToggleMfa() {
  if (isToggling.value) return

  isToggling.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (mfaEnabled.value) {
      await apiClient.post(endpoints.auth.mfa.enable)
      successMessage.value = 'تایید دو مرحله‌ای با موفقیت فعال شد.'
    } else {
      await apiClient.post(endpoints.auth.mfa.disable)
      successMessage.value = 'تایید دو مرحله‌ای با موفقیت غیرفعال شد.'
    }

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    // Revert the toggle on error
    mfaEnabled.value = !mfaEnabled.value
    errorMessage.value = getErrorMessage(error)
  } finally {
    isToggling.value = false
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

  return error instanceof Error
    ? error.message
    : 'خطایی در تغییر وضعیت تایید دو مرحله‌ای رخ داده است.'
}

onMounted(() => {
  loadMfaStatus()
})
</script>
