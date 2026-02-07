<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { DashboardLayout } from '@/design-system/templates'
import { Breadcrumb, Card, Modal } from '@/design-system/molecules'
import { BaseButton, BaseIcon, BaseBadge, CustomLoader } from '@/design-system/atoms'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { useToastStore } from '@/stores/toast'

export interface Shobe {
  PublicId: string
  Title: string
  ShobeCode: number
  Address: string | null
  Phone: string | null
  PostalCode: string | null
  ParentPublicId: string | null
  ParentTitle: string | null
  IsActive: boolean
  Description: string | null
  DisplayOrder: number
  ZamanInsert: string
  ZamanLastEdit: string | null
  children?: Shobe[]
}

const router = useRouter()
const toastStore = useToastStore()

const list = ref<Shobe[]>([])
const isLoading = ref(false)
const selectedShobeId = ref<string | null>(null)
const showDeleteModal = ref(false)
const shobeToDelete = ref<Shobe | null>(null)

const buildTree = (items: Shobe[]): Shobe[] => {
  if (!items || items.length === 0) return []
  const roots: Shobe[] = []
  const lookup: Record<string, Shobe> = {}
  items.forEach((s) => (lookup[s.PublicId] = { ...s, children: [] }))
  items.forEach((s) => {
    const parent = s.ParentPublicId
    const node = lookup[s.PublicId] as Shobe
    if (parent && lookup[parent]) {
      lookup[parent].children!.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

const treeData = computed(() => buildTree(list.value))

const selectedShobe = computed(() => {
  if (!selectedShobeId.value) return null

  const findNode = (nodes: Shobe[]): Shobe | null => {
    for (const node of nodes) {
      if (node.PublicId === selectedShobeId.value) return node
      if (node.children?.length) {
        const found = findNode(node.children)
        if (found) return found
      }
    }
    return null
  }

  return findNode(treeData.value)
})

const fetchList = async () => {
  isLoading.value = true
  try {
    const res = await apiClient.get<Shobe[]>(endpoints.shobe.list)
    list.value = res.data ?? []
  } catch {
    toastStore.showToast('خطا در دریافت لیست شعب', 'error')
    list.value = []
  } finally {
    isLoading.value = false
  }
}

const handleCreate = () => {
  router.push('/shobe/create')
}

const handleSettings = () => {
  router.push('/shobe/settings')
}

const handleEditShobe = (node: Shobe) => {
  router.push(`/shobe/${node.PublicId}`)
}

const handleDelete = (node: Shobe) => {
  shobeToDelete.value = node
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  shobeToDelete.value = null
}

const confirmDelete = async (id?: string) => {
  if (!id || !shobeToDelete.value) return
  try {
    await apiClient.delete(endpoints.shobe.delete(id))
    toastStore.showToast('شعبه با موفقیت حذف شد', 'success')
    selectedShobeId.value = null
    await fetchList()
  } catch {
    toastStore.showToast('خطا در حذف شعبه', 'error')
  } finally {
    showDeleteModal.value = false
    shobeToDelete.value = null
  }
}

onMounted(() => {
  fetchList()
})

const TreeNode = ({ node, level = 0 }: { node: Shobe; level?: number }) => {
  const isSelected = selectedShobeId.value === node.PublicId
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
          onClick: () => (selectedShobeId.value = isSelected ? null : node.PublicId),
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
                  onClick: () => handleEditShobe(node),
                },
                () => h(BaseIcon, { name: 'Edit', size: 16 }),
              ),
              h(
                BaseButton,
                {
                  variant: 'ghost',
                  size: 'sm',
                  onClick: () => handleDelete(node),
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
</script>

<template>
  <DashboardLayout>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <div class="hidden sm:block">
        <Breadcrumb
          :items="[
            { label: 'خانه', href: '/dashboard' },
            { label: 'لیست شعب', href: '/shobe/list' },
          ]"
        />
      </div>

      <Card title="لیست شعب" variant="elevated" padding="none" class="min-w-0">
        <template #header>
          <div class="py-4 min-[931px]:py-6">
            <div
              class="flex flex-row flex-wrap items-start min-[931px]:items-center justify-between gap-3 min-[931px]:gap-4"
            >
              <div class="flex flex-wrap gap-2">
                <BaseButton
                  variant="outline"
                  @click="handleSettings"
                  class="border-2 border-primary-500 text-primary-600"
                >
                  <BaseIcon name="Settings" :size="16" />
                  <span class="hidden min-[931px]:inline">تنظیمات شعب</span>
                  <span class="min-[931px]:hidden">تنظیمات</span>
                </BaseButton>
                <BaseButton
                  variant="outline"
                  @click="handleCreate"
                  class="border-2 border-success-500 text-success-600"
                >
                  <BaseIcon name="Plus" :size="16" />
                  <span class="hidden min-[931px]:inline">ایجاد شعبه</span>
                  <span class="min-[931px]:hidden">ایجاد</span>
                </BaseButton>
              </div>
            </div>
          </div>
        </template>
        <!-- Content Section -->
        <div
          class="border-t border-border-default py-3 min-[931px]:py-4 min-[931px]:py-6 overflow-x-auto min-w-0"
        >
          <div class="flex flex-col lg:flex-row w-full min-h-[500px] min-w-0">
            <!-- LEFT: TREE -->
            <div
              :class="[
                'border-l transition-all duration-300 ease-in-out lg:transition-[width] border-border-default bg-white dark:bg-gray-900 min-w-0',
                selectedShobe ? 'hidden lg:block' : 'block',
                selectedShobe ? 'lg:w-[320px] xl:w-[360px]' : 'w-full',
              ]"
            >
              <div
                class="p-4 bg-gray-50 dark:bg-gray-800 border-b border-border-default font-semibold text-sm"
              >
                لیست شعب و زیر شعب
              </div>
              <div class="p-2 overflow-y-auto overflow-x-hidden max-h-[600px] lg:max-h-none">
                <CustomLoader v-if="isLoading" size="md" class="mx-auto my-4" />
                <div
                  v-else-if="treeData.length === 0"
                  class="text-center text-muted-foreground py-4 text-sm"
                >
                  هیچ شعبه‌ای یافت نشد
                </div>
                <div v-else class="space-y-0">
                  <TreeNode v-for="node in treeData" :key="node.PublicId" :node="node" />
                </div>
              </div>
            </div>

            <!-- RIGHT: DETAILS -->
            <div
              v-if="selectedShobe"
              class="flex-1 min-w-0 p-4 sm:p-6 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out lg:transition-[width]"
            >
              <div class="space-y-6">
                <div class="flex items-center justify-between lg:hidden">
                  <span class="text-sm font-medium text-muted-foreground"> جزئیات شعبه </span>
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    @click="selectedShobeId = null"
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
                      {{ selectedShobe.Title }}
                    </h2>
                  </div>
                  <div
                    class="flex flex-wrap items-center gap-2 text-sm text-primary dark:text-primary"
                  >
                    <span>کد شعبه: {{ selectedShobe.ShobeCode }}</span>
                    <BaseBadge
                      :variant="selectedShobe.IsActive ? 'success' : 'secondary'"
                      size="sm"
                    >
                      {{ selectedShobe.IsActive ? 'فعال' : 'غیرفعال' }}
                    </BaseBadge>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div v-if="selectedShobe.Address" class="sm:col-span-2">
                    <h3 class="text-sm font-medium text-muted-foreground mb-1">آدرس</h3>
                    <p class="text-foreground">{{ selectedShobe.Address }}</p>
                  </div>
                  <div v-if="selectedShobe.Phone">
                    <h3 class="text-sm font-medium text-muted-foreground mb-1">تلفن</h3>
                    <p class="text-foreground font-mono" dir="ltr">{{ selectedShobe.Phone }}</p>
                  </div>
                  <div v-if="selectedShobe.PostalCode">
                    <h3 class="text-sm font-medium text-muted-foreground mb-1">کد پستی</h3>
                    <p class="text-foreground font-mono" dir="ltr">
                      {{ selectedShobe.PostalCode }}
                    </p>
                  </div>
                  <div v-if="selectedShobe.ParentTitle">
                    <h3 class="text-sm font-medium text-muted-foreground mb-1">شعبه والد</h3>
                    <p class="text-foreground">{{ selectedShobe.ParentTitle }}</p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-muted-foreground mb-1">ترتیب نمایش</h3>
                    <p class="text-foreground">{{ selectedShobe.DisplayOrder }}</p>
                  </div>
                  <div v-if="selectedShobe.Description" class="sm:col-span-2">
                    <h3 class="text-sm font-medium text-muted-foreground mb-1">توضیحات</h3>
                    <p class="text-foreground">{{ selectedShobe.Description }}</p>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BaseIcon name="Folder" :size="20" />
                    زیرمجموعه‌ها ({{ selectedShobe.children?.length || 0 }})
                  </h3>
                  <div
                    v-if="!selectedShobe.children || selectedShobe.children.length === 0"
                    class="text-center py-8 text-muted-foreground border-2 border-dashed border-border-default rounded-lg"
                  >
                    این شعبه دارای زیرمجموعه نمی‌باشد.
                  </div>
                  <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      v-for="child in selectedShobe.children"
                      :key="child.PublicId"
                      class="p-4 border border-border-default rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800 flex items-center justify-between group cursor-pointer"
                      @click="selectedShobeId = child.PublicId"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                        >
                          <BaseIcon name="File" :size="16" class="text-gray-500" />
                        </div>
                        <div>
                          <div class="font-medium text-foreground">{{ child.Title }}</div>
                          <div class="text-xs text-muted-foreground">کد: {{ child.ShobeCode }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <Modal v-model="showDeleteModal" title="تأیید حذف" size="sm" :close-on-backdrop="false">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center"
          >
            <BaseIcon name="AlertTriangle" :size="20" class="text-danger-600" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-foreground mb-1">آیا از حذف این شعبه مطمئن هستید؟</p>
            <p class="text-xs text-muted-foreground">
              این عملیات غیرقابل بازگشت است و اطلاعات شعبه حذف خواهد شد.
            </p>
            <div
              v-if="shobeToDelete"
              class="mt-3 p-2 flex flex-col gap-2 bg-secondary/50 rounded text-xs"
            >
              <div>
                <span class="font-semibold">عنوان:</span>
                {{ shobeToDelete.Title }}
              </div>
              <div>
                <span class="font-semibold">کد شعبه:</span>
                {{ shobeToDelete.ShobeCode }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <BaseButton variant="outline" @click="cancelDelete">انصراف</BaseButton>
          <BaseButton
            variant="default"
            class="bg-danger-600 hover:bg-danger-700 text-white"
            @click="confirmDelete(shobeToDelete?.PublicId)"
          >
            حذف
          </BaseButton>
        </div>
      </template>
    </Modal>
  </DashboardLayout>
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
