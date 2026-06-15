import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { account } from "@/lib/mock-data"

export default function AccountPage() {
  return (
    <section className="grid gap-4 px-4 py-5">
      <div className="bg-muted rounded-3xl p-5 text-center">
        <div className="bg-background mx-auto flex size-20 items-center justify-center rounded-full text-4xl">
          👤
        </div>
        <h1 className="mt-4 text-2xl font-semibold">{account.name}</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {account.tier} · {account.points} điểm tích lũy
        </p>
      </div>

      <div className="border-border/80 bg-card grid gap-3 rounded-3xl border p-4 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Số điện thoại</span>
          <span className="font-medium">{account.phone}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Món yêu thích</span>
          <span className="font-medium">{account.favorite}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Địa chỉ mặc định</span>
          <p className="mt-1 font-medium">{account.address}</p>
        </div>
      </div>

      <Button asChild>
        <Link href="/menu">Xem menu</Link>
      </Button>
    </section>
  )
}
