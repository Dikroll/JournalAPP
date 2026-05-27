import CryptoJS from "crypto-js";
import { encryptionConfig } from "@/shared/config/encryptionConfig";

/**
 * Encryption utility using AES-256
 * Uses configuration from encryptionConfig.ts
 */

interface IEncryption {
	encrypt(data: unknown): string;
	decryptToString(encryptedData: string): string;
	decryptToJSON<T>(encryptedData: string): T;
	decryptSafe<T>(encryptedData: string): T | null;
	encryptKey(key: string): string;
}

export const encryption: IEncryption = {
	/**
	 * Encrypt data (string or JSON)
	 */
	encrypt(data: unknown): string {
		try {
			const stringData = typeof data === "string" ? data : JSON.stringify(data);
			const encrypted = CryptoJS.AES.encrypt(
				stringData,
				encryptionConfig.key,
			).toString();
			if (encryptionConfig.debug) {
				console.debug("[encryption] encrypted data");
			}
			return encrypted;
		} catch (error) {
			console.error("[encryption] encrypt failed:", error);
			throw error;
		}
	},

	/**
	 * Decrypt data and return as string
	 */
	decryptToString(encryptedData: string): string {
		try {
			const decrypted = CryptoJS.AES.decrypt(
				encryptedData,
				encryptionConfig.key,
			).toString(CryptoJS.enc.Utf8);
			if (!decrypted) {
				throw new Error("Decryption resulted in empty string");
			}
			if (encryptionConfig.debug) {
				console.debug("[encryption] decrypted to string");
			}
			return decrypted;
		} catch (error) {
			console.error("[encryption] decrypt failed:", error);
			throw error;
		}
	},

	/**
	 * Decrypt data and return as parsed JSON
	 */
	decryptToJSON<T>(encryptedData: string): T {
		try {
			const decryptedString = this.decryptToString(encryptedData);
			return JSON.parse(decryptedString) as T;
		} catch (error) {
			console.error("[encryption] decryptToJSON failed:", error);
			throw error;
		}
	},

	/**
	 * Safely decrypt - returns null on failure instead of throwing
	 */
	decryptSafe<T>(encryptedData: string): T | null {
		try {
			return this.decryptToJSON(encryptedData) as T;
		} catch {
			return null;
		}
	},

	/**
	 * Encrypt object key-value pairs (for object keys)
	 */
	encryptKey(key: string): string {
		try {
			const hashedKey = CryptoJS.SHA256(key + encryptionConfig.key).toString();
			if (encryptionConfig.debug) {
				console.debug("[encryption] encrypted key");
			}
			return hashedKey;
		} catch (error) {
			console.error("[encryption] encryptKey failed:", error);
			throw error;
		}
	},
};
