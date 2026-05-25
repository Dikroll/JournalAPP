import { useAuthStore } from "@/shared/model/authStore";

/**
 * Reads the auth token from the encrypted auth store.
 * Uses the store's getState() to access the decrypted token from memory.
 */
export function getAuthToken(): string | null {
	try {
		return useAuthStore.getState()?.token ?? null;
	} catch {
		return null;
	}
}
