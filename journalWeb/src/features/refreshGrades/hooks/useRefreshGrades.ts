import { useGrades } from '@/entities/grades'

export function useRefreshGrades() {
	const { refresh, status } = useGrades()

	return {
		refresh,
		isRefreshing: status === 'loading',
	}
}
