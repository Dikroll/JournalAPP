# JournalAPP - Индекс документации

## Быстрый старт

```bash
# 1. Установка зависимостей
cd journalWeb
bun install

# 2. Запуск dev сервера
bun run dev

# 3. Открыть в браузере
# http://localhost:5173
```

---

## Справочник документов

### Основная документация

| Документ                                              | Назначение                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| [DOCUMENTATION.md](journalWeb/docs/DOCUMENTATION.md)  | **Полный обзор проекта** — стек, модули, API, hooks               |
| [ARCHITECTURE.md](journalWeb/docs/ARCHITECTURE.md)    | **Архитектура FSD** — слои, паттерны, data flow, правила          |
| [API_REFERENCE.md](journalWeb/docs/API_REFERENCE.md)  | **API Endpoints** — все endpoints, request/response примеры       |
| [SRC_STRUCTURE.md](journalWeb/docs/SRC_STRUCTURE.md)  | **Структура кода** — все файлы, экспорты, сигнатуры функций       |
| [UI_COMPONENTS_GUIDE.md](journalWeb/docs/UI_COMPONENTS_GUIDE.md) | **UI паттерны** — компоненты, Tailwind, accessibility  |

---

## Руководства для специфичных задач

### Я хочу...

#### Начать разработку

1. Прочитайте [DOCUMENTATION.md](journalWeb/docs/DOCUMENTATION.md) — раздел «Установка и запуск»
2. Изучите структуру в [SRC_STRUCTURE.md](journalWeb/docs/SRC_STRUCTURE.md)
3. Поймите архитектуру в [ARCHITECTURE.md](journalWeb/docs/ARCHITECTURE.md)

#### Добавить новую сущность (Entity)

1. Используйте паттерн из [ARCHITECTURE.md](journalWeb/docs/ARCHITECTURE.md) — раздел «Слой 2: Entities»
2. Проверьте API endpoints в [API_REFERENCE.md](journalWeb/docs/API_REFERENCE.md)

#### Добавить новую функцию (Feature)

1. Изучите паттерны в [ARCHITECTURE.md](journalWeb/docs/ARCHITECTURE.md) — раздел «Слой 3: Features»

#### Добавить страницу

1. Посмотрите примеры в [SRC_STRUCTURE.md](journalWeb/docs/SRC_STRUCTURE.md) — раздел «Pages»
2. Дизайн компонентов изучите в [UI_COMPONENTS_GUIDE.md](journalWeb/docs/UI_COMPONENTS_GUIDE.md)

#### Работать с API

1. Найдите endpoint в [API_REFERENCE.md](journalWeb/docs/API_REFERENCE.md)

#### Создать UI компонент

1. Изучите паттерны в [UI_COMPONENTS_GUIDE.md](journalWeb/docs/UI_COMPONENTS_GUIDE.md)
2. Следуйте accessibility guidelines

#### Собрать релиз Android

1. Запустите GitHub Actions workflow `Android Release`
2. Укажите версию, build number и release notes
3. Формат release notes: `add: Новая фича\nfix: Баг\nchange: Изменение`

---

## Шпаргалка команд

### Разработка

```bash
# Запуск dev сервера
bun run dev

# Lint код
bun run lint

# Запуск тестов
bun run test

# Build для production
bun run build

# Preview production build
bun run preview
```

### Мобильная разработка (Capacitor)

```bash
# Build и sync с платформами
bun run build
bunx cap sync

# Открыть Android Studio
bunx cap open android
```

### Git коммиты

```bash
git commit -m "feat: add assignment feature"
git commit -m "fix: resolve grades bug"
git commit -m "refactor: improve api client"
```

---

## Архитектурные слои (FSD)

```
app/          ← Router, Layout, Theme
  ↑
pages/        ← Screen компоненты
  ↑
widgets/      ← Составные UI блоки
  ↑
features/     ← Business logic
  ↑
entities/     ← Domain entities с stores
  ↑
shared/       ← Переиспользуемые компоненты, API, utils
```

**Правило:** нижние слои не знают о верхних.

| Слой          | Использование                              |
| ------------- | ------------------------------------------ |
| **shared/**   | API, UI компоненты, хуки, утилиты          |
| **entities/** | Domain сущности, stores, API для сущностей |
| **features/** | Бизнес-функции, комбинирование entities    |
| **widgets/**  | Составные UI виджеты                       |
| **pages/**    | Экраны приложения                          |
| **app/**      | Глобальная конфигурация, роутер, тема      |

---

## Структура папок

```
src/
├── app/
│   ├── App.tsx            ← Root компонент
│   ├── hooks/             ← App-level хуки (useMidnightRefresh)
│   ├── layouts/           ← Layouts
│   ├── ui/                ← ThemeToggleButton
│   └── router/            ← Routing конфигурация
│
├── entities/              ← Domain сущности
│   ├── user/              ← Пользователь
│   ├── grades/            ← Оценки
│   ├── homework/          ← Домашние задания
│   ├── schedule/          ← Расписание
│   ├── dashboard/         ← Главная панель
│   ├── exam/              ← Экзамены
│   ├── feedback/          ← Оценка занятий
│   ├── leaderboard/       ← Лидерборд
│   ├── library/           ← Библиотека материалов
│   ├── payment/           ← Платежи
│   ├── profile/           ← Профиль
│   ├── review/            ← Отзывы
│   └── subject/           ← Предметы
│
├── features/              ← Бизнес-функции
│   ├── appUpdate/         ← Обновление приложения (APK)
│   ├── auth/              ← Аутентификация
│   ├── changeUser/        ← Смена аккаунта
│   ├── clearCache/        ← Очистка кеша
│   ├── deleteHomework/    ← Удаление ДЗ
│   ├── downloadHomework/  ← Скачивание ДЗ
│   ├── initUser/          ← Инициализация пользователя
│   ├── logout/            ← Логаут
│   ├── playCatGame/       ← Кот-игра (пасхалка)
│   ├── playVideo/         ← Воспроизведение видео
│   ├── refreshGrades/     ← Обновление оценок
│   ├── refreshHomework/   ← Обновление ДЗ
│   ├── refreshLibrary/    ← Обновление библиотеки
│   ├── refreshSchedule/   ← Обновление расписания
│   ├── selectSpec/        ← Выбор специальности
│   ├── sendHomework/      ← Отправка ДЗ
│   ├── sendNotifications/ ← Уведомления (changelog, feedback)
│   ├── showOnboarding/    ← Онбординг
│   ├── showPreview/       ← Предпросмотр файлов
│   └── sortSubjects/      ← Сортировка предметов
│
├── pages/                 ← Страницы
│   ├── home/              ← Главная
│   ├── grades/            ← Оценки
│   ├── homework/          ← Домашние задания
│   ├── schedule/          ← Расписание
│   ├── library/           ← Библиотека
│   ├── profile/           ← Профиль
│   ├── profileDetail/     ← Детали профиля
│   ├── payment/           ← Платежи
│   ├── notifications/     ← Уведомления
│   └── login/             ← Вход
│
├── widgets/               ← Составные компоненты
│   ├── TopBar/            ← Верхняя панель
│   ├── BottomBar/         ← Нижняя навигация
│   ├── DashboardCharts/   ← Графики дашборда
│   ├── EvaluateLesson/    ← Оценка занятий
│   ├── FutureExams/       ← Предстоящие экзамены
│   ├── Grades/            ← Компонент оценок
│   ├── HomeworkList/      ← Список ДЗ
│   ├── Leaderboard/       ← Лидерборд
│   ├── Library/           ← Библиотека
│   ├── Loading/           ← Загрузочные экраны
│   ├── Payment/           ← Компоненты платежей
│   ├── Profile/           ← Компоненты профиля
│   ├── ReviewList/        ← Отзывы
│   └── Schedule/          ← Расписание
│
├── shared/                ← Общие ресурсы
│   ├── api/               ← Axios инстанц
│   ├── config/            ← Config, env, endpoints
│   ├── hooks/             ← Переиспользуемые хуки
│   ├── lib/               ← Утилиты (кеш, appRelease, тема, и др.)
│   ├── styles/            ← Глобальные стили, тема
│   ├── types/             ← TypeScript типы
│   ├── ui/                ← Переиспользуемые компоненты
│   └── utils/             ← dateUtils, formatUtils, nameUtils
│
└── main.tsx               ← Точка входа
```

---

## Ключевые концепции

### Zustand Store

```typescript
const useMyStore = create<MyState>()(
  persist(
    set => ({
      data: [],
      setData: data => set({ data }),
      reset: () => set({ data: [] }),
    }),
    { name: 'my-store' },
  ),
)

// Использование
const data = useMyStore(s => s.data)
```

### API запросы

```typescript
export const myApi = {
  getData: () => api.get<MyData[]>('/endpoint'),
}
```

### Changelog формат (для релизов)

В поле `release_notes` GitHub Actions используйте `\n` для разделения строк:

```
add: Новая функция\nfix: Исправление бага\nchange: Изменение UI\nimprove: Улучшение UX
```

Доступные лейблы: `add`, `feat`, `fix`, `change`, `update`, `improve`, `remove`, `refactor`.

---

## Checklist перед коммитом

- [ ] Код следует FSD архитектуре
- [ ] Нет console.log в production коде
- [ ] TypeScript типы корректны
- [ ] Store правильно сброшен при logout
- [ ] API запросы обрабатывают ошибки
- [ ] Компоненты responsive и поддерживают обе темы

---

## Обучающие материалы

- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev/guide/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router v7](https://reactrouter.com)
- [Capacitor](https://capacitorjs.com/docs)
- [Feature-Sliced Design](https://feature-sliced.design)

---

**Последнее обновление:** Апрель 2026
**Статус:** В разработке
