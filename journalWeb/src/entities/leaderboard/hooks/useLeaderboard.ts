import { CACHE_KEYS, isCacheValid, preloadImages, storage } from '@/shared/lib'
import { useEffect } from 'react'
import { leaderboardApi } from '../api'
import { useLeaderboardStore } from '../model/store'
import type { LeaderboardResponse } from '../model/types'

const TTL_24H_MS = 60 * 60 * 24 * 1000
const TTL_24H_S = 60 * 60 * 24

function preload(d: LeaderboardResponse) {
	preloadImages([
		...(d.top_group?.map(s => s.photo_url) ?? []),
		...(d.top_stream?.map(s => s.photo_url) ?? []),
	])
}

async function loadAll(
	update: ReturnType<typeof useLeaderboardStore.getState>['update'],
) {
	const state = useLeaderboardStore.getState()
	if (state.group.status === 'loading') return
	if (isCacheValid(state.group.loadedAt, TTL_24H_MS)) return

	const cached = storage.get<LeaderboardResponse>(CACHE_KEYS.LEADERBOARD_GROUP)
	if (cached) {
		const cachedAt =
			storage.getCachedAt(CACHE_KEYS.LEADERBOARD_GROUP) ?? Date.now()
		update('group', { data: cached, status: 'success', loadedAt: cachedAt })
		update('stream', { data: cached, status: 'success', loadedAt: cachedAt })
		preload(cached)
		return
	}

	update('group', { status: 'loading' })
	update('stream', { status: 'loading' })

	try {
		const d = await leaderboardApi.getAll()
		const now = Date.now()
		update('group', { data: d, status: 'success', loadedAt: now })
		update('stream', { data: d, status: 'success', loadedAt: now })
		storage.set(CACHE_KEYS.LEADERBOARD_GROUP, d, TTL_24H_S)
		preload(d)
	} catch {
		update('group', { status: 'error' })
		update('stream', { status: 'error' })
	}
}

export function useLeaderboard() {
	const groupData = useLeaderboardStore(s => s.group.data)
	const status = useLeaderboardStore(s => s.group.status)
	const update = useLeaderboardStore(s => s.update)

	useEffect(() => {
		loadAll(update)
	}, [])

	const groupStudents = groupData?.top_group ?? []
	const streamStudents = groupData?.top_stream ?? []
	const myRankGroup = groupData?.my_rank?.group
	const myRankStream = groupData?.my_rank?.stream

	return { groupStudents, streamStudents, myRankGroup, myRankStream, status }
}
