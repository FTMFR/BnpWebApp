<script setup lang="ts">
import BaseIcon from '@/design-system/atoms/BaseIcon.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import { useTheme, type ThemeMode } from '@/design-system/utilities/useTheme'

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'تنظیمات', href: '/settings' },
]

const { theme, setTheme } = useTheme()

const modes: { value: ThemeMode; label: string; icon: 'Sun' | 'Moon' }[] = [
  { value: 'light', label: 'روشن', icon: 'Sun' },
  { value: 'dark', label: 'تاریک', icon: 'Moon' },
]
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <Card
        title="تنظیمات"
        description="تنظیمات نمایش و ظاهر برنامه"
        variant="elevated"
        padding="none"
      >
        <template #header></template>
        <div class="p-4 sm:p-6 space-y-6">
          <!-- Display mode (theme) -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h3 class="text-sm font-semibold text-foreground">حالت نمایش</h3>
              <p class="text-xs text-muted-foreground mt-0.5">تم روشن یا تاریک برای رابط کاربری</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                v-for="m in modes"
                :key="m.value"
                type="button"
                :aria-pressed="theme === m.value"
                :class="[
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
                  theme === m.value
                    ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                    : 'bg-card-background border-border-default text-foreground hover:bg-muted/50 hover:border-primary-200 dark:hover:border-primary-800',
                ]"
                @click="setTheme(m.value)"
              >
                <BaseIcon
                  :name="m.icon"
                  :size="18"
                  :stroke-width="2"
                  :icon-class="theme === m.value ? 'text-white' : 'text-muted-foreground'"
                />
                {{ m.label }}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </DashboardLayout>
</template>
