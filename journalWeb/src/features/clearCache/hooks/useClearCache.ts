import { useThemeStore } from '@/app/lib/themeStore'
import { useDashboardChartsStore } from '@/entities/dashboard/model/store'
import { useExamStore } from '@/entities/exam/model/store'
import { useGradesStore } from '@/entities/grades/model/store'
import { useHomeworkStore } from '@/entities/homework/model/store'
import { useLeaderboardStore } from '@/entities/leaderboard/model/store'
import { usePaymentStore } from '@/entities/payment/model/store'
import { useProfileDetailsStore } from '@/entities/profile/model/store'
import { useReviewStore } from '@/entities/review/model/store'
import { useScheduleStore } from '@/entities/schedule/model/store'
import { useSubjectStore } from '@/entities/subject/model/store'
import { useUserStore } from '@/entities/user/model/store'
import { useOnboardingStore } from '@/features/showOnboarding/model/store'

export function clearCache(): void {
	// Сбрасываем ВЕСЬ кэш и состояния к состоянию как при первой установке

	// === ENTITIES CACHE ===
	// Grades
	useGradesStore.setState(state => ({
		...state,
		status: 'idle',
		loadedAt: null,
		bySubject: {},
	}))

	// Grades by subject
	useGradesStore.setState(state => ({
		...state,
		bySubject: {},
	}))

	// Homework
	useHomeworkStore.setState(state => ({
		...state,
		status: 'idle',
		loadedAt: null,
		bySubject: {},
	}))

	// Subjects
	useSubjectStore.setState(state => ({
		...state,
		status: 'idle',
		loadedAt: null,
		subjects: [], // Сбрасываем кэшированные предметы
	}))

	// Dashboard charts
	useDashboardChartsStore.setState(state => ({
		...state,
		status: 'idle',
		loadedAt: null,
	}))

	// Exams
	useExamStore.setState(state => ({
		...state,
		status: 'idle',
		loadedAt: null,
		resultsStatus: 'idle',
		resultsLoadedAt: null,
		exams: [], // Сбрасываем кэшированные экзамены
		results: [], // Сбрасываем результаты
	}))

	// Schedule
	useScheduleStore.setState(state => ({
		...state,
		todayStatus: 'idle',
		todayLoadedAt: null,
		monthStatus: {},
		monthLoadedAt: {},
		error: null,
	}))

	// Leaderboard
	useLeaderboardStore.setState(state => ({
		...state,
		group: { data: null, status: 'idle', loadedAt: null },
		stream: { data: null, status: 'idle', loadedAt: null },
	}))

	// Reviews
	useReviewStore.setState(state => ({
		...state,
		status: 'idle',
		loadedAt: null,
		reviews: [], // Сбрасываем кэшированные отзывы
	}))

	// Profile details
	useProfileDetailsStore.setState(state => ({
		...state,
		status: 'idle',
		loadedAt: null,
		details: null, // Сбрасываем кэшированные детали профиля
	}))

	// Payment
	usePaymentStore.setState(state => ({
		...state,
		status: 'idle',
		loadedAt: null,
	}))

	// User (persist состояние)
	useUserStore.setState(state => ({
		...state,
		user: null, // Сбрасываем кэшированного пользователя
	}))

	// === FEATURES PERSIST STATES ===
	// Onboarding - сбрасываем к начальному состоянию
	useOnboardingStore.setState({
		isDone: false, // Как при первой установке
	})

	// === APP PERSIST STATES ===
	// Theme - сбрасываем к дефолтной теме
	useThemeStore.setState(state => ({
		...state,
		theme: 'dark', // Дефолтная тема
	}))

	// === AUTH STORE ===
	// НЕ сбрасываем auth store, чтобы не выйти из системы!
	// Только если пользователь явно хочет сбросить все аккаунты
}

export function useClearCache() {
	return clearCache
}
