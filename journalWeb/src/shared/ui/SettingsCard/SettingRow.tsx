import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { OptionPills, type PillOption } from './OptionPills'

interface Props<T extends string | number> {
	icon: LucideIcon
	title: string
	description?: string
	enabled: boolean
	onToggle: (value: boolean) => void
	pills?: readonly PillOption<T>[]
	pillsLabel?: string
	selectedPill?: T
	onSelectPill?: (value: T) => void
	children?: ReactNode
}

export function SettingRow<T extends string | number>({
	icon: Icon,
	title,
	description,
	enabled,
	onToggle,
	pills,
	pillsLabel = 'За',
	selectedPill,
	onSelectPill,
	children,
}: Props<T>) {
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
			{enabled && pills && selectedPill !== undefined && onSelectPill && (
				<OptionPills
					label={pillsLabel}
					options={pills}
					selected={selectedPill}
					onSelect={onSelectPill}
				/>
			)}
			{enabled && children}
		</div>
	)
}
