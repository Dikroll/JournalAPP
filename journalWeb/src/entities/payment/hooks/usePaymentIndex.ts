import { ttl } from '@/shared/config'
import { CACHE_KEYS } from '@/shared/lib'
import { paymentApi } from '../api'
import { useZustandQuery } from '@/shared/hooks/useZustandQuery'
import { usePaymentStore } from '../model/store'

const CACHE_TTL_MS = ttl.PAYMENT * 1000

export function usePaymentIndex() {
	const index = usePaymentStore(s => s.index)
	const status = usePaymentStore(s => s.indexStatus)
	const loadedAt = usePaymentStore(s => s.indexLoadedAt)
	const setIndex = usePaymentStore(s => s.setIndex)
	const setStatus = usePaymentStore(s => s.setIndexStatus)
	const setLoadedAt = usePaymentStore(s => s.setIndexLoadedAt)

	useZustandQuery({
		cacheKey: CACHE_KEYS.PAYMENT_INDEX,
		ttlMs: CACHE_TTL_MS,
		loadedAt,
		status,
		hasData: !!(index && index.payment?.okpo !== undefined),
		fetchFn: () => paymentApi.getIndex(),
		updateStore: (state) => {
			if (state.data) {
				setIndex(state.data)
			}
			if (state.loadedAt) setLoadedAt(state.loadedAt)
			setStatus(state.status as any)
		},
	})

	return { index, status }
}
