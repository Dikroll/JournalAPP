import { GlassCard } from '@/shared/ui'
import { Megaphone } from 'lucide-react'
import { memo } from 'react'
import type { NewsItem } from '@/entities/news'

interface NewsCardProps {
	item: NewsItem
	onClick: () => void
}

export const NewsCard = memo(function NewsCard({ item, onClick }: NewsCardProps) {
	const formattedDate = new Date(item.published_at).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
	})

	return (
		<div onClick={onClick} className='cursor-pointer w-full text-left'>
			<GlassCard className='relative overflow-hidden group hover:bg-glass-hover transition-colors'>
				{!item.is_read && (
					<div className='absolute top-3 right-3 w-2 h-2 rounded-full bg-accent animate-pulse' />
				)}
				
				<div className='flex gap-4'>
					<div className='flex-shrink-0 mt-1'>
						<div
							className='w-12 h-12 rounded-[16px] flex items-center justify-center'
							style={{ background: 'var(--color-surface-strong)' }}
						>
							<Megaphone size={20} className='text-accent' />
						</div>
					</div>
					
					<div className='flex-1 min-w-0 pr-4'>
						<h3 className={`text-base font-semibold text-app-text leading-tight mb-2 ${!item.is_read ? 'text-accent' : ''}`}>
							{item.title}
						</h3>
						<p className='text-xs text-app-muted font-medium'>
							{formattedDate}
						</p>
					</div>
				</div>
			</GlassCard>
		</div>
	)
})
