/**
 * Icon Registry
 *
 * این فایل تمام آیکون‌های lucide-vue-next را در یک فایل مرکزی import می‌کند
 * تا در هر لایه‌ای از پروژه بتوان بدون خطای import از آیکون‌ها استفاده کرد.
 *
 * Vite tree-shaking به صورت خودکار فقط آیکون‌های استفاده شده را bundle می‌کند.
 */

import * as LucideIcons from 'lucide-vue-next'
import type { Component } from 'vue'

// Filter out non-icon exports (like createLucideIcon, etc.)
const iconKeys = Object.keys(LucideIcons).filter(
  (key) => !key.startsWith('_') && key !== 'createLucideIcon' && typeof (LucideIcons as Record<string, unknown>)[key] === 'function'
)

// Build icon registry - only actual icon components
const iconRegistryMap = new Map<string, Component>()

iconKeys.forEach((key) => {
  const icon = (LucideIcons as Record<string, unknown>)[key]
  if (icon && typeof icon === 'function') {
    iconRegistryMap.set(key, icon as Component)
  }
})

// Default fallback icon - نمایش داده می‌شود در صورت عدم یافتن آیکون
const DEFAULT_ICON = iconRegistryMap.get('HelpCircle') ||
  iconRegistryMap.get('AlertCircle') ||
  iconRegistryMap.get('Circle') ||
  (iconRegistryMap.values().next().value as Component)

// Icon registry - تمام آیکون‌های lucide-vue-next در دسترس هستند
export const iconRegistry: Record<string, Component> = Object.fromEntries(iconRegistryMap) as Record<string, Component>

/**
 * Get icon component by name
 * اگر آیکون پیدا نشد، آیکون default (HelpCircle) را برمی‌گرداند
 *
 * @param iconName - نام آیکون (PascalCase)
 * @returns Component آیکون یا آیکون default
 */
export function getIcon(iconName: string): Component {
  if (!iconName) {
    return DEFAULT_ICON
  }

  const icon = iconRegistry[iconName]
  return icon || DEFAULT_ICON
}

/**
 * Check if an icon exists in registry
 *
 * @param iconName - نام آیکون
 * @returns true اگر آیکون وجود داشته باشد
 */
export function hasIcon(iconName: string): boolean {
  return !!iconRegistry[iconName]
}

/**
 * Get all available icon names
 * Useful for development/debugging
 */
export function getAllIconNames(): string[] {
  return Array.from(iconRegistryMap.keys())
}
