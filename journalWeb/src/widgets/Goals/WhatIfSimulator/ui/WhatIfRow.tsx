import type { GradeType } from '@/shared/types'
import { Minus, Plus } from 'lucide-react'

const LABEL: Record<GradeType, string> = {
	control: 'Контроль',
	homework: 'ДЗ',
	lab: 'Лаб',
	classwork: 'КР',
	practical: 'Практ',
	final: 'Зачёт',
}

const VALUE_COLOR: Record<3 | 4 | 5, string> = {
	3: '#f0a020',
	4: '#4d9ef7',
	5: '#22c98a',
}

interface Props {
	type: GradeType
	value: 3 | 4 | 5
	repeat: number
	hint?: string
	onChangeRepeat: (next: number) => void
	onChangeValue: (next: 3 | 4 | 5) => void
}

export function WhatIfRow({
	type,
	value,
	repeat,
	hint,
	onChangeRepeat,
	onChangeValue,
}: Props) {
	const dec = () => onChangeRepeat(Math.max(0, repeat - 1))
	const inc = () => onChangeRepeat(Math.min(10, repeat + 1))
	const active = repeat > 0

	return (
		<div
			className='rounded-[18px] px-3 py-2.5 mb-2'
			style={{
				background: active
					? 'var(--color-brand-subtle)'
					: 'var(--color-surface)',
				border: `1px solid ${
					active ? 'var(--color-brand-border)' : 'var(--color-border)'
				}`,
			}}
		>
			<div className='flex items-center justify-between gap-2 mb-2'>
				<div className='min-w-0'>
					<div className='text-[13px] font-semibold text-app-text truncate'>
						{LABEL[type]}
					</div>
					{hint && (
						<div className='text-[10px] text-app-muted truncate'>{hint}</div>
					)}
				</div>
				<div className='flex items-center gap-1 shrink-0'>
					<button
						type='button'
						onClick={dec}
						aria-label='Меньше'
						disabled={repeat === 0}
						className='rounded-full flex items-center justify-center disabled:opacity-40'
						style={{
							width: 32,
							height: 32,
							background: 'var(--color-surface-strong)',
							border: '1px solid var(--color-border)',
							color: 'var(--color-text)',
						}}
					>
						<Minus size={14} />
					</button>
					<div
						className='text-center font-semibold text-[13px] tabular-nums'
						style={{ minWidth: 28, color: 'var(--color-text)' }}
					>
						{repeat}
					</div>
					<button
						type='button'
						onClick={inc}
						aria-label='Больше'
						disabled={repeat >= 10}
						className='rounded-full flex items-center justify-center disabled:opacity-40'
						style={{
							width: 32,
							height: 32,
							background: 'var(--color-brand)',
							color: '#fff',
							border: '1px solid var(--color-brand)',
						}}
					>
						<Plus size={14} />
					</button>
				</div>
			</div>

			<div
				className='flex gap-1 p-1 rounded-[12px]'
				style={{
					background: 'var(--color-surface-strong)',
					border: '1px solid var(--color-border)',
				}}
			>
				{([3, 4, 5] as const).map(v => {
					const selected = v === value
					return (
						<button
							key={v}
							type='button'
							onClick={() => onChangeValue(v)}
							className='flex-1 rounded-[10px] text-[13px] font-semibold transition-colors'
							style={{
								minHeight: 32,
								background: selected ? VALUE_COLOR[v] : 'transparent',
								color: selected ? '#fff' : 'var(--color-text)',
							}}
						>
							{v}
						</button>
					)
				})}
			</div>
		</div>
	)
}
