<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CustomLoader, BaseIcon } from '@/design-system/atoms'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'

// API response types
interface PasswordPolicy {
  MinimumLength: number
  MaximumLength: number
  RequireUppercase: boolean
  RequireLowercase: boolean
  RequireDigit: boolean
  RequireSpecialCharacter: boolean
  SpecialCharacters: string
  DisallowUsername: boolean
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

onMounted(() => {
  fetchSettings()
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
    </div>
  </DashboardLayout>
</template>
