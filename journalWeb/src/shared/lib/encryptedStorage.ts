import { encryption } from "./encryption";

interface CacheEntry<T> {
	data: T;
	cachedAt: number;
	ttl: number;
}

/**
 * Encrypted storage with TTL support
 * All keys and values are encrypted before storing in localStorage
 */
export const storage = {
	set<T>(key: string, data: T, ttlSeconds = 3600): void {
		const entry: CacheEntry<T> = {
			data,
			cachedAt: Date.now(),
			ttl: ttlSeconds,
		};
		try {
			// Encrypt both key and value
			const baseEncryptedKey = encryption.encryptKey(key);
			const encryptedKey = key.startsWith("cache:")
				? `cache:${baseEncryptedKey}`
				: baseEncryptedKey;
			const encryptedData = encryption.encrypt(entry);
			localStorage.setItem(encryptedKey, encryptedData);
		} catch (err) {
			console.warn("[storage] write failed for key:", key, err);
		}
	},

	getCachedAt(key: string): number | null {
		try {
			const baseEncryptedKey = encryption.encryptKey(key);
			const encryptedKey = key.startsWith("cache:")
				? `cache:${baseEncryptedKey}`
				: baseEncryptedKey;
			const raw = localStorage.getItem(encryptedKey);
			if (!raw) return null;

			const entry = encryption.decryptToJSON<CacheEntry<unknown>>(raw);
			return entry?.cachedAt ?? null;
		} catch {
			return null;
		}
	},

	get<T>(key: string): T | null {
		try {
			const baseEncryptedKey = encryption.encryptKey(key);
			const encryptedKey = key.startsWith("cache:")
				? `cache:${baseEncryptedKey}`
				: baseEncryptedKey;
			const raw = localStorage.getItem(encryptedKey);
			if (!raw) return null;

			const entry = encryption.decryptToJSON<CacheEntry<T>>(raw);
			const age = (Date.now() - entry.cachedAt) / 1000;
			if (age > entry.ttl) {
				// Remove expired entry
				localStorage.removeItem(encryptedKey);
				return null;
			}
			return entry.data;
		} catch {
			return null;
		}
	},

	remove(key: string): void {
		try {
			const baseEncryptedKey = encryption.encryptKey(key);
			const encryptedKey = key.startsWith("cache:")
				? `cache:${baseEncryptedKey}`
				: baseEncryptedKey;
			localStorage.removeItem(encryptedKey);
		} catch (err) {
			console.error("[storage] remove failed for key:", key, err);
		}
	},

	clear(prefix?: string): void {
		try {
			if (!prefix) {
				localStorage.clear();
				return;
			}
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith(prefix)) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach((k) => localStorage.removeItem(k));
		} catch (err) {
			console.error("[storage] clear failed:", err);
		}
	},
};

export const CACHE_KEYS = {
	SCHEDULE_TODAY: "cache:schedule:today",
	SCHEDULE_MONTH: (month: string) => `cache:schedule:month:${month}`,
	USER_ME: "cache:user:me",
	HOMEWORK: (status: number, groupId: number) =>
		`cache:hw:${status}:${groupId}`,
	NEWS: "cache:news:latest",
	NEWS_DETAIL: (id: number) => `cache:news:detail:${id}`,
	LIBRARY_COUNTERS: (specId?: number) =>
		`cache:library:counters:${specId ?? "all"}`,
	MARKET_PRODUCTS: "cache:market:products",
	LEADERBOARD_GROUP: "cache:leaderboard:group",
	LEADERBOARD_STREAM: "cache:leaderboard:stream",
	REVIEWS: "cache:reviews",
	GRADES_ALL: "cache:grades:all",
	PAYMENT_SUMMARY: "cache:payment:summary",
	PAYMENT_INDEX: "cache:payment:index",
	DASHBOARD_ACTIVITY: "cache:dashboard:activity",
};
