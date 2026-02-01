<script setup lang="ts">
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import BaseIcon from '../atoms/BaseIcon.vue'

export interface MobileBottomBarProps {
  menuOpen?: boolean
}

const props = withDefaults(defineProps<MobileBottomBarProps>(), {
  menuOpen: false,
})

const emit = defineEmits<{
  'update:menuOpen': [value: boolean]
  'open-menu': []
}>()

const route = useRoute()

const isActive = (path: string) => route.path === path

// Order: Home (خانه) in the center (index 2). RTL: first item = right, so center = index 2.
const barItems: Array<
  | { label: string; to: string; icon: string; isCenter?: boolean }
  | { label: string; isMenu: true; icon: string }
> = [
  { label: 'کارت ها', to: '/carts', icon: 'CreditCard' },
  { label: 'حساب ها', to: '/profits', icon: 'DollarSign' },
  { label: 'خانه', to: '/dashboard', icon: 'Home', isCenter: true },
  { label: 'منو', isMenu: true, icon: 'Menu' },
  { label: 'پروفایل', to: '/profile', icon: 'User' },
]

const isItemActive = (item: (typeof barItems)[number]) => {
  if (item.isMenu) return props.menuOpen
  return item.to ? isActive(item.to) : false
}

const handleMenuClick = () => {
  emit('open-menu')
  emit('update:menuOpen', true)
}
</script>

<template>
  <nav
    class="mobile-bottom-bar fixed bottom-0 left-0 right-0 z-fixed lg:hidden"
    style="padding-bottom: env(safe-area-inset-bottom, 0)"
  >
    <!-- Glass tray -->
    <div
      class="glass-bar h-full min-h-[4.5rem] flex flex-row items-end justify-around px-3 pb-2 pt-3 gap-0"
    >
      <template v-for="item in barItems" :key="item.label">
        <!-- Menu button (emit, no route) -->
        <button
          v-if="item.isMenu"
          type="button"
          class="bar-item flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 py-2 rounded-2xl transition-all duration-200 ease-out text-muted-foreground hover:text-accent hover:bg-white/30 dark:hover:bg-white/10 active:scale-[0.96] touch-manipulation"
          :class="[isItemActive(item) && 'text-accent bg-white/40 dark:bg-white/15 font-medium']"
          @click="handleMenuClick"
        >
          <BaseIcon
            :name="item.icon"
            :size="22"
            :stroke-width="2"
            icon-class="shrink-0 transition-colors"
          />
          <span class="text-[11px] font-medium leading-tight tabular-nums">{{ item.label }}</span>
        </button>
        <!-- Center item (Home) – glass pill -->
        <RouterLink
          v-else-if="'isCenter' in item && item.isCenter"
          :to="item.to!"
          class="bar-item bar-item--center flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 py-2 rounded-2xl transition-all duration-200 ease-out text-muted-foreground hover:text-accent active:scale-[0.96] touch-manipulation"
          :class="[isItemActive(item) && 'text-accent font-semibold']"
        >
          <span
            class="glass-pill flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200"
            :class="[
              isItemActive(item)
                ? 'glass-pill--active bg-accent text-accent-foreground shadow-lg'
                : 'bg-white/40 dark:bg-white/20 border border-white/40 dark:border-white/20 shadow-lg hover:bg-white/60 dark:hover:bg-white/30',
            ]"
          >
            <BaseIcon :name="item.icon" :size="24" :stroke-width="2.5" icon-class="shrink-0" />
          </span>
          <span class="text-[11px] font-medium leading-tight tabular-nums">{{ item.label }}</span>
        </RouterLink>
        <!-- Other RouterLink items -->
        <RouterLink
          v-else
          :to="item.to!"
          class="bar-item flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 py-2 rounded-2xl transition-all duration-200 ease-out text-muted-foreground hover:text-accent hover:bg-white/30 dark:hover:bg-white/10 active:scale-[0.96] touch-manipulation"
          :class="[isItemActive(item) && 'text-accent bg-white/40 dark:bg-white/15 font-medium']"
        >
          <BaseIcon
            :name="item.icon"
            :size="22"
            :stroke-width="2"
            icon-class="shrink-0 transition-colors"
          />
          <span class="text-[11px] font-medium leading-tight truncate max-w-full tabular-nums">{{
            item.label
          }}</span>
        </RouterLink>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.mobile-bottom-bar {
  /* Outer glow / ambient shadow */
  box-shadow:
    0 -1px 0 0 rgba(255, 255, 255, 0.08),
    0 -24px 48px -12px rgba(0, 0, 0, 0.12),
    0 -12px 24px -8px rgba(0, 0, 0, 0.08);
}

.dark .mobile-bottom-bar {
  box-shadow:
    0 -1px 0 0 rgba(255, 255, 255, 0.06),
    0 -24px 48px -12px rgba(0, 0, 0, 0.4),
    0 -12px 24px -8px rgba(0, 0, 0, 0.25);
}

.glass-bar {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(255, 255, 255, 0.75) 50%,
    rgba(255, 255, 255, 0.65) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
}

.dark .glass-bar {
  background: linear-gradient(
    to top,
    rgba(23, 23, 23, 0.9) 0%,
    rgba(23, 23, 23, 0.75) 50%,
    rgba(23, 23, 23, 0.6) 100%
  );
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-pill {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.glass-pill--active {
  border: none;
}
</style>
