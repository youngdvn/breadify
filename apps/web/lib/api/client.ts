const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

async function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
}

export { apiBaseUrl, apiFetch }
