export type AdminCategoryStatus = 'active' | 'inactive'

export type AdminCategory = {
  id: string
  name: string
  slug: string
  desc: string
  color: string
  status: AdminCategoryStatus
}
