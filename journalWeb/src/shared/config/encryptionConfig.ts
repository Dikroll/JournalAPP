/**
 * Encryption Configuration
 *
 * This file provides centralized encryption configuration
 * Update this based on your deployment environment
 */

/**
 * Get the encryption key from environment or generate a default
 *
 * For production:
 * - Store the key in a secure environment variable
 * - Use a key management service (AWS KMS, Azure Key Vault, etc.)
 * - Rotate keys periodically
 *
 * For development:
 * - You can use a static key, but NOT the same as production
 */
export const getEncryptionKey = (): string => {
	// Try to get from environment variable first
	const envKey = import.meta.env.REACT_APP_ENCRYPTION_KEY;

	if (envKey) {
		return envKey;
	}

	// Development fallback - use a development-only key
	if (import.meta.env.DEV) {
		console.warn(
			"[encryption] Using development encryption key. Set REACT_APP_ENCRYPTION_KEY for production.",
		);
		return "dev-journal-app-key-2024-replace-in-production";
	}

	// Production should never reach here
	console.error("[encryption] No encryption key configured for production!");
	return "default-journal-app-key-2024";
};

/**
 * Encryption settings
 */
export const encryptionConfig = {
	// Algorithm: AES with 256-bit key
	algorithm: "AES-256",

	// Whether to encrypt storage keys (in addition to values)
	encryptKeys: true,

	// Whether to log encryption operations (disable in production for performance)
	debug: import.meta.env.DEV,

	// Encryption key
	key: getEncryptionKey(),
};

/**
 * How to generate a strong encryption key:
 *
 * Using Node.js:
 * ```
 * require('crypto').randomBytes(32).toString('hex')
 * ```
 *
 * Using Python:
 * ```
 * import secrets
 * secrets.token_hex(32)
 * ```
 *
 * Using OpenSSL:
 * ```
 * openssl rand -hex 32
 * ```
 *
 * Then add to your .env file:
 * ```
 * REACT_APP_ENCRYPTION_KEY=your-generated-hex-string-here
 * ```
 */
