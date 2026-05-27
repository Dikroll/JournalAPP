import { api } from "@/shared/api"
import { apiConfig } from "@/shared/config/apiConfig"
import type { PaymentIndex, PaymentSummary } from "../model/types"

export const paymentApi = {
  getSummary: () =>
    api.get<PaymentSummary>(apiConfig.PAYMENT_SUMMARY).then((r) => r.data),
  getIndex: () =>
    api.get<PaymentIndex>(apiConfig.PAYMENT_INDEX).then((r)  => r.data),
  downloadRequisites: () =>
    api
      .get(apiConfig.PAYMENT_DOWNLOAD_REQUISITES, { responseType: 'blob' })
      .then((r) => {
        const url = window.URL.createObjectURL(new Blob([r.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'Квитанция_на_оплату.pdf')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }),
}