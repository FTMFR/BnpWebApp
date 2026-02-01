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


