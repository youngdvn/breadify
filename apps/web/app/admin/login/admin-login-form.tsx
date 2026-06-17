"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  requestAdminOTP,
  verifyAdminOTP,
} from "@/services/admin-auth-service"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

function AdminLoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("admin")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"username" | "otp">("username")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function requestOTP(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await requestAdminOTP(username)

      toast.success("Đã gửi mã OTP", {
        description: "Vui lòng kiểm tra email của bạn và nhập mã OTP.",
      })
      setStep("otp")
    } catch {
      toast.error("Không thể gửi OTP")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function verifyOTP(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await verifyAdminOTP(username, otp)

      toast.success("Đăng nhập admin thành công")
      router.push("/admin")
      router.refresh()
    } catch {
      toast.error("Mã OTP không đúng hoặc đã hết hạn")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={verifyOTP} className="grid gap-3">
        <div className="bg-muted rounded-2xl p-3 text-sm">
          Mã OTP đã được gửi đến email admin cho username{" "}
          <strong>{username}</strong>. Mã hết hạn sau 5
          phút.
        </div>
        <Input
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          inputMode="numeric"
          placeholder="Nhập mã OTP"
          aria-label="Mã OTP"
          maxLength={6}
          required
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang xác thực" : "Xác thực OTP"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setStep("username")
            setOtp("")
          }}
          disabled={isSubmitting}
        >
          Đổi username
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={requestOTP} className="grid gap-3">
      <Input
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Username admin"
        aria-label="Username admin"
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang gửi OTP" : "Gửi mã OTP"}
      </Button>
    </form>
  )
}

export { AdminLoginForm }
