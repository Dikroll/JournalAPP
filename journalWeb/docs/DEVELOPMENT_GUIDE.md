# 🚀 Development Guide

## Начало работы

### Установка окружения

```bash
# Клонируем репо (если в git)
git clone <repo_url>

# Переходим в директорию
cd journalWeb

# Устанавливаем зависимости
npm install

# Запускаем dev сервер
npm run dev
```

Приложение будет доступно на `http://localhost:5173`

### Структура проекта

Проект использует архитектуру **Feature-Sliced Design (FSD)**. Читайте [ARCHITECTURE.md](./ARCHITECTURE.md) для деталей.

```
src/
├── app/          # Приложение-уровень (Router, Layout, App config)
├── entities/     # Доменные сущности (User, Grades, Homework, etc)
├── features/     # Бизнес-функции (Auth, SendHomework, ChangeUser, etc)
├── pages/        # Страницы приложения
├── shared/       # Переиспользуемые ресурсы (API, hooks, UI, styles)
└── widgets/      # Составные UI виджеты
```

---

## Добавление новой Entity

Entity — это доменная сущность с собственным API, состоянием и хуками.

### Пример: Добавление новой сущности `Assignments`

#### 1. Создаём структуру

```bash
mkdir -p src/entities/assignment/{api,model,hooks}
```

#### 2. Типы (`src/entities/assignment/model/types.ts`)

```typescript
export interface Assignment {
	id: number
	title: string
	description: string
	due_date: string
	type: 'homework' | 'project' | 'quiz'
	status: 'pending' | 'submitted' | 'graded'
	grade?: number
}

export interface AssignmentResponse {
	items: Assignment[]
	total: number
}
```

#### 3. API (`src/entities/assignment/api/index.ts`)

```typescript
import { api } from '@/shared/api'
import type { Assignment, AssignmentResponse } from '../model/types'

export const assignmentApi = {
	// Получить все задания
	getAll: () => api.get<AssignmentResponse>('/assignments'),

	// Получить одно задание
	getOne: (id: number) => api.get<Assignment>(`/assignments/${id}`),

	// Получить задания по предмету
	getBySubject: (subjectId: number) =>
		api.get<Assignment[]>(`/assignments/subject/${subjectId}`),

	// Отправить задание
	submit: (id: number, file: File) => {
		const formData = new FormData()
		formData.append('file', file)
		return api.post(`/assignments/${id}/submit`, formData)
	},
}
```

#### 4. Store (`src/entities/assignment/model/store.ts`)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoadingState } from '@/shared/types'
import type { Assignment } from './types'

interface AssignmentState {
	// Data
	items: Assignment[]
	status: LoadingState
	error: string | null
	loadedAt: number | null

	// Actions
	setItems: (items: Assignment[]) => void
	setStatus: (status: LoadingState) => void
	setError: (error: string | null) => void
	setLoadedAt: (time: number) => void
	reset: () => void
}

export const useAssignmentStore = create<AssignmentState>()(
	persist(
		set => ({
			items: [],
			status: 'idle' as LoadingState,
			error: null,
			loadedAt: null,

			setItems: items => set({ items }),
			setStatus: status => set({ status }),
			setError: error => set({ error }),
			setLoadedAt: loadedAt => set({ loadedAt }),

			reset: () =>
				set({
					items: [],
					status: 'idle',
					error: null,
					loadedAt: null,
				}),
		}),
		{
			name: 'assignment-store',
			partialize: state => ({
				items: state.items,
				loadedAt: state.loadedAt,
			}),
			onRehydrateStorage: () => state => {
				if (state) state.status = 'idle'
			},
		},
	),
)
```

#### 5. Хуки (`src/entities/assignment/hooks/useAssignment.ts`)

```typescript
import { isCacheValid } from '@/shared/lib'
import { useCallback, useEffect } from 'react'
import { assignmentApi } from '../api'
import { useAssignmentStore } from '../model/store'

const CACHE_TTL_MS = 15 * 60 * 1000 // 15 минут

export function useAssignment() {
	const {
		items,
		status,
		error,
		loadedAt,
		setItems,
		setStatus,
		setError,
		setLoadedAt,
	} = useAssignmentStore()

	const load = useCallback(
		async (force = false) => {
			if (!force && isCacheValid(loadedAt, CACHE_TTL_MS)) {
				return items
			}

			setStatus('loading')
			setError(null)

			try {
				const response = await assignmentApi.getAll()
				const data = response.data.items

				setItems(data)
				setLoadedAt(Date.now())
				setStatus('success')

				return data
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Ошибка загрузки'
				setError(message)
				setStatus('error')
				throw err
			}
		},
		[loadedAt, items, setItems, setStatus, setError, setLoadedAt],
	)

	// Auto-load при монтировании
	useEffect(() => {
		if (status === 'idle' && !items.length) {
			load()
		}
	}, [])

	return {
		items,
		status,
		error,
		load,
	}
}
```

#### 6. Index файл (`src/entities/assignment/index.ts`)

```typescript
// Public API для этой сущности
export { useAssignmentStore } from './model/store'
export { assignmentApi } from './api'
export * from './model/types'
export { useAssignment } from './hooks/useAssignment'
```

#### 7. Добавить в resetAllStores

```typescript
// app/lib/resetAllStores.ts
import { useAssignmentStore } from '@/entities/assignment'

export function resetAllStores(): void {
	useAssignmentStore.getState().reset()
	// ... другие stores
}
```

---

## Добавление новой Feature

Feature комбинирует несколько entities в бизнес-функцию.

### Пример: Добавление функции `SubmitAssignment`

#### 1. Структура

```bash
mkdir -p src/features/submitAssignment/{hooks,ui}
```

#### 2. Hook (`src/features/submitAssignment/hooks/useSubmitAssignment.ts`)

```typescript
import { useAssignmentStore } from '@/entities/assignment'
import { useState } from 'react'
import { assignmentApi } from '@/entities/assignment'

export function useSubmitAssignment() {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const items = useAssignmentStore(s => s.items)

	const submit = async (assignmentId: number, file: File) => {
		// Валидация
		if (!file) {
			setError('Выберите файл')
			return
		}

		const maxSize = 10 * 1024 * 1024 // 10MB
		if (file.size > maxSize) {
			setError('Файл слишком большой (макс 10MB)')
			return
		}

		setLoading(true)
		setError(null)

		try {
			await assignmentApi.submit(assignmentId, file)

			// Обновляем статус в store
			const updated = items.map(item =>
				item.id === assignmentId
					? { ...item, status: 'submitted' as const }
					: item,
			)
			useAssignmentStore.setState({ items: updated })

			return true
		} catch (err) {
			setError('Ошибка при отправке задания')
			return false
		} finally {
			setLoading(false)
		}
	}

	return { submit, loading, error }
}
```

#### 3. UI компонент (`src/features/submitAssignment/ui/SubmitButton.tsx`)

```typescript
import { useState } from 'react'
import { useSubmitAssignment } from '../hooks/useSubmitAssignment'

interface Props {
  assignmentId: number
  onSuccess?: () => void
}

export function SubmitButton({ assignmentId, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { submit, loading, error } = useSubmitAssignment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    const success = await submit(assignmentId, file)
    if (success) {
      setFile(null)
      setOpen(false)
      onSuccess?.()
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Отправить
      </button>

      {open && (
        <div className="modal">
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)}
            />

            {error && <p className="text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={!file || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Отправляю...' : 'Отправить'}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-gray-600"
            >
              Отмена
            </button>
          </form>
        </div>
      )}
    </>
  )
}
```

#### 4. Index (`src/features/submitAssignment/index.ts`)

```typescript
export { useSubmitAssignment } from './hooks/useSubmitAssignment'
export { SubmitButton } from './ui/SubmitButton'
```

---

## Добавление новой страницы

### Пример: Assignments Страница

#### 1. Структура

```bash
mkdir -p src/pages/assignments/ui
```

#### 2. Page компонент (`src/pages/assignments/ui/AssignmentsPage.tsx`)

```typescript
import { useAssignment } from '@/entities/assignment'
import { SubmitButton } from '@/features/submitAssignment'
import { PageHeader } from '@/shared/ui'
import { BottomBar, TopBar } from '@/widgets'

export function AssignmentsPage() {
  const { items, status, error, load } = useAssignment()

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <main className="px-4 py-4">
        <PageHeader
          title="Задания"
          action={
            <button
              onClick={() => load(true)}
              disabled={status === 'loading'}
            >
              Обновить
            </button>
          }
        />

        {status === 'loading' && <p>Загрузка...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="space-y-2">
          {items.map(assignment => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
            />
          ))}
        </div>
      </main>

      <BottomBar />
    </div>
  )
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  return (
    <div className="p-4 bg-surface rounded-lg border border-border">
      <h3 className="font-semibold">{assignment.title}</h3>
      <p className="text-sm text-text-secondary">{assignment.description}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm">{assignment.due_date}</span>
        <SubmitButton assignmentId={assignment.id} />
      </div>
    </div>
  )
}
```

#### 2. Экспорт из pages (`src/pages/index.ts`)

```typescript
export { AssignmentsPage } from './assignments/ui/AssignmentsPage'
```

#### 3. Добавить маршрут в Router

```typescript
// app/router/index.tsx
import { AssignmentsPage } from '@/pages'

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        {/* ... */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  {/* ... */}
                  <Route path="/assignments" element={<AssignmentsPage />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  )
}
```

#### 4. Добавить в pageConfig

```typescript
// shared/config/pageConfig.ts
export const pageConfig = {
	// ...
	assignments: '/assignments',
}
```

---

## Работа с состоянием (Zustand)

### Использование store в компонентах

```typescript
import { useGradesStore } from '@/entities/grades'

export function MyComponent() {
  // Читаем значения
  const entries = useGradesStore(s => s.entries)
  const status = useGradesStore(s => s.status)

  // Вызываем действия
  const update = useGradesStore(s => s.update)

  return (
    <div>
      {/* Компонент */}
    </div>
  )
}
```

### Селекторы

**Всегда используйте селекторы для производительности:**

```typescript
// ❌ BAD - вызовет re-render при любом изменении state
const entire = useGradesStore()

// ✅ GOOD - вызовет re-render только при изменении entries
const entries = useGradesStore(s => s.entries)

// ✅ GOOD - можно использовать useMemo для сложных селекторов
const averageGrade = useMemo(
	() => entries.reduce((sum, e) => sum + e.grade, 0) / entries.length,
	[entries],
)
```

### Прямой доступ к state

```typescript
import { useGradesStore } from '@/entities/grades'

// Получить состояние без подписки
const entries = useGradesStore.getState().entries

// Обновить без компонента
useGradesStore.setState({ entries: newData })
```

---

## API запросы

### Правильный паттерн

```typescript
import { api } from '@/shared/api'

// 1. Определите тип
interface MyData {
	id: number
	name: string
}

// 2. Создайте API функцию
export const myApi = {
	getData: () => api.get<MyData[]>('/endpoint'),

	postData: (data: MyData) => api.post<{ id: number }>('/endpoint', data),

	deleteData: (id: number) => api.delete(`/endpoint/${id}`),
}

// 3. Используйте в hook'е
export function useMyData() {
	const [data, setData] = useState<MyData[]>([])
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const response = await myApi.getData()
			setData(response.data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error')
		} finally {
			setLoading(false)
		}
	}, [])

	return { data, error, loading, load }
}
```

### Отмена запросов

```typescript
export function useMyData() {
	useEffect(() => {
		let cancelled = false

		const load = async () => {
			try {
				const response = await myApi.getData()
				if (!cancelled) {
					setData(response.data)
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Error')
				}
			}
		}

		load()

		return () => {
			cancelled = true
		}
	}, [])
}
```

---

## Стилизация

### Tailwind CSS

Проект использует Tailwind CSS с поддержкой dark mode:

```typescript
// Базовые классы
<div className="flex gap-4 px-4 py-2 rounded-lg">

// Тёмная тема
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">

// Использование CSS переменных теми
<div className="text-[var(--color-text)] bg-[var(--color-surface)]">
```

### CSS переменные темы

```css
/* shared/styles/theme.css */
:root {
	--color-bg: #1f2024;
	--color-surface: #2a2d32;
	--color-border: #3d3f44;
	--color-text: #f5f5f5;
	--color-text-secondary: #9ca3af;
	--color-primary: #d50416;
}

.light {
	--color-bg: #ffffff;
	--color-surface: #f9fafb;
	--color-border: #e5e7eb;
	--color-text: #1f2937;
	--color-text-secondary: #6b7280;
	--color-primary: #d50416;
}
```

---

## Debugging

### Chrome DevTools

1. Откройте DevTools (F12)
2. Перейдите на вкладку Application/Storage
3. Посмотрите localStorage:
   - `auth-store` - токен и аккауты
   - `user-store` - информация пользователя
   - `grades-store` - оценки
   - И т.д.

### Логирование

```typescript
// ✅ GOOD - используйте префиксы
console.log('[useGrades] Loading grades...')
console.warn('[useGrades] Cache is stale, reloading')
console.error('[useGrades] Failed to load:', error)

// Для отладки API
api.interceptors.request.use(config => {
	console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`)
	return config
})
```

### React DevTools

Установите [React DevTools extension](https://react-devtools-tutorial.vercel.app/) для:

- Просмотра иерархии компонентов
- Отслеживания re-renders
- Инспекции props и state

---

## Testing

### Структура тестов (планируется)

```
src/
├── __tests__/
│   ├── entities/
│   │   └── user/
│   │       └── user.test.ts
│   ├── features/
│   ├── hooks/
│   └── utils/
```

### Пример юнит теста (Vitest)

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGrades } from '@/entities/grades'

describe('useGrades', () => {
	beforeEach(() => {
		// Reset stores
		useGradesStore.setState({ entries: [] })
	})

	it('should load grades', async () => {
		const { result } = renderHook(() => useGrades())

		await act(async () => {
			await result.current.load()
		})

		expect(result.current.entries).toBeDefined()
		expect(result.current.status).toBe('success')
	})

	it('should handle load errors', async () => {
		// Mock API error
		vi.mocked(gradesApi.getAll).mockRejectedValueOnce(
			new Error('Network error'),
		)

		const { result } = renderHook(() => useGrades())

		await act(async () => {
			await result.current.load()
		})

		expect(result.current.error).toBeTruthy()
		expect(result.current.status).toBe('error')
	})
})
```

---

## Production Build

### Build процесс

```bash
# Build для продакшена
npm run build

# Результаты в dist/
# - dist/index.html
# - dist/assets/*.js
# - dist/assets/*.css
```

### Оптимизации

1. **Code Splitting** - маршруты разбиваются автоматически
2. **Minification** - Vite минифицирует код
3. **Asset Hashing** - для кеширования браузером

### Проверка build размера

```bash
npm run build
npx vite preview
```

---

## Git Workflow

### Branch Naming

```
feature/add-assignments    # Новая функция
bugfix/fix-schedule-bug    # Исправление ошибки
refactor/improve-api       # Рефакторинг
docs/update-readme         # Документация
```

### Commit Messages

```
feat: add assignment submission feature
fix: resolve grades loading issue
refactor: simplify homework store
docs: update API documentation
```

### Pull Request Checklist

- [ ] Код следует FSD архитектуре
- [ ] Используются правильные типы TypeScript
- [ ] Нет console.errors в production коде
- [ ] Тесты зелёные
- [ ] Документация обновлена

---

## Часто встречающиеся задачи

### Добавить новый API endpoint

1. Добавьте в `shared/config/apiConfig.ts`
2. Создайте API функцию в entity
3. Используйте в hooks/stores

### Добавить новый компонент UI

1. Создайте в `shared/ui/{ComponentName}/`
2. Экспортируйте из `shared/ui/index.ts`
3. Используйте в pages/features

### Изменить theme

1. Отредактируйте CSS переменные в `shared/styles/theme.css`
2. Используйте в компонентах: `className="text-[var(--color-text)]"`

### Добавить новый хук

1. Создайте в папке `hooks/` соответствующего уровня
2. Следуйте паттерну useEffect + useState
3. Экспортируйте из index.ts

### Кешировать API результат

1. Определите TTL в constants или config
2. Используйте `isCacheValid()` в hook'е
3. Сравните `Date.now() - loadedAt < TTL`

---

## Производительность

### Оптимизации

```typescript
// 1. Используйте useCallback для стабильных функций
const handleClick = useCallback(() => {
  // ...
}, [dependencies])

// 2. Используйте useMemo для дорогих вычислений
const processedData = useMemo(
  () => data.map(transform),
  [data]
)

// 3. Используйте селекторы в stores
const entries = useGradesStore(s => s.entries)

// 4. Ленивая загрузка изображений
<img loading="lazy" src={url} />
```

### Профилирование

```typescript
// React Profiler
import { Profiler } from 'react'

<Profiler id="MyComponent" onRender={onRender}>
  <MyComponent />
</Profiler>

// Web Performance API
performance.mark('start')
// ... код
performance.mark('end')
performance.measure('operation', 'start', 'end')
```

---

## Troubleshooting

### Проблема: Store не обновляется

✅ **Решение:** Проверьте, используются ли правильные селекторы:

```typescript
// ❌ INCORRECT
const state = useGradesStore() // Не подписывает на изменения

// ✅ CORRECT
const entries = useGradesStore(s => s.entries) // Подписывает на entries
```

### Проблема: API запрос зависает

✅ **Решение:** Используйте абортирование:

```typescript
useEffect(() => {
	let cancelled = false
	apiCall().then(data => {
		if (!cancelled) setData(data)
	})
	return () => {
		cancelled = true
	}
}, [])
```

### Проблема: Утечки памяти

✅ **Решение:** Удаляйте listeners при размонтировании:

```typescript
useEffect(() => {
	const unsubscribe = store.subscribe(listener)
	return unsubscribe
}, [])
```

### Проблема: CORS ошибки

✅ **Решение:** Используйте Vite прокси в `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'https://backend.com',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, ''),
  }
}
```

---

**Версия документации:** 1.0  
**Последнее обновление:** Март 2026  
**Автор:** Development Team
