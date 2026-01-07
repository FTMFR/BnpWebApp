<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { BaseSpinner } from '@/design-system/atoms'
import { FormCard, FormInput, FormSelect, Breadcrumb } from '@/design-system/molecules'
import type { FormSelectOption } from '@/design-system/molecules'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { Group, CreateUserRequest } from '@/shared/api/types'
import { AxiosError } from 'axios'
import { useToastStore } from '@/stores/toast'
import { useAuth } from '@/shared/composables/useAuth'

interface UserFormData {
  userName: string
  password: string
  firstName: string
  lastName: string
  email: string
  phone: string
  mobileNumber: string
  grpPublicId: string
}

interface FormErrors {
  [key: string]: string
}

const router = useRouter()
const toastStore = useToastStore()
const { fetchUser, isLoadingUser } = useAuth()

// Fetch user info on mount
onMounted(async () => {
  fetchUser()
  await fetchGroups()
})

const formData = ref<UserFormData>({
  userName: '',
  password: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  mobileNumber: '',
  grpPublicId: '',
})

const errors = ref<FormErrors>({})
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const groups = ref<FormSelectOption[]>([])
const isLoadingGroups = ref(false)

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

const handleInputChange = (field: keyof UserFormData) => (value: string) => {
  formData.value[field] = value
  // Clear error when user starts typing (only if form was submitted)
  if (isSubmitted.value && errors.value[field]) {
    delete errors.value[field]
  }
}

const handleSelectChange = (field: keyof UserFormData) => (value: string) => {
  formData.value[field] = value
  // Clear error when user selects an option (only if form was submitted)
  if (isSubmitted.value && errors.value[field]) {
    delete errors.value[field]
  }
}

const validateForm = (): boolean => {
  const newErrors: FormErrors = {}

  // Required fields validation
  if (!formData.value.userName.trim()) {
    newErrors.userName = 'نام کاربری الزامی است'
  }

  if (!formData.value.password.trim()) {
    newErrors.password = 'رمز عبور الزامی است'
  } else if (formData.value.password.length < 6) {
    newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد'
  }

  if (!formData.value.firstName.trim()) {
    newErrors.firstName = 'نام الزامی است'
  }

  if (!formData.value.lastName.trim()) {
    newErrors.lastName = 'نام خانوادگی الزامی است'
  }

  // Email validation
  if (!formData.value.email.trim()) {
    newErrors.email = 'ایمیل الزامی است'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    newErrors.email = 'آدرس ایمیل معتبر نیست'
  }

  // Phone validation
  if (!formData.value.phone.trim()) {
    newErrors.phone = 'تلفن ثابت الزامی است'
  }

  // Mobile number validation (simple Persian mobile format)
  if (!formData.value.mobileNumber.trim()) {
    newErrors.mobileNumber = 'شماره موبایل الزامی است'
  } else if (!/^09\d{9}$/.test(formData.value.mobileNumber)) {
    newErrors.mobileNumber = 'شماره موبایل معتبر نیست (مثال: 09123456789)'
  }

  // Group validation
  if (!formData.value.grpPublicId.trim()) {
    newErrors.grpPublicId = 'گروه الزامی است'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  isSubmitted.value = true

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const userData: CreateUserRequest = {
      userName: formData.value.userName,
      password: formData.value.password,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      phone: formData.value.phone,
      mobileNumber: formData.value.mobileNumber,
      grpPublicId: formData.value.grpPublicId,
    }
    await apiClient.post(endpoints.users.create, userData)
    toastStore.showToast('کاربر با موفقیت ثبت شد', 'success', 5000)

    // Reset form after successful submission
    formData.value = {
      userName: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      mobileNumber: '',
      grpPublicId: '',
    }
    errors.value = {}
    isSubmitted.value = false

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
  } finally {
    isSubmitting.value = false
  }
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
    <BaseSpinner size="lg" />
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

      <!-- Form Card -->
      <FormCard
        title="تعریف کاربر جدید"
        description="لطفا تمام فیلدهای مورد نیاز را تکمیل کنید"
        :is-submitting="isSubmitting"
        submit-label="ثبت کاربر"
        cancel-label="خروج"
        @submit="handleSubmit"
        @cancel="handleCancel"
      >
        <!-- Form Grid - 2 columns on desktop, 1 on mobile -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- UserName -->
          <FormInput
            label="نام کاربری"
            placeholder="نام کاربری را وارد کنید"
            :model-value="formData.userName"
            @update:model-value="handleInputChange('userName')"
            :error-message="isSubmitted ? errors.userName : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <!-- Password -->
          <FormInput
            label="رمز عبور"
            type="password"
            placeholder="رمز عبور را وارد کنید"
            :model-value="formData.password"
            @update:model-value="handleInputChange('password')"
            :error-message="isSubmitted ? errors.password : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <!-- FirstName -->
          <FormInput
            label="نام"
            placeholder="نام را وارد کنید"
            :model-value="formData.firstName"
            @update:model-value="handleInputChange('firstName')"
            :error-message="isSubmitted ? errors.firstName : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <!-- LastName -->
          <FormInput
            label="نام خانوادگی"
            placeholder="نام خانوادگی را وارد کنید"
            :model-value="formData.lastName"
            @update:model-value="handleInputChange('lastName')"
            :error-message="isSubmitted ? errors.lastName : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <!-- Email -->
          <FormInput
            label="ایمیل"
            type="email"
            placeholder="example@domain.com"
            :model-value="formData.email"
            @update:model-value="handleInputChange('email')"
            :error-message="isSubmitted ? errors.email : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <!-- Phone -->
          <FormInput
            label="تلفن ثابت"
            type="tel"
            placeholder="02112345678"
            :model-value="formData.phone"
            @update:model-value="handleInputChange('phone')"
            :error-message="isSubmitted ? errors.phone : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <!-- MobileNumber -->
          <FormInput
            label="شماره موبایل"
            type="tel"
            placeholder="09123456789"
            :model-value="formData.mobileNumber"
            @update:model-value="handleInputChange('mobileNumber')"
            :error-message="isSubmitted ? errors.mobileNumber : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <!-- GrpPublicId - Dropdown -->
          <FormSelect
            label="گروه"
            placeholder="گروه را انتخاب کنید"
            :model-value="formData.grpPublicId"
            @update:model-value="handleSelectChange('grpPublicId')"
            :error-message="isSubmitted ? errors.grpPublicId : undefined"
            :options="groups"
            :is-loading="isLoadingGroups"
            :required="true"
            :disabled="isSubmitting"
          />
        </div>
      </FormCard>
    </div>
  </DashboardLayout>
</template>
