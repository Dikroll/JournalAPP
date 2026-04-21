# Semester/Goal Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a new `/goals` section of journalWeb that lets students set per-subject semester grade goals, see a forecast + risk for each subject, simulate "what-if" future marks, and view rich per-subject stats (attendance, distribution, by-type averages, by-period trend).

**Architecture:** Three-layer FSD addition. `entities/goals` owns the persist store only (no cross-entity imports). `features/goalForecast` composes `entities/grades` + `entities/goals` + `entities/exam` into pure math utilities and composition hooks. `widgets/Goals` are thin render-only components. Pages stitch it together at `/goals` and `/goals/:specId`. Entry points: HomePage summary card and a header action on the existing GradesPage.

**Tech Stack:** React 19, TypeScript, Zustand + persist, React Router 7, Vitest (jsdom), existing shared-ui primitives (BottomSheet, PageHeader, SkeletonList, ErrorView), Capacitor-packaged mobile app.

**Reference spec:** `docs/superpowers/specs/2026-04-20-semester-goal-design.md`

---

## Overall file map

Created:
- `src/shared/types/index.ts` (or augment existing) — re-export moved `GradeType`
- `src/shared/config/semesterConfig.ts` — semester length constant + helper
- `src/entities/goals/model/types.ts`
- `src/entities/goals/model/store.ts`
- `src/entities/goals/model/__tests__/store.test.ts`
- `src/entities/goals/hooks/useGoal.ts`
- `src/entities/goals/index.ts`
- `src/features/goalForecast/lib/forecast.ts`
- `src/features/goalForecast/lib/__tests__/forecast.test.ts`
- `src/features/goalForecast/lib/whatIf.ts`
- `src/features/goalForecast/lib/__tests__/whatIf.test.ts`
- `src/features/goalForecast/lib/subjectStats.ts`
- `src/features/goalForecast/lib/__tests__/subjectStats.test.ts`
- `src/features/goalForecast/hooks/useOverallSummary.ts`
- `src/features/goalForecast/hooks/useGoalsOverview.ts`
- `src/features/goalForecast/hooks/useGoalDetail.ts`
- `src/features/goalForecast/index.ts`
- `src/widgets/Goals/GoalCard/ui/GoalCard.tsx`
- `src/widgets/Goals/GoalsList/ui/GoalsList.tsx`
- `src/widgets/Goals/OverallGoalSummary/ui/OverallGoalSummary.tsx`
- `src/widgets/Goals/EmptyGoalsState/ui/EmptyGoalsState.tsx`
- `src/widgets/Goals/GoalHero/ui/GoalHero.tsx`
- `src/widgets/Goals/WhatIfSimulator/ui/WhatIfSimulator.tsx`
- `src/widgets/Goals/WhatIfSimulator/ui/WhatIfRow.tsx`
- `src/widgets/Goals/SubjectStats/ui/SubjectStats.tsx`
- `src/widgets/Goals/SubjectStats/ui/AttendanceStat.tsx`
- `src/widgets/Goals/SubjectStats/ui/CountStat.tsx`
- `src/widgets/Goals/SubjectStats/ui/DistributionStat.tsx`
- `src/widgets/Goals/SubjectStats/ui/ByTypeStat.tsx`
- `src/widgets/Goals/SubjectStats/ui/ByPeriodStat.tsx`
- `src/widgets/Goals/RecentMarks/ui/RecentMarks.tsx`
- `src/widgets/Goals/SetGoalSheet/ui/SetGoalSheet.tsx`
- `src/widgets/Goals/GoalsSummaryCard/ui/GoalsSummaryCard.tsx`
- `src/pages/goals/ui/GoalsPage.tsx`
- `src/pages/goals/ui/GoalDetailPage.tsx`

Modified:
- `src/entities/grades/model/types.ts` — remove local `GradeType`, re-export from shared
- `src/shared/config/pageConfig.ts` — add `goals`
- `src/shared/config/index.ts` — re-export `semesterConfig`
- `src/app/router/index.tsx` — register `/goals` and `/goals/:specId`
- `src/pages/index.ts` — export new pages
- `src/widgets/index.ts` — export new widgets
- `src/shared/lib/resetAllAppState.ts` — reset goals store
- `src/pages/home/ui/HomePage.tsx` — mount `GoalsSummaryCard`
- `src/pages/grades/ui/GradesPage.tsx` — add header action linking to `/goals`

---

## Task 1: Move `GradeType` to shared/types

**Why:** `features/goalForecast` needs `GradeType` but cannot import from `entities/grades` (FSD rule). Move the type to `shared/types` so both sides can use it.

**Files:**
- Create: `src/shared/types/gradeType.ts`
- Modify: `src/shared/types/index.ts`
- Modify: `src/entities/grades/model/types.ts`

- [ ] **Step 1:** Check current `src/shared/types/index.ts` with `Read`. If it doesn't exist, create it. If it does, we'll add an export.

- [ ] **Step 2:** Create `src/shared/types/gradeType.ts`:

```ts
export interface GradeMarks {
	control: number | null
	homework: number | null
	lab: number | null
	classwork: number | null
	practical: number | null
	final: number | null
}

export type GradeType = keyof GradeMarks
```

- [ ] **Step 3:** Edit `src/shared/types/index.ts` — add `export * from './gradeType'` (preserve existing exports).

- [ ] **Step 4:** Edit `src/entities/grades/model/types.ts` — remove the local `GradeMarks` interface and `GradeType` alias; replace with `import type { GradeMarks, GradeType } from '@/shared/types'` at the top, and re-export them: `export type { GradeMarks, GradeType }`.

- [ ] **Step 5:** Run typecheck:

```bash
npx tsc --noEmit
```

Expected: PASS (no errors — every downstream file still works through re-exports).

- [ ] **Step 6:** Commit.

```bash
git add src/shared/types/gradeType.ts src/shared/types/index.ts src/entities/grades/model/types.ts
git commit -m "refactor: move GradeType/GradeMarks to shared/types for cross-entity use"
```

---

## Task 2: Create `semesterConfig`

**Why:** The what-if hint "осталось ~N пар" depends on semester length. Keep the magic number in config.

**Files:**
- Create: `src/shared/config/semesterConfig.ts`
- Create: `src/shared/config/__tests__/semesterConfig.test.ts`
- Modify: `src/shared/config/index.ts`

- [ ] **Step 1:** Write failing test `src/shared/config/__tests__/semesterConfig.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { SEMESTER_LENGTH_WEEKS, weeksRemainingInSemester } from '../semesterConfig'

describe('semesterConfig', () => {
	it('semester length is 18 weeks', () => {
		expect(SEMESTER_LENGTH_WEEKS).toBe(18)
	})

	it('weeksRemainingInSemester clamps to non-negative', () => {
		expect(weeksRemainingInSemester(20)).toBe(0)
		expect(weeksRemainingInSemester(18)).toBe(0)
		expect(weeksRemainingInSemester(5)).toBe(13)
		expect(weeksRemainingInSemester(0)).toBe(18)
	})

	it('weeksRemainingInSemester handles negative current week', () => {
		expect(weeksRemainingInSemester(-1)).toBe(18)
	})
})
```

- [ ] **Step 2:** Run the test to verify it fails:

```bash
npx vitest run src/shared/config/__tests__/semesterConfig.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3:** Create `src/shared/config/semesterConfig.ts`:

```ts
export const SEMESTER_LENGTH_WEEKS = 18

export function weeksRemainingInSemester(currentWeek: number): number {
	if (currentWeek < 0) return SEMESTER_LENGTH_WEEKS
	return Math.max(0, SEMESTER_LENGTH_WEEKS - currentWeek)
}
```

- [ ] **Step 4:** Edit `src/shared/config/index.ts` — add `export * from './semesterConfig'` (preserve existing).

- [ ] **Step 5:** Run the test again:

```bash
npx vitest run src/shared/config/__tests__/semesterConfig.test.ts
```

Expected: PASS.

- [ ] **Step 6:** Commit.

```bash
git add src/shared/config/semesterConfig.ts src/shared/config/__tests__/semesterConfig.test.ts src/shared/config/index.ts
git commit -m "feat: add semesterConfig with weeksRemaining helper"
```

---

## Task 3: Add `/goals` route with a placeholder page

**Why:** Gives us a deploy target. We build real content into the placeholder in later tasks.

**Files:**
- Modify: `src/shared/config/pageConfig.ts`
- Create: `src/pages/goals/ui/GoalsPage.tsx`
- Create: `src/pages/goals/ui/GoalDetailPage.tsx`
- Modify: `src/pages/index.ts`
- Modify: `src/app/router/index.tsx`

- [ ] **Step 1:** Edit `src/shared/config/pageConfig.ts` — add `readonly goals = '/goals'` after `grades`:

```ts
readonly grades = '/grades'
readonly goals = '/goals'
readonly payment = '/payment'
```

- [ ] **Step 2:** Create `src/pages/goals/ui/GoalsPage.tsx`:

```tsx
import { PageHeader } from '@/shared/ui'

export function GoalsPage() {
	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4 space-y-4'>
				<PageHeader title='Цели' />
				<div className='text-app-muted text-sm'>Скоро тут появятся цели.</div>
			</div>
		</div>
	)
}
```

- [ ] **Step 3:** Create `src/pages/goals/ui/GoalDetailPage.tsx`:

```tsx
import { PageHeader } from '@/shared/ui'
import { useParams } from 'react-router-dom'

export function GoalDetailPage() {
	const { specId } = useParams<{ specId: string }>()
	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4 space-y-4'>
				<PageHeader title={`Предмет #${specId ?? '?'}`} />
				<div className='text-app-muted text-sm'>Скоро тут появится детальный экран.</div>
			</div>
		</div>
	)
}
```

- [ ] **Step 4:** Edit `src/pages/index.ts` — append exports:

```ts
export { GoalsPage } from './goals/ui/GoalsPage'
export { GoalDetailPage } from './goals/ui/GoalDetailPage'
```

- [ ] **Step 5:** Edit `src/app/router/index.tsx`:

In the import block that brings pages from `@/pages`, add `GoalsPage, GoalDetailPage`:

```tsx
import {
	GoalDetailPage,
	GoalsPage,
	GradesPage,
	HomePage,
	HomeworkPage,
	LibraryPage,
	LoginPage,
	NotificationsPage,
	PaymentPage,
	ProfileDetailsPage,
	ProfilePage,
	SchedulePage,
} from '@/pages'
```

Inside the protected-routes block, after `<Route path='grades' element={<GradesPage />} />`, add:

```tsx
<Route path='goals' element={<GoalsPage />} />
<Route path='goals/:specId' element={<GoalDetailPage />} />
```

- [ ] **Step 6:** Run typecheck + start dev server:

```bash
npx tsc --noEmit
npm run dev
```

Manually open `#/goals` and `#/goals/42` in the running app. Both should render the placeholder.

- [ ] **Step 7:** Commit.

```bash
git add src/shared/config/pageConfig.ts src/pages/goals src/pages/index.ts src/app/router/index.tsx
git commit -m "feat: add /goals and /goals/:specId placeholder routes"
```

---

## Task 4: `entities/goals` — store and types

**Why:** Single source of truth for the user's goal targets. Persisted locally, cleared on account reset.

**Files:**
- Create: `src/entities/goals/model/types.ts`
- Create: `src/entities/goals/model/store.ts`
- Create: `src/entities/goals/model/__tests__/store.test.ts`
- Create: `src/entities/goals/hooks/useGoal.ts`
- Create: `src/entities/goals/index.ts`

- [ ] **Step 1:** Write failing test `src/entities/goals/model/__tests__/store.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useGoalsStore } from '../store'

describe('useGoalsStore', () => {
	beforeEach(() => {
		useGoalsStore.getState().reset()
	})

	it('starts with empty targets', () => {
		expect(useGoalsStore.getState().targets).toEqual({})
	})

	it('sets a target, clamped to [2, 5] and rounded', () => {
		useGoalsStore.getState().setTarget(10, 7)
		expect(useGoalsStore.getState().targets[10].target).toBe(5)
		useGoalsStore.getState().setTarget(11, 1)
		expect(useGoalsStore.getState().targets[11].target).toBe(2)
		useGoalsStore.getState().setTarget(12, 4.7)
		expect(useGoalsStore.getState().targets[12].target).toBe(5)
	})

	it('setTarget fills createdAt/updatedAt', () => {
		const before = Date.now()
		useGoalsStore.getState().setTarget(1, 4)
		const g = useGoalsStore.getState().targets[1]
		expect(g.createdAt).toBeGreaterThanOrEqual(before)
		expect(g.updatedAt).toBe(g.createdAt)
	})

	it('setTarget on existing keeps createdAt, bumps updatedAt', async () => {
		useGoalsStore.getState().setTarget(1, 4)
		const { createdAt } = useGoalsStore.getState().targets[1]
		await new Promise(r => setTimeout(r, 5))
		useGoalsStore.getState().setTarget(1, 5)
		const after = useGoalsStore.getState().targets[1]
		expect(after.createdAt).toBe(createdAt)
		expect(after.updatedAt).toBeGreaterThan(createdAt)
		expect(after.target).toBe(5)
	})

	it('removeTarget drops the entry', () => {
		useGoalsStore.getState().setTarget(1, 4)
		useGoalsStore.getState().removeTarget(1)
		expect(useGoalsStore.getState().targets[1]).toBeUndefined()
	})

	it('reset clears everything', () => {
		useGoalsStore.getState().setTarget(1, 4)
		useGoalsStore.getState().setTarget(2, 5)
		useGoalsStore.getState().reset()
		expect(useGoalsStore.getState().targets).toEqual({})
	})
})
```

- [ ] **Step 2:** Run test — expect FAIL (module not found):

```bash
npx vitest run src/entities/goals/model/__tests__/store.test.ts
```

- [ ] **Step 3:** Create `src/entities/goals/model/types.ts`:

```ts
export interface Goal {
	target: number
	createdAt: number
	updatedAt: number
}

export interface GoalsState {
	targets: Record<number, Goal>
	setTarget: (specId: number, target: number) => void
	removeTarget: (specId: number) => void
	reset: () => void
}
```

- [ ] **Step 4:** Create `src/entities/goals/model/store.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Goal, GoalsState } from './types'

function clampTarget(value: number): number {
	if (!Number.isFinite(value)) return 3
	return Math.max(2, Math.min(5, Math.round(value)))
}

export const useGoalsStore = create<GoalsState>()(
	persist(
		set => ({
			targets: {},

			setTarget: (specId, target) =>
				set(state => {
					const now = Date.now()
					const existing = state.targets[specId]
					const clamped = clampTarget(target)
					const next: Goal = existing
						? { target: clamped, createdAt: existing.createdAt, updatedAt: now }
						: { target: clamped, createdAt: now, updatedAt: now }
					return { targets: { ...state.targets, [specId]: next } }
				}),

			removeTarget: specId =>
				set(state => {
					const { [specId]: _, ...rest } = state.targets
					return { targets: rest }
				}),

			reset: () => set({ targets: {} }),
		}),
		{
			name: 'goals-store',
			version: 1,
			partialize: state => ({ targets: state.targets }),
		},
	),
)
```

- [ ] **Step 5:** Run test — expect PASS:

```bash
npx vitest run src/entities/goals/model/__tests__/store.test.ts
```

- [ ] **Step 6:** Create `src/entities/goals/hooks/useGoal.ts`:

```ts
import { useGoalsStore } from '../model/store'

export function useGoal(specId: number) {
	const target = useGoalsStore(s => s.targets[specId]?.target ?? null)
	const set = useGoalsStore(s => s.setTarget)
	const remove = useGoalsStore(s => s.removeTarget)
	return {
		target,
		setTarget: (v: number) => set(specId, v),
		removeTarget: () => remove(specId),
	}
}

export function useHasAnyGoals(): boolean {
	return useGoalsStore(s => Object.keys(s.targets).length > 0)
}
```

- [ ] **Step 7:** Create `src/entities/goals/index.ts`:

```ts
export { useGoalsStore } from './model/store'
export type { Goal, GoalsState } from './model/types'
export { useGoal, useHasAnyGoals } from './hooks/useGoal'
```

- [ ] **Step 8:** Typecheck:

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 9:** Commit.

```bash
git add src/entities/goals
git commit -m "feat: add entities/goals — persist store for per-subject goal targets"
```

---

## Task 5: Wire goals store into `resetAllAppState`

**Why:** Switching accounts must clear goals so a sibling/parent account doesn't see the student's goals.

**Files:**
- Modify: `src/shared/lib/resetAllAppState.ts`

- [ ] **Step 1:** Open `src/shared/lib/resetAllAppState.ts`. Add to the import block:

```ts
import { useGoalsStore } from '@/entities/goals'
```

- [ ] **Step 2:** Inside the `resetAllAppState` body, after the `useLessonNotesStore` reset and before `useProfileDetailsStore`, insert:

```ts
try {
	useGoalsStore.persist.clearStorage?.()
} catch {}
useGoalsStore.setState({ targets: {} })
```

- [ ] **Step 3:** Typecheck:

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4:** Commit.

```bash
git add src/shared/lib/resetAllAppState.ts
git commit -m "feat: clear goals-store on account reset"
```

---

## Task 6: Pure math — `forecast.ts`

**Why:** `currentAvg`, `trend`, `risk`, and `gapToGoal` are pure functions that turn entries + target into `ForecastResult`. Unit-test them; they power all UI.

**Files:**
- Create: `src/features/goalForecast/lib/forecast.ts`
- Create: `src/features/goalForecast/lib/__tests__/forecast.test.ts`

- [ ] **Step 1:** Write failing test `src/features/goalForecast/lib/__tests__/forecast.test.ts`:

```ts
import type { GradeEntry } from '@/entities/grades'
import { describe, expect, it } from 'vitest'
import { computeForecast, computeRisk, computeTrend, currentAverage } from '../forecast'

function entry(date: string, marks: Partial<GradeEntry['marks']> | null, attended: GradeEntry['attended'] = 'present'): GradeEntry {
	return {
		date,
		lesson_number: 1,
		attended,
		spec_id: 1,
		spec_name: 'Test',
		teacher: 'T',
		theme: '',
		marks: marks === null
			? null
			: {
				control: marks?.control ?? null,
				homework: marks?.homework ?? null,
				lab: marks?.lab ?? null,
				classwork: marks?.classwork ?? null,
				practical: marks?.practical ?? null,
				final: marks?.final ?? null,
			},
	}
}

describe('currentAverage', () => {
	it('null on empty', () => {
		expect(currentAverage([])).toBeNull()
	})

	it('null when no marks at all', () => {
		expect(currentAverage([entry('2026-01-01', null, 'absent')])).toBeNull()
	})

	it('flat average across all mark types', () => {
		const entries = [
			entry('2026-01-01', { homework: 5, control: 4 }),
			entry('2026-01-02', { lab: 3 }),
		]
		expect(currentAverage(entries)).toBeCloseTo((5 + 4 + 3) / 3)
	})

	it('ignores zero marks', () => {
		const entries = [entry('2026-01-01', { homework: 0, control: 5 })]
		expect(currentAverage(entries)).toBe(5)
	})
})

describe('computeTrend', () => {
	it('flat when fewer than 4 marks', () => {
		const entries = [entry('2026-01-01', { homework: 3 })]
		expect(computeTrend(entries)).toBe('flat')
	})

	it('up when last 4 avg exceeds prev 4 avg by > 0.3', () => {
		const entries = [
			entry('2026-01-01', { homework: 3 }),
			entry('2026-01-02', { homework: 3 }),
			entry('2026-01-03', { homework: 3 }),
			entry('2026-01-04', { homework: 3 }),
			entry('2026-01-05', { homework: 5 }),
			entry('2026-01-06', { homework: 5 }),
			entry('2026-01-07', { homework: 5 }),
			entry('2026-01-08', { homework: 5 }),
		]
		expect(computeTrend(entries)).toBe('up')
	})

	it('down when last 4 avg below prev 4 avg by > 0.3', () => {
		const entries = [
			entry('2026-01-01', { homework: 5 }),
			entry('2026-01-02', { homework: 5 }),
			entry('2026-01-03', { homework: 5 }),
			entry('2026-01-04', { homework: 5 }),
			entry('2026-01-05', { homework: 3 }),
			entry('2026-01-06', { homework: 3 }),
			entry('2026-01-07', { homework: 3 }),
			entry('2026-01-08', { homework: 3 }),
		]
		expect(computeTrend(entries)).toBe('down')
	})

	it('flat when change within ±0.3', () => {
		const entries = [
			entry('2026-01-01', { homework: 4 }),
			entry('2026-01-02', { homework: 4 }),
			entry('2026-01-03', { homework: 4 }),
			entry('2026-01-04', { homework: 4 }),
			entry('2026-01-05', { homework: 4 }),
			entry('2026-01-06', { homework: 4 }),
			entry('2026-01-07', { homework: 4 }),
			entry('2026-01-08', { homework: 4 }),
		]
		expect(computeTrend(entries)).toBe('flat')
	})
})

describe('computeRisk', () => {
	it('no_goal when target is null', () => {
		expect(computeRisk(null, 4.5)).toBe('no_goal')
	})

	it('no_goal when forecast is null (no data)', () => {
		expect(computeRisk(4, null)).toBe('no_goal')
	})

	it('safe when forecast >= target', () => {
		expect(computeRisk(4, 4)).toBe('safe')
		expect(computeRisk(4, 4.5)).toBe('safe')
	})

	it('watch when forecast in [target-0.3, target)', () => {
		expect(computeRisk(4, 3.75)).toBe('watch')
		expect(computeRisk(5, 4.7)).toBe('watch')
	})

	it('danger when forecast < target-0.3', () => {
		expect(computeRisk(4, 3.5)).toBe('danger')
		expect(computeRisk(5, 4.6)).toBe('danger')
	})
})

describe('computeForecast (integration)', () => {
	it('returns all fields with null-safety', () => {
		const result = computeForecast([], 4)
		expect(result).toEqual({
			currentAvg: null,
			forecast: null,
			trend: 'flat',
			risk: 'no_goal',
			gapToGoal: null,
		})
	})

	it('computes gapToGoal as target - forecast', () => {
		const entries = [entry('2026-01-01', { homework: 4 })]
		const result = computeForecast(entries, 5)
		expect(result.currentAvg).toBe(4)
		expect(result.forecast).toBe(4)
		expect(result.gapToGoal).toBe(1)
	})
})
```

- [ ] **Step 2:** Run the test — expect FAIL:

```bash
npx vitest run src/features/goalForecast/lib/__tests__/forecast.test.ts
```

- [ ] **Step 3:** Create `src/features/goalForecast/lib/forecast.ts`:

```ts
import type { GradeEntry } from '@/entities/grades'

export type Risk = 'no_goal' | 'safe' | 'watch' | 'danger'
export type Trend = 'up' | 'flat' | 'down'

export interface ForecastResult {
	currentAvg: number | null
	forecast: number | null
	trend: Trend
	risk: Risk
	gapToGoal: number | null
}

const WATCH_THRESHOLD = 0.3
const TREND_THRESHOLD = 0.3
const TREND_WINDOW = 4

function flatMarks(entries: GradeEntry[]): number[] {
	return entries
		.filter(e => e.marks !== null)
		.flatMap(e =>
			Object.values(e.marks!).filter(
				(v): v is number => v !== null && v !== 0,
			),
		)
}

function mean(values: number[]): number | null {
	if (!values.length) return null
	return values.reduce((s, v) => s + v, 0) / values.length
}

export function currentAverage(entries: GradeEntry[]): number | null {
	return mean(flatMarks(entries))
}

/**
 * Extract an ordered list of marks (oldest first) so we can compare the last
 * TREND_WINDOW against the preceding TREND_WINDOW.
 */
function orderedMarks(entries: GradeEntry[]): number[] {
	return [...entries]
		.sort((a, b) => a.date.localeCompare(b.date))
		.flatMap(e =>
			e.marks
				? Object.values(e.marks).filter(
						(v): v is number => v !== null && v !== 0,
					)
				: [],
		)
}

export function computeTrend(entries: GradeEntry[]): Trend {
	const marks = orderedMarks(entries)
	if (marks.length < TREND_WINDOW * 2) return 'flat'

	const last = marks.slice(-TREND_WINDOW)
	const prev = marks.slice(-TREND_WINDOW * 2, -TREND_WINDOW)
	const diff = (mean(last) ?? 0) - (mean(prev) ?? 0)

	if (diff > TREND_THRESHOLD) return 'up'
	if (diff < -TREND_THRESHOLD) return 'down'
	return 'flat'
}

export function computeRisk(
	target: number | null,
	forecast: number | null,
): Risk {
	if (target === null || forecast === null) return 'no_goal'
	if (forecast >= target) return 'safe'
	if (forecast >= target - WATCH_THRESHOLD) return 'watch'
	return 'danger'
}

export function computeForecast(
	entries: GradeEntry[],
	target: number | null,
): ForecastResult {
	const currentAvg = currentAverage(entries)
	const forecast = currentAvg // MVP: forecast == current
	const trend = computeTrend(entries)
	const risk = computeRisk(target, forecast)
	const gapToGoal =
		target !== null && forecast !== null ? target - forecast : null

	return { currentAvg, forecast, trend, risk, gapToGoal }
}
```

- [ ] **Step 4:** Run the test — expect PASS:

```bash
npx vitest run src/features/goalForecast/lib/__tests__/forecast.test.ts
```

- [ ] **Step 5:** Commit.

```bash
git add src/features/goalForecast/lib/forecast.ts src/features/goalForecast/lib/__tests__/forecast.test.ts
git commit -m "feat: add goalForecast/lib/forecast with current/trend/risk"
```

---

## Task 7: Pure math — `whatIf.ts`

**Why:** Recomputes the average with user-imagined future marks. Pure function, easy TDD.

**Files:**
- Create: `src/features/goalForecast/lib/whatIf.ts`
- Create: `src/features/goalForecast/lib/__tests__/whatIf.test.ts`

- [ ] **Step 1:** Write failing test:

```ts
import type { GradeEntry } from '@/entities/grades'
import { describe, expect, it } from 'vitest'
import { whatIfAverage } from '../whatIf'

function entry(marks: Partial<GradeEntry['marks']>): GradeEntry {
	return {
		date: '2026-01-01',
		lesson_number: 1,
		attended: 'present',
		spec_id: 1,
		spec_name: 'T',
		teacher: 'T',
		theme: '',
		marks: {
			control: marks.control ?? null,
			homework: marks.homework ?? null,
			lab: marks.lab ?? null,
			classwork: marks.classwork ?? null,
			practical: marks.practical ?? null,
			final: marks.final ?? null,
		},
	}
}

describe('whatIfAverage', () => {
	it('returns currentAverage when no future marks', () => {
		const entries = [entry({ homework: 4 }), entry({ control: 5 })]
		expect(whatIfAverage(entries, [])).toBeCloseTo(4.5)
	})

	it('returns null when neither current nor future marks exist', () => {
		expect(whatIfAverage([], [])).toBeNull()
	})

	it('mixes current and future into flat average', () => {
		const entries = [entry({ homework: 4 })]
		const future = [{ type: 'homework' as const, value: 5, repeat: 3 }]
		// 4 + 5*3 over 4 items = 19/4 = 4.75
		expect(whatIfAverage(entries, future)).toBeCloseTo(4.75)
	})

	it('handles repeat=0 as no contribution', () => {
		const entries = [entry({ homework: 4 })]
		const future = [{ type: 'homework' as const, value: 5, repeat: 0 }]
		expect(whatIfAverage(entries, future)).toBe(4)
	})

	it('handles future-only (no current marks)', () => {
		const future = [{ type: 'control' as const, value: 5, repeat: 2 }]
		expect(whatIfAverage([], future)).toBe(5)
	})
})
```

- [ ] **Step 2:** Run test — expect FAIL.

```bash
npx vitest run src/features/goalForecast/lib/__tests__/whatIf.test.ts
```

- [ ] **Step 3:** Create `src/features/goalForecast/lib/whatIf.ts`:

```ts
import type { GradeEntry } from '@/entities/grades'
import type { GradeType } from '@/shared/types'

export interface WhatIfFutureMark {
	type: GradeType
	value: number
	repeat: number
}

function currentMarks(entries: GradeEntry[]): number[] {
	return entries
		.filter(e => e.marks !== null)
		.flatMap(e =>
			Object.values(e.marks!).filter(
				(v): v is number => v !== null && v !== 0,
			),
		)
}

function futureMarks(future: WhatIfFutureMark[]): number[] {
	return future.flatMap(m =>
		m.repeat > 0 ? Array(m.repeat).fill(m.value) : [],
	)
}

export function whatIfAverage(
	entries: GradeEntry[],
	future: WhatIfFutureMark[],
): number | null {
	const combined = [...currentMarks(entries), ...futureMarks(future)]
	if (!combined.length) return null
	return combined.reduce((s, v) => s + v, 0) / combined.length
}
```

- [ ] **Step 4:** Run test — expect PASS.

```bash
npx vitest run src/features/goalForecast/lib/__tests__/whatIf.test.ts
```

- [ ] **Step 5:** Commit.

```bash
git add src/features/goalForecast/lib/whatIf.ts src/features/goalForecast/lib/__tests__/whatIf.test.ts
git commit -m "feat: add goalForecast/lib/whatIf for hypothetical-marks simulation"
```

---

## Task 8: Pure math — `subjectStats.ts`

**Why:** All four stat-card calculations in one pure utility. TDD covers edges: empty, only attendance, mixed periods.

**Files:**
- Create: `src/features/goalForecast/lib/subjectStats.ts`
- Create: `src/features/goalForecast/lib/__tests__/subjectStats.test.ts`

- [ ] **Step 1:** Write failing test:

```ts
import type { GradeEntry } from '@/entities/grades'
import { describe, expect, it } from 'vitest'
import {
	computeAttendance,
	computeByPeriod,
	computeByType,
	computeDistribution,
	computeSubjectStats,
	computeTotals,
} from '../subjectStats'

function entry(
	date: string,
	attended: GradeEntry['attended'],
	marks: Partial<GradeEntry['marks']> | null = null,
	lesson_number = 1,
): GradeEntry {
	return {
		date,
		lesson_number,
		attended,
		spec_id: 1,
		spec_name: 'T',
		teacher: 'T',
		theme: '',
		marks: marks === null
			? null
			: {
				control: marks.control ?? null,
				homework: marks.homework ?? null,
				lab: marks.lab ?? null,
				classwork: marks.classwork ?? null,
				practical: marks.practical ?? null,
				final: marks.final ?? null,
			},
	}
}

describe('computeTotals', () => {
	it('zero for empty', () => {
		expect(computeTotals([])).toEqual({ lessons: 0, withMarks: 0, withoutMarks: 0 })
	})

	it('counts marks vs no-marks', () => {
		const entries = [
			entry('2026-01-01', 'present', { homework: 4 }),
			entry('2026-01-02', 'present', null),
			entry('2026-01-03', 'absent', null),
		]
		expect(computeTotals(entries)).toEqual({ lessons: 3, withMarks: 1, withoutMarks: 2 })
	})
})

describe('computeAttendance', () => {
	it('zero-safe on empty', () => {
		expect(computeAttendance([])).toEqual({ present: 0, late: 0, absent: 0, ratePercent: 0 })
	})

	it('counts each status + computes rate', () => {
		const entries = [
			entry('2026-01-01', 'present'),
			entry('2026-01-02', 'late'),
			entry('2026-01-03', 'absent'),
			entry('2026-01-04', 'present'),
		]
		const res = computeAttendance(entries)
		expect(res).toEqual({ present: 2, late: 1, absent: 1, ratePercent: 75 })
	})
})

describe('computeDistribution', () => {
	it('all zeros on empty', () => {
		expect(computeDistribution([])).toEqual({ 2: 0, 3: 0, 4: 0, 5: 0 })
	})

	it('rounds float marks to integer buckets', () => {
		const entries = [
			entry('2026-01-01', 'present', { homework: 5 }),
			entry('2026-01-02', 'present', { control: 4, homework: 4 }),
			entry('2026-01-03', 'present', { lab: 3 }),
			entry('2026-01-04', 'present', { practical: 2 }),
		]
		expect(computeDistribution(entries)).toEqual({ 2: 1, 3: 1, 4: 2, 5: 1 })
	})

	it('ignores null/zero marks', () => {
		const entries = [entry('2026-01-01', 'present', { homework: 0 })]
		expect(computeDistribution(entries)).toEqual({ 2: 0, 3: 0, 4: 0, 5: 0 })
	})
})

describe('computeByType', () => {
	it('empty array on no entries', () => {
		expect(computeByType([])).toEqual([])
	})

	it('groups and averages per type', () => {
		const entries = [
			entry('2026-01-01', 'present', { homework: 4 }),
			entry('2026-01-02', 'present', { homework: 5 }),
			entry('2026-01-03', 'present', { control: 3 }),
		]
		const result = computeByType(entries)
		const hw = result.find(r => r.type === 'homework')!
		const ctrl = result.find(r => r.type === 'control')!
		expect(hw).toEqual({ type: 'homework', count: 2, avg: 4.5 })
		expect(ctrl).toEqual({ type: 'control', count: 1, avg: 3 })
		expect(result.find(r => r.type === 'lab')).toBeUndefined()
	})
})

describe('computeByPeriod (week)', () => {
	it('empty array on no entries', () => {
		expect(computeByPeriod([], 'week')).toEqual([])
	})

	it('groups by ISO week', () => {
		const entries = [
			entry('2026-01-05', 'present', { homework: 4 }),   // week A
			entry('2026-01-06', 'present', { homework: 5 }),   // week A
			entry('2026-01-12', 'present', { homework: 3 }),   // week B
		]
		const periods = computeByPeriod(entries, 'week')
		expect(periods).toHaveLength(2)
		expect(periods[0].count).toBe(2)
		expect(periods[0].avg).toBe(4.5)
		expect(periods[1].count).toBe(1)
		expect(periods[1].avg).toBe(3)
	})
})

describe('computeByPeriod (month)', () => {
	it('groups by YYYY-MM and labels in russian short', () => {
		const entries = [
			entry('2026-01-05', 'present', { homework: 4 }),
			entry('2026-02-03', 'present', { homework: 5 }),
		]
		const periods = computeByPeriod(entries, 'month')
		expect(periods).toHaveLength(2)
		expect(periods[0].label).toMatch(/янв/i)
		expect(periods[1].label).toMatch(/фев/i)
	})
})

describe('computeSubjectStats', () => {
	it('wraps all sub-computations', () => {
		const entries = [
			entry('2026-01-05', 'present', { homework: 4 }),
			entry('2026-01-06', 'late', { homework: 5 }),
		]
		const res = computeSubjectStats(entries)
		expect(res.total.lessons).toBe(2)
		expect(res.attendance.present).toBe(1)
		expect(res.attendance.late).toBe(1)
		expect(res.distribution[4]).toBe(1)
		expect(res.distribution[5]).toBe(1)
		expect(res.byType).toHaveLength(1)
		expect(res.byPeriod.length).toBeGreaterThan(0)
	})
})
```

- [ ] **Step 2:** Run test — expect FAIL.

```bash
npx vitest run src/features/goalForecast/lib/__tests__/subjectStats.test.ts
```

- [ ] **Step 3:** Create `src/features/goalForecast/lib/subjectStats.ts`:

```ts
import type { GradeEntry } from '@/entities/grades'
import type { GradeType } from '@/shared/types'

export interface Totals {
	lessons: number
	withMarks: number
	withoutMarks: number
}

export interface Attendance {
	present: number
	late: number
	absent: number
	ratePercent: number
}

export type Distribution = Record<2 | 3 | 4 | 5, number>

export interface ByTypeItem {
	type: GradeType
	count: number
	avg: number
}

export interface PeriodItem {
	label: string
	avg: number
	count: number
}

export type Period = 'week' | 'month'

export interface SubjectStats {
	total: Totals
	attendance: Attendance
	distribution: Distribution
	byType: ByTypeItem[]
	byPeriod: PeriodItem[]
}

const RU_MONTH_SHORT = [
	'янв', 'фев', 'мар', 'апр', 'май', 'июн',
	'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
]

function flatMarks(entry: GradeEntry): number[] {
	if (!entry.marks) return []
	return Object.values(entry.marks).filter(
		(v): v is number => v !== null && v !== 0,
	)
}

export function computeTotals(entries: GradeEntry[]): Totals {
	const lessons = entries.length
	const withMarks = entries.filter(e => flatMarks(e).length > 0).length
	return { lessons, withMarks, withoutMarks: lessons - withMarks }
}

export function computeAttendance(entries: GradeEntry[]): Attendance {
	const present = entries.filter(e => e.attended === 'present').length
	const late = entries.filter(e => e.attended === 'late').length
	const absent = entries.filter(e => e.attended === 'absent').length
	const total = entries.length
	const ratePercent = total === 0 ? 0 : Math.round(((present + late) / total) * 100)
	return { present, late, absent, ratePercent }
}

export function computeDistribution(entries: GradeEntry[]): Distribution {
	const dist: Distribution = { 2: 0, 3: 0, 4: 0, 5: 0 }
	for (const e of entries) {
		for (const v of flatMarks(e)) {
			const bucket = Math.round(v)
			if (bucket === 2 || bucket === 3 || bucket === 4 || bucket === 5) {
				dist[bucket] += 1
			}
		}
	}
	return dist
}

export function computeByType(entries: GradeEntry[]): ByTypeItem[] {
	const buckets: Record<GradeType, number[]> = {
		control: [], homework: [], lab: [], classwork: [], practical: [], final: [],
	}
	for (const e of entries) {
		if (!e.marks) continue
		for (const [type, value] of Object.entries(e.marks) as [GradeType, number | null][]) {
			if (value !== null && value !== 0) buckets[type].push(value)
		}
	}
	const order: GradeType[] = ['homework', 'lab', 'classwork', 'control', 'practical', 'final']
	return order
		.filter(t => buckets[t].length > 0)
		.map(t => ({
			type: t,
			count: buckets[t].length,
			avg: buckets[t].reduce((s, v) => s + v, 0) / buckets[t].length,
		}))
}

function isoWeekKey(date: string): string {
	const d = new Date(date + 'T00:00:00Z')
	const target = new Date(d)
	const dayNum = (d.getUTCDay() + 6) % 7
	target.setUTCDate(target.getUTCDate() - dayNum + 3)
	const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
	const week = 1 + Math.round(
		((target.getTime() - firstThursday.getTime()) / 86400000 - 3) / 7,
	)
	return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function weekLabel(key: string): string {
	const n = parseInt(key.split('-W')[1] ?? '0', 10)
	return `нед ${n}`
}

function monthKey(date: string): string {
	return date.slice(0, 7)
}

function monthLabel(key: string): string {
	const m = parseInt(key.split('-')[1] ?? '1', 10)
	return RU_MONTH_SHORT[m - 1] ?? key
}

export function computeByPeriod(entries: GradeEntry[], period: Period): PeriodItem[] {
	if (entries.length === 0) return []

	const key = period === 'week' ? isoWeekKey : monthKey
	const label = period === 'week' ? weekLabel : monthLabel

	const buckets = new Map<string, number[]>()
	for (const e of entries) {
		const k = key(e.date)
		const marks = flatMarks(e)
		if (marks.length === 0) continue
		const existing = buckets.get(k) ?? []
		existing.push(...marks)
		buckets.set(k, existing)
	}

	return [...buckets.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k, values]) => ({
			label: label(k),
			count: values.length,
			avg: values.reduce((s, v) => s + v, 0) / values.length,
		}))
}

export function computeSubjectStats(entries: GradeEntry[]): SubjectStats {
	return {
		total: computeTotals(entries),
		attendance: computeAttendance(entries),
		distribution: computeDistribution(entries),
		byType: computeByType(entries),
		byPeriod: computeByPeriod(entries, 'week'),
	}
}
```

- [ ] **Step 4:** Run test — expect PASS.

```bash
npx vitest run src/features/goalForecast/lib/__tests__/subjectStats.test.ts
```

- [ ] **Step 5:** Commit.

```bash
git add src/features/goalForecast/lib/subjectStats.ts src/features/goalForecast/lib/__tests__/subjectStats.test.ts
git commit -m "feat: add goalForecast/lib/subjectStats (totals/attendance/distribution/byType/byPeriod)"
```

---

## Task 9: Composition hook — `useOverallSummary`

**Why:** Main-screen hero needs per-session aggregate. Composes `useGrades` + `useGoalsStore`.

**Files:**
- Create: `src/features/goalForecast/hooks/useOverallSummary.ts`

- [ ] **Step 1:** Create `src/features/goalForecast/hooks/useOverallSummary.ts`:

```ts
import { useGoalsStore } from '@/entities/goals'
import { useGrades } from '@/entities/grades'
import { useMemo } from 'react'
import { computeForecast, type Risk } from '../lib/forecast'

export interface OverallSummary {
	forecast: number | null
	target: number | null
	risk: Risk
	atRiskCount: number
	totalSubjectsWithGoals: number
}

const RISK_RANK: Record<Risk, number> = { safe: 0, no_goal: 1, watch: 2, danger: 3 }

export function useOverallSummary(): OverallSummary {
	const { entries } = useGrades()
	const targets = useGoalsStore(s => s.targets)

	return useMemo(() => {
		const bySubject = new Map<number, typeof entries>()
		for (const e of entries) {
			const arr = bySubject.get(e.spec_id) ?? []
			arr.push(e)
			bySubject.set(e.spec_id, arr)
		}

		const subjectForecasts: number[] = []
		const subjectTargets: number[] = []
		let worstRisk: Risk = 'safe'
		let atRiskCount = 0
		let totalWithGoals = 0

		for (const [specId, items] of bySubject) {
			const target = targets[specId]?.target ?? null
			const f = computeForecast(items, target)
			if (f.forecast !== null) subjectForecasts.push(f.forecast)
			if (target !== null) {
				subjectTargets.push(target)
				totalWithGoals += 1
				if (f.risk === 'watch' || f.risk === 'danger') atRiskCount += 1
				if (RISK_RANK[f.risk] > RISK_RANK[worstRisk]) worstRisk = f.risk
			}
		}

		const avg = (vs: number[]) =>
			vs.length ? vs.reduce((s, v) => s + v, 0) / vs.length : null

		return {
			forecast: avg(subjectForecasts),
			target: avg(subjectTargets),
			risk: totalWithGoals === 0 ? 'no_goal' : worstRisk,
			atRiskCount,
			totalSubjectsWithGoals: totalWithGoals,
		}
	}, [entries, targets])
}
```

- [ ] **Step 2:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3:** Commit.

```bash
git add src/features/goalForecast/hooks/useOverallSummary.ts
git commit -m "feat: add useOverallSummary — session-wide aggregate hook"
```

---

## Task 10: Composition hook — `useGoalsOverview`

**Why:** Main-screen list needs per-subject cards. Composes subjects + grades + goals.

**Files:**
- Create: `src/features/goalForecast/hooks/useGoalsOverview.ts`

- [ ] **Step 1:** Create `src/features/goalForecast/hooks/useGoalsOverview.ts`:

```ts
import { useGoalsStore } from '@/entities/goals'
import { useGrades } from '@/entities/grades'
import { useSubjects } from '@/entities/subject'
import { useMemo } from 'react'
import { computeForecast, type Risk, type Trend } from '../lib/forecast'

export interface GoalCardData {
	specId: number
	specName: string
	currentAvg: number | null
	forecast: number | null
	target: number | null
	trend: Trend
	risk: Risk
}

const RISK_ORDER: Record<Risk, number> = {
	danger: 0,
	watch: 1,
	safe: 2,
	no_goal: 3,
}

export function useGoalsOverview(): GoalCardData[] {
	const { entries } = useGrades()
	const { subjects } = useSubjects()
	const targets = useGoalsStore(s => s.targets)

	return useMemo(() => {
		const bySpec = new Map<number, typeof entries>()
		for (const e of entries) {
			const arr = bySpec.get(e.spec_id) ?? []
			arr.push(e)
			bySpec.set(e.spec_id, arr)
		}

		const specNameById = new Map<number, string>(
			subjects.map(s => [s.id, s.name]),
		)

		const rows: GoalCardData[] = []
		for (const [specId, items] of bySpec) {
			const target = targets[specId]?.target ?? null
			const f = computeForecast(items, target)
			rows.push({
				specId,
				specName:
					specNameById.get(specId) ?? items[0]?.spec_name ?? `Предмет ${specId}`,
				currentAvg: f.currentAvg,
				forecast: f.forecast,
				target,
				trend: f.trend,
				risk: f.risk,
			})
		}

		rows.sort((a, b) => {
			const r = RISK_ORDER[a.risk] - RISK_ORDER[b.risk]
			if (r !== 0) return r
			return a.specName.localeCompare(b.specName, 'ru')
		})

		return rows
	}, [entries, subjects, targets])
}
```

- [ ] **Step 2:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3:** Commit.

```bash
git add src/features/goalForecast/hooks/useGoalsOverview.ts
git commit -m "feat: add useGoalsOverview — per-subject goal rows for main screen"
```

---

## Task 11: Composition hook — `useGoalDetail`

**Why:** Detail screen needs forecast + stats + last-N entries for one subject.

**Files:**
- Create: `src/features/goalForecast/hooks/useGoalDetail.ts`
- Create: `src/features/goalForecast/index.ts`

- [ ] **Step 1:** Create `src/features/goalForecast/hooks/useGoalDetail.ts`:

```ts
import { useGoal } from '@/entities/goals'
import { useGrades } from '@/entities/grades'
import { useSubjects } from '@/entities/subject'
import { useMemo } from 'react'
import { computeForecast, type ForecastResult } from '../lib/forecast'
import { computeSubjectStats, type SubjectStats } from '../lib/subjectStats'

export interface GoalDetailData {
	specId: number
	specName: string
	entries: ReturnType<typeof useGrades>['entries']  // subject-scoped
	target: number | null
	forecast: ForecastResult
	stats: SubjectStats
	recent: Array<{ date: string; type: string; value: number }>
}

const RECENT_LIMIT = 8

export function useGoalDetail(specId: number): GoalDetailData {
	const { entries } = useGrades()
	const { subjects } = useSubjects()
	const { target } = useGoal(specId)

	return useMemo(() => {
		const subjectEntries = entries.filter(e => e.spec_id === specId)
		const forecast = computeForecast(subjectEntries, target)
		const stats = computeSubjectStats(subjectEntries)

		const recent = subjectEntries
			.filter(e => e.marks !== null)
			.flatMap(e =>
				e.marks
					? Object.entries(e.marks)
							.filter(([, v]) => v !== null && v !== 0)
							.map(([type, value]) => ({
								date: e.date,
								type,
								value: value as number,
							}))
					: [],
			)
			.sort((a, b) => b.date.localeCompare(a.date))
			.slice(0, RECENT_LIMIT)

		const specName =
			subjects.find(s => s.id === specId)?.name ??
			subjectEntries[0]?.spec_name ??
			`Предмет ${specId}`

		return { specId, specName, entries: subjectEntries, target, forecast, stats, recent }
	}, [entries, subjects, specId, target])
}
```

- [ ] **Step 2:** Create `src/features/goalForecast/index.ts`:

```ts
export type { ForecastResult, Risk, Trend } from './lib/forecast'
export { computeForecast, computeRisk, computeTrend, currentAverage } from './lib/forecast'
export type { ByTypeItem, Distribution, PeriodItem, SubjectStats, Totals } from './lib/subjectStats'
export {
	computeAttendance,
	computeByPeriod,
	computeByType,
	computeDistribution,
	computeSubjectStats,
	computeTotals,
} from './lib/subjectStats'
export type { WhatIfFutureMark } from './lib/whatIf'
export { whatIfAverage } from './lib/whatIf'
export type { GoalCardData } from './hooks/useGoalsOverview'
export { useGoalsOverview } from './hooks/useGoalsOverview'
export type { GoalDetailData } from './hooks/useGoalDetail'
export { useGoalDetail } from './hooks/useGoalDetail'
export type { OverallSummary } from './hooks/useOverallSummary'
export { useOverallSummary } from './hooks/useOverallSummary'
```

- [ ] **Step 3:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4:** Commit.

```bash
git add src/features/goalForecast/hooks/useGoalDetail.ts src/features/goalForecast/index.ts
git commit -m "feat: add useGoalDetail and features/goalForecast barrel"
```

---

## Task 12: Widget — `GoalCard`

**Why:** Single subject row on the main screen. Pure UI, props-driven.

**Files:**
- Create: `src/widgets/Goals/GoalCard/ui/GoalCard.tsx`

- [ ] **Step 1:** Create `src/widgets/Goals/GoalCard/ui/GoalCard.tsx`:

```tsx
import type { GoalCardData } from '@/features/goalForecast'

interface Props {
	data: GoalCardData
	onPress: (specId: number) => void
}

const riskStyle: Record<GoalCardData['risk'], { label: string; color: string; bg: string; border: string }> = {
	safe: { label: 'на курсе', color: '#22c98a', bg: 'rgba(34,201,138,0.08)', border: 'rgba(34,201,138,0.28)' },
	watch: { label: 'на грани', color: '#f0a020', bg: 'rgba(240,160,32,0.08)', border: 'rgba(240,160,32,0.28)' },
	danger: { label: 'недобор', color: '#e03535', bg: 'rgba(224,53,53,0.06)', border: 'rgba(224,53,53,0.28)' },
	no_goal: { label: 'без цели', color: '#8a94a6', bg: 'transparent', border: 'var(--color-border)' },
}

function gradeColor(v: number | null): string {
	if (v === null) return '#8a94a6'
	if (v >= 5) return '#22c98a'
	if (v >= 4) return '#4d9ef7'
	if (v >= 3) return '#f0a020'
	return '#e03535'
}

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(1)
}

export function GoalCard({ data, onPress }: Props) {
	const style = riskStyle[data.risk]
	return (
		<button
			type='button'
			onClick={() => onPress(data.specId)}
			className='w-full text-left rounded-[22px] p-4 mb-2 block'
			style={{
				background: style.bg === 'transparent' ? 'var(--color-surface)' : style.bg,
				border: `1px solid ${style.border}`,
				boxShadow: 'var(--shadow-card)',
				minHeight: 88,
			}}
		>
			<div className='flex items-center justify-between'>
				<strong className='text-[14px] text-app-text'>{data.specName}</strong>
				<span
					className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]'
					style={{ color: style.color, background: style.bg === 'transparent' ? 'var(--color-surface)' : style.bg, border: `1px solid ${style.border}` }}
				>
					● {style.label}
				</span>
			</div>
			<div className='flex justify-between mt-2 text-[11px] text-app-muted'>
				<span>сейчас</span>
				<span>прогноз</span>
				<span>цель</span>
			</div>
			<div className='flex justify-between mt-0.5'>
				<span className='text-[20px] font-semibold text-app-text'>{fmt(data.currentAvg)}</span>
				<span className='text-[20px] font-semibold' style={{ color: gradeColor(data.forecast) }}>
					{fmt(data.forecast)}
				</span>
				<span className='text-[20px] font-semibold' style={{ color: 'var(--color-brand)' }}>
					{data.target ?? '—'}
				</span>
			</div>
		</button>
	)
}
```

- [ ] **Step 2:** Typecheck + build.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3:** Commit.

```bash
git add src/widgets/Goals/GoalCard
git commit -m "feat(widgets): add GoalCard"
```

---

## Task 13: Widget — `GoalsList` + `EmptyGoalsState`

**Files:**
- Create: `src/widgets/Goals/GoalsList/ui/GoalsList.tsx`
- Create: `src/widgets/Goals/EmptyGoalsState/ui/EmptyGoalsState.tsx`

- [ ] **Step 1:** Create `src/widgets/Goals/GoalsList/ui/GoalsList.tsx`:

```tsx
import type { GoalCardData } from '@/features/goalForecast'
import { GoalCard } from '../../GoalCard/ui/GoalCard'

interface Props {
	items: GoalCardData[]
	onItemPress: (specId: number) => void
}

export function GoalsList({ items, onItemPress }: Props) {
	if (items.length === 0) return null
	return (
		<div>
			{items.map(item => (
				<GoalCard key={item.specId} data={item} onPress={onItemPress} />
			))}
		</div>
	)
}
```

- [ ] **Step 2:** Create `src/widgets/Goals/EmptyGoalsState/ui/EmptyGoalsState.tsx`:

```tsx
interface Props {
	hasAnyEntries: boolean
	onPressSetup: () => void
}

export function EmptyGoalsState({ hasAnyEntries, onPressSetup }: Props) {
	if (!hasAnyEntries) {
		return (
			<div
				className='rounded-[22px] p-6 text-center'
				style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
			>
				<div className='text-app-text font-medium mb-1'>Пока нет данных</div>
				<div className='text-app-muted text-sm'>
					Расчёты появятся после того, как начнут ставить оценки.
				</div>
			</div>
		)
	}

	return (
		<div
			className='rounded-[22px] p-4'
			style={{
				background: 'var(--color-brand-subtle)',
				border: '1px dashed var(--color-brand-border)',
			}}
		>
			<div className='text-[13px] mb-1'>👋 Поставь цель на семестр</div>
			<div className='text-app-muted text-[11px] mb-3'>
				Пока без целей покажу предметы, где есть риск хвоста.
			</div>
			<button
				type='button'
				onClick={onPressSetup}
				className='rounded-[12px] text-white font-medium text-[12px] px-4 py-2'
				style={{ background: 'var(--color-brand)', minHeight: 44 }}
			>
				Настроить цели
			</button>
		</div>
	)
}
```

- [ ] **Step 3:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4:** Commit.

```bash
git add src/widgets/Goals/GoalsList src/widgets/Goals/EmptyGoalsState
git commit -m "feat(widgets): add GoalsList and EmptyGoalsState"
```

---

## Task 14: Widget — `OverallGoalSummary`

**Files:**
- Create: `src/widgets/Goals/OverallGoalSummary/ui/OverallGoalSummary.tsx`

- [ ] **Step 1:** Create `src/widgets/Goals/OverallGoalSummary/ui/OverallGoalSummary.tsx`:

```tsx
import type { OverallSummary } from '@/features/goalForecast'

interface Props {
	summary: OverallSummary
}

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(2)
}

export function OverallGoalSummary({ summary }: Props) {
	const riskText =
		summary.totalSubjectsWithGoals === 0
			? 'цели не заданы'
			: summary.atRiskCount === 0
				? 'всё в норме'
				: `${summary.atRiskCount} в риске`

	const progressPct =
		summary.forecast !== null && summary.target
			? Math.min(100, Math.round((summary.forecast / summary.target) * 100))
			: 0

	return (
		<div
			className='rounded-[22px] p-4 mb-3'
			style={{
				background:
					'linear-gradient(135deg, rgba(213,4,22,0.14), rgba(242,159,5,0.08))',
				border: '1px solid var(--color-brand-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='flex justify-between text-[11px] text-app-muted mb-1'>
				<span>Сессия целиком</span>
				<span>{riskText}</span>
			</div>
			<div className='flex items-baseline justify-between'>
				<div>
					<span className='text-[28px] font-semibold' style={{ color: 'var(--color-brand)' }}>
						{fmt(summary.forecast)}
					</span>
					<span className='text-[11px] text-app-muted ml-1.5'>прогноз</span>
				</div>
				<div className='text-[11px] text-app-muted'>
					цель <strong className='text-app-text'>{fmt(summary.target)}</strong>
				</div>
			</div>
			<div
				className='h-1 rounded-full mt-2 overflow-hidden'
				style={{ background: 'rgba(255,255,255,0.08)' }}
			>
				<div
					className='h-full rounded-full'
					style={{
						width: `${progressPct}%`,
						background: 'linear-gradient(90deg, var(--color-gradient-from), var(--color-gradient-to))',
					}}
				/>
			</div>
		</div>
	)
}
```

- [ ] **Step 2:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3:** Commit.

```bash
git add src/widgets/Goals/OverallGoalSummary
git commit -m "feat(widgets): add OverallGoalSummary hero"
```

---

## Task 15: Widget — `SetGoalSheet`

**Files:**
- Create: `src/widgets/Goals/SetGoalSheet/ui/SetGoalSheet.tsx`

- [ ] **Step 1:** First re-read `src/shared/ui/BottomSheet/BottomSheet.tsx` to pick up the exact prop API. Then create `src/widgets/Goals/SetGoalSheet/ui/SetGoalSheet.tsx`:

```tsx
import { BottomSheet } from '@/shared/ui'
import { useEffect, useState } from 'react'

interface Props {
	open: boolean
	onClose: () => void
	specName: string
	initialTarget: number | null
	onSave: (target: number) => void
	onRemove: () => void
}

const CHOICES = [3, 4, 5] as const

export function SetGoalSheet({
	open,
	onClose,
	specName,
	initialTarget,
	onSave,
	onRemove,
}: Props) {
	const [selected, setSelected] = useState<number>(initialTarget ?? 5)

	useEffect(() => {
		if (open) setSelected(initialTarget ?? 5)
	}, [open, initialTarget])

	return (
		<BottomSheet open={open} onClose={onClose}>
			<div className='px-4 pt-2 pb-4' style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
				<div className='font-semibold text-[14px]'>Цель по «{specName}»</div>
				<div className='text-app-muted text-[11px] mt-1 mb-4'>Какую итоговую хочешь?</div>
				<div className='flex gap-2 mb-4'>
					{CHOICES.map(v => (
						<button
							key={v}
							type='button'
							onClick={() => setSelected(v)}
							className='flex-1 rounded-[12px] text-[16px] font-semibold'
							style={{
								minHeight: 48,
								background:
									selected === v
										? 'var(--color-brand)'
										: 'var(--color-surface)',
								color:
									selected === v ? '#fff' : 'var(--color-text)',
								border: '1px solid var(--color-border)',
							}}
						>
							{v}
						</button>
					))}
				</div>
				<button
					type='button'
					onClick={() => {
						onSave(selected)
						onClose()
					}}
					className='w-full rounded-[12px] text-white font-semibold text-[13px]'
					style={{
						background: 'var(--color-brand)',
						minHeight: 48,
					}}
				>
					Сохранить
				</button>
				{initialTarget !== null && (
					<button
						type='button'
						onClick={() => {
							onRemove()
							onClose()
						}}
						className='w-full text-center text-[12px] text-app-muted mt-3'
						style={{ minHeight: 44 }}
					>
						Убрать цель
					</button>
				)}
			</div>
		</BottomSheet>
	)
}
```

If BottomSheet's prop API differs (e.g. uses `isOpen` or `visible` instead of `open`), adjust imports/usage to match.

- [ ] **Step 2:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3:** Commit.

```bash
git add src/widgets/Goals/SetGoalSheet
git commit -m "feat(widgets): add SetGoalSheet bottom sheet for target selection"
```

---

## Task 16: Widget — `GoalHero`

**Files:**
- Create: `src/widgets/Goals/GoalHero/ui/GoalHero.tsx`

- [ ] **Step 1:** Create `src/widgets/Goals/GoalHero/ui/GoalHero.tsx`:

```tsx
import type { ForecastResult, Risk } from '@/features/goalForecast'

interface Props {
	forecast: ForecastResult
	target: number | null
	onEdit: () => void
}

const riskBadge: Record<Risk, { label: string; color: string }> = {
	safe: { label: '● на курсе', color: '#22c98a' },
	watch: { label: '● на грани', color: '#f0a020' },
	danger: { label: '● недобор', color: '#e03535' },
	no_goal: { label: '● без цели', color: '#8a94a6' },
}

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(1)
}

export function GoalHero({ forecast, target, onEdit }: Props) {
	const badge = riskBadge[forecast.risk]
	return (
		<div
			className='rounded-[22px] p-4 mb-3'
			style={{
				background:
					'linear-gradient(135deg, rgba(213,4,22,0.14), rgba(242,159,5,0.08))',
				border: '1px solid var(--color-brand-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='flex justify-between text-[10px] uppercase tracking-wider text-app-muted'>
				<span>Прогноз</span>
				<span>Цель</span>
			</div>
			<div className='flex items-baseline justify-between mt-1'>
				<span className='text-[30px] font-semibold' style={{ color: '#4d9ef7' }}>
					{fmt(forecast.forecast)}
				</span>
				<span className='text-[30px] font-semibold' style={{ color: 'var(--color-brand)' }}>
					{target ?? '—'}
				</span>
			</div>
			<div className='flex justify-between items-center mt-2'>
				<span className='text-[11px] text-app-muted'>
					текущий <strong className='text-app-text'>{fmt(forecast.currentAvg)}</strong>
				</span>
				<span
					className='text-[10px] rounded-full px-2 py-0.5'
					style={{ color: badge.color, background: 'rgba(255,255,255,0.04)', border: `1px solid ${badge.color}33` }}
				>
					{badge.label}
				</span>
			</div>
			<button
				type='button'
				onClick={onEdit}
				className='w-full rounded-[14px] text-white font-semibold text-[13px] mt-3'
				style={{ background: 'var(--color-brand)', minHeight: 48 }}
			>
				{target === null ? 'Поставить цель' : 'Изменить цель'}
			</button>
		</div>
	)
}
```

- [ ] **Step 2:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3:** Commit.

```bash
git add src/widgets/Goals/GoalHero
git commit -m "feat(widgets): add GoalHero for detail screen"
```

---

## Task 17: Widget — `WhatIfSimulator`

**Files:**
- Create: `src/widgets/Goals/WhatIfSimulator/ui/WhatIfRow.tsx`
- Create: `src/widgets/Goals/WhatIfSimulator/ui/WhatIfSimulator.tsx`

- [ ] **Step 1:** Create `src/widgets/Goals/WhatIfSimulator/ui/WhatIfRow.tsx`:

```tsx
import type { GradeType } from '@/shared/types'

const LABEL: Record<GradeType, string> = {
	control: 'Контроль',
	homework: 'ДЗ',
	lab: 'Лаб',
	classwork: 'КР',
	practical: 'Практ',
	final: 'Зачёт',
}

interface Props {
	type: GradeType
	value: 3 | 4 | 5
	repeat: number
	hint?: string
	onChangeRepeat: (next: number) => void
	onChangeValue: (next: 3 | 4 | 5) => void
}

export function WhatIfRow({ type, value, repeat, hint, onChangeRepeat, onChangeValue }: Props) {
	const dec = () => onChangeRepeat(Math.max(0, repeat - 1))
	const inc = () => onChangeRepeat(Math.min(10, repeat + 1))
	const cycleValue = () => {
		const next = value === 5 ? 3 : value === 3 ? 4 : 5
		onChangeValue(next as 3 | 4 | 5)
	}

	return (
		<div
			className='rounded-[20px] px-3.5 py-2.5 mb-1.5 flex items-center justify-between'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
				minHeight: 52,
			}}
		>
			<div>
				<strong className='text-[13px]'>{LABEL[type]}</strong>
				{hint && <div className='text-[10px] text-app-muted'>{hint}</div>}
			</div>
			<div className='flex items-center gap-1.5'>
				<button
					type='button'
					onClick={dec}
					className='rounded-[10px]'
					style={{
						width: 32,
						height: 32,
						background: 'var(--color-surface-strong)',
						border: '1px solid var(--color-border)',
						color: 'var(--color-text)',
						fontSize: 18,
					}}
				>
					−
				</button>
				<button
					type='button'
					onClick={cycleValue}
					className='font-semibold text-center'
					style={{ minWidth: 48, minHeight: 32, background: 'transparent', border: 'none', color: 'var(--color-text)' }}
				>
					{repeat}×{value}
				</button>
				<button
					type='button'
					onClick={inc}
					className='rounded-[10px]'
					style={{
						width: 32,
						height: 32,
						background: 'var(--color-surface-strong)',
						border: '1px solid var(--color-border)',
						color: 'var(--color-text)',
						fontSize: 18,
					}}
				>
					+
				</button>
			</div>
		</div>
	)
}
```

- [ ] **Step 2:** Create `src/widgets/Goals/WhatIfSimulator/ui/WhatIfSimulator.tsx`:

```tsx
import type { GradeEntry } from '@/entities/grades'
import { whatIfAverage, type WhatIfFutureMark } from '@/features/goalForecast'
import type { GradeType } from '@/shared/types'
import { useMemo, useState } from 'react'
import { WhatIfRow } from './WhatIfRow'

interface Props {
	entries: GradeEntry[]
}

const VISIBLE_TYPES: GradeType[] = ['homework', 'classwork', 'control', 'lab', 'practical']

interface RowState {
	value: 3 | 4 | 5
	repeat: number
}

export function WhatIfSimulator({ entries }: Props) {
	const [rows, setRows] = useState<Record<GradeType, RowState>>(() => ({
		homework: { value: 5, repeat: 0 },
		classwork: { value: 5, repeat: 0 },
		control: { value: 4, repeat: 0 },
		lab: { value: 5, repeat: 0 },
		practical: { value: 5, repeat: 0 },
		final: { value: 5, repeat: 0 },
	}))

	const present = useMemo(() => {
		const seen = new Set<GradeType>()
		for (const e of entries) {
			if (!e.marks) continue
			for (const [type, v] of Object.entries(e.marks) as [GradeType, number | null][]) {
				if (v !== null && v !== 0) seen.add(type)
			}
		}
		return VISIBLE_TYPES.filter(t => seen.has(t))
	}, [entries])

	const future: WhatIfFutureMark[] = useMemo(
		() =>
			present.map(type => ({
				type,
				value: rows[type].value,
				repeat: rows[type].repeat,
			})),
		[present, rows],
	)

	const projected = useMemo(
		() => whatIfAverage(entries, future),
		[entries, future],
	)

	const totalRepeats = future.reduce((s, f) => s + f.repeat, 0)

	return (
		<div>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mt-3 mb-2 px-1'>
				What-if — если я получу…
			</div>
			{present.map(type => (
				<WhatIfRow
					key={type}
					type={type}
					value={rows[type].value}
					repeat={rows[type].repeat}
					onChangeRepeat={next =>
						setRows(r => ({ ...r, [type]: { ...r[type], repeat: next } }))
					}
					onChangeValue={next =>
						setRows(r => ({ ...r, [type]: { ...r[type], value: next } }))
					}
				/>
			))}
			{totalRepeats > 0 && (
				<div
					className='rounded-[20px] px-3.5 py-3 text-center'
					style={{
						background: 'var(--color-brand-subtle)',
						border: '1px solid var(--color-brand-border)',
					}}
				>
					<span className='text-app-muted text-[11px]'>итого выйдет</span>
					<strong
						className='ml-2 text-[20px]'
						style={{ color: 'var(--color-brand)' }}
					>
						{projected === null ? '—' : projected.toFixed(2)}
					</strong>
				</div>
			)}
		</div>
	)
}
```

- [ ] **Step 3:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4:** Commit.

```bash
git add src/widgets/Goals/WhatIfSimulator
git commit -m "feat(widgets): add WhatIfSimulator with +/- steppers per mark type"
```

---

## Task 18: Widget — `SubjectStats` suite

**Files:**
- Create: `src/widgets/Goals/SubjectStats/ui/AttendanceStat.tsx`
- Create: `src/widgets/Goals/SubjectStats/ui/CountStat.tsx`
- Create: `src/widgets/Goals/SubjectStats/ui/DistributionStat.tsx`
- Create: `src/widgets/Goals/SubjectStats/ui/ByTypeStat.tsx`
- Create: `src/widgets/Goals/SubjectStats/ui/ByPeriodStat.tsx`
- Create: `src/widgets/Goals/SubjectStats/ui/SubjectStats.tsx`

- [ ] **Step 1:** Create `src/widgets/Goals/SubjectStats/ui/AttendanceStat.tsx`:

```tsx
import type { Attendance } from '@/features/goalForecast'

interface Props {
	data: Attendance
}

export function AttendanceStat({ data }: Props) {
	const color =
		data.ratePercent >= 90 ? '#22c98a' : data.ratePercent >= 75 ? '#4d9ef7' : data.ratePercent >= 60 ? '#f0a020' : '#e03535'
	return (
		<div className='rounded-[20px] p-3' style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
			<div className='text-[10px] uppercase tracking-wider text-app-muted'>посещаемость</div>
			<div className='text-[22px] font-semibold mt-1' style={{ color }}>
				{data.ratePercent}%
			</div>
			<div className='text-[10px] text-app-muted mt-0.5'>
				{data.absent} проп · {data.late} опозд
			</div>
		</div>
	)
}
```

- [ ] **Step 2:** Create `src/widgets/Goals/SubjectStats/ui/CountStat.tsx`:

```tsx
import type { Totals } from '@/features/goalForecast'

interface Props {
	data: Totals
}

export function CountStat({ data }: Props) {
	return (
		<div className='rounded-[20px] p-3' style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
			<div className='text-[10px] uppercase tracking-wider text-app-muted'>оценок</div>
			<div className='text-[22px] font-semibold mt-1 text-app-text'>
				{data.withMarks}
				<span className='text-[13px] font-normal text-app-muted'>/{data.lessons}</span>
			</div>
			<div className='text-[10px] text-app-muted mt-0.5'>пар всего {data.lessons}</div>
		</div>
	)
}
```

- [ ] **Step 3:** Create `src/widgets/Goals/SubjectStats/ui/DistributionStat.tsx`:

```tsx
import type { Distribution } from '@/features/goalForecast'

interface Props {
	data: Distribution
}

const COLORS: Record<2 | 3 | 4 | 5, string> = {
	2: '#e03535',
	3: '#f0a020',
	4: '#4d9ef7',
	5: '#22c98a',
}

export function DistributionStat({ data }: Props) {
	const max = Math.max(data[2], data[3], data[4], data[5], 1)
	return (
		<div className='rounded-[20px] p-3' style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mb-2'>распределение</div>
			<div className='flex gap-1.5 items-end' style={{ height: 54 }}>
				{([2, 3, 4, 5] as const).map(g => (
					<div key={g} className='flex-1 flex flex-col items-center gap-1'>
						<div
							className='w-full rounded'
							style={{
								height: `${(data[g] / max) * 100}%`,
								minHeight: 2,
								background: COLORS[g],
							}}
						/>
						<div className='text-[9px] text-app-muted'>
							{data[g]}×{g}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
```

- [ ] **Step 4:** Create `src/widgets/Goals/SubjectStats/ui/ByTypeStat.tsx`:

```tsx
import type { ByTypeItem } from '@/features/goalForecast'
import type { GradeType } from '@/shared/types'

interface Props {
	data: ByTypeItem[]
}

const LABEL: Record<GradeType, string> = {
	control: 'Контроль',
	homework: 'ДЗ',
	lab: 'Лабы',
	classwork: 'КР',
	practical: 'Практ',
	final: 'Зачёт',
}

function gradeColor(v: number): string {
	if (v >= 5) return '#22c98a'
	if (v >= 4) return '#4d9ef7'
	if (v >= 3) return '#f0a020'
	return '#e03535'
}

export function ByTypeStat({ data }: Props) {
	if (data.length === 0) return null
	return (
		<div className='rounded-[20px] p-3' style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mb-1.5'>по типам оценок</div>
			{data.map(row => (
				<div key={row.type} className='flex items-center justify-between text-[12px] py-0.5'>
					<span>
						{LABEL[row.type]} <span className='text-app-muted text-[10px]'>· {row.count}</span>
					</span>
					<strong style={{ color: gradeColor(row.avg) }}>{row.avg.toFixed(1)}</strong>
				</div>
			))}
		</div>
	)
}
```

- [ ] **Step 5:** Create `src/widgets/Goals/SubjectStats/ui/ByPeriodStat.tsx`:

```tsx
import type { PeriodItem } from '@/features/goalForecast'

interface Props {
	data: PeriodItem[]
}

function gradeColor(v: number): string {
	if (v >= 5) return '#22c98a'
	if (v >= 4) return '#4d9ef7'
	if (v >= 3) return '#f0a020'
	return '#e03535'
}

export function ByPeriodStat({ data }: Props) {
	if (data.length === 0) return null
	return (
		<div className='rounded-[20px] p-3' style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mb-2'>по неделям</div>
			<div className='flex items-end gap-1' style={{ height: 44 }}>
				{data.map(item => (
					<div
						key={item.label}
						className='flex-1 rounded'
						style={{
							height: `${(item.avg / 5) * 100}%`,
							minHeight: 3,
							background: gradeColor(item.avg),
						}}
						title={`${item.label}: ${item.avg.toFixed(1)}`}
					/>
				))}
			</div>
			<div className='flex justify-between text-[9px] text-app-muted mt-1'>
				<span>{data[0]?.label}</span>
				<span>{data[data.length - 1]?.label}</span>
			</div>
		</div>
	)
}
```

- [ ] **Step 6:** Create `src/widgets/Goals/SubjectStats/ui/SubjectStats.tsx`:

```tsx
import type { SubjectStats as SubjectStatsData } from '@/features/goalForecast'
import { AttendanceStat } from './AttendanceStat'
import { ByPeriodStat } from './ByPeriodStat'
import { ByTypeStat } from './ByTypeStat'
import { CountStat } from './CountStat'
import { DistributionStat } from './DistributionStat'

interface Props {
	stats: SubjectStatsData
}

export function SubjectStats({ stats }: Props) {
	return (
		<div>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mt-3 mb-2 px-1'>
				Статистика
			</div>
			<div className='grid grid-cols-2 gap-2 mb-2'>
				<AttendanceStat data={stats.attendance} />
				<CountStat data={stats.total} />
			</div>
			<div className='space-y-2'>
				<DistributionStat data={stats.distribution} />
				<ByTypeStat data={stats.byType} />
				<ByPeriodStat data={stats.byPeriod} />
			</div>
		</div>
	)
}
```

- [ ] **Step 7:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 8:** Commit.

```bash
git add src/widgets/Goals/SubjectStats
git commit -m "feat(widgets): add SubjectStats suite (attendance/count/distribution/byType/byPeriod)"
```

---

## Task 19: Widget — `RecentMarks`

**Files:**
- Create: `src/widgets/Goals/RecentMarks/ui/RecentMarks.tsx`

- [ ] **Step 1:** Create `src/widgets/Goals/RecentMarks/ui/RecentMarks.tsx`:

```tsx
import type { GradeType } from '@/shared/types'

interface RecentMark {
	date: string
	type: string
	value: number
}

interface Props {
	items: RecentMark[]
}

const TYPE_LABEL: Record<GradeType, string> = {
	control: 'Контроль',
	homework: 'ДЗ',
	lab: 'Лаб',
	classwork: 'КР',
	practical: 'Практ',
	final: 'Зачёт',
}

function gradeColor(v: number): string {
	if (v >= 5) return '#22c98a'
	if (v >= 4) return '#4d9ef7'
	if (v >= 3) return '#f0a020'
	return '#e03535'
}

function fmtDate(iso: string): string {
	const [_, m, d] = iso.split('-')
	return `${Number(d)}.${m}`
}

export function RecentMarks({ items }: Props) {
	if (items.length === 0) return null
	return (
		<div>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mt-3 mb-2 px-1'>
				Последние
			</div>
			<div
				className='rounded-[20px] px-3.5 py-2'
				style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
			>
				{items.map((m, i) => (
					<div
						key={`${m.date}-${m.type}-${i}`}
						className='flex justify-between items-center py-1.5 text-[12px]'
					>
						<span>
							{fmtDate(m.date)}
							<span className='text-app-muted'> · {TYPE_LABEL[m.type as GradeType] ?? m.type}</span>
						</span>
						<strong style={{ color: gradeColor(m.value) }}>{m.value}</strong>
					</div>
				))}
			</div>
		</div>
	)
}
```

- [ ] **Step 2:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3:** Commit.

```bash
git add src/widgets/Goals/RecentMarks
git commit -m "feat(widgets): add RecentMarks"
```

---

## Task 20: Widget — `GoalsSummaryCard` (HomePage entry)

**Files:**
- Create: `src/widgets/Goals/GoalsSummaryCard/ui/GoalsSummaryCard.tsx`

- [ ] **Step 1:** Create `src/widgets/Goals/GoalsSummaryCard/ui/GoalsSummaryCard.tsx`:

```tsx
import { useOverallSummary } from '@/features/goalForecast'
import { pageConfig } from '@/shared/config'
import { useNavigate } from 'react-router-dom'

function fmt(v: number | null): string {
	return v === null ? '—' : v.toFixed(2)
}

export function GoalsSummaryCard() {
	const summary = useOverallSummary()
	const navigate = useNavigate()

	if (summary.totalSubjectsWithGoals === 0 && summary.atRiskCount === 0) return null

	const color =
		summary.risk === 'danger'
			? '#e03535'
			: summary.risk === 'watch'
				? '#f0a020'
				: summary.risk === 'safe'
					? '#22c98a'
					: '#8a94a6'

	const captionText =
		summary.totalSubjectsWithGoals === 0
			? `${summary.atRiskCount} в риске`
			: summary.atRiskCount > 0
				? `${summary.atRiskCount} в риске`
				: 'всё в норме'

	return (
		<button
			type='button'
			onClick={() => navigate(pageConfig.goals)}
			className='w-full rounded-[22px] p-4 mb-3 text-left'
			style={{
				background:
					'linear-gradient(135deg, rgba(213,4,22,0.10), rgba(242,159,5,0.05))',
				border: '1px solid var(--color-brand-border)',
				boxShadow: 'var(--shadow-card)',
				minHeight: 88,
			}}
		>
			<div className='flex justify-between text-[11px] text-app-muted mb-1'>
				<span>Цели семестра</span>
				<span style={{ color }}>{captionText}</span>
			</div>
			<div className='flex items-baseline justify-between'>
				<div>
					<span className='text-[22px] font-semibold' style={{ color: 'var(--color-brand)' }}>
						{fmt(summary.forecast)}
					</span>
					<span className='text-[11px] text-app-muted ml-1.5'>прогноз</span>
				</div>
				<div className='text-[11px] text-app-muted'>
					цель <strong className='text-app-text'>{fmt(summary.target)}</strong>
				</div>
			</div>
		</button>
	)
}
```

- [ ] **Step 2:** Typecheck.

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3:** Commit.

```bash
git add src/widgets/Goals/GoalsSummaryCard
git commit -m "feat(widgets): add GoalsSummaryCard for HomePage"
```

---

## Task 21: Widget barrel + page wiring

**Files:**
- Modify: `src/widgets/index.ts`
- Modify: `src/pages/goals/ui/GoalsPage.tsx`
- Modify: `src/pages/goals/ui/GoalDetailPage.tsx`

- [ ] **Step 1:** Append to `src/widgets/index.ts`:

```ts
// Goals
export { EmptyGoalsState } from './Goals/EmptyGoalsState/ui/EmptyGoalsState'
export { GoalCard } from './Goals/GoalCard/ui/GoalCard'
export { GoalHero } from './Goals/GoalHero/ui/GoalHero'
export { GoalsList } from './Goals/GoalsList/ui/GoalsList'
export { GoalsSummaryCard } from './Goals/GoalsSummaryCard/ui/GoalsSummaryCard'
export { OverallGoalSummary } from './Goals/OverallGoalSummary/ui/OverallGoalSummary'
export { RecentMarks } from './Goals/RecentMarks/ui/RecentMarks'
export { SetGoalSheet } from './Goals/SetGoalSheet/ui/SetGoalSheet'
export { SubjectStats } from './Goals/SubjectStats/ui/SubjectStats'
export { WhatIfSimulator } from './Goals/WhatIfSimulator/ui/WhatIfSimulator'
```

- [ ] **Step 2:** Replace `src/pages/goals/ui/GoalsPage.tsx` with the real wiring:

```tsx
import { useGoalsOverview, useOverallSummary } from '@/features/goalForecast'
import { PageHeader } from '@/shared/ui'
import { EmptyGoalsState, GoalsList, OverallGoalSummary } from '@/widgets'
import { useNavigate } from 'react-router-dom'

export function GoalsPage() {
	const overview = useGoalsOverview()
	const summary = useOverallSummary()
	const navigate = useNavigate()

	const hasEntries = overview.length > 0
	const hasGoals = summary.totalSubjectsWithGoals > 0

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4'>
				<PageHeader title='Цели' />
			</div>

			<div className='px-4'>
				{hasEntries && <OverallGoalSummary summary={summary} />}

				{!hasGoals && (
					<div className='mb-3'>
						<EmptyGoalsState
							hasAnyEntries={hasEntries}
							onPressSetup={() => {
								const firstCard = overview[0]
								if (firstCard) navigate(`/goals/${firstCard.specId}`)
							}}
						/>
					</div>
				)}

				<GoalsList items={overview} onItemPress={id => navigate(`/goals/${id}`)} />
			</div>
		</div>
	)
}
```

- [ ] **Step 3:** Replace `src/pages/goals/ui/GoalDetailPage.tsx`:

```tsx
import { useGoal } from '@/entities/goals'
import { useGoalDetail } from '@/features/goalForecast'
import { PageHeader } from '@/shared/ui'
import {
	GoalHero,
	RecentMarks,
	SetGoalSheet,
	SubjectStats,
	WhatIfSimulator,
} from '@/widgets'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export function GoalDetailPage() {
	const { specId: specIdRaw } = useParams<{ specId: string }>()
	const specId = Number(specIdRaw)
	const navigate = useNavigate()
	const { setTarget, removeTarget } = useGoal(specId)
	const [sheetOpen, setSheetOpen] = useState(false)

	if (!Number.isFinite(specId)) {
		return (
			<div className='min-h-screen text-app-text pb-28 p-4'>
				<PageHeader title='Предмет' showBack onBack={() => navigate('/goals')} />
				<div className='text-app-muted text-sm'>Неверный идентификатор предмета.</div>
			</div>
		)
	}

	const detail = useGoalDetail(specId)

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4'>
				<PageHeader
					title={detail.specName}
					showBack
					onBack={() => navigate(-1)}
				/>
			</div>

			<div className='px-4'>
				<GoalHero
					forecast={detail.forecast}
					target={detail.target}
					onEdit={() => setSheetOpen(true)}
				/>

				<WhatIfSimulator entries={detail.entries} />

				<SubjectStats stats={detail.stats} />

				<RecentMarks items={detail.recent} />
			</div>

			<SetGoalSheet
				open={sheetOpen}
				onClose={() => setSheetOpen(false)}
				specName={detail.specName}
				initialTarget={detail.target}
				onSave={v => setTarget(v)}
				onRemove={() => removeTarget()}
			/>
		</div>
	)
}
```

**Note:** If `PageHeader` does not support `showBack`/`onBack` props, open `src/shared/ui/PageHeader/...` to check. If missing, adapt (e.g. pass a back button via `actions` prop, or add a `<button>` in the page body). Do NOT extend PageHeader in this task — just adapt the call site.

- [ ] **Step 4:** Typecheck + run dev server, open `#/goals` and `#/goals/<valid-spec-id>` on a device-width window. Verify both screens render without errors.

```bash
npx tsc --noEmit
npm run dev
```

- [ ] **Step 5:** Commit.

```bash
git add src/widgets/index.ts src/pages/goals
git commit -m "feat: wire GoalsPage and GoalDetailPage with new widgets"
```

---

## Task 22: HomePage integration — mount `GoalsSummaryCard`

**Files:**
- Modify: `src/pages/home/ui/HomePage.tsx`

- [ ] **Step 1:** Edit `src/pages/home/ui/HomePage.tsx` to mount `GoalsSummaryCard` between `DashboardCharts` and `HomeScheduleSection`:

```tsx
import { DashboardCharts, FutureExams, GoalsSummaryCard, HomeScheduleSection } from '@/widgets'

export function HomePage() {
	return (
		<div className='min-h-screen pb-28'>
			<div className='px-4 pt-2 pb-4'>
				<DashboardCharts />

				<GoalsSummaryCard />

				<HomeScheduleSection />

				<div className='mt-5 mb-3'>
					<h1 className='text-lg font-bold leading-tight text-app-text'>
						Будущие экзамены
					</h1>
				</div>

				<FutureExams />
			</div>
		</div>
	)
}
```

- [ ] **Step 2:** Typecheck + open HomePage in the running dev server. When `targets` is empty AND no subject has avg ≤ 3.2 trend, the card should be hidden (null).

- [ ] **Step 3:** Manual smoke: in DevTools set a goal in store via `useGoalsStore.getState().setTarget(<specId>, 5)` — card should appear on HomePage.

- [ ] **Step 4:** Commit.

```bash
git add src/pages/home/ui/HomePage.tsx
git commit -m "feat: mount GoalsSummaryCard on HomePage"
```

---

## Task 23: GradesPage header action → navigate to `/goals`

**Files:**
- Modify: `src/pages/grades/ui/GradesPage.tsx`

- [ ] **Step 1:** Edit `src/pages/grades/ui/GradesPage.tsx`:

Add import:

```tsx
import { Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { pageConfig } from '@/shared/config'
```

Inside the component, add:

```tsx
const navigate = useNavigate()
```

Change the `PageHeader` call to include a goals-button alongside the existing refresh:

```tsx
<PageHeader
	title='Оценки'
	actions={
		<>
			<button
				type='button'
				onClick={() => navigate(pageConfig.goals)}
				aria-label='Цели'
				className='rounded-full'
				style={{
					width: 36,
					height: 36,
					background: 'var(--color-surface)',
					border: '1px solid var(--color-border)',
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Target size={18} />
			</button>
			<RefreshGradesButton />
		</>
	}
/>
```

If `PageHeader` only accepts a single React node as `actions`, wrap both in a `<div className='flex gap-2'>` instead of a fragment.

- [ ] **Step 2:** Typecheck + open `/grades` in the running app. Tap the new target icon — should navigate to `/goals`.

- [ ] **Step 3:** Commit.

```bash
git add src/pages/grades/ui/GradesPage.tsx
git commit -m "feat: add Goals entry-point button to GradesPage header"
```

---

## Task 24: Full run of the test suite

**Why:** Regression sweep — new shared config, moved type, new store, new lib tests all need to coexist with the existing 62 tests.

- [ ] **Step 1:** Run full suite:

```bash
npm test
```

Expected: PASS. All previously green tests still green + new tests green. If anything fails, fix inline (don't amend earlier commits — push a follow-up).

- [ ] **Step 2:** If everything passes, no commit needed (no code changes).

---

## Task 25: Manual end-to-end smoke test

**Why:** Mobile UI can't be covered by unit tests meaningfully — only via manual walk-through.

- [ ] **Step 1:** Start the dev server + open in a phone-sized window (Chrome DevTools device emulation, 390px width).

```bash
npm run dev
```

- [ ] **Step 2:** Walk the golden path:

1. HomePage: `GoalsSummaryCard` hidden initially (no goals yet).
2. GradesPage: tap target-icon in header → navigates to `/goals`.
3. `/goals`: `OverallGoalSummary` visible; `EmptyGoalsState` dashed CTA visible; list shows all subjects in `no_goal` state sorted by name.
4. Tap a subject → `/goals/:specId`.
5. Detail: hero shows `—` for prognoz/forecast if no marks, or real values. "Поставить цель" button → opens SetGoalSheet.
6. Select 5 in sheet → Save → sheet closes → hero now shows target 5 and correct risk colour.
7. Scroll: WhatIfSimulator shows only types present in that subject's entries. Tap + on ДЗ → projected value updates in real time.
8. Scroll: Stats block renders attendance %, counts, distribution bars, by-type, by-period bars.
9. Scroll: RecentMarks shows 5-10 latest entries.
10. Back → `/goals`: card for that subject now shows goal + correct risk + light-up border.
11. HomePage: `GoalsSummaryCard` now visible with forecast & target.
12. Profile → Log out → re-login: goals gone (cleared via `resetAllAppState`).

- [ ] **Step 2b:** Walk the error paths:
- Open `#/goals/9999999` (invalid specId) — should show "Неверный идентификатор" or empty detail.
- Toggle offline in DevTools → reload: persisted goals + cached grades should still render.

- [ ] **Step 3:** Capture any defects as follow-up commits. Do not ship until the golden path runs clean.

- [ ] **Step 4:** Final housekeeping commit if there were last-mile tweaks:

```bash
git add -A
git commit -m "chore: polish from goal-feature smoke testing"
```

---

## Rollback / follow-ups

- If `PageHeader` doesn't support `showBack`/`onBack`, that rework belongs in a follow-up PR that refactors the header — do NOT extend it here.
- If `BottomSheet` API differs from `{ open, onClose }`, adapt `SetGoalSheet` inline; no need to rewrite the shared component.
- V2 (out of scope): regression-based forecast with confidence band, weighted per-type averaging, goal-change history, cross-device sync.

---

## Self-review (plan author)

- **Spec coverage:** Scope §2 → Tasks 3, 21, 22, 23. Architecture §3 → Tasks 4, 6–11, 12–20. Data model §4 → Tasks 1, 4. Math §5 → Tasks 6–8. UI/UX §6 → Tasks 12–22. Errors §7 → Tasks 4 (clamp), 5 (reset), 21 (invalid specId). Tests §8 → Tasks 2, 4, 6–8, 24, 25.
- **Placeholders:** none detected. Every step includes concrete code or a concrete command.
- **Type consistency:** `ForecastResult`, `SubjectStats`, `GoalCardData`, `OverallSummary`, `WhatIfFutureMark` are defined once in `features/goalForecast` and re-exported through its barrel; widgets consume via type imports. `GradeType`/`GradeMarks` live in `shared/types` after Task 1 and are used consistently downstream.
- **Scope:** one plan, one feature, ~25 bite-sized tasks. No independent subsystems smuggled in.
