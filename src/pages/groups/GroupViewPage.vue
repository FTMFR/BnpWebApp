<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { BaseButton, CustomLoader } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import FormField from '@/design-system/molecules/FormField.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import Card from '@/design-system/molecules/Card.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import type { Group } from './GroupsListPage.vue'
import FormSelect from '@/design-system/molecules/FormSelect.vue'

const route = useRoute()

const grpId = route.params.id as string

const user = ref<Group>()
const isLoading = ref(false)
const isEditable = ref(false)
const isSubmitting = ref(false)
const toastStore = useToastStore()
const isLoadingGrps = ref(false)
const hasShownAdminToast = ref(false)
const groups = ref([])

const fetchGroups = async () => {
  isLoadingGrps.value = true
  try {
    const response = await apiClient.get(endpoints.groups.list)
    groups.value = response.data.map((group: any) => ({
      value: group.PublicId,
      label: group.Title,
    }))
  } catch (error) {
    console.error('Error fetching groups:', error)
  } finally {
    isLoadingGrps.value = false
  }
}

// const handleSelectChange = (field: keyof UploadGroupFormInput, value: string | number) => {
//   setFieldValue(field, value)
// }

const isSystemAdmin = computed(() => {
  return (
    user.value?.Title === 'Admin' || (user.value?.Title === 'admin' && user.value?.GrpCode === 1)
  )
})

const formData = reactive<{
  Title: string
  ParentPublicId: string | null
}>({
  Title: '',
  ParentPublicId: null,
})

const fetchGroupDetails = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get<Group>(endpoints.groups.byId(grpId))
    user.value = response.data

    formData.Title = response.data.Title
    formData.ParentPublicId = response.data?.ParentPublicId ?? null

    if (isSystemAdmin.value && !hasShownAdminToast.value) {
      toastStore.showToast('نمیتوانید اطلاعات ادمین رو ویرایش کنید', 'error', 5000)
      hasShownAdminToast.value = true
    }
  } catch (error) {
    console.error('Failed to fetch grp:', error)
    toastStore.showToast('خطا در دریافت اطلاعات گروه', 'error')
  } finally {
    isLoading.value = false
  }
}

const toggleEdit = () => {
  if (isSystemAdmin.value) {
    toastStore.showToast('نمیتوانید اطلاعات ادمین رو ویرایش کنید', 'error', 3000)
    return
  }
  isEditable.value = !isEditable.value
  if (!isEditable.value && user.value) {
    formData.Title = user.value.Title
    formData.ParentPublicId = user.value.ParentPublicId
  }
}

// const isTogglingActive = ref(false)

onMounted(() => {
  fetchGroupDetails()
  fetchGroups()
})

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await apiClient.put(endpoints.groups.update(grpId), formData)

    toastStore.showToast('اطلاعات گروه با موفقیت بروزرسانی شد', 'success')
    await fetchGroupDetails()
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
  { label: 'گروه‌ها', href: '/grp/list' },
  { label: user.value?.Title || 'جزئیات گروه' },
])
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6">
      <!-- Breadcrumb -->
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card title="جزئیات گروه" backRoute="/grp/list" variant="elevated" padding="none">
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
                  :disabled="isSystemAdmin"
                  class="border-2 border-primary-500 text-primary-600"
                  :class="{ 'opacity-50 cursor-not-allowed': isSystemAdmin }"
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

        <form v-else @submit.prevent="handleSubmit" class="p-4 sm:p-6 w-full space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              v-model="formData.Title"
              label="نام گروه"
              required
              type="text"
              :disabled="!isEditable"
            />

            <FormSelect
              label="گروه والد"
              placeholder="گروه والد جدید را انتخاب کنید"
              v-model="formData.ParentPublicId"
              :options="groups"
              @update:model-value="
                (val) => {
                  formData.ParentPublicId = val || null
                }
              "
              :is-loading="isLoadingGrps"
              :disabled="isSubmitting || !isEditable"
            />
          </div>
        </form>
      </Card>
    </div>
  </DashboardLayout>
</template>
