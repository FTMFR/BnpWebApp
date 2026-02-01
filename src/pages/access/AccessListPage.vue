<script setup lang="ts">
import { ref, computed, onMounted, nextTick, h } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import {
  FormField,
  Pagination,
  Breadcrumb,
  Card,
  type SelectOption,
} from '@/design-system/molecules'
import { BaseBadge, CustomLoader, BaseButton, BaseIcon } from '@/design-system/atoms'
import Modal from '@/design-system/molecules/Modal.vue'
import BaseDropdown, { type DropdownItem } from '@/design-system/molecules/BaseDropdown.vue'
import { type DataTableColumn } from '@/design-system/organisms'
import TableWithSettings from '@/design-system/organisms/TableWithSettings.vue'
import { useAuth } from '@/shared/composables/useAuth'
import { useRouteAccess } from '@/shared/composables/useRouteAccess'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { ApiMenuItem } from '@/shared/api/types'

export interface Access extends Record<string, unknown> {
  Id: number
  Name: string
  Resource: string
  Action: string
  Description: string
  IsActive: boolean
  DisplayOrder: number
}

// Define TableColumn type locally to avoid import issues
type TableColumn<T = Record<string, unknown>> = {
  id: string
  title: string
  sortable?: boolean
  visible?: boolean
  render?: (row: T, index?: number) => import('vue').VNode | string | number
}

const { fetchUser, isLoadingUser } = useAuth()
const router = useRouter()
const { hasAccess } = useRouteAccess()

// Fetch user info on mount
onMounted(() => {
  fetchUser()
})

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'دسترسی‌ها', href: '/dashboard/menus/list' },
  { label: 'لیست دسترسی‌ها' },
]

const handleSearch = (_query: string) => {
  // TODO(UX): Implement global search
}

const handleUserMenuClick = () => {
  // TODO(UX): show user menu dropdown
}

const handleNotificationClick = () => {
  // TODO(UX): show notifications
}

const handleHelpClick = () => {
  // TODO(UX): show help
}

const currentPage = ref(1)


const fetchPermissions = async () => {
  // isLoadingMenus.value = true
  try {
    const response = await apiClient.get<ApiMenuItem[]>(endpoints.permission.list)
    // Flatten the menu tree structure
    const flattenMenus = (items: ApiMenuItem[]): ApiMenuItem[] => {
      const result: ApiMenuItem[] = []
      items.forEach((item) => {
        result.push(item)
        if (item.Children && item.Children.length > 0) {
          result.push(...flattenMenus(item.Children))
        }
      })
      return result
    }

    const flatMenus = flattenMenus(response.data)
    menus.value = [
      { value: '', label: 'بدون منوی والد' },
      ...flatMenus.map((menu: ApiMenuItem) => ({
        value: menu.PublicId,
        label: menu.Title,
      })),
    ]
  } catch (error) {
    console.error('Error fetching menus:', error)
    toastStore.showToast('خطا در دریافت لیست منوها', 'error', 5000)
  } finally {
    isLoadingMenus.value = false
  }
}
const statusOptions: SelectOption[] = [
  { value: '', label: 'همه' },
  { value: 'active', label: 'فعال' },
  { value: 'inactive', label: 'غیرفعال' },
  { value: 'pending', label: 'در انتظار' },
]

// const roleOptions: SelectOption[] = [
//   { value: '', label: 'همه' },
//   { value: 'admin', label: 'مدیر' },
//   { value: 'user', label: 'کاربر' },
//   { value: 'moderator', label: 'ناظر' },
// ]

const AccessColumns = ref<DataTableColumn<Access>[]>([
  {
    field: 'role',
    header: 'نقش',
    sortable: true,
    visible: true,
  },
  {
    field: 'status',
    header: 'وضعیت',
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

// const showFilters = ref(false)
// const searchQuery = ref('')


// const handleView = (row: Access) => {
//   console.log('View user:', row.username)
//   // TODO: Navigate to view page
// }

// const handleEdit = (row: Access) => {
//   console.log('Edit user:', row.username)
//   // TODO: Navigate to edit page
// }

const showDeleteModal = ref(false)
const userToDelete = ref<Access | null>(null)
const showAccessDeniedModal = ref(false)

const handleDelete = (row: Access) => {
  userToDelete.value = row
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (userToDelete.value) {
    // TODO: Implement actual delete API call
    showDeleteModal.value = false
    userToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const handleExport = () => {
  // TODO: Implement export
}

const handleCreate = async () => {
  // Check if user has access to the permission list route
  const routePath = '/permission/list'

  if (hasAccess(routePath)) {
    router.push(routePath)
  } else {
    // Show access denied modal
    showAccessDeniedModal.value = true
  }
}

const isUpdatingFromParent = ref(false)

// Convert DataTableColumn to TableColumn format
const convertToTableColumns = (cols: DataTableColumn<Access>[]): TableColumn<Access>[] => {
  return cols.map((col) => {
    let renderFn:
      | ((row: Access, index?: number) => import('vue').VNode | string | number)
      | undefined

    //  if (col.field === 'role') {
    //   renderFn = (row: Access) => {
    //     return row.role || '-'
    //   }
    // } else if (col.field === 'status') {
    //   renderFn = (row: Access) => {
    //     const variant =
    //       row.status === 'active' ? 'success' : row.status === 'inactive' ? 'secondary' : 'warning'
    //     const label =
    //       row.status === 'active' ? 'فعال' : row.status === 'inactive' ? 'غیرفعال' : 'در انتظار'
    //     return h(
    //       BaseBadge,
    //       { variant, size: 'sm', class: 'text-[10px] px-1.5 py-0.5' },
    //       () => label,
    //     )
    //   }
    // } else if (col.field === 'actions') {
    //   renderFn = (row: Access) => {
    //     const menuItems: DropdownItem[] = [
    //       { label: 'مشاهده', value: 'view' },
    //       { label: 'ویرایش', value: 'edit' },
    //       { divider: true, label: '', value: '' },
    //       { label: 'حذف', value: 'delete' },
    //     ]

    //     const handleAction = (item: DropdownItem) => {
    //       switch (item.value) {
    //         case 'view':
    //           handleView(row)
    //           break
    //         case 'edit':
    //           handleEdit(row)
    //           break
    //         case 'delete':
    //           handleDelete(row)
    //           break
    //       }
    //     }

    //     return h(
    //       BaseDropdown,
    //       {
    //         items: menuItems,
    //         placement: 'bottom-end',
    //         onSelect: handleAction,
    //       },
    //       {
    //         trigger: () =>
    //           h(
    //             BaseButton,
    //             {
    //               variant: 'ghost',
    //               size: 'sm',
    //               class: 'text-muted-foreground hover:text-foreground',
    //             },
    //             () =>
    //               h(BaseIcon, {
    //                 name: 'MoreVertical',
    //                 size: 18,
    //               }),
    //           ),
    //         items: ({
    //           items: dropdownItems,
    //           select,
    //         }: {
    //           items: DropdownItem[]
    //           select: (item: DropdownItem) => void
    //         }) => {
    //           return dropdownItems.map((item) => {
    //             if (item.divider) {
    //               return h('div', { key: item.value, class: 'border-t border-border-default my-1' })
    //             }
    //             return h(
    //               'button',
    //               {
    //                 key: item.value,
    //                 class: [
    //                   'w-full text-right px-4 py-2 text-sm transition-colors flex items-center gap-2',
    //                   item.value === 'delete'
    //                     ? 'hover:bg-danger-50 text-danger-600'
    //                     : 'hover:bg-secondary text-foreground',
    //                 ],
    //                 onClick: () => select(item),
    //               },
    //               [
    //                 item.value === 'view' &&
    //                   h(BaseIcon, { name: 'Eye', size: 16, iconClass: 'text-muted-foreground' }),
    //                 item.value === 'edit' &&
    //                   h(BaseIcon, { name: 'Edit', size: 16, iconClass: 'text-muted-foreground' }),
    //                 item.value === 'delete' &&
    //                   h(BaseIcon, { name: 'Trash', size: 16, iconClass: 'text-danger-600' }),
    //                 h('span', item.label),
    //               ],
    //             )
    //           })
    //         },
    //       },
    //     )
    //   }
    // } else if (col.bodyTemplate) {
    //   const bodyTemplate = col.bodyTemplate
    //   renderFn = (row: Access, index?: number) => {
    //     const result = bodyTemplate(row, index)
    //     return typeof result === 'string' || typeof result === 'number' ? result : result
    //   }
    // }

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
const convertToDataTableColumns = (cols: TableColumn<Access>[]): DataTableColumn<Access>[] => {
  return cols.map((col) => ({
    field: col.id,
    header: col.title,
    sortable: col.sortable,
    visible: col.visible !== false,
    bodyTemplate: col.render,
  }))
}

// Computed property for table columns in TableColumn format
const tableColumns = computed<TableColumn<Access>[]>(() => {
  return convertToTableColumns(AccessColumns.value)
})

const handleColumnOrderChange = (cols: TableColumn<Access>[]) => {
  const currentCols = AccessColumns.value.map((c) => c.field).join(',')
  const newDataTableCols = convertToDataTableColumns(cols)
  const newCols = newDataTableCols.map((c) => c.field).join(',')

  if (currentCols !== newCols) {
    isUpdatingFromParent.value = true
    AccessColumns.value = newDataTableCols.map((col) => ({ ...col }))
    nextTick(() => {
      isUpdatingFromParent.value = false
    })
  }
}

const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
  const columnIndex = AccessColumns.value.findIndex((col) => col.field === columnId)
  if (columnIndex !== -1 && AccessColumns.value[columnIndex]) {
    AccessColumns.value[columnIndex].visible = visible
  }
}
</script>

<template>
  <div v-if="isLoadingUser" class="flex items-center justify-center min-h-screen">
    <CustomLoader size="lg" />
  </div>
  <DashboardLayout
    v-else
    @search="handleSearch"
    @user-menu-click="handleUserMenuClick"
    @notification-click="handleNotificationClick"
    @help-click="handleHelpClick"
  >
    <div class="space-y-4 sm:space-y-6">
      <!-- Breadcrumb -->
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <!-- Card with Filters and Table -->
      <Card variant="elevated" padding="none">
        <!-- Header -->
        <template #header>
          <div class="p-4 sm:p-6">
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6"
            >
              <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                لیست دسترسی‌ها
              </h1>
              <!-- Create Button - Only show if user has permission -->
              <BaseButton
                variant="outline"
                @click="handleCreate"
                class="border-2 border-success-500 text-success-600"
              >
                <BaseIcon name="Plus" :size="16" />
                <span class="hidden sm:inline">ایجاد نقش جدید</span>
                <span class="sm:hidden">ایجاد</span>
              </BaseButton>
            </div>

            <!-- Search and Actions Row (Always Visible) -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">


              <!-- Action Buttons -->
              <div class="flex items-center gap-2 sm:gap-3">
                <BaseButton
                  variant="outline"
                  @click="handleExport"
                  class="border-2 border-success-500 text-success-600"
                >
                  <BaseIcon name="Download" :size="16" />
                  <span class="hidden sm:inline">خروجی Excel</span>
                  <span class="sm:hidden">Excel</span>
                </BaseButton>
              </div>
            </div>
          </div>
        </template>



        <!-- Table Section -->
        <div class="border-t border-border-default p-3 sm:p-4 md:p-6 overflow-x-auto">
          <TableWithSettings
            :columns="tableColumns"
            :data="mockUsers"
            @column-order-change="handleColumnOrderChange"
            @column-visibility-change="handleColumnVisibilityChange"
          />
        </div>

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
            <p class="text-sm font-medium text-foreground mb-1">
              آیا از حذف این دسترسی مطمئن هستید؟
            </p>
            <p class="text-xs text-muted-foreground">
              این عملیات غیرقابل بازگشت است و تمام اطلاعات دسترسی حذف خواهد شد.
            </p>
            <div v-if="userToDelete" class="mt-3 p-2 bg-secondary/50 rounded text-xs">
              <span class="font-semibold">کاربر:</span> {{ userToDelete.firstName }}
              {{ userToDelete.lastName }}
              <span class="text-muted-foreground">({{ userToDelete.username }})</span>
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
              شما دسترسی لازم برای ایجاد دسترسی جدید را ندارید
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
