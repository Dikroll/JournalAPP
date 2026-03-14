import { resetFetchStarted as resetDashboardFetch } from '@/entities/dashboard/hooks/useDashboardCharts'
import { useDashboardChartsStore } from '@/entities/dashboard/model/store'
import { useExamStore } from '@/entities/exam/model/store'
import { resetGradesFetch } from '@/entities/grades/hooks/useGrades'
import { useGradesStore } from '@/entities/grades/model/store'
import { useHomeworkStore } from '@/entities/homework/model/store'
import { useLeaderboardStore } from '@/entities/leaderboard/model/store'
import { useProfileDetailsStore } from '@/entities/profile/model/store'
import { useReviewStore } from '@/entities/review/model/store'
import { useScheduleStore } from '@/entities/schedule/model/store'
import { useSubjectStore } from '@/entities/subject/model/store'
import { useUserStore } from '@/entities/user/model/store'
import { resetInitUserFetch } from '@/features/initUser/hooks/useInitUser'
import { storage } from '@/shared/lib/storage'

export function resetAllStores(): void {
	// Сторы с reset()
	useHomeworkStore.getState().reset()

	// Persist сторы — сбрасываем через setState И чистим localStorage
	useUserStore.setState({ user: null })
	useExamStore.setState({ exams: [], status: 'idle', loadedAt: null })
	useSubjectStore.setState({ subjects: [], status: 'idle', loadedAt: null })

	// Сбрасываем модульные флаги fetchStarted — иначе после смены аккаунта фетч не запустится
	resetDashboardFetch()
	resetGradesFetch()
	resetInitUserFetch()

	// In-memory сторы
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
	useReviewStore.setState({ reviews: [], status: 'idle', loadedAt: null })
	useScheduleStore.setState({
		today: [],
		todayStatus: 'idle',
		todayLoadedAt: null,
		error: null,
		months: {},
		monthStatus: {},
		monthLoadedAt: {},
	})
	useProfileDetailsStore.setState({ details: null, status: 'idle' })

	// Grades
	const gradesState = useGradesStore.getState()
	if (typeof (gradesState as any).reset === 'function') {
		;(gradesState as any).reset()
	} else {
		useGradesStore.setState({
			entries: [],
			status: 'idle',
			error: null,
			loadedAt: null,
			bySubject: {},
		})
	}

	// Чистим persist ключи из localStorage
	;['user-store', 'exam-store', 'subject-store'].forEach(k =>
		localStorage.removeItem(k),
	)

	// Чистим кэш
	storage.clear('cache:')
}
