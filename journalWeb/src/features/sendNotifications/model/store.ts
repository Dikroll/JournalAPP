import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChangelogEntry {
	id: string
	version: string
	date?: string
	items: string[]
}

export const FALLBACK_CHANGELOG: ChangelogEntry[] = [
	{
		id: 'v1.3.0',
		version: '1.3.0',
		date: '2026-04-09',
		items: [
			'Оценка занятий — оценивайте пары и преподавателей прямо из уведомлений',
			'Расписание на неделю — обновлённый дизайн, плоский список вместо вложенных карточек',
			'Библиотека — улучшены заглушки для материалов без обложки',
			'Уведомления — индикатор на иконке при наличии непрочитанного',
		],
	},
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

export function getUnreadCount(
	lastReadId: string | null,
	entries: ChangelogEntry[] = FALLBACK_CHANGELOG,
): number {
	if (!lastReadId) return entries.length
	const idx = entries.findIndex(entry => entry.id === lastReadId)
	return idx === -1 ? entries.length : idx
}
