import { DashboardCharts, FutureExams, HomeScheduleSection } from '@/widgets'
export function HomePage() {
	return (
		<div className='min-h-screen pb-28'>
			<div className='px-4 pt-2 pb-4'>
				<DashboardCharts />

				<HomeScheduleSection />

				<div className='mt-5 mb-3'>
					<h1 className='text-lg font-bold leading-tight text-app-text'>
						Будущие экзамены
					</h1>
				</div>

				<FutureExams />
			</div>
		</div>
	)
}
