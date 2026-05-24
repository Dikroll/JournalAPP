# «Цели семестра» — design spec

**Дата:** 2026-04-20
**Статус:** Design approved, ready for implementation plan
**Owner:** Claude + Dikroll

## 1. Цель фичи

Дать студенту отдельный раздел приложения, который отвечает на четыре вопроса:

1. «Что мне сделать сейчас, чтобы закрыть сессию?» (момент «сегодня»)
2. «Я готов к экзамену/зачёту?» (момент «перед парой»)
3. «Как прошла неделя, что исправлять?» (момент «ретро»)
4. «Сколько мне нужно добрать, чтобы дойти до цели?» (момент «перед сессией»)

Эта спецификация закрывает момент **(4)** — «семестр/цель». Остальные три — отдельные будущие спеки в той же «шапке».

## 2. Scope

### In scope

- Новый раздел `/goals` (главный экран и детальный экран предмета)
- Хранение целей per-subject локально (persist, привязка к `activeUsername`)
- Расчёт текущего среднего, прогноза (= текущий для MVP), светофора риска
- Трендовый индикатор (последние 4 оценки vs предыдущие)
- What-if симулятор (+/− кнопки на тип оценки)
- Расширенная статистика по предмету: посещаемость, распределение оценок, средние по типам оценок, разбивка по неделям
- Автоматический fallback на режим «риск хвоста» если цели не проставлены
- Точки входа: виджет на HomePage, кнопка в GradesPage
- Миграция `resetAllAppState` для очистки целей при смене аккаунта

### Out of scope (будущее)

- Синхронизация целей с бэкендом (API не поддерживает — решено осознанно)
- Регрессия по времени для прогноза, confidence-band (V2)
- Настраиваемые веса по типам оценок (V2)
- История изменений цели (V2)
- Overall GPA goal как отдельная сущность (MVP — автоматический агрегат)
- Интеграция с notifications (напоминалки «Математика в риске»)
- Интеграция с homework (риск по несданным ДЗ)

### Явно не делаем

- 6-я иконка в `BottomBar` (уже занято 5 слотов — перегрузит)
- Подвкладку внутри `/grades` (раздел заслуживает свой route)
- Импорт между entities: `entities/goals` НЕ импортирует `grades`/`exam`/`subject`
- Логику в UI-компонентах: все расчёты в hooks/utils

## 3. Архитектура

FSD-слои:

```
src/entities/goals/                  ← ЧИСТО, без зависимостей от других entities
  model/store.ts                     ← persist Zustand store
  model/types.ts                     ← Goal, GoalsState
  hooks/useGoal.ts                   ← get/set цели по specId
  index.ts

src/features/goalForecast/           ← КОМПОЗИЦИЯ grades + goals + exam
  lib/forecast.ts                    ← pure math: forecast, risk, trend
  lib/subjectStats.ts                ← pure math: attendance, distribution, by type, by period
  lib/whatIf.ts                      ← pure math: пересчёт с гипотетическими оценками
  hooks/useGoalsOverview.ts          ← данные главного экрана
  hooks/useGoalDetail.ts             ← данные детального экрана
  hooks/useOverallSummary.ts         ← агрегат по сессии
  index.ts

src/widgets/Goals/                   ← ЧИСТЫЙ UI
  OverallGoalSummary/ui/             ← hero-блок на главной
  GoalsList/ui/                      ← список карточек
  GoalCard/ui/                       ← одна карточка предмета
  GoalHero/ui/                       ← hero на детальном
  WhatIfSimulator/ui/                ← +/− инпуты + live-прогноз
  SubjectStats/ui/                   ← 4 карточки статистики
  SubjectStatsAttendance/ui/
  SubjectStatsDistribution/ui/
  SubjectStatsByType/ui/
  SubjectStatsByPeriod/ui/
  RecentMarks/ui/                    ← последние 5-10 оценок
  SetGoalSheet/ui/                   ← BottomSheet для выбора цели
  EmptyGoalsState/ui/                ← fallback CTA

src/pages/goals/
  ui/GoalsPage.tsx                   ← /goals
  ui/GoalDetailPage.tsx              ← /goals/:specId

src/shared/config/pageConfig.ts      ← добавить goals = '/goals'
src/shared/config/semesterConfig.ts  ← новый: длина семестра в неделях + helper «текущая неделя»
src/app/router/index.tsx             ← регистрация route
src/pages/index.ts                   ← экспорт GoalsPage, GoalDetailPage
src/widgets/HomePage/                ← мини-виджет GoalsSummaryCard (если нет — добавить)
src/shared/lib/resetAllAppState.ts   ← добавить очистку useGoalsStore
```

**Правило изоляции:** entity goals не знает ничего об оценках и экзаменах. Вся композиция происходит в `features/goalForecast/hooks/`, которые импортируют `useGrades`, `useGoal`, `useExams` и отдают уже вычисленные данные в widgets.

**Правило тонких компонентов:** компоненты в `widgets/*/ui/` принимают пропсы или читают один хук из `features/goalForecast`, без map+filter+reduce внутри JSX.

## 4. Модель данных

### 4.1 entities/goals/model/types.ts

```ts
export interface Goal {
  target: number        // 2..5, целое (5-балльная шкала)
  createdAt: number     // epoch ms
  updatedAt: number     // epoch ms
}

export interface GoalsState {
  targets: Record<number, Goal>    // key = spec_id
  setTarget: (specId: number, target: number) => void
  removeTarget: (specId: number) => void
  reset: () => void
}
```

### 4.2 entities/goals/model/store.ts

Zustand + persist:
- `name: 'goals-store'`
- `version: 1`, пустой `migrate` (задел на будущее)
- `partialize: state => ({ targets: state.targets })`
- При записи `setTarget` — clamp в 2..5, округление до int
- При чтении в хуках — повторный clamp (на случай ручной правки в storage)

### 4.3 entities/goals/hooks/useGoal.ts

```ts
export function useGoal(specId: number) {
  const target = useGoalsStore(s => s.targets[specId]?.target ?? null)
  const setTarget = useGoalsStore(s => s.setTarget)
  const remove = useGoalsStore(s => s.removeTarget)
  return { target, set: (v: number) => setTarget(specId, v), remove: () => remove(specId) }
}

export function useHasAnyGoals(): boolean {
  return useGoalsStore(s => Object.keys(s.targets).length > 0)
}
```

### 4.4 features/goalForecast — производные типы

```ts
export type Risk = 'no_goal' | 'safe' | 'watch' | 'danger'
export type Trend = 'up' | 'flat' | 'down'

export interface ForecastResult {
  currentAvg: number | null      // null если нет оценок
  forecast: number | null        // для MVP = currentAvg
  trend: Trend                   // из сравнения последних 4 оценок с предыдущими
  risk: Risk
  gapToGoal: number | null       // target - forecast, если цель задана
}

export interface SubjectStatsResult {
  total: { lessons: number; withMarks: number; withoutMarks: number }
  attendance: {
    present: number
    late: number
    absent: number
    ratePercent: number          // (present + late) / lessons * 100
  }
  distribution: Record<2 | 3 | 4 | 5, number>
  byType: Array<{ type: GradeType; count: number; avg: number }>
  byPeriod: Array<{ label: string; avg: number; count: number }>
}

export interface WhatIfInput {
  futureMarks: Array<{ type: GradeType; value: number; repeat: number }>
}

export interface GoalCardData {
  specId: number
  specName: string
  currentAvg: number | null
  forecast: number | null
  target: number | null
  trend: Trend
  risk: Risk
}

export interface OverallSummary {
  forecast: number | null        // среднее forecast-ов предметов с оценками
  target: number | null          // среднее целей (только там где заданы)
  risk: Risk
  atRiskCount: number
}
```

`GradeType` переезжает из `src/entities/grades/model/types.ts` в `src/shared/types/index.ts` — чтобы `features/goalForecast` не импортировал из `entities/grades`. Это тактический рефакторинг, ~5 минут.

## 5. Математика

Все функции — чистые, в `features/goalForecast/lib/`. Тесты Vitest.

### 5.1 currentAvg(entries: GradeEntry[])

Плоское среднее всех ненулевых оценок всех типов по предмету. Копируем формулу из существующего `groupBySubject` в `useGradesGroups.ts` для консистентности с остальным приложением.

```ts
function currentAvg(entries: GradeEntry[]): number | null {
  const marks = entries
    .filter(e => e.marks)
    .flatMap(e => Object.values(e.marks!).filter((v): v is number => v != null && v !== 0))
  if (!marks.length) return null
  return marks.reduce((s, v) => s + v, 0) / marks.length
}
```

### 5.2 trend(entries: GradeEntry[])

Сравнение последних 4 оценок с предыдущими 4:
- < 4 оценок — `'flat'`
- `avg(last 4) - avg(prev 4) > 0.3` → `'up'`
- `< -0.3` → `'down'`
- иначе `'flat'`

### 5.3 forecast(currentAvg)

MVP: `forecast = currentAvg`. Логика с регрессией — V2.

### 5.4 risk(target, forecast)

```
if target == null → 'no_goal'
if forecast == null → 'no_goal'     // нет данных
if forecast >= target → 'safe'
if forecast >= target - 0.3 → 'watch'
else → 'danger'
```

### 5.5 whatIf(currentMarks, futureMarks)

```ts
const flatFuture = futureMarks.flatMap(m => Array(m.repeat).fill(m.value))
const combined = [...currentMarks, ...flatFuture]
return combined.length ? combined.reduce((s, v) => s + v, 0) / combined.length : null
```

### 5.6 Статистика

- `attendance`: счёт `present`/`late`/`absent` + `(present + late) / lessons * 100`
- `distribution`: group by `Math.round(value)` по всем оценкам → Record<2|3|4|5, number>
- `byType`: Record<GradeType, { count, avg }>
- `byPeriod`:
  - `'week'` (по умолчанию) — группируем по ISO-неделе по дате, label = «нед N»
  - `'month'` — YYYY-MM, label = русское сокращение месяца

### 5.7 Overall summary

```
forecast = avg of per-subject forecasts (только предметы с оценками)
target = avg of per-subject targets (только предметы с целями)
risk = worst risk среди предметов с целями
atRiskCount = count предметов в 'watch' или 'danger'
```

## 6. UI/UX

### 6.1 Точки входа

1. **Виджет на HomePage** (`GoalsSummaryCard`) — добавляется на HomePage рядом с существующими stat-карточками («Посещаемость»/«Средний балл»), точное место уточняется при имплементации. Показывает прогноз сессии + цель + кол-во в риске. Tap → `/goals`. Не показываем виджет если целей нет И нет «риска хвоста» (чтобы не замусоривать главный экран).
2. **Кнопка в шапке GradesPage** — иконка target/trending-up рядом с `RefreshGradesButton`. Tap → `/goals`.
3. **Direct URL** `/goals` (deep-link-совместимо через HashRouter, уже используется).

BottomBar не трогаем (5 слотов уже есть, 6-я иконка перегрузит).

### 6.2 `/goals` — главный экран

**Layout (phone-width, single column):**
- `PageHeader` «Цели» + action (refresh)
- `OverallGoalSummary` — hero-карточка (градиент `#F20519 → #F29F05` как в других highlight-блоках). Показывает: «Сессия целиком» | прогноз + цель | бар прогресса
- Сортированный `GoalsList`:
  - Сначала `danger`, потом `watch`, `safe`, `no_goal`
  - Внутри группы — `spec_name` по алфавиту
- `EmptyGoalsState` если `targets = {}`:
  - dashed-карточка «Поставь цель» + CTA
  - ниже — автоматический «Риск хвоста» список (предметы с `currentAvg ≤ 3.2` или trend='down')

**`GoalCard` анатомия** (матч с существующим стилем):
- Surface-card с border согласно светофору
- Строка 1: `spec_name` (левак) + pill-светофор (правак)
- Строка 2: тройка лейблов «сейчас / прогноз / цель»
- Строка 3: тройка больших цифр с цветами grade-палитры (`4d9ef7`, `22c98a`, `f0a020`, `e03535`)
- Tap → `/goals/:specId`

### 6.3 `/goals/:specId` — детальный экран

**Layout (сверху вниз, scrollable):**

1. **Header bar** — круглая back-кнопка (36px) + spec_name. Safe-area-inset-top учтён.
2. **`GoalHero`** — градиентная карточка:
   - Лейблы «прогноз» / «цель»
   - Тройка больших цифр — forecast + target + «текущий N»
   - Pill-светофор
   - Solid brand-red CTA «Изменить цель» (открывает `SetGoalSheet`)
3. **What-if section:**
   - Label «What-if — если я получу…»
   - Строки (одна `WhatIfRow` per `GradeType`, которые присутствуют в данных предмета):
     - Левая часть: label типа (ДЗ/КР/Лаб/…) + hint «осталось ~N пар»
     - Правая часть: stepper `[−] N×M [+]` где N = количество гипотетических оценок этого типа (0..10), M = значение оценки (свитчер 3/4/5 при долгом тапе на число, дефолт 5)
     - Stepper-кнопки 30×30px, вся строка — touch-target ≥ 44px
   - Итог-карточка «итого выйдет X.XX» (brand-tinted)
4. **Stats section** — label «Статистика»:
   - Grid 2×1 мини-карточек (посещаемость %, оценок/пар)
   - `SubjectStatsDistribution` — bars по 2/3/4/5 (цвета grade-палитры)
   - `SubjectStatsByType` — таблица «ДЗ avg, Лабы avg, КР avg, …»
   - `SubjectStatsByPeriod` — bar-chart по неделям (высота = avg, цвет по среднему)
5. **`RecentMarks`** — label «последние», 5-10 строк «дата · тип · оценка».

**Pull-to-refresh:** если нет существующего PtR-компонента в `shared/ui`, MVP обходится без него (используем refresh-кнопку в header, как в `GradesPage`). Если есть — подключаем.

### 6.4 `SetGoalSheet` — BottomSheet

Использует существующий `src/shared/ui/BottomSheet/BottomSheet.tsx`.

- Drag-handle сверху
- Заголовок «Цель по {spec_name}»
- Подзаголовок «Какую итоговую хочешь?»
- Три крупные touch-кнопки 3 / 4 / 5 в ряд (≥ 44×44px каждая), активная — solid brand-red
- CTA «Сохранить» — внизу, полная ширина, с `safe-area-inset-bottom`
- При открытии — выбрана текущая цель если есть
- Опция «Убрать цель» — текстовой link, если цель уже задана

### 6.5 Стилистика

Все цвета — строго из `theme.css` design tokens:
- Brand: `#d50416` для primary CTA и hero-градиентов
- Grade palette: `#22c98a` (5), `#4d9ef7` (4), `#f0a020` (3), `#e03535` (2)
- Semantic: `--color-danger` (`#e03535`), `--color-pending` (`#f0a020`), `--color-checked` (`#22c98a`)
- Surface: `var(--color-surface)`, `var(--color-surface-strong)`
- Radii: карточки 22px, pills 999px, кнопки 14px
- Shadows: `var(--shadow-card)` для карточек, `var(--shadow-modal)` для sheet
- Backdrop blur: только предустановленные `blur-sm`/`blur-xl`

## 7. Error handling / offline

- **Нет сети:** показываем всё из persist (goals, grades кэш). Нет специальной пометки «оффлайн» внутри `/goals` — используем глобальный индикатор сети, уже есть в проекте.
- **Нет оценок по предмету:** empty state в карточке — «расчёты появятся после первых оценок», `risk = 'no_goal'`.
- **Цель задана, оценок 0:** показываем цель + текст «нет данных для прогноза».
- **Invalid goal в storage** (ручная правка): clamp в `[2, 5]` при чтении через `useGoal`.
- **Смена аккаунта:** `resetAllAppState` очищает `useGoalsStore` (добавить вызов `clearStorage` + `setState({ targets: {} })`).
- **Несуществующий `specId` в URL:** `/goals/999` → если нет предмета в `useSubjects()`, редирект на `/goals` с сохранением истории.
- **Race condition:** `useGoalsOverview` и `useGoalDetail` используют селекторы Zustand — React подпишется на точечные изменения.

## 8. Тесты

### 8.1 Unit (Vitest) — обязательно

- `features/goalForecast/lib/forecast.test.ts` — покрытие: 0/1/N оценок, все варианты `trend`, все `risk`-пороги
- `features/goalForecast/lib/subjectStats.test.ts` — покрытие: пустые, только пропуски, смесь типов, группировка по неделям/месяцам
- `features/goalForecast/lib/whatIf.test.ts` — покрытие: 0 гипотетических, несколько типов, пересчёт
- `entities/goals/model/store.test.ts` — set/remove/reset, clamp, persist migrate

### 8.2 UI — руками

Mobile-UI, смоук-тесты:
- Пустое состояние без целей
- Главный экран со всеми статусами светофора
- Детальный экран + what-if-симулятор
- SetGoalSheet — выбор, сохранение, удаление
- Смена аккаунта — цели сброшены

### 8.3 Без снапшотов

UI-снапшоты не пишем — ломаются от дизайн-правок.

## 9. Риски и открытые вопросы

| Риск | Митигация |
|------|-----------|
| Прогноз = текущий средний может показаться студенту бесполезным | В MVP честно показываем trend-индикатор рядом. V2 — регрессия. |
| Нет бэкенда → цели только локально | Документируем ограничение в UI («цели сохранены только на этом устройстве»). V2 — бэкенд. |
| Смена семестра не очищает автоматически цели | Предусмотреть кнопку «Сбросить все цели» в `/goals` (V2 или позже). MVP — вручную через `SetGoalSheet.remove`. |
| Many subjects на главной → длинный список | MVP — простой скролл. При >15 предметов — рассмотреть collapse по статусам (V2). |
| Нет «количества оставшихся пар» из бэкенда | What-if hint «осталось ~N пар» вычисляется как `(avg_marks_per_week этого предмета) × (недели_до_конца_семестра)`, где недели_до_конца = `max(0, 18 - текущая_неделя_семестра)`. Константа 18 живёт в `shared/config/semesterConfig.ts` (создаётся в этом спеке). Если `avg_marks_per_week = 0` (предмет без оценок) — не показываем hint. |

## 10. Зависимости

Существующие в проекте, используются как есть:
- `useGrades`, `useGradesBySubject` (`entities/grades`)
- `useExamResults`, `useFutureExams` (`entities/exam`)
- `useSubjects` (`entities/subject`)
- `useSchedule` (для оценки оставшихся пар)
- `BottomSheet`, `PageHeader`, `SkeletonList`, `ErrorView` (`shared/ui`)
- `RefreshGradesButton` (`features/refreshGrades`)
- Theme tokens в `theme.css`
- Zustand + persist

Ничего нового не подключаем.

## 11. Не в этом спеке

- Имплементационный план (файлы, порядок коммитов, что тестировать когда) — отдельный документ, создаётся через `writing-plans` skill после approval этого спека.
- Реальный код — только после плана.
