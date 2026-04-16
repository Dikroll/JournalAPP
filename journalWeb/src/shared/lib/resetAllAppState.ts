import { useDashboardChartsStore } from '@/entities/dashboard/model/store'
import { useExamStore } from '@/entities/exam/model/store'
import { useGradesStore } from '@/entities/grades/model/store'
import { useHomeworkStore } from '@/entities/homework/model/store'
import { useLeaderboardStore } from '@/entities/leaderboard/model/store'
import { useLibraryStore } from '@/entities/library/model/store'
import { usePaymentStore } from '@/entities/payment/model/store'
import { useProfileDetailsStore } from '@/entities/profile/model/store'
import { useReviewStore } from '@/entities/review/model/store'
import {
	DEFAULT_STATUSES,
	useLessonNotesStore,
} from '@/entities/schedule/model/notesStore'
import { useScheduleStore } from '@/entities/schedule/model/store'
import { useSubjectStore } from '@/entities/subject/model/store'
import { useUserStore } from '@/entities/user/model/store'

import { storage } from '@/shared/lib/storage'
import { useThemeStore } from '@/shared/lib/themeStore'
import { useAuthStore } from '@/shared/model/authStore'
import { useOnboardingStore } from '@/shared/model/onboardingStore'

interface ResetOptions {
	resetAuth?: boolean
	resetTheme?: boolean
	resetOnboarding?: boolean
}

/**
 * Сброс состояния при logout или смене аккаунта.
 * Очищает storage ДО сброса сторов, иначе persist middleware подхватит старые данные.
 */
export function resetAllAppState(options: ResetOptions = {}) {
	const {
		resetAuth = true,
		resetTheme = true,
		resetOnboarding = true,
	} = options

	storage.clear('cache:')

	useGradesStore.getState().reset()
	useHomeworkStore.getState().reset()
	useLibraryStore.getState().reset()
	usePaymentStore.getState().reset()

	try {
		useExamStore.persist.clearStorage?.()
	} catch {}
	useExamStore.setState({
		exams: [],
		status: 'idle',
		loadedAt: null,
		results: [],
		resultsStatus: 'idle',
		resultsLoadedAt: null,
	})

	try {
		useSubjectStore.persist.clearStorage?.()
	} catch {}
	useSubjectStore.setState({
		subjects: [],
		status: 'idle',
		loadedAt: null,
	})

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
		weeks: {},
		weekStatus: {},
		weekLoadedAt: {},
		today: [],
		todayStatus: 'idle',
		todayLoadedAt: null,
		error: null,
	})

	try {
		useLessonNotesStore.persist.clearStorage?.()
	} catch {}
	useLessonNotesStore.setState({
		notes: {},
		statuses: DEFAULT_STATUSES,
	})

	useProfileDetailsStore.setState({
		details: null,
		status: 'idle',
	})

	try {
		useUserStore.persist.clearStorage?.()
	} catch {}
	useUserStore.setState({
		user: null,
	})

	if (resetOnboarding) {
		try {
			useOnboardingStore.persist.clearStorage?.()
		} catch {}
		useOnboardingStore.setState({
			isDone: false,
		})
	}

	if (resetTheme) {
		try {
			useThemeStore.persist.clearStorage?.()
		} catch {}
		useThemeStore.setState(state => ({
			...state,
			theme: 'dark',
		}))
	}

	if (resetAuth) {
		try {
			useAuthStore.persist.clearStorage?.()
		} catch {}
		useAuthStore.setState(state => ({
			token: null,
			isAuthenticated: false,
			activeUsername: null,
			accounts: state.accounts.filter(a => a.username !== state.activeUsername),
		}))
	}
}
