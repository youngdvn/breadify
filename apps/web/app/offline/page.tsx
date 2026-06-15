import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

export default function OfflinePage() {
  return (
    <section className="flex min-h-full items-center p-6">
      <div className="flex max-w-md flex-col gap-4 text-sm leading-loose">
        <div>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-wide">
            Offline
          </p>
          <h1 className="text-2xl font-medium">You are offline</h1>
          <p className="text-muted-foreground">
            Breadify cannot reach the network right now. Reconnect and try
            again.
          </p>
        </div>
        <Button asChild className="w-fit">
          <Link href="/">Retry</Link>
        </Button>
      </div>
    </section>
  )
}
