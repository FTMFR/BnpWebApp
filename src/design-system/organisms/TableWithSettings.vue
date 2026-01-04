
<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, computed, watch, h, defineComponent, onMounted, onUnmounted, nextTick } from 'vue'
import type { VNode } from 'vue'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import { BaseButton, BaseBadge, BaseIcon } from '../atoms'

// Simple component to render cell content
const RenderCell = defineComponent({
  props: {
    renderFn: {
      type: Function as unknown as () => () => VNode | string | number,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const result = (props.renderFn as () => VNode | string | number)()
      if (typeof result === 'string' || typeof result === 'number') {
        return h('span', String(result))
      }
      return result as VNode
    }
  },
})

interface TableColumn<T = Record<string, unknown>> {
  id: string
  title: string
  sortable?: boolean
  visible?: boolean
  render?: (row: T, index?: number) => VNode | string | number
}

interface TableWithSettingsProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[]
  data: T[]
  onColumnOrderChange?: (columns: TableColumn<T>[]) => void
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void
  className?: string
}

const props = withDefaults(defineProps<TableWithSettingsProps<T>>(), {
  className: '',
})

const emit = defineEmits<{
  'column-order-change': [columns: TableColumn<T>[]]
  'column-visibility-change': [columnId: string, visible: boolean]
}>()

const localColumns = ref<TableColumn<T>[]>([...props.columns])
const sortConfig = ref<{
  key: string
  direction: 'asc' | 'desc'
} | null>(null)
const isSettingsOpen = ref(false)
const expandedRows = ref<number[]>([])
const tableContainerRef = ref<HTMLElement | null>(null)
const hasOverflow = ref(false)

watch(
  () => props.columns,
  (newColumns) => {
    localColumns.value = [...newColumns]
  },
  { deep: true }
)

// Sort handler
const handleSort = (columnId: string) => {
  const column = localColumns.value.find((col) => col.id === columnId)
  if (!column?.sortable) return

  let direction: 'asc' | 'desc' = 'asc'
  if (sortConfig.value?.key === columnId && sortConfig.value.direction === 'asc') {
    direction = 'desc'
  }
  sortConfig.value = { key: columnId, direction }
}

// Sort data
const sortedData = computed(() => {

  if (!sortConfig.value) {
    const result = props.data
    return result
  }

  const result = [...props.data].sort((a, b) => {
    const aValue = a[sortConfig.value!.key as keyof T]
    const bValue = b[sortConfig.value!.key as keyof T]

    if (aValue < bValue) return sortConfig.value!.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.value!.direction === 'asc' ? 1 : -1
    return 0
  })

  return result
})

// Move column up
const moveColumnUp = (index: number) => {
  if (index === 0) return
  const newColumns: TableColumn<T>[] = [...localColumns.value]
  const temp = newColumns[index - 1]
  if (temp && newColumns[index]) {
  newColumns[index - 1] = newColumns[index]
  newColumns[index] = temp
  localColumns.value = newColumns
  emit('column-order-change', newColumns)
    props.onColumnOrderChange?.(newColumns)
  }
}

// Move column down
const moveColumnDown = (index: number) => {
  if (index === localColumns.value.length - 1) return
  const newColumns: TableColumn<T>[] = [...localColumns.value]
  const temp = newColumns[index]
  const nextItem = newColumns[index + 1]
  if (temp && nextItem) {
    newColumns[index] = nextItem
  newColumns[index + 1] = temp
  localColumns.value = newColumns
  emit('column-order-change', newColumns)
    props.onColumnOrderChange?.(newColumns)
  }
}

// Toggle column visibility
const toggleColumnVisibility = (columnId: string) => {
  const newColumns = localColumns.value.map((col) =>
    col.id === columnId ? { ...col, visible: !col.visible } : col
  )
  localColumns.value = newColumns
  const column = newColumns.find((col) => col.id === columnId)
  const isVisible = column?.visible || false
  emit('column-visibility-change', columnId, isVisible)
  props.onColumnVisibilityChange?.(columnId, isVisible)
}

const visibleColumns = computed(() => {
  const result = localColumns.value.filter((col) => col.visible !== false)
 return result
})

// Get primary columns for mobile summary (first 2-3 columns, excluding actions)
const primaryColumns = computed(() => {
  return visibleColumns.value
    .filter(col => col.id !== 'actions')
    .slice(0, 3)
})

// Get secondary columns for mobile details (remaining columns)
const secondaryColumns = computed(() => {
  return visibleColumns.value
    .filter(col => col.id !== 'actions')
    .slice(3)
})

// Get actions column separately
const actionsColumn = computed(() => {
  return visibleColumns.value.find(col => col.id === 'actions')
})

// Toggle row expansion
const toggleRow = (rowIndex: number) => {
  const index = expandedRows.value.indexOf(rowIndex)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(rowIndex)
  }
}

// Check if table has overflow
const checkOverflow = () => {
  if (tableContainerRef.value) {
    hasOverflow.value = tableContainerRef.value.scrollWidth > tableContainerRef.value.clientWidth
    // Expand feature is available but rows are not expanded by default
  }
}

onMounted(() => {
  checkOverflow()
  window.addEventListener('resize', checkOverflow)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkOverflow)
})

watch(() => sortedData.value, () => {
  nextTick(() => {
    checkOverflow()
  })
}, { deep: true })

// Render cell content - returns VNode or primitive
const renderCellContent = (column: TableColumn<T>, row: T, rowIndex: number): VNode | string | number => {
  if (!column.render) {
    const value = (row as Record<string, unknown>)[column.id]
    if (typeof value === 'string' || typeof value === 'number') {
      return value
    }
    return String(value ?? '')
  }

  try {
    const result = column.render(row, rowIndex)
    return result
  } catch (error) {
    return h('span', { class: 'text-red-500' }, String(error))
  }
}
</script>

<template>
  <div :class="['space-y-3 sm:space-y-4', className]">
    <!-- Header با دکمه تنظیمات -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 pb-2 border-b-2 border-border">
      <h3 class="text-base sm:text-lg font-semibold text-foreground">نتایج جستجو</h3>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <BaseBadge variant="secondary" class="px-3 sm:px-4 py-1 text-xs sm:text-sm">
          {{ data.length }} مورد
        </BaseBadge>
        <BaseButton
          variant="outline"
          size="sm"
          class="flex items-center gap-2 border-2 border-border hover:bg-secondary text-xs sm:text-sm flex-1 sm:flex-initial"
          @click="isSettingsOpen = true"
        >
          <BaseIcon name="Settings" :size="14" class="sm:w-4 sm:h-4" />
          <span class="hidden sm:inline">تنظیمات ستون‌ها</span>
          <span class="sm:hidden">تنظیمات</span>
        </BaseButton>
      </div>
    </div>

    <!-- Dialog تنظیمات -->
    <Dialog
      v-model:visible="isSettingsOpen"
      modal
      header="تنظیمات ستون‌ها"
      :style="{ width: '90vw', maxWidth: '50rem', maxHeight: '90vh' }"
      :pt="{
        root: {
          dir: 'rtl',
          class: 'max-w-2xl max-h-[90vh] overflow-y-auto bg-card-background rounded-lg shadow-2xl border border-border-default z-modal'
        },
        mask: {
          class: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-backdrop'
        },
        header: {
          class: 'text-right px-4 sm:px-6 py-3 sm:py-4 bg-card-background border-b border-border-default rounded-t-lg'
        },
        content: {
          class: 'overflow-y-auto p-4 sm:p-6 bg-card-background'
        },
        footer: {
          class: 'px-4 sm:px-6 py-3 sm:py-4 bg-card-background border-t border-border-default rounded-b-lg'
        },
      }"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <BaseIcon name="Settings" :size="20" />
          <span>تنظیمات ستون‌ها</span>
        </div>
      </template>

      <p class="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5">ترتیب و نمایش ستون‌های جدول را تنظیم کنید</p>

      <div class="space-y-2">
        <!-- عنوان‌های بخش‌ها -->
        <div class="grid grid-cols-12 gap-1 sm:gap-2 pb-2 border-b-2 border-border">
          <div class="col-span-2 sm:col-span-1 text-center text-xs sm:text-sm text-muted-foreground">نمایش</div>
          <div class="col-span-6 sm:col-span-7 text-right text-xs sm:text-sm text-muted-foreground pr-1 sm:pr-2">عنوان ستون</div>
          <div class="col-span-4 text-center text-xs sm:text-sm text-muted-foreground">ترتیب</div>
        </div>

        <!-- لیست ستون‌ها -->
        <div
          v-for="(column, index) in localColumns"
          :key="column.id"
          class="group grid grid-cols-12 gap-1 sm:gap-2 items-center p-2 sm:p-3 rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <!-- Checkbox نمایش -->
          <div class="col-span-2 sm:col-span-1 flex justify-center">
            <Checkbox
              :model-value="column.visible !== false"
              @update:model-value="toggleColumnVisibility(column.id)"
              binary
            />
          </div>

          <!-- عنوان ستون -->
          <div class="col-span-6 sm:col-span-7 min-w-0">
            <span :class="['text-xs sm:text-sm truncate transition-colors', column.visible === false ? 'text-muted-foreground group-hover:text-foreground/80' : 'text-foreground group-hover:text-foreground']">
              {{ column.title }}
            </span>
          </div>

          <!-- دکمه‌های ترتیب -->
          <div class="col-span-4 flex justify-center gap-1">
            <BaseButton
              size="sm"
              variant="ghost"
              @click="moveColumnUp(index)"
              :disabled="index === 0"
              class="hover:!bg-primary-100 dark:hover:!bg-primary-900/40 !text-primary-600 dark:!text-primary-400 hover:!text-primary-700 dark:hover:!text-primary-300 disabled:opacity-30 transition-all"
            >
              <BaseIcon name="ChevronUp" :size="16" />
            </BaseButton>
            <BaseButton
              size="sm"
              variant="ghost"
              @click="moveColumnDown(index)"
              :disabled="index === localColumns.length - 1"
              class="hover:!bg-primary-100 dark:hover:!bg-primary-900/40 !text-primary-600 dark:!text-primary-400 hover:!text-primary-700 dark:hover:!text-primary-300 disabled:opacity-30 transition-all"
            >
              <BaseIcon name="ChevronDown" :size="16" />
            </BaseButton>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="outline" @click="isSettingsOpen = false" class="border-2">
            بستن
          </BaseButton>
        </div>
      </template>
    </Dialog>

    <!-- Table with Expandable Rows -->
    <div ref="tableContainerRef" class="border-2 border-border rounded-lg overflow-x-auto">
      <table class="w-full min-w-[600px]">
        <!-- Desktop Header: All columns -->
        <thead class="hidden md:table-header-group">
          <tr class="bg-primary-50 hover:bg-primary-50 border-b-2 border-primary-200">
            <th
              v-for="(column, colIndex) in visibleColumns"
              :key="column.id"
              :class="[
                'text-center text-primary-700 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap border-r border-border',
                colIndex === visibleColumns.length - 1 ? 'border-r-0' : ''
              ]"
            >
              <button
                v-if="column.sortable"
                @click="handleSort(column.id)"
                class="flex items-center justify-center gap-2 w-full hover:text-primary-900 transition-colors"
              >
                {{ column.title }}
                <BaseIcon
                  v-if="sortConfig?.key === column.id"
                  :name="sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                  :size="16"
                  class="text-primary-600"
                />
                <BaseIcon
                  v-else
                  name="ChevronsUpDown"
                  :size="16"
                  class="opacity-40"
                />
              </button>
              <span v-else>{{ column.title }}</span>
            </th>
          </tr>
        </thead>

        <!-- Mobile Header: Expand icon + Primary columns -->
        <thead class="md:hidden">
          <tr class="bg-primary-50 hover:bg-primary-50 border-b-2 border-primary-200">
            <th class="text-center text-primary-700 py-2 px-2 text-xs font-semibold w-10 border-r border-border"></th>
            <th
              v-for="(column, colIndex) in primaryColumns"
              :key="column.id"
              :class="[
                'text-center text-primary-700 py-2 px-2 text-xs font-semibold whitespace-nowrap border-r border-border',
                colIndex === primaryColumns.length - 1 ? 'border-r-0' : ''
              ]"
            >
              <button
                v-if="column.sortable"
                @click="handleSort(column.id)"
                class="flex items-center justify-center gap-1 w-full hover:text-primary-900 transition-colors text-xs"
              >
                {{ column.title }}
                <BaseIcon
                  v-if="sortConfig?.key === column.id"
                  :name="sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                  :size="14"
                  class="text-primary-600"
                />
              </button>
              <span v-else class="text-xs">{{ column.title }}</span>
            </th>
            <th
              v-if="actionsColumn"
              class="text-center text-primary-700 py-2 px-2 text-xs font-semibold whitespace-nowrap"
            >
              {{ actionsColumn.title }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="sortedData.length === 0">
            <td
              :colspan="visibleColumns.length"
              class="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base"
            >
              هیچ داده‌ای یافت نشد
            </td>
          </tr>

          <!-- Desktop Rows: All columns -->
          <template v-for="(row, rowIndex) in sortedData" :key="rowIndex">
            <tr
              class="hidden md:table-row hover:bg-primary-50/50 transition-colors border-b border-border"
            >
              <td
                v-for="(column, colIndex) in visibleColumns"
                :key="column.id"
                :class="[
                  'text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap border-r border-border',
                  colIndex === visibleColumns.length - 1 ? 'border-r-0' : ''
                ]"
              >
                <template v-if="column.render">
                  <RenderCell
                    :render-fn="() => renderCellContent(column, row, rowIndex)"
                  />
                </template>
                <span v-else>{{ (row as Record<string, unknown>)[column.id] }}</span>
              </td>
            </tr>

            <!-- Mobile Rows: Expandable -->
            <tr
              class="md:hidden hover:bg-primary-50/50 transition-colors border-b border-border cursor-pointer"
              @click="toggleRow(rowIndex)"
            >
              <!-- Expand Icon (Right side) -->
              <td class="text-center py-2 px-2 w-10 border-r border-border">
                <BaseIcon
                  :name="expandedRows.includes(rowIndex) ? 'ChevronUp' : 'ChevronDown'"
                  :size="18"
                  class="text-muted-foreground transition-transform"
                />
              </td>
              <!-- Primary Columns -->
              <td
                v-for="(column, colIndex) in primaryColumns"
                :key="column.id"
                :class="[
                  'text-center py-2 px-2 text-xs whitespace-nowrap border-r border-border',
                  colIndex === primaryColumns.length - 1 ? 'border-r-0' : ''
                ]"
              >
                <template v-if="column.render">
                  <RenderCell
                    :render-fn="() => renderCellContent(column, row, rowIndex)"
                  />
                </template>
                <span v-else class="truncate block max-w-[100px]">{{ (row as Record<string, unknown>)[column.id] || '-' }}</span>
              </td>
              <!-- Actions Column (3dot menu) -->
              <td
                v-if="actionsColumn"
                class="text-center py-2 px-2 text-xs"
                @click.stop
              >
                <RenderCell
                  v-if="actionsColumn"
                  :render-fn="() => renderCellContent(actionsColumn!, row, rowIndex)"
                />
              </td>
            </tr>

            <!-- Mobile Expanded Details Row -->
            <Transition name="expand">
              <tr
                v-if="expandedRows.includes(rowIndex)"
                class="md:hidden bg-primary-100/40 dark:bg-primary-900/20 border-l-4 border-primary-500"
              >
                <td
                  :colspan="primaryColumns.length + (actionsColumn ? 1 : 0) + 1"
                  class="p-4 bg-card-background"
                >
                  <div class="space-y-3">
                    <div class="flex items-center gap-2 mb-2 pb-2 border-b-2 border-primary-200">
                      <BaseIcon name="Info" :size="16" class="text-primary-600" />
                      <span class="text-xs font-bold text-primary-700">جزئیات بیشتر</span>
                    </div>
                    <div
                      v-for="column in secondaryColumns"
                      :key="column.id"
                      class="flex items-start justify-between gap-3 pb-3 border-b border-border-default last:border-0 last:pb-0 bg-secondary/20 dark:bg-secondary/10 p-2 rounded"
                    >
                      <span class="text-xs font-semibold text-muted-foreground min-w-[90px] flex-shrink-0">
                        {{ column.title }}:
                      </span>
                      <div class="text-xs text-foreground text-right flex-1 min-w-0 break-words">
                        <template v-if="column.render">
                          <RenderCell
                            :render-fn="() => renderCellContent(column, row, rowIndex)"
                          />
                        </template>
                        <span v-else class="break-words">{{ (row as Record<string, unknown>)[column.id] || '-' }}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </Transition>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 1000px;
  opacity: 1;
}
</style>
