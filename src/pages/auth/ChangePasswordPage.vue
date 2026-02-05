<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6">
      <FormCard
        title="تغییر رمز عبور"
        description="برای افزایش امنیت حساب، رمز عبور خود را به‌روزرسانی کنید"
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
        @cancel="handleCancel"
      >
        <div class="grid grid-cols-1 gap-4">
          <FormField
            label="رمز عبور فعلی"
            type="password"
            input-id="current-password"
            autocomplete="current-password"
            :model-value="values.currentPassword"
            :error-message="touched.currentPassword ? errors.currentPassword : undefined"
            @update:model-value="(val) => setFieldValue('currentPassword', val)"
            required
          />

          <FormField
            label="رمز عبور جدید"
            type="password"
            input-id="new-password"
            autocomplete="new-password"
            :model-value="values.newPassword"
            :error-message="touched.newPassword ? errors.newPassword : undefined"
            @update:model-value="(val) => setFieldValue('newPassword', val)"
            required
          />

          <FormField
            label="تکرار رمز عبور جدید"
            type="password"
            input-id="confirm-password"
            autocomplete="new-password"
            :model-value="values.confirmPassword"
            :error-message="touched.confirmPassword ? errors.confirmPassword : undefined"
            @update:model-value="(val) => setFieldValue('confirmPassword', val)"
            required
          />
        </div>

        <div v-if="policyError" class="mt-4 text-sm text-danger-500">
          {{ policyError }}
        </div>

        <div v-else class="mt-4 space-y-3">
          <div class="flex items-center gap-2">
            <BaseIcon name="ShieldCheck" :size="18" :stroke-width="2" icon-class="text-primary-500" />
            <h3 class="text-sm font-semibold text-foreground">قوانین رمز عبور</h3>
            <span v-if="isLoadingPolicy" class="text-xs text-muted-foreground">در حال بارگذاری...</span>
          </div>

          <ul v-if="policyRules.length" class="space-y-2">
            <li
              v-for="rule in policyRules"
              :key="rule.key"
              class="flex items-start gap-2 text-sm"
            >
              <BaseIcon
                :name="rule.passed ? 'CheckCircle' : 'XCircle'"
                :size="16"
                :stroke-width="2"
                :icon-class="rule.passed ? 'text-success-600' : 'text-muted-foreground'"
              />
              <span :class="rule.passed ? 'text-success-700' : 'text-muted-foreground'">
                {{ rule.label }}
              </span>
            </li>
          </ul>

          <p v-else class="text-xs text-muted-foreground">
            قوانین رمز عبور در دسترس نیست. حداقل ۶ کاراکتر توصیه می‌شود.
          </p>
        </div>

        <div v-if="serverValidationErrors.length" class="mt-4 space-y-2">
          <div class="flex items-center gap-2 text-sm text-danger-500">
            <BaseIcon name="AlertCircle" :size="18" :stroke-width="2" />
            <span>رمز عبور جدید معتبر نیست:</span>
          </div>
          <ul class="list-disc list-inside text-xs text-danger-500 space-y-1">
            <li v-for="(message, index) in serverValidationErrors" :key="index">
              {{ message }}
            </li>
          </ul>
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-3">
            <BaseButton type="button" variant="outline" :disabled="isSubmitting" @click="handleCancel">
              انصراف
            </BaseButton>
            <BaseButton
              type="submit"
              variant="default"
              class="!text-white"
              :loading="isSubmitting"
              :disabled="isSubmitting || isValidating"
              @click="handleSubmit"
            >
              ذخیره تغییرات
            </BaseButton>
          </div>
        </template>
      </FormCard>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { BaseButton, BaseIcon } from '@/design-system/atoms'
import FormField from '@/design-system/molecules/FormField.vue'
import FormCard from '@/design-system/molecules/FormCard.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import { useForm } from '@/shared/validation/useForm'
import { changePasswordSchema, type ChangePasswordFormData } from '@/shared/validation/schemas/auth'
import type { AxiosError } from 'axios'
import type { ChangePasswordRequest, PasswordPolicyResponse } from '@/shared/api/types'

interface PasswordPolicyNormalized {
  minLength?: number
  maxLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireDigit?: boolean
  requireNonAlphanumeric?: boolean
  requiredUniqueChars?: number
}

const router = useRouter()
const toastStore = useToastStore()

const policy = ref<PasswordPolicyNormalized | null>(null)
const isLoadingPolicy = ref(false)
const policyError = ref('')

const serverValidationErrors = ref<string[]>([])
const isValidating = ref(false)
let validateTimer: number | undefined

const {
  values,
  errors,
  touched,
  isSubmitting,
  handleSubmit,
  setFieldValue,
  reset,
} = useForm<ChangePasswordFormData>({
  schema: changePasswordSchema,
  initialValues: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
  onSubmit: async (formValues) => {
    try {
      const payload: ChangePasswordRequest = {
        CurrentPassword: formValues.currentPassword,
        NewPassword: formValues.newPassword,
      }

      await apiClient.post(endpoints.auth.changePassword, payload)
      toastStore.showToast('رمز عبور با موفقیت تغییر یافت.', 'success', 5000)
      reset()
      serverValidationErrors.value = []
      router.push('/dashboard')
    } catch (error) {
      const messages = extractErrorMessages(error)
      toastStore.showToast(messages[0] || 'خطا در تغییر رمز عبور', 'error', 5000)
    }
  },
})

const policyRules = computed(() => {
  if (!policy.value) {
    return []
  }

  const password = values.newPassword || ''
  const uniqueChars = new Set(password.split('')).size
  const rules = []

  if (policy.value.minLength) {
    rules.push({
      key: 'minLength',
      label: `حداقل ${policy.value.minLength} کاراکتر`,
      passed: password.length >= policy.value.minLength,
    })
  }

  if (policy.value.maxLength) {
    rules.push({
      key: 'maxLength',
      label: `حداکثر ${policy.value.maxLength} کاراکتر`,
      passed: password.length <= policy.value.maxLength,
    })
  }

  if (policy.value.requireUppercase !== undefined) {
    rules.push({
      key: 'uppercase',
      label: 'حداقل یک حرف بزرگ (A-Z)',
      passed: /[A-Z]/.test(password),
    })
  }

  if (policy.value.requireLowercase !== undefined) {
    rules.push({
      key: 'lowercase',
      label: 'حداقل یک حرف کوچک (a-z)',
      passed: /[a-z]/.test(password),
    })
  }

  if (policy.value.requireDigit !== undefined) {
    rules.push({
      key: 'digit',
      label: 'حداقل یک عدد (0-9)',
      passed: /\d/.test(password),
    })
  }

  if (policy.value.requireNonAlphanumeric !== undefined) {
    rules.push({
      key: 'nonAlphanumeric',
      label: 'حداقل یک کاراکتر ویژه (!@#...)',
      passed: /[^a-zA-Z0-9]/.test(password),
    })
  }

  if (policy.value.requiredUniqueChars) {
    rules.push({
      key: 'uniqueChars',
      label: `حداقل ${policy.value.requiredUniqueChars} کاراکتر یکتا`,
      passed: uniqueChars >= policy.value.requiredUniqueChars,
    })
  }

  return rules
})

const loadPasswordPolicy = async () => {
  isLoadingPolicy.value = true
  policyError.value = ''

  try {
    const response = await apiClient.get<PasswordPolicyResponse>(endpoints.auth.passwordPolicy)
    policy.value = normalizePasswordPolicy(response.data)
  } catch (error) {
    policyError.value = extractErrorMessages(error)[0] || 'خطا در دریافت قوانین رمز عبور'
  } finally {
    isLoadingPolicy.value = false
  }
}

const validatePassword = async (password: string) => {
  if (!password) {
    serverValidationErrors.value = []
    return
  }

  isValidating.value = true
  try {
    await apiClient.post(endpoints.auth.validatePassword, password)
    serverValidationErrors.value = []
  } catch (error) {
    serverValidationErrors.value = extractErrorMessages(error)
  } finally {
    isValidating.value = false
  }
}

const handleCancel = () => {
  router.push('/dashboard')
}

const normalizePasswordPolicy = (data: PasswordPolicyResponse | Record<string, unknown> | null) => {
  if (!data || typeof data !== 'object') {
    return null
  }

  const record = data as Record<string, unknown>
  const getNumber = (keys: string[]) => {
    for (const key of keys) {
      if (typeof record[key] === 'number') {
        return record[key] as number
      }
    }
    return undefined
  }

  const getBoolean = (keys: string[]) => {
    for (const key of keys) {
      if (typeof record[key] === 'boolean') {
        return record[key] as boolean
      }
    }
    return undefined
  }

  return {
    minLength: getNumber(['minLength', 'MinLength']),
    maxLength: getNumber(['maxLength', 'MaxLength']),
    requireUppercase: getBoolean(['requireUppercase', 'RequireUppercase']),
    requireLowercase: getBoolean(['requireLowercase', 'RequireLowercase']),
    requireDigit: getBoolean(['requireDigit', 'RequireDigit']),
    requireNonAlphanumeric: getBoolean(['requireNonAlphanumeric', 'RequireNonAlphanumeric']),
    requiredUniqueChars: getNumber(['requiredUniqueChars', 'RequiredUniqueChars']),
  } as PasswordPolicyNormalized
}

const extractErrorMessages = (error: unknown): string[] => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string; errors?: unknown }>
    const data = axiosError.response?.data

    if (data) {
      if (typeof data === 'string') {
        return [data]
      }

      if (typeof data === 'object') {
        if ('errors' in data) {
          const errors = data.errors
          if (Array.isArray(errors)) {
            return errors.filter((msg): msg is string => typeof msg === 'string')
          }
          if (errors && typeof errors === 'object') {
            return Object.values(errors).flatMap((value) =>
              Array.isArray(value) ? value : typeof value === 'string' ? [value] : []
            )
          }
          if (typeof errors === 'string') {
            return [errors]
          }
        }

        if ('message' in data && typeof data.message === 'string') {
          return [data.message]
        }
        if ('error' in data && typeof data.error === 'string') {
          return [data.error]
        }
      }
    }

    if (axiosError.request && !axiosError.response) {
      return ['ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.']
    }
  }

  return [error instanceof Error ? error.message : 'خطایی رخ داده است.']
}

watch(
  () => values.newPassword,
  (password) => {
    serverValidationErrors.value = []

    if (validateTimer) {
      window.clearTimeout(validateTimer)
    }

    validateTimer = window.setTimeout(() => {
      validatePassword(password)
    }, 400)
  },
)

onMounted(() => {
  loadPasswordPolicy()
})

onUnmounted(() => {
  if (validateTimer) {
    window.clearTimeout(validateTimer)
  }
})
</script>
