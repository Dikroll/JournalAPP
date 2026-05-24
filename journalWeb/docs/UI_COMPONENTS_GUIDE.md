# 🎨 UI Component Guidelines

## Паттерны и лучшие практики

### Структура компонента

```typescript
import { forwardRef, memo } from 'react'
import type { HTMLAttributes } from 'react'

/**
 * Краткое описание компонента
 * @param props - пропсы компонента
 * @returns JSX.Element
 */
interface MyComponentProps extends HTMLAttributes<HTMLDivElement> {
  /** Описание пропса */
  title: string
  /** Опциональный пропс */
  subtitle?: string
  /** Обработчик события */
  onClose?: () => void
}

/**
 * Используйте memo для предотвращения ненужных re-renders
 */
export const MyComponent = memo(
  forwardRef<HTMLDivElement, MyComponentProps>(
    ({ title, subtitle, onClose, className, ...rest }, ref) => {
      return (
        <div ref={ref} className={`component ${className}`} {...rest}>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
          {onClose && (
            <button onClick={onClose}>Close</button>
          )}
        </div>
      )
    }
  )
)

MyComponent.displayName = 'MyComponent'
```

### Именование компонентов

```typescript
// ✅ GOOD - ясное, описательное имя
export const UserProfileCard = () => {}
export const HomeworkSubmitButton = () => {}
export const GradesTable = () => {}

// ❌ BAD - слишком короткое или неясное
export const Card = () => {}
export const Button = () => {}
export const Table = () => {}
```

### Props структура

```typescript
// ✅ GOOD - сгруппированные логические props
interface ButtonProps {
	// Содержимое
	label: string
	icon?: React.ReactNode

	// Поведение
	onClick?: () => void
	disabled?: boolean
	loading?: boolean

	// Стиль
	variant?: 'primary' | 'secondary'
	size?: 'sm' | 'md' | 'lg'

	// Стандартные HTML атрибуты
	className?: string
}

// ❌ BAD - неорганизованные props
interface ButtonProps {
	onClick?: () => void
	variant?: string
	loading?: boolean
	icon?: React.ReactNode
	disabled?: boolean
	className?: string
	label: string
	size?: string
}
```

---

## Компонент Палитра

### Общие компоненты

#### PageHeader

Используется в начале каждой страницы.

```typescript
import { PageHeader } from '@/shared/ui'

<PageHeader
  title="Grades"
  subtitle="Your academic performance"
  action={<RefreshButton onClick={refreshGrades} />}
/>
```

#### RefreshButton

Кнопка обновления данных.

```typescript
import { RefreshButton } from '@/shared/ui'

<RefreshButton
  onClick={handleRefresh}
  disabled={isLoading}
/>
```

#### ErrorView

Отображение ошибок.

```typescript
import { ErrorView } from '@/shared/ui'

<ErrorView
  message="Failed to load grades"
  onRetry={handleRetry}
/>
```

#### CustomTooltip

Подсказки (tooltips).

```typescript
import { CustomTooltip } from '@/shared/ui'

<CustomTooltip content="Double-click to edit">
  <span>Hover me</span>
</CustomTooltip>
```

#### AvatarPlaceholder

Аватар пользователя.

```typescript
import { AvatarPlaceholder } from '@/shared/ui'

<AvatarPlaceholder
  src={photoUrl}
  alt="John Doe"
  fallback="JD"
/>
```

#### Badge

Бейдж для статусов и лейблов.

```typescript
import { Badge } from '@/shared/ui'

<Badge variant='success' size='xs'>Новое</Badge>
```

#### BottomSheet

Модальное окно снизу экрана.

```typescript
import { BottomSheet } from '@/shared/ui'

<BottomSheet onBackdropClick={dismiss} zIndex={300} maxWidth='max-w-lg'>
  {/* content */}
</BottomSheet>
```

#### IconButton

Кнопка-иконка.

```typescript
import { IconButton } from '@/shared/ui'

<IconButton icon={<X size={14} />} onClick={onClose} aria-label='Закрыть' />
```

#### GlowBackground

Фоновое свечение для декоративных эффектов.

#### InlineImage

Inline изображение с обработкой загрузки.

#### PhotoViewerModal

Полноэкранный просмотрщик фотографий.

#### SuccessStateView

Состояние успешного завершения действия.

---

## Tailwind CSS Классы

### Базовые классы

```typescript
// Spacing
className = 'p-4' // padding: 1rem
className = 'm-2' // margin: 0.5rem
className = 'gap-3' // gap: 0.75rem

// Layout
className = 'flex' // display: flex
className = 'grid' // display: grid
className = 'text-center' // text-align: center

// Colors
className = 'bg-white' // background-color
className = 'text-gray-900' // color
className = 'border-gray-200' // border-color

// Dark mode
className = 'white dark:bg-gray-900'
```

### Responsive классы

```typescript
className = 'px-4 md:px-6 lg:px-8' // padding зависит от ширины экрана
className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' // кол-во колонок
className = 'text-sm md:text-base lg:text-lg' // размер шрифта
```

### Утилиты для thema

```typescript
// Используйте CSS переменные для темы
className="text-[var(--color-text)] bg-[var(--color-surface)]"
className="border-[var(--color-border)]"

// Или добавьте свои Tailwind классы
// tailwind.config.js
theme: {
  colors: {
    primary: 'var(--color-primary)',
    surface: 'var(--color-surface)',
  }
}
```

---

## Паттерны модальных окон

### Простой Modal

```typescript
import { useState } from 'react'

export function ModalExample() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Modal Title</h2>
            <p className="text-gray-600 mb-6">Modal content goes here</p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Do something
                  setOpen(false)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

---

## Паттерны форм

### Контролируемая форма

```typescript
import { useState } from 'react'

export function LoginForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Валидация
    const newErrors: Record<string, string> = {}
    if (!username.trim()) newErrors.username = 'Required'
    if (!password.trim()) newErrors.password = 'Required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await onSubmit({ username, password })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            if (errors.username) setErrors({ ...errors, username: '' })
          }}
          className={`w-full px-3 py-2 border rounded ${
            errors.username ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (errors.password) setErrors({ ...errors, password: '' })
          }}
          className={`w-full px-3 py-2 border rounded ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Sign In'}
      </button>
    </form>
  )
}
```

---

## Паттерны для списков

### Список с пагинацией

```typescript
import { useState } from 'react'

interface ListProps<T> {
  items: T[]
  pageSize: number
  renderItem: (item: T) => React.ReactNode
  onLoadMore?: () => void
  isLoading?: boolean
}

export function PaginatedList<T extends { id: number }>({
  items,
  pageSize,
  renderItem,
  onLoadMore,
  isLoading,
}: ListProps<T>) {
  const [page, setPage] = useState(1)
  const displayedItems = items.slice(0, page * pageSize)
  const hasMore = items.length > page * pageSize

  const handleLoadMore = () => {
    setPage(p => p + 1)
    onLoadMore?.()
  }

  return (
    <div className="space-y-2">
      {displayedItems.map(item => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={isLoading}
          className="w-full py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

### Виртуализованный список (для больших данных)

```typescript
// Используйте react-window или react-virtual для больших списков
import { FixedSizeList as List } from 'react-window'

export function VirtualizedList({ items }: { items: any[] }) {
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index].name}
        </div>
      )}
    </List>
  )
}
```

---

## Animations и transitions

### Fade In/Out

```typescript
import { useState } from 'react'

export function FadeInView({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false)

  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transition: 'opacity 300ms ease-in-out',
      }}
      onTransitionEnd={() => {}}
    >
      {children}
    </div>
  )
}

// Или с Tailwind CSS
className="opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
```

### Slide transitions

```typescript
className = 'translate-x-full transition-transform duration-300 ease-in-out'
```

---

## Accessibility (A11y)

### Семантический HTML

```typescript
// ✅ GOOD - семантический HTML
<button aria-label="Close modal">×</button>
<nav aria-label="Main navigation">
<main>
<article>
<aside>

// ❌ BAD - div вместо семантических элементов
<div role="button">Click me</div>
```

### ARIA attributes

```typescript
// Для модальных окон
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-modal="true"
>
  <h2 id="modal-title">Modal Title</h2>
</div>

// Для loading состояния
<div aria-busy="true" aria-label="Loading...">
  <Spinner />
</div>

// Для disabled состояний
<button disabled aria-disabled="true">
  Submit
</button>
```

### Keyboard navigation

```typescript
export function AccessibleButton({ onClick }: { onClick: () => void }) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      Click me
    </button>
  )
}
```

---

## Performance pattern - React.memo

```typescript
interface ListItemProps {
  item: Item
  onSelect: (id: number) => void
}

// Используйте memo для предотвращения ненужных re-renders
export const ListItem = memo(({ item, onSelect }: ListItemProps) => {
  console.log('ListItem render:', item.id)

  return (
    <li onClick={() => onSelect(item.id)}>
      {item.name}
    </li>
  )
})

ListItem.displayName = 'ListItem'

// Обеспечьте стабильность callback'ов
export function List({ items, onSelect }: { items: Item[], onSelect: (id: number) => void }) {
  // ✅ GOOD - useCallback для стабильности
  const handleSelect = useCallback((id: number) => {
    onSelect(id)
  }, [onSelect])

  // ❌ BAD - inline функция меняется при каждом render'е
  // onClick={() => onSelect(item.id)}

  return (
    <ul>
      {items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  )
}
```

---

## Обработка ошибок в компонентах

### Error Boundary

```typescript
import { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorView />
    }

    return this.props.children
  }
}

// Использование
<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <MyComponent />
</ErrorBoundary>
```

---

## Чек-лист для новых компонентов

- [ ] Компонент имеет descriptive имя (PascalCase)
- [ ] Экспортирован из index файла модуля
- [ ] Имеет TypeScript типы для props
- [ ] Использует memo для предотвращения ненужных re-renders
- [ ] Имеет displayName установлен
- [ ] Props организованы логически
- [ ] Использует правильные семантические HTML элементы
- [ ] Имеет ARIA attributes если необходимо
- [ ] Responsive (работает на мобильных)
- [ ] Dark mode compatible
- [ ] Обрабатывает error states
- [ ] Обрабатывает loading states
- [ ] Имеет правильный focused styles для доступности
- [ ] Нет console.log/console.error в production коде

---

**Версия документации:** 1.0  
**Последнее обновление:** Апрель 2026
