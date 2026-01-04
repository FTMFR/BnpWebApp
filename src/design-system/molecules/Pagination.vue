<script setup lang="ts">
import { computed } from 'vue'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisible?: number
}

const props = withDefaults(defineProps<PaginationProps>(), {
  showFirstLast: true,
  showPrevNext: true,
  maxVisible: 5,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  change: [page: number]
}>()

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages, maxVisible } = props

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, currentPage - half)
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }
  }

  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('change', page)
  }
}

const previousPage = () => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    goToPage(props.currentPage + 1)
  }
}
</script>

<template>
  <nav class="flex items-center justify-center gap-2" aria-label="Pagination">
    <button
      v-if="showPrevNext"
      :disabled="currentPage === 1"
      class="px-4 py-2 rounded-lg border-2 border-border hover:bg-primary-50 disabled:opacity-50 disabled:pointer-events-none transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
      @click="previousPage"
    >
      قبلی
    </button>

    <button
      v-if="showFirstLast && currentPage > 2"
      class="px-4 py-2 rounded-lg border-2 border-border hover:bg-primary-50 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
      @click="goToPage(1)"
    >
      ۱
    </button>

    <template v-for="(page, index) in visiblePages" :key="index">
      <button
        v-if="page !== '...'"
        :class="[
          'px-4 py-2 rounded-lg border-2 transition-colors text-sm font-medium',
          page === currentPage
            ? 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600'
            : 'border-border text-muted-foreground hover:text-foreground hover:bg-primary-50',
        ]"
        @click="goToPage(page as number)"
      >
        {{ page }}
      </button>
      <span v-else class="px-4 py-2 text-sm text-muted-foreground"> ... </span>
    </template>

    <button
      v-if="showFirstLast && currentPage < totalPages - 1"
      class="px-4 py-2 rounded-lg border-2 border-border hover:bg-primary-50 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
      @click="goToPage(totalPages)"
    >
      {{ totalPages }}
    </button>

    <button
      v-if="showPrevNext"
      :disabled="currentPage === totalPages"
      class="px-4 py-2 rounded-lg border-2 border-border hover:bg-primary-50 disabled:opacity-50 disabled:pointer-events-none transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
      @click="nextPage"
    >
      بعدی
    </button>
  </nav>
</template>
