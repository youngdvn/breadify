import { apiFetch } from "@/services/api-client"
import type { AdminUser } from "@/types/admin"

async function requestAdminOTP(username: string) {
  const response = await apiFetch("/api/admin/auth/otp/request", {
    method: "POST",
    body: JSON.stringify({ username }),
  })

  if (!response.ok) {
    throw new Error("Cannot request OTP")
  }
}

async function verifyAdminOTP(username: string, otp: string) {
  const response = await apiFetch("/api/admin/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ username, otp }),
  })

  if (!response.ok) {
    throw new Error("Invalid OTP")
  }

  return (await response.json()) as AdminUser
}

async function getCurrentAdmin() {
  const response = await apiFetch("/api/admin/auth/me")

  if (!response.ok) {
    return null
  }

  return (await response.json()) as AdminUser
}

async function logoutAdmin() {
  const response = await apiFetch("/api/admin/auth/logout", {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Cannot logout admin")
  }
}

export { getCurrentAdmin, logoutAdmin, requestAdminOTP, verifyAdminOTP }
