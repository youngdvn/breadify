import Link from "next/link"

import { AddToCartButton } from "@/components/add-to-cart-button"
import { Button } from "@workspace/ui/components/button"
import { favoriteItems, homeDeals, menuItems, reviews } from "@/lib/mock-data"
import { IconStar } from "@tabler/icons-react"

const featuredBreads = menuItems.slice(0, 3)

export default function Page() {
  return (
    <section className="grid gap-6 px-4 py-5">
      <div className="overflow-hidden rounded-lg bg-[linear-gradient(135deg,var(--primary),oklch(0.72_0.13_75))] p-5 text-primary-foreground">
        <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-80">
          Bánh mì nóng giòn
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Đặt bánh mì nhanh cho bữa sáng của bạn.
        </h1>
        <p className="mt-3 text-sm leading-6 opacity-85">
          Chọn món, thêm topping và nhận bánh mới nướng trong vài phút.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            asChild
            className="bg-background text-foreground hover:bg-background/90"
            variant={"secondary"}
          >
            <Link href="/menu">Xem menu</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <a href="tel:0901234567">Đặt ngay</a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mx-4">
        {["Nóng giòn", "Giao nhanh", "Sốt riêng"].map((item) => (
          <div key={item} className="bg-muted rounded-lg px-2 py-3">
            <p className="text-sm font-medium">{item}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Giảm giá
          </p>
          <h2 className="text-xl font-semibold">Ưu đãi hôm nay</h2>
        </div>

        <div className="grid gap-3">
          {homeDeals.map((deal) => (
            <article
              key={deal.id}
              className="border-border/80 bg-card rounded-lg border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{deal.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-5">
                    {deal.description}
                  </p>
                </div>
                <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-1 text-[0.68rem] font-semibold">
                  {deal.discount}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-semibold">{deal.price}</p>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/menu">Áp dụng</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Menu hôm nay
            </p>
            <h2 className="text-xl font-semibold">Món nổi bật</h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/menu">Xem tất cả</Link>
          </Button>
        </div>

        <div className="grid gap-3">
          {featuredBreads.map((bread) => (
            <article
              key={bread.name}
              className="border-border/80 bg-card grid grid-cols-[5rem_1fr] gap-3 rounded-lg border p-3"
            >
              <Link
                href={`/menu/${bread.id}`}
                className="flex aspect-square items-center justify-center rounded-2xl bg-[linear-gradient(135deg,oklch(0.9_0.08_78),oklch(0.73_0.12_60))] text-3xl"
                aria-label={`Xem chi tiết ${bread.name}`}
              >
                {bread.emoji}
              </Link>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">
                      <Link href={`/menu/${bread.id}`}>{bread.name}</Link>
                    </h3>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-5">
                      {bread.description}
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-1 text-[0.68rem] font-semibold">
                    {bread.badge}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-semibold">{bread.price}</p>
                  <AddToCartButton
                    productName={bread.name}
                    productSlug={bread.id}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Yêu thích
          </p>
          <h2 className="text-xl font-semibold">Khách đặt nhiều</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {favoriteItems.map((item) => (
            <article
              key={item.id}
              className="border-border/80 bg-card rounded-3xl border p-3"
            >
              <Link
                href={`/menu/${item.productId}`}
                className="bg-muted flex aspect-square items-center justify-center rounded-2xl text-4xl"
                aria-label={`Xem chi tiết ${item.name}`}
              >
                {item.emoji}
              </Link>
              <h3 className="mt-3 font-semibold">
                <Link href={`/menu/${item.productId}`}>{item.name}</Link>
              </h3>
              <p className="text-muted-foreground mt-1 text-xs leading-4">
                {item.sold}
              </p>
              <p className="mt-2 text-sm font-medium">⭐ {item.rating}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Đánh giá
          </p>
          <h2 className="text-xl font-semibold">Phản hồi từ khách hàng</h2>
        </div>

        <div className="grid gap-3">
          {reviews.map((review) => (
            <article key={review.id} className="bg-muted rounded-3xl p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{review.customer}</p>
                <p className="text-sm font-medium flex items-center gap-1"><IconStar size={18} color="#c5d303" fill="#c5d303" /> {review.rating}</p>
              </div>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                “{review.comment}”
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-lg border-2 border-dashed p-4">
        <p className="font-medium">Nhận tại cửa hàng</p>
        <p className="text-muted-foreground mt-1 text-sm leading-5">
          Đặt trước trên web, đến lấy khi bánh còn nóng. Dòng sản phẩm và quy
          trình mua hàng sẽ được mở rộng theo từng bước.
        </p>
      </div>
    </section>
  )
}
