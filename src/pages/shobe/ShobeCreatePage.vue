<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { Breadcrumb, Card } from '@/design-system/molecules'
import FormField from '@/design-system/molecules/FormField.vue'
import { BaseButton, CustomLoader } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import type { Shobe } from './ShobeListPage.vue'

const router = useRouter()
const toastStore = useToastStore()
const isSubmitting = ref(false)
const isLoadingShobe = ref(false)
const parentOptions = ref<Array<{ value: string; label: string }>>([{ value: '', label: 'بدون شعبه والد' }])

const formData = reactive({
  Title: '',
  ShobeCode: 0,
  Address: '',
  Phone: '',
  PostalCode: '',
  ParentPublicId: '' as string | null,
  IsActive: true,
  Description: '',
  DisplayOrder: 0,
})

const fetchShobeList = async () => {
  isLoadingShobe.value = true
  try {
    const res = await apiClient.get<Shobe[]>(endpoints.shobe.list)
    parentOptions.value = [
      { value: '', label: 'بدون شعبه والد' },
      ...(res.data ?? []).map((s) => ({ value: s.PublicId, label: s.Title })),
    ]
  } catch {
    console.error('Failed to fetch shobe list')
  } finally {
    isLoadingShobe.value = false
  }
}

/** کد پستی اختیاری است؛ در صورت ورود باید دقیقاً ۱۰ رقم عددی باشد. */
function validatePostalCode(value: string): boolean {
  const trimmed = value?.trim() ?? ''
  return trimmed === '' || /^\d{10}$/.test(trimmed)
}

const handleSubmit = async () => {
  if (!formData.Title?.trim()) {
    toastStore.showToast('عنوان شعبه الزامی است', 'error')
    return
  }
  if (!validatePostalCode(formData.PostalCode)) {
    toastStore.showToast('کد پستی باید ۱۰ رقم عددی باشد', 'error')
    return
  }
  isSubmitting.value = true
  try {
    const payload = {
      Title: formData.Title.trim(),
      ShobeCode: formData.ShobeCode,
      Address: formData.Address || null,
      Phone: formData.Phone || null,
      PostalCode: formData.PostalCode || null,
      ParentPublicId: formData.ParentPublicId || null,
      IsActive: formData.IsActive,
      Description: formData.Description || null,
      DisplayOrder: formData.DisplayOrder,
    }
    await apiClient.post(endpoints.shobe.create, payload)
    toastStore.showToast('شعبه با موفقیت ایجاد شد', 'success')
    router.push('/shobe/list')
  } catch (err) {
    console.error('Create shobe failed:', err)
    toastStore.showToast('خطا در ایجاد شعبه', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push('/shobe/list')
}

onMounted(() => {
  fetchShobeList()
})

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'لیست شعب', href: '/shobe/list' },
  { label: 'ایجاد شعبه' },
]
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card
        variant="elevated"
        padding="none"
        class="min-w-0"
        title="ایجاد شعبه جدید"
        description="فیلدهای مورد نیاز را تکمیل کنید."
      >
        <div class="p-4 sm:p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField v-model="formData.Title" label="عنوان" type="text" required />
            <FormField v-model.number="formData.ShobeCode" label="کد شعبه" type="number" class="input-number-no-spinner" />
            <FormField v-model="formData.Address" label="آدرس" type="text" class="md:col-span-2" />
            <FormField v-model="formData.Phone" label="تلفن" type="text" />
            <FormField
              v-model="formData.PostalCode"
              label="کد پستی"
              type="text"
              :maxlength="10"
            />
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-foreground">شعبه والد</label>
              <select
                v-model="formData.ParentPublicId"
                class="rounded-lg border border-border-default bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                :disabled="isLoadingShobe"
              >
                <option
                  v-for="opt in parentOptions"
                  :key="opt.value"
                  :value="opt.value || null"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <FormField v-model.number="formData.DisplayOrder" label="ترتیب نمایش" type="number" />
            <div class="flex items-center gap-2 md:col-span-2">
              <input
                v-model="formData.IsActive"
                type="checkbox"
                id="shobe-is-active"
                class="rounded border-border-default"
              />
              <label for="shobe-is-active" class="text-sm text-foreground">فعال</label>
            </div>
            <FormField
              v-model="formData.Description"
              label="توضیحات"
              type="textarea"
              class="md:col-span-2"
            />
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <BaseButton type="button" variant="outline" :disabled="isSubmitting" @click="handleCancel">
              انصراف
            </BaseButton>
            <BaseButton type="button" :disabled="isSubmitting" class="text-white" @click="handleSubmit">
              {{ isSubmitting ? 'در حال ثبت...' : 'ثبت شعبه' }}
            </BaseButton>
          </div>
        </div>
      </Card>
    </div>
  </DashboardLayout>
</template>
