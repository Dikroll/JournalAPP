import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { DashboardCharts, FutureExams, HomeScheduleSection } from '@/widgets'
import { WebHomePage } from './WebHomePage'

export function HomePage() {
	const isDesktop = useIsDesktop()

	if (isDesktop) return <WebHomePage />

	return (
		<div className='min-h-screen pb-28'>
			<div className='px-4 pt-2 pb-4'>
				<DashboardCharts />

				<HomeScheduleSection />

				<div className='mt-5 mb-3 flex items-center '>
					<div className='w-[2px] self-stretch bg-app-border mr-3 rounded-full' />
					<h1 className='text-lg font-bold leading-tight text-app-text'>
						Будущие экзамены
					</h1>
				</div>

				<FutureExams />
			</div>
		</div>
	)
}