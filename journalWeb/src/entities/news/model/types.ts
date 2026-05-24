export interface NewsItem {
	id: number
	title: string
	published_at: string
	is_read: boolean
}

export interface NewsDetail extends NewsItem {
	content_html: string
}

export interface NewsState {
	latest: NewsItem[]
	details: Record<number, NewsDetail>
	status: 'idle' | 'loading' | 'success' | 'error'
	error: string | null
	loadedAt: number | null

	update: (patch: Partial<Omit<NewsState, 'update' | 'setDetail' | 'markAsRead' | 'reset'>>) => void
	setDetail: (id: number, detail: NewsDetail) => void
	markAsRead: (id: number) => void
	reset: () => void
}
