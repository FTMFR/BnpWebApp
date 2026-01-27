<script setup lang="ts">
import { ref } from 'vue'
import { useToastStore } from '@/stores/toast'
import { BaseButton, BaseIcon } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import FormField from '../molecules/FormField.vue'
import { useForm } from '@/shared/validation/useForm'
import {
  resetPassword,
  type ResetPassword as ResetPasswordType,
} from '@/shared/validation/schemas/user'
import type { resetUserPassRequest } from '@/shared/api/types'
import { endpoints } from '@/shared/api/endpoints'
import router from '@/router'
import { AxiosError } from 'axios'

const props = defineProps({
  publicId: {
    type: String,
    required: true,
  },
  redirectPath: {
    type: String,
    default: '#',
  },
})

const emit = defineEmits(['close'])

const toastStore = useToastStore()
// const mustChangePassword = ref(false)

const { values, errors, touched, handleSubmit, setFieldValue } = useForm<ResetPasswordType>({
  schema: resetPassword,
  initialValues: {
    password: '',
    mustChangePass: false,
  },
  onSubmit: async (values) => {
    try {
      const userData: resetUserPassRequest = {
        NewPassword: values.password,
        MustChangePassword: values.mustChangePass,
      }
      await apiClient.post(endpoints.users.resetPassword(props.publicId), userData)
      toastStore.showToast('رمز عبور کاربر با موفقیت تغییر یافت.', 'success', 5000)

      // resetForm()
      emit('close')
      setTimeout(() => {
        router.push(props.redirectPath)
      }, 1000)
    } catch (error) {
      console.error('Error submitting form:', error)

      // Check if it's an AxiosError with the specific structure
      if (error instanceof AxiosError && error.response?.data?.errors) {
        const apiErrors = error.response.data.errors

        // If errors is an array, loop and show toasts
        if (Array.isArray(apiErrors)) {
          apiErrors.forEach((msg: string) => {
            toastStore.showToast(msg, 'error', 5000)
          })
        }
        // If errors is a single string (fallback)
        else if (typeof apiErrors === 'string') {
          toastStore.showToast(apiErrors, 'error', 5000)
        }
      } else {
        // Generic error fallback
        toastStore.showToast('خطا در تغییر رمز عبور', 'error', 5000)
      }
    }
  },
})
</script>

<template>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-auto"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 border border-gray-200 dark:border-gray-700"
    >
      <!-- Header -->
      <div
        class="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700"
      >
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">تغییر رمز عبور کاربر</h2>
        <button
          @click="emit('close')"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <BaseIcon name="X" :size="24" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <FormField
          label="رمز عبور"
          :model-value="values.password"
          @update:model-value="(val) => setFieldValue('password', val)"
          type="password"
          placeholder="رمز عبور"
          icon="Lock"
          input-id="password"
          :error-message="touched.password ? errors.password : undefined"
          required
          autocomplete="current-password"
        />

        <label
          for="toggle-pass"
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer select-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span class="text-gray-700 dark:text-gray-200 font-medium">
            آیا کاربر باید پسورد خود را تغییر دهد؟
          </span>

          <!-- Custom Toggle Component -->
          <div class="relative inline-block w-12 h-6 align-middle select-none">
            <input
              id="toggle-pass"
              v-model="values.mustChangePass"
              type="checkbox"
              class="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out z-10"
              :class="{
                'bg-gray-300 right-0': !values.mustChangePass,
                'bg-blue-500 left-0': values.mustChangePass,
              }"
            />
            <div
              class="block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300"
              :class="{
                'bg-gray-300': !values.mustChangePass,
                'bg-blue-500': values.mustChangePass,
              }"
            ></div>
          </div>
        </label>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <BaseButton
            variant="outline"
            @click="emit('close')"
            class="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            انصراف
          </BaseButton>
          <BaseButton
            variant="default"
            class="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
            type="submit"
          >
            <BaseIcon name="Key" :size="16" class="mr-2" />
            تغییر رمز
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>
