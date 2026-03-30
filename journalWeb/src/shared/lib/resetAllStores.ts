import { resetFetchStarted as resetDashboardFetch } from '@/entities/dashboard/hooks/useDashboardCharts'
import { useDashboardChartsStore } from '@/entities/dashboard/model/store'
import { useExamStore } from '@/entities/exam/model/store'
import { resetGradesFetch } from '@/entities/grades/hooks/useGrades'
import { useGradesStore } from '@/entities/grades/model/store'
import { resetHomeworkFetch } from '@/entities/homework/hooks/useHomework'
import { useHomeworkStore } from '@/entities/homework/model/store'
import { useLeaderboardStore } from '@/entities/leaderboard/model/store'
import { usePaymentStore } from '@/entities/payment/model/store'
import { useProfileDetailsStore } from '@/entities/profile/model/store'
import { useReviewStore } from '@/entities/review/model/store'
import { resetScheduleTodayFetch } from '@/entities/schedule/hooks/useScheduleToday'
import { useScheduleStore } from '@/entities/schedule/model/store'
import { resetSubjectsFetch } from '@/entities/subject/hooks/useSubjects'
import { useSubjectStore } from '@/entities/subject/model/store'
import { useUserStore } from '@/entities/user/model/store'
import { resetInitUserFetch } from '@/features/initUser/hooks/useInitUser'

export function resetAllStores(): void {
	// Эти функции теперь no-op (флаги перенесены в useRef),
	// но оставлены для обратной совместимости
	resetDashboardFetch()
	resetGradesFetch()
	resetHomeworkFetch()
	resetInitUserFetch()
	resetScheduleTodayFetch()
	resetSubjectsFetch()

	useHomeworkStore.getState().reset()
	useGradesStore.getState().reset()
	usePaymentStore.getState().reset()

	useUserStore.setState({ user: null })
	useExamStore.setState({
		exams: [],
		status: 'idle',
		loadedAt: null,
		results: [],
		resultsStatus: 'idle',
		resultsLoadedAt: null,
	})
	useSubjectStore.setState({ subjects: [], status: 'idle', loadedAt: null })

	useDashboardChartsStore.setState({
		progress: [],
		attendance: [],
		status: 'idle',
		loadedAt: null,
	})

	useLeaderboardStore.setState({
		group: { data: null, status: 'idle', loadedAt: null },
		stream: { data: null, status: 'idle', loadedAt: null },
	})

	useReviewStore.setState({
		reviews: [],
		status: 'idle',
		loadedAt: null,
	})

	useScheduleStore.setState({
		months: {},
		monthStatus: {},
		monthLoadedAt: {},
		today: [],
		todayStatus: 'idle',
		todayLoadedAt: null,
		error: null,
	})

	useProfileDetailsStore.setState({
		details: null,
		status: 'idle',
	})
}
