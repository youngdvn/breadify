"use client"

import { useState } from "react"
import Link from "next/link"
import { IconGrid3x3, IconList } from "@tabler/icons-react"

import { AddToCartButton } from "@/components/add-to-cart-button"
import type { MenuItem } from "@/lib/api/menu"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

type MenuPageContentProps = {
  menuItems: MenuItem[]
}

function MenuPageContent({ menuItems }: MenuPageContentProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  return (
    <section className="grid gap-4 px-4 py-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Menu
          </p>
          <h1 className="text-2xl font-semibold">Chọn bánh mì</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
          >
            <IconList className="size-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            <IconGrid3x3 className="size-4" />
          </Button>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
            : "grid gap-3"
        }
      >
        {menuItems.map((item) => (
          <article
            key={item.id}
            className={
              viewMode === "grid"
                ? "border-border/80 bg-card flex min-w-0 flex-col rounded-xl border p-3"
                : "border-border/80 bg-card grid grid-cols-[3.5rem_1fr] gap-3 rounded-xl border p-3"
            }
          >
            <Link
              href={`/menu/${item.slug}`}
              className={
                viewMode === "grid"
                  ? "bg-muted flex h-28 items-center justify-center rounded-xl text-5xl"
                  : "bg-muted flex size-14 items-center justify-center rounded-xl text-2xl"
              }
              aria-label={`Xem chi tiết ${item.name}`}
            >
              {item.emoji}
            </Link>

            <div className={viewMode === "grid" ? "mt-3 min-w-0" : "min-w-0"}>
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-2"
                    : "flex items-start justify-between gap-2"
                }
              >
                <div className="min-w-0">
                  <h2 className="line-clamp-1 font-medium">
                    <Link href={`/menu/${item.slug}`}>{item.name}</Link>
                  </h2>

                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-5">
                    {item.description}
                  </p>
                </div>

                <span
                  className={
                    viewMode === "grid"
                      ? "bg-primary/10 text-primary w-fit rounded-full px-2 py-1 text-[0.68rem] font-semibold"
                      : "bg-primary/10 text-primary shrink-0 rounded-full px-2 py-1 text-[0.68rem] font-semibold"
                  }
                >
                  {item.badge}
                </span>
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "mt-3 grid gap-3"
                    : "mt-3 flex items-center justify-between gap-2"
                }
              >
                <p className="font-semibold">{item.price}</p>

                <div
                  className={
                    viewMode === "grid"
                      ? "ml-auto flex flex-wrap items-center gap-2"
                      : "flex items-center gap-2"
                  }
                >
                  <label
                    htmlFor={`quantity-${item.id}`}
                    className="text-muted-foreground text-xs font-medium"
                  >
                    SL
                  </label>

                  <Input
                    id={`quantity-${item.id}`}
                    name={`quantity-${item.id}`}
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={1}
                    inputMode="numeric"
                    aria-label={`Số lượng ${item.name}`}
                    className="h-8 w-14 text-center text-sm font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />

                  <AddToCartButton
                    productName={item.name}
                    productSlug={item.slug}
                    quantityInputId={`quantity-${item.id}`}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Button asChild variant="outline">
        <Link href="/">Quay về trang chủ</Link>
      </Button>
    </section>
  )
}

export { MenuPageContent }
