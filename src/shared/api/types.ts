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
  email: string
  phone: string
  mobileNumber: string
  userCode?: string
  grpPublicId: string
}

export interface CreateUserResponse {
  success: boolean
  message?: string
}
