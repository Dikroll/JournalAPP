export interface ScheduledPayment {
  id: number
  description: string
  amount: number
  due_date: string
  is_paid: boolean
}

export interface PaymentRecord {
  date: string
  amount: number
  description: string
  type: string
}

export interface PaymentSummary {
  total_debt: number
  next_payment: ScheduledPayment | null
  schedule: ScheduledPayment[]
  history: PaymentRecord[]
}
export interface PaymentIndex {
  full_name: string
  one_c_code: string
  has_invoice_access: boolean
  has_add_invoice_access: boolean
  online_link: string | null
  online_link_has: boolean
  payment: {
    id: number
    payer_full_name: string
    purpose_of_payment: string
    amount_next: number
    amount_to_pay: number
    amount_in_words: string
    pay_date_start: string
    bank_name: string
    settlement_account: string
    organization_name: string
    updated_at: string
  }
}