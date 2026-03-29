/**
 * Читает токен напрямую из localStorage без импорта features/auth.
 * Нужно для shared/api — иначе получается нарушение FSD (shared → features).
 */
export function getAuthToken(): string | null {
	try {
		const raw = localStorage.getItem('auth-store')
		if (!raw) return null
		const parsed = JSON.parse(raw)
		return parsed?.state?.token ?? null
	} catch {
		return null
	}
}
