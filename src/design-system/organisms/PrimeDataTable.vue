<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue'
import type { VNode } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

export interface PrimeDataTableColumn<T = Record<string, unknown>> {
  field: string
  header: string
  sortable?: boolean
  style?: string | Record<string, string | number>
  bodyTemplate?: (data: T, index?: number) => string | number | VNode
}

export interface PrimeDataTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: PrimeDataTableColumn<T>[]
  loading?: boolean
  paginator?: boolean
  rows?: number
  rowsPerPageOptions?: number[]
  showGridlines?: boolean
  stripedRows?: boolean
  sortMode?: 'single' | 'multiple'
}

withDefaults(defineProps<PrimeDataTableProps<T>>(), {
  loading: false,
  paginator: true,
  rows: 10,
  rowsPerPageOptions: () => [10, 20, 50],
  showGridlines: true,
  stripedRows: true,
  sortMode: 'single',
})

const pt = computed(() => ({
  root: { class: 'w-full' },
  header: { class: 'bg-primary-50 border-b-2 border-primary-200' },
  headerCell: { class: 'text-center text-primary-700 font-semibold py-3' },
  bodyRow: {
    class: 'hover:bg-primary-50/50 transition-colors border-b border-border-default',
  },
  bodyCell: { class: 'text-center py-3' },
  paginator: { class: 'border-t border-border-default' },
}))
</script>

<template>
  <div class="border-2 border-border-default rounded-lg overflow-hidden">
    <DataTable
      :value="data"
      :loading="loading"
      :paginator="paginator"
      :rows="rows"
      :rows-per-page-options="rowsPerPageOptions"
      :show-gridlines="showGridlines"
      :striped-rows="stripedRows"
      :sort-mode="sortMode"
      :pt="pt"
    >
      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :sortable="column.sortable !== false"
        :style="column.style"
      >
        <template v-if="$slots[`cell-${column.field}`]" #body="{ data, index }">
          <slot :name="`cell-${column.field}`" :data="data" :row="data" :index="index" />
        </template>
        <template v-else-if="column.bodyTemplate" #body="{ data, index }">
          {{ column.bodyTemplate(data, index) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
