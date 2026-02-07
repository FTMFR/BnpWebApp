const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Health is at root (e.g. /health). Use VITE_HEALTH_BASE_URL or derive from API base (strip /api).
const HEALTH_BASE =
  import.meta.env.VITE_HEALTH_BASE_URL ||
  (typeof API_BASE_URL === 'string' && API_BASE_URL.replace(/\/api\/?$/, '')) ||
  '';

export const endpoints = {
  // ============================================
  // Authentication & Authorization
  // ============================================
  auth: {
    // Login & Logout
    login: `${API_BASE_URL}/Auth/login`,
    logout: `${API_BASE_URL}/Auth/logout`,
    logoutAll: `${API_BASE_URL}/Auth/logout-all`,
    refresh: `${API_BASE_URL}/Auth/refresh`,

    // Password Management
    changePassword: `${API_BASE_URL}/Auth/change-password`,
    passwordPolicy: `${API_BASE_URL}/Auth/password-policy`,
    validatePassword: `${API_BASE_URL}/Auth/validate-password`,
    forgotPassword: `${API_BASE_URL}/Auth/forgot-password`,

    // Multi-Factor Authentication (MFA)
    mfa: {
      enable: `${API_BASE_URL}/Auth/mfa/enable`,
      disable: `${API_BASE_URL}/Auth/mfa/disable`,
      status: `${API_BASE_URL}/Auth/mfa/status`,
      verify: `${API_BASE_URL}/Auth/mfa/verify`,
      resendOtp: `${API_BASE_URL}/Auth/mfa/resend-otp`,
      regenerateRecoveryCodes: `${API_BASE_URL}/Auth/mfa/regenerate-recovery-codes`,
    },

    // Captcha
    captcha: `${API_BASE_URL}/Auth/captcha`,
  },

  // ============================================
  // Data Export
  // ============================================
  dataExport: {
    settings: `${API_BASE_URL}/DataExport/settings`,
    rules: `${API_BASE_URL}/DataExport/rules`,
    ruleById: (id: string) => `${API_BASE_URL}/DataExport/rules/${id}`,
    masking: `${API_BASE_URL}/DataExport/masking`,
    maskingById: (id: string) => `${API_BASE_URL}/DataExport/masking/${id}`,
    sensitivityLevels: `${API_BASE_URL}/DataExport/sensitivity-levels`,
    sensitivityLevelByEntity: (entityType: string, entityId: string) =>
      `${API_BASE_URL}/DataExport/sensitivity-levels/${entityType}/${entityId}`,
    auditLog: `${API_BASE_URL}/DataExport/audit-log`,
    statistics: `${API_BASE_URL}/DataExport/statistics`,
    test: `${API_BASE_URL}/DataExport/test`,
  },

  // ============================================
  // Audit Log
  // ============================================
  auditLog: {
    // Main endpoints
    list: `${API_BASE_URL}/AuditLog`,
    byId: (id: number) => `${API_BASE_URL}/AuditLog/${id}`,
    byUser: (username: string) => `${API_BASE_URL}/AuditLog/user/${username}`,

    // Filtered endpoints
    failedLogins: `${API_BASE_URL}/AuditLog/failed-logins`,
    today: `${API_BASE_URL}/AuditLog/today`,
    search: `${API_BASE_URL}/AuditLog/search`,

    // Metadata
    eventTypes: `${API_BASE_URL}/AuditLog/event-types`,
    statistics: `${API_BASE_URL}/AuditLog/statistics`,
  },

  // ============================================
  // Groups (Grp)
  // ============================================
  groups: {
    list: `${API_BASE_URL}/Grp`,
    create: `${API_BASE_URL}/Grp`,
    byId: (publicId: string) => `${API_BASE_URL}/Grp/${publicId}`,
    update: (publicId: string) => `${API_BASE_URL}/Grp/${publicId}`,
    delete: (publicId: string) => `${API_BASE_URL}/Grp/${publicId}`,
  },

  // ============================================
  // Key Management
  // ============================================
  keyManagement: {
    statistics: `${API_BASE_URL}/KeyManagement/statistics`,
    byPurpose: (purpose: string) => `${API_BASE_URL}/KeyManagement/by-purpose/${purpose}`,
    create: `${API_BASE_URL}/KeyManagement/create`,
    rotate: (purpose: string) => `${API_BASE_URL}/KeyManagement/rotate/${purpose}`,
    needsRotation: (purpose: string) => `${API_BASE_URL}/KeyManagement/needs-rotation/${purpose}`,
    deactivate: (keyId: string) => `${API_BASE_URL}/KeyManagement/deactivate/${keyId}`,
    destroy: (keyId: string) => `${API_BASE_URL}/KeyManagement/destroy/${keyId}`,
    destroyExpired: `${API_BASE_URL}/KeyManagement/destroy-expired`,
    validateStrength: `${API_BASE_URL}/KeyManagement/validate-strength`,
  },

  // ============================================
  // Menu Management
  // ============================================
  menu: {
    list: `${API_BASE_URL}/Menu`,
    create: `${API_BASE_URL}/Menu`,
    myTree: `${API_BASE_URL}/Menu/my-tree`,
    byId: (publicId: string) => `${API_BASE_URL}/Menu/${publicId}`,
    update: (publicId: string) => `${API_BASE_URL}/Menu/${publicId}`,
    delete: (publicId: string) => `${API_BASE_URL}/Menu/${publicId}`,
    debug: `${API_BASE_URL}/Menu/debug`,
  },

  // ============================================
  // Permissions
  // ============================================
  permissions: {
    // General permissions
    list: `${API_BASE_URL}/Permission`,
    byResource: `${API_BASE_URL}/Permission/by-resource`,
    resources: `${API_BASE_URL}/Permission/resources`,
    check: (permission: string) => `${API_BASE_URL}/Permission/check/${permission}`,

    // User permissions
    myPermissions: `${API_BASE_URL}/Permission/my-permissions`,
    myMenus: `${API_BASE_URL}/Permission/my-menus`,

    // Group permissions
    byGroup: (groupId: number) => `${API_BASE_URL}/Permission/group/${groupId}`,
    grant: `${API_BASE_URL}/Permission/grant`,
    grantBulk: `${API_BASE_URL}/Permission/grant-bulk`,
    revoke: `${API_BASE_URL}/Permission/revoke`,

    // Group access tree
    groupAccessTree: (groupId: number) => `${API_BASE_URL}/Permission/group/${groupId}/access-tree`,
    updateGroupAccess: (groupId: number) => `${API_BASE_URL}/Permission/group/${groupId}/update-access`,

    // Menu permissions
    byMenu: (menuId: number) => `${API_BASE_URL}/Permission/menu/${menuId}`,
    checkMenu: (menuId: number) => `${API_BASE_URL}/Permission/check-menu/${menuId}`,
    assignMenu: `${API_BASE_URL}/Permission/menu/assign`,
    assignMenuBulk: `${API_BASE_URL}/Permission/menu/assign-bulk`,
    removeMenu: `${API_BASE_URL}/Permission/menu/remove`,
  },

  // ============================================
  // Security
  // ============================================
  security: {
    settings: `${API_BASE_URL}/Security/settings`,
    passwordPolicy: `${API_BASE_URL}/Security/password-policy`,
    lockoutPolicy: `${API_BASE_URL}/Security/lockout-policy`,
    usersSecurityStatus: `${API_BASE_URL}/Security/users-security-status`,
    userSecurityStatus: (userId: number) => `${API_BASE_URL}/Security/user-security-status/${userId}`,
    terminateSessions: (userId: number) => `${API_BASE_URL}/Security/terminate-sessions/${userId}`,
    healthCheck: `${API_BASE_URL}/Security/health-check`,
    environmentInfo: `${API_BASE_URL}/Security/environment-info`,
    verifyDataIntegrity: `${API_BASE_URL}/Security/verify-data-integrity`,
    computeIntegrityHash: `${API_BASE_URL}/Security/compute-integrity-hash`,
    generateIntegrityKey: `${API_BASE_URL}/Security/generate-integrity-key`,
    failSecureStatus: `${API_BASE_URL}/Security/fail-secure/status`,
    contextAccessSettings: `${API_BASE_URL}/Security/context-access/settings`,
    contextAccessRiskScore: `${API_BASE_URL}/Security/context-access/risk-score`,
  },

  // ============================================
  // Security Settings
  // ============================================
  securitySettings: {
    // Account Lockout
    accountLockout: `${API_BASE_URL}/SecuritySettings/account-lockout`,
    updateAccountLockout: `${API_BASE_URL}/SecuritySettings/account-lockout`,

    // Password Policy
    passwordPolicy: `${API_BASE_URL}/SecuritySettings/password-policy`,
    updatePasswordPolicy: `${API_BASE_URL}/SecuritySettings/password-policy`,

    // Captcha
    captcha: `${API_BASE_URL}/SecuritySettings/captcha`,
    updateCaptcha: `${API_BASE_URL}/SecuritySettings/captcha`,

    // MFA
    mfa: `${API_BASE_URL}/SecuritySettings/mfa`,
    updateMfa: `${API_BASE_URL}/SecuritySettings/mfa`,

    // Cache
    invalidateCache: `${API_BASE_URL}/SecuritySettings/invalidate-cache`,
  },

  // ============================================
  // Shobe (Branches)
  // ============================================
  shobe: {
    list: `${API_BASE_URL}/Shobe`,
    create: `${API_BASE_URL}/Shobe`,
    byId: (publicId: string) => `${API_BASE_URL}/Shobe/${publicId}`,
    update: (publicId: string) => `${API_BASE_URL}/Shobe/${publicId}`,
    delete: (publicId: string) => `${API_BASE_URL}/Shobe/${publicId}`,
    settings: {
      list: `${API_BASE_URL}/Shobe/Settings`,
      create: `${API_BASE_URL}/Shobe/Settings`,
      byId: (publicId: string) => `${API_BASE_URL}/Shobe/Settings/${publicId}`,
      update: (publicId: string) => `${API_BASE_URL}/Shobe/Settings/${publicId}`,
      delete: (publicId: string) => `${API_BASE_URL}/Shobe/Settings/${publicId}`,
    },
  },

  // ============================================
  // Seed (Development)
  // ============================================
  seed: {
    all: `${API_BASE_URL}/Seed/all`,
    reseedMenuPermissions: `${API_BASE_URL}/Seed/reseed-menu-permissions`,
  },

  // ============================================
  // Session Management
  // ============================================
  session: {
    mySessions: `${API_BASE_URL}/Session/MySessions`,
    revokeSession: (sessionPublicId: string) => `${API_BASE_URL}/Session/RevokeSession/${sessionPublicId}`,
    revokeAllOtherSessions: `${API_BASE_URL}/Session/RevokeAllOtherSessions`,
    activeCount: `${API_BASE_URL}/Session/ActiveCount`,
  },

  // ============================================
  // Users Management
  // ============================================
  users: {
    list: `${API_BASE_URL}/Users`,
    create: `${API_BASE_URL}/Users`,
    byId: (publicId: string) => `${API_BASE_URL}/Users/${publicId}`,
    update: (publicId: string) => `${API_BASE_URL}/Users/${publicId}`,
    delete: (publicId: string) => `${API_BASE_URL}/Users/${publicId}`,
    export: `${API_BASE_URL}/Users/export`,

    // User actions
    activate: (publicId: string) => `${API_BASE_URL}/Users/${publicId}/activate`,
    deactivate: (publicId: string) => `${API_BASE_URL}/Users/${publicId}/deactivate`,
    unlock: (publicId: string) => `${API_BASE_URL}/Users/${publicId}/unlock`,
    lockoutStatus: (publicId: string) => `${API_BASE_URL}/Users/${publicId}/lockout-status`,
    resetPassword: (publicId: string) => `${API_BASE_URL}/Users/${publicId}/reset-password`,
    forcePasswordChange: (publicId: string) => `${API_BASE_URL}/Users/${publicId}/force-password-change`,
  },

  // ============================================
  // Health (root path; may use different base than /api)
  // ============================================
  health: HEALTH_BASE ? `${HEALTH_BASE}/health` : '/health',

  // ============================================
  // Version
  // ============================================
  version: {
    info: `${API_BASE_URL}/Version/info`,
    current: `${API_BASE_URL}/Version/current`,
    check: (checkVersion: string) =>
      `${API_BASE_URL}/Version/check?checkVersion=${encodeURIComponent(checkVersion)}`,
    frontend: {
      current: `${API_BASE_URL}/Version/frontend/current`,
      check: (frontendVersion: string) =>
        `${API_BASE_URL}/Version/frontend/check?frontendVersion=${encodeURIComponent(frontendVersion)}`,
    },
    signature: {
      verify: `${API_BASE_URL}/Version/signature/verify`,
      verifyMetadata: `${API_BASE_URL}/Version/signature/verify-metadata`,
      computeHash: `${API_BASE_URL}/Version/signature/compute-hash`,
      publicKeyInfo: `${API_BASE_URL}/Version/signature/public-key-info`,
      status: `${API_BASE_URL}/Version/signature/status`,
    },
  },

  // ============================================
  // Notifications
  // ============================================
  // notifications: {
  //   list: `${API_BASE_URL}/Notifications`,
  //   markAsRead: (id: number) => `${API_BASE_URL}/Notifications/${id}/mark-as-read`,
  //   markAllAsRead: `${API_BASE_URL}/Notifications/mark-all-as-read`,
  //   delete: (id: number) => `${API_BASE_URL}/Notifications/${id}`,
  //   unreadCount: `${API_BASE_URL}/Notifications/unread-count`,
  // },
} as const;

