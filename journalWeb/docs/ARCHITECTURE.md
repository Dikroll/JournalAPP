# 🏗️ Архитектурное решение JournalAPP

## Feature-Sliced Design (FSD)

Проект построен на основе архитектурного паттерна **Feature-Sliced Design**, который делит код приложения на независимые слои, каждый из которых отвечает за определённый уровень абстракции.

### Иерархия слоёв (снизу вверх)

```
┌─────────────────────────────────────────────────────────┐
│                      app (0)                             │
│            (Router, App config, Theme)                  │
├─────────────────────────────────────────────────────────┤
│                      pages (1)                           │
│              (Page-level components)                    │
├─────────────────────────────────────────────────────────┤
│                      features (2)                        │
│          (Business features combining entities)         │
├─────────────────────────────────────────────────────────┤
│                      entities (3)                        │
│         (Domain entities with own stores/API)           │
├─────────────────────────────────────────────────────────┤
│                      shared (4)                          │
│    (Reusable UI, hooks, utils, API, config)             │
└─────────────────────────────────────────────────────────┘
```

**Принцип:** нижние слои не знают о верхних

---

## Слой 1: Shared (Общие ресурсы)

Самый нижний уровень - не зависит ни от чего выше.

### Структура

```
shared/
├── api/
│   └── index.ts          # Axios инстанц с interceptors
├── config/
│   ├── apiConfig.ts      # API endpoints
│   ├── env.ts            # Переменные окружения
│   ├── cacheConfig.ts    # Кеширование TTL
│   └── pageConfig.ts     # Конфигурация страниц
├── hooks/
│   ├── useContainerReady.ts
│   ├── useCurrentTime.ts
│   ├── useElementSize.ts
│   ├── useLazyItems.ts
│   ├── useMonthNav.ts
│   └── useSwipeBack.ts
├── lib/
│   ├── imageCache.ts     # Кеширование изображений
│   ├── isCacheValid.ts   # Проверка валидности кеша
│   ├── scrollToTop.ts    # Скролл на верх
│   └── storage.ts        # localStorage helpers
├── styles/
│   ├── index.css         # Глобальные стили
│   └── theme.css         # Переменные темы
├── types/
│   └── index.ts          # Общие типы (LoadingState, etc)
└── ui/
    ├── AvatarPlaceholder/
    ├── CustomTooltip/
    ├── ErrorView/
    ├── MonthGrid/
    ├── PageHeader/
    ├── RefreshButton/
    ├── ShowMoreBtn/
    └── ... (другие переиспользуемые компоненты)
```

### Ключевые модули

#### API Client (`shared/api/index.ts`)

```typescript
// Создание Axios инстанца
export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

// Request interceptor - добавляет Authorization header
api.interceptors.request.use(config => {
	const token = useAuthStore.getState().token
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	// Удаляет Content-Type для FormData (для автоматического boundary)
	if (config.data instanceof FormData) {
		delete config.headers['Content-Type']
	}
	return config
})

// Response interceptor - обработка ошибок
api.interceptors.response.use(
	res => res,
	async err => {
		const status = err.response?.status
		if (status === 401) {
			// Обработка 401 - redirect на login
		}
		return Promise.reject(err)
	},
)
```

#### Типы (`shared/types/index.ts`)

```typescript
// LoadingState - используется во всех stores
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Шаблон для всех entity stores
interface EntityState<T> {
	data: T[]
	status: LoadingState
	error: string | null
	loadedAt: number | null
}
```

#### Config (`shared/config/`)

```typescript
// apiConfig.ts - все endpoints в одном месте
class ApiConfig {
	readonly AUTH_LOGIN = '/auth/login'
	readonly USER_ME = '/user/me'
	readonly SCHEDULE_TODAY = '/schedule/today'
	// ... все endpoints
}

// env.ts - переменные окружения
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// pageConfig.ts - маршруты страниц
export const pageConfig = {
	login: '/login',
	home: '/',
	grades: '/grades',
	// ...
}
```

---

## Слой 2: Entities (Доменные сущности)

Каждая сущность инкапсулирует свой домен и имеет чёткую структуру.

### Структура Entity

```
entity/
├── api/
│   └── index.ts         # API методы для этой сущности
├── model/
│   ├── store.ts         # Zustand store
│   ├── types.ts         # TypeScript типы
│   └── constants.ts     # Константы
├── hooks/
│   ├── useEntity.ts     # Основной хук для загрузки
│   └── index.ts         # Экспорт публичного API
└── index.ts             # Public API (экспортирует всё)
```

### Пример: User Entity

```typescript
// entities/user/model/types.ts
export interface UserInfo {
	id: number
	username: string
	full_name: string
	email: string
	group: { id: number; name: string }
	photo_url: string | null
}

// entities/user/model/store.ts
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

// entities/user/api/index.ts
export const userApi = {
	getMe: () => api.get<UserInfo>(apiConfig.USER_ME),
	getProfile: () => api.get(apiConfig.USER_PROFILE),
}

// entities/user/hooks/useUser.ts
export function useUser() {
	const { user, setUser } = useUserStore()

	useEffect(() => {
		if (user) return

		userApi
			.getMe()
			.then(({ data }) => setUser(data))
			.catch(err => console.warn('[useUser]', err))
	}, [])

	return user
}

// entities/user/index.ts - Public API
export { useUserStore } from './model/store'
export { userApi } from './api'
export * from './model/types'
```

### Все Entities

| Entity          | Назначение              | Основные данные              |
| --------------- | ----------------------- | ---------------------------- |
| **user**        | Информация пользователя | UserInfo, аватар, профиль    |
| **grades**      | Оценки по предметам     | GradeEntry, статистика       |
| **homework**    | Домашние задания        | HomeworkItem, статус, файлы  |
| **schedule**    | Расписание занятий      | ScheduleItem, время, место   |
| **subject**     | Список предметов        | Subject, specs, info         |
| **exam**        | Предстоящие экзамены    | FutureExamItem, даты         |
| **dashboard**   | Данные главной страницы | Счётчики, графики, лидерборд |
| **leaderboard** | Рейтинги студентов      | LeaderboardItem, позиция     |
| **payment**     | Платёжная информация    | PaymentInfo, история         |
| **profile**     | Расширенный профиль     | ProfileDetails, контакты     |
| **review**      | Отзывы и оценки         | ReviewItem, рейтинг          |

---

## Слой 3: Features (Бизнес-функции)

Функции комбинируют несколько entities для реализации бизнес-логики пользователя.

### Структура Feature

```
feature/
├── api/          # Специальные API запросы (если есть)
├── model/        # Состояние и типы этой функции
├── hooks/        # Хуки for this feature
├── ui/           # UI компоненты
└── index.ts      # Public API
```

### Примеры Features

#### 1. Auth (`features/auth`)

Функция аутентификации и управления сессией.

```typescript
// features/auth/model/types.ts
export interface LoginRequest {
	username: string
	password: string
}

export interface LoginResponse {
	token: string
	user: UserInfo
}

// features/auth/model/store.ts - управляет auth state
interface AuthState {
	token: string | null
	isAuthenticated: boolean
	activeUsername: string | null
	accounts: SavedAccount[] // До 5 сохранённых аккаунтов

	setToken: (token: string) => void
	logout: () => void
	saveAccount: (account: SavedAccount) => void
	switchAccount: (username: string) => boolean
	removeAccount: (username: string) => void
}

// features/auth/hooks/useLogin.ts
export function useLogin() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const setToken = useAuthStore(s => s.setToken)
	const saveAccount = useAuthStore(s => s.saveAccount)
	const setUser = useUserStore(s => s.setUser)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()

		try {
			const response = await authApi.login({ username, password })
			setToken(response.data.token)
			setUser(response.data.user)
			saveAccount({
				username,
				token: response.data.token,
				fullName: response.data.user.full_name,
				groupName: response.data.user.group.name,
				avatarUrl: response.data.user.photo_url,
			})

			navigate('/')
		} catch (err) {
			setError('Неверные учётные данные')
		}
	}

	return {
		username,
		setUsername,
		password,
		setPassword,
		error,
		loading,
		submit,
	}
}
```

#### 2. ChangeUser (`features/changeUser`)

Переключение между сохранёнными аккаунтами.

```typescript
// features/changeUser/hooks/useAccountSwitcher.ts
export function useAccountSwitcher(onReset: () => void, onClose: () => void) {
	const accounts = useAuthStore(s => s.accounts)
	const activeUsername = useAuthStore(s => s.activeUsername)
	const removeAccount = useAuthStore(s => s.removeAccount)
	const logout = useAuthStore(s => s.logout)

	const { switchTo, switching } = useSwitchUser(onReset)

	const handleSwitch = async (username: string) => {
		if (switching) return
		await switchTo(username)
		onClose()
	}

	const handleRemove = (username: string) => {
		const isActive = username === activeUsername
		if (!isActive) {
			removeAccount(username)
			return
		}

		const remaining = useAuthStore
			.getState()
			.accounts.filter(a => a.username !== username)

		removeAccount(username)
		logout()
		onReset()

		if (remaining.length > 0) {
			switchTo(remaining[0].username)
		} else {
			navigate('/login', { replace: true })
		}
	}

	return { accounts, activeUsername, handleSwitch, handleRemove, switching }
}
```

#### 3. SendHomework (`features/sendHomework`)

Отправка выполненного домашнего задания.

```typescript
// features/sendHomework/hooks/useSendHomework.ts
export function useSendHomework() {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const homeworkApi = useHomeworkApi()

	const send = async (homeworkId: number, file: File) => {
		setLoading(true)
		setError(null)

		try {
			const formData = new FormData()
			formData.append('file', file)

			await homeworkApi.upload(homeworkId, formData)
			// Обновляем store
			// Показываем success message
		} catch (err) {
			setError('Ошибка при отправке')
		} finally {
			setLoading(false)
		}
	}

	return { send, loading, error }
}
```

#### 4. InitUser (`features/initUser`)

Инициализация пользователя при запуске приложения.

```typescript
// features/initUser/hooks/useInitUser.ts
let fetching = false

export function useInitUser() {
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const user = useUserStore(s => s.user)
	const setUser = useUserStore(s => s.setUser)

	useEffect(() => {
		// Пропускаем если:
		// - Store ещё не загружены
		// - Пользователь не аутентифицирован
		// - User уже загружен
		// - Уже есть запрос в полёте
		if (!hasHydrated || !isAuthenticated || user || fetching) {
			return
		}

		fetching = true
		userApi
			.getMe()
			.then(data => setUser(data.data))
			.catch(err => {
				if (err?.response?.status === 401) {
					console.warn(
						'[useInitUser] 401 - пользователь больше не аутентифицирован',
					)
				}
			})
			.finally(() => {
				fetching = false
			})
	}, [hasHydrated, isAuthenticated, user])
}
```

---

## Слой 4: Pages (Страницы)

Страницы комбинируют widgets и features для создания полных экранов приложения.

### Структура Page

```
page/
└── ui/
    ├── PageName.tsx      # Main page component
    ├── PageNameSection.tsx
    └── ... (sub-components if needed)
```

### Пример: Home Page

```typescript
// pages/home/ui/HomePage.tsx
export function HomePage() {
  // Используем features
  const { initUser } = useInitUser()

  // Используем entities
  const user = useUserStore(s => s.user)
  const { dashboard } = useDashboard()

  // Используем widgets
  return (
    <div>
      <TopBar />
      <DashboardCharts data={dashboard.charts} />
      <Leaderboard data={dashboard.leaderboard} />
      <FutureExams />
      <ReviewList />
      <BottomBar />
    </div>
  )
}
```

### Список страниц

| Маршрут           | Компонент          | Назначение                   |
| ----------------- | ------------------ | ---------------------------- |
| `/login`          | LoginPage          | Аутентификация               |
| `/`               | HomePage           | Главная страница с дашбордом |
| `/grades`         | GradesPage         | Таблица оценок               |
| `/homework`       | HomeworkPage       | Список домашних заданий      |
| `/schedule`       | SchedulePage       | Расписание занятий           |
| `/profile`        | ProfilePage        | Профиль пользователя         |
| `/profile-detail` | ProfileDetailsPage | Детали профиля               |
| `/payment`        | PaymentPage        | Участие и платежи            |

---

## Слой 5: App (Приложение)

Верхний уровень - конфигурация всего приложения.

### Структура

```
app/
├── App.tsx              # Root компонент
├── hooks/
│   ├── useMidnightRefresh.ts
│   └── ... (app-level hooks)
├── layouts/
│   └── AppLayout.tsx    # Main layout
├── lib/
│   └── resetAllStores.ts # Reset всех stores при логауте
└── router/
    └── index.tsx        # Маршрутизация и route guards
```

### App.tsx

```typescript
export function App() {
  useInitUser()  // Инициализация
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Управление темой
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    if (theme === 'light') document.documentElement.classList.add('light')
  }, [theme])

  return (
    <>
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <AppRouter />
    </>
  )
}
```

### Router

```typescript
export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        {/* Public маршруты */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected маршруты */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/grades" element={<GradesPage />} />
                  <Route path="/homework" element={<HomeworkPage />} />
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile-detail" element={<ProfileDetailsPage />} />
                  <Route path="/payment" element={<PaymentPage />} />

                  {/* 404 */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const hasHydrated = useHydrationStore(s => s.hasHydrated)

  if (!hasHydrated) {
    return <LoadingScreen />
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}
```

---

## Управление состоянием

### Zustand Store Pattern

Все entities используют единый паттерн для stores:

```typescript
interface EntityState {
	// Данные
	items: EntityType[]
	status: LoadingState // 'idle' | 'loading' | 'success' | 'error'
	error: string | null
	loadedAt: number | null

	// Действия
	setItems: (items: EntityType[]) => void
	setStatus: (status: LoadingState) => void
	setError: (error: string | null) => void
	setLoadedAt: (time: number) => void
	reset: () => void
}

export const useEntityStore = create<EntityState>()(
	persist(
		set => ({
			items: [],
			status: 'idle',
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
			name: 'entity-store',
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

### Инициализация при логауте

```typescript
// app/lib/resetAllStores.ts
export function resetAllStores(): void {
  useHomeworkStore.getState().reset()
  useGradesStore.getState().reset()
  usePaymentStore.getState().reset()

  useUserStore.setState({ user: null })
  useExamStore.setState({ exams: [], status: 'idle', loadedAt: null })
  // ... и т.д. для всех stores
}

// Вызывается из useAuthStore.logout()
logout: () =>
  set(state => {
    resetAllStores()
    return {
      token: null,
      isAuthenticated: false,
      activeUsername: null,
      accounts: state.accounts.filter(a => a.username !== state.activeUsername),
    }
  }),
```

---

## Data Flow

### Жизненный цикл загрузки данных

```
1. Компонент монтируется
   ↓
2. Есть хук (useEntity)
   ├─ Проверяет кеш (isCacheValid)
   ├─ Если кеш валиден: возвращает из store
   └─ Если кеш невалиден: загружает данные
   ↓
3. API запрос
   ├─ Request interceptor добавляет Authorization
   → Server
   ← Server
   ├─ Response interceptor обрабатывает ошибки
   └─ Возвращает данные
   ↓
4. Обновление store
   ├─ setItems(data)
   ├─ setStatus('success')
   ├─ setLoadedAt(Date.now())
   └─ Компонент re-renders
   ↓
5. Данные отображаются пользователю
   ↓
6. При logout
   ├─ resetAllStores() очищает все
   └─ Редирект на /login
```

---

## Зависимости между слоями

```
app  ────────────────────────────────────────────────┐
│                                                     │
pages ───────────────────────────────────────────┐   │
│                                                │   │
features ◄────────────────────────────────────┐  │   │
│        │                                     │  │   │
│        └──────────────────────────────────┐  │  │   │
│                                           ▼  │  │   │
entities ◄──────────────────────────────────┘  │  │   │
│         │                                    │  │   │
│         └────────────────────────────────┐   │  │   │
│                                          ▼   │  │   │
shared ◄───────────────────────────────────┘   │  │   │
       ▲                                        │  │   │
       └────────────────────────────────────────┘  │   │
                                                   │   │
                                                   └───┘

Правила:
✅ upper layers могут импортировать из lower layers
❌ lower layers НЕ могут импортировать из upper layers
```

---

## Примеры импортов

```typescript
// ✅ OK - entities импортируют из shared
import { api } from '@/shared/api'
import { useContainerReady } from '@/shared/hooks'

// ✅ OK - features импортируют из entities и shared
import { useUserStore } from '@/entities/user'
import { userApi } from '@/entities/user'
import { useAuthStore } from '@/features/auth'

// ✅ OK - pages импортируют из features, entities, shared
import { HomePage } from '@/pages'
import { useSendHomework } from '@/features/sendHomework'
import { useHomework } from '@/entities/homework'

// ❌ WRONG - shared не должен импортировать из features
import { useSendHomework } from '@/features/sendHomework' // ❌ Bad

// ❌ WRONG - entities не должны импортировать друг друга
import { useGradesStore } from '@/entities/grades' // ❌ Bad (если в другой entity)
```

---

## Выводы

FSD архитектура JournalAPP обеспечивает:

1. **Масштабируемость** - легко добавлять новые feature и entities
2. **Maintainability** - ясная структура кода
3. **Testability** - независимые слои легче тестировать
4. **Separation of Concerns** - каждый слой отвечает за свое
5. **Code Reusability** - shared layer для переиспользуемого кода

Следование этой архитектуре критично при добавлении нового функционала.
