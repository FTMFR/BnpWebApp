<script setup lang="ts">
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import BaseIcon from '../atoms/BaseIcon.vue'

export interface MobileBottomBarProps {
  menuOpen?: boolean
  searchOpen?: boolean
}

const props = withDefaults(defineProps<MobileBottomBarProps>(), {
  menuOpen: false,
  searchOpen: false,
})

const emit = defineEmits<{
  'update:menuOpen': [value: boolean]
  'open-menu': []
  'open-search': []
}>()

const route = useRoute()

const isActive = (path: string) => route.path === path

const barItems: Array<
  | { label: string; to: string; icon: string; isCenter?: boolean }
  | { label: string; isMenu: true; icon: string }
  | { label: string; isSearch: true; icon: string }
> = [
  { label: 'جستجو', isSearch: true, icon: 'Search' },
  { label: 'تنظیمات', to: '/settings', icon: 'Settings' },
  { label: 'خانه', to: '/dashboard', icon: 'Home', isCenter: true },
  { label: 'منو', isMenu: true, icon: 'Menu' },
  { label: 'پروفایل', to: '/profile', icon: 'User' },
]

const isItemActive = (item: (typeof barItems)[number]): boolean => {
  if ('isMenu' in item && item.isMenu) return props.menuOpen
  if (props.menuOpen) return false
  if ('to' in item && item.to) return isActive(item.to)
  return false
}

const getItemHref = (item: (typeof barItems)[number]): string =>
  'to' in item && item.to ? item.to : '/dashboard'

const handleMenuClick = () => {
  emit('open-menu')
  emit('update:menuOpen', true)
}

const handleSearchClick = () => {
  emit('open-search')
}
</script>

<template>
  <nav
    class="mobile-bottom-bar fixed bottom-0 left-0 right-0 z-fixed md:hidden"
    style="padding-bottom: env(safe-area-inset-bottom, 0)"
  >
    <div
      class="glass-bar h-full min-h-[4.5rem] flex flex-row items-end justify-around px-3 pb-2 pt-3 gap-0"
    >
      <template v-for="item in barItems" :key="item.label">
        <button
          v-if="'isSearch' in item && item.isSearch"
          type="button"
          class="bar-item group flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 py-2 rounded-2xl transition-all duration-200 ease-out active:scale-[0.96] touch-manipulation"
          :class="[isItemActive(item) ? 'bar-item--active' : 'bar-item--default']"
          @click="handleSearchClick"
        >
          <span
            class="bar-item__pill flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200"
            :class="[isItemActive(item) ? 'bar-item__pill--active' : 'bar-item__pill--default']"
          >
            <BaseIcon
              :name="item.icon"
              :size="22"
              :stroke-width="isItemActive(item) ? 2.5 : 2"
              icon-class="shrink-0 transition-colors"
            />
          </span>
          <span
            class="bar-item__label text-[11px] leading-tight tabular-nums transition-all duration-200"
            :class="[isItemActive(item) ? 'bar-item__label--active' : 'bar-item__label--default']"
          >
            {{ item.label }}
          </span>
        </button>
        <button
          v-else-if="'isMenu' in item && item.isMenu"
          type="button"
          class="bar-item group flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 py-2 rounded-2xl transition-all duration-200 ease-out active:scale-[0.96] touch-manipulation"
          :class="[isItemActive(item) ? 'bar-item--active' : 'bar-item--default']"
          @click="handleMenuClick"
        >
          <span
            class="bar-item__pill flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200"
            :class="[isItemActive(item) ? 'bar-item__pill--active' : 'bar-item__pill--default']"
          >
            <BaseIcon
              :name="item.icon"
              :size="22"
              :stroke-width="isItemActive(item) ? 2.5 : 2"
              icon-class="shrink-0 transition-colors"
            />
          </span>
          <span
            class="bar-item__label text-[11px] leading-tight tabular-nums transition-all duration-200"
            :class="[isItemActive(item) ? 'bar-item__label--active' : 'bar-item__label--default']"
          >
            {{ item.label }}
          </span>
        </button>
        <RouterLink
          v-else-if="'isCenter' in item && item.isCenter"
          :to="getItemHref(item)"
          class="bar-item group flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 py-2 rounded-2xl transition-all duration-200 ease-out active:scale-[0.96] touch-manipulation"
          :class="[isItemActive(item) ? 'bar-item--active' : 'bar-item--default']"
        >
          <span
            class="bar-item__pill bar-item__pill--center flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200"
            :class="[isItemActive(item) ? 'bar-item__pill--active' : 'bar-item__pill--default']"
          >
            <BaseIcon
              :name="item.icon"
              :size="24"
              :stroke-width="isItemActive(item) ? 2.5 : 2"
              icon-class="shrink-0"
            />
          </span>
          <span
            class="bar-item__label text-[11px] leading-tight tabular-nums transition-all duration-200"
            :class="[isItemActive(item) ? 'bar-item__label--active' : 'bar-item__label--default']"
          >
            {{ item.label }}
          </span>
        </RouterLink>
        <RouterLink
          v-else
          :to="getItemHref(item)"
          class="bar-item group flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 py-2 rounded-2xl transition-all duration-200 ease-out active:scale-[0.96] touch-manipulation"
          :class="[isItemActive(item) ? 'bar-item--active' : 'bar-item--default']"
        >
          <span
            class="bar-item__pill flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200"
            :class="[isItemActive(item) ? 'bar-item__pill--active' : 'bar-item__pill--default']"
          >
            <BaseIcon
              :name="item.icon"
              :size="22"
              :stroke-width="isItemActive(item) ? 2.5 : 2"
              icon-class="shrink-0"
            />
          </span>
          <span
            class="bar-item__label text-[11px] leading-tight truncate max-w-full tabular-nums transition-all duration-200"
            :class="[isItemActive(item) ? 'bar-item__label--active' : 'bar-item__label--default']"
          >
            {{ item.label }}
          </span>
        </RouterLink>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.mobile-bottom-bar {
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

/* --- Single source of truth: default / hover / active --- */

/* DEFAULT (inactive): muted, no pill fill */
.bar-item--default .bar-item__pill--default {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}

.bar-item--default .bar-item__label--default {
  color: var(--text-secondary);
  font-weight: 500;
}

/* HOVER (inactive + hover): subtle background, brighter text */
.bar-item--default:hover .bar-item__pill--default {
  background: rgba(255, 255, 255, 0.35);
  color: var(--text-primary);
}

.dark .bar-item--default:hover .bar-item__pill--default {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.bar-item--default:hover .bar-item__label--default {
  color: var(--text-primary);
}

/* ACTIVE (selected): same "home style" for every tab – accent pill + accent text */
.bar-item--active .bar-item__pill--active {
  background: var(--accent);
  color: var(--accent-foreground);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark .bar-item--active .bar-item__pill--active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.bar-item--active .bar-item__label--active {
  color: var(--accent);
  font-weight: 600;
}

/* Center pill: same states, only size differs */
.bar-item__pill--center {
  width: 3rem;
  height: 3rem;
}
</style>
