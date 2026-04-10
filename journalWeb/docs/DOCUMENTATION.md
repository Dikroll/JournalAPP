# JournalAPP - Полная документация

## Оглавление

1. [Обзор проекта](#обзор-проекта)
2. [Технологический стек](#технологический-стек)
3. [Структура проекта](#структура-проекта)
4. [Архитектура](#архитектура)
5. [Установка и запуск](#установка-и-запуск)
6. [Основные модули](#основные-модули)
7. [Управление состоянием](#управление-состоянием)
8. [API интеграция](#api-интеграция)
9. [CI/CD и релизы](#cicd-и-релизы)

---

## Обзор проекта

**JournalAPP** — современная система электронного журнала для IT-TOP College. Веб-приложение с нативной Android оболочкой через Capacitor.

### Ключевые функции

- **Оценки** — просмотр и отслеживание успеваемости по предметам
- **Домашние задания** — просмотр, отправка, скачивание ДЗ
- **Расписание** — дневное, недельное и месячное представление
- **Библиотека** — учебные материалы и видео
- **Профиль** — управление личной информацией
- **Платежи** — управление платёжной информацией
- **Лидерборд** — рейтинг студентов (группа и поток)
- **Уведомления** — changelog обновлений, оценка занятий
- **Обновление APK** — скачивание и установка обновлений на Android
- **Светлая/тёмная тема** — переключение темы оформления
- **Кроссплатформенность** — веб и Android (через Capacitor)

---

## Технологический стек

### Frontend

- **React** 19 — UI фреймворк
- **TypeScript** 5.9 — типизация
- **Vite** 7.3 — сборщик проекта
- **React Router** 7 — маршрутизация

### Состояние и данные

- **Zustand** 5 — управление состоянием
- **Axios** — HTTP клиент

### Стилизация

- **Tailwind CSS** 4 — утилиты CSS
- **Lucide React** — иконки
- **Recharts** — графики и диаграммы

### Мобильная разработка

- **Capacitor** — фреймворк для кроссплатформенных приложений
- **@capacitor/core** 8 — ядро Capacitor
- **@capacitor/android** 8 — интеграция Android

### Инструменты

- **Bun** — пакетный менеджер и runtime
- **Biome** — линтер и форматер
- **Vitest** — тестирование

---

## Структура проекта

```
journalWeb/
├── src/
│   ├── app/                  # Конфигурация приложения
│   │   ├── App.tsx           # Root компонент с темой
│   │   ├── hooks/            # useMidnightRefresh
│   │   ├── layouts/          # Основные layout'ы
│   │   ├── ui/               # ThemeToggleButton
│   │   └── router/           # Routing и protected routes
│   │
│   ├── entities/             # Доменные сущности (13 шт.)
│   │   ├── user/             # Пользователь
│   │   ├── grades/           # Оценки
│   │   ├── homework/         # Домашние задания
│   │   ├── schedule/         # Расписание
│   │   ├── dashboard/        # Главная панель
│   │   ├── exam/             # Экзамены
│   │   ├── feedback/         # Оценка занятий
│   │   ├── leaderboard/      # Лидерборд
│   │   ├── library/          # Библиотека материалов
│   │   ├── payment/          # Платежи
│   │   ├── profile/          # Профиль
│   │   ├── review/           # Отзывы
│   │   └── subject/          # Предметы
│   │
│   ├── features/             # Бизнес-логика (20 шт.)
│   │   ├── appUpdate/        # Обновление APK
│   │   ├── auth/             # Аутентификация
│   │   ├── changeUser/       # Смена аккаунта
│   │   ├── clearCache/       # Очистка кеша
│   │   ├── deleteHomework/   # Удаление ДЗ
│   │   ├── downloadHomework/ # Скачивание ДЗ
│   │   ├── initUser/         # Инициализация пользователя
│   │   ├── logout/           # Логаут
│   │   ├── playCatGame/      # Пасхалка
│   │   ├── playVideo/        # Воспроизведение видео
│   │   ├── refreshGrades/    # Обновление оценок
│   │   ├── refreshHomework/  # Обновление ДЗ
│   │   ├── refreshLibrary/   # Обновление библиотеки
│   │   ├── refreshSchedule/  # Обновление расписания
│   │   ├── selectSpec/       # Выбор специальности
│   │   ├── sendHomework/     # Отправка ДЗ
│   │   ├── sendNotifications/# Уведомления и changelog
│   │   ├── showOnboarding/   # Онбординг
│   │   ├── showPreview/      # Предпросмотр файлов
│   │   └── sortSubjects/     # Сортировка предметов
│   │
│   ├── pages/                # Страницы (10 шт.)
│   │   ├── home/             # Главная
│   │   ├── grades/           # Оценки
│   │   ├── homework/         # Домашние задания
│   │   ├── schedule/         # Расписание
│   │   ├── library/          # Библиотека
│   │   ├── profile/          # Профиль
│   │   ├── profileDetail/    # Детали профиля
│   │   ├── payment/          # Платежи
│   │   ├── notifications/    # Уведомления
│   │   └── login/            # Вход
│   │
│   ├── widgets/              # Составные виджеты (14 шт.)
│   │   ├── TopBar/           # Верхняя панель
│   │   ├── BottomBar/        # Нижняя навигация
│   │   ├── DashboardCharts/  # Графики дашборда
│   │   ├── EvaluateLesson/   # Оценка занятий
│   │   ├── FutureExams/      # Предстоящие экзамены
│   │   ├── Grades/           # Компоненты оценок
│   │   ├── HomeworkList/     # Список ДЗ
│   │   ├── Leaderboard/      # Лидерборд
│   │   ├── Library/          # Библиотека
│   │   ├── Loading/          # Загрузочные экраны
│   │   ├── Payment/          # Компоненты платежей
│   │   ├── Profile/          # Компоненты профиля
│   │   ├── ReviewList/       # Отзывы
│   │   └── Schedule/         # Расписание
│   │
│   ├── shared/               # Общие ресурсы
│   │   ├── api/              # Axios инстанц с interceptors
│   │   ├── config/           # apiConfig, cacheConfig, env, pageConfig, и др.
│   │   ├── hooks/            # useSwipeBack, useMonthNav, useLazyItems, и др.
│   │   ├── lib/              # appRelease, imageCache, themeStore, и др.
│   │   ├── styles/           # Глобальные стили, тема
│   │   ├── types/            # Общие TypeScript типы
│   │   ├── ui/               # Badge, BottomSheet, IconButton, и др.
│   │   └── utils/            # dateUtils, formatUtils, nameUtils
│   │
│   └── main.tsx              # Точка входа
│
├── public/                   # Статические assets
├── scripts/                  # Скрипты сборки (prepare-android-release)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── biome.json
└── capacitor.config.ts
```

---

## Архитектура

### Feature-Sliced Design (FSD)

```
┌─────────────────────────────┐
│       app (верхний)         │
├─────────────────────────────┤
│       pages                 │
├─────────────────────────────┤
│       widgets               │
├─────────────────────────────┤
│       features              │
├─────────────────────────────┤
│       entities              │
├─────────────────────────────┤
│       shared (нижний)       │
└─────────────────────────────┘
```

**Принцип:** нижние слои не импортируют из верхних.

---

## Установка и запуск

### Требования

- Node.js 22+
- Bun (рекомендуется) или npm

### Установка и запуск

```bash
cd journalWeb
bun install
bun run dev
# → http://localhost:5173
```

### Команды

```bash
bun run dev       # Dev сервер
bun run build     # Production build
bun run preview   # Preview build
bun run lint      # Biome lint
bun run test      # Vitest тесты
```

### Мобильная разработка

```bash
bun run build
bunx cap sync
bunx cap open android
```

### Переменные окружения

```env
VITE_API_BASE_URL=https://msapi-top-journal.ru
```

---

## Основные модули

### Entities

| Entity          | Назначение              |
| --------------- | ----------------------- |
| **user**        | Информация пользователя |
| **grades**      | Оценки по предметам     |
| **homework**    | Домашние задания        |
| **schedule**    | Расписание занятий      |
| **dashboard**   | Счётчики, графики       |
| **exam**        | Предстоящие экзамены    |
| **feedback**    | Оценка занятий          |
| **leaderboard** | Рейтинги студентов      |
| **library**     | Учебные материалы       |
| **payment**     | Платёжная информация    |
| **profile**     | Расширенный профиль     |
| **review**      | Отзывы                  |
| **subject**     | Предметы                |

### Features

| Feature              | Назначение                                   |
| -------------------- | -------------------------------------------- |
| **appUpdate**        | Проверка, скачивание, установка APK обновлений |
| **auth**             | Логин, токен, мульти-аккаунт (до 5)         |
| **changeUser**       | Переключение между аккаунтами               |
| **clearCache**       | Очистка кеша приложения                      |
| **sendHomework**     | Отправка выполненного ДЗ                     |
| **deleteHomework**   | Удаление отправленного ДЗ                    |
| **downloadHomework** | Скачивание файлов ДЗ                         |
| **initUser**         | Загрузка данных пользователя при старте      |
| **logout**           | Выход из аккаунта                            |
| **sendNotifications**| Changelog, уведомления, бейдж непрочитанных  |
| **showOnboarding**   | Онбординг для новых пользователей            |
| **showPreview**      | Предпросмотр изображений и файлов            |
| **playVideo**        | Воспроизведение видео материалов             |
| **refreshGrades/Homework/Library/Schedule** | Обновление данных с кешированием |
| **selectSpec**       | Выбор специальности                          |
| **sortSubjects**     | Сортировка предметов                         |
| **playCatGame**      | Пасхалка                                     |

### Pages

| Маршрут           | Страница           | Назначение                   |
| ----------------- | ------------------ | ---------------------------- |
| `/login`          | LoginPage          | Аутентификация               |
| `/`               | HomePage           | Главная с дашбордом          |
| `/grades`         | GradesPage         | Оценки                       |
| `/homework`       | HomeworkPage       | Домашние задания              |
| `/schedule`       | SchedulePage       | Расписание                   |
| `/library`        | LibraryPage        | Библиотека материалов        |
| `/profile`        | ProfilePage        | Профиль                      |
| `/profile-detail` | ProfileDetailsPage | Детали профиля               |
| `/payment`        | PaymentPage        | Платежи                      |
| `/notifications`  | NotificationsPage  | Уведомления и changelog      |

---

## Управление состоянием

### Zustand Store Pattern

```typescript
export const useEntityStore = create<EntityState>()(
  persist(
    set => ({
      items: [],
      status: 'idle',
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

### Жизненный цикл

```
Загрузка приложения
    ↓
Гидрация stores из localStorage
    ↓
Проверка isAuthenticated
    ├─ true → useInitUser загружает UserInfo → приложение готово
    └─ false → редирект на /login
    ↓
При logout → resetAllAppState() очищает все stores
```

### Кеширование

```typescript
// Стратегия по TTL
const CACHE_TTL = 15 * 60 * 1000 // 15 минут
if (isCacheValid(loadedAt, CACHE_TTL)) return cachedData
```

---

## API интеграция

### Axios с interceptors

- Request interceptor: добавляет `Authorization: Bearer {token}`
- Response interceptor: при 401 — редирект на `/login`
- FormData: автоматическое удаление `Content-Type` для файлов

### Подробная документация API

См. [API_REFERENCE.md](API_REFERENCE.md).

---

## CI/CD и релизы

### GitHub Actions: Android Release

Workflow `android-release.yml` автоматизирует:

1. Build веб-бандла через Vite
2. Сборку APK через Capacitor + Gradle
3. Подпись APK ключом из secrets
4. Публикацию GitHub Release с APK
5. Обновление `version.json` в JournalAPI

### Формат Release Notes

В поле `release_notes` используйте `\n` для разделения строк, с лейблами:

```
add: Оценка занятий\nfix: Баг светлой темы\nchange: Новый дизайн расписания
```

| Лейбл                       | Цвет       | Использование        |
| ---------------------------- | ---------- | -------------------- |
| `add` / `feat`               | зелёный    | Новая функция        |
| `fix`                        | красный    | Исправление бага     |
| `change` / `update` / `improve` | синий  | Изменение/улучшение  |
| `remove`                     | жёлтый     | Удаление функции     |
| `refactor`                   | фиолетовый | Внутренние изменения |

Парсинг changelog: `shared/lib/appRelease.ts` — `parseChangelogItems()`, `getChangelogLabelStyle()`.

### In-App Update (Android)

Feature `appUpdate` проверяет `version.json` через API, сравнивает build/version, и предлагает скачать APK через `AppUpdateSheet`.

---

**Последнее обновление:** Апрель 2026
