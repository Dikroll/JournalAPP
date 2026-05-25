import { persistEncrypted } from '@/shared/lib/zustandEncryptedPersist'
import { create } from 'zustand'
import type { NewsState } from './types'

export const useNewsStore = create<NewsState>()(
	persistEncrypted(
		set => ({
			latest: [],
			details: {},
			readIds: [],
			status: 'idle',
			error: null,
			loadedAt: null,

			update: patch => set(state => {
				const nextPatch = { ...patch } as Partial<NewsState>
				let nextReadIds = [...(state.readIds || [])].map(String)
				
				if (nextPatch.latest) {
					nextPatch.latest.forEach(item => {
						if (item.is_read && !nextReadIds.includes(String(item.id))) {
							nextReadIds.push(String(item.id))
						}
					})
					
					nextPatch.latest = nextPatch.latest.map(item => 
						nextReadIds.includes(String(item.id)) ? { ...item, is_read: true } : item
					)
					
					// Store as numbers if they are numeric, or strings. Let's just store as what they were or convert to number.
					// Actually, storing as numbers is safer for the type definition.
					nextPatch.readIds = nextReadIds.map(Number)
				}
				
				return nextPatch
			}),

			setDetail: (id, detail) =>
				set(state => {
					let nextReadIds = [...(state.readIds || [])].map(String)
					if (detail.is_read && !nextReadIds.includes(String(id))) {
						nextReadIds.push(String(id))
					}
					const isRead = nextReadIds.includes(String(id))

					return {
						readIds: nextReadIds.map(Number),
						details: {
							...state.details,
							[id]: { ...detail, is_read: isRead },
						},
					}
				}),

			markAsRead: id =>
				set(state => {
					const currentReadIds = (state.readIds || []).map(String)
					const hasReadId = currentReadIds.includes(String(id))
					
					const latestItem = state.latest.find(i => String(i.id) === String(id))
					const needsLatestUpdate = latestItem && !latestItem.is_read

					const detailItem = state.details[id]
					const needsDetailUpdate = detailItem && !detailItem.is_read

					if (hasReadId && !needsLatestUpdate && !needsDetailUpdate) {
						return {}
					}

					const newReadIds = hasReadId 
						? currentReadIds 
						: [...currentReadIds, String(id)]

					return {
						readIds: newReadIds.map(Number),
						latest: needsLatestUpdate
							? state.latest.map(item =>
									String(item.id) === String(id) ? { ...item, is_read: true } : item,
							  )
							: state.latest,
						details: needsDetailUpdate
							? {
									...state.details,
									[id]: { ...state.details[id], is_read: true },
							  }
							: state.details,
					}
				}),

			reset: () =>
				set({
					latest: [],
					details: {},
					readIds: [],
					status: 'idle',
					error: null,
					loadedAt: null,
				}),
		}),
		{
			name: 'news-store',
			version: 1,
			partialize: state => ({
				latest: state.latest,
				details: state.details,
				readIds: state.readIds || [],
				loadedAt: state.loadedAt,
			}),
		},
	),
)
