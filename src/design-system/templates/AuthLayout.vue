<template>
  <div
    class="w-full max-w-full h-screen m-0 p-0 flex items-center justify-center bg-background-primary dark:bg-background-inverse transition-colors overflow-hidden"
    :class="{ dark: isDark }"
  >
    <button
      @click="toggleTheme"
      class="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-card-background border border-border-default flex items-center justify-center cursor-pointer transition-all shadow-sm hover:scale-105"
      aria-label="Toggle Dark Mode"
    >
      <BaseIcon
        :name="isDark ? 'Sun' : 'Moon'"
        :size="20"
        :stroke-width="2"
        :icon-class="isDark ? 'text-warning-500' : 'text-primary-500'"
      />
    </button>

    <div class="w-full h-screen flex rounded-none bg-card-background border-0">
      <div
        class="w-full max-w-full lg:w-[45%] h-screen bg-card-background p-0 flex flex-col justify-center relative overflow-hidden"
      >
        <div
          class="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border-default to-transparent"
        ></div>
        <div
          class="hidden lg:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-card-background pointer-events-none"
        ></div>

        <div
          class="max-w-[28rem] mx-auto w-full h-full p-4 sm:p-6 md:p-8 lg:p-12 box-border flex flex-col justify-center overflow-y-auto overflow-x-hidden"
        >
          <slot />
        </div>
      </div>

      <AuthVisualSection />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/design-system/utilities/useTheme'
import BaseIcon from '../atoms/BaseIcon.vue'
import AuthVisualSection from '@/components/auth/AuthVisualSection.vue'

const { theme, toggleTheme } = useTheme()

const isDark = computed(() => theme.value === 'dark')
</script>
