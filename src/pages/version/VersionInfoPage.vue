<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CustomLoader } from '@/design-system/atoms'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'

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

onMounted(() => {
  fetchInfo()
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
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>
