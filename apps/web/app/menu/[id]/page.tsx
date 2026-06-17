import Link from "next/link"
import { notFound } from "next/navigation"

import { AddToCartButton } from "@/components/add-to-cart-button"
import { getMenuItem, getMenuItems } from "@/services/menu-service"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

type ProductDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { id } = await params
  const product = await getMenuItem(id)

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm",
    }
  }

  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params
  const product = await getMenuItem(id)

  if (!product) {
    notFound()
  }

  const relatedProducts = (await getMenuItems())
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3)

  return (
    <section className="grid gap-5 px-4 py-5">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/menu">← Quay lại menu</Link>
      </Button>

      <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,oklch(0.9_0.08_78),oklch(0.73_0.12_60))] p-6 text-center">
        <div className="text-7xl">{product.emoji}</div>
        <span className="bg-background/80 text-primary mt-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
          {product.badge}
        </span>
      </div>

      <div className="grid gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Thông tin sản phẩm
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {product.name}
            </h1>
          </div>
          <p className="text-primary shrink-0 text-xl font-semibold">
            {product.price}
          </p>
        </div>

        <p className="text-muted-foreground text-sm leading-6">
          {product.detail}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted rounded-3xl p-4">
          <p className="text-muted-foreground text-xs">Thời gian chuẩn bị</p>
          <p className="mt-1 font-semibold">{product.prepTime}</p>
        </div>
        <div className="bg-muted rounded-3xl p-4">
          <p className="text-muted-foreground text-xs">Năng lượng</p>
          <p className="mt-1 font-semibold">{product.calories}</p>
        </div>
      </div>

      <div className="border-border/80 bg-card rounded-lg border p-4">
        <h2 className="font-semibold">Thành phần</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.ingredients.map((ingredient) => (
            <span
              key={ingredient}
              className="bg-muted rounded-full px-3 py-1 text-sm"
            >
              {ingredient}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2 rounded-lg border p-2">
          <label
            htmlFor={`quantity-${product.id}`}
            className="text-muted-foreground pl-2 text-sm font-medium"
          >
            Số lượng
          </label>
          <Input
            id={`quantity-${product.id}`}
            name={`quantity-${product.id}`}
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            inputMode="numeric"
            aria-label={`Số lượng ${product.name}`}
            className="h-8 w-14 text-center text-sm font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          />
        </div>
        <AddToCartButton
          productName={product.name}
          productSlug={product.slug}
          quantityInputId={`quantity-${product.id}`}
          size="default"
          label="Thêm vào giỏ"
        />
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Sản phẩm liên quan
          </p>
          <h2 className="text-xl font-semibold">Có thể bạn cũng thích</h2>
        </div>

        <div className="grid gap-3">
          {relatedProducts.map((item) => (
            <Link
              key={item.id}
              href={`/menu/${item.slug}`}
              className="border-border/80 bg-card grid grid-cols-[3.5rem_1fr] gap-3 rounded-3xl border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="bg-muted flex size-14 items-center justify-center rounded-2xl text-2xl">
                {item.emoji}
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-5">
                      {item.description}
                    </p>
                  </div>
                  <p className="text-primary shrink-0 text-sm font-semibold">
                    {item.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
