<script setup lang="ts">
import { ref, computed, onMounted, nextTick, h } from 'vue'
import { DashboardLayout } from '@/design-system/templates'
import type { UserInfo } from '@/design-system/organisms'
import { FormField, Pagination, Breadcrumb, Card } from '@/design-system/molecules'
import { BaseBadge, BaseSpinner, BaseButton, BaseIcon } from '@/design-system/atoms'
import Modal from '@/design-system/molecules/Modal.vue'
import BaseDropdown, { type DropdownItem } from '@/design-system/molecules/BaseDropdown.vue'
import { type DataTableColumn } from '@/design-system/organisms'
import TableWithSettings from '@/design-system/organisms/TableWithSettings.vue'

// Define TableColumn type locally to avoid import issues
type TableColumn<T = Record<string, unknown>> = {
  id: string
  title: string
  sortable?: boolean
  visible?: boolean
  render?: (row: T, index?: number) => import('vue').VNode | string | number
}
import { useAuth } from '@/shared/composables/useAuth'
import type { User, UserFilters, SelectOption } from '@/features/users/types/user'

const { fetchUser, isLoadingUser } = useAuth()

// Fetch user info on mount
onMounted(() => {
  fetchUser()
})

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'کاربران', href: '/dashboard/users/list' },
  { label: 'لیست کاربران' },
]

const handleSearch = (query: string) => {
  console.log('Global search:', query)
  // TODO: Implement global search
}

const handleUserMenuClick = () => {
  console.log('User menu clicked')
  // TODO: show user menu dropdown
}

const handleNotificationClick = () => {
  console.log('Notification clicked')
  // TODO: show notifications
}

const handleHelpClick = () => {
  console.log('Help clicked')
  // TODO: show help
}

const currentPage = ref(1)
const filters = ref<UserFilters>({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  status: '',
  role: '',
  phone: '',
})

// Mock data for users
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'علی',
    lastName: 'محمدی',
    phone: '09121234567',
    status: 'active',
    role: 'admin',
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@example.com',
    firstName: 'سارا',
    lastName: 'احمدی',
    phone: '09351234567',
    status: 'active',
    role: 'user',
  },
  {
    id: 3,
    username: 'moderator1',
    email: 'mod@example.com',
    firstName: 'رضا',
    lastName: 'کریمی',
    phone: '09191234567',
    status: 'active',
    role: 'moderator',
  },
  {
    id: 4,
    username: 'user2',
    email: 'user2@example.com',
    firstName: 'مریم',
    lastName: 'رضایی',
    phone: '09381234567',
    status: 'inactive',
    role: 'user',
  },
  {
    id: 5,
    username: 'user3',
    email: 'user3@example.com',
    firstName: 'حسین',
    lastName: 'نوری',
    status: 'pending',
    role: 'user',
  },
]

const statusOptions: SelectOption[] = [
  { value: '', label: 'همه' },
  { value: 'active', label: 'فعال' },
  { value: 'inactive', label: 'غیرفعال' },
  { value: 'pending', label: 'در انتظار' },
]

const roleOptions: SelectOption[] = [
  { value: '', label: 'همه' },
  { value: 'admin', label: 'مدیر' },
  { value: 'user', label: 'کاربر' },
  { value: 'moderator', label: 'ناظر' },
]

const userColumns = ref<DataTableColumn<User>[]>([
  {
    field: 'username',
    header: 'نام کاربری',
    sortable: true,
    visible: true,
  },
  {
    field: 'firstName',
    header: 'نام',
    sortable: true,
    visible: true,
  },
  {
    field: 'lastName',
    header: 'نام خانوادگی',
    sortable: true,
    visible: true,
  },
  {
    field: 'email',
    header: 'ایمیل',
    sortable: true,
    visible: true,
  },
  {
    field: 'phone',
    header: 'شماره تماس',
    sortable: true,
    visible: true,
  },
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

const showFilters = ref(false)
const searchQuery = ref('')

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const handleFilterSearch = () => {
  console.log('Search filters:', filters.value)
  // TODO: Implement search with filters
}

const handleQuickSearch = () => {
  console.log('Quick search:', searchQuery.value)
  // TODO: Implement quick search
}

const handleClear = () => {
  Object.assign(filters.value, {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    status: '',
    role: '',
    phone: '',
  })
}

const handleView = (row: User) => {
  console.log('View user:', row.username)
  // TODO: Navigate to view page
}

const handleEdit = (row: User) => {
  console.log('Edit user:', row.username)
  // TODO: Navigate to edit page
}

const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)

const handleDelete = (row: User) => {
  userToDelete.value = row
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (userToDelete.value) {
    console.log('Delete user:', userToDelete.value.username)
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
  console.log('Export users')
  // TODO: Implement export
}

const handleCreate = () => {
  console.log('Create new user')
  // TODO: Navigate to create page
}

const isUpdatingFromParent = ref(false)

// Convert DataTableColumn to TableColumn format
const convertToTableColumns = (cols: DataTableColumn<User>[]): TableColumn<User>[] => {
  return cols.map((col) => {
    let renderFn: ((row: User, index?: number) => import('vue').VNode | string | number) | undefined

    // Create render functions for custom cells
    if (col.field === 'phone') {
      renderFn = (row: User) => {
        return row.phone
          ? h('span', { dir: 'ltr', class: 'font-mono' }, row.phone)
          : h('span', { class: 'text-muted-foreground' }, '-')
      }
    } else if (col.field === 'email') {
      renderFn = (row: User) => {
        return h('span', { dir: 'ltr', class: 'font-mono text-sm' }, row.email)
      }
    } else if (col.field === 'role') {
      renderFn = (row: User) => {
        return row.role || '-'
      }
    } else if (col.field === 'status') {
      renderFn = (row: User) => {
        const variant =
          row.status === 'active' ? 'success' : row.status === 'inactive' ? 'secondary' : 'warning'
        const label =
          row.status === 'active' ? 'فعال' : row.status === 'inactive' ? 'غیرفعال' : 'در انتظار'
        return h(
          BaseBadge,
          { variant, size: 'sm', class: 'text-[10px] px-1.5 py-0.5' },
          () => label,
        )
      }
    } else if (col.field === 'actions') {
      renderFn = (row: User) => {
        const menuItems: DropdownItem[] = [
          { label: 'مشاهده', value: 'view' },
          { label: 'ویرایش', value: 'edit' },
          { divider: true, label: '', value: '' },
          { label: 'حذف', value: 'delete' },
        ]

        const handleAction = (item: DropdownItem) => {
          switch (item.value) {
            case 'view':
              handleView(row)
              break
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
                return h(
                  'button',
                  {
                    key: item.value,
                    class: [
                      'w-full text-right px-4 py-2 text-sm transition-colors flex items-center gap-2',
                      item.value === 'delete'
                        ? 'hover:bg-danger-50 text-danger-600'
                        : 'hover:bg-secondary text-foreground',
                    ],
                    onClick: () => select(item),
                  },
                  [
                    item.value === 'view' &&
                      h(BaseIcon, { name: 'Eye', size: 16, iconClass: 'text-muted-foreground' }),
                    item.value === 'edit' &&
                      h(BaseIcon, { name: 'Edit', size: 16, iconClass: 'text-muted-foreground' }),
                    item.value === 'delete' &&
                      h(BaseIcon, { name: 'Trash', size: 16, iconClass: 'text-danger-600' }),
                    h('span', item.label),
                  ],
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
</script>

<template>
  <div v-if="isLoadingUser" class="flex items-center justify-center min-h-screen">
    <BaseSpinner size="lg" />
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
                لیست کاربران
              </h1>
              <!-- Create Button - Only show if user has permission -->
              <!-- این باتن فعلا غیر فعال میشه تا وقتی که بشه یجور دسترسی یا عدم دسترسی کاربر ب پیج مربوطه رو بررسی کرد -->
              <!-- <BaseButton
                variant="outline"
                @click="handleCreate"
                class="border-2 border-success-500 text-success-600"
              >
                <BaseIcon name="Plus" :size="16" />
                <span class="hidden sm:inline">ایجاد کاربر جدید</span>
                <span class="sm:hidden">ایجاد</span>
              </BaseButton> -->
            </div>

            <!-- Search and Actions Row (Always Visible) -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <!-- Search Input -->
              <div class="relative flex-1 sm:flex-initial sm:w-64 md:w-72">
                <BaseIcon
                  name="Search"
                  :size="16"
                  :stroke-width="2"
                  icon-class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="جستجو..."
                  class="w-full pr-10 pl-4 py-2 bg-secondary/20 dark:bg-card-background dark:border-border-default border border-border-default/50 rounded-lg focus:bg-background dark:focus:bg-card-background focus:dark:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 placeholder:text-muted-foreground/60 dark:placeholder:text-muted-foreground/70 text-foreground dark:text-foreground text-sm"
                  @keyup.enter="handleQuickSearch"
                />
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 sm:gap-3">
                <!-- Toggle Filters Button -->
                <BaseButton
                  variant="outline"
                  @click="toggleFilters"
                  class="flex items-center gap-2"
                >
                  <BaseIcon name="Filter" :size="16" />
                  <span class="hidden sm:inline">فیلترها</span>
                </BaseButton>
                <!-- Export Excel Button -->
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

        <!-- Filters Section (Collapsible) -->
        <Transition name="slide-down">
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
                    id="status"
                    label="وضعیت"
                    type="select"
                    :model-value="filters.status"
                    placeholder="انتخاب کنید"
                    :options="statusOptions"
                    @update:model-value="filters.status = $event as string"
                  />

                  <FormField
                    id="role"
                    label="نقش"
                    type="select"
                    :model-value="filters.role"
                    placeholder="انتخاب کنید"
                    :options="roleOptions"
                    @update:model-value="filters.role = $event as string"
                  />

                  <FormField
                    id="phone"
                    label="شماره تلفن/موبایل"
                    type="tel"
                    :model-value="filters.phone"
                    placeholder="09121234567"
                    @update:model-value="filters.phone = $event as string"
                  />
                </div>
              </div>
              <!-- Filter Action Buttons -->
              <div
                class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 border-t border-dotted"
              >
                <BaseButton
                  variant="outline"
                  @click="handleFilterSearch"
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
        </Transition>

        <!-- Table Section -->
        <div class="border-t border-border-default p-3 sm:p-4 md:p-6 overflow-x-auto">
          <TableWithSettings
            :columns="tableColumns"
            :data="mockUsers"
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
              صفحه {{ currentPage }} از 1 • نمایش 1 تا {{ mockUsers.length }} از
              {{ mockUsers.length }} مورد
            </div>
            <Pagination
              v-model:current-page="currentPage"
              :total-pages="1"
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
            <p class="text-sm font-medium text-foreground mb-1">
              آیا از حذف این کاربر مطمئن هستید؟
            </p>
            <p class="text-xs text-muted-foreground">
              این عملیات غیرقابل بازگشت است و تمام اطلاعات کاربر حذف خواهد شد.
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
