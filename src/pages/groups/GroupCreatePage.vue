<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { FormCard, Breadcrumb, FormSelect } from '@/design-system/molecules'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { CreateGroupRequest } from '@/shared/api/types'
import { AxiosError } from 'axios'
import { useToastStore } from '@/stores/toast'
import { useForm } from '@/shared/validation/useForm'
import {
  createGroupInputSchema,
  type CreateGroupFormInput,
} from '@/shared/validation/schemas/group'
import FormField from '@/design-system/molecules/FormField.vue'
import BaseButton from '@/design-system/atoms/BaseButton.vue'

const router = useRouter()
const toastStore = useToastStore()
const isLoadingGrps = ref(false)

const groups = ref([])

// Export the function explicitly
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

// Initialize form with useForm composable
// We use CreateGroupFormInput for the form state (strings)
// The schema will transform it to the final type during validation
const {
  values: formData,
  errors,
  isSubmitting,
  touched,
  handleSubmit,
  setFieldValue,
  reset: resetForm,
} = useForm<CreateGroupFormInput>({
  schema: createGroupInputSchema,
  initialValues: {
    Title: '',
    ParentPublicId: '',
    Description: '',
  },
  onSubmit: async () => {
    try {
      // Parse the form values through the schema to get transformed values
      // const parsed = createGroupSchema.parse(values)
      const groupData: CreateGroupRequest = {
        Title: formData.Title,
        ParentPublicId: formData.ParentPublicId,
        Description: formData.Description ?? formData.Title,
      }
      await apiClient.post(endpoints.groups.create, groupData)
      toastStore.showToast('گروه با موفقیت ثبت شد', 'success', 5000)

      resetForm()

      setTimeout(() => {
        router.push('/grp/list')
      }, 1000)
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : 'خطا در ثبت گروه'
      toastStore.showToast(errorMessage, 'error', 5000)
      throw error // Re-throw to prevent form reset
    }
  },
})

watch(
  () => formData.Title,
  (title) => {
    formData.Description = title
  },
  { immediate: true },
)

const handleCancel = () => {
  router.push('/grp/list')
}

const handleInputChange = (field: string, value: string | number | boolean) => {
  setFieldValue(field, value)
}

const handleSelectChange = (field: keyof CreateGroupFormInput, value: string | number) => {
  setFieldValue(field, value)
}

onMounted(async () => {
  await fetchGroups()
})

const handleSearch = (query: string) => {
  console.log('Global search:', query)
  // TODO: Implement global search
}

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'گروه‌ها', href: '/grp/list' },
  { label: 'تعریف گروه جدید' },
]
</script>

<template>
  <DashboardLayout @search="handleSearch">
    <div class="space-y-4 sm:space-y-6">
      <!-- Breadcrumb -->
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <!-- Form Card -->
      <FormCard
        title="تعریف گروه جدید"
        description="لطفا تمام فیلدهای مورد نیاز را تکمیل کنید"
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
        @cancel="handleCancel"
      >
        <template #header> </template>
        <!-- Form Grid - 2 columns on desktop, 1 on mobile -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Title -->
          <FormField
            type="text"
            label="عنوان گروه"
            placeholder="عنوان گروه را وارد کنید"
            :model-value="formData.Title"
            @update:model-value="(val) => handleInputChange('Title', val)"
            :error-message="touched.Title ? errors.Title : undefined"
            :required="true"
            :disabled="isSubmitting"
          />

          <FormSelect
            label="گروه والد"
            placeholder="گروه والد را انتخاب کنید"
            v-model="formData.ParentPublicId"
            :error-message="errors.ParentPublicId"
            :options="groups"
            @update:model-value="(val) => handleSelectChange('ParentPublicId', val)"
            :is-loading="isLoadingGrps"
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
              ثبت گروه
            </BaseButton>
          </div>
        </template>
      </FormCard>
    </div>
  </DashboardLayout>
</template>
