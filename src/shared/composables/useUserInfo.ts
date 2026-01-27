import { computed } from 'vue'
import { useAuth } from './useAuth'
import type { AuthUser } from '@/stores/auth'

export interface UserInfo {
  firstName: string
  lastName: string
  email?: string
  avatar?: string
  avatarName?: string
  userName: string
  mobileNumber: string
  phone?: string
}

// Get the first letter of the last name (or first name if last name doesn't exist)
// to use as an avatar initial
const getAvatarInitial = (firstName: string, lastName: string | null | undefined): string => {
  if (lastName && lastName.trim()) {
    return lastName.trim().charAt(0).toUpperCase()
  }
  if (firstName && firstName.trim()) {
    return firstName.trim().charAt(0).toUpperCase()
  }
  return '?'
}

export function useUserInfo() {
  const { user } = useAuth();


  const userInfo = computed<UserInfo>(() => {
    const currentUser = user.value as AuthUser | null
    if (!currentUser) {
      return {
        firstName: 'کاربر',
        lastName: 'سیستم',
        email: '',
        avatarName: 'ک',
        userName: '',
        mobileNumber: '',
        phone: ''
      }
    }

    const avatarInitial = getAvatarInitial(currentUser.FirstName, currentUser.LastName)

    return {
      firstName: currentUser.FirstName,
      lastName: currentUser.LastName || '',
      email: currentUser.Email || '',
      avatarName: avatarInitial,
      userName: currentUser.UserName,
      phone: currentUser.Phone || '',
      mobileNumber: currentUser.MobileNumber,
    }
  })

  return {
    userInfo,
  }
}

