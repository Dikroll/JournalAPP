interface Props {
	hasAnyEntries: boolean
	onPressSetup: () => void
}

export function EmptyGoalsState({ hasAnyEntries, onPressSetup }: Props) {
	if (!hasAnyEntries) {
		return (
			<div
				className='rounded-[22px] p-6 text-center'
				style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
			>
				<div className='text-app-text font-medium mb-1'>Пока нет данных</div>
				<div className='text-app-muted text-sm'>
					Расчёты появятся после того, как начнут ставить оценки.
				</div>
			</div>
		)
	}

	return (
		<div
			className='rounded-[22px] p-4'
			style={{
				background: 'var(--color-brand-subtle)',
				border: '1px dashed var(--color-brand-border)',
			}}
		>
			<div className='text-[13px] mb-1'>👋 Поставь цель на семестр</div>
			<div className='text-app-muted text-[11px] mb-3'>
				Пока без целей покажу предметы, где есть риск хвоста.
			</div>
			<button
				type='button'
				onClick={onPressSetup}
				className='rounded-[12px] text-white font-medium text-[12px] px-4 py-2'
				style={{ background: 'var(--color-brand)', minHeight: 44 }}
			>
				Настроить цели
			</button>
		</div>
	)
}
