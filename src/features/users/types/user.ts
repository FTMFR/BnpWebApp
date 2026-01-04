export interface User extends Record<string, unknown> {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  status: 'active' | 'inactive' | 'pending'
  role?: string
  createdAt?: string
}

export interface UserFilters {
  username: string
  email: string
  firstName: string
  lastName: string
  status: string
  role: string
  phone: string
}

export interface SelectOption {
  value: string
  label: string
}

