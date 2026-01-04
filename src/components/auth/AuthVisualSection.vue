<template>
  <div
    class="hidden lg:flex w-[55%] max-w-[55%] relative border-r-2 border-blue-900/30 bg-gradient-to-br from-[#0c1220] via-[#1e3a8a] to-[#312e81] overflow-hidden box-border h-screen"
  >
    <div class="absolute inset-0">
      <div
        class="absolute rounded-full blur-[80px] animate-pulse-slow w-[600px] h-[600px] -top-32 -right-32 bg-gradient-to-br from-primary-500/40 via-indigo-500/35 to-purple-600/30"
      ></div>
      <div
        class="absolute rounded-full blur-[80px] animate-pulse-slow w-[700px] h-[700px] -bottom-40 -left-40 bg-gradient-to-tr from-purple-600/50 via-indigo-500/40 to-primary-500/35"
      ></div>
      <div
        class="absolute rounded-full blur-[80px] animate-pulse-slow w-80 h-80 top-20 left-20 bg-gradient-to-br from-purple-600/45 to-pink-500/35"
      ></div>
      <div
        class="absolute rounded-full blur-[80px] animate-pulse-slow w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-primary-500/35 via-indigo-500/30 to-transparent"
      ></div>
      <div
        class="absolute rounded-full blur-[80px] animate-pulse-slow w-48 h-48 top-1/4 right-1/3 bg-gradient-to-br from-indigo-500/35 to-transparent"
      ></div>
      <div
        class="absolute rounded-full blur-[80px] animate-pulse-slow w-64 h-64 bottom-1/3 right-1/4 bg-gradient-to-br from-primary-500/30 to-purple-600/25"
      ></div>

      <div
        class="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-indigo-800/20 to-purple-900/25"
      ></div>

      <div class="absolute inset-0 opacity-[0.06] dots-pattern"></div>
    </div>

    <div
      class="relative z-10 flex flex-col justify-between p-12 w-full h-full box-border overflow-hidden"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-indigo-500 flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(59,130,246,0.3)] border-2 border-white/40 text-white transition-transform duration-300 hover:scale-105"
        >
          <IconShield :size="32" :stroke-width="2.5" />
        </div>
        <div>
          <h2 class="text-white text-[1.625rem] font-extrabold m-0">{{ logoTitle }}</h2>
          <p class="text-white/80 text-base font-medium m-0">{{ logoSubtitle }}</p>
        </div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center gap-6 py-4 min-h-0">
        <div class="text-center max-w-[32rem] transition-all duration-700 ease-in-out">
          <h3
            class="text-white text-[2.75rem] font-extrabold leading-tight m-0 mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
          >
            {{ currentFeatureData?.title }}
          </h3>
          <p class="text-white/90 text-xl font-medium m-0">{{ currentFeatureData?.description }}</p>
        </div>

        <div class="relative w-full flex justify-center py-8">
          <div
            class="absolute rounded-full border-4 border-blue-400/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 animate-pulse-slow"
          ></div>
          <div
            class="absolute rounded-full border-4 border-purple-300/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52"
          ></div>

          <div
            class="relative z-10 w-44 h-44 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-pink-400 flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(168,85,247,0.5)] border-4 border-white/40 transition-all duration-700 ease-in-out main-icon-wrapper"
          >
            <component
              :is="currentFeatureData?.icon"
              :size="96"
              :stroke-width="2.5"
              class="text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] relative z-10"
            />
          </div>
        </div>

        <div
          class="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/20 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)]"
        >
          <button
            v-for="(feature, index) in features"
            :key="index"
            @click="setCurrentFeature(index)"
            :class="[
              'h-3 rounded-full transition-all duration-300 ease-in-out border-2 border-white/50 bg-white/40 cursor-pointer p-0 hover:bg-white/60 hover:scale-110',
              index === currentFeature
                ? 'w-16 bg-white shadow-[0_10px_15px_-3px_rgba(255,255,255,0.5)] border-white'
                : 'w-3',
            ]"
          />
        </div>
      </div>

      <div
        class="bg-white/10 backdrop-blur-2xl rounded-2xl p-5 border-2 border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
      >
        <p class="text-center text-white/90 leading-7 text-sm font-normal m-0">
          <span class="text-white font-semibold">{{ footerText }}</span>
          <br />
          <span class="text-xs text-white/70">{{ footerSubtext }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconShield from '@/components/icons/IconShield.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import IconZap from '@/components/icons/IconZap.vue'
import IconLock from '@/components/icons/IconLock.vue'
import type { Component } from 'vue'

interface Feature {
  icon: Component
  title: string
  description: string
}

interface Props {
  logoTitle?: string
  logoSubtitle?: string
  footerText?: string
  footerSubtext?: string
  autoRotateInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  logoTitle: 'سیستم مالی',
  logoSubtitle: 'پلتفرم مدیریت هوشمند دارایی',
  footerText: '© ۱۴۰۳ سیستم مالی. تمامی حقوق محفوظ است.',
  footerSubtext: 'طراحی شده برای بهترین تجربه کاربری شما',
  autoRotateInterval: 4000,
})

const features: Feature[] = [
  {
    icon: IconCheck,
    title: 'احراز هویت دو مرحله‌ای',
    description: 'امنیت دو لایه',
  },
  {
    icon: IconZap,
    title: 'پردازش سریع',
    description: 'در کسری از ثانیه',
  },
  {
    icon: IconShield,
    title: 'امنیت SSL',
    description: 'گواهی امنیتی',
  },
  {
    icon: IconLock,
    title: 'رمزنگاری ۲۵۶ بیتی',
    description: 'حفاظت پیشرفته',
  },
]

const currentFeature = ref(0)

const currentFeatureData = computed(() => {
  return features[currentFeature.value] || features[0]
})

let featureInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (features.length > 1) {
    featureInterval = setInterval(() => {
      currentFeature.value = (currentFeature.value + 1) % features.length
    }, props.autoRotateInterval)
  }
})

onUnmounted(() => {
  if (featureInterval) {
    clearInterval(featureInterval)
  }
})

function setCurrentFeature(index: number) {
  currentFeature.value = index
  if (featureInterval) {
    clearInterval(featureInterval)
    featureInterval = setInterval(() => {
      currentFeature.value = (currentFeature.value + 1) % features.length
    }, props.autoRotateInterval)
  }
}
</script>

<style lang="scss" scoped>
.dots-pattern {
  background-image: radial-gradient(circle, rgba(99, 102, 241, 0.5) 2px, transparent 2px);
  background-size: 40px 40px;
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

.main-icon-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: linear-gradient(to top right, rgba(244, 114, 182, 0.3), transparent);
}

.main-icon-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: linear-gradient(to bottom left, rgba(255, 255, 255, 0.2), transparent);
}
</style>
