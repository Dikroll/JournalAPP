import { useNewsDetail } from '@/entities/news'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import { IconButton } from '@/shared/ui'
import { ArrowLeft, Calendar } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

export function NewsDetailPage() {
	const { id: idRaw } = useParams<{ id: string }>()
	const id = Number(idRaw)
	const navigate = useNavigate()
	const { detail, status } = useNewsDetail(id)
	useSwipeBack()

	const formattedDate = detail?.published_at
		? new Date(detail.published_at).toLocaleDateString('ru-RU', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		: null

	return (
		<div className='min-h-screen text-app-text pb-16'>
			{/* Header */}
			<div
				className='sticky top-0 z-10 flex items-center gap-3 px-4 pt-4 pb-3'
				style={{
					background: 'var(--color-bg)',
					borderBottom: '1px solid var(--color-border)',
					backdropFilter: 'blur(12px)',
				}}
			>
				<IconButton
					icon={<ArrowLeft size={18} />}
					onClick={() => navigate(-1)}
					size='md'
					shape='square'
					variant='surface'
					style={{ boxShadow: 'var(--shadow-card)' }}
					aria-label='Назад'
				/>
				<h1
					className='text-base font-bold text-app-text leading-tight flex-1 min-w-0'
					style={{
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}
				>
					{detail?.title ?? 'Новость'}
				</h1>
			</div>

			{/* Loading */}
			{status === 'loading' && (
				<div className='flex items-center justify-center py-24'>
					<div className='w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin' />
				</div>
			)}

			{/* Error */}
			{status === 'error' && (
				<div className='flex flex-col items-center justify-center py-24 gap-3 px-8 text-center'>
					<p className='text-app-muted text-sm'>Не удалось загрузить новость</p>
				</div>
			)}

			{/* Content */}
			{detail && (
				<>
					{/* Meta */}
					{formattedDate && (
						<div className='flex items-center gap-1.5 px-4 pt-4 pb-2 text-app-muted text-xs font-medium'>
							<Calendar size={13} />
							<span>{formattedDate}</span>
						</div>
					)}

					{/* HTML Content */}
					<div
						className='px-4 pt-2 news-content'
						dangerouslySetInnerHTML={{ __html: detail.content_html }}
					/>
				</>
			)}

			<style>{`
				.news-content img {
					border-radius: 20px;
					max-width: 100%;
					height: auto;
					display: block;
					margin: 0 auto 20px;
				}
				.news-content p {
					margin-bottom: 12px;
					line-height: 1.65;
					color: var(--color-text);
					font-size: 15px;
				}
				.news-content p:empty {
					margin-bottom: 4px;
				}
				.news-content b, .news-content strong {
					font-weight: 600;
					color: var(--color-text);
				}
				.news-content span {
					color: var(--color-text);
				}
				.news-content a {
					color: var(--color-accent);
					text-decoration: underline;
					text-underline-offset: 3px;
					word-break: break-all;
				}
			`}</style>
		</div>
	)
}
