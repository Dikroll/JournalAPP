import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChangelogEntry {
	id: string
	version: string
	date: string
	items: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
	{
		id: 'v1.0.0',
		version: '1.0.0',
		date: '2025-02-01',
		items: ['Первый релиз приложения'],
	},
]

interface NotificationsState {
	lastReadChangelogId: string | null
	setLastRead: (id: string) => void
}

export const useNotificationsStore = create<NotificationsState>()(
	persist(
		set => ({
			lastReadChangelogId: null,
			setLastRead: id => set({ lastReadChangelogId: id }),
		}),
		{
			name: 'notifications-store',
			partialize: state => ({
				lastReadChangelogId: state.lastReadChangelogId,
			}),
		},
	),
)

export function getUnreadCount(lastReadId: string | null): number {
	if (!lastReadId) return CHANGELOG.length
	const idx = CHANGELOG.findIndex(e => e.id === lastReadId)
	return idx === -1 ? CHANGELOG.length : idx
}
