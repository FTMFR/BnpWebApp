<script setup lang="ts">
import { ref, computed, onMounted, nextTick, h } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { Pagination, Breadcrumb, Card } from '@/design-system/molecules'
import { CustomLoader } from '@/design-system/atoms'
import Modal from '@/design-system/molecules/Modal.vue'
import BaseDropdown, { type DropdownItem } from '@/design-system/molecules/BaseDropdown.vue'
import TableWithSettings from '@/design-system/organisms/TableWithSettings.vue'
import { useRouteAccess } from '@/shared/composables/useRouteAccess'
import type { Menu } from '@/features/menus/types/menu'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { DataTableColumn } from '../users/UsersListPage.vue'
import BaseIcon from '@/design-system/atoms/BaseIcon.vue'
import BaseButton from '@/design-system/atoms/BaseButton.vue'

// Define TableColumn type locally to avoid import issues
type TableColumn<T = Record<string, unknown>> = {
  id: string
  title: string
  sortable?: boolean
  visible?: boolean
  render?: (row: T, index?: number) => import('vue').VNode | string | number
}

const router = useRouter()
const { hasAccess } = useRouteAccess()

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'منوها', href: '/menu/list' },
]

const handleSearch = (query: string) => {
  console.log('Global search:', query)
  // TODO: Implement global search
}

const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(menus.value.length / pageSize.value))
const pageSize = ref(10)

const pagedMenus = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return menus.value.slice(startIndex, endIndex)
})

const startItem = computed(() =>
  menus.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
)
const endItem = computed(() => Math.min(currentPage.value * pageSize.value, menus.value.length))

async function fetchMenusList() {
  isLoadingMenus.value = true
  try {
    const response = await apiClient.get<Menu[]>(endpoints.menu.list)
    // Store data in refs
    menus.value = response.data
    // fullApiData.value = response.data
  } catch (error) {
    console.error('Failed to fetch users:', error)
    menus.value = []
    // fullApiData.value = []
  } finally {
    isLoadingMenus.value = false
  }
}

const menuColumns = ref<DataTableColumn<Menu>[]>([
  {
    field: 'Title',
    header: 'عنوان منو',
    sortable: true,
    visible: true,
  },
  {
    field: 'ParentPublicId',
    header: 'منوی والد',
    sortable: true,
    visible: true,
  },
  {
    field: 'ZamanInsert',
    header: 'تاریخ ایجاد',
    sortable: true,
    visible: true,
  },
  {
    field: 'IsMenu',
    header: 'نمایش در منوی درختی',
    sortable: true,
    visible: true,
  },
  {
    field: 'actions',
    header: 'عملیات',
    sortable: false,
    visible: true,
  },
])

// const searchQuery = ref('')

// const handleQuickSearch = () => {
//   console.log('Quick search:', searchQuery.value)
// }

const handleEdit = (row: Menu) => {
  console.log('Edit menu:', row.Title)
  // TODO: Navigate to edit page
}

const showDeleteModal = ref(false)
const menuToDelete = ref<Menu | null>(null)
const showAccessDeniedModal = ref(false)
const isLoadingMenus = ref(false)
const menus = ref<Menu[]>([])

const handleDelete = (row: Menu) => {
  menuToDelete.value = row
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (menuToDelete.value) {
    console.log('Delete menu:', menuToDelete.value.title)
    // TODO: Implement actual delete API call
    showDeleteModal.value = false
    menuToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  menuToDelete.value = null
}

// const handleExport = () => {
//   console.log('Export menus')
// }

const handleCreate = async () => {
  // Check if user has access to the create route
  const routePath = '/menu/create'

  if (hasAccess(routePath)) {
    router.push(routePath)
  } else {
    // Show access denied modal
    showAccessDeniedModal.value = true
  }
}

const isUpdatingFromParent = ref(false)

// Convert DataTableColumn to TableColumn format
const convertToTableColumns = (cols: DataTableColumn<Menu>[]): TableColumn<Menu>[] => {
  return cols.map((col) => {
    let renderFn: ((row: Menu, index?: number) => import('vue').VNode | string | number) | undefined

    if (col.field === 'zamanInsert') {
      renderFn = (row: Menu) => {
        const value = row.ZamanInsert
        return value
          ? h('span', { dir: 'ltr', class: 'font-mono text-sm' }, value)
          : h('span', { class: 'text-muted-foreground' }, '-')
      }
    } else if (col.field === 'IsMenu') {
      renderFn = (row: Menu) => {
        return row.IsMenu ? 'بله' : 'خیر'
      }
    } else if (col.field === 'actions') {
      renderFn = (row: Menu) => {
        const menuItems: DropdownItem[] = [
          { label: 'ویرایش', value: 'edit' },
          { divider: true, label: '', value: '' },
          { label: 'حذف', value: 'delete' },
        ]

        const handleAction = (item: DropdownItem) => {
          switch (item.value) {
            case 'edit':
              handleEdit(row)
              break
            case 'delete':
              handleDelete(row)
              break
          }
        }

        return h(
          BaseDropdown,
          {
            items: menuItems,
            placement: 'bottom-end',
            onSelect: handleAction,
          },
          {
            trigger: () =>
              h(
                BaseButton,
                {
                  variant: 'ghost',
                  size: 'sm',
                  class: 'text-muted-foreground hover:text-foreground',
                },
                () =>
                  h(BaseIcon, {
                    name: 'MoreVertical',
                    size: 18,
                  }),
              ),
            items: ({
              items: dropdownItems,
              select,
            }: {
              items: DropdownItem[]
              select: (item: DropdownItem) => void
            }) => {
              return dropdownItems.map((item) => {
                if (item.divider) {
                  return h('div', { key: item.value, class: 'border-t border-border-default my-1' })
                }

                const isDelete = item.value === 'delete'

                const baseClasses =
                  'w-full text-right px-4 py-2 text-sm transition-colors flex items-center gap-2'

                const styleClasses = isDelete
                  ? 'bg-white dark:bg-black text-danger-600 hover:bg-danger-600 hover:text-white dark:hover:bg-danger dark:hover:text-white'
                  : 'bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-gray-600 dark:hover:text-muted-foreground'

                let iconNode: ReturnType<typeof h> | null = null
                if (item.value === 'changePass')
                  iconNode = h(BaseIcon, {
                    name: 'Key',
                    size: 16,
                    class: 'text-black group-hover:text-white dark:text-white',
                  })
                else if (item.value === 'edit')
                  iconNode = h(BaseIcon, {
                    name: 'Edit',
                    size: 16,
                    class: 'text-black group-hover:text-white dark:text-white',
                  })
                else if (item.value === 'delete')
                  iconNode = h(BaseIcon, {
                    name: 'Trash',
                    size: 16,
                    class: 'text-danger-600 group-hover:text-white',
                  })

                return h(
                  'button',
                  {
                    key: item.value,
                    class: ['group', baseClasses, styleClasses],
                    onClick: () => select(item),
                  },
                  [iconNode, h('span', item.label)],
                )
              })
            },
          },
        )
      }
    } else if (col.bodyTemplate) {
      const bodyTemplate = col.bodyTemplate
      renderFn = (row: Menu, index?: number) => {
        const result = bodyTemplate(row, index)
        return typeof result === 'string' || typeof result === 'number' ? result : result
      }
    }

    return {
      id: col.field,
      title: col.header,
      sortable: col.sortable,
      visible: col.visible !== false,
      render: renderFn,
    }
  })
}

// Convert TableColumn back to DataTableColumn format
const convertToDataTableColumns = (cols: TableColumn<Menu>[]): DataTableColumn<Menu>[] => {
  return cols.map((col) => ({
    field: col.id,
    header: col.title,
    sortable: col.sortable,
    visible: col.visible !== false,
    bodyTemplate: col.render,
  }))
}

// Computed property for table columns in TableColumn format
const tableColumns = computed<TableColumn<Menu>[]>(() => {
  return convertToTableColumns(menuColumns.value)
})

const handleColumnOrderChange = (cols: TableColumn<Menu>[]) => {
  const currentCols = menuColumns.value.map((c) => c.field).join(',')
  const newDataTableCols = convertToDataTableColumns(cols)
  const newCols = newDataTableCols.map((c) => c.field).join(',')

  if (currentCols !== newCols) {
    isUpdatingFromParent.value = true
    menuColumns.value = newDataTableCols.map((col) => ({ ...col }))
    nextTick(() => {
      isUpdatingFromParent.value = false
    })
  }
}

const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
  const columnIndex = menuColumns.value.findIndex((col) => col.field === columnId)
  if (columnIndex !== -1 && menuColumns.value[columnIndex]) {
    menuColumns.value[columnIndex].visible = visible
  }
}

onMounted(() => {
  fetchMenusList()
})
</script>

<template>
  <div v-if="isLoadingMenus" class="flex items-center justify-center min-h-screen">
    <CustomLoader size="lg" />
  </div>
  <DashboardLayout v-else @search="handleSearch">
    <div class="space-y-4 sm:space-y-6">
      <!-- Breadcrumb -->
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <!-- Card with Filters and Table -->
      <Card title="لیست منوها" variant="elevated" padding="none">
        <!-- Header -->
        <template #header>
          <div class="p-6 pl-0 flex justify-between items-center">
            <BaseButton
              variant="outline"
              @click="handleCreate"
              class="border-success-500 text-success-600"
            >
              <BaseIcon name="Plus" :size="16" />
              <span class="hidden sm:inline">ایجاد منو جدید</span>
            </BaseButton>
          </div>
        </template>

        <!-- Table Section -->
        <div class="border-t border-border-default pt-3 sm:pt-4 md:pt-6 overflow-x-auto">
          <CustomLoader v-if="isLoadingMenus" size="lg" class="mx-auto my-10" />

          <TableWithSettings
            v-else
            :columns="tableColumns"
            :data="pagedMenus"
            :searchable="true"
            @column-order-change="handleColumnOrderChange"
            @column-visibility-change="handleColumnVisibilityChange"
          />
        </div>

        <!-- Footer Section -->
        <template #footer>
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
          >
            <div
              class="text-xs sm:text-sm text-muted-foreground text-center sm:text-right w-full sm:w-auto"
            >
              صفحه {{ currentPage }} از {{ totalPages }} • نمایش {{ startItem }} تا {{ endItem }} از
              {{ menus.length }} مورد
            </div>

            <Pagination
              v-model:current-page="currentPage"
              :total-pages="totalPages"
              dir="ltr"
              class="w-full sm:w-auto"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" title="تأیید حذف" size="sm" :close-on-backdrop="false">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center"
          >
            <BaseIcon name="AlertTriangle" :size="20" class="text-danger-600" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-foreground mb-1">آیا از حذف این منو مطمئن هستید؟</p>
            <p class="text-xs text-muted-foreground">
              این عملیات غیرقابل بازگشت است و تمام اطلاعات منو حذف خواهد شد.
            </p>
            <div v-if="menuToDelete" class="mt-3 p-2 bg-secondary/50 rounded text-xs">
              <span class="font-semibold">منو:</span> {{ menuToDelete.title }}
              <span v-if="menuToDelete.path" class="text-muted-foreground"
                >({{ menuToDelete.path }})</span
              >
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <BaseButton variant="outline" @click="cancelDelete"> انصراف </BaseButton>
          <BaseButton
            variant="default"
            class="bg-danger-600 hover:bg-danger-700 text-white"
            @click="confirmDelete"
          >
            حذف
          </BaseButton>
        </div>
      </template>
    </Modal>

    <!-- Access Denied Modal -->
    <Modal v-model="showAccessDeniedModal" title="عدم دسترسی" size="sm" :close-on-backdrop="true">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center"
          >
            <BaseIcon name="AlertCircle" :size="20" class="text-warning-600" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-foreground mb-1">
              شما دسترسی لازم برای ایجاد منو جدید را ندارید
            </p>
            <p class="text-xs text-muted-foreground">
              برای دسترسی به این بخش، با مدیر سیستم تماس بگیرید.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end">
          <BaseButton variant="outline" @click="showAccessDeniedModal = false"> بستن </BaseButton>
        </div>
      </template>
    </Modal>
  </DashboardLayout>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 1000px;
  opacity: 1;
}
</style>
