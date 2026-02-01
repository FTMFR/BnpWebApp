<script setup lang="ts">
import { h, ref, computed, watch, useSlots } from 'vue'
import BaseIcon from '@/design-system/atoms/BaseIcon.vue'

export interface BaseTreeNode {
  PublicId: string
  Title: string
  Icon?: string
  Children?: BaseTreeNode[]
}

const props = defineProps<{
  nodes: BaseTreeNode[]
  selectedId?: string | null
  level?: number
  showIcon?: boolean
  search?: string
  modelValue: string | string[]
  multiSelect?: boolean
  showEdit?: boolean
  showDelete?: boolean
}>()

const emit = defineEmits<{
  select: [node: BaseTreeNode]
  'update:modelValue': [value: string | string[]]
  edit: [node: BaseTreeNode]
  delete: [node: BaseTreeNode]
}>()

const rootLevel = props.level ?? 0
const collapsedMap = ref<Record<string, boolean>>({})
const searchQuery = ref<string>('')
const localSelectedIds = ref<(string | true | undefined)[]>([])

watch(
  () => [props.modelValue, props.multiSelect],
  ([newValue, multiSelect]) => {
    if (multiSelect) {
      localSelectedIds.value = Array.isArray(newValue) ? newValue : newValue ? [newValue] : []
      return
    }

    if (Array.isArray(newValue)) {
      localSelectedIds.value = newValue.length ? [newValue[0]] : []
      return
    }

    localSelectedIds.value = newValue ? [newValue as string] : []
  },
  { immediate: true },
)

const isSearching = () => !!searchQuery.value.trim()
const slots = useSlots()

const isCollapsed = (id: string, level: number) => {
  if (isSearching()) return false
  if (collapsedMap.value[id] === undefined) {
    return level <= 1
  }
  return collapsedMap.value[id]
}

const toggleCollapse = (id: string, level: number) => {
  collapsedMap.value[id] = !isCollapsed(id, level)
}

const getAllChildIds = (node: BaseTreeNode): string[] => {
  const ids: string[] = []
  if (node.Children && node.Children.length > 0) {
    for (const child of node.Children) {
      ids.push(child.PublicId)
      ids.push(...getAllChildIds(child))
    }
  }
  return ids
}

const handleNodeClick = (node: BaseTreeNode) => {
  emit('select', node)

  if (props.multiSelect) {
    const index = localSelectedIds.value.indexOf(node.PublicId)
    if (index === -1) {
      localSelectedIds.value.push(node.PublicId)

      if (node.Children && node.Children.length > 0) {
        const childIds = getAllChildIds(node)
        for (const childId of childIds) {
          if (!localSelectedIds.value.includes(childId)) {
            localSelectedIds.value.push(childId)
          }
        }
      }
    } else {
      localSelectedIds.value.splice(index, 1)
      if (node.Children && node.Children.length > 0) {
        const childIds = new Set(getAllChildIds(node))
        localSelectedIds.value = localSelectedIds.value.filter(
          (id) => typeof id === 'string' && !childIds.has(id),
        )
      }
    }
    emit(
      'update:modelValue',
      localSelectedIds.value.filter((id): id is string => typeof id === 'string'),
    )
  } else {
    // Single select mode
    localSelectedIds.value = [node.PublicId]
    emit('update:modelValue', node.PublicId)
  }
}

const removeSelected = (id: string, event: Event) => {
  event.stopPropagation()
  const index = localSelectedIds.value.indexOf(id)
  if (index !== -1) {
    localSelectedIds.value.splice(index, 1)
    emit(
      'update:modelValue',
      localSelectedIds.value.filter((id): id is string => typeof id === 'string'),
    )
  }
}

const clearAllSelected = () => {
  localSelectedIds.value = []
  emit('update:modelValue', [])
}

const selectedNodes = computed(() => {
  const findNode = (nodes: BaseTreeNode[], id: string): BaseTreeNode | null => {
    for (const node of nodes) {
      if (node.PublicId === id) return node
      if (node.Children) {
        const found = findNode(node.Children, id)
        if (found) return found
      }
    }
    return null
  }

  return localSelectedIds.value
    .filter((id): id is string => typeof id === 'string')
    .map((id) => findNode(props.nodes, id))
    .filter(Boolean) as BaseTreeNode[]
})

const TreeNode = (
  { node, level = 0, visitedIds = new Set<string>() }: { node: BaseTreeNode; level?: number; visitedIds?: Set<string> },
) => {
  if (visitedIds.has(node.PublicId)) {
    return null
  }
  const nextVisited = new Set(visitedIds).add(node.PublicId)

  const hasChildren = !!node.Children?.length
  const isSelected = localSelectedIds.value.includes(node.PublicId)

  const collapsible = hasChildren && level <= 1
  const collapsed = collapsible && isCollapsed(node.PublicId, level)

  const safeChildren =
    hasChildren && !collapsed
      ? node.Children!.filter((child) => !nextVisited.has(child.PublicId))
      : []

  return h(
    'div',
    {
      class: ['tree-node', collapsed && 'collapsed'],
      style: { paddingRight: `${level * 1.5}rem` },
    },
    [
      h(
        'div',
        {
          class: [
            'tree-row flex items-center justify-between py-3 px-2 transition-colors group',
            isSelected ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-primary-50',
          ],
          onClick: () => handleNodeClick(node),
        },
        [
          h('div', { class: 'flex items-center gap-2' }, [
            collapsible &&
              h(
                'button',
                {
                  class:
                    'tree-toggle flex items-center justify-center w-5 h-5 text-gray-700 font-bold text-lg leading-none hover:text-primary-600',
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    e.preventDefault()
                    toggleCollapse(node.PublicId, level)
                  },
                },
                collapsed ? '+' : '–',
              ),

            h('input', {
              type: 'checkbox',
              checked: isSelected,
              class: 'form-checkbox h-3 w-3 text-primary-600',
              onClick: (e: Event) => {
                e.stopPropagation()
              },
              onChange: () => handleNodeClick(node),
            }),

            !collapsible && level <= 1 && h('span', { class: 'w-5 h-5' }),

            props.showIcon !== false &&
              h(BaseIcon, {
                name: node.Icon || (hasChildren ? 'Folder' : 'File'),
                size: 18,
                class: hasChildren ? 'text-primary-500' : 'text-gray-400',
              }),

            h('span', { class: 'font-medium', innerHTML: highlight(node.Title) }, node.Title),
          ]),

          h(
            'div',
            {
              class: 'flex gap-2 opacity-0 group-hover:opacity-100',
              onClick: (e: Event) => e.stopPropagation(),
            },
            [slots.actions?.({ node })],
          ),
        ],
      ),

      safeChildren.length > 0 &&
        h(
          'div',
          { class: 'tree-children' },
          safeChildren.map((child) =>
            h(
              'div',
              { class: 'tree-child' },
              h(TreeNode, {
                node: child,
                level: level + 1,
                visitedIds: nextVisited,
              }),
            ),
          ),
        ),
    ],
  )
}

const filterTree = (nodes: BaseTreeNode[], search: string): BaseTreeNode[] => {
  if (!search) return nodes

  const term = search.toLowerCase()
  const visited = new Set<string>()

  const walk = (node: BaseTreeNode): BaseTreeNode | null => {
    if (visited.has(node.PublicId)) return null
    visited.add(node.PublicId)

    const isMatch = node.Title.toLowerCase().includes(term)

    const children = node.Children?.map(walk).filter(Boolean) as BaseTreeNode[] | undefined

    if (isMatch || (children && children.length)) {
      return {
        ...node,
        Children: children,
      }
    }

    return null
  }

  return nodes.map(walk).filter(Boolean) as BaseTreeNode[]
}

const highlight = (text: string) => {
  if (!searchQuery.value) return text

  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}
</script>

<template>
  <div class="tree-select w-full">
    <div class="tree-search-wrapper w-full mb-3">
      <div
        class="tree-search-input w-full flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 w-full rounded-md border px-2 py-2 text-sm focus-within:ring-2 focus-within:ring-primary-500 dark:bg-gray-900 dark:border-gray-700"
      >
        <!-- Selected tags display -->
        <template v-if="multiSelect && selectedNodes.length > 0">
          <div
            v-for="node in selectedNodes"
            :key="node.PublicId"
            class="selected-tag inline-flex items-center gap-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 px-3 py-1 rounded-full text-sm w-full sm:w-auto sm:shrink-0"
          >
            <span class="truncate max-w-full">{{ node.Title }}</span>
            <button
              @click="removeSelected(node.PublicId, $event)"
              class="remove-tag-btn text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100 ml-1"
              type="button"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </template>

        <input
          type="text"
          v-model="searchQuery"
          placeholder="جستجو ..."
          class="tree-search sm:flex-1 bg-transparent px-1 py-1 text-sm focus:outline-none"
        />
      </div>

      <button
        v-if="multiSelect && selectedNodes.length > 1"
        @click="clearAllSelected"
        class="clear-all-btn mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        type="button"
      >
        پاک کردن همه
      </button>
    </div>
  </div>

  <div class="tree-root">
    <TreeNode
      v-for="node in filterTree(nodes, searchQuery)"
      :key="node.PublicId"
      :node="node"
      :level="rootLevel"
    />
  </div>
</template>

<style>
mark {
  background-color: #fde68a;
  padding: 0 2px;
  border-radius: 2px;
}

.dark mark {
  background-color: #92400e;
  color: #fff;
}

.tree-search::placeholder {
  color: #9ca3af;
}

.dark .tree-search {
  background-color: #0b1014;
  color: #e5e7eb;
}

.dark .tree-search::placeholder {
  color: #6b7280;
}

.tree-toggle {
  border-radius: 4px;
  background-color: #f1f5f9;
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;
}

.tree-toggle:hover {
  background-color: #e2e8f0;
  transform: scale(1.05);
}

.tree-node {
  position: relative;
}

.tree-node::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0.75rem;
  width: 1px;
  height: 100%;
  background-color: #e5e7eb;
}

.tree-root > .tree-node::before {
  display: none;
}

.tree-row {
  position: relative;
  border-bottom: 1px dotted #c0c0c0;
  border-radius: 6px;
}

.tree-row {
  background-color: #f8fafc;
  margin-bottom: 5px;
}

.tree-row.bg-primary-100 {
  background-color: #eef2ff;
  border-right: 3px solid #6366f1;
}

.tree-row::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 0.75rem;
  width: 1rem;
  height: 1px;
}

.tree-children {
  margin-right: 1.5rem;
  overflow: hidden;
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
}

.tree-node > .tree-children {
  opacity: 1;
}

.tree-node.collapsed > .tree-children {
  max-height: 0;
  opacity: 0;
}

.tree-child:last-child > .tree-node::before {
  height: 50%;
}

/* Selected tags styling */
.selected-tags-container {
  margin-top: 0.5rem;
}

.selected-tag {
  transition: all 0.2s ease;
}

.selected-tag:hover {
  background-color: #e0e7ff;
}

.dark .selected-tag:hover {
  background-color: #1e293b;
}

.remove-tag-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.remove-tag-btn:hover {
  opacity: 1;
}

.clear-all-btn {
  transition: color 0.2s ease;
}

/* Dark mode styles */
.dark .tree-row {
  background-color: #0b1014;
  border-bottom: 1px dotted #334155;
}

.dark .tree-row:hover {
  background-color: #121820;
}

.dark .tree-row.bg-primary-100 {
  background-color: #1c2330;
  border-right: 3px solid #6366f1;
}

.dark .tree-toggle {
  background-color: #111827;
  color: #e5e7eb;
}

.dark .tree-toggle:hover {
  background-color: #0f1520;
}

.dark .tree-node.collapsed > .tree-children {
  opacity: 0;
}

.dark .tree-row .font-medium {
  color: #e5e7eb;
}

.dark .tree-row .text-gray-400 {
  color: #9ca3af;
}

.dark .tree-row .text-primary-500 {
  color: #818cf8;
}

.dark .tree-row.bg-primary-100:hover {
  background-color: #222a38;
}

.tree-select {
  max-width: 100%;
}

.tree-search-wrapper,
.tree-search-input {
  min-width: 0;
}

.dark .tree-search {
  background-color: transparent;
  color: #e5e7eb;
}
</style>
