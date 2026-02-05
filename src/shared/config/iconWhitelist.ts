/**
 * Icon Whitelist Configuration
 * 
 * این فایل لیست آیکون‌های مجاز در پروژه را تعریف می‌کند.
 * فقط آیکون‌هایی که در این لیست هستند می‌توانند استفاده شوند.
 * 
 * برای اضافه کردن آیکون جدید:
 * 1. نام آیکون را از https://lucide.dev/icons اضافه کنید
 * 2. نام باید دقیقاً مطابق با نام در lucide-vue-next باشد (PascalCase)
 */

export const ICON_WHITELIST = [
  // Common Icons
  'Home',
  'User',
  'Users',
  'Settings',
  'Search',
  'Menu',
  'X',
  'Check',
  'AlertCircle',
  'Info',
  'Warning',
  'Error',
  
  // Navigation
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'ChevronLeft',
  'ChevronRight',
  'ChevronUp',
  'ChevronDown',
  'ChevronsLeft',
  'ChevronsRight',
  
  // Actions
  'Edit',
  'Trash',
  'Save',
  'Cancel',
  'Delete',
  'Add',
  'Plus',
  'Minus',
  'Close',
  'CheckCircle',
  'XCircle',
  
  // Files & Documents
  'File',
  'FileText',
  'Folder',
  'FolderOpen',
  'Download',
  'Upload',
  'Image',
  'FileImage',
  
  // UI Elements
  'Eye',
  'EyeOff',
  'Lock',
  'Unlock',
  'Shield',
  'ShieldCheck',
  'Key',
  'Bell',
  'BellOff',
  'Star',
  'Heart',
  'Bookmark',
  'Filter',
  'SortAsc',
  'SortDesc',
  
  // Status
  'Circle',
  'CircleOff',
  'CheckCircle2',
  'XCircle',
  'AlertTriangle',
  'Info',
  
  // Communication
  'Mail',
  'MessageSquare',
  'Phone',
  'PhoneOff',
  'Send',
  'Reply',
  
  // Time & Date
  'Calendar',
  'Clock',
  'Timer',
  
  // Media
  'Play',
  'Pause',
  'Stop',
  'SkipForward',
  'SkipBack',
  
  // Business
  'DollarSign',
  'CreditCard',
  'ShoppingCart',
  'Package',
  'Truck',
  
  // Layout
  'Layout',
  'Grid',
  'List',
  'Columns',
  'Rows',
  
  // Other
  'MoreVertical',
  'MoreHorizontal',
  'Ellipsis',
  'Loader',
  'RefreshCw',
  'RotateCw',
  'Zap',
  'Sun',
  'Moon',
  'SunMoon',
] as const

/**
 * Type for whitelisted icon names
 */
export type WhitelistedIconName = typeof ICON_WHITELIST[number]

/**
 * Check if an icon name is in the whitelist
 */
export function isIconWhitelisted(iconName: string): iconName is WhitelistedIconName {
  return ICON_WHITELIST.includes(iconName as WhitelistedIconName)
}

/**
 * Get all whitelisted icon names
 */
export function getWhitelistedIcons(): readonly string[] {
  return ICON_WHITELIST
}

