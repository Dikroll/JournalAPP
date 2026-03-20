import { useEffect, useState } from "react"
import { paymentApi } from "../api"
import type { PaymentSummary } from "../model/types"

export function usePayment() {
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  useEffect(() => {
    setStatus("loading")
    paymentApi
      .getSummary()
      .then((data: PaymentSummary) => {
        setSummary(data)
        setStatus("success")
      })
      .catch(() => setStatus("error"))
  }, [])

  return { summary, status }
}