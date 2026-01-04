import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { CommandItem } from '@/design-system/organisms/CommandPalette.vue'
import { useMenu } from './useMenu'

export function useGlobalSearch() {
  const router = useRouter()
  const { menuItems } = useMenu()

  const menuCommandItems = computed<CommandItem[]>(() => {
    const flattenMenu = (items: typeof menuItems.value): CommandItem[] => {
      const result: CommandItem[] = []

      items.forEach((item) => {
        if (item.href) {
          result.push({
            id: item.id,
            label: item.label,
            description: `رفتن به ${item.label}`,
            keywords: [item.label.toLowerCase()],
            action: () => {
              if (item.href) {
                router.push(item.href)
              }
            },
          })
        }

        if (item.children) {
          result.push(...flattenMenu(item.children))
        }
      })

      return result
    }

    return flattenMenu(menuItems.value)
  })

  const additionalItems: CommandItem[] = [
    {
      id: 'change-password',
      label: 'تغییر رمز عبور',
      description: 'تغییر رمز عبور کاربر',
      keywords: ['password', 'رمز', 'change password'],
      action: () => {
        router.push('/change-password')
      },
    },
    {
      id: 'profile',
      label: 'پروفایل من',
      description: 'مشاهده و ویرایش پروفایل کاربری',
      keywords: ['profile', 'پروفایل', 'account'],
      action: () => {
        router.push('/profile')
      },
    },
  ]

  const searchItems = computed<CommandItem[]>(() => {
    return [...menuCommandItems.value, ...additionalItems]
  })

  return {
    searchItems,
  }
}
