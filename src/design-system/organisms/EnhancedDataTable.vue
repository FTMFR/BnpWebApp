<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, computed, watch, nextTick } from 'vue'
import type { VNode } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import type {
  DataTableRowSelectEvent,
  DataTableRowUnselectEvent,
  DataTableRowExpandEvent,
  DataTableRowCollapseEvent,
  DataTableCellEditCompleteEvent,
  DataTableRowEditSaveEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
  DataTablePageEvent,
  DataTableFilterMeta,
} from 'primevue/datatable'
import { BaseButton, BaseIcon } from '../atoms'
import type { SelectOption } from '../molecules/FormField.vue'

/**
 * Column definition for EnhancedDataTable
 */
export interface DataTableColumn<T = Record<string, unknown>> {
  /** Field name in the data object */
  field: string
  /** Column header text */
  header: string
  /** Whether column is sortable */
  sortable?: boolean
  /** Whether column is filterable */
  filterable?: boolean
  /** Filter type: text, select, multiselect, date, number, boolean */
  filterType?: 'text' | 'select' | 'multiselect' | 'date' | 'number' | 'boolean'
  /** Options for select/multiselect filters */
  filterOptions?: SelectOption[]
  /** Placeholder for filter input */
  filterPlaceholder?: string
  /** Column style */
  style?: string | Record<string, string>
  /** Body cell style */
  bodyStyle?: string | Record<string, string>
  /** Header cell style */
  headerStyle?: string | Record<string, string>
  /** Whether column is frozen (sticky) */
  frozen?: boolean
  /** Alignment for frozen column */
  alignFrozen?: 'left' | 'right'
  /** Editor type for inline editing */
  editor?: 'text' | 'number' | 'date' | 'select' | 'custom'
  /** Options for editor (e.g., select options) */
  editorOptions?: Record<string, unknown>
  /** Whether column is visible */
  visible?: boolean
  /** Custom body template function */
  bodyTemplate?: (data: T, index?: number) => VNode | string | number
}

/**
 * Props for EnhancedDataTable component
 */
export interface EnhancedDataTableProps<T = Record<string, unknown>> {
  /** Table data array */
  data: T[]
  /** Column definitions */
  columns: DataTableColumn<T>[]
  /** Enable pagination */
  paginator?: boolean
  /** Number of rows per page */
  rows?: number
  /** Rows per page options */
  rowsPerPageOptions?: number[]
  /** Custom paginator template */
  paginatorTemplate?: string
  /** Sort mode: single or multiple */
  sortMode?: 'single' | 'multiple'
  /** Default sort field */
  defaultSortField?: string
  /** Default sort order (1 = asc, -1 = desc) */
  defaultSortOrder?: 1 | -1
  /** Enable removable sort (third click removes sort) */
  removableSort?: boolean
  /** Global filter value */
  globalFilter?: string
  /** Filter display mode: row or menu */
  filterDisplay?: 'row' | 'menu'
  /** Column filters object */
  columnFilters?: DataTableFilterMeta
  /** Selection mode: single, multiple, or null */
  selectionMode?: 'single' | 'multiple' | null
  /** Selected row(s) */
  selection?: T | T[]
  /** Data key for selection (required for performance) */
  dataKey?: string
  /** Expanded rows */
  expandedRows?: T[] | Record<string, boolean>
  /** Edit mode: cell or row */
  editMode?: 'cell' | 'row'
  /** Rows currently being edited */
  editingRows?: T[]
  /** Table size */
  size?: 'small' | 'normal' | 'large'
  /** Show gridlines */
  showGridlines?: boolean
  /** Striped rows */
  stripedRows?: boolean
  /** Dynamic row class function */
  rowClass?: (data: T) => string | string[]
  /** Dynamic row style function */
  rowStyle?: (data: T) => Record<string, string>
  /** Loading state */
  loading?: boolean
  /** Column visibility map */
  columnVisibility?: Record<string, boolean>
  /** Show column visibility manager */
  showColumnManager?: boolean
  /** Custom class name */
  className?: string
}

const props = withDefaults(defineProps<EnhancedDataTableProps<T>>(), {
  paginator: true,
  rows: 10,
  rowsPerPageOptions: () => [10, 20, 50, 100],
  sortMode: 'single',
  defaultSortOrder: 1,
  removableSort: true,
  filterDisplay: 'row',
  selectionMode: null,
  size: 'normal',
  showGridlines: false,
  stripedRows: true,
  loading: false,
  showColumnManager: false,
  className: '',
})

const emit = defineEmits<{
  'update:selection': [selection: T | T[] | null]
  'update:expandedRows': [rows: T[] | Record<string, boolean>]
  'update:editingRows': [rows: T[]]
  'update:globalFilter': [filter: string]
  'update:columnFilters': [filters: DataTableFilterMeta]
  'row-select': [event: DataTableRowSelectEvent<T>]
  'row-unselect': [event: DataTableRowUnselectEvent]
  'row-expand': [event: DataTableRowExpandEvent<T>]
  'row-collapse': [event: DataTableRowCollapseEvent]
  'cell-edit-complete': [event: DataTableCellEditCompleteEvent<T>]
  'row-edit-save': [event: DataTableRowEditSaveEvent<T>]
  'sort': [event: DataTableSortEvent]
  'filter': [event: DataTableFilterEvent]
  'page': [event: DataTablePageEvent]
  'column-visibility-change': [field: string, visible: boolean]
  'column-order-change': [columns: DataTableColumn<T>[]]
}>()

// State management
const localSelection = ref<T | T[] | null>(props.selection || null)
const localExpandedRows = ref<T[] | Record<string, boolean>>(
  props.expandedRows || (props.selectionMode === 'multiple' ? [] : {})
)
const localEditingRows = ref<T[]>(props.editingRows || [])
const localGlobalFilter = ref<string>(props.globalFilter || '')
const localColumnFilters = ref<DataTableFilterMeta>(props.columnFilters || {})
const isColumnManagerOpen = ref(false)
const localColumns = ref<DataTableColumn<T>[]>([...props.columns])
const isUpdatingColumns = ref(false)

// Watch props changes
watch(
  () => props.selection,
  (newSelection) => {
    localSelection.value = newSelection || null
  },
  { deep: true }
)

watch(
  () => props.expandedRows,
  (newExpanded) => {
    localExpandedRows.value = newExpanded || (props.selectionMode === 'multiple' ? [] : {})
  },
  { deep: true }
)

watch(
  () => props.editingRows,
  (newEditing) => {
    localEditingRows.value = newEditing || []
  },
  { deep: true }
)

watch(
  () => props.globalFilter,
  (newFilter) => {
    localGlobalFilter.value = newFilter || ''
  }
)

watch(
  () => props.columnFilters,
  (newFilters) => {
    localColumnFilters.value = newFilters || {}
  },
  { deep: true }
)

watch(
  () => props.columns,
  (newColumns) => {
    if (isUpdatingColumns.value) return // Skip if we're updating internally

    const currentFields = localColumns.value.map(c => c.field).join(',')
    const newFields = newColumns.map(c => c.field).join(',')

    // Also compare visible state
    const currentVisible = localColumns.value.map(c => c.visible ?? true).join(',')
    const newVisible = newColumns.map(c => c.visible ?? true).join(',')

    if (currentFields !== newFields || currentVisible !== newVisible) {
      localColumns.value = newColumns.map(col => ({ ...col }))
    }
  },
  { deep: true }
)

// Computed properties
const visibleColumns = computed(() => {
  return localColumns.value.filter((col) => {
    if (props.columnVisibility && props.columnVisibility[col.field] === false) {
      return false
    }
    return col.visible !== false
  })
})

// Pass Through styling configuration
const pt = computed(() => ({
  root: { class: 'w-full' },
  wrapper: { class: 'rounded-lg overflow-hidden' },
  header: {
    class: 'bg-gradient-to-r from-primary-50 to-primary-100/50 border-b-2 border-primary-200',
  },
  headerCell: {
    class: 'text-center text-primary-800 font-semibold py-4 px-4 text-sm',
  },
  bodyRow: {
    class: 'hover:bg-primary-50/30 transition-colors border-b border-border-default/50',
    style: props.stripedRows
      ? {
          '&:nth-child(even)': { backgroundColor: 'var(--background-primary)' },
          '&:nth-child(odd)': { backgroundColor: 'var(--background-secondary)' },
        }
      : undefined,
  },
  bodyCell: {
    class: 'text-center py-3 px-4 text-sm text-foreground',
  },
  loadingOverlay: {
    class: 'bg-background/80 backdrop-blur-sm',
  },
  loadingIcon: {
    class: 'text-primary-500',
  },
  paginator: {
    class: 'border-t border-border-default bg-background',
  },
}))

// Event handlers
const handleSelectionChange = (event: DataTableRowSelectEvent<T> | DataTableRowUnselectEvent) => {
  localSelection.value = event.data as T | T[] | null
  emit('update:selection', localSelection.value)
  if ('type' in event && event.type === 'row-select') {
    emit('row-select', event as DataTableRowSelectEvent<T>)
  } else {
    emit('row-unselect', event as DataTableRowUnselectEvent)
  }
}

const handleExpand = (event: DataTableRowExpandEvent<T>) => {

  if (Array.isArray(localExpandedRows.value)) {
    const expandedArray = localExpandedRows.value as T[]

    localExpandedRows.value = [...expandedArray, event.data] as T[] | Record<string, boolean>
  } else {
    const expandedRecord = localExpandedRows.value as Record<string, boolean>
    const key = props.dataKey ? (event.data as Record<string, unknown>)[props.dataKey] : String(props.data.findIndex((row) => row === event.data))

    localExpandedRows.value = { ...expandedRecord, [String(key)]: true } as T[] | Record<string, boolean>
  }

  emit('update:expandedRows', localExpandedRows.value as T[] | Record<string, boolean>)
  emit('row-expand', event)
}

const handleCollapse = (event: DataTableRowCollapseEvent) => {

  if (Array.isArray(localExpandedRows.value)) {
    const expandedArray = localExpandedRows.value as T[]
    localExpandedRows.value = expandedArray.filter((row) => row !== event.data) as T[] | Record<string, boolean>
  } else {
    const expandedRecord = localExpandedRows.value as Record<string, boolean>
    const key = props.dataKey ? (event.data as Record<string, unknown>)[props.dataKey] : String(props.data.findIndex((row) => row === event.data))

    const newExpanded = { ...expandedRecord }
    delete newExpanded[String(key)]
    localExpandedRows.value = newExpanded as T[] | Record<string, boolean>
  }
  emit('update:expandedRows', localExpandedRows.value as T[] | Record<string, boolean>)
  emit('row-collapse', event as DataTableRowCollapseEvent)
}

const handleCellEditComplete = (event: DataTableCellEditCompleteEvent<T>) => {
  emit('cell-edit-complete', event)
}

const handleRowEditSave = (event: DataTableRowEditSaveEvent<T>) => {
  emit('row-edit-save', event)
}

const handleSort = (event: DataTableSortEvent) => {
  emit('sort', event)
}

const handleFilter = (event: DataTableFilterEvent) => {
  emit('filter', event)
}

const handlePage = (event: DataTablePageEvent) => {
  emit('page', event)
}

const handleGlobalFilterChange = (value: string) => {
  localGlobalFilter.value = value
  emit('update:globalFilter', value)
}

// const handleColumnFilterChange = (field: string, value: unknown) => {
//   localColumnFilters.value = { ...localColumnFilters.value, [field]: value }
//   emit('update:columnFilters', localColumnFilters.value)
// }

// Column visibility management
const toggleColumnVisibility = (field: string) => {
  const column = localColumns.value.find((col) => col.field === field)
  if (column) {
    isUpdatingColumns.value = true
    const newColumns = localColumns.value.map(col =>
      col.field === field ? { ...col, visible: !col.visible } : { ...col }
    )
    localColumns.value = newColumns
    emit('column-visibility-change', field, !column.visible)
    nextTick(() => {
      isUpdatingColumns.value = false
    })
  }
}

const moveColumnUp = (index: number) => {
  if (index === 0) return
  isUpdatingColumns.value = true
  const newColumns = [...localColumns.value]
  const temp = newColumns[index - 1]
  if (temp && newColumns[index]) {
    newColumns[index - 1] = newColumns[index]
    newColumns[index] = temp
    localColumns.value = newColumns
    emit('column-order-change', newColumns)
  }
  nextTick(() => {
    isUpdatingColumns.value = false
  })
}

const moveColumnDown = (index: number) => {
  if (index === localColumns.value.length - 1) return
  isUpdatingColumns.value = true
  const newColumns = [...localColumns.value]
  const currentColumn = newColumns[index]
  const nextColumn = newColumns[index + 1]
  if (currentColumn && nextColumn) {
    newColumns[index] = nextColumn
    newColumns[index + 1] = currentColumn

    localColumns.value = newColumns
    emit('column-order-change', newColumns)
  }
  nextTick(() => {
    isUpdatingColumns.value = false
  })
}

// Paginator template with RTL support
const defaultPaginatorTemplate = computed(() => {
  return 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
})
</script>

<template>
  <div :class="['space-y-4', className]">
    <!-- Global Filter -->
    <div v-if="filterDisplay === 'row'" class="flex items-center gap-4">
      <div class="flex-1">
        <span class="p-input-icon-left w-full">
          <BaseIcon name="Search" :size="18" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <InputText
            :model-value="localGlobalFilter"
            placeholder="جستجوی سراسری..."
            class="w-full"
            @update:model-value="(value: string | undefined) => handleGlobalFilterChange(value ?? '')"
          />
        </span>
      </div>
      <BaseButton
        v-if="showColumnManager"
        variant="outline"
        size="sm"
        class="flex items-center gap-2"
        @click="isColumnManagerOpen = true"
      >
        <BaseIcon name="Settings" :size="16" />
        تنظیمات ستون‌ها
      </BaseButton>
    </div>

    <!-- DataTable -->
    <div class="elevation-1 rounded-lg overflow-hidden">
      <DataTable
        :value="data"
        :loading="loading"
        :paginator="paginator"
        :rows="rows"
        :rows-per-page-options="rowsPerPageOptions"
        :paginator-template="paginatorTemplate || defaultPaginatorTemplate"
        :sort-mode="sortMode"
        :default-sort-field="defaultSortField"
        :default-sort-order="defaultSortOrder"
        :removable-sort="removableSort"
        :global-filter="localGlobalFilter"
        :filters="localColumnFilters"
        :filter-display="filterDisplay"
        :selection-mode="selectionMode || undefined"
        :selection="localSelection"
        :data-key="dataKey"
        :expanded-rows="localExpandedRows"
        :edit-mode="editMode"
        :editing-rows="localEditingRows"
        :size="size"
        :show-gridlines="showGridlines"
        :striped-rows="stripedRows"
        :row-class="rowClass"
        :row-style="rowStyle"
        :pt="pt"
        @row-select="handleSelectionChange"
        @row-unselect="handleSelectionChange"
        @row-expand="handleExpand"
        @row-collapse="handleCollapse"
        @cell-edit-complete="handleCellEditComplete"
        @row-edit-save="handleRowEditSave"
        @sort="handleSort"
        @filter="handleFilter"
        @page="handlePage"
      >
        <!-- Selection Column -->
        <Column
          v-if="selectionMode"
          :selection-mode="selectionMode"
          :header-style="{ width: '3rem' }"
        />

        <!-- Expansion Column -->
        <Column
          v-if="$slots.expansion"
          :expander="true"
          :header-style="{ width: '3rem' }"
        />

        <!-- Data Columns -->
        <Column
          v-for="column in visibleColumns"
          :key="column.field"
          :field="column.field"
          :header="column.header"
          :sortable="column.sortable"
          :frozen="column.frozen"
          :align-frozen="column.alignFrozen"
          :style="column.style"
          :body-style="column.bodyStyle"
          :header-style="column.headerStyle"
          :show-filter-menu="column.filterable && filterDisplay === 'menu'"
          :show-filter-operator="column.filterable && filterDisplay === 'menu'"
        >
          <!-- Header Template -->
          <template v-if="$slots[`header-${column.field}`]" #header>
            <slot :name="`header-${column.field}`" :column="column" />
          </template>

          <!-- Filter Template - Custom Slot -->
          <template v-if="$slots[`filter-${column.field}`]" #filter="{ filterModel, filterCallback }">
            <slot
              :name="`filter-${column.field}`"
              :column="column"
              :filters="localColumnFilters"
              :filter-model="filterModel"
              :filter-callback="filterCallback"
            />
          </template>

          <!-- Filter Template - Built-in Types -->
          <template v-else-if="column.filterable && filterDisplay === 'row'" #filter="{ filterModel, filterCallback }">
            <!-- Text Filter -->
            <template v-if="!column.filterType || column.filterType === 'text'">
              <InputText
                :model-value="filterModel.value"
                :placeholder="column.filterPlaceholder || 'جستجو...'"
                class="w-full"
                @update:model-value="
                  filterCallback()
                "
              />
            </template>

            <!-- Select Filter -->
            <template v-else-if="column.filterType === 'select'">
              <Dropdown
                :model-value="filterModel.value"
                :options="column.filterOptions || []"
                option-label="label"
                option-value="value"
                :placeholder="column.filterPlaceholder || 'انتخاب کنید'"
                class="w-full"
                @update:model-value="
                  filterCallback()
                "
                show-clear
              />
            </template>

            <!-- MultiSelect Filter -->
            <template v-else-if="column.filterType === 'multiselect'">
              <MultiSelect
                :model-value="filterModel.value || []"
                :options="column.filterOptions || []"
                option-label="label"
                option-value="value"
                :placeholder="column.filterPlaceholder || 'انتخاب کنید'"
                class="w-full"
                @update:model-value="
                  filterCallback()
                "
                show-clear
              />
            </template>

            <!-- Date Filter -->
            <template v-else-if="column.filterType === 'date'">
              <Calendar
                :model-value="filterModel.value"
                :placeholder="column.filterPlaceholder || 'انتخاب تاریخ'"
                class="w-full"
                @update:model-value="
                  filterCallback()
                "
                show-clear
                date-format="yy/mm/dd"
              />
            </template>

            <!-- Number Filter -->
            <template v-else-if="column.filterType === 'number'">
              <InputNumber
                :model-value="filterModel.value"
                :placeholder="column.filterPlaceholder || 'عدد'"
                class="w-full"
                @update:model-value="
                  filterCallback()
                "
                show-clear
              />
            </template>

            <!-- Boolean Filter -->
            <template v-else-if="column.filterType === 'boolean'">
              <Dropdown
                :model-value="filterModel.value"
                :options="[
                  { label: 'همه', value: null },
                  { label: 'بله', value: true },
                  { label: 'خیر', value: false },
                ]"
                option-label="label"
                option-value="value"
                :placeholder="column.filterPlaceholder || 'انتخاب کنید'"
                class="w-full"
                @update:model-value="filterCallback"
              />
            </template>
          </template>

          <!-- Body Template -->
          <template #body="{ data: row, index, field }">
            <slot
              v-if="$slots[`cell-${column.field}`]"
              :name="`cell-${column.field}`"
              :data="row"
              :row="row"
              :index="index"
              :field="field"
              :row-index="index"
            />
            <template v-else-if="column.bodyTemplate">
              <component :is="() => column.bodyTemplate!(row, index)" />
            </template>
            <span v-else class="text-foreground">{{ (row as Record<string, unknown>)[column.field] }}</span>
          </template>

          <!-- Editor Template -->
          <template v-if="editMode && column.editor && $slots[`editor-${column.field}`]" #editor="{ data, field, index }">
            <slot
              :name="`editor-${column.field}`"
              :data="data"
              :row="data"
              :field="field"
              :index="index"
            />
          </template>
        </Column>

        <!-- Expansion Template -->
        <template v-if="$slots.expansion" #expansion="{ data, index }">
          <slot name="expansion" :data="data" :row="data" :index="index" />
        </template>
      </DataTable>
    </div>

    <!-- Column Visibility Manager Dialog -->
    <Dialog
      v-if="showColumnManager"
      v-model:visible="isColumnManagerOpen"
      modal
      header="تنظیمات ستون‌ها"
      :style="{ width: '50rem', maxHeight: '600px' }"
      :pt="{
        root: { dir: 'rtl', class: 'max-w-2xl max-h-[600px] overflow-y-auto' },
        header: { class: 'text-right' },
        content: { class: 'overflow-y-auto' },
      }"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <BaseIcon name="Settings" :size="20" />
          <span>تنظیمات ستون‌ها</span>
        </div>
      </template>

      <p class="text-sm text-muted-foreground mb-4">ترتیب و نمایش ستون‌های جدول را تنظیم کنید</p>

      <div class="space-y-2 mt-4">
        <div class="grid grid-cols-12 gap-2 pb-2 border-b-2 border-border">
          <div class="col-span-1 text-center text-sm text-muted-foreground">نمایش</div>
          <div class="col-span-7 text-right text-sm text-muted-foreground pr-2">عنوان ستون</div>
          <div class="col-span-4 text-center text-sm text-muted-foreground">ترتیب</div>
        </div>

        <div
          v-for="(column, index) in localColumns"
          :key="column.field"
          class="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <div class="col-span-1 flex justify-center">
            <Checkbox
              :model-value="column.visible !== false"
              @update:model-value="toggleColumnVisibility(column.field)"
              binary
            />
          </div>

          <div class="col-span-7">
            <span :class="column.visible === false ? 'text-muted-foreground' : ''">
              {{ column.header }}
            </span>
          </div>

          <div class="col-span-4 flex justify-center gap-1">
            <BaseButton
              size="sm"
              variant="ghost"
              @click="moveColumnUp(index)"
              :disabled="index === 0"
              class="hover:bg-primary-50 text-primary-600 disabled:opacity-30"
            >
              <BaseIcon name="ChevronUp" :size="16" />
            </BaseButton>
            <BaseButton
              size="sm"
              variant="ghost"
              @click="moveColumnDown(index)"
              :disabled="index === localColumns.length - 1"
              class="hover:bg-primary-50 text-primary-600 disabled:opacity-30"
            >
              <BaseIcon name="ChevronDown" :size="16" />
            </BaseButton>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
          <BaseButton variant="outline" @click="isColumnManagerOpen = false" class="border-2">
            بستن
          </BaseButton>
        </div>
      </template>
    </Dialog>
  </div>
</template>


