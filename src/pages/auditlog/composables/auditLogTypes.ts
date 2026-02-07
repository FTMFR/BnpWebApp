export interface AuditLogItem {
  Id: number
  EventDateTime: string
  EventType: string
  EntityId: number | null
  EntityType: string | null
  IsSuccess: boolean
  ErrorMessage: string | null
  IpAddress: string | null
  UserName: string | null
  UserId: string | null
  OperatingSystem: string | null
  UserAgent: string | null
  Description: string | null
}

export interface AuditLogResponse {
  Items: AuditLogItem[]
  TotalCount: number
  PageNumber: number
  PageSize: number
  TotalPages: number
  HasPreviousPage: boolean
  HasNextPage: boolean
}
