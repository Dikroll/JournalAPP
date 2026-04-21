import type { GradeType } from '@/shared/types'

const LABEL: Record<GradeType, string> = {
	control: 'Контроль',
	homework: 'ДЗ',
	lab: 'Лаб',
	classwork: 'КР',
	practical: 'Практ',
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
	const cycleValue = () => {
		const next = value === 5 ? 3 : value === 3 ? 4 : 5
		onChangeValue(next as 3 | 4 | 5)
	}

	return (
		<div
			className='rounded-[20px] px-3.5 py-2.5 mb-1.5 flex items-center justify-between'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
				minHeight: 52,
			}}
		>
			<div>
				<strong className='text-[13px]'>{LABEL[type]}</strong>
				{hint && <div className='text-[10px] text-app-muted'>{hint}</div>}
			</div>
			<div className='flex items-center gap-1.5'>
				<button
					type='button'
					onClick={dec}
					className='rounded-[10px]'
					style={{
						width: 32,
						height: 32,
						background: 'var(--color-surface-strong)',
						border: '1px solid var(--color-border)',
						color: 'var(--color-text)',
						fontSize: 18,
					}}
				>
					−
				</button>
				<button
					type='button'
					onClick={cycleValue}
					className='font-semibold text-center'
					style={{
						minWidth: 48,
						minHeight: 32,
						background: 'transparent',
						border: 'none',
						color: 'var(--color-text)',
					}}
				>
					{repeat}×{value}
				</button>
				<button
					type='button'
					onClick={inc}
					className='rounded-[10px]'
					style={{
						width: 32,
						height: 32,
						background: 'var(--color-surface-strong)',
						border: '1px solid var(--color-border)',
						color: 'var(--color-text)',
						fontSize: 18,
					}}
				>
					+
				</button>
			</div>
		</div>
	)
}
