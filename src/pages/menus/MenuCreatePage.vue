<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { CustomLoader } from '@/design-system/atoms'
import { FormCard, FormSelect, Breadcrumb, FormField } from '@/design-system/molecules'
import type { FormSelectOption } from '@/design-system/molecules'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { ApiMenuItem, CreateMenuRequest } from '@/shared/api/types'
import { AxiosError } from 'axios'
import { useToastStore } from '@/stores/toast'
import { useAuth } from '@/shared/composables/useAuth'
import { useForm } from '@/shared/validation/useForm'
import { createMenuSchema, type CreateMenuFormInput } from '@/shared/validation/schemas/menu'

const router = useRouter()
const toastStore = useToastStore()
const { fetchUser, isLoadingUser } = useAuth()

// Fetch user info on mount
onMounted(async () => {
  fetchUser()
  await fetchMenus()
})

const menus = ref<FormSelectOption[]>([])
const isLoadingMenus = ref(false)

// Initialize form with useForm composable
const {
  values: formData,
  errors,
  isSubmitting,
  touched,
  handleSubmit: formHandleSubmit,
  setFieldValue,
  reset: resetForm,
} = useForm<CreateMenuFormInput>({
  schema: createMenuSchema,
  initialValues: {
    Title: '',
    Path: '',
    ParentPublicId: '',
  },
  onSubmit: async (values) => {
    try {
      // Parse the form values through the schema to get transformed values
      const parsed = createMenuSchema.parse(values)
      const menuData: CreateMenuRequest = {
        Title: parsed.Title,
        Path: parsed.Path,
        ParentPublicId: parsed.ParentPublicId,
      }
      await apiClient.post(endpoints.menu.create, menuData)
      toastStore.showToast('منو با موفقیت ثبت شد', 'success', 5000)

      // Reset form after successful submission
      resetForm()

      // Navigate back to menus list after a short delay
      setTimeout(() => {
        router.push('/menus/list')
      }, 1000)
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : 'خطا در ثبت منو'
      toastStore.showToast(errorMessage, 'error', 5000)
      throw error // Re-throw to prevent form reset
    }
  },
})

const fetchMenus = async () => {
  isLoadingMenus.value = true
  try {
    const response = await apiClient.get<ApiMenuItem[]>(endpoints.menu.list)
    // Flatten the menu tree structure
    const flattenMenus = (items: ApiMenuItem[]): ApiMenuItem[] => {
      const result: ApiMenuItem[] = []
      items.forEach((item) => {
        result.push(item)
        if (item.Children && item.Children.length > 0) {
          result.push(...flattenMenus(item.Children))
        }
      })
      return result
    }

    const flatMenus = flattenMenus(response.data)
    menus.value = [
      { value: '', label: 'بدون منوی والد' },
      ...flatMenus.map((menu: ApiMenuItem) => ({
        value: menu.PublicId,
        label: menu.Title,
      })),
    ]
  } catch (error) {
    console.error('Error fetching menus:', error)
    toastStore.showToast('خطا در دریافت لیست منوها', 'error', 5000)
  } finally {
    isLoadingMenus.value = false
  }
}

const handleInputChange = (field: keyof CreateMenuFormInput) => (value: string) => {
  setFieldValue(field, value)
}

const handleSubmit = async () => {
  await formHandleSubmit()
}

const handleCancel = () => {
  router.push('/menus/list')
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
  { label: 'منوها', href: '/menus/list' },
  { label: 'تعریف منو جدید' },
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

      <!-- Form Card -->
      <FormCard
        title="تعریف منو جدید"
        description="لطفا تمام فیلدهای مورد نیاز را تکمیل کنید"
        :is-submitting="isSubmitting"
        submit-label="ثبت منو"
        cancel-label="خروج"
        @submit="handleSubmit"
        @cancel="handleCancel"
      >
        <!-- Form Grid - 2 columns on desktop, 1 on mobile -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Title -->
          <FormField
            type="text"
            label="عنوان منو"
            placeholder="عنوان منو را وارد کنید"
            :model-value="formData.Title"
            @update:model-value="handleInputChange('Title')"
            :error-message="touched.Title ? errors.Title : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <!-- Path -->
          <FormField
            label="مسیر"
            type="text"
            placeholder="مسیر منو را وارد کنید"
            :model-value="formData.Path"
            @update:model-value="handleInputChange('Path')"
            :error-message="touched.Path ? errors.Path : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <!-- ParentPublicId -->
          <FormSelect
            label="منوی والد"
            placeholder="انتخاب کنید"
            :model-value="formData.ParentPublicId || ''"
            :options="menus"
            :is-loading="isLoadingMenus"
            @update:model-value="handleInputChange('ParentPublicId')"
            :error-message="touched.ParentPublicId ? errors.ParentPublicId : undefined"
            :disabled="isSubmitting || isLoadingMenus"
          />
        </div>
      </FormCard>
    </div>
  </DashboardLayout>
</template>
