# Encrypted Storage & Zustand Stores Migration Guide

## Overview

Your application now has full encryption support for localStorage and Zustand persist stores. All keys and values are encrypted using AES-256 before being stored.

## New Modules

### 1. `src/shared/lib/encryption.ts`

Core encryption/decryption utilities using crypto-js (AES-256)

**Usage:**

```typescript
import { encryption } from '@/shared/lib/encryption'

// Encrypt any data
const encrypted = encryption.encrypt({ secret: 'data' })

// Decrypt to JSON
const decrypted = encryption.decryptToJSON<MyType>(encrypted)

// Safe decrypt (returns null on failure)
const result = encryption.decryptSafe<MyType>(encrypted)

// Encrypt object keys (one-way hash)
const hashedKey = encryption.encryptKey('my-cache-key')
```

### 2. `src/shared/lib/encryptedStorage.ts`

Updated localStorage wrapper with encryption

**Usage:** Drop-in replacement for the original `storage.ts`

```typescript
import { storage, CACHE_KEYS } from '@/shared/lib/encryptedStorage'

// All existing API calls work the same, but data is now encrypted
storage.set('my-key', { data: 'value' }, 3600)
const data = storage.get<MyType>('my-key')
```

### 3. `src/shared/lib/zustandEncryptedPersist.ts`

Custom Zustand middleware for encrypted persistence

## Migration Guide

### For Existing Zustand Stores

**Before (unencrypted):**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useMyStore = create<MyState>()(
	persist(
		set => ({
			data: null,
			setData: data => set({ data }),
		}),
		{ name: 'my-store' },
	),
)
```

**After (encrypted):**

```typescript
import { persistEncrypted } from '@/shared/lib/zustandEncryptedPersist'

export const useMyStore = create<MyState>()(
	persistEncrypted(
		set => ({
			data: null,
			setData: data => set({ data }),
		}),
		{ name: 'my-store' },
	),
)
```

Or use the helper:

```typescript
import { createEncryptedStore } from '@/shared/lib/zustandEncryptedPersist'

export const useMyStore = createEncryptedStore<MyState>(
	set => ({
		data: null,
		setData: data => set({ data }),
	}),
	{ name: 'my-store' },
)
```

### For API Cache

**Before:**

```typescript
import { storage, CACHE_KEYS } from '@/shared/lib/storage'

storage.set(CACHE_KEYS.USER_ME, userData, ttl.USER_INFO)
```

**After:** No changes needed!

```typescript
import { storage, CACHE_KEYS } from '@/shared/lib/encryptedStorage'

// Same API, automatically encrypted
storage.set(CACHE_KEYS.USER_ME, userData, ttl.USER_INFO)
```

## Configuration

### Encryption Key

By default, the encryption uses a hardcoded key. For production, set the environment variable:

```bash
REACT_APP_ENCRYPTION_KEY=your-secure-key-here
```

In your `.env` file:

```
REACT_APP_ENCRYPTION_KEY=generate-a-strong-random-key-here
```

**⚠️ Important:**

- Keep this key secret and never commit it to version control
- Use a strong, random key (at least 32 characters)
- Rotate the key periodically (old data won't be accessible after key change)

Generate a strong key:

```javascript
// In Node.js or browser console
require('crypto').randomBytes(32).toString('hex')
```

## Notes

1. **Data Backward Compatibility**: Existing unencrypted data in localStorage will not be automatically migrated. Old data will remain in plain text. Plan a migration if needed.

2. **Performance**: Encryption/decryption adds minimal overhead (<1ms per operation). For most apps, this is negligible.

3. **Debugging**: You can inspect encrypted data in DevTools → Application → LocalStorage. It will appear as random encrypted strings.

4. **Data Migration**: If you need to migrate existing plain-text data to encrypted:
   ```typescript
   // Read old data
   const oldData = localStorage.getItem('old-key')
   // Store with encryption
   storage.set('new-key', JSON.parse(oldData), 3600)
   // Remove old data
   localStorage.removeItem('old-key')
   ```

## Files to Update

Run a find-and-replace to update imports across the codebase:

1. Replace imports of old storage:

   ```
   FROM: '@/shared/lib/storage'
   TO:   '@/shared/lib/encryptedStorage'
   ```

2. Replace imports of old persist:
   ```
   FROM: import { persist } from 'zustand/middleware'
   TO:   import { persistEncrypted } from '@/shared/lib/zustandEncryptedPersist'
   ```

Then update each store file to use `persistEncrypted` instead of `persist`.

## Example: Complete Store Migration

```typescript
// Old version
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoadingState } from '@/shared/types'

interface UserState {
	user: UserInfo | null
	setUser: (user: UserInfo) => void
	clearUser: () => void
}

export const useUserStore = create<UserState>()(
	persist(
		set => ({
			user: null,
			setUser: user => set({ user }),
			clearUser: () => set({ user: null }),
		}),
		{
			name: 'user-store',
			partialize: state => ({ user: state.user }),
		},
	),
)
```

```typescript
// New encrypted version
import { create } from 'zustand'
import { persistEncrypted } from '@/shared/lib/zustandEncryptedPersist'
import type { LoadingState } from '@/shared/types'

interface UserState {
	user: UserInfo | null
	setUser: (user: UserInfo) => void
	clearUser: () => void
}

export const useUserStore = create<UserState>()(
	persistEncrypted(
		set => ({
			user: null,
			setUser: user => set({ user }),
			clearUser: () => set({ user: null }),
		}),
		{
			name: 'user-store',
			partialize: state => ({ user: state.user }),
		},
	),
)
```

## Testing

To verify encryption is working:

```typescript
// In browser console
localStorage // Will show encrypted values with hashed keys

// The encryption.decryptSafe() function helps with debugging
import { encryption } from '@/shared/lib/encryption'
const value = localStorage.getItem('some-encrypted-key')
encryption.decryptSafe(value) // Should return decrypted data
```

## Troubleshooting

### Data not persisting after encryption

- Check browser console for encryption errors
- Verify `REACT_APP_ENCRYPTION_KEY` environment variable is set correctly
- Clear old unencrypted localStorage data if needed

### Cannot decrypt old data

- The encryption key may have changed
- Try clearing localStorage and re-logging in
- Check that all encryption utilities are imported from the new modules

### Performance issues

- Encryption overhead is minimal (<1ms)
- If issues persist, profile with DevTools to identify bottlenecks
