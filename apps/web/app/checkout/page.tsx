import Link from "next/link"

import { CheckoutPageContent } from "@/app/checkout/checkout-page-content"
import { getCart } from "@/lib/api/cart"
import { Button } from "@workspace/ui/components/button"

type CheckoutPageProps = {
  searchParams: Promise<{
    payment?: string | string[]
  }>
}

export const dynamic = "force-dynamic"

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const cart = await getCart()

  if (cart.items.length === 0) {
    return (
      <section className="grid gap-5 px-4 py-5 text-center">
        <div className="bg-muted grid gap-3 rounded-3xl p-5">
          <p className="text-4xl">🧺</p>
          <h1 className="text-2xl font-semibold">Giỏ hàng đang trống</h1>
          <p className="text-muted-foreground text-sm">
            Vui lòng chọn món trước khi thanh toán.
          </p>
        </div>
        <Button asChild>
          <Link href="/menu">Chọn món</Link>
        </Button>
      </section>
    )
  }

  const { payment } = await searchParams
  const selectedPayment = payment === "vietqr" ? payment : "cash"

  return <CheckoutPageContent cart={cart} initialPayment={selectedPayment} />
}
