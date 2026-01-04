<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: TableColumn[]
  data: T[]
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
}

const props = withDefaults(defineProps<TableProps<T>>(), {
  striped: false,
  hoverable: true,
  bordered: true,
})

const tableClasses = computed(() => {
  const base = 'w-full'
  return base
})

const rowClasses = computed(() => {
  let classes = ''
  if (props.hoverable) {
    classes += 'hover:bg-secondary/30 transition-colors'
  }
  return classes
})

const cellAlignClasses = (align?: 'left' | 'center' | 'right') => {
  const aligns = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return aligns[align || 'right']
}
</script>

<template>
  <div class="overflow-x-auto">
    <table :class="tableClasses">
      <thead>
        <tr class="border-b border-border-default">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'py-3 px-4 text-sm font-semibold text-muted-foreground',
              cellAlignClasses(column.align),
            ]"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in data"
          :key="index"
          :class="[
            rowClasses,
            striped && index % 2 === 1 ? 'bg-secondary/20' : '',
            bordered ? 'border-b border-border-default' : '',
          ]"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="['py-4 px-4 text-sm', cellAlignClasses(column.align)]"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
