import { ttl } from '@/shared/config'
import { useEntityFetch } from '@/shared/hooks/useEntityFetch'
import { preloadImages } from '@/shared/lib'
import { leaderboardApi } from '../api'
import { useLeaderboardStore } from '../model/store'
import type { LeaderboardResponse } from '../model/types'

const CACHE_TTL_MS = ttl.SESSION * 1000

function preload(d: LeaderboardResponse) {
	preloadImages([
		...(d.top_group?.map(s => s.photo_url) ?? []),
		...(d.top_stream?.map(s => s.photo_url) ?? []),
	])
}

export function useLeaderboard() {
	const data = useLeaderboardStore(s => s.data)
	const status = useLeaderboardStore(s => s.status)
	const loadedAt = useLeaderboardStore(s => s.loadedAt)
	const update = useLeaderboardStore(s => s.update)

	useEntityFetch({
		loadedAt,
		ttlMs: CACHE_TTL_MS,
		status,
		fetchFn: () => leaderboardApi.getAll(),
		onStart: () => update({ status: 'loading' }),
		onSuccess: fetched => {
			update({ data: fetched, status: 'success', loadedAt: Date.now() })
			preload(fetched)
		},
		onError: () => update({ status: 'error' }),
		onCacheHit: () => update({ status: 'success' }),
	})

	const groupStudents = data?.top_group ?? []
	const streamStudents = data?.top_stream ?? []
	const myRankGroup = data?.my_rank?.group
	const myRankStream = data?.my_rank?.stream

	return { groupStudents, streamStudents, myRankGroup, myRankStream, status }
}
