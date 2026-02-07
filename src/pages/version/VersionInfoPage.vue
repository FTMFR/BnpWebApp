<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseButton, CustomLoader } from '@/design-system/atoms'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type {
  ComputeHashRequest,
  MetadataSignatureRequest,
  ProblemDetails,
  PublicKeyInfoResponse,
  SignatureStatusResponse,
  SignatureVerificationRequest,
  VersionCheckResponse,
  VersionCurrentResponse,
} from '@/shared/api/types'
import { useToastStore } from '@/stores/toast'
import { AxiosError } from 'axios'

interface VersionBlock {
  Version?: string
  BuildDate?: string | null
  BuildNumber?: string | null
  Description?: string | null
  UpdateUrl?: string | null
  Changelog?: string | null
}

interface EnvironmentBlock {
  name: string
  machineName: string
  osVersion: string
  dotNetVersion: string
  processorCount: number
  is64Bit: boolean
  timeZone: string
}

interface ApplicationBlock {
  assemblyName: string
  assemblyVersion: string
  fileVersion: string
  workingDirectory: string
}

interface DockerBlock {
  containerId: string
  isDocker: boolean
}

interface VersionInfoResponse {
  backend: VersionBlock
  frontend: VersionBlock
  environment: EnvironmentBlock
  application: ApplicationBlock
  docker: DockerBlock
}

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'اطلاعات سیستم', href: '/version/info' },
]

const info = ref<VersionInfoResponse | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const toastStore = useToastStore()

// Health (GET /health)
const healthStatus = ref<'در دسترس' | 'غیرفعال' | null>(null)
const healthLoading = ref(false)

// Signature (GET signature/status, public-key-info)
const signatureStatus = ref<SignatureStatusResponse | null>(null)
const signatureStatusError = ref<string | null>(null)
const publicKeyInfo = ref<PublicKeyInfoResponse | null>(null)
const publicKeyInfoError = ref<string | null>(null)

// Current version (GET version.current, version.frontend.current)
const currentBackendVersion = ref<string | null>(null)
const currentFrontendVersion = ref<string | null>(null)
const currentVersionLoading = ref(false)

// Version check (optional card)
const backendCheckVersion = ref('')
const frontendCheckVersion = ref('')
const backendCheckResult = ref<VersionCheckResponse | null>(null)
const frontendCheckResult = ref<VersionCheckResponse | null>(null)
const backendCheckLoading = ref(false)
const frontendCheckLoading = ref(false)

// Signature POST tools (verify, verify-metadata, compute-hash)
const verifyBody = ref('{}')
const verifyResult = ref<string | null>(null)
const verifyLoading = ref(false)
const verifyMetadataBody = ref('{}')
const verifyMetadataResult = ref<string | null>(null)
const verifyMetadataLoading = ref(false)
const computeHashBody = ref('{}')
const computeHashResult = ref<string | null>(null)
const computeHashLoading = ref(false)

async function fetchInfo() {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await apiClient.get<VersionInfoResponse>(endpoints.version.info)
    info.value = response.data
  } catch (err) {
    console.error('Failed to fetch version info:', err)
    loadError.value = 'بارگذاری اطلاعات سیستم ناموفق بود.'
    toastStore.showToast(loadError.value, 'error')
  } finally {
    isLoading.value = false
  }
}

async function fetchCurrentVersions() {
  currentVersionLoading.value = true
  currentBackendVersion.value = null
  currentFrontendVersion.value = null
  try {
    const [backendRes, frontendRes] = await Promise.all([
      apiClient.get<VersionCurrentResponse>(endpoints.version.current),
      apiClient.get<VersionCurrentResponse>(endpoints.version.frontend.current),
    ])
    const b = backendRes.data
    currentBackendVersion.value = b?.Version ?? b?.version ?? '—'
    const f = frontendRes.data
    currentFrontendVersion.value = f?.Version ?? f?.version ?? '—'
  } catch {
    currentBackendVersion.value = null
    currentFrontendVersion.value = null
  } finally {
    currentVersionLoading.value = false
  }
}

async function fetchHealth() {
  healthLoading.value = true
  healthStatus.value = null
  try {
    const response = await apiClient.get(endpoints.health, { timeout: 5000 })
    healthStatus.value = response.status === 200 ? 'در دسترس' : 'غیرفعال'
  } catch (err) {
    const status = err instanceof AxiosError ? err.response?.status : null
    healthStatus.value = status === 503 ? 'غیرفعال' : 'غیرفعال'
  } finally {
    healthLoading.value = false
  }
}

async function fetchSignatureStatus() {
  signatureStatusError.value = null
  try {
    const response = await apiClient.get<SignatureStatusResponse>(
      endpoints.version.signature.status,
    )
    signatureStatus.value = response.data
  } catch {
    signatureStatus.value = null
    signatureStatusError.value = '—'
  }
}

async function fetchPublicKeyInfo() {
  publicKeyInfoError.value = null
  try {
    const response = await apiClient.get<PublicKeyInfoResponse>(
      endpoints.version.signature.publicKeyInfo,
    )
    publicKeyInfo.value = response.data
  } catch {
    publicKeyInfo.value = null
    publicKeyInfoError.value = '—'
  }
}

async function checkBackendVersion() {
  if (!backendCheckVersion.value.trim()) return
  backendCheckLoading.value = true
  backendCheckResult.value = null
  try {
    const response = await apiClient.get<VersionCheckResponse>(
      endpoints.version.check(backendCheckVersion.value.trim()),
    )
    backendCheckResult.value = response.data ?? null
  } catch (err) {
    if (err instanceof AxiosError && err.response?.data) {
      const data = err.response.data as VersionCheckResponse & { message?: string; Message?: string }
      backendCheckResult.value = { ...data, Message: data.Message ?? data.message ?? 'خطا در بررسی' }
    } else {
      backendCheckResult.value = { Message: 'خطا در بررسی' }
    }
  } finally {
    backendCheckLoading.value = false
  }
}

async function checkFrontendVersion() {
  if (!frontendCheckVersion.value.trim()) return
  frontendCheckLoading.value = true
  frontendCheckResult.value = null
  try {
    const response = await apiClient.get<VersionCheckResponse>(
      endpoints.version.frontend.check(frontendCheckVersion.value.trim()),
    )
    frontendCheckResult.value = response.data ?? null
  } catch (err) {
    if (err instanceof AxiosError && err.response?.data) {
      const data = err.response.data as VersionCheckResponse & { message?: string; Message?: string }
      frontendCheckResult.value = { ...data, Message: data.Message ?? data.message ?? 'خطا در بررسی' }
    } else {
      frontendCheckResult.value = { Message: 'خطا در بررسی' }
    }
  } finally {
    frontendCheckLoading.value = false
  }
}

/** آیا نتیجه بررسی نسخه خطا است (از catch) */
function versionCheckIsError(r: VersionCheckResponse | null): boolean {
  if (!r) return false
  return !!(r.Message ?? r.message) && (r.currentVersion == null && r.isUpToDate == null && r.isCurrent == null)
}

async function submitVerify() {
  verifyResult.value = null
  verifyLoading.value = true
  try {
    let body: SignatureVerificationRequest
    try {
      body = JSON.parse(verifyBody.value) as SignatureVerificationRequest
    } catch {
      verifyResult.value = 'JSON نامعتبر است.'
      verifyLoading.value = false
      return
    }
    const response = await apiClient.post(endpoints.version.signature.verify, body)
    verifyResult.value =
      typeof response.data === 'object'
        ? JSON.stringify(response.data, null, 2)
        : String(response.data ?? 'موفق')
  } catch (err) {
    if (err instanceof AxiosError && err.response?.data) {
      const data = err.response.data as ProblemDetails
      verifyResult.value = `خطا (${err.response.status}): ${data.detail ?? data.title ?? JSON.stringify(data)}`
    } else {
      verifyResult.value = err instanceof Error ? err.message : 'خطا در ارسال درخواست'
    }
  } finally {
    verifyLoading.value = false
  }
}

async function submitVerifyMetadata() {
  verifyMetadataResult.value = null
  verifyMetadataLoading.value = true
  try {
    let body: MetadataSignatureRequest
    try {
      body = JSON.parse(verifyMetadataBody.value) as MetadataSignatureRequest
    } catch {
      verifyMetadataResult.value = 'JSON نامعتبر است.'
      verifyMetadataLoading.value = false
      return
    }
    const response = await apiClient.post(endpoints.version.signature.verifyMetadata, body)
    verifyMetadataResult.value =
      typeof response.data === 'object'
        ? JSON.stringify(response.data, null, 2)
        : String(response.data ?? 'موفق')
  } catch (err) {
    if (err instanceof AxiosError && err.response?.data) {
      const data = err.response.data as ProblemDetails
      verifyMetadataResult.value = `خطا (${err.response.status}): ${data.detail ?? data.title ?? JSON.stringify(data)}`
    } else {
      verifyMetadataResult.value = err instanceof Error ? err.message : 'خطا در ارسال درخواست'
    }
  } finally {
    verifyMetadataLoading.value = false
  }
}

async function submitComputeHash() {
  computeHashResult.value = null
  computeHashLoading.value = true
  try {
    let body: ComputeHashRequest
    try {
      body = JSON.parse(computeHashBody.value) as ComputeHashRequest
    } catch {
      computeHashResult.value = 'JSON نامعتبر است.'
      computeHashLoading.value = false
      return
    }
    const response = await apiClient.post(endpoints.version.signature.computeHash, body)
    computeHashResult.value =
      typeof response.data === 'object'
        ? JSON.stringify(response.data, null, 2)
        : String(response.data ?? 'موفق')
  } catch (err) {
    if (err instanceof AxiosError && err.response?.data) {
      const data = err.response.data as ProblemDetails
      computeHashResult.value = `خطا (${err.response.status}): ${data.detail ?? data.title ?? JSON.stringify(data)}`
    } else {
      computeHashResult.value = err instanceof Error ? err.message : 'خطا در ارسال درخواست'
    }
  } finally {
    computeHashLoading.value = false
  }
}

function signatureStatusText(): string {
  if (signatureStatusError.value) return signatureStatusError.value
  const s = signatureStatus.value
  if (!s) return '—'
  const status = s.Status ?? s.status
  const msg = s.Message ?? s.message
  if (status) return msg ? `${status}: ${msg}` : status
  return msg ?? '—'
}

function publicKeyInfoText(): string {
  if (publicKeyInfoError.value) return publicKeyInfoError.value
  const p = publicKeyInfo.value
  if (!p) return '—'
  const algo = p.Algorithm ?? p.algorithm
  const thumb = p.Thumbprint ?? p.thumbprint
  const parts: string[] = []
  if (algo) parts.push(`الگوریتم: ${algo}`)
  if (thumb) parts.push(`اثر: ${thumb}`)
  return parts.length ? parts.join(' | ') : '—'
}

function formatDate(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  try {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString('fa-IR')
  } catch {
    return value
  }
}

function formatBool(value: boolean): string {
  return value ? 'بله' : 'خیر'
}

onMounted(async () => {
  await fetchInfo()
  fetchHealth()
  fetchCurrentVersions()
  fetchSignatureStatus()
  fetchPublicKeyInfo()
})
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <div v-if="isLoading" class="flex items-center justify-center min-h-[320px]">
        <CustomLoader size="lg" />
      </div>

      <template v-else-if="loadError">
        <Card variant="elevated" padding="md" class="min-w-0">
          <p class="text-muted-foreground text-center py-8">{{ loadError }}</p>
        </Card>
      </template>

      <template v-else-if="info">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <!-- وضعیت سرویس (Health) -->
          <Card
            title="وضعیت سرویس"
            description="دسترسی به سرویس"
            variant="elevated"
            padding="none"
            class="min-w-0"
          >
            <div class="p-4 sm:p-6 space-y-3">
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm items-center">
                <span class="text-muted-foreground min-w-[7rem]">وضعیت</span>
                <span v-if="healthLoading" class="text-muted-foreground">در حال بررسی...</span>
                <span
                  v-else
                  :class="[
                    'font-medium',
                    healthStatus === 'در دسترس'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground',
                  ]"
                >
                  {{ healthStatus ?? '—' }}
                </span>
              </div>
            </div>
          </Card>

          <!-- نسخه جاری از API (version.current, version.frontend.current) -->
          <Card
            title="نسخه جاری از API"
            description="نسخه بک‌اند و فرانت‌اند از endpointهای current"
            variant="elevated"
            padding="none"
            class="min-w-0"
          >
            <div class="p-4 sm:p-6 space-y-3">
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm items-center">
                <span class="text-muted-foreground min-w-[7rem]">بک‌اند</span>
                <span v-if="currentVersionLoading" class="text-muted-foreground"
                  >در حال بارگذاری...</span
                >
                <span v-else class="text-foreground font-medium">{{
                  currentBackendVersion ?? '—'
                }}</span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm items-center">
                <span class="text-muted-foreground min-w-[7rem]">فرانت‌اند</span>
                <span v-if="currentVersionLoading" class="text-muted-foreground"
                  >در حال بارگذاری...</span
                >
                <span v-else class="text-foreground font-medium">{{
                  currentFrontendVersion ?? '—'
                }}</span>
              </div>
            </div>
          </Card>

          <!-- Backend -->
          <Card
            title="بک‌اند"
            description="نسخه و تاریخ ساخت سرویس"
            variant="elevated"
            padding="none"
            class="min-w-0"
          >
            <div class="p-4 sm:p-6 space-y-3">
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[7rem]">نسخه</span>
                <span class="text-foreground font-medium">{{ info.backend.Version ?? '—' }}</span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[7rem]">تاریخ ساخت</span>
                <span class="text-foreground">{{ formatDate(info.backend.BuildDate) }}</span>
              </div>
              <div v-if="info.backend.BuildNumber" class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[7rem]">شماره ساخت</span>
                <span class="text-foreground">{{ info.backend.BuildNumber }}</span>
              </div>
              <div v-if="info.backend.Description" class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[7rem]">توضیحات</span>
                <span class="text-foreground">{{ info.backend.Description }}</span>
              </div>
            </div>
          </Card>

          <!-- Frontend -->
          <Card
            title="فرانت‌اند"
            description="نسخه و اطلاعات اپلیکیشن وب"
            variant="elevated"
            padding="none"
            class="min-w-0"
          >
            <div class="p-4 sm:p-6 space-y-3">
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[7rem]">نسخه</span>
                <span class="text-foreground font-medium">{{ info.frontend.Version ?? '—' }}</span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[7rem]">تاریخ ساخت</span>
                <span class="text-foreground">{{ formatDate(info.frontend.BuildDate) }}</span>
              </div>
              <div v-if="info.frontend.BuildNumber" class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[7rem]">شماره ساخت</span>
                <span class="text-foreground">{{ info.frontend.BuildNumber }}</span>
              </div>
              <div v-if="info.frontend.Description" class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[7rem]">توضیحات</span>
                <span class="text-foreground">{{ info.frontend.Description }}</span>
              </div>
            </div>
          </Card>

          <!-- Environment -->
          <Card
            title="محیط اجرا"
            description="سیستم‌عامل و زمان‌بندی"
            variant="elevated"
            padding="none"
            class="min-w-0 lg:col-span-2"
          >
            <div class="p-4 sm:p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <div class="flex flex-col gap-1 text-sm">
                  <span class="text-muted-foreground">محیط</span>
                  <span class="text-foreground font-medium">{{ info.environment.name }}</span>
                </div>
                <div class="flex flex-col gap-1 text-sm">
                  <span class="text-muted-foreground">نام ماشین</span>
                  <span class="text-foreground">{{ info.environment.machineName }}</span>
                </div>
                <div class="flex flex-col gap-1 text-sm">
                  <span class="text-muted-foreground">سیستم‌عامل</span>
                  <span class="text-foreground break-all">{{ info.environment.osVersion }}</span>
                </div>
                <div class="flex flex-col gap-1 text-sm">
                  <span class="text-muted-foreground">نسخه .NET</span>
                  <span class="text-foreground">{{ info.environment.dotNetVersion }}</span>
                </div>
                <div class="flex flex-col gap-1 text-sm">
                  <span class="text-muted-foreground">تعداد پردازنده</span>
                  <span class="text-foreground">{{ info.environment.processorCount }}</span>
                </div>
                <div class="flex flex-col gap-1 text-sm">
                  <span class="text-muted-foreground">۶۴ بیتی</span>
                  <span class="text-foreground">{{ formatBool(info.environment.is64Bit) }}</span>
                </div>
                <div class="flex flex-col gap-1 text-sm sm:col-span-2 xl:col-span-3">
                  <span class="text-muted-foreground">منطقه زمانی</span>
                  <span class="text-foreground">{{ info.environment.timeZone }}</span>
                </div>
              </div>
            </div>
          </Card>

          <!-- Application -->
          <Card
            title="اپلیکیشن"
            description="اسمبلی و مسیر کاری"
            variant="elevated"
            padding="none"
            class="min-w-0 lg:col-span-2"
          >
            <div class="p-4 sm:p-6 space-y-3">
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[8rem]">نام اسمبلی</span>
                <span class="text-foreground">{{ info.application.assemblyName }}</span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[8rem]">نسخه اسمبلی</span>
                <span class="text-foreground">{{ info.application.assemblyVersion }}</span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[8rem]">نسخه فایل</span>
                <span class="text-foreground">{{ formatDate(info.application.fileVersion) }}</span>
              </div>
              <div class="flex flex-col gap-1 text-sm">
                <span class="text-muted-foreground">مسیر کاری</span>
                <span class="text-foreground break-all font-mono text-xs">{{
                  info.application.workingDirectory
                }}</span>
              </div>
            </div>
          </Card>

          <!-- Docker -->
          <Card
            title="Docker"
            description="وضعیت کانتینر"
            variant="elevated"
            padding="none"
            class="min-w-0"
          >
            <div class="p-4 sm:p-6 space-y-3">
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[7rem]">در Docker</span>
                <span class="text-foreground">{{ formatBool(info.docker.isDocker) }}</span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-muted-foreground min-w-[7rem]">شناسه کانتینر</span>
                <span class="text-foreground">{{ info.docker.containerId }}</span>
              </div>
            </div>
          </Card>

          <!-- وضعیت امضای نسخه (Signature status + public key info) -->
          <Card
            title="وضعیت امضای نسخه"
            description="وضعیت و اطلاعات کلید عمومی"
            variant="elevated"
            padding="none"
            class="min-w-0 lg:col-span-2"
          >
            <div class="p-4 sm:p-6 space-y-4">
              <div class="flex flex-col gap-1 text-sm">
                <span class="text-muted-foreground">وضعیت</span>
                <span class="text-foreground break-words">{{ signatureStatusText() }}</span>
              </div>
              <div class="flex flex-col gap-1 text-sm">
                <span class="text-muted-foreground">اطلاعات کلید عمومی</span>
                <span class="text-foreground break-all font-mono text-xs">{{
                  publicKeyInfoText()
                }}</span>
              </div>
            </div>
          </Card>

          <!-- بررسی نسخه (Version check: backend + frontend) -->
          <Card
            title="بررسی نسخه"
            description="بررسی همخوانی نسخه بک‌اند و فرانت‌اند"
            variant="elevated"
            padding="none"
            class="min-w-0 lg:col-span-2"
          >
            <div class="p-4 sm:p-6 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-end gap-3">
                <FormField
                  v-model="backendCheckVersion"
                  label="نسخه بک‌اند"
                  placeholder="مثال: 1.0.0"
                  class="flex-1 min-w-0"
                />
                <BaseButton
                  variant="outline"
                  size="sm"
                  :disabled="backendCheckLoading || !backendCheckVersion.trim()"
                  @click="checkBackendVersion"
                >
                  {{ backendCheckLoading ? 'در حال بررسی...' : 'بررسی بک‌اند' }}
                </BaseButton>
              </div>
              <div
                v-if="backendCheckResult"
                class="mt-2 p-3 rounded-lg text-sm space-y-1"
                :class="
                  versionCheckIsError(backendCheckResult)
                    ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300'
                    : 'bg-muted/30 text-foreground'
                "
              >
                <template v-if="versionCheckIsError(backendCheckResult)">
                  <span>{{ backendCheckResult.Message ?? backendCheckResult.message }}</span>
                </template>
                <template v-else>
                  <span class="font-medium block" v-if="backendCheckResult.isUpToDate === true">
                    نسخه به‌روز است.
                  </span>
                  <span class="font-medium block" v-else-if="backendCheckResult.isUpToDate === false">
                    نسخه به‌روز نیست.
                  </span>
                  <span v-if="backendCheckResult.currentVersion" class="block">
                    نسخه جاری: {{ backendCheckResult.currentVersion }}
                  </span>
                  <span v-if="backendCheckResult.checkVersion" class="block">
                    نسخه بررسی‌شده: {{ backendCheckResult.checkVersion }}
                  </span>
                  <span v-if="backendCheckResult.buildDate" class="block">
                    تاریخ ساخت: {{ formatDate(backendCheckResult.buildDate) }}
                  </span>
                  <span v-if="backendCheckResult.environment" class="block">
                    محیط: {{ backendCheckResult.environment }}
                  </span>
                </template>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-end gap-3">
                <FormField
                  v-model="frontendCheckVersion"
                  label="نسخه فرانت‌اند"
                  placeholder="مثال: 1.0.0"
                  class="flex-1 min-w-0"
                />
                <BaseButton
                  variant="outline"
                  size="sm"
                  :disabled="frontendCheckLoading || !frontendCheckVersion.trim()"
                  @click="checkFrontendVersion"
                >
                  {{ frontendCheckLoading ? 'در حال بررسی...' : 'بررسی فرانت‌اند' }}
                </BaseButton>
              </div>
              <div
                v-if="frontendCheckResult"
                class="mt-2 p-3 rounded-lg text-sm space-y-1"
                :class="
                  versionCheckIsError(frontendCheckResult)
                    ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300'
                    : 'bg-muted/30 text-foreground'
                "
              >
                <template v-if="versionCheckIsError(frontendCheckResult)">
                  <span>{{ frontendCheckResult.Message ?? frontendCheckResult.message }}</span>
                </template>
                <template v-else>
                  <span class="font-medium block" v-if="frontendCheckResult.isUpToDate === true">
                    نسخه به‌روز است.
                  </span>
                  <span class="font-medium block" v-else-if="frontendCheckResult.isUpToDate === false">
                    نسخه به‌روز نیست.
                  </span>
                  <span v-if="frontendCheckResult.currentVersion" class="block">
                    نسخه جاری: {{ frontendCheckResult.currentVersion }}
                  </span>
                  <span v-if="frontendCheckResult.checkVersion" class="block">
                    نسخه بررسی‌شده: {{ frontendCheckResult.checkVersion }}
                  </span>
                  <span v-if="frontendCheckResult.buildDate" class="block">
                    تاریخ ساخت: {{ formatDate(frontendCheckResult.buildDate) }}
                  </span>
                  <span v-if="frontendCheckResult.environment" class="block">
                    محیط: {{ frontendCheckResult.environment }}
                  </span>
                </template>
              </div>
            </div>
          </Card>

          <!-- ابزارهای امضا (Signature POST tools) -->
          <Card
            title="بررسی امضا"
            description="POST /api/Version/signature/verify"
            variant="elevated"
            padding="none"
            class="min-w-0 lg:col-span-2"
          >
            <div class="p-4 sm:p-6 space-y-3">
              <label class="block text-sm text-muted-foreground">بدنه درخواست (JSON)</label>
              <textarea
                v-model="verifyBody"
                rows="4"
                class="w-full rounded-lg border border-border-default bg-input-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder='{"payload": "..."}'
              />
              <BaseButton
                variant="outline"
                size="sm"
                :disabled="verifyLoading"
                @click="submitVerify"
              >
                {{ verifyLoading ? 'در حال ارسال...' : 'بررسی امضا' }}
              </BaseButton>
              <div
                v-if="verifyResult"
                class="mt-2 p-3 rounded-lg bg-muted/30 text-sm font-mono whitespace-pre-wrap break-words"
              >
                {{ verifyResult }}
              </div>
            </div>
          </Card>

          <Card
            title="بررسی امضای متادیتا"
            description="POST /api/Version/signature/verify-metadata"
            variant="elevated"
            padding="none"
            class="min-w-0 lg:col-span-2"
          >
            <div class="p-4 sm:p-6 space-y-3">
              <label class="block text-sm text-muted-foreground">بدنه درخواست (JSON)</label>
              <textarea
                v-model="verifyMetadataBody"
                rows="4"
                class="w-full rounded-lg border border-border-default bg-input-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="{}"
              />
              <BaseButton
                variant="outline"
                size="sm"
                :disabled="verifyMetadataLoading"
                @click="submitVerifyMetadata"
              >
                {{ verifyMetadataLoading ? 'در حال ارسال...' : 'بررسی متادیتا' }}
              </BaseButton>
              <div
                v-if="verifyMetadataResult"
                class="mt-2 p-3 rounded-lg bg-muted/30 text-sm font-mono whitespace-pre-wrap break-words"
              >
                {{ verifyMetadataResult }}
              </div>
            </div>
          </Card>

          <Card
            title="محاسبه هش"
            description="POST /api/Version/signature/compute-hash"
            variant="elevated"
            padding="none"
            class="min-w-0 lg:col-span-2"
          >
            <div class="p-4 sm:p-6 space-y-3">
              <label class="block text-sm text-muted-foreground">بدنه درخواست (JSON)</label>
              <textarea
                v-model="computeHashBody"
                rows="4"
                class="w-full rounded-lg border border-border-default bg-input-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="{}"
              />
              <BaseButton
                variant="outline"
                size="sm"
                :disabled="computeHashLoading"
                @click="submitComputeHash"
              >
                {{ computeHashLoading ? 'در حال ارسال...' : 'محاسبه هش' }}
              </BaseButton>
              <div
                v-if="computeHashResult"
                class="mt-2 p-3 rounded-lg bg-muted/30 text-sm font-mono whitespace-pre-wrap break-words"
              >
                {{ computeHashResult }}
              </div>
            </div>
          </Card>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>
