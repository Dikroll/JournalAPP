import { ttl } from '@/shared/config'
import { CACHE_KEYS, isCacheValid, storage } from '@/shared/lib'
import { useEffect, useRef } from 'react'
import { paymentApi } from '../api'
import { usePaymentStore } from '../model/store'
import type { PaymentIndex } from '../model/types'

const CACHE_TTL_MS = ttl.PAYMENT * 1000

export function usePaymentIndex() {
	const index = usePaymentStore(s => s.index)
	const status = usePaymentStore(s => s.indexStatus)
	const loadedAt = usePaymentStore(s => s.indexLoadedAt)
	const setIndex = usePaymentStore(s => s.setIndex)
	const setStatus = usePaymentStore(s => s.setIndexStatus)
	const setLoadedAt = usePaymentStore(s => s.setIndexLoadedAt)

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (fetchingRef.current) return
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return

		const cached = storage.get<PaymentIndex>(CACHE_KEYS.PAYMENT_INDEX)
		if (cached) {
			setIndex(cached)
			setLoadedAt(Date.now())
			setStatus('success')
			return
		}

		fetchingRef.current = true
		setStatus('loading')

		paymentApi
			.getIndex()
			.then(data => {
				setIndex(data)
				setLoadedAt(Date.now())
				setStatus('success')
				storage.set(CACHE_KEYS.PAYMENT_INDEX, data, ttl.PAYMENT)
			})
			.catch(() => setStatus('error'))
			.finally(() => {
				fetchingRef.current = false
			})
	}, [loadedAt])

	return { index, status }
}
