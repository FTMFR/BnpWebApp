<script setup lang="ts">
import { computed } from 'vue'
import { Table, type TableProps, Pagination } from '../molecules'
import BaseSpinner from '../atoms/BaseSpinner.vue'

export interface DataTableProps extends Omit<TableProps, 'data'> {
  data: Record<string, unknown>[]
  pagination?: {
    currentPage: number
    totalPages: number
    pageSize?: number
  }
  loading?: boolean
}

const props = withDefaults(defineProps<DataTableProps>(), {
  loading: false,
  striped: true,
  hoverable: true,
  bordered: true,
})

const emit = defineEmits<{
  'update:pagination': [page: number]
  'page-change': [page: number]
}>()

const paginationModel = computed({
  get: () => props.pagination?.currentPage || 1,
  set: (value) => {
    emit('update:pagination', value)
    emit('page-change', value)
  },
})
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <BaseSpinner size="lg" />
    </div>
    <div v-else>
      <Table
        :columns="columns"
        :data="data"
        :striped="striped"
        :hoverable="hoverable"
        :bordered="bordered"
      >
        <template
          v-for="column in columns"
          :key="column.key"
          #[`cell-${column.key}`]="{ row, value }"
        >
          <slot :name="`cell-${column.key}`" :row="row" :value="value">
            {{ value }}
          </slot>
        </template>
      </Table>
    </div>

    <div v-if="pagination" class="flex justify-center">
      <Pagination
        v-model:current-page="paginationModel"
        :total-pages="pagination.totalPages"
        @change="emit('page-change', $event)"
      />
    </div>
  </div>
</template>
