<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import type { VNode } from 'vue'
import { DashboardLayout } from '@/design-system/templates'
import { Breadcrumb, Card } from '@/design-system/molecules'
import { BaseBadge, CustomLoader } from '@/design-system/atoms'
import TableWithSettings from '@/design-system/organisms/TableWithSettings.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'

export interface Shobe {
  PublicId: string
  Title: string
  ShobeCode: number
  Address: string | null
  Phone: string | null
  PostalCode: string | null
  ParentPublicId: string | null
  ParentTitle: string | null
  IsActive: boolean
  Description: string | null
  DisplayOrder: number
  ZamanInsert: string
  ZamanLastEdit: string | null
}

type TableColumn<T = Record<string, unknown>> = {
  id: string
  title: string
  sortable?: boolean
  visible?: boolean
  render?: (row: T, index?: number) => VNode | string | number
}

const toastStore = useToastStore()
const list = ref<Shobe[]>([])
const isLoading = ref(false)

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'لیست شعب', href: '/shobe/list' },
]

const fetchList = async () => {
  isLoading.value = true
  try {
    const res = await apiClient.get<Shobe[]>(endpoints.shobe.list)
    list.value = res.data ?? []
  } catch {
    toastStore.showToast('خطا در دریافت لیست شعب', 'error')
    list.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})

const tableColumns = computed<TableColumn<Shobe>[]>(() => [
  {
    id: 'Title',
    title: 'عنوان',
    sortable: true,
    visible: true,
    render: (row) => row.Title ?? '-',
  },
  {
    id: 'ShobeCode',
    title: 'کد شعبه',
    sortable: true,
    visible: true,
    render: (row) => row.ShobeCode ?? '-',
  },
  {
    id: 'Address',
    title: 'آدرس',
    sortable: true,
    visible: true,
    render: (row) => row.Address ?? '-',
  },
  {
    id: 'Phone',
    title: 'تلفن',
    sortable: true,
    visible: true,
    render: (row) =>
      row.Phone ? h('span', { dir: 'ltr', class: 'font-mono text-sm' }, row.Phone) : '-',
  },
  {
    id: 'PostalCode',
    title: 'کد پستی',
    sortable: true,
    visible: true,
    render: (row) =>
      row.PostalCode ? h('span', { dir: 'ltr', class: 'font-mono text-sm' }, row.PostalCode) : '-',
  },
  {
    id: 'ParentTitle',
    title: 'شعبه والد',
    sortable: true,
    visible: true,
    render: (row) => row.ParentTitle ?? '-',
  },
  {
    id: 'IsActive',
    title: 'وضعیت',
    sortable: true,
    visible: true,
    render: (row) =>
      h(
        BaseBadge,
        {
          variant: row.IsActive ? 'success' : 'secondary',
          size: 'sm',
          class: 'text-[10px] px-1.5 py-0.5',
        },
        () => (row.IsActive ? 'فعال' : 'غیرفعال'),
      ),
  },
  {
    id: 'DisplayOrder',
    title: 'ترتیب نمایش',
    sortable: true,
    visible: true,
    render: (row) => row.DisplayOrder ?? '-',
  },
  {
    id: 'ZamanInsert',
    title: 'تاریخ ثبت',
    sortable: true,
    visible: true,
    render: (row) => row.ZamanInsert ?? '-',
  },
  {
    id: 'ZamanLastEdit',
    title: 'تاریخ ویرایش',
    sortable: true,
    visible: true,
    render: (row) => row.ZamanLastEdit ?? '-',
  },
])
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
    <CustomLoader size="lg" />
  </div>
  <DashboardLayout v-else>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card title="لیست شعب" variant="elevated" padding="none" class="min-w-0">
        <!-- Header -->
        <template #header>
          <div class="py-4 min-[931px]:py-6">
            <div
              class="flex flex-row flex-wrap items-start min-[931px]:items-center justify-between gap-3 min-[931px]:gap-4"
            >
              <!-- Primary actions can go here -->
            </div>
          </div>
        </template>

        <!-- Table Section -->
        <div
          class="border-t border-border-default py-3 min-[931px]:py-4 min-[931px]:py-6 overflow-x-auto min-w-0"
        >
          <CustomLoader v-if="isLoading" size="lg" class="mx-auto my-10" />
          <TableWithSettings
            v-else
            :columns="tableColumns"
            :data="list"
            :searchable="true"
            :exportable="false"
          />
        </div>
      </Card>
    </div>
  </DashboardLayout>
</template>
