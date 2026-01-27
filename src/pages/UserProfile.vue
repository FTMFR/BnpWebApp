<script setup lang="ts">
import BaseButton from '@/design-system/atoms/BaseButton.vue'
import CustomLoader from '@/design-system/atoms/CustomLoader.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useUserInfo, type UserInfo } from '@/shared/composables/useUserInfo'
import { useForm } from '@/shared/validation/useForm'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { AxiosError } from 'axios'
import { computed, ref } from 'vue'
import { z } from 'zod'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  mobileNumber: string
}
const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'پروفایل من', href: '/profile' },
]

const { userInfo } = useUserInfo()
const user = ref<UserProfile | null>(null)

const dynamicUserInfo = computed<UserInfo>(() => userInfo.value)
const toastStore = useToastStore()
const isEditable = ref(false)
const authStore = useAuthStore()

const toggleEditability = () => {
  isEditable.value = !isEditable.value
}

const updateUserSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است').trim(),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است').trim(),
  email: z.string().email('آدرس ایمیل معتبر نیست').trim(),
  phone: z
    .string()
    .regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست (مثال: 09123456789)')
    .trim(),
  mobileNumber: z
    .string()
    .min(1, 'شماره موبایل الزامی است')
    .regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست (مثال: 09123456789)')
    .trim(),
})

const updateUserInfo = (newValues: UserProfile) => {
  userInfo.value = newValues
}

const { values, errors, validate, handleSubmit, isSubmitting } = useForm({
  schema: updateUserSchema,
  initialValues: {
    firstName: user.value?.firstName || '',
    lastName: user.value?.lastName || '',
    email: user.value?.email || '',
    phone: user.value?.phone || '',
    mobileNumber: user.value?.mobileNumber || '',
  },
  onSubmit: async (values) => {
    try {
      if (!authStore.publicId) return
      console.log('user info')

      await apiClient.put<UserProfile>(endpoints.users.byId(authStore.publicId), values)

      toastStore.showToast('اطلاعات با موفقیت آپدیت شد.', 'success', 5000)
    } catch (error) {
      const msg =
        error instanceof AxiosError ? error.response?.data?.message : 'خطا در بروزرسانی کاربر'
      toastStore.showToast(msg, 'error', 5000)
    }
  },
})
</script>

<template>
  <div v-if="!dynamicUserInfo" class="flex item-center justify-center min-h-screen">
    <CustomLoader size="lg" />
  </div>

  <DashboardLayout v-else>
    <div class="space-y-4 sm:space-y-6">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card variant="elevated" padding="none">
        <template #header>
          <div class="p-4 sm:p-6">
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6"
            >
              <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">پروفایل من</h1>
              <div>
                <BaseButton
                  variant="primary"
                  @click="toggleEditability"
                  class="border-2 text-white font-bold text-lg"
                >
                  <!-- <BaseIcon name="Edit" :size="16" /> -->
                  <span class="inline">اصلاح</span>
                </BaseButton>

                <BaseButton
                  variant="outline"
                  type="submit"
                  @click="handleSubmit"
                  class="border-2 border-success-600 text-success-600"
                >
                  {{ isSubmitting ? 'در حال بروزرسانی' : 'ثبت تغییرات' }}
                </BaseButton>
              </div>
            </div>
          </div>
        </template>
        <form @submit="handleSubmit">
          <div class="p-4 sm:p-6 w-full gap-3 flex flex-col">
            <div class="flex items-center justify-between gap-3">
              <FormField
                :disabled="true"
                label="نام کاربری"
                type="text"
                :required="true"
                @update:model-value="updateUserInfo"
                v-model="dynamicUserInfo.userName"
              />

              <FormField
                :disabled="!isEditable"
                label="نام"
                type="text"
                @update:model-value="updateUserInfo"
                v-model="dynamicUserInfo.firstName"
              />
            </div>

            <div class="flex items-center justify-between gap-3">
              <FormField
                :disabled="!isEditable"
                label="نام خانوادگی"
                type="text"
                @update:model-value="updateUserInfo"
                v-model="dynamicUserInfo.lastName"
              />
              <FormField
                :disabled="!isEditable"
                label="ایمیل"
                type="text"
                @update:modelValue="updateUserInfo"
                v-model="dynamicUserInfo.email as string"
              />
            </div>
            <div class="flex items-center justify-between gap-3">
              <FormField
                :disabled="!isEditable"
                label="تلفن همراه"
                type="tel"
                @update:modelValue="updateUserInfo"
                v-model="dynamicUserInfo.phone as string"
              />
              <FormField
                :disabled="!isEditable"
                label="تلفن ثابت"
                type="tel"
                @update:modelValue="updateUserInfo"
                v-model="dynamicUserInfo.mobileNumber as string"
              />
            </div>
          </div>
        </form>
      </Card>
    </div>
  </DashboardLayout>
</template>
