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
	const groupData = useLeaderboardStore(s => s.group.data)
	const status = useLeaderboardStore(s => s.group.status)
	const loadedAt = useLeaderboardStore(s => s.group.loadedAt)
	const update = useLeaderboardStore(s => s.update)

	useEntityFetch({
		loadedAt,
		ttlMs: CACHE_TTL_MS,
		status,
		fetchFn: () => leaderboardApi.getAll(),
		onStart: () => {
			update('group', { status: 'loading' })
			update('stream', { status: 'loading' })
		},
		onSuccess: data => {
			const now = Date.now()
			update('group', { data, status: 'success', loadedAt: now })
			update('stream', { data, status: 'success', loadedAt: now })
			preload(data)
		},
		onError: () => {
			update('group', { status: 'error' })
			update('stream', { status: 'error' })
		},
	})

	const groupStudents = groupData?.top_group ?? []
	const streamStudents = groupData?.top_stream ?? []
	const myRankGroup = groupData?.my_rank?.group
	const myRankStream = groupData?.my_rank?.stream

	return { groupStudents, streamStudents, myRankGroup, myRankStream, status }
}
