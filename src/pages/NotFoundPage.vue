<script setup lang="ts">
import { useRouter } from 'vue-router'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'
import { BaseButton, BaseIcon } from '@/design-system/atoms'

const router = useRouter()

const goBack = () => {
  window.history.back()
}

const goHome = () => {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <DashboardLayout>
    <div class="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div class="max-w-2xl w-full text-center">
        <!-- 404 number - typography & color tokens -->
        <div class="mb-5">
          <h1
            class="text-7xl sm:text-8xl font-extrabold leading-none bg-gradient-to-l from-primary-400 to-primary-600 bg-clip-text text-transparent"
          >
            404
          </h1>
        </div>

        <!-- Title & description - text & color tokens -->
        <div class="mb-5">
          <h2 class="text-xl sm:text-2xl font-bold text-foreground mb-3">صفحه مورد نظر یافت نشد</h2>
          <p class="text-base sm:text-lg font-medium text-muted-foreground max-w-md mx-auto">
            متأسفانه صفحه‌ای که دنبال آن می‌گردید وجود ندارد یا منتقل شده است.
          </p>
        </div>

        <!-- Suggestions - card, shadow, spacing tokens -->
        <div class="mb-5 text-right rounded-xl bg-card shadow-lg p-6">
          <div class="flex items-start gap-3">
            <div class="size-8 rounded-lg bg-warning-100 flex items-center justify-center shrink-0">
              <BaseIcon name="AlertCircle" :size="16" class="text-warning-700" />
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="text-foreground font-bold mb-2">چند پیشنهاد مفید:</h3>

              <ul class="text-sm text-muted-foreground font-medium flex flex-col gap-2">
                <li class="flex items-center gap-2">
                  <span class="size-1.5 rounded-full bg-primary-500 shrink-0" aria-hidden />
                  <span>آدرس صفحه را بررسی کنید</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="size-1.5 rounded-full bg-primary-500 shrink-0" aria-hidden />
                  <span>از منوی اصلی به صفحه مورد نظر بروید</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="size-1.5 rounded-full bg-primary-500 shrink-0" aria-hidden />
                  <span>به صفحه قبلی بازگردید</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="size-1.5 rounded-full bg-primary-500 shrink-0" aria-hidden />
                  <span>از دکمه جستجو استفاده کنید</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Actions - shadow & transition tokens -->
        <div class="flex items-center justify-center flex-wrap gap-3">
          <BaseButton
            size="lg"
            class="shadow-lg text-white hover:shadow-xl transition-shadow duration-normal ease-out gap-2"
            @click="goHome"
          >
            <span>بازگشت به صفحه اصلی</span>
            <BaseIcon name="Home" :size="20" />
          </BaseButton>

          <BaseButton variant="outline" size="lg" class="gap-2" @click="goBack">
            <span>بازگشت به عقب</span>
            <BaseIcon name="ArrowRight" :size="20" />
          </BaseButton>
        </div>

        <!-- Help - border & color tokens -->
       
      </div>
    </div>
  </DashboardLayout>
</template>
