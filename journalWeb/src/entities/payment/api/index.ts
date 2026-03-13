import { api } from "@/shared/api"
import { apiConfig } from "@/shared/config/apiConfig"
import type { PaymentSummary } from "../model/types"

export const paymentApi = {
  getSummary: () =>
    api.get<PaymentSummary>(apiConfig.PAYMENT_SUMMARY).then((r) => r.data),
}