<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BaseButton, CustomLoader } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import FormField from '@/design-system/molecules/FormField.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import Card from '@/design-system/molecules/Card.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import type { Shobe } from './ShobeListPage.vue'

const route = useRoute()
const router = useRouter()
const shobeId = route.params.id as string

const shobe = ref<Shobe | null>(null)
const isLoading = ref(false)
const isEditable = ref(false)
const isSubmitting = ref(false)
const toastStore = useToastStore()
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
      ...(res.data ?? []).filter((s) => s.PublicId !== shobeId).map((s) => ({ value: s.PublicId, label: s.Title })),
    ]
  } catch {
    console.error('Failed to fetch shobe list')
  } finally {
    isLoadingShobe.value = false
  }
}

const fetchShobeDetails = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get<Shobe>(endpoints.shobe.byId(shobeId))
    shobe.value = response.data
    const d = response.data
    formData.Title = d.Title ?? ''
    formData.ShobeCode = d.ShobeCode ?? 0
    formData.Address = d.Address ?? ''
    formData.Phone = d.Phone ?? ''
    formData.PostalCode = d.PostalCode ?? ''
    formData.ParentPublicId = d.ParentPublicId ?? null
    formData.IsActive = d.IsActive ?? true
    formData.Description = d.Description ?? ''
    formData.DisplayOrder = d.DisplayOrder ?? 0
  } catch {
    toastStore.showToast('خطا در دریافت اطلاعات شعبه', 'error')
    router.push('/shobe/list')
  } finally {
    isLoading.value = false
  }
}

const toggleEdit = () => {
  isEditable.value = !isEditable.value
  if (!isEditable.value && shobe.value) {
    formData.Title = shobe.value.Title ?? ''
    formData.ShobeCode = shobe.value.ShobeCode ?? 0
    formData.Address = shobe.value.Address ?? ''
    formData.Phone = shobe.value.Phone ?? ''
    formData.PostalCode = shobe.value.PostalCode ?? ''
    formData.ParentPublicId = shobe.value.ParentPublicId ?? null
    formData.IsActive = shobe.value.IsActive ?? true
    formData.Description = shobe.value.Description ?? ''
    formData.DisplayOrder = shobe.value.DisplayOrder ?? 0
  }
}

/** کد پستی اختیاری است؛ در صورت ورود باید دقیقاً ۱۰ رقم عددی باشد. */
function validatePostalCode(value: string): boolean {
  const trimmed = value?.trim() ?? ''
  return trimmed === '' || /^\d{10}$/.test(trimmed)
}

const handleSubmit = async () => {
  if (!isCodeOneShobe.value && !validatePostalCode(formData.PostalCode)) {
    toastStore.showToast('کد پستی باید ۱۰ رقم عددی باشد', 'error')
    return
  }
  isSubmitting.value = true
  try {
    const payload = isCodeOneShobe.value
      ? { Title: formData.Title }
      : {
          Title: formData.Title,
          ShobeCode: formData.ShobeCode,
          Address: formData.Address || null,
          Phone: formData.Phone || null,
          PostalCode: formData.PostalCode || null,
          ParentPublicId: formData.ParentPublicId || null,
          IsActive: formData.IsActive,
          Description: formData.Description || null,
          DisplayOrder: formData.DisplayOrder,
        }
    await apiClient.put(endpoints.shobe.update(shobeId), payload)
    toastStore.showToast('اطلاعات شعبه با موفقیت به‌روزرسانی شد', 'success')
    await fetchShobeDetails()
    isEditable.value = false
  } catch {
    toastStore.showToast('خطا در به‌روزرسانی اطلاعات', 'error')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchShobeDetails()
  fetchShobeList()
})

/** شعبه با کد ۱ فقط عنوانش قابل ویرایش است و حذف ندارد. */
const isCodeOneShobe = computed(() => shobe.value?.ShobeCode === 1)

const breadcrumbItems = computed(() => [
  { label: 'خانه', href: '/dashboard' },
  { label: 'لیست شعب', href: '/shobe/list' },
  { label: shobe.value?.Title || 'جزئیات شعبه' },
])
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card
        variant="elevated"
        padding="none"
        class="min-w-0"
        title="جزئیات شعبه"
        back-route="/shobe/list"
      >
        <template #header>
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
        </template>

        <div v-if="isLoading" class="p-10 flex justify-center">
          <CustomLoader size="lg" />
        </div>

        <div
          v-else
          class="p-4 sm:p-6 w-full space-y-6 min-w-0 break-words"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0">
            <FormField
              v-model="formData.Title"
              label="عنوان"
              type="text"
              required
              :disabled="!isEditable"
            />
            <FormField
              v-model.number="formData.ShobeCode"
              label="کد شعبه"
              type="number"
              class="input-number-no-spinner"
              :disabled="!isEditable || isCodeOneShobe"
            />
            <FormField
              v-model="formData.Address"
              label="آدرس"
              type="text"
              class="md:col-span-2"
              :disabled="!isEditable || isCodeOneShobe"
            />
            <FormField
              v-model="formData.Phone"
              label="تلفن"
              type="text"
              :disabled="!isEditable || isCodeOneShobe"
            />
            <FormField
              v-model="formData.PostalCode"
              label="کد پستی"
              type="text"
              :maxlength="10"
              :disabled="!isEditable || isCodeOneShobe"
            />
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-foreground">شعبه والد</label>
              <select
                v-model="formData.ParentPublicId"
                class="rounded-lg border border-border-default bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                :disabled="!isEditable || isLoadingShobe || isCodeOneShobe"
              >
                <option v-for="opt in parentOptions" :key="opt.value" :value="opt.value || null">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <FormField
              v-model.number="formData.DisplayOrder"
              label="ترتیب نمایش"
              type="number"
              :disabled="!isEditable || isCodeOneShobe"
            />
            <div class="flex items-center gap-2 md:col-span-2">
              <input
                v-model="formData.IsActive"
                type="checkbox"
                id="shobe-is-active-edit"
                class="rounded border-border-default"
                :disabled="!isEditable || isCodeOneShobe"
              />
              <label for="shobe-is-active-edit" class="text-sm text-foreground">فعال</label>
            </div>
            <FormField
              v-model="formData.Description"
              label="توضیحات"
              type="textarea"
              class="md:col-span-2"
              :disabled="!isEditable || isCodeOneShobe"
            />
          </div>
        </div>
      </Card>
    </div>
  </DashboardLayout>
</template>
