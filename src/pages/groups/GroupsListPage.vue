<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { Breadcrumb, Card, Modal } from '@/design-system/molecules'
import { BaseButton, BaseIcon, CustomLoader } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'
import { useAuth } from '@/shared/composables/useAuth'

export interface Group {
  PublicId: string
  Title: string
  GrpCode: number
  ZamanInsert: string
  ZamanLastEdit: string | null
  ParentPublicId: string | null
  children?: Group[]
}

const router = useRouter()
const { fetchUser, isLoadingUser } = useAuth()
const toastStore = useToastStore()

const groups = ref<Group[]>([])
const isLoadingGroups = ref(false)
const showDeleteModal = ref(false)
const groupToDelete = ref<Group | null>(null)
const selectedGroupId = ref<string | null>(null)

const buildTree = (items: Group[]): Group[] => {
  if (!items || items.length === 0) return []
  const roots: Group[] = []
  const lookup: Record<string, Group> = {}
  items.forEach((g) => (lookup[g.PublicId] = { ...g, children: [] }))
  items.forEach((g) => {
    const parent = g.ParentPublicId
    if (parent && lookup[parent]) {
      lookup[parent].children!.push(lookup[g.PublicId])
    } else {
      roots.push(lookup[g.PublicId])
    }
  })
  return roots
}

const treeData = computed(() => buildTree(groups.value))

const selectedGroup = computed(() => {
  if (!selectedGroupId.value) return null

  const findNode = (nodes: Group[]): Group | null => {
    for (const node of nodes) {
      if (node.PublicId === selectedGroupId.value) return node
      if (node.children?.length) {
        const found = findNode(node.children)
        if (found) return found
      }
    }
    return null
  }

  return findNode(treeData.value)
})

// --- Actions ---
const fetchGroups = async () => {
  isLoadingGroups.value = true
  try {
    const res = await apiClient.get<Group[]>(endpoints.groups.list)
    groups.value = res.data
  } catch {
    toastStore.showToast('خطا در دریافت لیست گروه‌ها', 'error')
  } finally {
    isLoadingGroups.value = false
  }
}

const handleCreate = () => router.push('/grp/create')
const cancelDelete = () => {
  showDeleteModal.value = false
}

const handleDelete = (g: Group) => {
  groupToDelete.value = g
  showDeleteModal.value = true
}

const confirmDelete = async (id?: string) => {
  if (!id || !groupToDelete.value) return

  if (isSystemAdminGroup(groupToDelete.value)) {
    toastStore.showToast('گروه مدیر سیستم قابل حذف نیست', 'error')
    showDeleteModal.value = false
    return
  }

  try {
    await apiClient.delete(endpoints.groups.delete(id))
    toastStore.showToast('گروه با موفقیت حذف شد', 'success')
    selectedGroupId.value = null
    await fetchGroups()
  } catch {
    toastStore.showToast('خطا در حذف گروه', 'error')
  } finally {
    showDeleteModal.value = false
  }
}

onMounted(() => {
  fetchUser()
  fetchGroups()
})

const TreeNode = ({ node, level = 0 }: { node: Group; level?: number }) => {
  const isSelected = selectedGroupId.value === node.PublicId
  const hasChildren = node.children?.length

  return h(
    'div',
    { class: 'relative tree-node', style: { paddingRight: `${0.5 + level * 0.5}rem` } },
    [
      level > 0 &&
        h('span', {
          class: 'tree-connector',
        }),
      h(
        'div',
        {
          class: [
            'flex items-center justify-between py-3 px-2 border-b cursor-pointer transition-colors group',
            isSelected ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-primary-50',
          ],
          style: { paddingRight: `${1.5 + level * 0.5}rem` },
          onClick: () => (selectedGroupId.value = isSelected ? null : node.PublicId),
        },
        [
          h('div', { class: 'flex items-center gap-3' }, [
            h(BaseIcon, {
              name: hasChildren ? 'Folder' : 'File',
              size: 18,
              class: hasChildren ? 'text-primary-500' : 'text-gray-400',
            }),
            h('span', { class: 'font-medium text-foreground' }, node.Title),
          ]),
          h(
            'div',
            {
              class: 'flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity',
              onClick: (e: Event) => e.stopPropagation(),
            },
            [
              h(
                BaseButton,
                {
                  variant: 'ghost',
                  size: 'sm',
                  disabled: isSystemAdminGroup(node),
                  class: isSystemAdminGroup(node) ? 'opacity-40 cursor-not-allowed' : '',
                  onClick: () => {
                    if (isSystemAdminGroup(node)) return
                    router.push(`/grp/${node.PublicId}`)
                  },
                },
                () => h(BaseIcon, { name: 'Edit', size: 16 }),
              ),
              h(
                BaseButton,
                {
                  variant: 'ghost',
                  size: 'sm',
                  disabled: isSystemAdminGroup(node),
                  class: isSystemAdminGroup(node) ? 'opacity-40 cursor-not-allowed' : '',
                  onClick: () => {
                    if (isSystemAdminGroup(node)) return
                    handleDelete(node)
                  },
                },
                () => h(BaseIcon, { name: 'Trash', class: 'text-danger', size: 16 }),
              ),
            ],
          ),
        ],
      ),
      hasChildren
        ? h(
            'div',
            {},
            node.children!.map((c) =>
              h('div', { class: 'tree-child-wrapper' }, h(TreeNode, { node: c, level: level + 1 })),
            ),
          )
        : null,
    ],
  )
}

const isSystemAdminGroup = (group?: Group | null) => {
  if (!group) return false
  return group.GrpCode === 1 && group.Title.toLowerCase() === 'admin'
}
</script>

<template>
  <div v-if="isLoadingUser" class="flex items-center justify-center min-h-screen">
    <CustomLoader size="lg" />
  </div>

  <DashboardLayout v-else>
    <div class="space-y-6">
      <div class="hidden sm:block">
        <Breadcrumb
          :items="[
            { label: 'خانه', href: '/dashboard' },
            { label: 'لیست گروه‌ها', href: '/grp/list' },
          ]"
        />
      </div>

      <Card title="لیست گروه‌ها" variant="elevated" padding="none">
        <template #header>
          <div class="p-6 flex justify-between items-center">
            <BaseButton
              variant="outline"
              @click="handleCreate"
              class="border-success-500 text-success-600"
            >
              <BaseIcon name="Plus" :size="16" />
              <span class="hidden sm:inline">ایجاد گروه جدید</span>
            </BaseButton>
          </div>
        </template>

        <div class="flex flex-col lg:flex-row w-full min-h-[500px]">
          <!-- LEFT: TREE -->
          <div
            ref="leftPanel"
            :class="[
              'border-l transition-all duration-300 ease-in-out lg:transition-[width] border-border-default bg-white dark:bg-gray-900',
              selectedGroup ? 'hidden lg:block' : 'block',
              selectedGroup ? 'lg:w-[320px] xl:w-[360px]' : 'w-full',
            ]"
          >
            <div
              class="p-4 bg-gray-50 dark:bg-gray-800 border-b border-border-default font-semibold text-sm"
            >
              لیست گروه‌ها و زیر گروه‌ها
            </div>
            <div class="p-2 overflow-y-auto overflow-x-hidden max-h-[600px] lg:max-h-none">
              <CustomLoader v-if="isLoadingGroups" size="md" class="mx-auto my-4" />
              <div
                v-else-if="treeData.length === 0"
                class="text-center text-muted-foreground py-4 text-sm"
              >
                هیچ گروهی یافت نشد
              </div>
              <div v-else class="space-y-0">
                <TreeNode v-for="node in treeData" :key="node.PublicId" :node="node" />
              </div>
            </div>
          </div>

          <!-- RIGHT: DETAILS -->
          <div
            v-if="selectedGroup"
            class="flex-1 min-w-0 p-4 sm:p-6 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out lg:transition-[width]"
          >
            <div class="space-y-6">
              <div class="flex items-center justify-between lg:hidden">
                <span class="text-sm font-medium text-muted-foreground"> جزئیات گروه </span>

                <BaseButton
                  variant="ghost"
                  size="sm"
                  @click="selectedGroupId = null"
                  class="flex items-center gap-2"
                >
                  <BaseIcon name="ArrowRight" :size="16" />
                  بازگشت
                </BaseButton>
              </div>
              <div
                class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800"
              >
                <div class="flex items-center gap-3 mb-2">
                  <BaseIcon name="FolderOpen" :size="24" class="text-primary-600" />
                  <h2 class="text-xl font-bold text-primary dark:text-primary-600">
                    {{ selectedGroup.Title }}
                  </h2>
                </div>
                <div class="text-sm text-primary dark:text-primary">
                  کد گروه: {{ selectedGroup.GrpCode }}
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BaseIcon name="Users" :size="20" />
                  زیرمجموعه‌ها ({{ selectedGroup.children?.length || 0 }})
                </h3>

                <div
                  v-if="!selectedGroup.children || selectedGroup.children.length === 0"
                  class="text-center py-8 text-muted-foreground border-2 border-dashed border-border-default rounded-lg"
                >
                  این گروه دارای زیرمجموعه نمی‌باشد.
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div
                    v-for="child in selectedGroup.children"
                    :key="child.PublicId"
                    class="p-4 border border-border-default rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800 flex items-center justify-between group"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                      >
                        <BaseIcon name="User" :size="16" class="text-gray-500" />
                      </div>
                      <div>
                        <div class="font-medium text-foreground">{{ child.Title }}</div>
                        <div class="text-xs text-muted-foreground">کد: {{ child.GrpCode }}</div>
                      </div>
                    </div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        :disabled="isSystemAdminGroup(child)"
                        :class="isSystemAdminGroup(child) ? 'opacity-40 cursor-not-allowed' : ''"
                        @click="!isSystemAdminGroup(child) && router.push(`/grp/${child.PublicId}`)"
                      >
                        <BaseIcon name="Edit" :size="16" />
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </DashboardLayout>

  <Modal v-model="showDeleteModal" title="تأیید حذف" size="sm" :close-on-backdrop="false">
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center"
        >
          <BaseIcon name="AlertTriangle" :size="20" class="text-danger-600" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-foreground mb-1">آیا از حذف این گروه مطمئن هستید؟</p>
          <p class="text-xs text-muted-foreground">
            این عملیات غیرقابل بازگشت است و تمام اطلاعات گروه حذف خواهد شد.
          </p>
          <div
            v-if="groupToDelete"
            class="mt-3 p-2 flex flex-col gap-2 bg-secondary/50 rounded text-xs"
          >
            <div>
              <span class="font-semibold">اسم گروه:</span>
              {{ groupToDelete.Title }} {{ groupToDelete.GrpCode }}
            </div>
            <div>
              <span class="font-semibold">کد گروه:</span>
              {{ groupToDelete.Title }} {{ groupToDelete.GrpCode }}
            </div>
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
          :disabled="isSystemAdminGroup(groupToDelete)"
          :class="isSystemAdminGroup(groupToDelete) ? 'opacity-50 cursor-not-allowed' : ''"
          @click="confirmDelete(groupToDelete?.PublicId)"
        >
          حذف
        </BaseButton>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.tree-node {
  position: relative;
}

.tree-node::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  border-right: 1px dotted #cbd5e1;
}

.tree-connector {
  position: absolute;
  top: 1.5rem;
  right: 0;
  width: 1rem;
  border-top: 1px dotted #cbd5e1;
}
</style>
