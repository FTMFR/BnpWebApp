<script setup lang="ts">
import BaseButton from '@/design-system/atoms/BaseButton.vue'
import BaseIcon from '@/design-system/atoms/BaseIcon.vue'
import CustomLoader from '@/design-system/atoms/CustomLoader.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useAuth } from '@/shared/composables/useAuth'
import { useUserInfo, type UserInfo } from '@/shared/composables/useUserInfo'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { AxiosError } from 'axios'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { z } from 'zod'

const MAX_PROFILE_IMAGE_SIZE_MB = 5
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

const MOBILE_REGEX = /^09\d{9}$/

const updateUserSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است').trim(),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است').trim(),
  email: z.union([z.string().email('آدرس ایمیل معتبر نیست'), z.literal('')]).optional(),
  phone: z.union([z.string(), z.literal('')]).optional(),
  mobileNumber: z
    .string()
    .min(1, 'شماره موبایل الزامی است')
    .regex(MOBILE_REGEX, 'شماره موبایل معتبر نیست (مثال: 09123456789)')
    .trim(),
})

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'پروفایل من', href: '/profile' },
]

const { userInfo } = useUserInfo()
const dynamicUserInfo = computed<UserInfo>(() => userInfo.value)
const toastStore = useToastStore()
const isEditable = ref(false)
const isSubmitting = ref(false)
const authStore = useAuthStore()
const { publicId } = useAuth()

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  mobileNumber: '',
})

const errors = reactive<Record<string, string>>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  mobileNumber: '',
})

function syncFormFromUser(info: UserInfo) {
  formData.firstName = info.firstName
  formData.lastName = info.lastName
  formData.email = info.email ?? ''
  formData.phone = info.phone ?? ''
  formData.mobileNumber = info.mobileNumber
}

function clearErrors() {
  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''
  errors.phone = ''
  errors.mobileNumber = ''
}

function validate(): boolean {
  clearErrors()
  const result = updateUserSchema.safeParse({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    mobileNumber: formData.mobileNumber,
  })
  if (result.success) return true
  result.error.issues.forEach((issue) => {
    const path = issue.path[0] as string
    if (path in errors) errors[path] = issue.message
  })
  return false
}

const toggleEdit = () => {
  if (isEditable.value && dynamicUserInfo.value) {
    syncFormFromUser(dynamicUserInfo.value)
    clearErrors()
  }
  isEditable.value = !isEditable.value
}

const handleSubmit = async () => {
  if (!validate()) return
  const id = publicId.value
  if (!id) return
  isSubmitting.value = true
  try {
    const body = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email ?? '',
      phone: formData.phone ?? '',
      mobileNumber: formData.mobileNumber,
    }
    await apiClient.put(endpoints.users.byId(id), body)
    if (authStore.user) {
      authStore.user = {
        ...authStore.user,
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email ?? '',
        Phone: formData.phone ?? '',
        MobileNumber: formData.mobileNumber,
      }
    }
    toastStore.showToast('اطلاعات با موفقیت آپدیت شد.', 'success', 5000)
    isEditable.value = false
  } catch (error) {
    const msg =
      error instanceof AxiosError ? error.response?.data?.message : 'خطا در بروزرسانی کاربر'
    toastStore.showToast(msg, 'error', 5000)
  } finally {
    isSubmitting.value = false
  }
}

watch(
  dynamicUserInfo,
  (info) => {
    if (info && !isEditable.value) syncFormFromUser(info)
  },
  { immediate: true },
)

// ---------- Profile picture ----------
const profilePictureUrl = ref<string | null>(null)
const profilePictureLoading = ref(false)
const profilePictureUploading = ref(false)
const profilePictureDeleting = ref(false)
const profilePictureError = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

function revokeProfilePictureUrl() {
  if (profilePictureUrl.value) {
    URL.revokeObjectURL(profilePictureUrl.value)
    profilePictureUrl.value = null
  }
}

async function fetchProfilePicture() {
  const id = publicId.value
  if (!id) return
  profilePictureLoading.value = true
  profilePictureError.value = null
  revokeProfilePictureUrl()
  try {
    const response = await apiClient.get<Blob>(endpoints.users.profilePicture(id), {
      responseType: 'blob',
    })
    if (response.data && response.data.size > 0) {
      profilePictureUrl.value = URL.createObjectURL(response.data)
    }
  } catch (err) {
    const status = err instanceof AxiosError ? err.response?.status : null
    if (status !== 404) {
      profilePictureError.value = 'بارگذاری تصویر پروفایل ناموفق بود.'
    }
  } finally {
    profilePictureLoading.value = false
  }
}

function getFileExtension(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i).toLowerCase() : ''
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const ext = getFileExtension(file.name)
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    toastStore.showToast(
      `فرمت مجاز: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
      'error',
    )
    return
  }
  const maxBytes = MAX_PROFILE_IMAGE_SIZE_MB * 1024 * 1024
  if (file.size > maxBytes) {
    toastStore.showToast(
      `حداکثر حجم تصویر: ${MAX_PROFILE_IMAGE_SIZE_MB} مگابایت`,
      'error',
    )
    return
  }
  uploadProfilePicture(file)
}

async function uploadProfilePicture(file: File) {
  const id = publicId.value
  if (!id) return
  profilePictureUploading.value = true
  profilePictureError.value = null
  try {
    const formData = new FormData()
    formData.append('file', file)
    await apiClient.post(endpoints.users.profilePicture(id), formData)
    toastStore.showToast('تصویر پروفایل با موفقیت آپلود شد.', 'success')
    await fetchProfilePicture()
  } catch (err) {
    const msg =
      err instanceof AxiosError && err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String((err.response.data as { message?: string }).message)
        : 'آپلود تصویر ناموفق بود.'
    toastStore.showToast(msg, 'error')
  } finally {
    profilePictureUploading.value = false
  }
}

async function deleteProfilePicture() {
  const id = publicId.value
  if (!id) return
  profilePictureDeleting.value = true
  profilePictureError.value = null
  try {
    await apiClient.delete(endpoints.users.profilePicture(id))
    revokeProfilePictureUrl()
    toastStore.showToast('تصویر پروفایل حذف شد.', 'success')
  } catch (err) {
    toastStore.showToast('حذف تصویر ناموفق بود.', 'error')
  } finally {
    profilePictureDeleting.value = false
  }
}

onMounted(() => {
  if (publicId.value) fetchProfilePicture()
})
watch(publicId, (id) => {
  if (id) fetchProfilePicture()
  else revokeProfilePictureUrl()
})
onUnmounted(() => {
  revokeProfilePictureUrl()
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

      <Card title="پروفایل من" variant="elevated" padding="none">
        <template #header>
          <div class="p-4 sm:p-6">
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
            >
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
                  {{ isSubmitting ? 'در حال بروزرسانی' : 'ثبت تغییرات' }}
                </BaseButton>
              </div>
            </div>
          </div>
        </template>

        <form @submit.prevent="handleSubmit" class="p-4 sm:p-6 w-full space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              :model-value="dynamicUserInfo.userName"
              label="نام کاربری"
              type="text"
              :disabled="true"
              class="opacity-75"
            />

            <FormField
              v-model="formData.firstName"
              label="نام"
              type="text"
              :disabled="!isEditable"
              :error="!!errors.firstName"
              :error-message="errors.firstName"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              v-model="formData.lastName"
              label="نام خانوادگی"
              type="text"
              :disabled="!isEditable"
              :error="!!errors.lastName"
              :error-message="errors.lastName"
            />

            <FormField
              v-model="formData.email"
              label="ایمیل"
              type="text"
              :disabled="!isEditable"
              :error="!!errors.email"
              :error-message="errors.email"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              v-model="formData.phone"
              label="تلفن همراه"
              type="tel"
              :disabled="!isEditable"
              :error="!!errors.phone"
              :error-message="errors.phone"
            />

            <FormField
              v-model="formData.mobileNumber"
              label="تلفن ثابت"
              type="tel"
              :disabled="!isEditable"
              :error="!!errors.mobileNumber"
              :error-message="errors.mobileNumber"
            />
          </div>

          <!-- تصویر پروفایل -->
          <div class="border-t border-border-default pt-6 mt-6">
            <h3 class="text-sm font-semibold text-foreground mb-3">تصویر پروفایل</h3>
            <p class="text-xs text-muted-foreground mb-4">
              فرمت‌های مجاز: JPG, JPEG, PNG, GIF, WEBP. حداکثر حجم: {{ MAX_PROFILE_IMAGE_SIZE_MB }} مگابایت.
            </p>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                class="w-24 h-24 rounded-full overflow-hidden bg-muted/50 border-2 border-border-default flex items-center justify-center shrink-0"
              >
                <CustomLoader v-if="profilePictureLoading" size="sm" />
                <img
                  v-else-if="profilePictureUrl"
                  :src="profilePictureUrl"
                  alt="تصویر پروفایل"
                  class="w-full h-full object-cover"
                />
                <BaseIcon
                  v-else
                  name="User"
                  :size="40"
                  class="text-muted-foreground"
                />
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  class="hidden"
                  @change="onFileChange"
                />
                <BaseButton
                  variant="outline"
                  size="sm"
                  :disabled="profilePictureUploading || profilePictureLoading"
                  @click="fileInputRef?.click()"
                >
                  <BaseIcon v-if="profilePictureUploading" name="Loader2" :size="16" class="animate-spin" />
                  <BaseIcon v-else name="Upload" :size="16" />
                  {{ profilePictureUploading ? 'در حال آپلود...' : 'انتخاب و آپلود تصویر' }}
                </BaseButton>
                <BaseButton
                  v-if="profilePictureUrl && !profilePictureLoading"
                  variant="outline"
                  size="sm"
                  class="text-danger hover:bg-danger-50"
                  :disabled="profilePictureDeleting"
                  @click="deleteProfilePicture"
                >
                  {{ profilePictureDeleting ? 'در حال حذف...' : 'حذف تصویر' }}
                </BaseButton>
              </div>
            </div>
            <p v-if="profilePictureError" class="text-sm text-danger mt-2">{{ profilePictureError }}</p>
          </div>
        </form>
      </Card>
    </div>
  </DashboardLayout>
</template>
