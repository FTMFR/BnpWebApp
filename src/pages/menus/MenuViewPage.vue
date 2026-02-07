<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { BaseButton, CustomLoader } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import FormField from '@/design-system/molecules/FormField.vue'
import FormSelect from '@/design-system/molecules/FormSelect.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import Card from '@/design-system/molecules/Card.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import type { ApiMenuItem } from '@/shared/api/types'
import type { FormSelectOption } from '@/design-system/molecules'

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

const route = useRoute()
const menuId = route.params.id as string

const menu = ref<ApiMenuItem>()
const isLoading = ref(false)
const isEditable = ref(false)
const isSubmitting = ref(false)
const toastStore = useToastStore()
/** Sentinel for "no parent" so the select shows "بدون منوی والد" instead of the placeholder */
const NO_PARENT_VALUE = '__none__'
const parentMenuOptions = ref<FormSelectOption[]>([])
const isLoadingParentMenus = ref(false)
const titleError = ref<string | undefined>(undefined)

const formData = reactive<{ Title: string; Path: string; ParentPublicId: string | null }>({
  Title: '',
  Path: '',
  ParentPublicId: null,
})

const fetchMenuDetails = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get<ApiMenuItem>(endpoints.menu.byId(menuId))
    menu.value = response.data
    formData.Title = response.data.Title
    formData.Path = response.data.Path ?? ''
    formData.ParentPublicId = response.data.ParentPublicId ?? null
  } catch (error) {
    console.error('Failed to fetch menu:', error)
    toastStore.showToast('خطا در دریافت اطلاعات منو', 'error')
  } finally {
    isLoading.value = false
  }
}

const fetchParentMenus = async () => {
  isLoadingParentMenus.value = true
  try {
    const response = await apiClient.get<MenuNode[]>(endpoints.menu.list)
    const flat = Array.isArray(response.data) ? flattenMenuNodes(response.data) : []
    const options: FormSelectOption[] = [
      { value: NO_PARENT_VALUE, label: 'بدون منوی والد' },
      ...flat
        .filter((m) => m.PublicId !== menuId)
        .map((m) => ({ value: m.PublicId, label: m.Title })),
    ]
    parentMenuOptions.value = options
  } catch (error) {
    console.error('Error fetching menus:', error)
    toastStore.showToast('خطا در دریافت لیست منوها', 'error')
  } finally {
    isLoadingParentMenus.value = false
  }
}

const parentSelectValue = computed(() =>
  formData.ParentPublicId == null ? NO_PARENT_VALUE : formData.ParentPublicId,
)

const toggleEdit = () => {
  isEditable.value = true
}

/** Discard unsaved changes and exit edit mode; resets form to last API state. */
const cancelEdit = () => {
  if (menu.value) {
    formData.Title = menu.value.Title
    formData.Path = menu.value.Path ?? ''
    formData.ParentPublicId = menu.value.ParentPublicId ?? null
  }
  titleError.value = undefined
  isEditable.value = false
}

const handleParentChange = (value: string) => {
  formData.ParentPublicId = value === NO_PARENT_VALUE ? null : value
}

const handleTitleInput = (val: string | number | boolean) => {
  formData.Title = String(val)
  titleError.value = undefined
}

const handleSubmit = async () => {
  const trimmedTitle = formData.Title?.trim()
  if (!trimmedTitle) {
    titleError.value = 'عنوان منو نمی‌تواند خالی باشد'
    return
  }
  titleError.value = undefined
  isSubmitting.value = true
  try {
    await apiClient.put(endpoints.menu.update(menuId), {
      Title: trimmedTitle,
    })
    toastStore.showToast('اطلاعات منو با موفقیت بروزرسانی شد', 'success')
    await fetchMenuDetails()
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
  { label: 'منوها', href: '/menu/list' },
  { label: menu.value?.Title || 'جزئیات منو' },
])

onMounted(async () => {
  await fetchMenuDetails()
  await fetchParentMenus()
})
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <!-- Breadcrumb -->
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card
        title="جزئیات منو"
        backRoute="/menu/list"
        variant="elevated"
        padding="none"
        class="min-w-0"
      >
        <template #header>
          <div class="p-4 sm:p-6">
            <div
              class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div class="flex gap-3">
                <BaseButton v-if="!isEditable" variant="outline" @click="toggleEdit">
                  اصلاح
                </BaseButton>

                <BaseButton v-else variant="outline" @click="cancelEdit" :disabled="isSubmitting">
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

        <form
          v-else
          @submit.prevent="handleSubmit"
          class="p-4 sm:p-6 w-full space-y-6 min-w-0 break-words"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0">
            <FormField
              :model-value="formData.Title"
              @update:model-value="handleTitleInput"
              label="عنوان منو"
              required
              type="text"
              placeholder="عنوان منو را وارد کنید"
              :disabled="!isEditable || isSubmitting"
              :error-message="titleError"
            />
            <FormField
              :model-value="menu?.Path ?? ''"
              label="مسیر"
              type="text"
              placeholder="مسیر منو را وارد کنید"
              readonly
              disabled
            />
            <FormSelect
              label="منوی والد"
              placeholder="انتخاب کنید"
              :model-value="parentSelectValue"
              :options="parentMenuOptions"
              :is-loading="isLoadingParentMenus"
              disabled
            />
          </div>
        </form>
      </Card>
    </div>
  </DashboardLayout>
</template>
