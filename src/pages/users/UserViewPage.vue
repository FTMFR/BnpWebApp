<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { BaseButton, CustomLoader } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { User } from './UsersListPage.vue'
import { useToastStore } from '@/stores/toast'
import FormField from '@/design-system/molecules/FormField.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import Card from '@/design-system/molecules/Card.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'

const route = useRoute()

const userId = route.params.id as string

const user = ref<User>()
const isLoading = ref(false)
const isEditable = ref(false)
const isSubmitting = ref(false)
const toastStore = useToastStore()
const isLockedOut = ref(false)
const isUnlocking = ref(false)

// ۲. formData را با reactive تعریف کنید
const formData = reactive({
  FirstName: '',
  LastName: '',
  Email: '',
  MobileNumber: '',
  Phone: '',
  IsActive: true,
})

const fetchUserDetails = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get<User>(endpoints.users.byId(userId))
    user.value = response.data

    formData.FirstName = response.data.FirstName || ''
    formData.LastName = response.data.LastName || ''
    formData.Email = response.data.Email || ''
    formData.MobileNumber = response.data.MobileNumber || ''
    formData.IsActive = response.data.IsActive

    await fetchLockoutStatus()
  } catch (error) {
    console.error('Failed to fetch user:', error)
    toastStore.showToast('خطا در دریافت اطلاعات کاربر', 'error')
  } finally {
    isLoading.value = false
  }
}

const fetchLockoutStatus = async () => {
  try {
    // Assuming you have an endpoint like endpoints.users.lockoutStatus(userId)
    // If not, replace this string with your actual API URL
    const response = await apiClient.get(endpoints.users.lockoutStatus(userId))

    // Adjust 'IsLockedOut' based on the actual response field name from your API
    isLockedOut.value = response.data.IsLockedOut || false
  } catch (error) {
    console.error('Failed to fetch lockout status:', error)
    // Optional: Don't show toast here to avoid annoying user if endpoint fails,
    // just default to false or keep previous state
  }
}

const toggleEdit = () => {
  isEditable.value = !isEditable.value
  if (!isEditable.value && user.value) {
    formData.FirstName = user.value.FirstName
    formData.LastName = user.value.LastName
    formData.Email = user.value.Email
    formData.MobileNumber = user.value.MobileNumber
  }
}

const isTogglingActive = ref(false)

const toggleUserActive = async () => {
  if (!user.value || isTogglingActive.value) return

  const nextState = !formData.IsActive

  isTogglingActive.value = true

  try {
    const response = await apiClient.post(endpoints.users.activate(userId), {
      isActive: nextState,
    })

    formData.IsActive = nextState

    toastStore.showToast(response.data.message, 'success')
  } catch (error) {
    console.error('Activation failed:', error)
    toastStore.showToast('خطا در تغییر وضعیت کاربر', 'error')
  } finally {
    isTogglingActive.value = false
  }
}

const handleUnlockToggle = async () => {
  // Prevent toggling if not in edit mode or if already unlocked
  if (!isEditable.value || !isLockedOut.value || isUnlocking.value) {
    return
  }

  isUnlocking.value = true
  try {
    // Call Unlock API
    await apiClient.post(endpoints.users.unlock(userId))

    // Update local state
    isLockedOut.value = false
    toastStore.showToast('حساب کاربری با موفقیت باز شد', 'success')
  } catch (error) {
    console.error('Unlock failed:', error)
    toastStore.showToast('خطا در باز کردن قفل حساب', 'error')
  } finally {
    isUnlocking.value = false
  }
}

onMounted(() => {
  fetchUserDetails()
})

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await apiClient.put(endpoints.users.update(userId), formData)

    toastStore.showToast('اطلاعات کاربر با موفقیت بروزرسانی شد', 'success')
    await fetchUserDetails()
    isEditable.value = false
  } catch (error) {
    console.error('Update failed:', error)
    toastStore.showToast('خطا در بروزرسانی اطلاعات', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const breadcrumbItems = computed(() => [
  { label: 'خانه', href: '/dashboard' },
  { label: 'کاربران', href: '/users/list' },
  { label: user.value?.UserName || 'جزئیات کاربر' },
])
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <!-- Breadcrumb -->
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card variant="elevated" padding="none" class="min-w-0">
        <template #header>
          <div class="p-4 sm:p-6">
            <div
              class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4"
            >
              <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                جزئیات کاربر
              </h1>

              <div class="flex gap-3">
                <BaseButton
                  v-if="!isEditable"
                  variant="outline"
                  @click="toggleEdit"
                  class="border-2 border-primary-500 text-primary-600"
                >
                  اصلاح
                </BaseButton>

                <BaseButton v-else variant="outline" @click="toggleEdit" :disabled="isSubmitting">
                  انصراف
                </BaseButton>

                <BaseButton
                  v-if="isEditable"
                  variant="default"
                  class="bg-success-600 hover:bg-success-700 text-white"
                  @click="handleSubmit"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? 'در حال ذخیره...' : 'ثبت تغییرات' }}
                </BaseButton>
              </div>
            </div>
          </div>
        </template>

        <div v-if="isLoading" class="p-10 flex justify-center">
          <CustomLoader size="lg" />
        </div>

        <form v-else @submit.prevent="handleSubmit" class="p-4 sm:p-6 w-full space-y-6 min-w-0 break-words">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0">
            <FormField
              :model-value="user?.UserName ?? ''"
              label="نام کاربری"
              type="text"
              :disabled="true"
              class="opacity-75"
            />

            <FormField
              label="نام"
              type="text"
              v-model="formData.FirstName"
              :disabled="!isEditable"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="نام خانوادگی"
              type="text"
              v-model="formData.LastName"
              :disabled="!isEditable"
            />

            <FormField
              label="ایمیل"
              type="email"
              v-model="formData.Email"
              :disabled="!isEditable"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="تلفن همراه"
              type="tel"
              v-model="formData.MobileNumber"
              :disabled="!isEditable"
            />

            <FormField
              label="تلفن ثابت"
              type="tel"
              v-model="formData.Phone"
              :disabled="!isEditable"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
            <!-- <FormField
              label="وضعیت"
              type="text"
              :model-value="formData?.IsActive ? 'فعال' : 'غیرفعال'"
              :disabled="true"
            /> -->
            <div class="flex items-center justify-center gap-4">
              <label class="text-sm font-medium text-foreground"> وضعیت </label>

              <button
                type="button"
                :disabled="!isEditable || isTogglingActive"
                @click="toggleUserActive"
                class="relative inline-flex h-7 w-16 rounded-full border overflow-hidden transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="[
                  formData.IsActive
                    ? 'bg-success border-success'
                    : 'bg-black dark:bg-muted-foreground border-gray',
                  (isTogglingActive || !isEditable) && 'cursor-not-allowed opacity-70',
                ]"
              >
                <span
                  class="absolute top-1 h-4 w-4 rounded-full bg-gray-800 dark:bg-gray-100 shadow-md transition-all duration-200"
                  :class="formData.IsActive ? 'right-1' : 'left-1'"
                />
              </button>
            </div>
            <div class="flex items-center justify-center gap-4">
              <label class="text-sm font-medium text-foreground"> قفل حساب </label>
              <button
                type="button"
                :disabled="!isEditable || !isLockedOut || isUnlocking"
                @click="handleUnlockToggle"
                class="relative inline-flex h-7 w-16 rounded-full border overflow-hidden transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="[
                  isLockedOut
                    ? 'bg-danger border-danger' // Red if locked
                    : 'bg-success border-success', // Green if unlocked
                  // Disable visually if not editable OR if already unlocked (cannot lock back)
                  (!isEditable || !isLockedOut) && 'cursor-not-allowed opacity-70',
                ]"
              >
                <span
                  class="absolute top-1 h-4 w-4 rounded-full bg-gray-800 dark:bg-gray-100 shadow-md transition-all duration-200"
                  :class="isLockedOut ? 'right-1' : 'left-1'"
                />
              </button>
            </div>

            <FormField
              label="Public ID"
              type="text"
              :model-value="user?.PublicId"
              :disabled="true"
            />
          </div>
        </form>
      </Card>
    </div>
  </DashboardLayout>
</template>
