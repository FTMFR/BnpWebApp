<script setup lang="ts">
import { computed } from 'vue'

/** API pagination payload – pass directly from backend (e.g. TotalCount, PageNumber, PageSize, TotalPages). */
export interface ApiPagination {
  TotalCount: number
  PageNumber: number
  PageSize: number
  TotalPages: number
}

export interface PaginationProps {
  /** Current page (1-based). Ignored if apiPagination is set. */
  currentPage?: number
  /** Total number of pages. Ignored if apiPagination is set. */
  totalPages?: number
  /** When set, currentPage and totalPages are taken from the API – no manual handling. */
  apiPagination?: ApiPagination | null
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisible?: number
}

const props = withDefaults(defineProps<PaginationProps>(), {
  currentPage: 1,
  totalPages: 1,
  apiPagination: undefined,
  showFirstLast: true,
  showPrevNext: true,
  maxVisible: 5,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  change: [page: number]
}>()

/** All values come from API when apiPagination is provided; otherwise from props. */
const currentPage = computed(() =>
  props.apiPagination != null ? props.apiPagination.PageNumber : props.currentPage!
)
const totalPages = computed(() =>
  props.apiPagination != null ? props.apiPagination.TotalPages : props.totalPages!
)
const totalCount = computed(() => props.apiPagination?.TotalCount ?? 0)
const pageSize = computed(() => props.apiPagination?.PageSize ?? 0)

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = props.maxVisible
  const cur = currentPage.value
  const total = totalPages.value

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, cur - half)
    const end = Math.min(total, start + maxVisible - 1)

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

    if (end < total) {
      if (end < total - 1) pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

const goToPage = (page: number) => {
  const total = totalPages.value
  const cur = currentPage.value
  if (page >= 1 && page <= total && page !== cur) {
    emit('update:currentPage', page)
    emit('change', page)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

/** "X–Y of Total" summary when API payload is provided. */
const rangeLabel = computed(() => {
  if (totalCount.value === 0) return null
  const size = pageSize.value
  const cur = currentPage.value
  const total = totalCount.value
  const from = (cur - 1) * size + 1
  const to = Math.min(cur * size, total)
  return `${from}–${to} از ${total}`
})
</script>

<template>
  <div class="flex flex-col items-center gap-2 min-w-0">
    <p
      v-if="rangeLabel"
      class="text-xs sm:text-sm text-muted-foreground order-first"
    >
      {{ rangeLabel }}
    </p>
    <nav
      class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 min-w-0"
      aria-label="Pagination"
    >
    <button
      type="button"
      v-if="showPrevNext"
      :disabled="currentPage === 1"
      class="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-border hover:bg-primary-50 disabled:opacity-50 disabled:pointer-events-none transition-colors text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground shrink-0"
      @click="previousPage"
    >
      قبلی
    </button>

    <button
      type="button"
      v-if="showFirstLast && currentPage > 2"
      class="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-border hover:bg-primary-50 transition-colors text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground shrink-0"
      @click="goToPage(1)"
    >
      ۱
    </button>

    <template v-for="(page, index) in visiblePages" :key="index">
      <button
        type="button"
        v-if="page !== '...'"
        :class="[
          'min-w-[2rem] sm:min-w-0 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 transition-colors text-xs sm:text-sm font-medium shrink-0',
          page === currentPage
            ? 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600'
            : 'border-border text-muted-foreground hover:text-foreground hover:bg-primary-50',
        ]"
        @click="goToPage(page as number)"
      >
        {{ page }}
      </button>
      <span
        v-else
        class="px-1.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground shrink-0"
      >
        ...
      </span>
    </template>

    <button
      type="button"
      v-if="showFirstLast && currentPage < totalPages - 1"
      class="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-border hover:bg-primary-50 transition-colors text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground shrink-0"
      @click="goToPage(totalPages)"
    >
      {{ totalPages }}
    </button>

    <button
      type="button"
      v-if="showPrevNext"
      :disabled="currentPage === totalPages"
      class="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-border hover:bg-primary-50 disabled:opacity-50 disabled:pointer-events-none transition-colors text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground shrink-0"
      @click="nextPage"
    >
      بعدی
    </button>
  </nav>
  </div>
</template>
