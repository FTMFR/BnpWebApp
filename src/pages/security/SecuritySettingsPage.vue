<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CustomLoader, BaseIcon, BaseButton } from '@/design-system/atoms'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import BaseTabs from '@/design-system/molecules/BaseTabs.vue'
import FormField from '@/design-system/molecules/FormField.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const TAB_IDS = ['overview', 'settings'] as const
const tabItems = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'settings', label: 'تنظیمات امنیتی' },
]
const activeTab = ref<string>(
  (route.query.tab as string) && TAB_IDS.includes(route.query.tab as (typeof TAB_IDS)[number])
    ? (route.query.tab as string)
    : 'overview',
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
      activeTab.value = tab as string
    }
  },
  { immediate: true },
)

// API response types
// Matches SecuritySettingsDto from GET /api/Security/settings
interface PasswordPolicy {
  MinimumLength: number
  MaximumLength: number
  RequireUppercase: boolean
  RequireLowercase: boolean
  RequireDigit: boolean
  RequireSpecialCharacter: boolean
  SpecialCharacters: string
  DisallowUsername?: boolean
  PasswordHistoryCount: number
  PasswordExpirationDays: number
}

interface AccountLockout {
  MaxFailedAttempts: number
  LockoutDurationMinutes: number
  EnablePermanentLockout: boolean
  PermanentLockoutThreshold: number
  FailedAttemptResetMinutes: number
}

interface JwtSettings {
  Issuer: string
  Audience: string
  ExpiresMinutes: number
}

interface TlsSettings {
  MinimumTlsVersion: string
  RequireClientCertificate: boolean
}

interface RateLimitConfig {
  PermitLimit: number
  WindowMinutes: number
  QueueLimit: number
}

interface RateLimiting {
  Authentication: RateLimitConfig
  Api: RateLimitConfig
}

interface SecuritySettingsResponse {
  PasswordPolicy: PasswordPolicy
  AccountLockout: AccountLockout
  JwtSettings: JwtSettings
  TlsSettings: TlsSettings
  RateLimiting: RateLimiting
}

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'تنظیمات امنیتی', href: '/security/settings' },
]

const settings = ref<SecuritySettingsResponse | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const toastStore = useToastStore()

async function fetchSettings() {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await apiClient.get<SecuritySettingsResponse>(endpoints.security.settings)
    settings.value = response.data
  } catch (err) {
    console.error('Failed to fetch security settings:', err)
    loadError.value = 'بارگذاری تنظیمات امنیتی ناموفق بود.'
    toastStore.showToast(loadError.value, 'error')
  } finally {
    isLoading.value = false
  }
}

function yesNo(value: boolean): string {
  return value ? 'بله' : 'خیر'
}

// ---------- Tab 2: SecuritySettings APIs ----------
type AccountLockoutSettings = AccountLockout
type PasswordPolicySettings = PasswordPolicy
interface CaptchaSettings {
  Enabled?: boolean
  [key: string]: unknown
}
interface MfaSettings {
  IsEnabled?: boolean
  OtpLength?: number
  OtpExpirySeconds?: number
  RecoveryCodesCount?: number
  [key: string]: unknown
}
interface AuditLogProtectionSettings {
  [key: string]: unknown
}

const accountLockoutData = ref<AccountLockoutSettings | null>(null)
const accountLockoutLoading = ref(false)
const accountLockoutSaving = ref(false)
const passwordPolicyData = ref<PasswordPolicySettings | null>(null)
const passwordPolicyLoading = ref(false)
const passwordPolicySaving = ref(false)
const captchaData = ref<CaptchaSettings | null>(null)
const captchaLoading = ref(false)
const captchaSaving = ref(false)
const mfaData = ref<MfaSettings | null>(null)
const mfaLoading = ref(false)
const mfaSaving = ref(false)
const auditLogProtectionData = ref<AuditLogProtectionSettings | null>(null)
const auditLogProtectionLoading = ref(false)
const auditLogProtectionSaving = ref(false)
const invalidateCacheLoading = ref(false)

async function fetchAccountLockout() {
  accountLockoutLoading.value = true
  try {
    const res = await apiClient.get<AccountLockoutSettings>(endpoints.securitySettings.accountLockout)
    accountLockoutData.value = res.data ?? null
  } catch (err) {
    console.error('Failed to fetch account lockout', err)
    toastStore.showToast('بارگذاری قفل حساب ناموفق بود.', 'error')
    accountLockoutData.value = null
  } finally {
    accountLockoutLoading.value = false
  }
}

async function saveAccountLockout() {
  if (!accountLockoutData.value) return
  accountLockoutSaving.value = true
  try {
    await apiClient.put(endpoints.securitySettings.updateAccountLockout, accountLockoutData.value)
    toastStore.showToast('قفل حساب با موفقیت ذخیره شد.', 'success')
  } catch (err) {
    console.error('Failed to save account lockout', err)
    toastStore.showToast('ذخیره قفل حساب ناموفق بود.', 'error')
  } finally {
    accountLockoutSaving.value = false
  }
}

async function fetchPasswordPolicy() {
  passwordPolicyLoading.value = true
  try {
    const res = await apiClient.get<PasswordPolicySettings>(endpoints.securitySettings.passwordPolicy)
    passwordPolicyData.value = res.data ?? null
  } catch (err) {
    console.error('Failed to fetch password policy', err)
    toastStore.showToast('بارگذاری سیاست رمز عبور ناموفق بود.', 'error')
    passwordPolicyData.value = null
  } finally {
    passwordPolicyLoading.value = false
  }
}

async function savePasswordPolicy() {
  if (!passwordPolicyData.value) return
  passwordPolicySaving.value = true
  try {
    await apiClient.put(endpoints.securitySettings.updatePasswordPolicy, passwordPolicyData.value)
    toastStore.showToast('سیاست رمز عبور با موفقیت ذخیره شد.', 'success')
  } catch (err) {
    console.error('Failed to save password policy', err)
    toastStore.showToast('ذخیره سیاست رمز عبور ناموفق بود.', 'error')
  } finally {
    passwordPolicySaving.value = false
  }
}

async function fetchCaptcha() {
  captchaLoading.value = true
  try {
    const res = await apiClient.get<CaptchaSettings>(endpoints.securitySettings.captcha)
    captchaData.value = res.data ?? null
  } catch (err) {
    console.error('Failed to fetch captcha settings', err)
    toastStore.showToast('بارگذاری تنظیمات کپچا ناموفق بود.', 'error')
    captchaData.value = null
  } finally {
    captchaLoading.value = false
  }
}

async function saveCaptcha() {
  if (!captchaData.value) return
  captchaSaving.value = true
  try {
    await apiClient.put(endpoints.securitySettings.updateCaptcha, captchaData.value)
    toastStore.showToast('تنظیمات کپچا با موفقیت ذخیره شد.', 'success')
  } catch (err) {
    console.error('Failed to save captcha', err)
    toastStore.showToast('ذخیره تنظیمات کپچا ناموفق بود.', 'error')
  } finally {
    captchaSaving.value = false
  }
}

async function fetchMfa() {
  mfaLoading.value = true
  try {
    const res = await apiClient.get<MfaSettings>(endpoints.securitySettings.mfa)
    mfaData.value = res.data ?? null
  } catch (err) {
    console.error('Failed to fetch MFA settings', err)
    toastStore.showToast('بارگذاری تنظیمات MFA ناموفق بود.', 'error')
    mfaData.value = null
  } finally {
    mfaLoading.value = false
  }
}

async function saveMfa() {
  if (!mfaData.value) return
  mfaSaving.value = true
  try {
    await apiClient.put(endpoints.securitySettings.updateMfa, mfaData.value)
    toastStore.showToast('تنظیمات MFA با موفقیت ذخیره شد.', 'success')
  } catch (err) {
    console.error('Failed to save MFA', err)
    toastStore.showToast('ذخیره تنظیمات MFA ناموفق بود.', 'error')
  } finally {
    mfaSaving.value = false
  }
}

async function fetchAuditLogProtection() {
  auditLogProtectionLoading.value = true
  try {
    const res = await apiClient.get<AuditLogProtectionSettings>(endpoints.securitySettings.auditLogProtection)
    auditLogProtectionData.value = res.data ?? null
  } catch (err) {
    console.error('Failed to fetch audit log protection', err)
    toastStore.showToast('بارگذاری تنظیمات حفاظت لاگ ناموفق بود.', 'error')
    auditLogProtectionData.value = null
  } finally {
    auditLogProtectionLoading.value = false
  }
}

async function saveAuditLogProtection() {
  if (!auditLogProtectionData.value) return
  auditLogProtectionSaving.value = true
  try {
    await apiClient.put(endpoints.securitySettings.updateAuditLogProtection, auditLogProtectionData.value)
    toastStore.showToast('تنظیمات حفاظت لاگ با موفقیت ذخیره شد.', 'success')
  } catch (err) {
    console.error('Failed to save audit log protection', err)
    toastStore.showToast('ذخیره تنظیمات حفاظت لاگ ناموفق بود.', 'error')
  } finally {
    auditLogProtectionSaving.value = false
  }
}

async function invalidateCache() {
  invalidateCacheLoading.value = true
  try {
    await apiClient.post(endpoints.securitySettings.invalidateCache)
    toastStore.showToast('کش با موفقیت پاکسازی شد.', 'success')
  } catch (err) {
    console.error('Failed to invalidate cache', err)
    toastStore.showToast('پاکسازی کش ناموفق بود.', 'error')
  } finally {
    invalidateCacheLoading.value = false
  }
}

function loadSettingsTab() {
  if (activeTab.value !== 'settings') return
  fetchAccountLockout()
  fetchPasswordPolicy()
  fetchCaptcha()
  fetchMfa()
  fetchAuditLogProtection()
}

watch(activeTab, (tab) => {
  if (tab === 'settings') loadSettingsTab()
})

onMounted(() => {
  fetchSettings()
  if (activeTab.value === 'settings') loadSettingsTab()
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
          <!-- Tab 1: نمای کلی (همان محتوای فعلی) -->
          <template v-if="currentTab === 'overview'">
            <div v-if="isLoading" class="flex items-center justify-center min-h-[320px]">
              <CustomLoader size="lg" />
            </div>

            <template v-else-if="loadError">
              <Card variant="elevated" padding="md" class="min-w-0">
                <p class="text-muted-foreground text-center py-8">{{ loadError }}</p>
              </Card>
            </template>

            <template v-else-if="settings">
        <!-- Password Policy -->
        <Card
          title="سیاست رمز عبور"
          description="قوانین طول، کاراکترها و انقضای رمز عبور"
          variant="elevated"
          padding="none"
          class="min-w-0"
        >
          <template #header>
            <BaseIcon name="Lock" :size="20" class="text-primary-500 flex-shrink-0" />
          </template>
          <div class="p-4 sm:p-6 space-y-4 min-w-0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">حداقل طول</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ settings.PasswordPolicy.MinimumLength }} کاراکتر
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">حداکثر طول</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ settings.PasswordPolicy.MaximumLength }} کاراکتر
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">انقضای رمز (روز)</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ settings.PasswordPolicy.PasswordExpirationDays }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">تاریخچه رمز</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ settings.PasswordPolicy.PasswordHistoryCount }} رمز قبلی
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">حروف بزرگ</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ yesNo(settings.PasswordPolicy.RequireUppercase) }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">حروف کوچک</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ yesNo(settings.PasswordPolicy.RequireLowercase) }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">عدد</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ yesNo(settings.PasswordPolicy.RequireDigit) }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">کاراکتر خاص</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ yesNo(settings.PasswordPolicy.RequireSpecialCharacter) }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">ممنوعیت نام کاربری در رمز</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ yesNo(settings.PasswordPolicy.DisallowUsername ?? false) }}
                </p>
              </div>
              <div
                class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4 sm:col-span-2"
              >
                <p class="text-xs sm:text-sm text-muted-foreground">کاراکترهای مجاز خاص</p>
                <p class="text-xs sm:text-sm font-mono text-foreground mt-0.5 break-all">
                  {{ settings.PasswordPolicy.SpecialCharacters }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Account Lockout -->
        <Card
          title="قفل حساب"
          description="تعداد تلاش ناموفق و مدت قفل"
          variant="elevated"
          padding="none"
          class="min-w-0"
        >
          <template #header>
            <BaseIcon name="ShieldAlert" :size="20" class="text-primary-500 flex-shrink-0" />
          </template>
          <div class="p-4 sm:p-6 space-y-4 min-w-0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">حداکثر تلاش ناموفق</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ settings.AccountLockout.MaxFailedAttempts }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">مدت قفل (دقیقه)</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ settings.AccountLockout.LockoutDurationMinutes }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">بازنشانی تلاش (دقیقه)</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ settings.AccountLockout.FailedAttemptResetMinutes }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">قفل دائمی</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ yesNo(settings.AccountLockout.EnablePermanentLockout) }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">آستانه قفل دائمی</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ settings.AccountLockout.PermanentLockoutThreshold }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- JWT -->
        <Card
          title="تنظیمات JWT"
          description="صادرکننده، مخاطب و زمان انقضا"
          variant="elevated"
          padding="none"
          class="min-w-0"
        >
          <template #header>
            <BaseIcon name="Key" :size="20" class="text-primary-500 flex-shrink-0" />
          </template>
          <div class="p-4 sm:p-6 space-y-4 min-w-0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">صادرکننده</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5 break-all">
                  {{ settings.JwtSettings.Issuer }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">مخاطب</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5 break-all">
                  {{ settings.JwtSettings.Audience }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">انقضا (دقیقه)</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ settings.JwtSettings.ExpiresMinutes }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- TLS -->
        <Card
          title="تنظیمات TLS"
          description="حداقل نسخه TLS و گواهی سمت کلاینت"
          variant="elevated"
          padding="none"
          class="min-w-0"
        >
          <template #header>
            <BaseIcon name="Server" :size="20" class="text-primary-500 flex-shrink-0" />
          </template>
          <div class="p-4 sm:p-6 space-y-4 min-w-0">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">حداقل نسخه TLS</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ settings.TlsSettings.MinimumTlsVersion }}
                </p>
              </div>
              <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                <p class="text-xs sm:text-sm text-muted-foreground">الزام گواهی کلاینت</p>
                <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {{ yesNo(settings.TlsSettings.RequireClientCertificate) }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Rate Limiting -->
        <Card
          title="محدودیت نرخ درخواست"
          description="سقف درخواست برای احراز هویت و API"
          variant="elevated"
          padding="none"
          class="min-w-0"
        >
          <template #header>
            <BaseIcon name="Gauge" :size="20" class="text-primary-500 flex-shrink-0" />
          </template>
          <div class="p-4 sm:p-6 space-y-6 min-w-0">
            <div>
              <h4 class="text-sm font-semibold text-foreground mb-3">احراز هویت</h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                  <p class="text-xs sm:text-sm text-muted-foreground">سقف درخواست</p>
                  <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                    {{ settings.RateLimiting.Authentication.PermitLimit }}
                  </p>
                </div>
                <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                  <p class="text-xs sm:text-sm text-muted-foreground">بازه (دقیقه)</p>
                  <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                    {{ settings.RateLimiting.Authentication.WindowMinutes }}
                  </p>
                </div>
                <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                  <p class="text-xs sm:text-sm text-muted-foreground">صف</p>
                  <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                    {{ settings.RateLimiting.Authentication.QueueLimit }}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-foreground mb-3">API</h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                  <p class="text-xs sm:text-sm text-muted-foreground">سقف درخواست</p>
                  <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                    {{ settings.RateLimiting.Api.PermitLimit }}
                  </p>
                </div>
                <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                  <p class="text-xs sm:text-sm text-muted-foreground">بازه (دقیقه)</p>
                  <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                    {{ settings.RateLimiting.Api.WindowMinutes }}
                  </p>
                </div>
                <div class="rounded-lg border border-border-default bg-muted/30 p-3 sm:p-4">
                  <p class="text-xs sm:text-sm text-muted-foreground">صف</p>
                  <p class="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                    {{ settings.RateLimiting.Api.QueueLimit }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
            </template>
          </template>

          <!-- Tab 2: تنظیمات امنیتی (SecuritySettings APIs) -->
          <div v-if="currentTab === 'settings'" class="min-w-0 space-y-4">
            <!-- Account Lockout -->
            <Card title="قفل حساب" description="GET/PUT account-lockout" variant="elevated" padding="none" class="min-w-0">
              <div class="p-4 sm:p-6">
                <CustomLoader v-if="accountLockoutLoading" size="md" class="mx-auto my-4" />
                <template v-else-if="accountLockoutData">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <FormField v-model.number="accountLockoutData.MaxFailedAttempts" label="حداکثر تلاش ناموفق" type="number" />
                    <FormField v-model.number="accountLockoutData.LockoutDurationMinutes" label="مدت قفل (دقیقه)" type="number" />
                    <FormField v-model.number="accountLockoutData.FailedAttemptResetMinutes" label="بازنشانی تلاش (دقیقه)" type="number" />
                    <FormField v-model.number="accountLockoutData.PermanentLockoutThreshold" label="آستانه قفل دائمی" type="number" />
                    <div class="flex items-center gap-2">
                      <input v-model="accountLockoutData.EnablePermanentLockout" type="checkbox" id="al-permanent" class="rounded border-border-default" />
                      <label for="al-permanent" class="text-sm text-foreground">قفل دائمی</label>
                    </div>
                  </div>
                  <BaseButton :disabled="accountLockoutSaving" class="text-white" @click="saveAccountLockout">
                    {{ accountLockoutSaving ? 'در حال ذخیره...' : 'ذخیره قفل حساب' }}
                  </BaseButton>
                </template>
                <p v-else class="text-muted-foreground text-sm">داده‌ای بارگذاری نشد.</p>
              </div>
            </Card>

            <!-- Password Policy -->
            <Card title="سیاست رمز عبور" description="GET/PUT password-policy" variant="elevated" padding="none" class="min-w-0">
              <div class="p-4 sm:p-6">
                <CustomLoader v-if="passwordPolicyLoading" size="md" class="mx-auto my-4" />
                <template v-else-if="passwordPolicyData">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <FormField v-model.number="passwordPolicyData.MinimumLength" label="حداقل طول" type="number" />
                    <FormField v-model.number="passwordPolicyData.MaximumLength" label="حداکثر طول" type="number" />
                    <FormField v-model.number="passwordPolicyData.PasswordHistoryCount" label="تاریخچه رمز" type="number" />
                    <FormField v-model.number="passwordPolicyData.PasswordExpirationDays" label="انقضای رمز (روز)" type="number" />
                    <FormField v-model="passwordPolicyData.SpecialCharacters" label="کاراکترهای خاص مجاز" type="text" class="sm:col-span-2" />
                    <div class="flex flex-wrap gap-4 items-center sm:col-span-2">
                      <label class="flex items-center gap-2"><input v-model="passwordPolicyData.RequireUppercase" type="checkbox" class="rounded border-border-default" /><span class="text-sm">حروف بزرگ</span></label>
                      <label class="flex items-center gap-2"><input v-model="passwordPolicyData.RequireLowercase" type="checkbox" class="rounded border-border-default" /><span class="text-sm">حروف کوچک</span></label>
                      <label class="flex items-center gap-2"><input v-model="passwordPolicyData.RequireDigit" type="checkbox" class="rounded border-border-default" /><span class="text-sm">عدد</span></label>
                      <label class="flex items-center gap-2"><input v-model="passwordPolicyData.RequireSpecialCharacter" type="checkbox" class="rounded border-border-default" /><span class="text-sm">کاراکتر خاص</span></label>
                      <label class="flex items-center gap-2"><input v-model="passwordPolicyData.DisallowUsername" type="checkbox" class="rounded border-border-default" /><span class="text-sm">ممنوعیت نام کاربری در رمز</span></label>
                    </div>
                  </div>
                  <BaseButton :disabled="passwordPolicySaving" class="text-white" @click="savePasswordPolicy">
                    {{ passwordPolicySaving ? 'در حال ذخیره...' : 'ذخیره سیاست رمز عبور' }}
                  </BaseButton>
                </template>
                <p v-else class="text-muted-foreground text-sm">داده‌ای بارگذاری نشد.</p>
              </div>
            </Card>

            <!-- Captcha -->
            <Card title="تنظیمات کپچا" description="GET/PUT captcha" variant="elevated" padding="none" class="min-w-0">
              <div class="p-4 sm:p-6">
                <CustomLoader v-if="captchaLoading" size="md" class="mx-auto my-4" />
                <template v-else-if="captchaData">
                  <div class="flex flex-wrap items-center gap-4 mb-4">
                    <label class="flex items-center gap-2">
                      <input v-model="captchaData.Enabled" type="checkbox" class="rounded border-border-default" />
                      <span class="text-sm text-foreground">فعال</span>
                    </label>
                  </div>
                  <BaseButton :disabled="captchaSaving" class="text-white" @click="saveCaptcha">
                    {{ captchaSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات کپچا' }}
                  </BaseButton>
                </template>
                <p v-else class="text-muted-foreground text-sm">داده‌ای بارگذاری نشد.</p>
              </div>
            </Card>

            <!-- MFA -->
            <Card title="تنظیمات MFA" description="GET/PUT mfa" variant="elevated" padding="none" class="min-w-0">
              <div class="p-4 sm:p-6">
                <CustomLoader v-if="mfaLoading" size="md" class="mx-auto my-4" />
                <template v-else-if="mfaData">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <label class="flex items-center gap-2">
                      <input v-model="mfaData.IsEnabled" type="checkbox" class="rounded border-border-default" />
                      <span class="text-sm text-foreground">فعال</span>
                    </label>
                    <FormField v-model.number="mfaData.OtpLength" label="طول کد OTP" type="number" />
                    <FormField v-model.number="mfaData.OtpExpirySeconds" label="انقضای OTP (ثانیه)" type="number" />
                    <FormField v-model.number="mfaData.RecoveryCodesCount" label="تعداد کدهای بازیابی" type="number" />
                  </div>
                  <BaseButton :disabled="mfaSaving" class="text-white" @click="saveMfa">
                    {{ mfaSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات MFA' }}
                  </BaseButton>
                </template>
                <p v-else class="text-muted-foreground text-sm">داده‌ای بارگذاری نشد.</p>
              </div>
            </Card>

            <!-- Audit Log Protection -->
            <Card title="حفاظت لاگ ممیزی" description="GET/PUT AuditLogProtection" variant="elevated" padding="none" class="min-w-0">
              <div class="p-4 sm:p-6">
                <CustomLoader v-if="auditLogProtectionLoading" size="md" class="mx-auto my-4" />
                <template v-else-if="auditLogProtectionData && Object.keys(auditLogProtectionData).length">
                  <pre class="text-xs bg-muted/30 p-3 rounded-lg overflow-x-auto mb-4">{{ JSON.stringify(auditLogProtectionData, null, 2) }}</pre>
                  <BaseButton :disabled="auditLogProtectionSaving" class="text-white" @click="saveAuditLogProtection">
                    {{ auditLogProtectionSaving ? 'در حال ذخیره...' : 'ذخیره' }}
                  </BaseButton>
                </template>
                <p v-else class="text-muted-foreground text-sm">داده‌ای بارگذاری نشد یا خالی است.</p>
              </div>
            </Card>

            <!-- Invalidate Cache -->
            <Card title="پاکسازی کش" description="POST invalidate-cache" variant="elevated" padding="none" class="min-w-0">
              <div class="p-4 sm:p-6">
                <BaseButton :disabled="invalidateCacheLoading" variant="outline" @click="invalidateCache">
                  {{ invalidateCacheLoading ? 'در حال اجرا...' : 'پاکسازی کش' }}
                </BaseButton>
              </div>
            </Card>
          </div>
        </template>
      </BaseTabs>
    </div>
  </DashboardLayout>
</template>
