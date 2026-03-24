# 📚 JournalAPP - Полная документация

## 📋 Оглавление

1. [Обзор проекта](#обзор-проекта)
2. [Технологический стек](#технологический-стек)
3. [Структура проекта](#структура-проекта)
4. [Архитектура](#архитектура)
5. [Установка и запуск](#установка-и-запуск)
6. [Основные модули](#основные-модули)
7. [Управление состоянием](#управление-состоянием)
8. [API интеграция](#api-интеграция)
9. [Направления развития](#направления-развития)

---

## 🎯 Обзор проекта

**JournalAPP** — это современная система электронного журнала для IT-TOP, разработанная для управления оценками, домашними заданиями, расписанием и другой учебной информацией.

### Ключевые функции:

- 📊 **Управление оценками** - просмотр и отслеживание успеваемости
- 📝 **Домашние задания** - просмотр и управление заданиями
- 📅 **Расписание** - просмотр расписания занятий
- 👤 **Профиль** - управление личной информацией
- 💳 **Платежи** - управление платежной информацией
- 🏆 **Лидерборд** - рейтинг студентов
- 📱 **Кроссплатформенность** - веб, iOS и Android (через Capacitor)

### Статус проекта:

- Текущий статус: **В разработке (developer testing)**
- Версия: 0.0.0

---

## 🛠️ Технологический стек

### Frontend

- **React** 19.2.0 - UI фреймворк
- **TypeScript** 5.9.3 - типизированный JavaScript
- **Vite** 7.3.1 - сборщик проекта
- **React Router** 7.13.1 - маршрутизация

### Состояние и данные

- **Zustand** 5.0.11 - управление состоянием
- **Axios** 1.13.6 - HTTP клиент

### Стилизация

- **Tailwind CSS** 4.2.1 - утилиты CSS
- **Lucide React** 0.576.0 - иконки
- **Recharts** 3.7.0 - графики и диаграммы

### Мобильная разработка

- **Capacitor** 0.5.6 - фреймворк для кроссплатформенных приложений
- **@capacitor/core** 8.2.0 - ядро Capacitor
- **@capacitor/ios** 8.2.0 - интеграция iOS
- **@capacitor/android** 8.2.0 - интеграция Android

### Инструменты разработки

- **Biome** 2.4.4 - линтер и форматер
- **ESLint** - статический анализ кода
- **ts-node** - выполнение TypeScript в Node.js

---

## 📁 Структура проекта

```
journalWeb/
├── src/
│   ├── app/                 # Конфигурация приложения
│   │   ├── App.tsx         # Root компонент с темой
│   │   ├── hooks/          # Приложение-уровня хуки
│   │   ├── layouts/        # Основные layout'ы
│   │   ├── lib/            # Утилиты приложения
│   │   └── router/         # Маршрутизация и защищённые маршруты
│   │
│   ├── entities/           # Доменные сущности (FSD)
│   │   ├── user/           # Пользователь
│   │   ├── grades/         # Оценки
│   │   ├── homework/       # Домашние задания
│   │   ├── schedule/       # Расписание
│   │   ├── dashboard/      # Главная панель
│   │   ├── exam/           # Экзамены
│   │   ├── leaderboard/    # Лидерборд
│   │   ├── payment/        # Платежи
│   │   ├── profile/        # Профиль
│   │   ├── review/         # Отзывы
│   │   └── subject/        # Предметы
│   │
│   ├── features/           # Бизнес-логика функций
│   │   ├── auth/           # Аутентификация
│   │   ├── initUser/       # Инициализация пользователя
│   │   ├── changeUser/     # Смена аккаунта
│   │   ├── sendHomework/   # Отправка домашнего задания
│   │   ├── deleteHomework/ # Удаление домашнего задания
│   │   ├── downloadHomework/ # Скачивание домашнего задания
│   │   ├── refreshGrades/  # Обновление оценок
│   │   ├── refreshHomework/ # Обновление домашних заданий
│   │   ├── selectSpec/     # Выбор специальности
│   │   ├── sortSubjects/   # Сортировка предметов
│   │   └── playCatGame/    # Кот-игра
│   │
│   ├── pages/              # Страницы приложения
│   │   ├── home/           # Главная страница
│   │   ├── grades/         # Оценки
│   │   ├── homework/       # Домашние задания
│   │   ├── schedule/       # Расписание
│   │   ├── profile/        # Профиль
│   │   ├── profileDetail/  # Детали профиля
│   │   ├── payment/        # Платежи
│   │   └── login/          # Вход
│   │
│   ├── shared/             # Общие ресурсы
│   │   ├── api/            # API инстанц
│   │   ├── config/         # Конфигурация (endpoints, cache, env)
│   │   ├── hooks/          # Переиспользуемые хуки
│   │   ├── lib/            # Утилиты (кеширование, storage, etc)
│   │   ├── styles/         # Глобальные стили
│   │   ├── types/          # Общие типы
│   │   └── ui/             # Переиспользуемые компоненты
│   │
│   ├── widgets/            # Составные UI виджеты
│   │   ├── TopBar/         # Верхняя навигационная панель
│   │   ├── BottomBar/      # Нижняя панель навигации
│   │   ├── HomeworkList/   # Список домашних заданий
│   │   ├── Grades/         # Компонент оценок
│   │   ├── Schedule/       # Компонент расписания
│   │   ├── FutureExams/    # Предстоящие экзамены
│   │   ├── DashboardCharts/ # Графики дашборда
│   │   └── ... (другие виджеты)
│   │
│   ├── main.tsx            # Точка входа приложения
│   └── index.css           # Глобальные стили
│
├── public/                 # Статические assets
│   ├── manifest.webmanifest
│   └── loader.lottie
├── package.json            # Зависимости
├── vite.config.ts         # Конфигурация Vite
├── tsconfig.json          # Конфигурация TypeScript
├── biome.json             # Конфигурация Biome
└── capacitor.config.ts    # Конфигурация Capacitor
```

---

## 🏗️ Архитектура

### Паттерн: Feature-Sliced Design (FSD)

Проект следует архитектурному паттерну FSD, который организует код в слои по функциональности:

```
┌─────────────────────────────────────────┐
│          app (App-level logic)          │
├─────────────────────────────────────────┤
│      pages (Page-level components)      │
├─────────────────────────────────────────┤
│    features (Business logic features)   │
├─────────────────────────────────────────┤
│      entities (Domain entities)         │
├─────────────────────────────────────────┤
│        shared (Shared resources)        │
└─────────────────────────────────────────┘
```

### Слои архитектуры:

#### 1. **Shared Layer** (Общие ресурсы)

- API инстанц с interceptors
- Конфигурация и переменные окружения
- Общие типы и интерфейсы
- Утилиты (кеширование, storage)
- Переиспользуемые UI компоненты

#### 2. **Entities Layer** (Доменные сущности)

Каждая сущность содержит:

```
entity/
├── api/           # API запросы для сущности
├── model/         # Zustand store и типы
├── hooks/         # Хуки для работы с сущностью
└── index.ts       # Public API
```

Примеры: User, Grades, Homework, Schedule, etc.

#### 3. **Features Layer** (Функции)

Содержит бизнес-логику, которая комбинирует несколько entities:

```
feature/
├── api/           # Специальные API запросы
├── hooks/         # Хуки для этой функции
├── model/         # Состояние и типы
└── ui/            # UI компоненты функции
```

Примеры: Auth, SendHomework, ChangeUser, etc.

#### 4. **Pages Layer** (Страницы)

```
page/
└── ui/            # Page компоненты
```

#### 5. **App Layer** (Приложение)

- Router конфигурация
- Protected/Public routes
- Theme управление
- Layout оборачивание

### Управление состоянием с Zustand

Каждая сущность имеет свой Zustand store:

```typescript
// entities/grades/model/store.ts
export const useGradesStore = create<GradesState>()(
	persist(
		set => ({
			entries: [],
			status: 'idle',
			error: null,
			loadedAt: null,

			update: patch => set(patch),
			reset: () => set(/* initial state */),
		}),
		{
			name: 'grades-store',
			partialize: state => ({
				entries: state.entries,
				loadedAt: state.loadedAt,
			}),
		},
	),
)
```

**Ключевые особенности:**

- ✅ `persist` middleware для сохранения в localStorage
- ✅ `partialize` для выбора, что сохранять
- ✅ Общий интерфейс состояния для всех сущностей
- ✅ Методы reset для логаута

```typescript
// LoadingState паттерн
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Каждый store имеет:
interface EntityState {
	data: T[]
	status: LoadingState
	error: string | null
	loadedAt: number | null

	setData: (data: T[]) => void
	setStatus: (s: LoadingState) => void
	setError: (e: string | null) => void
	setLoadedAt: (t: number) => void
	reset: () => void
}
```

### API интеграция

```typescript
// shared/api/index.ts
export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
})

// Request interceptor - добавляет token
api.interceptors.request.use(config => {
	const token = useAuthStore.getState().token
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Response interceptor - обработка ошибок
api.interceptors.response.use(
	res => res,
	async err => {
		const status = err.response?.status
		if (status === 401) {
			// Handle unauthorized
		}
		return Promise.reject(err)
	},
)
```

---

## 🚀 Установка и запуск

### Требования

- Node.js 18+
- npm или yarn

### Установка зависимостей

```bash
cd journalWeb
npm install
# или
yarn install
```

### Команды для разработки

```bash
# Запуск dev сервера (http://localhost:5173)
npm run dev

# Build продакшена
npm run build

# Preview собранного приложения
npm run preview

# Линтирование кода
npm run lint
```

### Мобильная разработка (Capacitor)

```bash
# Build веб приложения
npm run build

# Synced файлы в native проекты
npx cap sync

# Открыть iOS проект
npx cap open ios

# Открыть Android проект
npx cap open android
```

### Переменные окружения

Создайте файл `.env` в корне `journalWeb/`:

```env
VITE_API_BASE_URL=https://msapi-top-journal.ru
```

Текущая конфигурация в `vite.config.ts` проксирует запросы к `/api` и `/files` на backend.

---

## 📦 Основные модули

### Auth Module (`features/auth`)

**Функциональность:**

- Логин/логаут пользователей
- Управление токеном
- Сохранение нескольких аккаунтов (до 5)
- Переключение между аккаунтами

**Основные компоненты:**

```typescript
// useLogin() - форма логина
const { username, password, error, loading, submit } = useLogin()

// useAuthStore - хранилище auth
const { token, isAuthenticated, accounts, activeUsername } = useAuthStore()
const { setToken, logout, saveAccount, switchAccount, removeAccount } =
	useAuthStore()

// useHydrationStore - отслеживание гидрации
const { hasHydrated } = useHydrationStore()
```

### User Module (`entities/user`)

**Функциональность:**

- Получение информации пользователя
- Управление профилем
- Аватар пользователя

**API endpoints:**

```typescript
readonly USER_ME = '/user/me'
readonly USER_PROFILE = '/user/profile'
readonly USER_AVATAR = '/user/me/avatar'
```

**Store:**

```typescript
interface UserState {
	user: UserInfo | null
	setUser: (user: UserInfo) => void
	clearUser: () => void
}
```

### Grades Module (`entities/grades`)

**Функциональность:**

- Просмотр оценок по предметам
- Отслеживание прогресса
- Фильтрация по специальностям

**Store состояние:**

```typescript
interface GradesState {
	entries: GradeEntry[]
	status: LoadingState
	error: string | null
	loadedAt: number | null
	bySubject: Record<number, SubjectData>

	update: (patch: Partial<GradesState>) => void
	updateSubject: (specId: number, patch: Partial<SubjectData>) => void
	reset: () => void
}
```

### Homework Module (`entities/homework`)

**Функциональность:**

- Список домашних заданий
- Фильтрация по статусу
- Pagination (6 элементов на странице)
- Преобразование preview изображений

**Особенности:**

- `PAGE_SIZE = 6` - размер страницы
- `PREVIEW_SIZE = 6` - размер preview
- `AUTO_REFRESH_MS = 90 * 60 * 1000` - автообновление
- `CACHE_TTL_MS = 15 * 60 * 1000` - время кеша

**API endpoints:**

```typescript
readonly HOMEWORK_COUNTERS = '/homework/counters'
readonly HOMEWORK_LIST = '/homework/list'
readonly HOMEWORK_ALL = '/homework/all'
readonly HOMEWORK_UPLOAD = '/homework/upload'
readonly HOMEWORK_DELETE = '/homework/delete'
```

### Schedule Module (`entities/schedule`)

**Функциональность:**

- Расписание на день
- Расписание по месяцам
- Фильтрация по датам

**API endpoints:**

```typescript
readonly SCHEDULE_TODAY = '/schedule/today'
readonly SCHEDULE_BY_DATE = '/schedule/by-date'
readonly SCHEDULE_MONTH = '/schedule/month'
```

### Dashboard Module (`entities/dashboard`)

**Функциональность:**

- Счётчики активности
- Лидерборд (группа и поток)
- Графики прогресса и посещаемости
- Квизы и активность

**API endpoints:**

```typescript
readonly DASHBOARD_COUNTERS = '/dashboard/counters'
readonly DASHBOARD_LEADERBOARD_GROUP = '/dashboard/leaderboard/group'
readonly DASHBOARD_LEADERBOARD_STREAM = '/dashboard/leaderboard/stream'
readonly DASHBOARD_CHART_PROGRESS = '/dashboard/chart/average-progress'
readonly DASHBOARD_CHART_ATTENDANCE = '/dashboard/chart/attendance'
```

### Feature: Send Homework (`features/sendHomework`)

**Функциональность:**

- Отправка выполненного домашнего задания
- Загрузка файлов
- Обработка ошибок

**Хуки:**

```typescript
export function useSendHomework()
export function useSendHomeworkModal()
```

### Feature: Change User (`features/changeUser`)

**Функциональность:**

- Переключение между сохранёнными аккаунтами
- Удаление сохранённых аккаунтов
- Логаут из текущего аккаунта

**Хуки:**

```typescript
export function useAccountSwitcher(onReset, onClose)
export function useSwitchUser(onReset)
```

---

## 🎛️ Управление состоянием

### Инициализация приложения

1. **App.tsx** загружается
2. **useInitUser()** хук проверяет гидрацию и аутентификацию
3. Если пользователь аутентифицирован, загружаем `/user/me`
4. **Protected routes** отображаются только если есть токен

### Жизненный цикл состояния

```
Загрузка приложения
    ↓
useHydrationStore.hasHydrated == false (показыва loading)
    ↓
Гидрация auth store (из localStorage)
    ↓
useHydrationStore.hasHydrated == true
    ↓
Проверка isAuthenticated
    ├─ true → загружаем user и переходим в app
    └─ false → редирект на /login
    ↓
useInitUser загружает UserInfo
    ↓
Приложение готово
```

### Reset состояния при логауте

`resetAllStores()` функция в `app/lib/resetAllStores.ts` очищает все хранилища:

```typescript
export function resetAllStores(): void {
	useHomeworkStore.getState().reset()
	useGradesStore.getState().reset()
	usePaymentStore.getState().reset()

	useUserStore.setState({ user: null })
	useExamStore.setState({ exams: [], status: 'idle', loadedAt: null })
	// ... и т.д.
}
```

Вызывается из `useAuthStore.logout()` действия.

### Кеширование

**Стратегия кеширования:**

```typescript
interface CacheConfig {
	TTL_MS: number // Время жизни кеша
}

function isCacheValid(loadedAt: number | null, ttl: number): boolean {
	if (!loadedAt) return false
	return Date.now() - loadedAt < ttl
}
```

**Примеры:**

- Grades: 15 минут
- Homework: 15 минут
- Exam: на сессию (через localStorage)

### Image Caching

```typescript
// shared/lib/imageCache.ts
export function getCachedImageUrl(url?: string | null): string | null
export function preloadImages(urls: string[]): Promise<void>
export function fixUrl(url: string): string
```

---

## 🌐 API интеграция

### API Endpoints

#### Auth

```
POST /auth/login - Логин пользователя
Request: { username: string, password: string }
Response: { token: string, user: UserInfo }
```

#### User

```
GET /user/me - Current user info
GET /user/profile - User profile data
GET /user/me/avatar - User avatar
```

#### Grades

```
GET /grades/all - Все оценки
GET /grades/by-subject/{specId} - Оценки по предмету
```

#### Homework

```
GET /homework/list - Список домашних заданий (paginated)
GET /homework/all - Все домашние задания
GET /homework/counters - Счётчики домашних заданий
POST /homework/upload - Загрузка домашнего задания
DELETE /homework/{id} - Удаление домашнего задания
```

#### Schedule

```
GET /schedule/today - Расписание на сегодня
GET /schedule/by-date?date={ISO} - Расписание на дату
GET /schedule/month?year={Y}&month={M} - Расписание на месяц
```

#### Dashboard

```
GET /dashboard/counters - Счётчики
GET /dashboard/leaderboard/group - Лидерборд группы
GET /dashboard/leaderboard/stream - Лидерборд потока
GET /dashboard/chart/average-progress - График прогресса
GET /dashboard/chart/attendance - График посещаемости
GET /dashboard/activity - Активность
GET /dashboard/quizzes - Тесты
```

### Error Handling

```typescript
api.interceptors.response.use(
	res => res,
	async err => {
		const status = err.response?.status

		if (status === 401) {
			// Unauthorized - redirect to login
			useAuthStore.setState({ isAuthenticated: false })
		}

		return Promise.reject(err)
	},
)
```

### Request Interceptors

- ✅ Автоматически добавляет Authorization header
- ✅ Обрабатывает FormData (удаляет Content-Type для автоматического boundary)
- ✅ Базовый URL из конфигурации

---

## 🎨 UI компоненты и виджеты

### Widgets (Составные компоненты)

#### TopBar

Верхняя панель с информацией пользователя:

- Имя пользователя
- Название группы
- Аватар
- Кнопки действия

#### BottomBar

Нижняя навигационная панель:

- Гавная страница (Home)
- Оценки (Grades)
- Домашние задания (Homework)
- Расписание (Schedule)
- Профиль (Profile)

#### HomeworkList

Список домашних заданий с:

- Фильтрацией по статусу
- Пагинацией
- Предпросмотром
- Действиями (отправка, скачивание, удаление)

#### Grades

Таблица оценок с:

- Группировкой по предметам
- Статистикой
- Фильтрацией

#### Schedule

Расписание с:

- Представлением дня/недели/месяца
- Деталями урока
- Фильтрацией

#### DashboardCharts

Графики с:

- Прогрессом обучения
- Посещаемостью
- Использованием Recharts

### Shared UI компоненты

В `shared/ui/` находятся переиспользуемые компоненты:

- AvatarPlaceholder
- CustomTooltip
- ErrorView
- MonthGrid
- PageHeader
- RefreshButton
- ShowMoreBtn
- И другие...

---

## 📱 Страницы приложения

### Login (`/login`)

Страница аутентификации с формой логина.

### Home (`/`)

Главная страница с:

- Приветствием пользователя
- Дашбордом с статистикой
- Графиками
- Лидербордом

### Grades (`/grades`)

Таблица оценок по предметам.

### Homework (`/homework`)

Список и управление домашними заданиями.

### Schedule (`/schedule`)

Расписание занятий по дням/неделям/месяцам.

### Profile (`/profile`)

Основной профиль пользователя.

### Profile Detail (`/profile-detail`)

Детальная информация профиля.

### Payment (`/payment`)

Управление платежной информацией.

---

## 🔌 Hooks (Пользовательские хуки)

### App-level hooks

**useInitUser()** - Инициализация пользователя

```typescript
export function useInitUser(): void
```

**useMidnightRefresh()** - Обновление при полночи

```typescript
export function useMidnightRefresh(onMidnight: () => void): void
```

### Shared hooks

**useContainerReady()** - Готовность контейнера
**useCurrentTime()** - Текущее время
**useElementSize()** - Размер элемента
**useLazyItems()** - Ленивая загрузка элементов
**useMonthNav()** - Навигация по месяцам
**useSwipeBack()** - Жест свайпа назад

### Entity hooks

Каждая сущность имеет хуки для работы с данными:

```typescript
// entities/homework/hooks/useHomework.ts
export function useHomework() {
	// Загрузка всех домашних заданий
	// Пагинация
	// Фильтрация
	// Управление раскрытием
}

// entities/grades/hooks/useGrades.ts
export function useGrades() {
	// Загрузка оценок
	// Синхронизация
}

// entities/schedule/hooks/useSchedule.ts
export function useSchedule(date?: Date) {
	// Загрузка расписания
	// Кеширование по датам
}
```

---

## 🔐 Аутентификация и безопасность

### Защита маршрутов

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const hasHydrated = useHydrationStore(s => s.hasHydrated)

	if (!hasHydrated) {
		return <LoadingSpinner /> // или loading skeleton
	}

	return isAuthenticated ? <>{children}</> : <Navigate to='/login' />
}
```

### Token Management

- Token сохраняется в localStorage через `persist` middleware
- Автоматически добавляется в заголовок Authorization
- При 401 ошибке пользователь редиректится на логин

### Multi-Account Support

- До 5 аккаунтов сохраняется в localStorage
- Можно переключаться между аккаунтами
- При логауте удаляется текущий аккаунт из списка

---

## 🎯 Направления развития

### Планируемые улучшения

1. **Offline Support**

   - Service Workers для кеширования
   - Синхронизация при восстановлении соединения

2. **Real-time Notifications**

   - WebSocket для реального времени
   - Push notifications через Capacitor

3. **Performance**

   - Code splitting по маршрутам
   - Lazy loading компонентов
   - Optimized images

4. **Testing**

   - Unit тесты (Vitest)
   - E2E тесты (Cypress/Playwright)
   - Component тесты

5. **Accessibility**

   - Улучшение ARIA labels
   - Keyboard navigation
   - Screen reader support

6. **Internationalization (i18n)**
   - Multi-language support
   - Локализация дат и чисел

### Текущие ограничения

⚠️ Дискл это не код завершённого production приложения, а development версия

---

## 📚 Дополнительные ресурсы

### Документация

- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Router Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Capacitor Docs](https://capacitorjs.com)

### Project Tools

- [Biome Code Quality](https://biomejs.dev)
- [Recharts Documentation](https://recharts.org)
- [Axios Documentation](https://axios-http.com)
- [Lucide React Icons](https://lucide.dev)

---

**Версия документации:** 1.0  
**Последнее обновление:** Март 2026  
**Статус:** ✅ В разработке
