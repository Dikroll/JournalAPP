import { resetAllAppState } from '@/shared/lib'

export function clearCache(): void {
	resetAllAppState({
		resetAuth: false,
		resetTheme: false,
		resetOnboarding: false,
	})
}

export function useClearCache() {
	return clearCache
}
