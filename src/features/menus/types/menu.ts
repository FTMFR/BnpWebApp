export interface Menu {
  PublicId: string
  Title: string
  Path: string | null
  ParentPublicId: string | null
  ZamanInsert: string | null
  IsMenu: boolean
}
