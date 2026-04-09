import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import type { FeedbackTag, PendingFeedback } from './types'

interface FeedbackState {
	pending: PendingFeedback[]
	pendingStatus: LoadingState
	pendingLoadedAt: number | null

	tags: FeedbackTag[]
	tagsStatus: LoadingState
	tagsLoadedAt: number | null

	error: string | null

	setPending: (items: PendingFeedback[]) => void
	setPendingStatus: (s: LoadingState) => void
	setPendingLoadedAt: (t: number) => void

	setTags: (items: FeedbackTag[]) => void
	setTagsStatus: (s: LoadingState) => void
	setTagsLoadedAt: (t: number) => void

	setError: (e: string | null) => void

	removePending: (key: string) => void
}

export const useFeedbackStore = create<FeedbackState>()(set => ({
	pending: [],
	pendingStatus: 'idle',
	pendingLoadedAt: null,

	tags: [],
	tagsStatus: 'idle',
	tagsLoadedAt: null,

	error: null,

	setPending: pending => set({ pending }),
	setPendingStatus: pendingStatus => set({ pendingStatus }),
	setPendingLoadedAt: pendingLoadedAt => set({ pendingLoadedAt }),

	setTags: tags => set({ tags }),
	setTagsStatus: tagsStatus => set({ tagsStatus }),
	setTagsLoadedAt: tagsLoadedAt => set({ tagsLoadedAt }),

	setError: error => set({ error }),

	removePending: key =>
		set(state => ({
			pending: state.pending.filter(p => p.key !== key),
		})),
}))
