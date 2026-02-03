<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Dropdown, { type DropdownItem } from '../molecules/BaseDropdown.vue'
import BaseIcon from '../atoms/BaseIcon.vue'
import BaseButton from '../atoms/BaseButton.vue'
import Modal from '../molecules/Modal.vue'
import ChangeMyPasswordModal from './ChangeMyPasswordModal.vue'
import { useAuth } from '@/shared/composables/useAuth'
import { useSessionModalStore } from '@/stores/sessionModal'

const router = useRouter()
const { logout } = useAuth()
const sessionModalStore = useSessionModalStore()

const emit = defineEmits<{
  close: []
}>()

const showLogoutModal = ref(false)
const showPasswordModal = ref(false)

const handleMenuItemSelect = (item: DropdownItem) => {
  if (item.value === 'logout') {
    showLogoutModal.value = true
  } else if (item.value === 'change-password') {
    showPasswordModal.value = true
  } else if (item.value === 'sessions') {
    sessionModalStore.openModal()
  } else if (item.href) {
    router.push(item.href)
  }
  emit('close')
}

const confirmLogout = () => {
  logout()
  showLogoutModal.value = false
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

const menuItems: DropdownItem[] = [
  {
    label: 'پروفایل من',
    value: 'profile',
    href: `/profile`,
    iconName: 'User',
  },
  {
    label: 'تنظیمات',
    value: 'settings',
    href: '/settings',
    iconName: 'Settings',
  },
  {
    label: 'تغییر رمز عبور',
    value: 'change-password',
    iconName: 'Lock',
  },
  {
    label: 'جلسات من',
    value: 'sessions',
    iconName: 'Layout',
  },
  {
    label: 'خروج',
    value: 'logout',
    iconName: 'X',
  },
]
</script>

<template>
  <Dropdown :items="menuItems" placement="bottom-end" @select="handleMenuItemSelect">
    <template #trigger="{ isOpen }">
      <slot :is-open="isOpen" />
    </template>
    <template #items="{ items: dropdownItems, select }">
      <button
        v-for="(item, index) in dropdownItems"
        :key="index"
        :disabled="item.disabled"
        :class="[
          'w-full text-right px-4 py-2 text-sm transition-colors flex items-center gap-2',
          item.divider ? 'border-t border-border-default my-1' : '',
          item.disabled
            ? 'opacity-50 cursor-not-allowed'
            : item.value === 'logout'
              ? 'hover:bg-danger-50 text-danger-600'
              : 'hover:bg-secondary text-foreground',
        ]"
        @click="select(item)"
      >
        <BaseIcon
          v-if="item.value == 'logout'"
          :name="item.iconName ?? 'X'"
          href
          icon-class="text-danger-600"
        />
        <BaseIcon v-else :name="item.iconName ?? 'X'" href icon-class="text-muted-foreground" />
        <span>{{ item.label }}</span>
      </button>
    </template>
  </Dropdown>

  <!-- Change password modal (current user: CurrentPassword, NewPassword, ConfirmNewPassword) -->
  <ChangeMyPasswordModal
    v-if="showPasswordModal"
    v-model="showPasswordModal"
    @close="showPasswordModal = false"
  />

  <Modal v-model="showLogoutModal" title="تأیید خروج" size="sm" :close-on-backdrop="false">
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full bg-danger-200 dark:bg-danger-900/30 flex items-center justify-center"
        >
          <BaseIcon name="AlertTriangle" :size="20" class="text-danger-600" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-foreground mb-1">آیا از خروج از سیستم مطمئن هستید؟</p>
          <p class="text-xs text-muted-foreground">پس از خروج، باید دوباره وارد سیستم شوید.</p>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <BaseButton variant="outline" @click="cancelLogout"> انصراف </BaseButton>
        <BaseButton
          variant="default"
          class="bg-danger-600 hover:bg-danger-700 text-white"
          @click="confirmLogout"
        >
          خروج
        </BaseButton>
      </div>
    </template>
  </Modal>
</template>
