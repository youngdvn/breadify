import "server-only"

import { apiBaseUrl } from "@/services/api-client"
import type { ApiMenuItem, MenuItem, MenuListResponse } from "@/types/menu"
import { formatVnd } from "@/utils/format"

const menuVisuals: Record<
  string,
  Pick<MenuItem, "badge" | "emoji" | "ingredients" | "calories" | "prepTime">
> = {
  "banh-mi-dac-biet": {
    badge: "Bán chạy",
    emoji: "🥖",
    ingredients: ["Pate", "Chả lụa", "Thịt nguội", "Đồ chua", "Rau thơm"],
    calories: "420 kcal",
    prepTime: "8 phút",
  },
  "banh-mi-ga-xe": {
    badge: "Mới",
    emoji: "🍗",
    ingredients: ["Gà xé", "Dưa leo", "Rau thơm", "Sốt cay nhẹ", "Đồ chua"],
    calories: "360 kcal",
    prepTime: "7 phút",
  },
  "banh-mi-chay": {
    badge: "Thanh nhẹ",
    emoji: "🌱",
    ingredients: ["Nấm áp chảo", "Đậu hũ", "Đồ chua", "Rau giòn", "Sốt mè"],
    calories: "310 kcal",
    prepTime: "7 phút",
  },
  "banh-mi-trung": {
    badge: "Buổi sáng",
    emoji: "🍳",
    ingredients: ["Trứng ốp la", "Pate", "Dưa leo", "Rau thơm", "Nước tương"],
    calories: "340 kcal",
    prepTime: "6 phút",
  },
  "ca-phe-sua-da": {
    badge: "Đồ uống",
    emoji: "☕",
    ingredients: ["Cà phê phin", "Sữa đặc", "Đá viên"],
    calories: "180 kcal",
    prepTime: "5 phút",
  },
  "tra-tac": {
    badge: "Giải khát",
    emoji: "🍋",
    ingredients: ["Trà", "Tắc", "Đường", "Đá viên"],
    calories: "90 kcal",
    prepTime: "4 phút",
  },
}

const defaultVisuals = {
  badge: "Món ngon",
  emoji: "🥖",
  ingredients: ["Nguyên liệu tươi", "Sốt nhà làm"],
  calories: "Đang cập nhật",
  prepTime: "7 phút",
}

async function getMenuItems() {
  const response = await fetch(`${apiBaseUrl}/api/menu`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Cannot load menu")
  }

  const data = (await response.json()) as MenuListResponse
  return data.items.map(mapMenuItem)
}

async function getMenuItem(slug: string) {
  const response = await fetch(`${apiBaseUrl}/api/menu/${slug}`, {
    cache: "no-store",
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Cannot load menu item")
  }

  return mapMenuItem((await response.json()) as ApiMenuItem)
}

function mapMenuItem(item: ApiMenuItem): MenuItem {
  const visuals = menuVisuals[item.slug] ?? defaultVisuals

  return {
    id: item.slug,
    slug: item.slug,
    name: item.name,
    category: item.category,
    description: item.description ?? "",
    detail: item.detail ?? item.description ?? "",
    price: formatVnd(item.price),
    priceValue: item.price,
    available: item.available,
    sortOrder: item.sortOrder,
    ...visuals,
  }
}

export { getMenuItem, getMenuItems }
