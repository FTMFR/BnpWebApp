<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import type { VNode } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CustomLoader, BaseIcon, BaseButton, BaseBadge } from '@/design-system/atoms'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import BaseTabs from '@/design-system/molecules/BaseTabs.vue'
import Modal from '@/design-system/molecules/Modal.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import Pagination from '@/design-system/molecules/Pagination.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import TableWithSettings from '@/design-system/organisms/TableWithSettings.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import type {
  DataExportSettings,
  DataExportSettingsApiResponse,
  ExportRule,
  CreateExportRuleRequest,
  UpdateExportRuleRequest,
  DataMaskingRule,
  CreateMaskingRuleRequest,
  UpdateMaskingRuleRequest,
  SensitivityLevel,
  ExportAuditEntry,
  ExportStatistics,
  TestExportRequest,
} from '@/shared/types/dataExport'
import VueApexCharts from 'vue3-apexcharts'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const TAB_IDS = ['settings', 'rules', 'masking', 'sensitivity', 'audit', 'statistics', 'test'] as const

const tabItems = [
  { id: 'settings', label: 'تنظیمات' },
  { id: 'rules', label: 'قوانین خروجی' },
  { id: 'masking', label: 'قوانین پوشش' },
  { id: 'sensitivity', label: 'سطح حساسیت' },
  { id: 'audit', label: 'لاگ ممیزی' },
  { id: 'statistics', label: 'آمار' },
  { id: 'test', label: 'تست خروجی' },
]

const activeTab = ref<string>(
  (route.query.tab as string) && TAB_IDS.includes((route.query.tab as string) as (typeof TAB_IDS)[number])
    ? (route.query.tab as string)
    : 'settings'
)

watch(activeTab, (tab) => {
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab: tab || undefined } })
  }
})

watch(
  () => route.query.tab,
  (tab) => {
    if (tab && TAB_IDS.includes(tab as (typeof TAB_IDS)[number]) && activeTab.value !== tab) {
      activeTab.value = tab
    }
  },
  { immediate: true }
)

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'تنظیمات خروجی', href: '/dataexport/settings' },
]

// ---------- Settings tab ----------
const settings = ref<DataExportSettings | null>(null)
const settingsLoading = ref(true)
const settingsError = ref<string | null>(null)
const settingsForm = ref<DataExportSettings | null>(null)
const settingsSaving = ref(false)

async function fetchSettings() {
  settingsLoading.value = true
  settingsError.value = null
  try {
    const response = await apiClient.get<DataExportSettingsApiResponse | DataExportSettings>(
      endpoints.dataExport.settings
    )
    const payload = response.data as DataExportSettingsApiResponse & DataExportSettings
    const data = payload?.data ?? payload
    settings.value = data as DataExportSettings
    settingsForm.value = data ? { ...data } : null
  } catch (err) {
    console.error('Failed to fetch data export settings:', err)
    settingsError.value = 'بارگذاری تنظیمات خروجی ناموفق بود.'
    toastStore.showToast(settingsError.value, 'error')
  } finally {
    settingsLoading.value = false
  }
}

async function saveSettings() {
  if (!settingsForm.value) return
  settingsSaving.value = true
  try {
    await apiClient.put(endpoints.dataExport.settings, settingsForm.value)
    settings.value = { ...settingsForm.value }
    toastStore.showToast('تنظیمات با موفقیت ذخیره شد.', 'success')
  } catch (err) {
    console.error('Failed to save settings:', err)
    toastStore.showToast('ذخیره تنظیمات ناموفق بود.', 'error')
  } finally {
    settingsSaving.value = false
  }
}

function yesNo(value: boolean): string {
  return value ? 'بله' : 'خیر'
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} بایت`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} کیلوبایت`
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`
}

// ---------- Rules tab ----------
const rules = ref<ExportRule[]>([])
const rulesLoading = ref(false)
const rulesError = ref<string | null>(null)
const ruleModalOpen = ref(false)
const ruleEditId = ref<string | null>(null)
const ruleForm = ref<CreateExportRuleRequest>({ name: '', entityType: '', format: 'JSON', isEnabled: true })

async function fetchRules() {
  rulesLoading.value = true
  rulesError.value = null
  try {
    const response = await apiClient.get<ExportRule[]>(endpoints.dataExport.rules)
    rules.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Failed to fetch rules:', err)
    rulesError.value = 'بارگذاری قوانین خروجی ناموفق بود.'
    toastStore.showToast(rulesError.value, 'error')
    rules.value = []
  } finally {
    rulesLoading.value = false
  }
}

function openRuleCreate() {
  ruleEditId.value = null
  ruleForm.value = { name: '', description: '', entityType: '', format: 'JSON', isEnabled: true }
  ruleModalOpen.value = true
}

function openRuleEdit(rule: ExportRule) {
  ruleEditId.value = rule.id
  ruleForm.value = {
    name: rule.name ?? '',
    description: rule.description ?? '',
    entityType: rule.entityType ?? '',
    format: rule.format ?? 'JSON',
    isEnabled: rule.isEnabled ?? true,
  }
  ruleModalOpen.value = true
}

async function saveRule() {
  try {
    if (ruleEditId.value) {
      await apiClient.put(endpoints.dataExport.ruleById(ruleEditId.value), ruleForm.value)
      toastStore.showToast('قانون با موفقیت به‌روزرسانی شد.', 'success')
    } else {
      await apiClient.post(endpoints.dataExport.rules, ruleForm.value)
      toastStore.showToast('قانون با موفقیت ایجاد شد.', 'success')
    }
    ruleModalOpen.value = false
    fetchRules()
  } catch (err) {
    console.error('Failed to save rule:', err)
    toastStore.showToast('ذخیره قانون ناموفق بود.', 'error')
  }
}

async function deleteRule(id: string) {
  if (!confirm('آیا از حذف این قانون اطمینان دارید؟')) return
  try {
    await apiClient.delete(endpoints.dataExport.ruleById(id))
    toastStore.showToast('قانون حذف شد.', 'success')
    fetchRules()
  } catch (err) {
    console.error('Failed to delete rule:', err)
    toastStore.showToast('حذف قانون ناموفق بود.', 'error')
  }
}

// ---------- Masking tab ----------
const maskingRules = ref<DataMaskingRule[]>([])
const maskingLoading = ref(false)
const maskingError = ref<string | null>(null)
const maskingModalOpen = ref(false)
const maskingEditId = ref<string | null>(null)
const maskingForm = ref<CreateMaskingRuleRequest>({
  name: '',
  fieldPattern: '',
  maskingType: 'Replace',
  replacement: '*',
  isEnabled: true,
})

async function fetchMasking() {
  maskingLoading.value = true
  maskingError.value = null
  try {
    const response = await apiClient.get<DataMaskingRule[]>(endpoints.dataExport.masking)
    maskingRules.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Failed to fetch masking rules:', err)
    maskingError.value = 'بارگذاری قوانین پوشش ناموفق بود.'
    toastStore.showToast(maskingError.value, 'error')
    maskingRules.value = []
  } finally {
    maskingLoading.value = false
  }
}

function openMaskingCreate() {
  maskingEditId.value = null
  maskingForm.value = {
    name: '',
    fieldPattern: '',
    maskingType: 'Replace',
    replacement: '*',
    isEnabled: true,
  }
  maskingModalOpen.value = true
}

function openMaskingEdit(rule: DataMaskingRule) {
  maskingEditId.value = rule.id
  maskingForm.value = {
    name: rule.name ?? '',
    fieldPattern: rule.fieldPattern ?? '',
    maskingType: rule.maskingType ?? 'Replace',
    replacement: rule.replacement ?? '*',
    isEnabled: rule.isEnabled ?? true,
  }
  maskingModalOpen.value = true
}

async function saveMasking() {
  try {
    if (maskingEditId.value) {
      await apiClient.put(endpoints.dataExport.maskingById(maskingEditId.value), maskingForm.value)
      toastStore.showToast('قانون پوشش با موفقیت به‌روزرسانی شد.', 'success')
    } else {
      await apiClient.post(endpoints.dataExport.masking, maskingForm.value)
      toastStore.showToast('قانون پوشش با موفقیت ایجاد شد.', 'success')
    }
    maskingModalOpen.value = false
    fetchMasking()
  } catch (err) {
    console.error('Failed to save masking rule:', err)
    toastStore.showToast('ذخیره قانون پوشش ناموفق بود.', 'error')
  }
}

async function deleteMasking(id: string) {
  if (!confirm('آیا از حذف این قانون پوشش اطمینان دارید؟')) return
  try {
    await apiClient.delete(endpoints.dataExport.maskingById(id))
    toastStore.showToast('قانون پوشش حذف شد.', 'success')
    fetchMasking()
  } catch (err) {
    console.error('Failed to delete masking rule:', err)
    toastStore.showToast('حذف قانون پوشش ناموفق بود.', 'error')
  }
}

// ---------- Sensitivity tab ----------
const sensitivityLevels = ref<SensitivityLevel[]>([])
const sensitivityLoading = ref(false)
const sensitivityError = ref<string | null>(null)
const entityLookup = ref({ entityType: '', entityId: '' })
const entityResult = ref<SensitivityLevel | null>(null)
const entityLookupLoading = ref(false)

async function fetchSensitivityLevels() {
  sensitivityLoading.value = true
  sensitivityError.value = null
  try {
    const response = await apiClient.get<SensitivityLevel[]>(endpoints.dataExport.sensitivityLevels)
    sensitivityLevels.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Failed to fetch sensitivity levels:', err)
    sensitivityError.value = 'بارگذاری سطوح حساسیت ناموفق بود.'
    toastStore.showToast(sensitivityError.value, 'error')
    sensitivityLevels.value = []
  } finally {
    sensitivityLoading.value = false
  }
}

async function fetchSensitivityByEntity() {
  if (!entityLookup.value.entityType || !entityLookup.value.entityId) return
  entityLookupLoading.value = true
  entityResult.value = null
  try {
    const response = await apiClient.get<SensitivityLevel>(
      endpoints.dataExport.sensitivityLevelByEntity(
        entityLookup.value.entityType,
        entityLookup.value.entityId
      )
    )
    entityResult.value = response.data as SensitivityLevel
  } catch (err) {
    console.error('Failed to fetch sensitivity by entity:', err)
    toastStore.showToast('یافتن سطح حساسیت ناموفق بود.', 'error')
  } finally {
    entityLookupLoading.value = false
  }
}

// ---------- Audit log tab ----------
const auditItems = ref<ExportAuditEntry[]>([])
const auditLoading = ref(false)
const auditError = ref<string | null>(null)
const auditPage = ref(1)
const auditTotalCount = ref(0)
const auditTotalPages = ref(1)
const AUDIT_PAGE_SIZE = 20
const auditFilters = ref({
  FromDate: '',
  ToDate: '',
  UserId: '' as string | number,
  EntityType: '',
  SensitivityLevel: '',
  WasMasked: '' as '' | 'true' | 'false',
  IsSuccess: '' as '' | 'true' | 'false',
})

async function fetchAuditLog() {
  auditLoading.value = true
  auditError.value = null
  try {
    const params: Record<string, string | number | boolean | undefined> = {
      Page: auditPage.value,
      PageSize: AUDIT_PAGE_SIZE,
    }
    if (auditFilters.value.FromDate) params.FromDate = auditFilters.value.FromDate
    if (auditFilters.value.ToDate) params.ToDate = auditFilters.value.ToDate
    if (auditFilters.value.UserId) params.UserId = auditFilters.value.UserId
    if (auditFilters.value.EntityType) params.EntityType = auditFilters.value.EntityType
    if (auditFilters.value.SensitivityLevel) params.SensitivityLevel = auditFilters.value.SensitivityLevel
    if (auditFilters.value.WasMasked === 'true') params.WasMasked = true
    if (auditFilters.value.WasMasked === 'false') params.WasMasked = false
    if (auditFilters.value.IsSuccess === 'true') params.IsSuccess = true
    if (auditFilters.value.IsSuccess === 'false') params.IsSuccess = false

    const response = await apiClient.get<ExportAuditEntry[] | { items: ExportAuditEntry[]; totalCount: number; totalPages: number }>(
      endpoints.dataExport.auditLog,
      { params }
    )
    const data = response.data
    if (Array.isArray(data)) {
      auditItems.value = data
      auditTotalCount.value = data.length
      auditTotalPages.value = 1
    } else if (data && typeof data === 'object' && 'items' in data) {
      auditItems.value = data.items ?? []
      auditTotalCount.value = data.totalCount ?? 0
      auditTotalPages.value = data.totalPages ?? 1
    } else {
      auditItems.value = []
      auditTotalCount.value = 0
      auditTotalPages.value = 1
    }
  } catch (err) {
    console.error('Failed to fetch audit log:', err)
    auditError.value = 'بارگذاری لاگ ممیزی ناموفق بود.'
    toastStore.showToast(auditError.value, 'error')
    auditItems.value = []
    auditTotalCount.value = 0
    auditTotalPages.value = 1
  } finally {
    auditLoading.value = false
  }
}

function onAuditPageChange(page: number) {
  auditPage.value = page
  fetchAuditLog()
}

function clearAuditFilters() {
  auditFilters.value = {
    FromDate: '',
    ToDate: '',
    UserId: '',
    EntityType: '',
    SensitivityLevel: '',
    WasMasked: '',
    IsSuccess: '',
  }
  auditPage.value = 1
  fetchAuditLog()
}

// ---------- Statistics tab ----------
const statistics = ref<ExportStatistics | null>(null)
const statisticsLoading = ref(false)
const statisticsError = ref<string | null>(null)

async function fetchStatistics() {
  statisticsLoading.value = true
  statisticsError.value = null
  try {
    const response = await apiClient.get<ExportStatistics>(endpoints.dataExport.statistics)
    statistics.value = response.data as ExportStatistics
  } catch (err) {
    console.error('Failed to fetch statistics:', err)
    statisticsError.value = 'بارگذاری آمار ناموفق بود.'
    toastStore.showToast(statisticsError.value, 'error')
    statistics.value = null
  } finally {
    statisticsLoading.value = false
  }
}

const statisticsChartOptions = computed(() => {
  const s = statistics.value
  const byFormat = s?.exportsByFormat ?? {}
  const labels = Object.keys(byFormat)
  const data = Object.values(byFormat)
  return {
    chart: { type: 'donut' as const },
    labels,
    series: data,
    legend: { position: 'bottom' },
  }
})

const statisticsSeries = computed(() => {
  const s = statistics.value
  const byFormat = s?.exportsByFormat ?? {}
  return Object.values(byFormat)
})

// ---------- Test tab ----------
const testForm = ref<TestExportRequest>({
  entityType: '',
  entityId: '',
  format: 'JSON',
  recordLimit: 100,
})
const testSubmitting = ref(false)
const testResult = ref<'success' | 'error' | null>(null)

async function submitTest() {
  testSubmitting.value = true
  testResult.value = null
  try {
    await apiClient.post(endpoints.dataExport.test, testForm.value)
    testResult.value = 'success'
    toastStore.showToast('تست خروجی با موفقیت انجام شد.', 'success')
  } catch (err) {
    console.error('Test export failed:', err)
    testResult.value = 'error'
    toastStore.showToast('تست خروجی ناموفق بود.', 'error')
  } finally {
    testSubmitting.value = false
  }
}

// ---------- Table columns ----------
type TableColumn<T = Record<string, unknown>> = {
  id: string
  title: string
  sortable?: boolean
  visible?: boolean
  render?: (row: T, index?: number) => VNode | string | number
}

const rulesColumns = computed<TableColumn<ExportRule>[]>(() => [
  { id: 'name', title: 'نام', sortable: false, visible: true, render: (row) => row.name ?? '-' },
  { id: 'entityType', title: 'نوع موجودیت', sortable: false, visible: true, render: (row) => row.entityType ?? '-' },
  { id: 'format', title: 'فرمت', sortable: false, visible: true, render: (row) => row.format ?? '-' },
  {
    id: 'isEnabled',
    title: 'فعال',
    sortable: false,
    visible: true,
    render: (row) => (row.isEnabled ? 'بله' : 'خیر'),
  },
  {
    id: 'actions',
    title: 'عملیات',
    sortable: false,
    visible: true,
    render: (row) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          BaseButton,
          { size: 'sm', variant: 'ghost', onClick: () => openRuleEdit(row) },
          () => 'ویرایش'
        ),
        h(
          BaseButton,
          { size: 'sm', variant: 'ghost', onClick: () => deleteRule(row.id) },
          () => 'حذف'
        ),
      ]),
  },
])

const maskingColumns = computed<TableColumn<DataMaskingRule>[]>(() => [
  { id: 'name', title: 'نام', sortable: false, visible: true, render: (row) => row.name ?? '-' },
  { id: 'fieldPattern', title: 'الگوی فیلد', sortable: false, visible: true, render: (row) => row.fieldPattern ?? '-' },
  { id: 'maskingType', title: 'نوع پوشش', sortable: false, visible: true, render: (row) => row.maskingType ?? '-' },
  {
    id: 'isEnabled',
    title: 'فعال',
    sortable: false,
    visible: true,
    render: (row) => (row.isEnabled ? 'بله' : 'خیر'),
  },
  {
    id: 'actions',
    title: 'عملیات',
    sortable: false,
    visible: true,
    render: (row) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          BaseButton,
          { size: 'sm', variant: 'ghost', onClick: () => openMaskingEdit(row) },
          () => 'ویرایش'
        ),
        h(
          BaseButton,
          { size: 'sm', variant: 'ghost', onClick: () => deleteMasking(row.id) },
          () => 'حذف'
        ),
      ]),
  },
])

const auditColumns = computed<TableColumn<ExportAuditEntry>[]>(() => [
  { id: 'exportDate', title: 'تاریخ', sortable: false, visible: true, render: (row) => row.exportDate ?? '-' },
  { id: 'userName', title: 'کاربر', sortable: false, visible: true, render: (row) => row.userName ?? '-' },
  { id: 'entityType', title: 'نوع موجودیت', sortable: false, visible: true, render: (row) => row.entityType ?? '-' },
  { id: 'sensitivityLevel', title: 'سطح حساسیت', sortable: false, visible: true, render: (row) => row.sensitivityLevel ?? '-' },
  {
    id: 'isSuccess',
    title: 'وضعیت',
    sortable: false,
    visible: true,
    render: (row) =>
      h(BaseBadge, { variant: row.isSuccess ? 'success' : 'danger', size: 'sm' }, () =>
        row.isSuccess ? 'موفق' : 'ناموفق'
      ),
  },
])

// ---------- Lifecycle ----------
function fetchActiveTabData(tab: string) {
  if (tab === 'rules') fetchRules()
  else if (tab === 'masking') fetchMasking()
  else if (tab === 'sensitivity') fetchSensitivityLevels()
  else if (tab === 'audit') fetchAuditLog()
  else if (tab === 'statistics') fetchStatistics()
}

onMounted(() => {
  fetchSettings()
  fetchActiveTabData(activeTab.value)
})

watch(activeTab, (tab) => {
  fetchActiveTabData(tab)
})
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <BaseTabs v-model="activeTab" :items="tabItems" variant="default">
        <template #default="{ activeTab: currentTab }">
          <!-- Settings tab -->
          <div v-if="currentTab === 'settings'" class="min-w-0 space-y-4">
            <div v-if="settingsLoading" class="flex items-center justify-center min-h-[320px]">
              <CustomLoader size="lg" />
            </div>
            <template v-else-if="settingsError">
              <Card variant="elevated" padding="md" class="min-w-0">
                <p class="text-muted-foreground text-center py-8">{{ settingsError }}</p>
              </Card>
            </template>
            <template v-else-if="settingsForm">
              <Card title="تنظیمات خروجی" variant="elevated" padding="none" class="min-w-0">
                <div class="p-4 sm:p-6 space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField v-model.number="settingsForm.MaxRecordsPerExport" label="حداکثر رکورد در هر خروجی" type="number" />
                    <FormField v-model.number="settingsForm.MaxExportSizeBytes" label="حداکثر حجم (بایت)" type="number" />
                    <FormField v-model="settingsForm.DefaultSensitivityLevel" label="سطح حساسیت پیش‌فرض" type="text" />
                    <FormField v-model.number="settingsForm.AuditLogRetentionDays" label="نگهداری لاگ ممیزی (روز)" type="number" />
                    <FormField v-model="settingsForm.SignatureAlgorithm" label="الگوریتم امضا" type="text" />
                  </div>
                  <div class="flex flex-wrap gap-4 items-center">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="settingsForm.IsEnabled" type="checkbox" class="rounded border-border-default" />
                      <span class="text-sm text-muted-foreground">فعال بودن خروجی</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="settingsForm.EnableDigitalSignature" type="checkbox" class="rounded border-border-default" />
                      <span class="text-sm text-muted-foreground">امضای دیجیتال</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="settingsForm.EnableDataMasking" type="checkbox" class="rounded border-border-default" />
                      <span class="text-sm text-muted-foreground">پوشش داده</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="settingsForm.EnableExportAudit" type="checkbox" class="rounded border-border-default" />
                      <span class="text-sm text-muted-foreground">ممیزی خروجی</span>
                    </label>
                  </div>
                  <div class="pt-2">
                    <BaseButton :disabled="settingsSaving" @click="saveSettings">
                      {{ settingsSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات' }}
                    </BaseButton>
                  </div>
                </div>
              </Card>
              <Card title="پیش‌نمایش (فقط نمایش)" variant="elevated" padding="none" class="min-w-0">
                <div class="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                    <p class="text-xs text-muted-foreground">فعال بودن خروجی</p>
                    <p class="text-sm font-semibold">{{ yesNo(settingsForm.IsEnabled) }}</p>
                  </div>
                  <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                    <p class="text-xs text-muted-foreground">حداکثر رکورد</p>
                    <p class="text-sm font-semibold">{{ settingsForm.MaxRecordsPerExport?.toLocaleString('fa-IR') }}</p>
                  </div>
                  <div class="rounded-lg border border-border-default bg-muted/30 p-3">
                    <p class="text-xs text-muted-foreground">حداکثر حجم</p>
                    <p class="text-sm font-semibold">{{ formatBytes(settingsForm.MaxExportSizeBytes ?? 0) }}</p>
                  </div>
                  <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:col-span-2">
                    <p class="text-xs text-muted-foreground">فرمت‌های مجاز</p>
                    <p class="text-sm">{{ (settingsForm.AllowedFormats ?? []).join(', ') || '-' }}</p>
                  </div>
                </div>
              </Card>
            </template>
          </div>

          <!-- Rules tab -->
          <div v-if="currentTab === 'rules'" class="min-w-0 space-y-4">
            <Card variant="elevated" padding="none" class="min-w-0">
              <div class="p-4 sm:p-6 flex justify-end">
                <BaseButton @click="openRuleCreate">افزودن قانون</BaseButton>
              </div>
              <div v-if="rulesLoading" class="flex items-center justify-center min-h-[200px]">
                <CustomLoader size="lg" />
              </div>
              <template v-else-if="rulesError">
                <p class="text-muted-foreground text-center py-8 px-4">{{ rulesError }}</p>
              </template>
              <div v-else class="p-4 sm:p-6 pt-0 overflow-x-auto">
                <TableWithSettings
                  :columns="rulesColumns"
                  :data="rules"
                  :searchable="true"
                  :exportable="false"
                  class="w-full"
                />
              </div>
            </Card>
            <Modal v-model="ruleModalOpen" title="قانون خروجی" size="md">
              <div class="space-y-4 p-4">
                <FormField v-model="ruleForm.name" label="نام" type="text" />
                <FormField v-model="ruleForm.description" label="توضیحات" type="textarea" />
                <FormField v-model="ruleForm.entityType" label="نوع موجودیت" type="text" />
                <FormField v-model="ruleForm.format" label="فرمت" type="text" />
                <div class="flex items-center gap-2">
                  <input v-model="ruleForm.isEnabled" type="checkbox" class="rounded border-border-default" />
                  <span class="text-sm">فعال</span>
                </div>
                <div class="flex gap-2 justify-end pt-2">
                  <BaseButton variant="ghost" @click="ruleModalOpen = false">انصراف</BaseButton>
                  <BaseButton @click="saveRule">ذخیره</BaseButton>
                </div>
              </div>
            </Modal>
          </div>

          <!-- Masking tab -->
          <div v-if="currentTab === 'masking'" class="min-w-0 space-y-4">
            <Card variant="elevated" padding="none" class="min-w-0">
              <div class="p-4 sm:p-6 flex justify-end">
                <BaseButton @click="openMaskingCreate">افزودن قانون پوشش</BaseButton>
              </div>
              <div v-if="maskingLoading" class="flex items-center justify-center min-h-[200px]">
                <CustomLoader size="lg" />
              </div>
              <template v-else-if="maskingError">
                <p class="text-muted-foreground text-center py-8 px-4">{{ maskingError }}</p>
              </template>
              <div v-else class="p-4 sm:p-6 pt-0 overflow-x-auto">
                <TableWithSettings
                  :columns="maskingColumns"
                  :data="maskingRules"
                  :searchable="true"
                  :exportable="false"
                  class="w-full"
                />
              </div>
            </Card>
            <Modal v-model="maskingModalOpen" title="قانون پوشش" size="md">
              <div class="space-y-4 p-4">
                <FormField v-model="maskingForm.name" label="نام" type="text" />
                <FormField v-model="maskingForm.fieldPattern" label="الگوی فیلد" type="text" />
                <FormField v-model="maskingForm.maskingType" label="نوع پوشش" type="text" />
                <FormField v-model="maskingForm.replacement" label="جایگزین" type="text" />
                <div class="flex items-center gap-2">
                  <input v-model="maskingForm.isEnabled" type="checkbox" class="rounded border-border-default" />
                  <span class="text-sm">فعال</span>
                </div>
                <div class="flex gap-2 justify-end pt-2">
                  <BaseButton variant="ghost" @click="maskingModalOpen = false">انصراف</BaseButton>
                  <BaseButton @click="saveMasking">ذخیره</BaseButton>
                </div>
              </div>
            </Modal>
          </div>

          <!-- Sensitivity tab -->
          <div v-if="currentTab === 'sensitivity'" class="min-w-0 space-y-4">
            <Card title="جستجو بر اساس موجودیت" variant="elevated" padding="md" class="min-w-0">
              <div class="flex flex-wrap gap-4 items-end">
                <FormField v-model="entityLookup.entityType" label="نوع موجودیت" type="text" class="min-w-[120px]" />
                <FormField v-model="entityLookup.entityId" label="شناسه موجودیت" type="text" class="min-w-[120px]" />
                <BaseButton :disabled="entityLookupLoading" @click="fetchSensitivityByEntity">
                  {{ entityLookupLoading ? 'در حال جستجو...' : 'جستجو' }}
                </BaseButton>
              </div>
              <div v-if="entityResult" class="mt-4 p-4 rounded-lg border border-border-default bg-muted/30">
                <p class="text-sm font-semibold">سطح حساسیت: {{ entityResult.level ?? entityResult.name ?? '-' }}</p>
              </div>
            </Card>
            <Card title="لیست سطوح حساسیت" variant="elevated" padding="none" class="min-w-0">
              <div v-if="sensitivityLoading" class="flex items-center justify-center min-h-[200px]">
                <CustomLoader size="lg" />
              </div>
              <template v-else-if="sensitivityError">
                <p class="text-muted-foreground text-center py-8 px-4">{{ sensitivityError }}</p>
              </template>
              <div v-else class="p-4 sm:p-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    v-for="(level, i) in sensitivityLevels"
                    :key="level.id ?? i"
                    class="rounded-lg border border-border-default bg-muted/30 p-3"
                  >
                    <p class="text-sm font-semibold">{{ level.name ?? level.level ?? '-' }}</p>
                    <p class="text-xs text-muted-foreground">{{ level.description ?? '' }}</p>
                  </div>
                </div>
                <p v-if="sensitivityLevels.length === 0" class="text-muted-foreground text-center py-4">موردی یافت نشد.</p>
              </div>
            </Card>
          </div>

          <!-- Audit log tab -->
          <div v-if="currentTab === 'audit'" class="min-w-0 space-y-4">
            <Card variant="elevated" padding="none" class="min-w-0">
              <div class="p-4 sm:p-6">
                <div v-if="auditLoading" class="flex items-center justify-center min-h-[200px]">
                  <CustomLoader size="lg" />
                </div>
                <template v-else-if="auditError">
                  <p class="text-muted-foreground text-center py-8 px-4">{{ auditError }}</p>
                </template>
                <template v-else>
                  <div class="overflow-x-auto">
                    <TableWithSettings
                      :columns="auditColumns"
                      :data="auditItems"
                      :searchable="false"
                      :exportable="false"
                      :filterable="true"
                      class="w-full"
                    >
                      <template #filters>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                          <FormField v-model="auditFilters.FromDate" label="از تاریخ" type="date" />
                          <FormField v-model="auditFilters.ToDate" label="تا تاریخ" type="date" />
                          <FormField v-model="auditFilters.EntityType" label="نوع موجودیت" type="text" />
                          <FormField v-model="auditFilters.SensitivityLevel" label="سطح حساسیت" type="text" />
                          <FormField v-model="auditFilters.UserId" label="شناسه کاربر" type="number" />
                          <div class="flex flex-col gap-1">
                            <label class="text-sm font-medium text-foreground">وضعیت موفقیت</label>
                            <select
                              v-model="auditFilters.IsSuccess"
                              class="rounded-lg border border-border-default bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-white dark:text-gray-900"
                            >
                              <option value="">همه</option>
                              <option value="true">موفق</option>
                              <option value="false">ناموفق</option>
                            </select>
                          </div>
                        </div>
                        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-border-default">
                          <BaseButton variant="outline" class="border-2 border-primary-500 text-primary-600" @click="fetchAuditLog">
                            <BaseIcon name="Search" :size="16" />
                            اعمال فیلتر
                          </BaseButton>
                          <BaseButton
                            variant="outline"
                            @click="clearAuditFilters"
                          >
                            <BaseIcon name="RefreshCw" :size="16" />
                            پاک کردن فیلترها
                          </BaseButton>
                        </div>
                      </template>
                    </TableWithSettings>
                  </div>
                  <div
                    v-if="auditTotalPages > 1"
                    class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"
                  >
                    <p class="text-sm text-muted-foreground">{{ auditTotalCount }} مورد</p>
                    <Pagination
                      :current-page="auditPage"
                      :total-pages="auditTotalPages"
                      @update:current-page="onAuditPageChange"
                      @change="onAuditPageChange"
                    />
                  </div>
                </template>
              </div>
            </Card>
          </div>

          <!-- Statistics tab -->
          <div v-if="currentTab === 'statistics'" class="min-w-0 space-y-4">
            <div v-if="statisticsLoading" class="flex items-center justify-center min-h-[320px]">
              <CustomLoader size="lg" />
            </div>
            <template v-else-if="statisticsError">
              <Card variant="elevated" padding="md" class="min-w-0">
                <p class="text-muted-foreground text-center py-8">{{ statisticsError }}</p>
              </Card>
            </template>
            <template v-else-if="statistics">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="elevated" padding="md" class="min-w-0">
                  <p class="text-xs text-muted-foreground">کل خروجی‌ها</p>
                  <p class="text-2xl font-semibold">{{ (statistics.totalExports ?? 0).toLocaleString('fa-IR') }}</p>
                </Card>
                <Card variant="elevated" padding="md" class="min-w-0">
                  <p class="text-xs text-muted-foreground">موفق</p>
                  <p class="text-2xl font-semibold text-green-600">{{ (statistics.successCount ?? 0).toLocaleString('fa-IR') }}</p>
                </Card>
                <Card variant="elevated" padding="md" class="min-w-0">
                  <p class="text-xs text-muted-foreground">ناموفق</p>
                  <p class="text-2xl font-semibold text-red-600">{{ (statistics.failureCount ?? 0).toLocaleString('fa-IR') }}</p>
                </Card>
                <Card variant="elevated" padding="md" class="min-w-0">
                  <p class="text-xs text-muted-foreground">رکوردهای خروجی شده</p>
                  <p class="text-2xl font-semibold">{{ (statistics.totalRecordsExported ?? 0).toLocaleString('fa-IR') }}</p>
                </Card>
              </div>
              <Card v-if="statisticsSeries.length > 0" variant="elevated" padding="md" class="min-w-0">
                <p class="text-sm font-semibold mb-4">خروجی به تفکیک فرمت</p>
                <VueApexCharts
                  type="donut"
                  :options="{ chart: { type: 'donut' }, labels: Object.keys(statistics.exportsByFormat ?? {}), legend: { position: 'bottom' } }"
                  :series="statisticsSeries"
                  height="280"
                />
              </Card>
            </template>
          </div>

          <!-- Test tab -->
          <div v-if="currentTab === 'test'" class="min-w-0">
            <Card title="تست خروجی" variant="elevated" padding="md" class="min-w-0">
              <div class="space-y-4 max-w-md">
                <FormField v-model="testForm.entityType" label="نوع موجودیت" type="text" />
                <FormField v-model="testForm.entityId" label="شناسه موجودیت" type="text" />
                <FormField v-model="testForm.format" label="فرمت" type="text" />
                <FormField v-model.number="testForm.recordLimit" label="حداکثر رکورد" type="number" />
                <BaseButton :disabled="testSubmitting" @click="submitTest">
                  {{ testSubmitting ? 'در حال اجرا...' : 'اجرای تست' }}
                </BaseButton>
                <p v-if="testResult === 'success'" class="text-sm text-green-600">تست با موفقیت انجام شد.</p>
                <p v-if="testResult === 'error'" class="text-sm text-red-600">تست ناموفق بود.</p>
              </div>
            </Card>
          </div>
        </template>
      </BaseTabs>
    </div>
  </DashboardLayout>
</template>
