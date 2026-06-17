type MenuCategory = "banh_mi" | "do_uong"

type ApiMenuItem = {
  id: string
  name: string
  slug: string
  category: MenuCategory
  price: number
  imageUrl?: string
  description?: string
  detail?: string
  available: boolean
  sortOrder: number
}

type MenuItem = {
  id: string
  name: string
  slug: string
  category: MenuCategory
  description: string
  detail: string
  price: string
  priceValue: number
  badge: string
  emoji: string
  ingredients: string[]
  calories: string
  prepTime: string
  available: boolean
  sortOrder: number
}

type MenuListResponse = {
  items: ApiMenuItem[]
}

export type { ApiMenuItem, MenuCategory, MenuItem, MenuListResponse }
