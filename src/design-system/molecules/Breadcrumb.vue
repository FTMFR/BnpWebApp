<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '../atoms/BaseIcon.vue'

defineOptions({
  name: 'BreadcrumbNav',
})

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: string | 'slash' | 'chevron' | 'dot'
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  separator: 'chevron',
})

const separatorContent = computed(() => {
  if (
    typeof props.separator === 'string' &&
    props.separator !== 'slash' &&
    props.separator !== 'chevron' &&
    props.separator !== 'dot'
  ) {
    return props.separator
  }

  if (props.separator === 'slash') {
    return '/'
  }

  if (props.separator === 'dot') {
    return '•'
  }

  return null
})

const useIconSeparator = computed(() => props.separator === 'chevron')
</script>

<template>
  <nav class="flex items-center space-x-2 space-x-reverse" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2 space-x-reverse">
      <li v-for="(item, index) in items" :key="index" class="flex items-center">
        <a
          v-if="item.href && index < items.length - 1"
          :href="item.href"
          class="text-sm text-muted-foreground hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-2 py-1 rounded-md transition-all"
        >
          {{ item.label }}
        </a>
        <span
          v-else
          :class="[
            'text-sm transition-colors px-2 py-1 rounded-md',
            index === items.length - 1
              ? 'text-primary-600 dark:text-white font-semibold bg-primary-50 dark:bg-primary-900/20'
              : 'text-muted-foreground',
          ]"
        >
          {{ item.label }}
        </span>
        <span v-if="index < items.length - 1" class="mx-2 text-muted-foreground flex items-center">
          <BaseIcon
            v-if="useIconSeparator"
            name="ChevronLeft"
            :size="16"
            class="text-muted-foreground"
          />
          <span v-else>{{ separatorContent }}</span>
        </span>
      </li>
    </ol>
  </nav>
</template>
