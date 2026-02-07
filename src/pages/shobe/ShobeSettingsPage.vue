<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { Breadcrumb, Card, Modal } from '@/design-system/molecules'
import FormField from '@/design-system/molecules/FormField.vue'
import { BaseButton, BaseIcon, CustomLoader } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import type { Shobe } from './ShobeListPage.vue'

/** Minimal type for settings – align with backend ShobeSettingDto if needed */
export interface ShobeSettingDto {
  PublicId: string
  ShobePublicId?: string | null
  Key?: string | null
  Value?: string | null
  [key: string]: unknown
}

const router = useRouter()
const toastStore = useToastStore()
const settings = ref<ShobeSettingDto[]>([])
const shobeList = ref<Shobe[]>([])
const selectedShobePublicId = ref<string | null>(null)
const isLoading = ref(false)
const isLoadingShobe = ref(false)
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingId = ref<string | null>(null)
const isSaving = ref(false)
const form = ref({ Key: '', Value: '' })

const fetchShobeList = async () => {
  isLoadingShobe.value = true
  try {
    const res = await apiClient.get<Shobe[]>(endpoints.shobe.list)
    shobeList.value = res.data ?? []
  } catch {
    toastStore.showToast('خطا در دریافت لیست شعب', 'error')
  } finally {
    isLoadingShobe.value = false
  }
}

const fetchSettings = async () => {
  isLoading.value = true
  try {
    const params = selectedShobePublicId.value
      ? { shobePublicId: selectedShobePublicId.value }
      : {}
    const res = await apiClient.get<ShobeSettingDto[]>(endpoints.shobe.settings.list, { params })
    settings.value = Array.isArray(res.data) ? res.data : []
  } catch {
    toastStore.showToast('خطا در دریافت تنظیمات شعب', 'error')
    settings.value = []
  } finally {
    isLoading.value = false
  }
}

watch(selectedShobePublicId, () => {
  fetchSettings()
})

onMounted(() => {
  fetchShobeList()
  fetchSettings()
})

const openCreate = () => {
  modalMode.value = 'create'
  editingId.value = null
  form.value = { Key: '', Value: '' }
  showModal.value = true
}

const openEdit = (row: ShobeSettingDto) => {
  modalMode.value = 'edit'
  editingId.value = row.PublicId
  form.value = {
    Key: (row.Key as string) ?? '',
    Value: (row.Value as string) ?? '',
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveSetting = async () => {
  if (!form.value.Key?.trim()) {
    toastStore.showToast('کلید الزامی است', 'error')
    return
  }
  isSaving.value = true
  try {
    if (modalMode.value === 'create') {
      const payload: Record<string, unknown> = {
        Key: form.value.Key.trim(),
        Value: form.value.Value || null,
      }
      if (selectedShobePublicId.value) payload.ShobePublicId = selectedShobePublicId.value
      await apiClient.post(endpoints.shobe.settings.create, payload)
      toastStore.showToast('تنظیمات با موفقیت اضافه شد', 'success')
    } else if (editingId.value) {
      await apiClient.put(endpoints.shobe.settings.update(editingId.value), {
        Key: form.value.Key.trim(),
        Value: form.value.Value || null,
      })
      toastStore.showToast('تنظیمات با موفقیت به‌روزرسانی شد', 'success')
    }
    closeModal()
    await fetchSettings()
  } catch {
    toastStore.showToast(modalMode.value === 'create' ? 'خطا در افزودن تنظیمات' : 'خطا در به‌روزرسانی', 'error')
  } finally {
    isSaving.value = false
  }
}

const deleteSetting = async (publicId: string) => {
  if (!confirm('آیا از حذف این تنظیمات مطمئن هستید؟')) return
  try {
    await apiClient.delete(endpoints.shobe.settings.delete(publicId))
    toastStore.showToast('تنظیمات حذف شد', 'success')
    await fetchSettings()
  } catch {
    toastStore.showToast('خطا در حذف تنظیمات', 'error')
  }
}

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'لیست شعب', href: '/shobe/list' },
  { label: 'تنظیمات شعب' },
]
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0 px-2 sm:px-0">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card title="تنظیمات شعب" variant="elevated" padding="none" class="min-w-0">
        <template #header>
          <div class="p-4 sm:p-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <label class="text-sm font-medium text-foreground shrink-0">شعبه (اختیاری):</label>
              <select
                v-model="selectedShobePublicId"
                class="w-full sm:min-w-[180px] max-w-full rounded-lg border border-border-default bg-input-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option :value="null">همه</option>
                <option
                  v-for="s in shobeList"
                  :key="s.PublicId"
                  :value="s.PublicId"
                >
                  {{ s.Title }}
                </option>
              </select>
            </div>
            <BaseButton
              variant="outline"
              class="w-full sm:w-auto border-2 border-success-500 text-success-600 shrink-0"
              @click="openCreate"
            >
              <BaseIcon name="Plus" :size="16" />
              افزودن تنظیمات
            </BaseButton>
          </div>
        </template>

        <div class="p-4 sm:p-6 min-w-0">
          <CustomLoader v-if="isLoading" size="lg" class="mx-auto my-8" />
          <div v-else-if="settings.length === 0" class="text-center py-8 sm:py-12 text-muted-foreground text-sm px-2">
            تنظیماتی یافت نشد. با انتخاب شعبه یا «همه» و سپس «افزودن تنظیمات» می‌توانید تنظیم جدید اضافه کنید.
          </div>
          <template v-else>
          <!-- Desktop: table -->
          <div class="hidden sm:block overflow-x-auto min-w-0">
            <table class="w-full border-collapse text-right min-w-0">
              <thead>
                <tr class="border-b border-border-default">
                  <th class="p-3 text-sm font-semibold text-foreground">کلید</th>
                  <th class="p-3 text-sm font-semibold text-foreground">مقدار</th>
                  <th class="p-3 text-sm font-semibold text-foreground w-24">عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in settings"
                  :key="row.PublicId"
                  class="border-b border-border-default hover:bg-muted/50 transition-colors"
                >
                  <td class="p-3 text-sm text-foreground">{{ row.Key ?? '-' }}</td>
                  <td class="p-3 text-sm text-foreground break-words">{{ row.Value ?? '-' }}</td>
                  <td class="p-3">
                    <div class="flex gap-2 justify-end">
                      <BaseButton variant="ghost" size="sm" @click="openEdit(row)">
                        <BaseIcon name="Edit" :size="14" />
                      </BaseButton>
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        class="text-danger"
                        @click="deleteSetting(row.PublicId)"
                      >
                        <BaseIcon name="Trash" :size="14" />
                      </BaseButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Mobile: card list -->
          <div v-else class="sm:hidden space-y-3">
            <div
              v-for="row in settings"
              :key="row.PublicId"
              class="rounded-xl border border-border-default bg-card-background p-4 flex flex-col gap-3"
            >
              <div>
                <p class="text-xs text-muted-foreground mb-0.5">کلید</p>
                <p class="text-sm font-medium text-foreground break-words">{{ row.Key ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground mb-0.5">مقدار</p>
                <p class="text-sm text-foreground break-words">{{ row.Value ?? '-' }}</p>
              </div>
              <div class="flex gap-2 justify-end pt-1 border-t border-border-default">
                <BaseButton variant="ghost" size="sm" class="flex-1 sm:flex-none" @click="openEdit(row)">
                  <BaseIcon name="Edit" :size="14" />
                  ویرایش
                </BaseButton>
                <BaseButton
                  variant="ghost"
                  size="sm"
                  class="flex-1 sm:flex-none text-danger"
                  @click="deleteSetting(row.PublicId)"
                >
                  <BaseIcon name="Trash" :size="14" />
                  حذف
                </BaseButton>
              </div>
            </div>
          </div>
          </template>
        </div>
      </Card>
    </div>

    <Modal
      v-model="showModal"
      :title="modalMode === 'create' ? 'افزودن تنظیمات' : 'ویرایش تنظیمات'"
      size="md"
    >
      <div class="p-4 space-y-4">
        <FormField v-model="form.Key" label="کلید" type="text" required />
        <FormField v-model="form.Value" label="مقدار" type="text" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="outline" @click="closeModal">انصراف</BaseButton>
          <BaseButton :disabled="isSaving" class="text-white" @click="saveSetting">
            {{ isSaving ? 'در حال ذخیره...' : 'ذخیره' }}
          </BaseButton>
        </div>
      </template>
    </Modal>
  </DashboardLayout>
</template>
