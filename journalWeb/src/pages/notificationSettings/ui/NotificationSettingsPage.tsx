import {
	FIRST_LESSON_OFFSET_OPTIONS,
	POST_LUNCH_OFFSET_OPTIONS,
	REGULAR_LESSON_OFFSET_OPTIONS,
	useScheduleRemindersStore,
} from '@/features/scheduleReminders'
import { useSwipeBack } from '@/shared/hooks'
import { IconButton, PageHeader } from '@/shared/ui'
import { ArrowLeft, BellRing, Coffee, GraduationCap, Sunrise } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SettingRowProps {
	icon: LucideIcon
	title: string
	description?: string
	enabled: boolean
	onToggle: (value: boolean) => void
	options?: readonly number[]
	selectedOption?: number
	onSelectOption?: (value: number) => void
}

function SettingRow({
	icon: Icon,
	title,
	description,
	enabled,
	onToggle,
	options,
	selectedOption,
	onSelectOption,
}: SettingRowProps) {
	return (
		<div className='px-4 py-3.5 space-y-3'>
			<div className='flex items-center gap-3'>
				<div
					className='w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0'
					style={{
						background: enabled
							? 'var(--color-brand-subtle)'
							: 'var(--color-surface-strong)',
						border: enabled
							? '1px solid var(--color-brand-border)'
							: '1px solid var(--color-border)',
					}}
				>
					<Icon
						size={15}
						className={enabled ? 'text-brand' : 'text-app-muted'}
					/>
				</div>
				<div className='flex-1 min-w-0'>
					<p className='text-sm font-medium text-app-text'>{title}</p>
					{description && (
						<p className='text-[11px] text-app-faint mt-0.5'>{description}</p>
					)}
				</div>
				<button
					type='button'
					onClick={() => onToggle(!enabled)}
					className='relative w-11 h-[26px] rounded-full transition-colors duration-300 flex-shrink-0'
					style={{
						background: enabled
							? 'var(--color-brand)'
							: 'var(--color-border-strong)',
						WebkitTapHighlightColor: 'transparent',
					}}
					aria-pressed={enabled}
					aria-label={title}
				>
					<div
						className='absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300'
						style={{
							transform: enabled ? 'translateX(22px)' : 'translateX(3px)',
						}}
					/>
				</button>
			</div>
			{enabled && options && onSelectOption !== undefined && (
				<div className='flex items-center gap-2'>
					<span className='text-[11px] text-app-faint flex-shrink-0'>За</span>
					<div className='flex flex-1 gap-1.5'>
						{options.map(option => {
							const active = option === selectedOption
							return (
								<button
									key={option}
									type='button'
									onClick={() => onSelectOption(option)}
									className='flex-1 py-2 rounded-xl text-xs font-medium transition-colors min-h-[36px]'
									style={{
										background: active
											? 'var(--color-brand)'
											: 'var(--color-surface-strong)',
										color: active ? '#fff' : 'var(--color-text-muted)',
										border: active
											? '1px solid var(--color-brand-border)'
											: '1px solid var(--color-border)',
										WebkitTapHighlightColor: 'transparent',
									}}
								>
									{option} мин
								</button>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}

function SectionCard({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) {
	return (
		<div className='space-y-2'>
			<p className='text-xs font-semibold text-app-muted uppercase tracking-wider px-1'>
				{title}
			</p>
			<div
				className='rounded-[20px] overflow-hidden'
				style={{
					background: 'var(--color-surface)',
					border: '1px solid var(--color-border)',
					boxShadow: 'var(--shadow-card)',
				}}
			>
				{children}
			</div>
		</div>
	)
}

function Divider() {
	return (
		<div className='mx-4 h-px' style={{ background: 'var(--color-border)' }} />
	)
}

export function NotificationSettingsPage() {
	const navigate = useNavigate()
	useSwipeBack()

	const enabled = useScheduleRemindersStore(s => s.enabled)
	const setEnabled = useScheduleRemindersStore(s => s.setEnabled)
	const firstLessonEnabled = useScheduleRemindersStore(s => s.firstLessonEnabled)
	const setFirstLessonEnabled = useScheduleRemindersStore(
		s => s.setFirstLessonEnabled,
	)
	const firstLessonOffset = useScheduleRemindersStore(s => s.firstLessonOffset)
	const setFirstLessonOffset = useScheduleRemindersStore(
		s => s.setFirstLessonOffset,
	)
	const regularLessonEnabled = useScheduleRemindersStore(
		s => s.regularLessonEnabled,
	)
	const setRegularLessonEnabled = useScheduleRemindersStore(
		s => s.setRegularLessonEnabled,
	)
	const regularLessonOffset = useScheduleRemindersStore(
		s => s.regularLessonOffset,
	)
	const setRegularLessonOffset = useScheduleRemindersStore(
		s => s.setRegularLessonOffset,
	)
	const lunchBreakEnabled = useScheduleRemindersStore(s => s.lunchBreakEnabled)
	const setLunchBreakEnabled = useScheduleRemindersStore(
		s => s.setLunchBreakEnabled,
	)
	const postLunchEnabled = useScheduleRemindersStore(s => s.postLunchEnabled)
	const setPostLunchEnabled = useScheduleRemindersStore(
		s => s.setPostLunchEnabled,
	)
	const postLunchOffset = useScheduleRemindersStore(s => s.postLunchOffset)
	const setPostLunchOffset = useScheduleRemindersStore(s => s.setPostLunchOffset)

	return (
		<div className='pb-6 text-app-text'>
			<div className='flex items-center gap-2 px-4 pt-4 pb-4'>
				<IconButton
					icon={<ArrowLeft size={18} />}
					onClick={() => navigate(-1)}
					size='md'
					shape='square'
					variant='surface'
					style={{ boxShadow: 'var(--shadow-card)' }}
					aria-label='Назад'
				/>
				<div className='flex-1'>
					<PageHeader title='Уведомления' />
				</div>
			</div>

			<div className='px-4 space-y-3'>
				<SectionCard title='Общее'>
					<SettingRow
						icon={BellRing}
						title='Включить уведомления'
						description='Главный переключатель всех напоминаний'
						enabled={enabled}
						onToggle={setEnabled}
					/>
				</SectionCard>

				{enabled && (
					<SectionCard title='Расписание'>
						<SettingRow
							icon={Sunrise}
							title='Перед первой парой'
							description='Чтобы успеть собраться и доехать'
							enabled={firstLessonEnabled}
							onToggle={setFirstLessonEnabled}
							options={FIRST_LESSON_OFFSET_OPTIONS}
							selectedOption={firstLessonOffset}
							onSelectOption={setFirstLessonOffset}
						/>
						<Divider />
						<SettingRow
							icon={GraduationCap}
							title='Перед обычной парой'
							description='Между парами в течение дня'
							enabled={regularLessonEnabled}
							onToggle={setRegularLessonEnabled}
							options={REGULAR_LESSON_OFFSET_OPTIONS}
							selectedOption={regularLessonOffset}
							onSelectOption={setRegularLessonOffset}
						/>
						<Divider />
						<SettingRow
							icon={Coffee}
							title='Обеденный перерыв'
							description='Уведомление в начале большого перерыва'
							enabled={lunchBreakEnabled}
							onToggle={setLunchBreakEnabled}
						/>
						<Divider />
						<SettingRow
							icon={GraduationCap}
							title='Перед парой после обеда'
							description='Чтобы вернуться вовремя'
							enabled={postLunchEnabled}
							onToggle={setPostLunchEnabled}
							options={POST_LUNCH_OFFSET_OPTIONS}
							selectedOption={postLunchOffset}
							onSelectOption={setPostLunchOffset}
						/>
					</SectionCard>
				)}
			</div>
		</div>
	)
}
