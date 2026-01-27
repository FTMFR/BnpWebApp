<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { CustomLoader } from '@/design-system/atoms'
import { FormSelect, Breadcrumb, FormField, FormCard } from '@/design-system/molecules'
import type { FormSelectOption } from '@/design-system/molecules'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { Group, CreateUserRequest } from '@/shared/api/types'
import { AxiosError } from 'axios'
import { useToastStore } from '@/stores/toast'
import { useAuth } from '@/shared/composables/useAuth'
import { useForm } from '@/shared/validation/useForm'
import { createUserSchema, type CreateUserFormData } from '@/shared/validation/schemas/user'
import BaseButton from '@/design-system/atoms/BaseButton.vue'

const router = useRouter()
const toastStore = useToastStore()
const { fetchUser, isLoadingUser } = useAuth()

// Fetch user info on mount
onMounted(async () => {
  fetchUser()
  await fetchGroups()
})

const groups = ref<FormSelectOption[]>([])
const isLoadingGroups = ref(false)

// Initialize form with useForm composable
const {
  values: formData,
  errors,
  isSubmitting,
  handleSubmit,
  setFieldValue,
  reset: resetForm,
} = useForm<CreateUserFormData>({
  schema: createUserSchema,
  initialValues: {
    userName: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobileNumber: '',
    grpPublicId: '',
  },
  onSubmit: async (values) => {
    try {
      const userData: CreateUserRequest = {
        userName: values.userName,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        mobileNumber: values.mobileNumber,
        grpPublicId: values.grpPublicId,
        IpAddress: '',
      }
      await apiClient.post(endpoints.users.create, userData)
      toastStore.showToast('کاربر با موفقیت ثبت شد', 'success', 5000)

      // Reset form after successful submission
      resetForm()

      // Navigate back to users list after a short delay
      setTimeout(() => {
        router.push('/users/list')
      }, 1000)
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : 'خطا در ثبت کاربر'
      toastStore.showToast(errorMessage, 'error', 5000)
      throw error // Re-throw to prevent form reset
    }
  },
})

const fetchGroups = async () => {
  isLoadingGroups.value = true
  try {
    const response = await apiClient.get<Group[]>(endpoints.groups.list)
    groups.value = response.data.map((group: Group) => ({
      value: group.PublicId,
      label: group.Title,
    }))
  } catch (error) {
    console.error('Error fetching groups:', error)
    toastStore.showToast('خطا در دریافت لیست گروه‌ها', 'error', 5000)
  } finally {
    isLoadingGroups.value = false
  }
}

const handleInputChange = (field: string, value: string | number | boolean) => {
  setFieldValue(field, value)
}

const handleSelectChange = (field: keyof CreateUserFormData, value: string | number | boolean) => {
  setFieldValue(field, value)
}

const handleCancel = () => {
  router.push('/users/list')
}

const handleSearch = (query: string) => {
  console.log('Global search:', query)
  // TODO: Implement global search
}

const handleUserMenuClick = () => {
  console.log('User menu clicked')
  // TODO: show user menu dropdown
}

const handleNotificationClick = () => {
  console.log('Notification clicked')
  // TODO: show notifications
}

const handleHelpClick = () => {
  console.log('Help clicked')
  // TODO: show help
}

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'کاربران', href: '/users/list' },
  { label: 'تعریف کاربر جدید' },
]
</script>

<template>
  <div v-if="isLoadingUser" class="flex items-center justify-center min-h-screen">
    <CustomLoader size="lg" />
  </div>
  <DashboardLayout
    v-else
    @search="handleSearch"
    @user-menu-click="handleUserMenuClick"
    @notification-click="handleNotificationClick"
    @help-click="handleHelpClick"
  >
    <div class="space-y-4 sm:space-y-6">
      <!-- Breadcrumb -->
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <FormCard
        title="تعریف کاربر جدید"
        description="لطفا تمام فیلدهای مورد نیاز را تکمیل کنید"
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
        @cancel="handleCancel"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- UserName -->
          <FormField
            v-model="formData.userName"
            :error-message="errors.userName"
            required
            @update:model-value="(val) => handleInputChange('userName', val)"
            type="text"
            label="نام کاربری"
            placeholder="نام کاربری را وارد کنید"
            :disabled="isSubmitting"
          />

          <!-- Password -->
          <FormField
            label="رمز عبور"
            type="password"
            required
            @update:model-value="(val) => handleInputChange('password', val)"
            placeholder="رمز عبور را وارد کنید"
            v-model="formData.password"
            :error-message="errors.password"
            :disabled="isSubmitting"
          />

          <!-- FirstName -->
          <FormField
            type="text"
            required
            label="نام"
            placeholder="نام را وارد کنید"
            @update:model-value="(val) => handleInputChange('firstName', val)"
            v-model="formData.firstName"
            :error-message="errors.firstName"
            :disabled="isSubmitting"
          />

          <!-- LastName -->
          <FormField
            type="text"
            label="نام خانوادگی"
            required
            placeholder="نام خانوادگی را وارد کنید"
            @update:model-value="(val) => handleInputChange('lastName', val)"
            v-model="formData.lastName"
            :error-message="errors.lastName"
            :disabled="isSubmitting"
          />

          <!-- Email -->
          <FormField
            label="ایمیل"
            type="email"
            placeholder="example@domain.com"
            @update:model-value="(val) => handleInputChange('email', val)"
            v-model="formData.email"
            :error-message="errors.email"
            :disabled="isSubmitting"
          />

          <!-- Phone -->
          <FormField
            label="تلفن ثابت"
            type="tel"
            placeholder="02112345678"
            v-model="formData.phone"
            @update:model-value="(val) => handleInputChange('phone', val)"
            :error-message="errors.phone"
            :disabled="isSubmitting"
          />

          <!-- MobileNumber -->
          <FormField
            label="شماره موبایل"
            type="tel"
            required
            placeholder="09123456789"
            v-model="formData.mobileNumber"
            @update:model-value="(val) => handleInputChange('mobileNumber', val)"
            :error-message="errors.mobileNumber"
            :disabled="isSubmitting"
          />

          <!-- GrpPublicId - Dropdown -->
          <FormSelect
            label="گروه"
            required
            placeholder="گروه را انتخاب کنید"
            v-model="formData.grpPublicId"
            :error-message="errors.grpPublicId"
            :options="groups"
            @update:model-value="(val) => handleSelectChange('grpPublicId', val)"
            :is-loading="isLoadingGroups"
            :disabled="isSubmitting"
          />
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-3">
            <BaseButton
              type="button"
              variant="outline"
              :disabled="isSubmitting"
              @click="handleCancel"
            >
              انصراف
            </BaseButton>
            <BaseButton
              type="submit"
              variant="default"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              class="!text-white"
              @click="handleSubmit"
            >
              ثبت کاربر
            </BaseButton>
          </div>
        </template>
      </FormCard>
    </div>
  </DashboardLayout>
</template>
