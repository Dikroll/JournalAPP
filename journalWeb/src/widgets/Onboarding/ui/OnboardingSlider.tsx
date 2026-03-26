import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

const SLIDES = [
	{
		illustration: null, // заменить на <img src='/illustrations/slide1.png' />
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

const ONBOARDING_KEY = 'onboarding_done'

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
				backgroundColor: '#0f0f0f',
				overflow: 'hidden',
			}}
		>
			{/* Фоновый акцент */}
			<div
				style={{
					position: 'absolute',
					bottom: '-80px',
					left: '-60px',
					width: '320px',
					height: '320px',
					background:
						'radial-gradient(circle, rgba(213,4,22,0.12) 0%, transparent 70%)',
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
						'radial-gradient(circle, rgba(213,4,22,0.07) 0%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
				}}
			/>

			{/* Пропустить */}
			<div className='flex justify-end px-6 pt-8 relative z-10'>
				{!isLast && (
					<button
						onClick={onDone}
						className='text-xs text-white/30 hover:text-white/60 transition-colors'
					>
						Пропустить
					</button>
				)}
			</div>

			{/* Иллюстрация */}
			<div className='flex items-center justify-center px-8 pt-4 pb-2 relative z-10' style={{ flex: '1 1 0' }}>
				<div
					className='w-full max-w-[260px] aspect-square rounded-[32px] flex items-center justify-center'
					style={{
						background: 'rgba(213,4,22,0.06)',
						border: '1px solid rgba(213,4,22,0.15)',
					}}
				>
					{/* Место под иллюстрацию */}
					{slide.illustration ?? (
						<div className='flex flex-col items-center gap-3 opacity-30'>
							<div
								className='w-16 h-16 rounded-2xl'
								style={{ background: 'rgba(213,4,22,0.3)' }}
							/>
							<div
								className='w-24 h-2 rounded-full'
								style={{ background: 'rgba(255,255,255,0.15)' }}
							/>
							<div
								className='w-16 h-2 rounded-full'
								style={{ background: 'rgba(255,255,255,0.1)' }}
							/>
						</div>
					)}
				</div>
			</div>

			{/* Текст */}
			<div className='px-8 pb-2 relative z-10'>
				<span
					className='text-xs font-medium px-2.5 py-1 rounded-full mb-4 inline-block'
					style={{
						background: 'rgba(213,4,22,0.12)',
						border: '1px solid rgba(213,4,22,0.2)',
						color: '#D50416',
					}}
				>
					{slide.tag}
				</span>
				<h1 className='text-2xl font-bold text-white mb-3 leading-tight'>
					{slide.title}
				</h1>
				<p className='text-sm leading-relaxed text-white/50'>
					{slide.description}
				</p>
			</div>

			{/* Нижняя панель */}
			<div className='px-6 pb-10 pt-6 flex items-center justify-between relative z-10'>
				{/* Точки */}
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
										? '#D50416'
										: 'rgba(255,255,255,0.15)',
							}}
						/>
					))}
				</div>

				{/* Кнопка */}
				<button
					onClick={handleNext}
					className='flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-95'
					style={{
						height: 48,
						paddingLeft: 24,
						paddingRight: 24,
						borderRadius: 16,
						background: '#D50416',
						color: 'white',
					}}
				>
					{isLast ? 'Начать' : 'Далее'}
					<ArrowRight size={16} />
				</button>
			</div>
		</div>
	)
}

// Хелпер для использования снаружи
export const onboardingStorage = {
	isDone: () => localStorage.getItem(ONBOARDING_KEY) === 'true',
	setDone: () => localStorage.setItem(ONBOARDING_KEY, 'true'),
}