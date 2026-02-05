<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import type { VNode } from 'vue'
import { CustomLoader, BaseBadge, BaseButton, BaseIcon } from '@/design-system/atoms'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import { Accordion } from '@/design-system/molecules'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import TableWithSettings from '@/design-system/organisms/TableWithSettings.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import Pagination from '@/design-system/molecules/Pagination.vue'

interface AuditLogItem {
  Id: number
  EventDateTime: string
  EventType: string
  EntityId: number | null
  EntityType: string | null
  IsSuccess: boolean
  ErrorMessage: string | null
  IpAddress: string | null
  UserName: string | null
  UserId: string | null
  OperatingSystem: string | null
  UserAgent: string | null
  Description: string | null
}

interface AuditLogResponse {
  Items: AuditLogItem[]
  TotalCount: number
  PageNumber: number
  PageSize: number
  TotalPages: number
  HasPreviousPage: boolean
  HasNextPage: boolean
}

type TableColumn<T = Record<string, unknown>> = {
  id: string
  title: string
  sortable?: boolean
  visible?: boolean
  render?: (row: T, index?: number) => VNode | string | number
}

const PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const
const DEFAULT_SEARCH_PAGE_SIZE = 10

// Tab: جستجو بر اساس شناسه (Search by ID)
const activeTab = ref('searchById')
const searchByIdInput = ref('')
const byIdLoading = ref(false)
const byIdError = ref<string | null>(null)
const byIdResult = ref<AuditLogItem | null>(null)

// Tab: جستجوی پیشرفته (Advanced Search)
const advancedPageNumber = ref(1)
const advancedItems = ref<AuditLogItem[]>([])
const advancedTotalCount = ref(0)
const advancedTotalPages = ref(0)
const advancedLoading = ref(false)
const advancedError = ref<string | null>(null)
const auditFilters = ref({
  FromDate: '',
  ToDate: '',
  EventType: '',
  UserName: '',
  IpAddress: '',
  IsSuccess: '' as '' | 'true' | 'false',
  EntityType: '',
})

// Tab: لاگ‌های امروز (Today's Logs)
const todayPageNumber = ref(1)
const todayItems = ref<AuditLogItem[]>([])
const todayTotalCount = ref(0)
const todayTotalPages = ref(0)
const todayLoading = ref(false)
const todayError = ref<string | null>(null)

// Tab: لاگ‌های ورود ناموفق (Failed Login Logs)
const failedPageNumber = ref(1)
const failedItems = ref<AuditLogItem[]>([])
const failedTotalCount = ref(0)
const failedTotalPages = ref(0)
const failedLoading = ref(false)
const failedError = ref<string | null>(null)

// Tab: جستجوی متنی (Text Search – GET /api/AuditLog/search)
const searchTerm = ref('')
const searchTermError = ref<string | null>(null)
const searchPageNumber = ref(1)
const searchPageSize = ref(DEFAULT_SEARCH_PAGE_SIZE)
const searchItems = ref<AuditLogItem[]>([])
const searchTotalCount = ref(0)
const searchTotalPages = ref(0)
const searchLoading = ref(false)
const searchError = ref<string | null>(null)

const toastStore = useToastStore()

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

// —— Search by ID (GET /api/AuditLog/{id}) ——
async function fetchById() {
  const id = searchByIdInput.value?.trim()
  if (!id) {
    toastStore.showToast('شناسه را وارد کنید.', 'warning')
    return
  }
  const numId = parseInt(id, 10)
  if (Number.isNaN(numId) || numId < 1) {
    toastStore.showToast('شناسه معتبر نیست.', 'warning')
    return
  }
  byIdLoading.value = true
  byIdError.value = null
  byIdResult.value = null
  try {
    const response = await apiClient.get(endpoints.auditLog.byId(numId))
    const data = response.data as Record<string, unknown>
    byIdResult.value = data as unknown as AuditLogItem
  } catch (err) {
    console.error('Failed to fetch audit log by id:', err)
    byIdError.value = 'لاگی با این شناسه یافت نشد.'
    toastStore.showToast(byIdError.value, 'error')
  } finally {
    byIdLoading.value = false
  }
}

function clearByIdSearch() {
  searchByIdInput.value = ''
  byIdError.value = null
  byIdResult.value = null
}

// —— Advanced Search (GET /api/AuditLog with filters) ——
async function fetchAdvanced() {
  advancedLoading.value = true
  advancedError.value = null
  try {
    const params: Record<string, string | number | boolean> = {
      PageNumber: advancedPageNumber.value,
      PageSize: PAGE_SIZE,
    }
    const f = auditFilters.value
    if (f.FromDate) params.FromDate = f.FromDate
    if (f.ToDate) params.ToDate = f.ToDate
    if (f.EventType) params.EventType = f.EventType
    if (f.UserName) params.UserName = f.UserName
    if (f.IpAddress) params.IpAddress = f.IpAddress
    if (f.EntityType) params.EntityType = f.EntityType
    if (f.IsSuccess === 'true') params.IsSuccess = true
    if (f.IsSuccess === 'false') params.IsSuccess = false

    const response = await apiClient.get<AuditLogResponse>(endpoints.auditLog.list, { params })
    advancedItems.value = response.data.Items ?? []
    advancedTotalCount.value = response.data.TotalCount ?? 0
    advancedTotalPages.value = response.data.TotalPages ?? 1
  } catch (err) {
    console.error('Failed to fetch audit log (advanced):', err)
    advancedError.value = 'بارگذاری لاگ‌ها ناموفق بود.'
    toastStore.showToast(advancedError.value, 'error')
    advancedItems.value = []
    advancedTotalCount.value = 0
    advancedTotalPages.value = 1
  } finally {
    advancedLoading.value = false
  }
}

function applyFilters() {
  advancedPageNumber.value = 1
  fetchAdvanced()
}

function clearFilters() {
  auditFilters.value = {
    FromDate: '',
    ToDate: '',
    EventType: '',
    UserName: '',
    IpAddress: '',
    IsSuccess: '',
    EntityType: '',
  }
  advancedPageNumber.value = 1
  fetchAdvanced()
}

// —— Text Search (GET /api/AuditLog/search) ——
const SEARCH_TERM_REQUIRED_MESSAGE = 'عبارت جستجو را وارد کنید.'

function hasValidSearchTerm(): boolean {
  return !!searchTerm.value?.trim()
}

async function fetchSearch() {
  if (!hasValidSearchTerm()) return
  searchLoading.value = true
  searchError.value = null
  try {
    const params: Record<string, string | number> = {
      searchTerm: searchTerm.value!.trim(),
      pageNumber: searchPageNumber.value,
      pageSize: searchPageSize.value,
    }
    const response = await apiClient.get<AuditLogResponse>(endpoints.auditLog.search, { params })
    searchItems.value = response.data.Items ?? []
    searchTotalCount.value = response.data.TotalCount ?? 0
    searchTotalPages.value = response.data.TotalPages ?? 1
  } catch (err) {
    console.error('Failed to fetch audit log (search):', err)
    searchError.value = 'بارگذاری نتایج جستجو ناموفق بود.'
    toastStore.showToast(searchError.value, 'error')
    searchItems.value = []
    searchTotalCount.value = 0
    searchTotalPages.value = 1
  } finally {
    searchLoading.value = false
  }
}

function runSearch() {
  searchTermError.value = null
  if (!hasValidSearchTerm()) {
    searchTermError.value = SEARCH_TERM_REQUIRED_MESSAGE
    toastStore.showToast(SEARCH_TERM_REQUIRED_MESSAGE, 'warning')
    return
  }
  searchPageNumber.value = 1
  fetchSearch()
}

function onSearchPageSizeChange() {
  searchPageNumber.value = 1
  if (activeTab.value === 'textSearch' && hasValidSearchTerm()) fetchSearch()
}

// —— Today's Logs (GET /api/AuditLog/today) ——
async function fetchToday() {
  todayLoading.value = true
  todayError.value = null
  try {
    const response = await apiClient.get<AuditLogResponse>(endpoints.auditLog.today, {
      params: { pageNumber: todayPageNumber.value, pageSize: PAGE_SIZE },
    })
    todayItems.value = response.data.Items ?? []
    todayTotalCount.value = response.data.TotalCount ?? 0
    todayTotalPages.value = response.data.TotalPages ?? 1
  } catch (err) {
    console.error('Failed to fetch today logs:', err)
    todayError.value = 'بارگذاری لاگ‌های امروز ناموفق بود.'
    toastStore.showToast(todayError.value, 'error')
    todayItems.value = []
    todayTotalCount.value = 0
    todayTotalPages.value = 1
  } finally {
    todayLoading.value = false
  }
}

// —— Failed Logins (GET /api/AuditLog/failed-logins) ——
async function fetchFailedLogins() {
  failedLoading.value = true
  failedError.value = null
  try {
    const response = await apiClient.get<AuditLogResponse>(endpoints.auditLog.failedLogins, {
      params: { pageNumber: failedPageNumber.value, pageSize: PAGE_SIZE },
    })
    failedItems.value = response.data.Items ?? []
    failedTotalCount.value = response.data.TotalCount ?? 0
    failedTotalPages.value = response.data.TotalPages ?? 1
  } catch (err) {
    console.error('Failed to fetch failed logins:', err)
    failedError.value = 'بارگذاری لاگ‌های ورود ناموفق ناموفق بود.'
    toastStore.showToast(failedError.value, 'error')
    failedItems.value = []
    failedTotalCount.value = 0
    failedTotalPages.value = 1
  } finally {
    failedLoading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'todayLogs') fetchToday()
  else if (tab === 'failedLogins') fetchFailedLogins()
  else if (tab === 'textSearch' && searchTerm.value?.trim()) fetchSearch()
  else if (tab === 'advancedSearch') fetchAdvanced()
})

watch(todayPageNumber, () => {
  if (activeTab.value === 'todayLogs') fetchToday()
})

watch(failedPageNumber, () => {
  if (activeTab.value === 'failedLogins') fetchFailedLogins()
})

watch(advancedPageNumber, () => {
  if (activeTab.value === 'advancedSearch') fetchAdvanced()
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
  if (activeTab.value === 'advancedSearch') fetchAdvanced()
  else if (activeTab.value === 'todayLogs') fetchToday()
  else if (activeTab.value === 'failedLogins') fetchFailedLogins()
  else if (activeTab.value === 'textSearch' && searchTerm.value?.trim()) fetchSearch()
})

function onAdvancedPageChange(page: number) {
  advancedPageNumber.value = page
}
function onTodayPageChange(page: number) {
  todayPageNumber.value = page
}
function onFailedPageChange(page: number) {
  failedPageNumber.value = page
}
function onSearchPageChange(page: number) {
  searchPageNumber.value = page
}

const tableColumns = computed<TableColumn<AuditLogItem>[]>(() => [
  {
    id: 'EventDateTime',
    title: 'زمان',
    sortable: false,
    visible: true,
    render: (row) => row.EventDateTime ?? '-',
  },
  {
    id: 'EventType',
    title: 'نوع رویداد',
    sortable: false,
    visible: true,
    render: (row) => row.EventType ?? '-',
  },
  {
    id: 'EntityType',
    title: 'نوع موجودیت',
    sortable: false,
    visible: true,
    render: (row) => row.EntityType ?? '-',
  },
  {
    id: 'IsSuccess',
    title: 'وضعیت',
    sortable: false,
    visible: true,
    render: (row) =>
      h(BaseBadge, { variant: row.IsSuccess ? 'success' : 'danger', size: 'sm' }, () =>
        row.IsSuccess ? 'موفق' : 'ناموفق',
      ),
  },
  {
    id: 'UserName',
    title: 'کاربر',
    sortable: false,
    visible: true,
    render: (row) => row.UserName ?? '-',
  },
  {
    id: 'IpAddress',
    title: 'آدرس IP',
    sortable: false,
    visible: true,
    render: (row) => h('span', { dir: 'ltr', class: 'font-mono text-sm' }, row.IpAddress ?? '-'),
  },
  {
    id: 'Description',
    title: 'توضیحات',
    sortable: false,
    visible: true,
    render: (row) => {
      const desc = row.Description ?? '-'
      const text = typeof desc === 'string' && desc.length > 60 ? `${desc.slice(0, 60)}…` : desc
      return h(
        'span',
        { class: 'text-muted-foreground text-sm max-w-[200px] truncate block' },
        text,
      )
    },
  },
])

const byIdTableData = computed(() => (byIdResult.value ? [byIdResult.value] : []))
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card title="مشاهده لاگ‌ها" variant="elevated" padding="none" class="min-w-0">
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
                <BaseButton
                  variant="primary"
                  :disabled="byIdLoading"
                  @click="fetchById"
                >
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
                <TableWithSettings
                  :columns="tableColumns"
                  :data="byIdTableData"
                  :searchable="false"
                  :exportable="false"
                  :filterable="false"
                  class="w-full"
                />
              </template>
              <p
                v-else
                class="text-muted-foreground text-sm py-4"
              >
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
                      <label for="search-page-size" class="text-sm text-muted-foreground whitespace-nowrap">
                        تعداد در هر صفحه:
                      </label>
                      <select
                        id="search-page-size"
                        v-model.number="searchPageSize"
                        class="rounded-lg border border-border-default bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option
                          v-for="size in PAGE_SIZE_OPTIONS"
                          :key="size"
                          :value="size"
                        >
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
              <p
                v-else
                class="text-muted-foreground text-sm py-4"
              >
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
                  :exportable="false"
                  :filterable="true"
                  class="w-full"
                >
                  <template #filters>
                    <form @submit.prevent="applyFilters" class="space-y-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                        <FormField
                          v-model="auditFilters.FromDate"
                          label="از تاریخ"
                          type="date"
                        />
                        <FormField
                          v-model="auditFilters.ToDate"
                          label="تا تاریخ"
                          type="date"
                        />
                        <FormField
                          v-model="auditFilters.EventType"
                          label="نوع رویداد"
                          type="text"
                          placeholder="نوع رویداد"
                        />
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
                      <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-border-default">
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
                  v-if="advancedTotalPages > 1"
                  class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2"
                >
                  <p class="text-sm text-muted-foreground order-2 sm:order-1">
                    {{ advancedTotalCount }} مورد در مجموع
                  </p>
                  <Pagination
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
                  :exportable="false"
                  :filterable="false"
                  class="w-full"
                />
                <div
                  v-if="todayTotalPages > 1"
                  class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2"
                >
                  <p class="text-sm text-muted-foreground order-2 sm:order-1">
                    {{ todayTotalCount }} مورد در مجموع
                  </p>
                  <Pagination
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
                  :exportable="false"
                  :filterable="false"
                  class="w-full"
                />
                <div
                  v-if="failedTotalPages > 1"
                  class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2"
                >
                  <p class="text-sm text-muted-foreground order-2 sm:order-1">
                    {{ failedTotalCount }} مورد در مجموع
                  </p>
                  <Pagination
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
      </Card>
    </div>
  </DashboardLayout>
</template>
