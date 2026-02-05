<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { CustomLoader, DashboardLayout } from '@/design-system'
import type { BaseTreeNode } from '@/design-system/molecules/BaseTreeSelect.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import BaseTreeSelect from '@/design-system/molecules/BaseTreeSelect.vue'
import BaseButton from '@/design-system/atoms/BaseButton.vue'
import { AccessDeniedModal } from '@/design-system/molecules'
import GroupAccessTreeNodes from './GroupAccessTreeNodes.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useRouteAccess } from '@/shared/composables/useRouteAccess'
import { useAccessDenied } from '@/shared/composables/useAccessDenied'
import { useToastStore } from '@/stores/toast'
import type {
  GroupAccessTreeResponse,
  GroupAccessMenu,
  GroupAccessPermission,
} from '@/shared/api/types'

interface GrpItem {
  PublicId: string
  Title?: string
  ParentPublicId?: string | null
  Description?: string | null
  GrpCode?: number
  ZamanInsert?: string
  ZamanLastEdit?: string | null
}

const groupsTree = ref<BaseTreeNode[]>([])
const groupsList = ref<GrpItem[]>([])
const selectedId = ref<string | null>(null)
const isLoading = ref(true)
const toastStore = useToastStore()
const { hasAccess } = useRouteAccess()
const { showAccessDeniedModal, accessDeniedTitle, accessDeniedMessage, openAccessDeniedModal } =
  useAccessDenied()

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'تخصیص دسترسی به گروه', href: '/Permission/assign' },
]

function flatGrpListToTree(items: GrpItem[]): BaseTreeNode[] {
  const list = items.filter((i) => i.PublicId)
  if (list.length === 0) return []

  const hasChildren = (item: GrpItem) =>
    list.some((i) => (i.ParentPublicId ?? null) === item.PublicId)

  const toNode = (item: GrpItem): BaseTreeNode => ({
    PublicId: item.PublicId,
    Title: item.Description ?? item.Title ?? '',
    Icon: hasChildren(item) ? 'Folder' : 'Users',
    Children: undefined,
  })

  const getChildren = (parentPublicId: string | null): BaseTreeNode[] => {
    return list
      .filter((item) => (item.ParentPublicId ?? null) === parentPublicId)
      .map((item) => {
        const node = toNode(item)
        const children = getChildren(item.PublicId)
        if (children.length) node.Children = children
        return node
      })
  }

  return getChildren(null)
}

function mapToBaseTreeNode(item: {
  PublicId?: string
  Description?: string
  Title?: string
  Children?: unknown[]
}): BaseTreeNode {
  return {
    PublicId: item.PublicId ?? '',
    Title: item.Description ?? item.Title ?? '',
    Children: Array.isArray(item.Children)
      ? item.Children.map((child) =>
          mapToBaseTreeNode(
            child as {
              PublicId?: string
              Description?: string
              Title?: string
              Children?: unknown[]
            },
          ),
        )
      : undefined,
  }
}

const groupCodeByPublicId = computed(() => {
  const map = new Map<string, number>()
  for (const group of groupsList.value) {
    if (group.PublicId && typeof group.GrpCode === 'number') {
      map.set(group.PublicId, group.GrpCode)
    }
  }
  return map
})

// ---- Access tree (left panel) ----
const selectedGroupForAccess = ref<{ PublicId: string; Title: string; GrpCode: number } | null>(
  null,
)
const accessTreeData = ref<GroupAccessTreeResponse | null>(null)
const accessTreeMenus = ref<GroupAccessMenu[]>([])
const isLoadingAccessTree = ref(false)
const isSavingAccess = ref(false)
const accessTreeDirty = ref(false)
/** Snapshot of HasAccess per PermissionId when tree was loaded; used to send only changes. */
const initialAccessByPermissionId = ref<Map<number, boolean>>(new Map())

interface AccessItem {
  PermissionId: number
  HasAccess: boolean
}

/** Build Map<PermissionId, HasAccess> from tree (one entry per id; true wins if duplicate). */
function collectAccessMap(menus: GroupAccessMenu[]): Map<number, boolean> {
  const byId = new Map<number, boolean>()
  function walk(m: GroupAccessMenu[]) {
    for (const menu of m) {
      for (const p of menu.Permissions ?? []) {
        byId.set(p.PermissionId, byId.get(p.PermissionId) === true || p.HasAccess)
      }
      if (menu.Children?.length) walk(menu.Children)
    }
  }
  walk(menus)
  return byId
}

/** Only items whose HasAccess changed compared to initial snapshot. */
function collectChangedAccessItems(menus: GroupAccessMenu[]): AccessItem[] {
  const current = collectAccessMap(menus)
  const initial = initialAccessByPermissionId.value
  const items: AccessItem[] = []
  const seen = new Set<number>()
  for (const [id, hasAccess] of current) {
    if (seen.has(id)) continue
    seen.add(id)
    const was = initial.get(id)
    if (was !== hasAccess) {
      items.push({ PermissionId: id, HasAccess: hasAccess })
    }
  }
  for (const [id] of initial) {
    if (seen.has(id)) continue
    if (current.has(id)) continue
    items.push({ PermissionId: id, HasAccess: false })
  }
  return items
}

async function fetchAccessTree(groupId: number) {
  isLoadingAccessTree.value = true
  accessTreeData.value = null
  accessTreeMenus.value = []
  initialAccessByPermissionId.value = new Map()
  try {
    const res = await apiClient.get<GroupAccessTreeResponse>(
      endpoints.permissions.groupAccessTree(groupId),
    )
    accessTreeData.value = res.data
    accessTreeMenus.value = (res.data?.Menus ?? []).map((m) => ({ ...m }))
    initialAccessByPermissionId.value = collectAccessMap(accessTreeMenus.value)
  } catch (error) {
    console.error('Error fetching group access tree:', error)
    toastStore.showToast('خطا در دریافت درخت دسترسی گروه', 'error', 5000)
  } finally {
    isLoadingAccessTree.value = false
  }
}

function openGroupAccess(node: BaseTreeNode) {
  if (!hasAccess('Permissions.Read') && !hasAccess('Permissions.Manage')) {
    openAccessDeniedModal({
      message: `شما دسترسی لازم برای مشاهده دسترسی‌های گروه «${node.Title}» را ندارید`,
    })
    return
  }
  const grpCode = groupCodeByPublicId.value.get(node.PublicId)
  if (typeof grpCode !== 'number') {
    toastStore.showToast('گروه انتخاب‌شده معتبر نیست (GrpCode یافت نشد)', 'error', 5000)
    return
  }
  selectedGroupForAccess.value = {
    PublicId: node.PublicId,
    Title: node.Title ?? '',
    GrpCode: grpCode,
  }
  accessTreeDirty.value = false
  fetchAccessTree(grpCode)
}

/** True if this menu or any descendant has any permission with HasAccess. */
function hasAnyAccess(menu: GroupAccessMenu): boolean {
  const permHas = (menu.Permissions ?? []).some((p) => p.HasAccess)
  const childHas = (menu.Children ?? []).some((c) => hasAnyAccess(c))
  return permHas || childHas
}

/** Set a menu and all its permissions and descendant menus/permissions to the same HasAccess (parent → all children). */
function setMenuAccessCascading(menu: GroupAccessMenu, hasAccess: boolean) {
  menu.HasAccess = hasAccess
  for (const p of menu.Permissions ?? []) {
    p.HasAccess = hasAccess
  }
  for (const child of menu.Children ?? []) {
    setMenuAccessCascading(child, hasAccess)
  }
}

/**
 * Update ancestor menus (and optionally their permissions) when a child is selected.
 * When hasAccess is true and setAncestorPermissions is:
 * - 'all': set each ancestor menu and all its permissions to true (used when toggling a whole menu).
 * - 'allButLast': set each ancestor's permissions to true except the last in the list (direct parent),
 *   so sibling permissions stay unchanged; only path-to-root gets true (used when toggling one permission).
 */
function updateAncestorMenus(
  ancestorMenus: GroupAccessMenu[],
  hasAccess: boolean,
  setAncestorPermissions: 'all' | 'allButLast' = 'all',
) {
  for (let i = 0; i < ancestorMenus.length; i++) {
    const ancestor = ancestorMenus[i]
    if (!ancestor) continue
    ancestor.HasAccess = hasAccess ? true : hasAnyAccess(ancestor)
    if (hasAccess) {
      const isDirectParent =
        setAncestorPermissions === 'allButLast' && i === ancestorMenus.length - 1
      if (!isDirectParent) {
        for (const p of ancestor.Permissions ?? []) {
          p.HasAccess = true
        }
      }
    }
  }
}

function setMenuAccess(
  menu: GroupAccessMenu,
  hasAccess: boolean,
  ancestorMenus: GroupAccessMenu[] = [],
) {
  setMenuAccessCascading(menu, hasAccess)
  updateAncestorMenus(ancestorMenus, hasAccess)
  accessTreeDirty.value = true
}

function setPermissionAccess(
  permission: GroupAccessPermission,
  hasAccess: boolean,
  ancestorMenusIncludingParent: GroupAccessMenu[] = [],
) {
  permission.HasAccess = hasAccess
  updateAncestorMenus(ancestorMenusIncludingParent, hasAccess, 'allButLast')
  accessTreeDirty.value = true
}

async function saveAccessTree() {
  if (!selectedGroupForAccess.value || !accessTreeMenus.value.length) return
  const accessItems = collectChangedAccessItems(accessTreeMenus.value)
  if (accessItems.length === 0) {
    accessTreeDirty.value = false
    return
  }
  isSavingAccess.value = true
  try {
    await apiClient.post(
      endpoints.permissions.updateGroupAccess(selectedGroupForAccess.value.GrpCode),
      { AccessItems: accessItems },
    )
    initialAccessByPermissionId.value = collectAccessMap(accessTreeMenus.value)
    accessTreeDirty.value = false
    toastStore.showToast('دسترسی‌های گروه با موفقیت به‌روزرسانی شد', 'success', 5000)
    await fetchAccessTree(selectedGroupForAccess.value.GrpCode)
  } catch (error) {
    console.error('Error updating group access:', error)
    toastStore.showToast('خطا در به‌روزرسانی دسترسی‌های گروه', 'error', 5000)
  } finally {
    isSavingAccess.value = false
  }
}

// ---- Legacy: bulk assign modal ----
const permissionsTree = ref<BaseTreeNode[]>([])
const selectedPermissionIds = ref<string[]>([])
const showPermissionSelector = ref(false)
const isLoadingPermissions = ref(false)
const isAssigning = ref(false)
const activeGroupNode = ref<BaseTreeNode | null>(null)

const fetchPermissions = async () => {
  if (isLoadingPermissions.value) return
  isLoadingPermissions.value = true
  try {
    const res = await apiClient.get<
      | BaseTreeNode[]
      | { PublicId: string; Description?: string; Title?: string; Children?: unknown[] }[]
    >(endpoints.permissions.list)
    const data = Array.isArray(res.data) ? res.data : []
    permissionsTree.value = data.map((item) => mapToBaseTreeNode(item))
  } catch (error) {
    console.error('Error fetching permissions:', error)
    permissionsTree.value = []
    toastStore.showToast('خطا در دریافت لیست دسترسی‌ها', 'error', 5000)
  } finally {
    isLoadingPermissions.value = false
  }
}

onMounted(async () => {
  try {
    const res = await apiClient.get<GrpItem[]>(endpoints.groups.list)
    const data = Array.isArray(res.data) ? res.data : []
    groupsList.value = data
    groupsTree.value = flatGrpListToTree(data)
  } catch (error) {
    console.error('Error fetching groups:', error)
    groupsTree.value = []
  } finally {
    isLoading.value = false
  }
})

const handleSelect = (node: BaseTreeNode) => {
  selectedId.value = node.PublicId
  openGroupAccess(node)
}

const handleAssignAccess = async (node: BaseTreeNode) => {
  if (!hasAccess('Permissions.Read') && !hasAccess('Permissions.Manage')) {
    openAccessDeniedModal({
      message: `شما دسترسی لازم برای تخصیص دسترسی به گروه «${node.Title}» را ندارید`,
    })
    return
  }
  activeGroupNode.value = node
  selectedPermissionIds.value = []
  showPermissionSelector.value = true
  if (permissionsTree.value.length === 0) {
    await fetchPermissions()
  }
}

const handleConfirmAssign = async () => {
  if (!activeGroupNode.value) return
  if (!selectedPermissionIds.value.length) {
    toastStore.showToast('لطفا حداقل یک دسترسی انتخاب کنید', 'warning', 4000)
    return
  }

  const groupCode = groupCodeByPublicId.value.get(activeGroupNode.value.PublicId)
  if (typeof groupCode !== 'number') {
    toastStore.showToast('گروه انتخاب‌ شده معتبر نیست', 'error', 5000)
    return
  }

  isAssigning.value = true
  try {
    const formData = new FormData()
    for (const id of selectedPermissionIds.value) {
      formData.append('PermissionPublicIds', id)
    }
    await apiClient.post(endpoints.permissions.updateGroupAccess(groupCode), formData)
    toastStore.showToast('دسترسی‌ها با موفقیت به گروه تخصیص یافت', 'success', 5000)
    showPermissionSelector.value = false
    if (selectedGroupForAccess.value?.PublicId === activeGroupNode.value.PublicId) {
      await fetchAccessTree(selectedGroupForAccess.value.GrpCode)
    }
  } catch (error) {
    console.error('Error assigning permissions to group:', error)
    toastStore.showToast('خطا در تخصیص دسترسی‌ها به گروه', 'error', 5000)
  } finally {
    isAssigning.value = false
  }
}
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
    <CustomLoader size="lg" />
  </div>
  <DashboardLayout v-else>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 min-w-0">
        <!-- Left: Groups list (minimal card); full width when right panel hidden, 50% when both visible -->
        <Card
          title="تخصیص دسترسی به گروه‌ها"
          variant="elevated"
          padding="none"
          class="flex-1 min-w-0"
        >
          <template #header>
            <div class="py-4 sm:py-6"></div>
          </template>
          <div class="overflow-x-auto min-w-0">
            <div class="groups-tree-card">
              <BaseTreeSelect
                :nodes="groupsTree"
                :model-value="selectedId ?? ''"
                @update:model-value="(v) => (selectedId = (v as string) || null)"
                :selected-id="selectedId"
                @select="handleSelect"
                :multi-select="false"
                :show-checkbox="false"
              >
              </BaseTreeSelect>
            </div>

            <p
              v-if="groupsTree.length === 0"
              class="text-center text-muted-foreground py-6 text-sm"
            >
              گروه یافت نشد.
            </p>
          </div>
        </Card>

        <Card
          v-if="selectedGroupForAccess"
          :title="`دسترسی‌های گروه «${selectedGroupForAccess.Title}»`"
          variant="elevated"
          padding="none"
          class="flex-1 min-w-0"
        >
          <template #header>
            <div class="py-4 sm:py-6 px-4 sm:px-6 flex items-center justify-end flex-wrap gap-2">
              <BaseButton
                v-if="accessTreeDirty"
                size="sm"
                variant="primary"
                :loading="isSavingAccess"
                :disabled="isSavingAccess"
                @click="saveAccessTree"
                class="text-white"
              >
                ذخیره تغییرات
              </BaseButton>
            </div>
          </template>
          <div
            class="p-4 sm:p-6 border-t border-border-default min-h-[320px] max-h-[70vh] overflow-y-auto overflow-x-hidden min-w-0"
          >
            <CustomLoader v-if="isLoadingAccessTree" size="md" class="mx-auto my-10" />
            <template v-else-if="accessTreeMenus.length === 0">
              <p class="text-muted-foreground text-sm py-8 text-center">
                درختی برای این گروه یافت نشد.
              </p>
            </template>
            <template v-else>
              <GroupAccessTreeNodes
                :menus="accessTreeMenus"
                :level="0"
                @menu-access="setMenuAccess"
                @permission-access="setPermissionAccess"
              />
            </template>
          </div>
        </Card>
      </div>
    </div>
    <AccessDeniedModal
      v-model="showAccessDeniedModal"
      :title="accessDeniedTitle"
      :message="accessDeniedMessage"
    />
  </DashboardLayout>
</template>

<style scoped>
.groups-tree-card :deep(.tree-row) {
  border-radius: 0.5rem;
  border: 1px solid var(--border-default, #e5e7eb);
  margin-bottom: 0.5rem;
  padding: 0.875rem 0.75rem;
  min-height: 4rem;
  height: 4rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.groups-tree-card :deep(.tree-row:last-child) {
  margin-bottom: 0;
}
.groups-tree-card :deep(.tree-row.bg-primary-100),
.groups-tree-card :deep(.tree-row:hover) {
  border-color: var(--primary-500, #6366f1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.15);
}
.groups-tree-card :deep(.tree-root) {
  padding-right: 0;
}
.groups-tree-card :deep(.tree-node) {
  margin-bottom: 0.25rem;
}
</style>
