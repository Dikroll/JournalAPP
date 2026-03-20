import { useEffect, useState } from 'react'
import { paymentApi } from '../api'
import type { PaymentIndex } from '../model/types'

export function usePaymentIndex() {
  const [index, setIndex] = useState<PaymentIndex | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    setStatus('loading')
    paymentApi.getIndex()
      .then(data => { setIndex(data); setStatus('success') })
      .catch(() => setStatus('error'))
  }, [])

  return { index, status }
}