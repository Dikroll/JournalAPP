import { GRADE_BG, GRADE_COLOR } from '@/shared/config'
import type { GradeType } from '@/shared/types'
import { Minus, Plus } from 'lucide-react'

const LABEL: Record<GradeType, string> = {
	control: 'Контрольная',
	homework: 'Домашняя',
	lab: 'Лабораторная',
	classwork: 'Классная',
	practical: 'Практическая',
	final: 'Зачёт',
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
			className='rounded-[20px] p-4 mb-2 transition-colors'
			style={{
				background: active ? GRADE_BG[value] : 'var(--color-surface)',
				border: `1px solid ${
					active ? GRADE_COLOR[value] + '55' : 'var(--color-border)'
				}`,
				boxShadow: active ? 'none' : 'var(--shadow-card)',
			}}
		>
			<div className='flex items-center justify-between gap-3 mb-3'>
				<div className='min-w-0'>
					<div className='text-[15px] font-semibold text-app-text truncate'>
						{LABEL[type]}
					</div>
					{hint && (
						<div className='text-[12px] text-app-muted truncate mt-0.5'>
							{hint}
						</div>
					)}
				</div>
				<div
					className='flex items-center gap-2 shrink-0 rounded-full px-1 py-1'
					style={{
						background: 'var(--color-surface-strong)',
						border: '1px solid var(--color-border)',
					}}
				>
					<button
						type='button'
						onClick={dec}
						aria-label='Меньше'
						disabled={repeat === 0}
						className='rounded-full flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform'
						style={{
							width: 36,
							height: 36,
							background: 'var(--color-surface)',
							color: 'var(--color-text)',
						}}
					>
						<Minus size={16} />
					</button>
					<div
						className='text-center font-bold text-[16px] tabular-nums'
						style={{
							minWidth: 22,
							color: active ? GRADE_COLOR[value] : 'var(--color-text)',
						}}
					>
						{repeat}
					</div>
					<button
						type='button'
						onClick={inc}
						aria-label='Больше'
						disabled={repeat >= 10}
						className='rounded-full flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform'
						style={{
							width: 36,
							height: 36,
							background: GRADE_COLOR[value],
							color: '#fff',
						}}
					>
						<Plus size={16} />
					</button>
				</div>
			</div>

			<div className='flex gap-1.5'>
				{([3, 4, 5] as const).map(v => {
					const selected = v === value
					return (
						<button
							key={v}
							type='button'
							onClick={() => onChangeValue(v)}
							className='flex-1 rounded-[14px] text-[15px] font-semibold transition-all active:scale-[0.97]'
							style={{
								minHeight: 44,
								background: selected ? GRADE_COLOR[v] : 'transparent',
								color: selected ? '#fff' : GRADE_COLOR[v],
								border: `1px solid ${
									selected ? GRADE_COLOR[v] : 'var(--color-border)'
								}`,
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
