/**
 * Data Export API types (align with OpenAPI #/components/schemas/...)
 */

export interface DataExportSettings {
  IsEnabled: boolean
  EnableDigitalSignature: boolean
  EnableDataMasking: boolean
  EnableExportAudit: boolean
  MaxRecordsPerExport: number
  MaxExportSizeBytes: number
  AllowedFormats: string[]
  DefaultSensitivityLevel: string
  SignatureAlgorithm: string
  AuditLogRetentionDays: number
}

export interface DataExportSettingsApiResponse {
  success?: boolean
  data?: DataExportSettings
}

// Export rules
export interface ExportRule {
  id: string
  name?: string
  description?: string
  entityType?: string
  format?: string
  isEnabled?: boolean
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface CreateExportRuleRequest {
  name?: string
  description?: string
  entityType?: string
  format?: string
  isEnabled?: boolean
  [key: string]: unknown
}

export interface UpdateExportRuleRequest {
  name?: string
  description?: string
  entityType?: string
  format?: string
  isEnabled?: boolean
  [key: string]: unknown
}

// Masking rules
export interface DataMaskingRule {
  id: string
  name?: string
  fieldPattern?: string
  maskingType?: string
  replacement?: string
  isEnabled?: boolean
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface CreateMaskingRuleRequest {
  name?: string
  fieldPattern?: string
  maskingType?: string
  replacement?: string
  isEnabled?: boolean
  [key: string]: unknown
}

export interface UpdateMaskingRuleRequest {
  name?: string
  fieldPattern?: string
  maskingType?: string
  replacement?: string
  isEnabled?: boolean
  [key: string]: unknown
}

// Sensitivity levels
export interface SensitivityLevel {
  id?: string
  name?: string
  level?: string
  description?: string
  entityType?: string
  entityId?: string
  [key: string]: unknown
}

// Export audit
export interface ExportAuditEntry {
  id?: string
  exportDate?: string
  userId?: number
  userName?: string
  entityType?: string
  entityId?: string
  sensitivityLevel?: string
  wasMasked?: boolean
  isSuccess?: boolean
  recordCount?: number
  errorMessage?: string
  [key: string]: unknown
}

export interface ExportAuditLogResponse {
  items?: ExportAuditEntry[]
  totalCount?: number
  page?: number
  pageSize?: number
  totalPages?: number
}

// Statistics (for charts)
export interface ExportStatistics {
  totalExports?: number
  successCount?: number
  failureCount?: number
  totalRecordsExported?: number
  exportsByFormat?: Record<string, number>
  exportsByEntityType?: Record<string, number>
  exportsLast7Days?: number[]
  [key: string]: unknown
}

// Test export
export interface TestExportRequest {
  entityType?: string
  entityId?: string
  format?: string
  recordLimit?: number
  [key: string]: unknown
}
