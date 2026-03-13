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