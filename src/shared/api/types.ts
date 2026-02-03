export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  error?: string;
  denialCode?: string;
  success?: boolean
}

export interface ApiMenuItem {
  PublicId: string;
  Title: string;
  Path: string | null;
  Icon: string | null;
  ParentPublicId: string | null;
  IsMenu: boolean;
  ZamanInsert: string | null;
  Children: ApiMenuItem[];
}

export interface Group {
  PublicId: string
  Title: string
  GrpCode: number
  ZamanInsert: string
  ZamanLastEdit: string | null
}

export interface CreateUserRequest {
  userName: string
  password: string
  firstName: string
  lastName: string
  email?: string
  phone?: string | undefined
  mobileNumber: string
  userCode?: string
  grpPublicId: string
  IpAddress: string
}

export interface ResetUserPassRequest {
  NewPassword: string,
  MustChangePassword?: boolean
}

/** Request body for current user changing their own password (Auth/change-password). */
export interface ChangeMyPasswordRequest {
  CurrentPassword: string
  NewPassword: string
  ConfirmNewPassword: string
}

export interface CreateUserResponse {
  success: boolean
  message?: string
}

export interface CreateGroupRequest {
  Title: string
  ParentPublicId: string
  Description: string
}

export interface CreateMenuRequest {
  Title: string
  Path: string
  ParentPublicId?: string
}

export interface Session {
  PublicId: string;
  UserAgent: string;
  IsCurrentSession: boolean;
  CreatedAt: string
}

export interface MySessionsResponse {
  sessions: Session[]
  isMaxSessionsReached: boolean
  MaxAllowedSessions: number
  CurrentSessionCount: number
  totalCount: number
  maxConcurrentSessions: number
}

// ============================================
// Group Access Tree (Permission/group/{id}/access-tree)
// ============================================

export interface GroupAccessPermission {
  PermissionId: number
  PermissionName: string
  Resource: string
  Action: string
  HasAccess: boolean
}

export interface GroupAccessMenu {
  MenuId: number
  MenuTitle: string
  MenuPath: string
  IsMenu: boolean
  HasAccess: boolean
  Permissions: GroupAccessPermission[]
  Children: GroupAccessMenu[]
}

export interface GroupAccessTreeResponse {
  GroupId: number
  GroupTitle: string
  Menus: GroupAccessMenu[]
}


