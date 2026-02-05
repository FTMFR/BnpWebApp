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

export interface ChangePasswordRequest {
  CurrentPassword: string
  NewPassword?: string
}

export interface PasswordPolicyResponse {
  minLength?: number
  MinLength?: number
  maxLength?: number
  MaxLength?: number
  requireUppercase?: boolean
  RequireUppercase?: boolean
  requireLowercase?: boolean
  RequireLowercase?: boolean
  requireDigit?: boolean
  RequireDigit?: boolean
  requireNonAlphanumeric?: boolean
  RequireNonAlphanumeric?: boolean
  requiredUniqueChars?: number
  RequiredUniqueChars?: number
}

export interface MfaStatusResponse {
  enabled?: boolean
  Enabled?: boolean
  isEnabled?: boolean
  IsEnabled?: boolean
}

export interface MfaSetupResponse {
  recoveryCodes?: string[]
  RecoveryCodes?: string[]
  qrCodeImage?: string
  QrCodeImage?: string
  qrCodeImageUrl?: string
  QrCodeImageUrl?: string
  manualEntryKey?: string
  ManualEntryKey?: string
  sharedKey?: string
  SharedKey?: string
}

export interface MfaResponse {
  success?: boolean
  Success?: boolean
  message?: string
  Message?: string
}


