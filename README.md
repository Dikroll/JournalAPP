# 📖 JournalAPP - Индекс документации

## 🚀 Быстрый старт

```bash
# 1. Установка зависимостей
cd journalWeb
npm install

# 2. Запуск dev сервера
npm run dev

# 3. Открыть в браузере
# http://localhost:5173

# 4. Логин с demo аккаунтом
# username: demo
# password: demo123
```

---

## 📚 Справочник документов

### Основная документация

| Документ                                                              | Назначение                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [📖 DOCUMENTATION.md](./DOCUMENTATION.md)                             | **Полный обзор проекта** - Обзор, стек, модули, API, hooks         |
| [🏗️ ARCHITECTURE.md](./ARCHITECTURE.md)                               | **Архитектура FSD** - Слои, паттерны, data flow, rules             |
| [🌐 API_REFERENCE.md](./API_REFERENCE.md)                             | **API Endpoints** - Все endpoints, request/response примеры        |
| [🚀 DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)                     | **Для разработчиков** - Как добавлять features, debugging, testing |
| [🎨 UI_COMPONENTS_GUIDE.md](./journalWeb/docs/UI_COMPONENTS_GUIDE.md) | **UI паттерны** - Компоненты, Tailwind, accessibility              |
| [📦 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)                       | **Deployment & CI/CD** - Build, production, мобильные apps         |

---

## 🎯 Руководства для специфичных задач

### Я хочу...

#### Начать разработку

1. Прочитайте [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - раздел "Начало работы"
2. Изучите структуру в [DOCUMENTATION.md](./DOCUMENTATION.md) - раздел "Структура проекта"
3. Поймите архитектуру в [ARCHITECTURE.md](./ARCHITECTURE.md)

#### Добавить новую сущность (Entity)

1. Следуйте примеру в [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - раздел "Добавление новой Entity"
2. Используйте паттерн из [ARCHITECTURE.md](./ARCHITECTURE.md) - раздел "Слой 2: Entities"
3. Проверьте API endpoints в [API_REFERENCE.md](./API_REFERENCE.md)

#### Добавить новую функцию (Feature)

1. Прочитайте примеры в [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - раздел "Добавление новой Feature"
2. Изучите паттерны в [ARCHITECTURE.md](./ARCHITECTURE.md) - раздел "Слой 3: Features"

#### Добавить страницу

1. Используйте пример в [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - раздел "Добавление новой страницы"
2. Дизайн компонентов изучите в [UI_COMPONENTS_GUIDE.md](./journalWeb/docs/UI_COMPONENTS_GUIDE.md)

#### Работать с API

1. Найдите endpoint в [API_REFERENCE.md](./API_REFERENCE.md)
2. Создайте API функцию следуя примерам в [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - раздел "API запросы"

#### Создать UI компонент

1. Изучите паттерны в [UI_COMPONENTS_GUIDE.md](./journalWeb/docs/UI_COMPONENTS_GUIDE.md)
2. Используйте Tailwind классы из раздела "Tailwind CSS Классы"
3. Следуйте accessibility guidelines

#### Задеплоить приложение

1. Подготовьте через [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - раздел "Подготовка к продакшену"
2. Выберите вариант деплоя для вашей платформы
3. Настройте CI/CD pipeline

#### Задеплоить на мобильные (iOS/Android)

1. Используйте [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - раздел "Mobile App Distribution"
2. Настройте Capacitor в [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - раздел "Capacitor Configuration"

#### Отладить проблему

1. Используйте tips в [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - раздел "Debugging"
2. Проверьте troubleshooting в [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - раздел "Troubleshooting"

#### Оптимизировать производительность

1. Используйте tips в [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - раздел "Performance"
2. Используйте patterns в [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - раздел "Performance Optimization"

---

## 📋 Шпаргалка команд

### Разработка

```bash
# Запуск dev сервера
npm run dev

# Lint код
npm run lint

# Build для production
npm run build

# Preview production build
npm run preview
```

### Мобильная разработка (Capacitor)

```bash
# Build и sync с платформами
npm run build
npx cap sync

# Sync с iOS и открыть Xcode
npx cap open ios

# Sync с Android и открыть Android Studio
npx cap open android
```

### Git коммиты

```bash
# Правильный формат commits
git commit -m "feat: add assignment feature"
git commit -m "fix: resolve grades bug"
git commit -m "refactor: improve api client"
git commit -m "docs: update README"
```

---

## 🏗️ Архитектурные слои

### Иерархия слоёв

```
app/          ← Router, Layout, Theme
	↑
pages/        ← Screen компоненты
	↑
features/     ← Business logic
	↑
entities/     ← Domain entities с stores
	↑
shared/       ← Переиспользуемые компоненты, API, utils
```

**Правило:** нижние слои не знают о верхних

### Когда что использовать

| Слой          | Использование                              |
| ------------- | ------------------------------------------ |
| **shared/**   | API, UI компоненты, хуки, утилиты          |
| **entities/** | Domain сущности, stores, API для сущностей |
| **features/** | Бизнес-функции, комбинирование entities    |
| **pages/**    | Экраны приложения                          |
| **app/**      | Глобальная конфигурация маршрутов          |

---

## 🗂️ Структура папок quick reference

```
src/
├── app/
│   ├── App.tsx           ← Root компонент
│   ├── hooks/            ← App-level хуки
│   ├── layouts/          ← Layouts
│   ├── lib/              ← Утилиты (resetAllStores)
│   └── router/           ← Routing конфигурация
│
├── entities/             ← Domain сущности
│   ├── user/             ← User profile
│   ├── grades/           ← Оценки
│   ├── homework/         ← Домашние задания
│   ├── schedule/         ← Расписание
│   └── ... (другие)
│
├── features/             ← Бизнес-функции
│   ├── auth/             ← Аутентификация
│   ├── sendHomework/     ← Отправка ДЗ
│   ├── changeUser/       ← Смена аккаунта
│   └── ... (другие)
│
├── pages/                ← Страницы
│   ├── home/
│   ├── grades/
│   ├── homework/
│   └── ... (другие)
│
├── shared/               ← Общие ресурсы
│   ├── api/              ← Axios инстанц
│   ├── config/           ← Config и env
│   ├── hooks/            ← Переиспользуемые хуки
│   ├── lib/              ← Утилиты
│   ├── styles/           ← Глобальные стили
│   ├── types/            ← TypeScript типы
│   └── ui/               ← Переиспользуемые компоненты
│
└── widgets/              ← Составные компоненты
		├── TopBar/
		├── BottomBar/
		├── HomeworkList/
		└── ... (другие)
```

---

## 🔑 Ключевые концепции

### Zustand Store

Паттерн для управления состоянием:

```typescript
// Определение
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
const setData = useMyStore(s => s.setData)
```

### API запросы

Паттерн для работы с API:

```typescript
// API функция
export const myApi = {
	getData: () => api.get<MyData[]>('/endpoint'),
}

// Hook для загрузки
export function useMyData() {
	const [data, setData] = useState<MyData[]>([])
	const load = useCallback(async () => {
		const res = await myApi.getData()
		setData(res.data)
	}, [])

	return { data, load }
}
```

### Кеширование

Стратегия кеширования данных:

```typescript
const CACHE_TTL = 15 * 60 * 1000 // 15 минут

if (isCacheValid(loadedAt, CACHE_TTL)) {
	return cachedData
}
```

### Protected Routes

Защита маршрутов от неаутентифицированных пользователей:

```typescript
<Route
	path="/protected"
	element={
		<ProtectedRoute>
			<Page />
		</ProtectedRoute>
	}
/>
```

---

## 🎯 Типичный workflow

### Добавление нового домена

```
1. Создайте entity (User, Grades, Homework)
	 └── api/ (API запросы)
	 └── model/ (Zustand store, типы)
	 └── hooks/ (Хуки для загрузки)
	 └── index.ts (Public API)

2. Создайте features (Auth, SendHomework, ChangeUser)
	 └── hooks/ (Business logic)
	 └── ui/ (Компоненты функции)
	 └── index.ts (Public API)

3. Создайте страницу (LoginPage, HomePage)
	 └── ui/ (Page компонент)
	 └── index.ts

4. Добавьте маршрут в router/index.tsx

5. Добавьте в pageConfig
```

---

## 🔐 Security Best Practices

- ✅ Используйте HTTPS в production
- ✅ Не коммитьте secrets в git
- ✅ Используйте environment variables для sensitive data
- ✅ Валидируйте input от пользователя
- ✅ Санитизируйте вывод
- ✅ Используйте CSP headers
- ✅ Включите CORS

---

## 📞 Контакты и помощь

### Остались вопросы?

1. **Поиск в документации** - используйте Ctrl+F
2. **Примеры в коде** - ищите похожий функционал в entities/features
3. **Типы TypeScript** - hover в IDE покажет помощь
4. **Логирование** - добавьте console.log для отладки

### Структура логирования

```typescript
// Используйте префиксы для лучшей отладки
console.log('[useGrades] Loading grades...')
console.warn('[useGrades] Cache stale, reloading')
console.error('[useGrades] Failed:', error)
```

---

## 📊 Document Map

```
DOCUMENTATION.md
├── Overview & Stack
├── Project Structure
├── Architecture (high-level)
├── Setup & Running
├── Modules guide
├── State management
└── API integration

ARCHITECTURE.md
├── FSD Pattern (detailed)
├── Layer descriptions
├── Dependencies rules
├── Data flow
└── Examples

API_REFERENCE.md
├── All endpoints
├── Request/Response format
├── Error handling
├── Auth & tokens
└── Rate limiting

DEVELOPMENT_GUIDE.md
├── Getting started
├── Adding Entity
├── Adding Feature
├── Adding Page
├── Styling
├── Debugging
├── Testing (planned)
└── Troubleshooting

UI_COMPONENTS_GUIDE.md
├── Component patterns
├── Tailwind guidelines
├── Form patterns
├── Modals & Lists
├── Accessibility
└── Performance

DEPLOYMENT_GUIDE.md
├── Production setup
├── Web deployment
├── Mobile build
├── Docker & Nginx
├── CI/CD
└── Monitoring
```

---

## 📈 Версия документации

| Версия | Дата      | Изменения                  |
| ------ | --------- | -------------------------- |
| 1.0    | Март 2026 | Первая версия документации |

---

## ✅ Checklist перед коммитом

- [ ] Код следует FSD архитектуре
- [ ] Нет console.log в production коде
- [ ] TypeScript типы корректны
- [ ] Store правильно сброшен при logout
- [ ] API запросы обрабатывают ошибки
- [ ] Компоненты responsive & dark-mode friendly
- [ ] Доступность (A11y) проверена
- [ ] Нет хардкода, используются env variables
- [ ] Документация обновлена если нужно

---

## 🎓 Обучающие материалы

### Для изучения технологий

- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router v7](https://reactrouter.com)
- [Capacitor Guide](https://capacitorjs.com/docs)

### Статьи и примеры

- FSD (Feature-Sliced Design) - https://feature-sliced.design
- Zustand Store Patterns - https://github.com/pmndrs/zustand/discussions
- React Performance - https://react.dev/learn/render-and-commit

---

**Последнее обновление:** Март 2026  
**Статус:** ✅ В разработке  
**Версия проекта:** 0.0.0
