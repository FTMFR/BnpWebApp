<script setup lang="ts">
import type { GroupAccessMenu, GroupAccessPermission } from '@/shared/api/types'

const props = withDefaults(
  defineProps<{
    menus: GroupAccessMenu[]
    level?: number
    /** Direct parent menu (closest parent in tree). */
    parentMenu?: GroupAccessMenu | null
    /** All ancestor menus from root to direct parent (root first). When toggling a child, all ancestors are updated too. */
    ancestorMenus?: GroupAccessMenu[]
    /** When true, menu row shows a checkbox (toggles HasAccess). When false, only permission rows (MenuTitle + toggle). */
    showMenuCheckbox?: boolean
  }>(),
  { showMenuCheckbox: false, parentMenu: null, ancestorMenus: () => [] },
)

const emit = defineEmits<{
  menuAccess: [menu: GroupAccessMenu, hasAccess: boolean, ancestorMenus: GroupAccessMenu[]]
  permissionAccess: [
    permission: GroupAccessPermission,
    hasAccess: boolean,
    ancestorMenusIncludingParent: GroupAccessMenu[],
  ]
}>()

function onMenuToggle(menu: GroupAccessMenu) {
  const ancestors = props.ancestorMenus ?? []
  emit('menuAccess', menu, !menu.HasAccess, ancestors)
}

function onMenuCheckboxChange(menu: GroupAccessMenu, event: Event) {
  const target = event.target as HTMLInputElement
  const ancestors = props.ancestorMenus ?? []
  emit('menuAccess', menu, target.checked, ancestors)
}

function onPermissionToggle(permission: GroupAccessPermission, parentMenu: GroupAccessMenu) {
  const newHasAccess = !permission.HasAccess
  // Ancestors for this permission: path from root + direct parent menu (so parent gets updated when child toggles)
  const ancestorMenusIncludingParent = [...(props.ancestorMenus ?? []), parentMenu]
  emit('permissionAccess', permission, newHasAccess, ancestorMenusIncludingParent)
}
</script>

<template>
  <ul
    class="access-tree list-none p-0 m-0"
    :class="level === 0 ? 'space-y-0' : 'mt-3'"
    :style="level !== undefined ? { paddingRight: `${level * 1.5}rem` } : {}"
  >
    <li
      v-for="menu in menus"
      :key="menu.MenuId"
      class="access-tree-menu border-b border-border-default pb-4 mb-4 last:mb-0 last:pb-0 last:border-b-0"
    >
      <!-- Menu row: label first, toggle on left (RTL: last in row). One row per menu. -->
      <div
        class="access-row flex items-center gap-3 py-2 min-w-0"
        :class="showMenuCheckbox ? 'py-1.5' : ''"
      >
        <span
          class="font-medium flex-1 min-w-0 truncate text-right"
          :class="menu.HasAccess ? 'text-foreground' : 'text-muted-foreground'"
        >
          {{ menu.MenuTitle }}
        </span>
        <span
          v-if="menu.IsMenu"
          class="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded flex-shrink-0"
        >
          منو
        </span>
        <template v-if="showMenuCheckbox">
          <input
            type="checkbox"
            :checked="menu.HasAccess"
            class="rounded border-border-default text-primary-600 focus:ring-primary-500 h-4 w-4 flex-shrink-0"
            :aria-label="`دسترسی منو: ${menu.MenuTitle}`"
            @change="onMenuCheckboxChange(menu, $event)"
          />
        </template>
        <template v-else>
          <button
            type="button"
            role="switch"
            :aria-checked="menu.HasAccess"
            :aria-label="`دسترسی منو: ${menu.MenuTitle}`"
            class="access-toggle flex-shrink-0 relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            :class="menu.HasAccess ? 'bg-primary-500' : 'bg-muted dark:bg-muted/60'"
            @click="onMenuToggle(menu)"
          >
            <span
              class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
              :class="menu.HasAccess ? 'end-1' : 'start-1'"
            />
          </button>
        </template>
      </div>

      <!-- One row per permission: label (permission name), toggle on left; slight indent under menu. -->
      <div
        v-for="perm in menu.Permissions"
        :key="perm.PermissionId"
        class="access-row flex items-center gap-3 py-2 pr-4 min-w-0"
      ></div>

      <!-- Children (recursive): pass ancestors (root → current) and current menu as parent -->
      <GroupAccessTreeNodes
        v-if="menu.Children?.length"
        :menus="menu.Children"
        :level="(level ?? 0) + 1"
        :parent-menu="menu"
        :ancestor-menus="[props.ancestorMenus ?? [], menu].flat()"
        :show-menu-checkbox="showMenuCheckbox"
        @menu-access="(m, h, a) => $emit('menuAccess', m, h, a)"
        @permission-access="(p, h, a) => $emit('permissionAccess', p, h, a)"
      />
    </li>
  </ul>
</template>

<style scoped>
.access-tree-menu:not(:last-child) {
  border-color: var(--border-default, #e5e7eb);
}
.dark .access-tree-menu:not(:last-child) {
  border-color: rgba(255, 255, 255, 0.12);
}
</style>
