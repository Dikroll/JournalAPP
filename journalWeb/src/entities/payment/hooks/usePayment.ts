import { ttl } from '@/shared/config'
import { useEntityFetch } from '@/shared/hooks/useEntityFetch'
import { paymentApi } from '../api'
import { usePaymentStore } from '../model/store'

const CACHE_TTL_MS = ttl.PAYMENT * 1000

export function usePayment() {
	const summary = usePaymentStore(s => s.summary)
	const status = usePaymentStore(s => s.summaryStatus)
	const loadedAt = usePaymentStore(s => s.summaryLoadedAt)
	const setSummary = usePaymentStore(s => s.setSummary)
	const setStatus = usePaymentStore(s => s.setSummaryStatus)
	const setLoadedAt = usePaymentStore(s => s.setSummaryLoadedAt)

	useEntityFetch({
		loadedAt,
		ttlMs: CACHE_TTL_MS,
		status,
		fetchFn: () => paymentApi.getSummary(),
		onStart: () => setStatus('loading'),
		onSuccess: data => {
			setSummary(data)
			setLoadedAt(Date.now())
			setStatus('success')
		},
		onError: () => setStatus('error'),
		onCacheHit: () => setStatus('success'),
	})

	return { summary, status }
}
