<script setup lang="ts">
import { ref, computed, onMounted, nextTick, h } from 'vue'
import type { VNode } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { Breadcrumb, Card, type SelectOption } from '@/design-system/molecules'
import { BaseBadge, CustomLoader, BaseButton, BaseIcon } from '@/design-system/atoms'
import Modal from '@/design-system/molecules/Modal.vue'
import BaseDropdown, { type DropdownItem } from '@/design-system/molecules/BaseDropdown.vue'
import TableWithSettings from '@/design-system/organisms/TableWithSettings.vue'
import { useAuth } from '@/shared/composables/useAuth'
import { useRouteAccess } from '@/shared/composables/useRouteAccess'
import { useAccessDenied } from '@/shared/composables/useAccessDenied'
import { AccessDeniedModal } from '@/design-system/molecules'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { extractExportArray } from '@/shared/utils/exportToExcel'
import { useToastStore } from '@/stores/toast'
import PasswordChangeModal from '@/design-system/organisms/PasswordChangeModal.vue'

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

export interface User extends Record<string, unknown> {
  PublicId: string
  UserName: string
  Email: string
  FirstName: string
  LastName: string
  MobileNumber: string
  IsActive: boolean
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
const { showAccessDeniedModal, accessDeniedTitle, accessDeniedMessage, openAccessDeniedModal } =
  useAccessDenied()

const canExportUsers = computed(() => hasAccess('Users.Export'))
const canDeleteUsers = computed(() => hasAccess('Users.Delete'))

const users = ref<User[]>([])

const isLoadingUsers = ref(false)
const fullApiData = ref<User[]>([])
const processedExportData = ref<Record<string, unknown>[] | null>(null)

// Fetch user info on mount
onMounted(() => {
  fetchUser()
  fetchUsersList()
})

async function fetchUsersList() {
  isLoadingUsers.value = true
  try {
    const response = await apiClient.get<User[]>(endpoints.users.list)
    // Store data in refs
    users.value = response.data
    fullApiData.value = response.data
  } catch (error) {
    console.error('Failed to fetch users:', error)
    users.value = []
    fullApiData.value = []
  } finally {
    isLoadingUsers.value = false
  }
}

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'کاربران', href: '/users/list' },
]

const handleSearch = (_query: string) => {
  void _query
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

const userColumns = ref<DataTableColumn<User>[]>([
  {
    field: 'UserName',
    header: 'نام کاربری',
    sortable: true,
    filterable: true, // Enables Search
    filterType: 'text',
    // resizable: true,
  },
  {
    field: 'FirstName',
    header: 'نام',
    sortable: true,
    filterable: true,
    filterType: 'text',
    // resizable: true,
  },
  {
    field: 'LastName',
    header: 'نام خانوادگی',
    sortable: true,
    filterable: true,
    filterType: 'text',
    // resizable: true,
  },
  {
    field: 'Email',
    header: 'ایمیل',
    sortable: true,
    filterable: true,
    filterType: 'text',
    bodyTemplate: (row: User) => h('span', { dir: 'ltr', class: 'font-mono text-sm' }, row.Email),
    // resizable: true,
  },
  {
    field: 'IsActive',
    header: 'وضعیت',
    sortable: true,
    // filterable: true,
    // filterType: 'select',
    // filterOptions: [
    //   { label: 'همه', value: null },
    //   { label: 'فعال', value: true },
    //   { label: 'غیرفعال', value: false },
    // ],
    bodyTemplate: (row: User) =>
      h(BaseBadge, { variant: row.IsActive ? 'success' : 'secondary', size: 'sm' }, () =>
        row.IsActive ? 'فعال' : 'غیرفعال',
      ),
    // resizable: true,
  },
  {
    field: 'actions',
    header: 'عملیات',
    sortable: false,
    filterable: false,
    // resizable: false,
  },
])

// const showFilters = ref(false)

const handleEdit = (row: User) => {
  if (!hasAccess('Users.Update')) {
    openAccessDeniedModal({ message: 'شما دسترسی لازم برای ویرایش کاربر را ندارید' })
    return
  }
  router.push(`/users/${row.PublicId}`)
}

const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)
const showPasswordModal = ref(false)
const currentPublicId = ref<string | null>(null)

const toastStore = useToastStore()

const handleDelete = (row: User) => {
  if (!hasAccess('Users.Delete')) {
    openAccessDeniedModal({ message: 'شما دسترسی لازم برای حذف کاربر را ندارید' })
    return
  }
  userToDelete.value = row
  showDeleteModal.value = true
}

const handleCreate = () => {
  if (!hasAccess('Users.Create')) {
    openAccessDeniedModal({ message: 'شما دسترسی لازم برای ایجاد کاربر جدید را ندارید' })
    return
  }
  router.push('/users/create')
}

const confirmDelete = async (publicId: string) => {
  if (!userToDelete.value) return

  try {
    await apiClient.delete(endpoints.users.delete(publicId))

    showDeleteModal.value = false
    userToDelete.value = null
    toastStore.showToast('کاربر با موفقیت حذف شد.', 'success', 3000)
    await fetchUsersList()
  } catch (error: unknown) {
    toastStore.showToast('مشکلی در حذف کاربر رخ داده است.', 'error', 3000)
    console.error('Delete failed:', error)
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const isUpdatingFromParent = ref(false)

// Convert DataTableColumn to TableColumn format
const convertToTableColumns = (cols: DataTableColumn<User>[]): TableColumn<User>[] => {
  return cols.map((col) => {
    let renderFn: ((row: User, index?: number) => import('vue').VNode | string | number) | undefined

    // Create render functions for custom cells
    if (col.field === 'MobileNumber') {
      renderFn = (row: User) => {
        return row.MobileNumber
          ? h('span', { dir: 'ltr', class: 'font-mono' }, row.MobileNumber)
          : h('span', { class: 'text-muted-foreground' }, '-')
      }
    } else if (col.field === 'email') {
      renderFn = (row: User) => {
        return h('span', { dir: 'ltr', class: 'font-mono text-sm' }, row.Email)
      }
    } else if (col.field === 'IsActive') {
      renderFn = (row: User) => {
        const variant = row.IsActive === true ? 'success' : 'secondary'
        const label = row.IsActive === true ? 'فعال' : 'غیرفعال'
        return h(
          BaseBadge,
          { variant, size: 'sm', class: 'text-[10px] px-1.5 py-0.5' },
          () => label,
        )
      }
    } else if (col.field === 'actions') {
      renderFn = (row: User) => {
        const menuItems: DropdownItem[] = [
          { label: 'ویرایش', value: 'edit' },
          { label: 'تغییر رمز عبور کاربر', value: 'changePass' },
          ...(canDeleteUsers.value
            ? ([
                { divider: true, label: '', value: '' },
                { label: 'حذف', value: 'delete' },
              ] as DropdownItem[])
            : []),
        ]

        const handleAction = (item: DropdownItem) => {
          switch (item.value) {
            case 'edit':
              handleEdit(row)
              break
            case 'changePass':
              currentPublicId.value = row.PublicId
              showPasswordModal.value = true
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
                  class: 'text-black dark:text-white',
                },
                () => h(BaseIcon, { name: 'MoreVertical', size: 18 }),
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
      renderFn = (row: User, index?: number) => {
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
const convertToDataTableColumns = (cols: TableColumn<User>[]): DataTableColumn<User>[] => {
  return cols.map((col) => ({
    field: col.id,
    header: col.title,
    sortable: col.sortable,
    visible: col.visible !== false,
    bodyTemplate: col.render,
  }))
}

// Computed property for table columns in TableColumn format
const tableColumns = computed<TableColumn<User>[]>(() => {
  return convertToTableColumns(userColumns.value)
})

const handleColumnOrderChange = (cols: TableColumn<User>[]) => {
  const currentCols = userColumns.value.map((c) => c.field).join(',')
  const newDataTableCols = convertToDataTableColumns(cols)
  const newCols = newDataTableCols.map((c) => c.field).join(',')

  if (currentCols !== newCols) {
    isUpdatingFromParent.value = true
    userColumns.value = newDataTableCols.map((col) => ({ ...col }))
    nextTick(() => {
      isUpdatingFromParent.value = false
    })
  }
}

const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
  const columnIndex = userColumns.value.findIndex((col) => col.field === columnId)
  if (columnIndex !== -1 && userColumns.value[columnIndex]) {
    userColumns.value[columnIndex].visible = visible
  }
}

// TableWithSettings emits (data, columns); we fetch from API instead of using them
const handleExportRequest = async (
  _data: Record<string, unknown>[],
  _columns: TableColumn<User>[],
) => {
  void _data
  void _columns
  if (!hasAccess('Users.Export')) {
    openAccessDeniedModal({ message: 'شما دسترسی لازم برای خروجی Excel کاربران را ندارید' })
    return
  }
  try {
    const response = await apiClient.get(endpoints.users.export)
    const list = extractExportArray(response.data)
    if (list.length === 0) {
      toastStore.showToast('داده‌ای برای خروجی یافت نشد.', 'warning', 3000)
      return
    }
    processedExportData.value = list.map((row) => ({ ...row }))
    toastStore.showToast('داده‌ها با موفقیت آماده خروجی شدند.', 'success', 3000)
    setTimeout(() => {
      processedExportData.value = null
    }, 1500)
  } catch (error: unknown) {
    console.error('Export failed:', error)
    toastStore.showToast('مشکلی در آماده‌سازی خروجی رخ داده است.', 'error', 3000)
  }
}

const handleClosePasswordModal = () => {
  showPasswordModal.value = false
  currentPublicId.value = null
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
    <div class="space-y-4 min-[931px]:space-y-6 min-w-0 overflow-x-auto">
      <!-- Breadcrumb: hidden until 931px so 930px looks like smaller screen -->
      <div class="hidden min-[931px]:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <!-- Card with Filters and Table -->
      <Card title="لیست کاربران" variant="elevated" padding="none" class="min-w-0">
        <!-- Header -->
        <template #header>
          <div class="py-4 min-[931px]:py-6">
            <div
              class="flex flex-row flex-wrap items-start min-[931px]:items-center justify-between gap-3 min-[931px]:gap-4"
            >
              <!-- Create Button - Only show if user has permission -->
              <BaseButton
                variant="outline"
                @click="handleCreate"
                class="border-2 border-success-500 text-success-600"
              >
                <BaseIcon name="Plus" :size="16" />
                <span class="hidden min-[931px]:inline">ایجاد کاربر جدید</span>
                <span class="min-[931px]:hidden">ایجاد</span>
              </BaseButton>
            </div>
          </div>
        </template>

        <!-- Filters Section (Collapsible) -->
        <!-- <Transition name="slide-down">
          <div v-show="showFilters" class="border-t border-border-default">
            <div class="p-4 sm:p-6">
              <div class="bg-background rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                >
                  <FormField
                    id="username"
                    label="نام کاربری"
                    type="text"
                    :model-value="filters.username"
                    placeholder="نام کاربری را وارد کنید"
                    @update:model-value="filters.username = $event as string"
                  />

                  <FormField
                    id="email"
                    label="ایمیل"
                    type="email"
                    :model-value="filters.email"
                    placeholder="ایمیل را وارد کنید"
                    @update:model-value="filters.email = $event as string"
                  />

                  <FormField
                    id="firstName"
                    label="نام"
                    type="text"
                    :model-value="filters.firstName"
                    placeholder="نام را وارد کنید"
                    @update:model-value="filters.firstName = $event as string"
                  />

                  <FormField
                    id="lastName"
                    label="نام خانوادگی"
                    type="text"
                    :model-value="filters.lastName"
                    placeholder="نام خانوادگی را وارد کنید"
                    @update:model-value="filters.lastName = $event as string"
                  />

                  <FormField
                    id="IsActive"
                    label="وضعیت"
                    type="select"
                    :model-value="filters.IsActive"
                    placeholder="انتخاب کنید"
                    :options="statusOptions"
                    @update:model-value="filters.IsActive = $event as string"
                  />

                  <FormField
                    id="phone"
                    label="شماره تلفن/موبایل"
                    type="tel"
                    :model-value="filters.MobileNumber"
                    placeholder="09121234567"
                    @update:model-value="filters.MobileNumber = $event as string"
                  />
                </div>
              </div>
              <div
                class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 border-t border-dotted"
              >
                <BaseButton
                  variant="outline"
                  class="border-2 border-primary-500 text-primary-600 hover:!bg-primary-50 dark:hover:!bg-primary-900/20"
                >
                  <BaseIcon name="Search" :size="16" />
                  <span class="hidden sm:inline">اعمال فیلترها</span>
                  <span class="sm:hidden">اعمال</span>
                </BaseButton>
                <BaseButton
                  variant="outline"
                  @click="handleClear"
                  class="hover:!bg-secondary/50 dark:hover:!bg-secondary/20"
                >
                  <BaseIcon name="RefreshCw" :size="16" />
                  <span class="hidden sm:inline">پاک کردن فیلترها</span>
                  <span class="sm:hidden">پاک کردن</span>
                </BaseButton>
              </div>
            </div>
          </div>
        </Transition> -->

        <!-- Table Section: smaller padding until 931px -->
        <div
          class="border-t border-border-default py-3 min-[931px]:py-4 min-[931px]:py-6 overflow-x-auto min-w-0"
        >
          <CustomLoader v-if="isLoadingUsers" size="lg" class="mx-auto my-10" />
          <TableWithSettings
            v-else
            :columns="tableColumns"
            :data="users"
            :raw-data="fullApiData"
            :searchable="true"
            :exportable="canExportUsers"
            :export-endpoint="endpoints.users.export"
            :export-data="processedExportData || undefined"
            @column-order-change="handleColumnOrderChange"
            @column-visibility-change="handleColumnVisibilityChange"
            @export-request="handleExportRequest"
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
              آیا از حذف این کاربر مطمئن هستید؟
            </p>
            <p class="text-xs text-muted-foreground">
              این عملیات غیرقابل بازگشت است و تمام اطلاعات کاربر حذف خواهد شد.
            </p>
            <div v-if="userToDelete" class="mt-3 p-2 bg-secondary/50 rounded text-xs">
              <span class="font-semibold">کاربر:</span>
              {{ userToDelete.FirstName }} {{ userToDelete.LastName }}
              <span class="text-muted-foreground"> ({{ userToDelete.UserName }}) </span>
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
            @click="userToDelete?.PublicId && confirmDelete(userToDelete.PublicId)"
          >
            حذف
          </BaseButton>
        </div>
      </template>
    </Modal>

    <PasswordChangeModal
      v-if="showPasswordModal && currentPublicId"
      :publicId="currentPublicId!"
      @close="handleClosePasswordModal"
    />
    <!-- Access Denied Modal -->
    <AccessDeniedModal
      v-model="showAccessDeniedModal"
      :title="accessDeniedTitle"
      :message="accessDeniedMessage"
    />
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
