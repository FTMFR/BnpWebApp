<script setup lang="ts">
import { CustomLoader, DashboardLayout } from '@/design-system'
import type { BaseTreeNode } from '@/design-system/molecules/BaseTreeSelect.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import BaseTreeSelect from '@/design-system/molecules/BaseTreeSelect.vue'
import { AccessDeniedModal } from '@/design-system/molecules'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '@/design-system/atoms/BaseIcon.vue'
import BaseButton from '@/design-system/atoms/BaseButton.vue'
import { useRouteAccess } from '@/shared/composables/useRouteAccess'
import { useAccessDenied } from '@/shared/composables/useAccessDenied'

const menus = ref<BaseTreeNode[]>([])
const selectedId = ref<string | null>(null)
const isLoadingMenus = ref<boolean>(true)
const selectedMenu = ref<string[]>([])
const router = useRouter()
const { hasAccess } = useRouteAccess()
const { showAccessDeniedModal, accessDeniedTitle, accessDeniedMessage, openAccessDeniedModal } =
  useAccessDenied()

const breadcrumbItems = [
  { label: 'خانه', href: '/dashboard' },
  { label: 'لیست منوها', href: '/menu/list' },
]

onMounted(async () => {
  const res = await apiClient.get(endpoints.menu.list)
  menus.value = res.data
  isLoadingMenus.value = false
})

const handleCreate = () => {
  if (!hasAccess('Menus.Create')) {
    openAccessDeniedModal({ message: 'شما دسترسی لازم برای ایجاد منو جدید را ندارید' })
    return
  }
  router.push('/menu/create')
}

const handleSelect = (node: BaseTreeNode) => {
  selectedId.value = node.PublicId
  console.log('Selected node:', node)
}

const handleEditMenu = (node: BaseTreeNode) => {
  if (!hasAccess('Menus.Update')) {
    openAccessDeniedModal({ message: 'شما دسترسی لازم برای ویرایش منو را ندارید' })
    return
  }
  router.push(`/menu/${node.PublicId}`)
}

watch(
  selectedMenu,
  (newValue) => {
    console.log('Selected menus (v-model):', newValue)
  },
  { deep: true },
)

// const selectedMenuNodes = computed(() => {
//   const findNodeById = (nodes: BaseTreeNode[], id: string): BaseTreeNode | null => {
//     for (const node of nodes) {
//       if (node.PublicId === id) return node
//       if (node.Children) {
//         const found = findNodeById(node.Children, id)
//         if (found) return found
//       }
//     }
//     return null
//   }

//   return selectedMenu.value
//     .map((id) => findNodeById(menus.value, id))
//     .filter(Boolean) as BaseTreeNode[]
// })
</script>

<template>
  <div v-if="isLoadingMenus" class="flex items-center justify-center min-h-screen">
    <CustomLoader size="lg" />
  </div>
  <DashboardLayout v-else>
    <div class="space-y-4 sm:space-y-6 min-w-0 overflow-x-auto">
      <!-- Breadcrumb -->
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <!-- Card with Header and Content -->
      <Card title="لیست منوها" variant="elevated" padding="none" class="min-w-0">
        <!-- Header -->
        <template #header>
          <div class="py-4 min-[931px]:py-6">
            <div
              class="flex flex-row flex-wrap items-start min-[931px]:items-center justify-between gap-3 min-[931px]:gap-4"
            >
              <BaseButton
                variant="outline"
                @click="handleCreate"
                class="border-2 border-success-500 text-success-600"
              >
                <BaseIcon name="Plus" :size="16" />
                <span class="hidden min-[931px]:inline">ایجاد منو جدید</span>
                <span class="min-[931px]:hidden">ایجاد</span>
              </BaseButton>
            </div>
          </div>
        </template>

        <!-- Content Section -->
        <div
          class="border-t border-border-default py-3 min-[931px]:py-4 min-[931px]:py-6 overflow-x-auto min-w-0"
        >
          <CustomLoader v-if="isLoadingMenus" size="lg" class="mx-auto my-10" />
          <div v-else class="groups-tree-card">
            <BaseTreeSelect
              :nodes="menus"
              v-model="selectedMenu"
              :selected-id="selectedId"
              @select="handleSelect"
              :multi-select="true"
              :show-checkbox="true"
            >
              <template #actions="{ node }">
                <BaseButton size="sm" variant="ghost" @click="handleEditMenu(node)">
                  ویرایش
                </BaseButton>
              </template>
            </BaseTreeSelect>
          </div>
        </div>
        </div>
      </Card>
    </div>

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
