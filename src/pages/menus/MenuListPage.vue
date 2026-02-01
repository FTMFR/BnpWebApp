<script setup lang="ts">
import { CustomLoader, DashboardLayout } from '@/design-system'
import type { BaseTreeNode } from '@/design-system/molecules/BaseTreeSelect.vue'
import Breadcrumb from '@/design-system/molecules/Breadcrumb.vue'
import Card from '@/design-system/molecules/Card.vue'
import BaseTreeSelect from '@/design-system/molecules/BaseTreeSelect.vue'
import apiClient from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '@/design-system/atoms/BaseIcon.vue'
import BaseButton from '@/design-system/atoms/BaseButton.vue'

const menus = ref<BaseTreeNode[]>([])
const selectedId = ref<string | null>(null)
const isLoadingMenus = ref<boolean>(true)
const selectedMenu = ref<string[]>([])
const router = useRouter()

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
  router.push('/menu/create')
}

const handleSelect = (node: BaseTreeNode) => {
  selectedId.value = node.PublicId
  console.log('Selected node:', node)
}

const handleEditMenu = (node: BaseTreeNode) => {
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
    <div class="space-y-4 sm:space-y-6">
      <!-- Breadcrumb -->
      <div class="hidden sm:block">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <!-- Card with Filters and Table -->
      <Card title="لیست منوها" variant="elevated" padding="none">
        <!-- Header -->
        <template #header>
          <!-- <div class="p-6 pl-0 flex justify-between items-center">
            <BaseButton
              variant="outline"
              @click="handleCreate"
              class="border-success-500 text-success-600"
            >
              <BaseIcon name="Plus" :size="16" />
              <span class="hidden sm:inline">ایجاد منو جدید</span>
            </BaseButton>
          </div> -->
        </template>

        <div class="border-t border-border-default pt-3 sm:pt-4 md:pt-6 overflow-x-auto">
          <CustomLoader v-if="isLoadingMenus" size="lg" class="mx-auto my-10" />

          <BaseTreeSelect
            :nodes="menus"
            v-model="selectedMenu"
            :selected-id="selectedId"
            @select="handleSelect"
            :multiSelect="true"
          >
            <template #actions="{ node }">
              <BaseButton size="sm" variant="ghost" @click="handleEditMenu(node)">
                ویرایش
              </BaseButton>
            </template>
          </BaseTreeSelect>
        </div>
      </Card>
    </div>

    <!-- Access Denied Modal -->
    <!-- <Modal v-model="showAccessDeniedModal" title="عدم دسترسی" size="sm" :close-on-backdrop="true">
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
    </Modal> -->
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
