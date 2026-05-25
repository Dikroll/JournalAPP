import { create as zustandCreate } from "zustand";
import type { StateStorage } from "zustand/middleware";
import {
	createJSONStorage,
	persist as zustandPersist,
} from "zustand/middleware";
import { encryption } from "./encryption";
import { useHydrationStore } from "./hydrationStore";

/**
 * Encrypted StateStorage implementation for Zustand persist middleware.
 * Encrypts both keys and values in localStorage.
 * Must be wrapped with createJSONStorage() before passing to persist().
 */
const encryptedStateStorage: StateStorage = {
	getItem: (key: string) => {
		try {
			const encryptedKey = encryption.encryptKey(key);
			const encryptedData = localStorage.getItem(encryptedKey);

			if (!encryptedData) return null;

			// Decrypt the data — returns the JSON string that createJSONStorage will parse
			return encryption.decryptToString(encryptedData);
		} catch (error) {
			console.error("[encryptedStorage] getItem failed for key:", key, error);
			return null;
		}
	},

	setItem: (key: string, value: string) => {
		try {
			const encryptedKey = encryption.encryptKey(key);
			const encryptedData = encryption.encrypt(value);
			localStorage.setItem(encryptedKey, encryptedData);
		} catch (error) {
			console.error("[encryptedStorage] setItem failed for key:", key, error);
		}
	},

	removeItem: (key: string) => {
		try {
			const encryptedKey = encryption.encryptKey(key);
			localStorage.removeItem(encryptedKey);
		} catch (error) {
			console.error(
				"[encryptedStorage] removeItem failed for key:",
				key,
				error,
			);
		}
	},
};

const encryptedKeyOnlyStateStorage: StateStorage = {
	getItem: (key: string) => {
		try {
			const encryptedKey = encryption.encryptKey(key);
			const value = localStorage.getItem(encryptedKey);
			if (value !== null) return value;
			// Fallback: try reading with unencrypted key (migration support)
			return localStorage.getItem(key);
		} catch (error) {
			console.error(
				"[encryptedKeyOnlyStorage] getItem failed for key:",
				key,
				error,
			);
			return null;
		}
	},

	setItem: (key: string, value: string) => {
		try {
			const encryptedKey = encryption.encryptKey(key);
			localStorage.setItem(encryptedKey, value);
		} catch (error) {
			console.error(
				"[encryptedKeyOnlyStorage] setItem failed for key:",
				key,
				error,
			);
		}
	},

	removeItem: (key: string) => {
		try {
			const encryptedKey = encryption.encryptKey(key);
			localStorage.removeItem(encryptedKey);
			localStorage.removeItem(key);
		} catch (error) {
			console.error(
				"[encryptedKeyOnlyStorage] removeItem failed for key:",
				key,
				error,
			);
		}
	},
};

/**
 * Migrate a store from unencrypted localStorage to encrypted storage.
 * Call this BEFORE creating the store to ensure seamless migration.
 *
 * - Reads the plain-text entry under `storeName`
 * - Encrypts it and saves under the hashed key
 * - Deletes the plain-text entry
 *
 * Safe to call repeatedly — no-ops if already migrated or no data exists.
 */
export const migrateToEncrypted = (storeName: string) => {
	try {
		const plainData = localStorage.getItem(storeName);
		if (!plainData) return; // Already migrated or no data

		const encryptedKey = encryption.encryptKey(storeName);

		// Only migrate if encrypted version doesn't already exist
		if (localStorage.getItem(encryptedKey)) {
			// Encrypted data exists — just clean up the plain-text leftover
			localStorage.removeItem(storeName);
			return;
		}

		// Encrypt and store under hashed key
		const encryptedData = encryption.encrypt(plainData);
		localStorage.setItem(encryptedKey, encryptedData);

		// Remove plain-text entry
		localStorage.removeItem(storeName);

		console.info(
			`[migrateToEncrypted] Migrated "${storeName}" to encrypted storage`,
		);
	} catch (error) {
		console.error("[migrateToEncrypted] Failed for store:", storeName, error);
	}
};

/**
 * Helper to clear a store's persisted data
 */
export const clearPersistedStoreData = (storeName: string) => {
	try {
		const encryptedKey = encryption.encryptKey(storeName);
		localStorage.removeItem(encryptedKey);
	} catch (error) {
		console.error(
			"[clearPersistedStoreData] failed for store:",
			storeName,
			error,
		);
	}
};

/**
 * Enhanced persist middleware with encryption
 * Usage is identical to zustand/middleware persist, but data is encrypted
 *
 * Example:
 * ```
 * export const useStore = create<State>()(
 *   persistEncrypted(
 *     (set) => ({
 *       // your store logic
 *     }),
 *     {
 *       name: 'my-store',
 *     }
 *   )
 * )
 * ```
 */
export const persistEncrypted = (config: any, options: any): any => {
	const userOnRehydrate = options?.onRehydrateStorage;
	return zustandPersist(config, {
		...options,
		storage: createJSONStorage(() => encryptedStateStorage),
		onRehydrateStorage: () => (state: any, error: any) => {
			// Run the store-specific rehydration callback first (e.g. Set reconstruction)
			if (typeof userOnRehydrate === "function") {
				const cb = userOnRehydrate();
				if (typeof cb === "function") {
					cb(state, error);
				}
			}
			useHydrationStore.setState({ hasHydrated: true });
		},
	}) as any;
};

export const persistEncryptedKeyOnly = (config: any, options: any): any => {
	const defaultOnRehydrate = () => () => {
		useHydrationStore.setState({ hasHydrated: true });
	};
	return zustandPersist(config, {
		...options,
		storage: createJSONStorage(() => encryptedKeyOnlyStateStorage),
		onRehydrateStorage: options.onRehydrateStorage || defaultOnRehydrate,
	}) as any;
};

/**
 * Type-safe create helper with encrypted persistence
 * Provides better TypeScript support for encrypted stores
 */
export const createEncryptedStore = <T extends object>(
	config: (set: any) => T,
	options: any,
) => zustandCreate<T>(persistEncrypted(config, options) as any);
