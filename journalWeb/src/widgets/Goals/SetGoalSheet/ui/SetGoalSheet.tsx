import { BottomSheet } from '@/shared/ui'
import { useState } from 'react'

interface Props {
	onClose: () => void
	specName: string
	initialTarget: number | null
	onSave: (target: number) => void
	onRemove: () => void
}

const CHOICES = [3, 4, 5] as const

export function SetGoalSheet({
	onClose,
	specName,
	initialTarget,
	onSave,
	onRemove,
}: Props) {
	const [selected, setSelected] = useState<number>(initialTarget ?? 5)

	return (
		<BottomSheet onBackdropClick={onClose}>
			<div
				className='px-4 pt-2 pb-4'
				style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
			>
				<div className='font-semibold text-[14px]'>Цель по «{specName}»</div>
				<div className='text-app-muted text-[11px] mt-1 mb-4'>
					Какую итоговую хочешь?
				</div>
				<div className='flex gap-2 mb-4'>
					{CHOICES.map(v => (
						<button
							key={v}
							type='button'
							onClick={() => setSelected(v)}
							className='flex-1 rounded-[12px] text-[16px] font-semibold'
							style={{
								minHeight: 48,
								background:
									selected === v
										? 'var(--color-brand)'
										: 'var(--color-surface)',
								color: selected === v ? '#fff' : 'var(--color-text)',
								border: '1px solid var(--color-border)',
							}}
						>
							{v}
						</button>
					))}
				</div>
				<button
					type='button'
					onClick={() => {
						onSave(selected)
						onClose()
					}}
					className='w-full rounded-[12px] text-white font-semibold text-[13px]'
					style={{
						background: 'var(--color-brand)',
						minHeight: 48,
					}}
				>
					Сохранить
				</button>
				{initialTarget !== null && (
					<button
						type='button'
						onClick={() => {
							onRemove()
							onClose()
						}}
						className='w-full text-center text-[12px] text-app-muted mt-3'
						style={{ minHeight: 44 }}
					>
						Убрать цель
					</button>
				)}
			</div>
		</BottomSheet>
	)
}
