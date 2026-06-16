import { MenuPageContent } from "@/app/menu/menu-page-content"
import { getMenuItems } from "@/lib/api/menu"

export const dynamic = "force-dynamic"

export default async function MenuPage() {
  const menuItems = await getMenuItems()

  return <MenuPageContent menuItems={menuItems} />
}
