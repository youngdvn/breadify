"use client"

import * as React from "react"

function PwaProvider() {
  React.useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(
      (registration) => {
        void registration.update()
      },
      () => {}
    )
  }, [])

  return null
}

export { PwaProvider }
