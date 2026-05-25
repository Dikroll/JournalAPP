import { Megaphone, ChevronRight } from 'lucide-react'
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
		<div 
			onClick={onClick} 
			className='group cursor-pointer w-full text-left outline-none block'
			role='button'
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onClick()
				}
			}}
		>
			<div className={`relative overflow-hidden rounded-[24px] p-4 sm:p-5 transition-all duration-300 ease-out border
				${!item.is_read 
					? 'bg-app-surface border-app-border/40 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] hover:border-app-border-strong hover:bg-app-surface-hover/50 dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)]' 
					: 'bg-app-surface/60 border-app-border/20 shadow-none hover:bg-app-surface hover:border-app-border/40 hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]'
				}
			`}>
				
				{/* Elegant left accent bar for unread news */}
				{!item.is_read && (
					<div className="absolute left-0 top-6 bottom-6 w-[3px] bg-gradient-to-b from-brand to-brand/40 rounded-r-full opacity-80" />
				)}

				<div className='relative flex gap-4 items-center sm:items-start'>
					{/* Icon Container */}
					<div className='flex-shrink-0'>
						<div className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-105 group-active:scale-95
							${!item.is_read 
								? 'bg-gradient-to-br from-brand/10 to-brand/5 text-brand ring-1 ring-brand/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
								: 'bg-app-surface-strong/50 text-app-muted ring-1 ring-app-border/30 grayscale-[50%]'
							}
						`}>
							<Megaphone size={20} strokeWidth={!item.is_read ? 2.5 : 2} className={!item.is_read ? 'drop-shadow-sm' : ''} />
						</div>
					</div>
					
					{/* Content */}
					<div className='flex-1 min-w-0 pr-2 sm:pr-8 flex flex-col justify-center sm:pt-0.5'>
						<div className='flex items-start gap-3'>
							<h3 className={`text-[15px] sm:text-[16px] leading-[1.3] mb-1.5 transition-colors duration-300
								${!item.is_read ? 'font-semibold text-app-text tracking-tight' : 'font-medium text-app-text/60 group-hover:text-app-text/80'}
							`}
							style={{
								display: '-webkit-box',
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
							}}>
								{item.title}
							</h3>
							
							{/* Minimalistic unread dot */}
							{!item.is_read && (
								<div className='flex-shrink-0 mt-1.5'>
									<div className='w-1.5 h-1.5 rounded-full bg-brand ring-4 ring-brand/10 animate-pulse' />
								</div>
							)}
						</div>
						
						<p className={`text-[13px] tracking-wide transition-colors duration-300
							${!item.is_read ? 'text-app-muted' : 'text-app-faint'}
						`}>
							{formattedDate}
						</p>
					</div>

					{/* Hover Arrow */}
					<div className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 hidden sm:flex
						${!item.is_read ? 'text-brand opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0' : 'text-app-muted/30 opacity-0 group-hover:opacity-100'}
					`}>
						<ChevronRight size={20} strokeWidth={2} />
					</div>
				</div>
			</div>
		</div>
	)
})
