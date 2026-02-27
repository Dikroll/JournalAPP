interface CacheEntry<T> {
	data: T;
	cachedAt: number;
	ttl: number;
}

export const storage = {
	set<T>(key: string, data: T, ttlSeconds = 3600): void {
		const entry: CacheEntry<T> = {
			data,
			cachedAt: Date.now(),
			ttl: ttlSeconds,
		};
		try {
			localStorage.setItem(key, JSON.stringify(entry));
		} catch (err) {
			console.warn("[storage] write failed for key:", key, err);
		}
	},

	get<T>(key: string): T | null {
		try {
			const raw = localStorage.getItem(key);
			if (!raw) return null;
			const entry: CacheEntry<T> = JSON.parse(raw);
			const age = (Date.now() - entry.cachedAt) / 1000;
			if (age > entry.ttl) return null;
			return entry.data;
		} catch {
			return null;
		}
	},

	getStale<T>(key: string): T | null {
		try {
			const raw = localStorage.getItem(key);
			if (!raw) return null;
			const entry: CacheEntry<T> = JSON.parse(raw);
			return entry.data;
		} catch {
			return null;
		}
	},

	remove(key: string): void {
		localStorage.removeItem(key);
	},

	clear(prefix?: string): void {
		if (!prefix) {
			localStorage.clear();
			return;
		}
		Object.keys(localStorage)
			.filter((k) => k.startsWith(prefix))
			.forEach((k) => localStorage.removeItem(k));
	},
};

export const CACHE_KEYS = {
	SCHEDULE_TODAY: "cache:schedule:today",
	SCHEDULE_MONTH: (month: string) => `cache:schedule:month:${month}`,
	USER_ME: "cache:user:me",
	HOMEWORK: (status: number, groupId: number) =>
		`cache:hw:${status}:${groupId}`,
	NEWS: "cache:news:latest",
	PAYMENT_SUMMARY: "cache:payment:summary",
	LIBRARY_COUNTERS: (specId?: number) =>
		`cache:library:counters:${specId ?? "all"}`,
	MARKET_PRODUCTS: "cache:market:products",
};
