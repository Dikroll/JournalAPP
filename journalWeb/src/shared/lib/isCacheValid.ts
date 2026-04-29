export function isCacheValid(loadedAt: number | null, ttlMs: number): boolean {
	return loadedAt !== null && Date.now() - loadedAt < ttlMs
}
