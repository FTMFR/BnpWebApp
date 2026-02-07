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

/** GET /api/Auth/password-policy response. Backend may return PascalCase or camelCase. */
export interface PasswordPolicyResponseDto {
  MinimumLength?: number
  MaximumLength?: number
  RequireUppercase?: boolean
  RequireLowercase?: boolean
  RequireDigit?: boolean
  RequireSpecialCharacter?: boolean
  SpecialCharacters?: string
  // camelCase variants (normalize in UI)
  minimumLength?: number
  maximumLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireDigit?: boolean
  requireSpecialCharacter?: boolean
  specialCharacters?: string
}

/** POST /api/Auth/mfa/verify request. Backend may expect Otp/OtpCode, CaptchaId, CaptchaValue/CaptchaCode. */
export interface MfaVerifyRequestDto {
  MfaToken: string
  Otp?: string
  OtpCode?: string
  Code?: string
  CaptchaId: string
  CaptchaValue?: string
  CaptchaCode?: string
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

// ============================================
// Version APIs (GET /api/Version/*, signature, health)
// ============================================

/** GET /api/Version/current response (backend may return different shape). */
export interface VersionCurrentResponse {
  version?: string
  Version?: string
}

/** GET /api/Version/check response. */
export interface VersionCheckResponse {
  isCurrent?: boolean
  isUpToDate?: boolean
  currentVersion?: string
  checkVersion?: string
  buildDate?: string | null
  buildNumber?: string | null
  environment?: string
  message?: string
  Message?: string
}

/** GET /api/Version/signature/status response. */
export interface SignatureStatusResponse {
  status?: string
  Status?: string
  message?: string
  Message?: string
  enabled?: boolean
  Enabled?: boolean
}

/** GET /api/Version/signature/public-key-info response. */
export interface PublicKeyInfoResponse {
  algorithm?: string
  Algorithm?: string
  thumbprint?: string
  Thumbprint?: string
  publicKey?: string
  PublicKey?: string
  [key: string]: unknown
}

/** POST /api/Version/signature/verify, verify-metadata, compute-hash request bodies (align with backend DTOs). */
export type SignatureVerificationRequest = Record<string, unknown>
export type MetadataSignatureRequest = Record<string, unknown>
export type ComputeHashRequest = Record<string, unknown>

/** 400 Bad Request response body (OpenAPI ProblemDetails). */
export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  [key: string]: unknown
}

