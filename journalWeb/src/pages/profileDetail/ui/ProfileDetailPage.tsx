import { resetAllStores } from '@/app/lib/resetAllStores'
import { useProfileDetails } from '@/entities/profile'
import { AccountSwitcher } from '@/features/changeUser'
import { pageConfig } from '@/shared/config'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import { ErrorView, PageHeader, SkeletonList } from '@/shared/ui'
import {
	ProfileAvatar,
	ProfileInfoCard,
	ProfilePaymentCard,
	ProfileRelativesCard,
} from '@/widgets'
import { ArrowLeft, CheckCircle, Trash2, Users } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ClearCacheSheet({ onClose }: { onClose: () => void }) {
	const [done, setDone] = useState(false)

	const handleClear = useCallback(() => {
		resetAllStores()
		setDone(true)
	}, [])

	return (
		<div
			className='fixed inset-0 flex items-end z-[200]'
			style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
			onClick={done ? onClose : undefined}
		>
			<div
				className='w-full rounded-t-[28px] p-5 space-y-3'
				style={{
					background: '#1A1C21',
					border: '1px solid rgba(255,255,255,0.08)',
				}}
				onClick={e => e.stopPropagation()}
			>
				<div className='w-10 h-1 bg-white/20 rounded-full mx-auto mb-2' />

				{done ? (
					<div className='flex flex-col items-center gap-3 py-4'>
						<div className='w-12 h-12 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center'>
							<CheckCircle size={24} className='text-[#10B981]' />
						</div>
						<p className='text-sm font-semibold text-[#F2F2F2]'>Кэш очищен</p>
						<p className='text-xs text-[#6B7280] text-center'>
							Данные обновятся при следующем открытии страниц
						</p>
						<button
							type='button'
							onTouchEnd={e => {
								e.stopPropagation()
								onClose()
							}}
							onClick={onClose}
							className='w-full mt-2 py-3.5 rounded-[18px] text-sm font-medium text-[#9CA3AF] bg-white/5 border border-white/8 active:bg-white/10 transition-colors'
							style={{
								WebkitTapHighlightColor: 'transparent',
								touchAction: 'manipulation',
							}}
						>
							Закрыть
						</button>
					</div>
				) : (
					<>
						<div className='flex items-center gap-3 mb-1'>
							<div className='w-10 h-10 rounded-full bg-white/5 border border-white/8 flex items-center justify-center'>
								<Trash2 size={18} className='text-[#9CA3AF]' />
							</div>
							<div>
								<p className='text-sm font-semibold text-[#F2F2F2]'>
									Очистить кэш приложения?
								</p>
								<p className='text-xs text-[#6B7280] mt-0.5'>
									Оценки, расписание и ДЗ загрузятся заново
								</p>
							</div>
						</div>

						<button
							type='button'
							onTouchEnd={e => {
								e.stopPropagation()
								handleClear()
							}}
							onClick={handleClear}
							className='w-full py-3.5 rounded-[18px] text-sm font-semibold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 active:bg-[#EF4444]/20 transition-colors'
							style={{
								WebkitTapHighlightColor: 'transparent',
								touchAction: 'manipulation',
							}}
						>
							Очистить
						</button>

						<button
							type='button'
							onTouchEnd={e => {
								e.stopPropagation()
								onClose()
							}}
							onClick={onClose}
							className='w-full py-3.5 rounded-[18px] text-sm font-medium text-[#9CA3AF] bg-white/5 border border-white/8 active:bg-white/10 transition-colors'
							style={{
								WebkitTapHighlightColor: 'transparent',
								touchAction: 'manipulation',
							}}
						>
							Отмена
						</button>
					</>
				)}
			</div>
		</div>
	)
}

export function ProfileDetailsPage() {
	const navigate = useNavigate()
	const { details, status } = useProfileDetails()
	const [showSwitcher, setShowSwitcher] = useState(false)
	const [showClearCache, setShowClearCache] = useState(false)

	useSwipeBack()

	// touch-координата для хедер-кнопок (чтобы не стрелять при скролле)
	const touchStartY = useRef(0)
	const onTouchStart = (e: React.TouchEvent) => {
		touchStartY.current = e.touches[0].clientY
	}
	const makeTouchEnd = (cb: () => void) => (e: React.TouchEvent) => {
		if (Math.abs(e.changedTouches[0].clientY - touchStartY.current) > 10) return
		cb()
	}

	const handleAddAccount = () => {
		navigate(`${pageConfig.login}?addAccount=true`)
	}

	return (
		<div className='pb-6'>
			<div className='flex items-center gap-2 px-4 pt-4 pb-4'>
				<button
					type='button'
					onTouchStart={onTouchStart}
					onTouchEnd={makeTouchEnd(() => navigate(-1))}
					onClick={() => navigate(-1)}
					className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform'
					style={{
						boxShadow: 'var(--shadow-card)',
						WebkitTapHighlightColor: 'transparent',
						touchAction: 'manipulation',
					}}
				>
					<ArrowLeft size={18} />
				</button>

				<div className='flex-1'>
					<PageHeader title='Детали профиля' />
				</div>

				<button
					type='button'
					onTouchStart={onTouchStart}
					onTouchEnd={makeTouchEnd(() => setShowSwitcher(true))}
					onClick={() => setShowSwitcher(true)}
					className='flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-app-surface border border-app-border text-app-muted text-xs hover:bg-app-surface-hover transition-colors'
					style={{
						boxShadow: 'var(--shadow-card)',
						minHeight: 36,
						WebkitTapHighlightColor: 'transparent',
						touchAction: 'manipulation',
					}}
				>
					<Users size={14} />
					Аккаунты
				</button>

				<button
					type='button'
					onTouchStart={onTouchStart}
					onTouchEnd={makeTouchEnd(() => setShowClearCache(true))}
					onClick={() => setShowClearCache(true)}
					className='flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-app-surface border border-app-border text-app-muted text-xs hover:bg-app-surface-hover transition-colors'
					style={{
						boxShadow: 'var(--shadow-card)',
						minHeight: 36,
						WebkitTapHighlightColor: 'transparent',
						touchAction: 'manipulation',
					}}
				>
					<Trash2 size={14} />
					Кэш
				</button>
			</div>

			<div className='px-4 space-y-3'>
				{status === 'loading' && <SkeletonList count={3} height={120} />}
				{status === 'error' && (
					<ErrorView message='Не удалось загрузить данные' />
				)}
				{details && (
					<>
						<ProfileAvatar details={details} />
						<ProfileInfoCard details={details} />
						<ProfileRelativesCard relatives={details.relatives} />
						<ProfilePaymentCard />
					</>
				)}
			</div>

			{/* Шторки */}
			{showSwitcher && (
				<AccountSwitcher
					onClose={() => setShowSwitcher(false)}
					onAddAccount={handleAddAccount}
					onReset={resetAllStores}
				/>
			)}

			{showClearCache && (
				<ClearCacheSheet onClose={() => setShowClearCache(false)} />
			)}
		</div>
	)
}
