<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import type { VNode } from 'vue'
import { CustomLoader, BaseBadge, BaseButton, BaseIcon } from '@/design-system/atoms'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import Modal from '@/design-system/molecules/Modal.vue'
import { Accordion } from '@/design-system/molecules'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import TableWithSettings from '@/design-system/organisms/TableWithSettings.vue'
import { formatPersianDateTime } from '@/shared/utils/utils'
import Pagination from '@/design-system/molecules/Pagination.vue'
import {
  useAuditLogById,
  useAuditLogSearch,
  useAuditLogAdvanced,
  useAuditLogToday,
  useAuditLogFailed,
  useAuditLogSummary,
  type AuditLogItem,
} from './composables'

type TableColumn<T = Record<string, unknown>> = {
  id: string
  title: string
  sortable?: boolean
  visible?: boolean
  render?: (row: T, index?: number) => VNode | string | number
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const

const activeTab = ref('todayLogs')

const { searchByIdInput, byIdLoading, byIdError, byIdResult, fetchById, clearByIdSearch } =
  useAuditLogById()

const {
  searchTerm,
  searchTermError,
  searchPageNumber,
  searchPageSize,
  searchItems,
  searchTotalCount,
  searchTotalPages,
  searchLoading,
  searchError,
  fetchSearch,
  runSearch,
  hasValidSearchTerm,
  onSearchPageChange,
} = useAuditLogSearch()

const {
  advancedPageNumber,
  advancedPageSize,
  advancedItems,
  advancedTotalCount,
  advancedTotalPages,
  advancedLoading,
  advancedError,
  auditFilters,
  eventTypes,
  eventTypesLoading,
  fetchAdvanced,
  applyFilters,
  clearFilters,
  fetchEventTypes,
  onAdvancedPageChange,
} = useAuditLogAdvanced()

const {
  todayPageNumber,
  todayPageSize,
  todayItems,
  todayTotalCount,
  todayTotalPages,
  todayLoading,
  todayError,
  fetchToday,
  onTodayPageChange,
} = useAuditLogToday()

const {
  failedPageNumber,
  failedPageSize,
  failedItems,
  failedTotalCount,
  failedTotalPages,
  failedLoading,
  failedError,
  fetchFailedLogins,
  onFailedPageChange,
} = useAuditLogFailed()

const { summaryTodayCount, summaryFailedCount, summaryLoading, fetchSummaryCounts } =
  useAuditLogSummary()

const tabItems = [
  { id: 'searchById', label: 'جستجو بر اساس شناسه' },
  { id: 'textSearch', label: 'جستجوی متنی' },
  { id: 'advancedSearch', label: 'جستجوی پیشرفته' },
  { id: 'todayLogs', label: 'لاگ‌های امروز' },
  { id: 'failedLogins', label: 'لاگ‌های ورود ناموفق' },
]

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'مشاهده لاگ‌ها', href: '/auditlog/list' },
]

watch(activeTab, (tab) => {
  if (tab === 'todayLogs') fetchToday()
  else if (tab === 'failedLogins') fetchFailedLogins()
  else if (tab === 'textSearch' && searchTerm.value?.trim()) fetchSearch()
  else if (tab === 'advancedSearch') fetchAdvanced()
})

watch(todayPageNumber, () => {
  if (activeTab.value === 'todayLogs') fetchToday()
})

watch(todayPageSize, () => {
  if (activeTab.value !== 'todayLogs') return
  todayPageNumber.value = 1
  fetchToday()
})

watch(failedPageNumber, () => {
  if (activeTab.value === 'failedLogins') fetchFailedLogins()
})

watch(failedPageSize, () => {
  if (activeTab.value !== 'failedLogins') return
  failedPageNumber.value = 1
  fetchFailedLogins()
})

watch(advancedPageNumber, () => {
  if (activeTab.value === 'advancedSearch') fetchAdvanced()
})

watch(advancedPageSize, () => {
  if (activeTab.value !== 'advancedSearch') return
  advancedPageNumber.value = 1
  fetchAdvanced()
})

watch(searchTerm, () => {
  if (searchTermError.value) searchTermError.value = null
})

watch(searchPageNumber, () => {
  if (activeTab.value === 'textSearch' && hasValidSearchTerm()) fetchSearch()
})

watch(searchPageSize, () => {
  if (activeTab.value !== 'textSearch') return
  const wasOne = searchPageNumber.value === 1
  searchPageNumber.value = 1
  if (wasOne && hasValidSearchTerm()) fetchSearch()
})

onMounted(() => {
  fetchEventTypes()
  fetchSummaryCounts()
  if (activeTab.value === 'advancedSearch') fetchAdvanced()
  else if (activeTab.value === 'todayLogs') fetchToday()
  else if (activeTab.value === 'failedLogins') fetchFailedLogins()
  else if (activeTab.value === 'textSearch' && searchTerm.value?.trim()) fetchSearch()
})

const tableColumns = computed<TableColumn<Record<string, unknown>>[]>(() => [
  {
    id: 'EventDateTime',
    title: 'زمان',
    sortable: false,
    visible: true,
    render: (row) => formatAuditDate((row as unknown as AuditLogItem).EventDateTime),
  },
  {
    id: 'EventType',
    title: 'نوع رویداد',
    sortable: false,
    visible: true,
    render: (row) => (row as unknown as AuditLogItem).EventType ?? '-',
  },
  {
    id: 'EntityType',
    title: 'نوع موجودیت',
    sortable: false,
    visible: true,
    render: (row) => (row as unknown as AuditLogItem).EntityType ?? '-',
  },
  {
    id: 'IsSuccess',
    title: 'وضعیت',
    sortable: false,
    visible: true,
    render: (row) => {
      const r = row as unknown as AuditLogItem
      return h(BaseBadge, { variant: r.IsSuccess ? 'success' : 'danger', size: 'sm' }, () =>
        r.IsSuccess ? 'موفق' : 'ناموفق',
      )
    },
  },
  {
    id: 'UserName',
    title: 'کاربر',
    sortable: false,
    visible: true,
    render: (row) => (row as unknown as AuditLogItem).UserName ?? '-',
  },
  {
    id: 'IpAddress',
    title: 'آدرس IP',
    sortable: false,
    visible: true,
    render: (row) =>
      h(
        'span',
        { dir: 'ltr', class: 'font-mono text-sm' },
        (row as unknown as AuditLogItem).IpAddress ?? '-',
      ),
  },
  {
    id: 'Description',
    title: 'توضیحات',
    sortable: false,
    visible: true,
    render: (row) => {
      const desc = (row as unknown as AuditLogItem).Description ?? '-'
      const text = typeof desc === 'string' && desc.length > 60 ? `${desc.slice(0, 60)}…` : desc
      return h(
        'span',
        { class: 'text-muted-foreground text-sm max-w-[200px] truncate block' },
        text,
      )
    },
  },
  {
    id: '_detail',
    title: 'جزئیات',
    sortable: false,
    visible: true,
    render: (row) =>
      h(
        BaseButton,
        {
          variant: 'ghost',
          size: 'sm',
          onClick: () => openDetail(row as unknown as AuditLogItem),
        },
        () => 'جزئیات',
      ),
  },
])

// —— Row detail modal ——
const selectedLog = ref<AuditLogItem | null>(null)
const detailOpen = ref(false)

function formatAuditDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    return formatPersianDateTime(dateStr)
  } catch {
    return dateStr
  }
}

function openDetail(log: AuditLogItem) {
  selectedLog.value = log
  detailOpen.value = true
}

function closeDetail() {
  detailOpen.value = false
  selectedLog.value = null
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card title="مشاهده لاگ‌ها" variant="elevated" padding="none" class="min-w-0">
        <template #header></template>
        <div
          v-if="!summaryLoading && (summaryTodayCount !== null || summaryFailedCount !== null)"
          class="px-4 sm:px-6 py-3 border-b border-border-default bg-muted/30 text-sm text-muted-foreground"
        >
          <span v-if="summaryTodayCount !== null"
            >امروز: {{ summaryTodayCount.toLocaleString('fa-IR') }} رویداد</span
          >
          <span v-if="summaryTodayCount !== null && summaryFailedCount !== null">، </span>
          <span v-if="summaryFailedCount !== null"
            >ورود ناموفق: {{ summaryFailedCount.toLocaleString('fa-IR') }}</span
          >
        </div>
        <div class="py-4">
          <Accordion v-model="activeTab" :items="tabItems">
            <template #searchById>
              <div class="space-y-4">
                <div class="flex flex-wrap items-end gap-3">
                  <FormField
                    v-model="searchByIdInput"
                    label="شناسه لاگ"
                    type="text"
                    placeholder="مثال: ۱۲۳۴۵"
                    class="max-w-[200px]"
                  />
                  <BaseButton variant="primary" :disabled="byIdLoading" @click="fetchById">
                    <BaseIcon v-if="byIdLoading" name="Loader2" :size="16" class="animate-spin" />
                    <BaseIcon v-else name="Search" :size="16" />
                    جستجو
                  </BaseButton>
                  <BaseButton variant="outline" @click="clearByIdSearch">
                    <BaseIcon name="RefreshCw" :size="16" />
                    پاک کردن
                  </BaseButton>
                </div>
                <CustomLoader v-if="byIdLoading" size="lg" class="mx-auto my-10" />
                <p v-else-if="byIdError" class="text-muted-foreground text-center py-8 px-4">
                  {{ byIdError }}
                </p>
                <template v-else-if="byIdResult">
                  <div
                    class="rounded-xl border-2 border-border-default bg-card-background overflow-hidden"
                  >
                    <div class="p-4 sm:p-6 space-y-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                          <p class="text-muted-foreground mb-0.5">شناسه</p>
                          <p class="font-semibold text-foreground m-0">{{ byIdResult.Id }}</p>
                        </div>
                        <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                          <p class="text-muted-foreground mb-0.5">زمان</p>
                          <p class="font-semibold text-foreground m-0" dir="ltr">
                            {{ formatAuditDate(byIdResult.EventDateTime) }}
                          </p>
                        </div>
                        <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                          <p class="text-muted-foreground mb-0.5">نوع رویداد</p>
                          <p class="font-semibold text-foreground m-0">
                            {{ byIdResult.EventType ?? '-' }}
                          </p>
                        </div>
                        <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                          <p class="text-muted-foreground mb-0.5">نوع موجودیت</p>
                          <p class="font-semibold text-foreground m-0">
                            {{ byIdResult.EntityType ?? '-' }}
                          </p>
                        </div>
                        <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                          <p class="text-muted-foreground mb-0.5">وضعیت</p>
                          <p class="m-0">
                            <BaseBadge
                              :variant="byIdResult.IsSuccess ? 'success' : 'danger'"
                              size="sm"
                            >
                              {{ byIdResult.IsSuccess ? 'موفق' : 'ناموفق' }}
                            </BaseBadge>
                          </p>
                        </div>
                        <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                          <p class="text-muted-foreground mb-0.5">کاربر</p>
                          <p class="font-semibold text-foreground m-0">
                            {{ byIdResult.UserName ?? '-' }}
                          </p>
                        </div>
                        <div
                          class="rounded-lg border border-border-default bg-muted/30 p-3 sm:col-span-2"
                        >
                          <p class="text-muted-foreground mb-0.5">آدرس IP</p>
                          <p class="font-mono text-foreground m-0" dir="ltr">
                            {{ byIdResult.IpAddress ?? '-' }}
                          </p>
                        </div>
                        <div
                          v-if="byIdResult.ErrorMessage"
                          class="rounded-lg border border-danger-200 dark:border-danger-800 bg-danger-50/50 dark:bg-danger-900/20 p-3 sm:col-span-2"
                        >
                          <p class="text-danger-600 dark:text-danger-400 font-medium mb-0.5">
                            پیام خطا
                          </p>
                          <p class="text-sm text-foreground m-0 break-words">
                            {{ byIdResult.ErrorMessage }}
                          </p>
                        </div>
                        <div
                          class="rounded-lg border border-border-default bg-muted/30 p-3 sm:col-span-2"
                        >
                          <p class="text-muted-foreground mb-0.5">مرورگر / User-Agent</p>
                          <p class="text-xs text-foreground m-0 break-words font-mono">
                            {{ byIdResult.UserAgent ?? '-' }}
                          </p>
                        </div>
                        <div
                          class="rounded-lg border border-border-default bg-muted/30 p-3 sm:col-span-2"
                        >
                          <p class="text-muted-foreground mb-0.5">سیستم‌عامل</p>
                          <p class="text-sm text-foreground m-0">
                            {{ byIdResult.OperatingSystem ?? '-' }}
                          </p>
                        </div>
                        <div
                          class="rounded-lg border border-border-default bg-muted/30 p-3 sm:col-span-2"
                        >
                          <p class="text-muted-foreground mb-0.5">توضیحات</p>
                          <p class="text-sm text-foreground m-0 break-words">
                            {{ byIdResult.Description ?? '-' }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <p v-else class="text-muted-foreground text-sm py-4">
                  شناسه لاگ را وارد کرده و جستجو را بزنید.
                </p>
              </div>
            </template>

            <template #textSearch>
              <div class="space-y-4">
                <div class="flex flex-nowrap items-center gap-3">
                  <div class="min-w-[200px] w-[320px] flex-shrink-0 min-h-[6.5rem]">
                    <FormField
                      v-model="searchTerm"
                      label="عبارت جستجو"
                      type="text"
                      placeholder="جستجو در لاگ‌ها..."
                      :error-message="searchTermError ?? undefined"
                      required
                      class="w-full"
                    />
                  </div>
                  <BaseButton
                    variant="primary"
                    :disabled="searchLoading"
                    class="flex-shrink-0"
                    @click="runSearch"
                  >
                    <BaseIcon v-if="searchLoading" name="Loader2" :size="16" class="animate-spin" />
                    <BaseIcon v-else name="Search" :size="16" />
                    جستجو
                  </BaseButton>
                </div>
                <CustomLoader v-if="searchLoading" size="lg" class="mx-auto my-10" />
                <p v-else-if="searchError" class="text-muted-foreground text-center py-8 px-4">
                  {{ searchError }}
                </p>
                <template v-else-if="searchTerm?.trim()">
                  <TableWithSettings
                    :columns="tableColumns"
                    :data="searchItems"
                    :searchable="false"
                    :exportable="false"
                    :filterable="false"
                    class="w-full"
                  />
                  <div
                    class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 flex-wrap"
                  >
                    <div class="flex items-center gap-4 order-2 sm:order-1 flex-wrap">
                      <p class="text-sm text-muted-foreground">
                        {{ searchTotalCount }} مورد در مجموع
                      </p>
                      <div class="flex items-center gap-2">
                        <label
                          for="search-page-size"
                          class="text-sm text-muted-foreground whitespace-nowrap"
                        >
                          تعداد در هر صفحه:
                        </label>
                        <select
                          id="search-page-size"
                          v-model.number="searchPageSize"
                          class="rounded-lg border border-border-default bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">
                            {{ size }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <Pagination
                      v-if="searchTotalPages > 1"
                      :current-page="searchPageNumber"
                      :total-pages="searchTotalPages"
                      @update:current-page="onSearchPageChange"
                      @change="onSearchPageChange"
                    />
                  </div>
                </template>
                <p v-else class="text-muted-foreground text-sm py-4">
                  عبارت جستجو را وارد کرده و دکمه جستجو را بزنید.
                </p>
              </div>
            </template>

            <template #advancedSearch>
              <CustomLoader v-if="advancedLoading" size="lg" class="mx-auto my-10" />
              <p v-else-if="advancedError" class="text-muted-foreground text-center py-8 px-4">
                {{ advancedError }}
              </p>
              <template v-else>
                <div class="space-y-4">
                  <TableWithSettings
                    :columns="tableColumns"
                    :data="advancedItems"
                    :searchable="true"
                    :exportable="true"
                    :filterable="true"
                    class="w-full"
                  >
                    <template #filters>
                      <form @submit.prevent="applyFilters" class="space-y-4">
                        <div
                          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4"
                        >
                          <FormField v-model="auditFilters.FromDate" label="از تاریخ" type="date" />
                          <FormField v-model="auditFilters.ToDate" label="تا تاریخ" type="date" />
                          <div class="flex flex-col gap-1">
                            <label class="text-sm font-medium text-foreground">نوع رویداد</label>
                            <select
                              v-model="auditFilters.EventType"
                              class="rounded-lg border border-border-default bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                            >
                              <option value="">همه</option>
                              <option v-for="et in eventTypes" :key="et" :value="et">
                                {{ et }}
                              </option>
                            </select>
                            <p v-if="eventTypesLoading" class="text-xs text-muted-foreground">
                              در حال بارگذاری...
                            </p>
                          </div>
                          <FormField
                            v-model="auditFilters.UserName"
                            label="نام کاربر"
                            type="text"
                            placeholder="نام کاربر"
                          />
                          <FormField
                            v-model="auditFilters.IpAddress"
                            label="آدرس IP"
                            type="text"
                            placeholder="آدرس IP"
                          />
                          <FormField
                            v-model="auditFilters.EntityType"
                            label="نوع موجودیت"
                            type="text"
                            placeholder="نوع موجودیت"
                          />
                          <div class="flex flex-col gap-1">
                            <label class="text-sm font-medium text-foreground">وضعیت موفقیت</label>
                            <select
                              v-model="auditFilters.IsSuccess"
                              class="rounded-lg border border-border-default bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">همه</option>
                              <option value="true">موفق</option>
                              <option value="false">ناموفق</option>
                            </select>
                          </div>
                        </div>
                        <div
                          class="flex flex-wrap items-center gap-2 pt-2 border-t border-border-default"
                        >
                          <BaseButton
                            type="submit"
                            variant="outline"
                            class="border-2 border-primary-500 text-primary-600"
                            @click.prevent="applyFilters"
                          >
                            <BaseIcon name="Search" :size="16" />
                            اعمال فیلتر
                          </BaseButton>
                          <BaseButton type="button" variant="outline" @click="clearFilters">
                            <BaseIcon name="RefreshCw" :size="16" />
                            پاک کردن فیلترها
                          </BaseButton>
                        </div>
                      </form>
                    </template>
                  </TableWithSettings>
                  <div
                    class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 flex-wrap"
                  >
                    <div class="flex flex-wrap items-center gap-3 order-2 sm:order-1">
                      <p class="text-sm text-muted-foreground">
                        {{ advancedTotalCount }} مورد در مجموع
                      </p>
                      <div class="flex items-center gap-2">
                        <label class="text-sm text-muted-foreground whitespace-nowrap"
                          >تعداد در هر صفحه:</label
                        >
                        <select
                          v-model.number="advancedPageSize"
                          class="rounded-lg border border-border-default bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">
                            {{ size }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <Pagination
                      v-if="advancedTotalPages > 1"
                      :current-page="advancedPageNumber"
                      :total-pages="advancedTotalPages"
                      @update:current-page="onAdvancedPageChange"
                      @change="onAdvancedPageChange"
                    />
                  </div>
                </div>
              </template>
            </template>

            <template #todayLogs>
              <CustomLoader v-if="todayLoading" size="lg" class="mx-auto my-10" />
              <p v-else-if="todayError" class="text-muted-foreground text-center py-8 px-4">
                {{ todayError }}
              </p>
              <template v-else>
                <div class="space-y-4">
                  <TableWithSettings
                    :columns="tableColumns"
                    :data="todayItems"
                    :searchable="true"
                    :exportable="true"
                    :filterable="false"
                    class="w-full"
                  />
                  <div
                    class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 flex-wrap"
                  >
                    <div class="flex flex-wrap items-center gap-3 order-2 sm:order-1">
                      <p class="text-sm text-muted-foreground">
                        {{ todayTotalCount }} مورد در مجموع
                      </p>
                      <div class="flex items-center gap-2">
                        <label class="text-sm text-muted-foreground whitespace-nowrap"
                          >تعداد در هر صفحه:</label
                        >
                        <select
                          v-model.number="todayPageSize"
                          class="rounded-lg border border-border-default bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">
                            {{ size }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <Pagination
                      v-if="todayTotalPages > 1"
                      :current-page="todayPageNumber"
                      :total-pages="todayTotalPages"
                      @update:current-page="onTodayPageChange"
                      @change="onTodayPageChange"
                    />
                  </div>
                </div>
              </template>
            </template>

            <template #failedLogins>
              <CustomLoader v-if="failedLoading" size="lg" class="mx-auto my-10" />
              <p v-else-if="failedError" class="text-muted-foreground text-center py-8 px-4">
                {{ failedError }}
              </p>
              <template v-else>
                <div class="space-y-4">
                  <TableWithSettings
                    :columns="tableColumns"
                    :data="failedItems"
                    :searchable="true"
                    :exportable="true"
                    :filterable="false"
                    class="w-full"
                  />
                  <div
                    class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 flex-wrap"
                  >
                    <div class="flex flex-wrap items-center gap-3 order-2 sm:order-1">
                      <p class="text-sm text-muted-foreground">
                        {{ failedTotalCount }} مورد در مجموع
                      </p>
                      <div class="flex items-center gap-2">
                        <label class="text-sm text-muted-foreground whitespace-nowrap"
                          >تعداد در هر صفحه:</label
                        >
                        <select
                          v-model.number="failedPageSize"
                          class="rounded-lg border border-border-default bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">
                            {{ size }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <Pagination
                      v-if="failedTotalPages > 1"
                      :current-page="failedPageNumber"
                      :total-pages="failedTotalPages"
                      @update:current-page="onFailedPageChange"
                      @change="onFailedPageChange"
                    />
                  </div>
                </div>
              </template>
            </template>
          </Accordion>
        </div>
      </Card>

      <!-- Row detail modal -->
      <Modal
        v-model="detailOpen"
        title="جزئیات لاگ"
        size="lg"
        :close-on-backdrop="true"
        @close="closeDetail"
      >
        <template v-if="selectedLog">
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                <p class="text-muted-foreground mb-0.5">شناسه</p>
                <p class="font-semibold text-foreground m-0">{{ selectedLog.Id }}</p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                <p class="text-muted-foreground mb-0.5">زمان</p>
                <p class="font-semibold text-foreground m-0" dir="ltr">
                  {{ formatAuditDate(selectedLog.EventDateTime) }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                <p class="text-muted-foreground mb-0.5">نوع رویداد</p>
                <p class="font-semibold text-foreground m-0">{{ selectedLog.EventType ?? '-' }}</p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                <p class="text-muted-foreground mb-0.5">نوع موجودیت</p>
                <p class="font-semibold text-foreground m-0">{{ selectedLog.EntityType ?? '-' }}</p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                <p class="text-muted-foreground mb-0.5">وضعیت</p>
                <p class="m-0">
                  <BaseBadge :variant="selectedLog.IsSuccess ? 'success' : 'danger'" size="sm">
                    {{ selectedLog.IsSuccess ? 'موفق' : 'ناموفق' }}
                  </BaseBadge>
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                <p class="text-muted-foreground mb-0.5">کاربر</p>
                <p class="font-semibold text-foreground m-0">{{ selectedLog.UserName ?? '-' }}</p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:col-span-2">
                <p class="text-muted-foreground mb-0.5">آدرس IP</p>
                <p class="font-mono text-foreground m-0" dir="ltr">
                  {{ selectedLog.IpAddress ?? '-' }}
                </p>
              </div>
              <div
                v-if="selectedLog.ErrorMessage"
                class="rounded-lg border border-danger-200 dark:border-danger-800 bg-danger-50/50 dark:bg-danger-900/20 p-3 sm:col-span-2"
              >
                <p class="text-danger-600 dark:text-danger-400 font-medium mb-0.5">پیام خطا</p>
                <p class="text-sm text-foreground m-0 break-words">
                  {{ selectedLog.ErrorMessage }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:col-span-2">
                <p class="text-muted-foreground mb-0.5">مرورگر / User-Agent</p>
                <p class="text-xs text-foreground m-0 break-words font-mono">
                  {{ selectedLog.UserAgent ?? '-' }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:col-span-2">
                <p class="text-muted-foreground mb-0.5">سیستم‌عامل</p>
                <p class="text-sm text-foreground m-0">{{ selectedLog.OperatingSystem ?? '-' }}</p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:col-span-2">
                <p class="text-muted-foreground mb-0.5">توضیحات</p>
                <p class="text-sm text-foreground m-0 break-words">
                  {{ selectedLog.Description ?? '-' }}
                </p>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <BaseButton variant="outline" @click="closeDetail">بستن</BaseButton>
        </template>
      </Modal>
    </div>
  </DashboardLayout>
</template>
