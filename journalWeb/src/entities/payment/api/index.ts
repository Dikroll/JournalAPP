import { api } from "@/shared/api"
import { apiConfig } from "@/shared/config/apiConfig"
import type { PaymentIndex, PaymentSummary } from "../model/types"

export const paymentApi = {
  getSummary: () =>
    api.get<PaymentSummary>(apiConfig.PAYMENT_SUMMARY).then((r) => r.data),
  getIndex: () =>
    api.get<PaymentIndex>(apiConfig.PAYMENT_INDEX).then((r)  => r.data),
}