<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { BaseButton } from '@/design-system/atoms'
import { FormCard, FormSelect, Breadcrumb, FormField } from '@/design-system/molecules'
import type { FormSelectOption } from '@/design-system/molecules'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { CreateMenuRequest } from '@/shared/api/types'
import { AxiosError } from 'axios'
import { useToastStore } from '@/stores/toast'
import { useForm } from '@/shared/validation/useForm'
import { createMenuSchema, type CreateMenuFormInput } from '@/shared/validation/schemas/menu'

const router = useRouter()
const toastStore = useToastStore()

/** Menu list API can return a tree; flatten to { PublicId, Title } for parent dropdown */
interface MenuNode {
  PublicId: string
  Title: string
  Children?: MenuNode[]
}

function flattenMenuNodes(
  nodes: MenuNode[],
  result: { PublicId: string; Title: string }[] = [],
): { PublicId: string; Title: string }[] {
  for (const node of nodes) {
    result.push({ PublicId: node.PublicId, Title: node.Title })
    if (node.Children?.length) {
      flattenMenuNodes(node.Children, result)
    }
  }
  return result
}

/** Sentinel for "no parent" so the select shows "بدون منوی والد" instead of the placeholder */
const NO_PARENT_VALUE = '__none__'

onMounted(async () => {
  await fetchParentMenus()
})

const parentMenuOptions = ref<FormSelectOption[]>([])
const isLoadingParentMenus = ref(false)

const parentSelectValue = computed(() =>
  formData.ParentPublicId == null ? NO_PARENT_VALUE : formData.ParentPublicId,
)

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
    ParentPublicId: null,
  },
  onSubmit: async (values) => {
    try {
      const parsed = createMenuSchema.parse(values)
      const menuData: CreateMenuRequest = {
        Title: parsed.Title,
        Path: parsed.Path,
        ParentPublicId: parsed.ParentPublicId ?? undefined,
      }
      await apiClient.post(endpoints.menu.create, menuData)
      toastStore.showToast('منو با موفقیت ثبت شد', 'success', 5000)

      resetForm()

      setTimeout(() => {
        router.push('/menu/list')
      }, 1000)
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : 'خطا در ثبت منو'
      toastStore.showToast(errorMessage, 'error', 5000)
      throw error
    }
  },
})

const fetchParentMenus = async () => {
  isLoadingParentMenus.value = true
  try {
    const response = await apiClient.get<MenuNode[]>(endpoints.menu.list)
    const flat = Array.isArray(response.data) ? flattenMenuNodes(response.data) : []
    parentMenuOptions.value = [
      { value: NO_PARENT_VALUE, label: 'بدون منوی والد' },
      ...flat.map((menu) => ({
        value: menu.PublicId,
        label: menu.Title,
      })),
    ]
  } catch (error) {
    console.error('Error fetching menus:', error)
    toastStore.showToast('خطا در دریافت لیست منوها', 'error', 5000)
  } finally {
    isLoadingParentMenus.value = false
  }
}

const handleInputChange = (field: keyof CreateMenuFormInput, value: string | number | boolean) => {
  setFieldValue(field, value)
}

const handleSelectChange = (field: keyof CreateMenuFormInput, value: string | number | boolean) => {
  if (field === 'ParentPublicId') {
    setFieldValue(field, value === NO_PARENT_VALUE ? null : (value as string))
    return
  }
  setFieldValue(field, value)
}

const handleSubmit = async () => {
  await formHandleSubmit()
}

const handleCancel = () => {
  router.push('/menu/list')
}

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'منوها', href: '/menu/list' },
  { label: 'تعریف منو جدید' },
]
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6">
      <!-- Breadcrumb -->
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <!-- Form Card -->
      <FormCard
        route-back="/menu/list"
        title="تعریف منو جدید"
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
            @update:model-value="(val) => handleInputChange('Title', val)"
            :error-message="touched.Title ? errors.Title : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <!-- ParentPublicId (parent menu, not group) -->
          <FormSelect
            label="منوی والد"
            placeholder="انتخاب کنید"
            :model-value="parentSelectValue"
            :options="parentMenuOptions"
            :is-loading="isLoadingParentMenus"
            @update:model-value="(val) => handleSelectChange('ParentPublicId', val)"
            :error-message="touched.ParentPublicId ? errors.ParentPublicId : undefined"
            :disabled="isSubmitting || isLoadingParentMenus"
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
              ثبت منو
            </BaseButton>
          </div>
        </template>
      </FormCard>
    </div>
  </DashboardLayout>
</template>
