import { ttl } from '@/shared/config'
import { CACHE_KEYS, isCacheValid, storage } from '@/shared/lib'
import { useEffect, useRef } from 'react'
import { paymentApi } from '../api'
import { usePaymentStore } from '../model/store'
import type { PaymentSummary } from '../model/types'

const CACHE_TTL_MS = ttl.PAYMENT * 1000

export function usePayment() {
	const summary = usePaymentStore(s => s.summary)
	const status = usePaymentStore(s => s.summaryStatus)
	const loadedAt = usePaymentStore(s => s.summaryLoadedAt)
	const setSummary = usePaymentStore(s => s.setSummary)
	const setStatus = usePaymentStore(s => s.setSummaryStatus)
	const setLoadedAt = usePaymentStore(s => s.setSummaryLoadedAt)

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (fetchingRef.current) return
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return

		const cached = storage.get<PaymentSummary>(CACHE_KEYS.PAYMENT_SUMMARY)
		if (cached) {
			setSummary(cached)
			setLoadedAt(Date.now())
			setStatus('success')
			return
		}

		fetchingRef.current = true
		setStatus('loading')

		paymentApi
			.getSummary()
			.then(data => {
				setSummary(data)
				setLoadedAt(Date.now())
				setStatus('success')
				storage.set(CACHE_KEYS.PAYMENT_SUMMARY, data, ttl.PAYMENT)
			})
			.catch(() => setStatus('error'))
			.finally(() => {
				fetchingRef.current = false
			})
	}, [loadedAt])

	return { summary, status }
}
