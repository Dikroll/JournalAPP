import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

const SLIDES = [
	{
		illustration: null,
		tag: 'Студенческий дневник',
		title: 'Всё в одном месте',
		description:
			'Расписание, оценки, домашние задания и платежи — всё что нужно студенту под рукой.',
	},
	{
		illustration: null,
		tag: 'Безопасность',
		title: 'Данные под защитой',
		description:
			'Данные хранятся на вашем устройстве и передаются по зашифрованному каналу. Мы не храним лишнего.',
	},
	{
		illustration: null,
		tag: 'Дизайн',
		title: 'Без лишнего шума',
		description:
			'Современный интерфейс без отвлекающих элементов. Только то, что действительно важно.',
	},
]

interface Props {
	onDone: () => void
}

export function OnboardingSlider({ onDone }: Props) {
	const [current, setCurrent] = useState(0)
	const isLast = current === SLIDES.length - 1
	const slide = SLIDES[current]

	const handleNext = () => {
		if (isLast) onDone()
		else setCurrent(c => c + 1)
	}

	return (
		<div
			className='relative flex flex-col'
			style={{
				width: '100%',
				height: '100dvh',
				backgroundColor: 'var(--color-bg)',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					bottom: '-80px',
					left: '-60px',
					width: '320px',
					height: '320px',
					background:
						'radial-gradient(circle, var(--color-brand-subtle) 0%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: '-60px',
					right: '-60px',
					width: '260px',
					height: '260px',
					background:
						'radial-gradient(circle, var(--color-brand-subtle) 0%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
				}}
			/>

			<div className='flex justify-end px-6 pt-8 relative z-10'>
				{!isLast && (
					<button
						onClick={onDone}
						style={{
							color: 'var(--color-text-faint)',
						}}
						className='text-xs hover:text-white/60 transition-colors'
					>
						Пропустить
					</button>
				)}
			</div>

			<div
				className='flex items-center justify-center px-8 pt-4 pb-2 relative z-10'
				style={{ flex: '1 1 0' }}
			>
				<div
					className='w-full max-w-[260px] aspect-square rounded-[32px] flex items-center justify-center'
					style={{
						background: 'var(--color-brand-subtle)',
						border: '1px solid var(--color-brand-border)',
					}}
				>
					{slide.illustration ?? (
						<div className='flex flex-col items-center gap-3 opacity-30'>
							<div
								className='w-16 h-16 rounded-2xl'
								style={{ background: 'var(--color-brand-subtle)' }}
							/>
							<div
								className='w-24 h-2 rounded-full'
								style={{ background: 'var(--color-text-faint)' }}
							/>
							<div
								className='w-16 h-2 rounded-full'
								style={{ background: 'var(--color-text-faint)' }}
							/>
						</div>
					)}
				</div>
			</div>

			<div className='px-8 pb-2 relative z-10'>
				<span
					className='text-xs font-medium px-2.5 py-1 rounded-full mb-4 inline-block'
					style={{
						background: 'var(--color-brand-subtle)',
						border: '1px solid var(--color-brand-border)',
						color: 'var(--color-brand)',
					}}
				>
					{slide.tag}
				</span>
				<h1
					className='text-2xl font-bold mb-3 leading-tight'
					style={{ color: 'var(--color-text)' }}
				>
					{slide.title}
				</h1>
				<p
					className='text-sm leading-relaxed'
					style={{ color: 'var(--color-text-muted)' }}
				>
					{slide.description}
				</p>
			</div>

			<div className='px-6 pb-10 pt-6 flex items-center justify-between relative z-10'>
				<div className='flex gap-1.5'>
					{SLIDES.map((_, i) => (
						<div
							key={i}
							onClick={() => setCurrent(i)}
							className='cursor-pointer transition-all duration-300'
							style={{
								width: i === current ? 20 : 6,
								height: 6,
								borderRadius: 3,
								background:
									i === current
										? 'var(--color-brand)'
										: 'var(--color-text-faint)',
							}}
						/>
					))}
				</div>

				<button
					onClick={handleNext}
					className='flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-95'
					style={{
						height: 48,
						paddingLeft: 24,
						paddingRight: 24,
						borderRadius: 16,
						background: 'var(--color-brand)',
						color: 'var(--color-text)',
					}}
				>
					{isLast ? 'Начать' : 'Далее'}
					<ArrowRight size={16} />
				</button>
			</div>
		</div>
	)
}
