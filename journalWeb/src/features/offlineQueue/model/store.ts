import { create } from 'zustand'
import { persistEncrypted } from '@/shared/lib/zustandEncryptedPersist'
import type { QueuedHomework } from './types'

interface OfflineQueueState {
	items: QueuedHomework[]
	addItem: (item: QueuedHomework) => void
	removeItem: (id: string) => void
	updateItem: (id: string, patch: Partial<QueuedHomework>) => void
	clearAll: () => void
}

export const useOfflineQueueStore = create<OfflineQueueState>()(
	persistEncrypted(
		set => ({
			items: [],

			addItem: item =>
				set(state => ({ items: [...state.items, item] })),

			removeItem: id =>
				set(state => ({
					items: state.items.filter(i => i.id !== id),
				})),

			updateItem: (id, patch) =>
				set(state => ({
					items: state.items.map(i =>
						i.id === id ? { ...i, ...patch } : i,
					),
				})),

			clearAll: () => set({ items: [] }),
		}),
		{ name: 'offline-queue-store' },
	),
)
