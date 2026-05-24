# Архитектурное решение JournalAPP

## Feature-Sliced Design (FSD)

Проект построен на основе архитектурного паттерна **Feature-Sliced Design**, который делит код приложения на независимые слои.

### Иерархия слоёв (снизу вверх)

```
┌─────────────────────────────────────────────────────────┐
│                      app (0)                             │
│            (Router, App config, Theme)                  │
├─────────────────────────────────────────────────────────┤
│                      pages (1)                           │
│              (Page-level components)                    │
├─────────────────────────────────────────────────────────┤
│                      widgets (2)                         │
│           (Composite UI blocks)                         │
├─────────────────────────────────────────────────────────┤
│                      features (3)                        │
│          (Business features combining entities)         │
├─────────────────────────────────────────────────────────┤
│                      entities (4)                        │
│         (Domain entities with own stores/API)           │
├─────────────────────────────────────────────────────────┤
│                      shared (5)                          │
│    (Reusable UI, hooks, utils, API, config)             │
└─────────────────────────────────────────────────────────┘
```

**Принцип:** нижние слои не знают о верхних.

---

## Слой 1: Shared (Общие ресурсы)

Самый нижний уровень — не зависит ни от чего выше.

### Структура

```
shared/
├── api/
│   └── index.ts              # Axios инстанц с interceptors
├── config/
│   ├── apiConfig.ts          # API endpoints
│   ├── env.ts                # Переменные окружения
│   ├── cacheConfig.ts        # Кеширование TTL
│   ├── pageConfig.ts         # Маршруты страниц
│   ├── feedbackTags.ts       # Теги для оценки занятий
│   ├── illustrationsConfig.ts# Конфиг иллюстраций
│   └── libraryMaterialTypes.ts # Типы материалов библиотеки
├── hooks/
│   ├── useContainerReady.ts
│   ├── useCurrentTime.ts
│   ├── useElementSize.ts
│   ├── useEntityFetch.ts     # Универсальный хук для загрузки entity
│   ├── useLazyItems.ts
│   ├── useMonthNav.ts
│   ├── usePhotoViewer.tsx
│   ├── useScrollableTabs.ts
│   └── useSwipeBack.ts
├── lib/
│   ├── appRelease.ts         # Версионирование, парсинг changelog
│   ├── formatDate.ts
│   ├── getAuthToken.ts
│   ├── imageCache.ts
│   ├── isCacheValid.ts
│   ├── materialUrls.ts
│   ├── pluralize.ts
│   ├── resetAllAppState.ts   # Сброс всех stores при логауте
│   ├── scrollToTop.ts
│   ├── storage.ts
│   ├── themeStore.ts         # Zustand store для темы
│   └── youtube.ts            # YouTube URL утилиты
├── styles/
│   └── index.css             # Глобальные стили и CSS переменные темы
├── types/
│   └── index.ts              # LoadingState, общие типы
├── ui/
│   ├── AvatarPlaceholder/
│   ├── Badge/
│   ├── BottomSheet/
│   ├── CatGame/
│   ├── CustomTooltip/
│   ├── ErrorView/
│   ├── GlowBackground/
│   ├── IconButton/
│   ├── InlineImage/
│   ├── MonthGrid/
│   ├── PageHeader/
│   ├── PhotoViewerModal/
│   ├── RefreshButton/
│   ├── ShowMoreBtn/
│   ├── SkeletonList/
│   ├── StatusView/
│   └── SuccessStateView/
└── utils/
    ├── dateUtils.ts
    ├── formatUtils.ts
    ├── nameUtils.ts
    └── toollipUtils.ts
```

### Ключевые модули

#### API Client (`shared/api/index.ts`)

```typescript
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

// Request interceptor — добавляет Authorization header
// Response interceptor — обрабатывает 401 → редирект на login
// FormData — автоматическое удаление Content-Type
```

#### App Release (`shared/lib/appRelease.ts`)

Типы и утилиты для системы обновлений и changelog:

```typescript
// Типы
interface AppReleaseInfo { version, build, apk_url, changelog }
interface ChangelogItem { label: string | null, text: string }
interface ChangelogFeedEntry { id, version, date?, items: ChangelogItem[] }

// Функции
compareVersions(left, right)        // Сравнение semver
isRemoteReleaseNewer(params)        // Есть ли новая версия
parseChangelogItems(changelog)      // Парсинг changelog с лейблами
getChangelogLabelStyle(label)       // CSS классы для лейблов
toChangelogFeedEntry(release, date) // Конвертация в feed entry
fetchLatestAppRelease(signal?)      // Fetch version.json
```

---

## Слой 2: Entities (Доменные сущности)

Каждая сущность инкапсулирует свой домен.

### Структура Entity

```
entity/
├── api/
│   └── index.ts         # API методы
├── model/
│   ├── store.ts         # Zustand store
│   ├── types.ts         # TypeScript типы
│   └── constants.ts     # Константы
├── hooks/
│   └── useEntity.ts     # Основной хук
└── index.ts             # Public API
```

### Все Entities

| Entity          | Назначение              | Основные данные              |
| --------------- | ----------------------- | ---------------------------- |
| **user**        | Информация пользователя | UserInfo, аватар, профиль    |
| **grades**      | Оценки по предметам     | GradeEntry, статистика       |
| **homework**    | Домашние задания        | HomeworkItem, статус, файлы  |
| **schedule**    | Расписание занятий      | LessonItem, время, место     |
| **subject**     | Список предметов        | Subject, specs               |
| **exam**        | Предстоящие экзамены    | FutureExamItem, даты         |
| **dashboard**   | Данные главной страницы | Счётчики, графики, лидерборд |
| **feedback**    | Оценка занятий          | FeedbackItem, теги           |
| **leaderboard** | Рейтинги студентов      | LeaderboardItem, позиция     |
| **library**     | Учебные материалы       | LibraryMaterial, видео       |
| **payment**     | Платёжная информация    | PaymentInfo, история         |
| **profile**     | Расширенный профиль     | ProfileDetails, контакты     |
| **review**      | Отзывы и оценки         | ReviewItem, рейтинг          |

---

## Слой 3: Features (Бизнес-функции)

Features комбинируют несколько entities для реализации бизнес-логики.

### Структура Feature

```
feature/
├── model/        # Состояние и типы
├── hooks/        # Хуки с бизнес-логикой
├── ui/           # UI компоненты (если есть)
└── index.ts      # Public API
```

### Ключевые Features

#### appUpdate

Система обновления Android APK:
- `useAppUpdate` — проверка версии, скачивание, установка APK
- `useInitAppUpdate` — автоматическая проверка при запуске (с задержкой 3 сек)
- `AppUpdateSheet` — BottomSheet с UI обновления
- Store: `useAppUpdateStore` — статус, прогресс, серверная информация
- Типы берутся из `shared/lib/appRelease.ts` (`AppReleaseInfo`)

#### auth

Аутентификация и мульти-аккаунт:
- `useLogin` — форма логина
- `useAuthStore` — token, accounts (до 5), switchAccount
- `useHydrationStore` — отслеживание гидрации из localStorage

#### sendNotifications

Уведомления и changelog:
- `ChangelogEntry` — type alias для `ChangelogFeedEntry` из shared
- `FALLBACK_CHANGELOG` — фоллбек данные для changelog
- `useNotificationsStore` — lastReadChangelogId, getUnreadCount
- Используется в NotificationsPage и TopBar (бейдж)

---

## Слой 4: Widgets (Составные компоненты)

Виджеты комбинируют UI элементы из shared/ui и данные из entities/features.

| Widget           | Назначение              |
| ---------------- | ----------------------- |
| TopBar           | Верхняя панель с юзером |
| BottomBar        | Нижняя навигация        |
| DashboardCharts  | Графики дашборда        |
| EvaluateLesson   | Оценка занятий          |
| FutureExams      | Предстоящие экзамены    |
| Grades           | Компоненты оценок       |
| HomeworkList      | Список ДЗ              |
| Leaderboard      | Лидерборд              |
| Library          | Библиотека              |
| Loading          | Загрузочные экраны      |
| Payment          | Компоненты платежей     |
| Profile          | Компоненты профиля      |
| ReviewList       | Отзывы                  |
| Schedule         | Расписание              |

---

## Слой 5: Pages (Страницы)

Страницы комбинируют widgets и features.

```
page/
└── ui/
    ├── PageName.tsx
    └── ... (sub-components)
```

| Маршрут           | Компонент          |
| ----------------- | ------------------ |
| `/login`          | LoginPage          |
| `/`               | HomePage           |
| `/grades`         | GradesPage         |
| `/homework`       | HomeworkPage       |
| `/schedule`       | SchedulePage       |
| `/library`        | LibraryPage        |
| `/profile`        | ProfilePage        |
| `/profile-detail` | ProfileDetailsPage |
| `/payment`        | PaymentPage        |
| `/notifications`  | NotificationsPage  |

---

## Слой 6: App (Приложение)

```
app/
├── App.tsx              # Root компонент
├── hooks/
│   └── useMidnightRefresh.ts  # Сброс данных в полночь
├── layouts/
│   └── ui/              # AppLayout
├── ui/
│   └── ThemeToggleButton.tsx
└── router/
    └── index.tsx        # Routes, ProtectedRoute, PublicRoute
```

---

## Управление состоянием

### Zustand Store Pattern

```typescript
export const useEntityStore = create<EntityState>()(
  persist(
    set => ({
      items: [],
      status: 'idle' as LoadingState,
      loadedAt: null,
      setItems: items => set({ items }),
      reset: () => set({ items: [], status: 'idle', loadedAt: null }),
    }),
    {
      name: 'entity-store',
      partialize: state => ({ items: state.items, loadedAt: state.loadedAt }),
    },
  ),
)
```

### Сброс при логауте

`shared/lib/resetAllAppState.ts` очищает все stores.

---

## Data Flow

```
1. Компонент монтируется
   ↓
2. Hook (useEntity) проверяет кеш
   ├─ Кеш валиден → данные из store
   └─ Кеш невалиден → API запрос
   ↓
3. API → interceptors → сервер → ответ
   ↓
4. Обновление store → re-render
   ↓
5. При logout → resetAllAppState() → /login
```

---

## Зависимости между слоями

```
✅ upper layers могут импортировать из lower layers
❌ lower layers НЕ могут импортировать из upper layers
```

```typescript
// ✅ OK
import { api } from '@/shared/api'
import { useUserStore } from '@/entities/user'
import { useLogin } from '@/features/auth'

// ❌ WRONG — shared не импортирует из features
import { useLogin } from '@/features/auth' // в shared коде
```

---

**Последнее обновление:** Апрель 2026
