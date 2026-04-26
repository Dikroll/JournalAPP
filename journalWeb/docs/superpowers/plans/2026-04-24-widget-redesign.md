# Widget Redesign (Small Summary + Unified Design + Live Countdown) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign schedule widgets on iOS and Android with a unified glow-based visual language, replace the existing countdown widget with a new "small summary" widget (next lesson + room + live countdown + progress), and ensure both platforms render identically within their technical constraints.

**Architecture:**
- iOS WidgetKit (SwiftUI): two widgets in the bundle — `ScheduleSummaryWidget` (new systemSmall, replaces `ScheduleCountdownWidget`) and `ScheduleWidget` (existing systemMedium/Large, visually refreshed). Live countdown uses `Text(date, style: .timer)` — system renders tick-by-tick without reload budget.
- Android: two `AppWidgetProvider`s — `ScheduleSummaryWidgetProvider` (new 2×2) and `ScheduleWidgetProvider` (existing, refreshed). Live countdown uses `Chronometer.setBase` — nativ OS renders ticking without updates. Shared background drawable with new glow look (layer-list of gradient + radial-fake with alpha layers; no blur, XML only).
- Payload stays the same (`ScheduleWidgetPayload`) — no API / JSON contract changes. New fields for "tomorrow first lesson" added to payload for the "Готово на сегодня" state.

**Tech Stack:** Swift/SwiftUI (iOS widget extension), Java + Android RemoteViews (Android widget), TypeScript (payload builder in `src/features/scheduleWidgets`), Vitest (payload tests).

---

## File Structure

### New files

- `src/features/scheduleWidgets/lib/tomorrowPreview.ts` — builds `tomorrowFirstLesson` field from `days` schedule store.
- `android/app/src/main/java/com/Dikroll/Journal/widgets/ScheduleSummaryWidgetProvider.java` — new 2×2 provider.
- `android/app/src/main/res/xml/schedule_summary_widget_info.xml` — 2×2 widget provider info.
- `android/app/src/main/res/layout/schedule_summary_widget.xml` — summary layout.
- `android/app/src/main/res/drawable/schedule_widget_glow_background.xml` — new shared glow background (layer-list).
- `android/app/src/main/res/drawable/schedule_widget_glow_overlay.xml` — subtle red glow overlay.
- `android/app/src/main/res/drawable/schedule_widget_card_bg.xml` — inner card background for next-lesson block.
- `ios/App/ScheduleWidget/ScheduleSummaryWidget.swift` — new summary widget (replaces countdown).

### Modified files

- `src/features/scheduleWidgets/lib/payload.ts` — add `tomorrowFirstLesson?: ScheduleWidgetLesson` to `ScheduleWidgetPayload`.
- `src/features/scheduleWidgets/lib/widgetBridge.ts` — pass `todayDate` and `daysMap` to `getScheduleWidgetPayload` signature.
- `src/features/scheduleWidgets/lib/__tests__/payload.test.ts` — add tests for tomorrowFirstLesson.
- `src/features/scheduleReminders/hooks/useInitScheduleReminders.ts` — pass schedule store `days` to `syncScheduleWidgets`.
- `android/app/src/main/res/drawable/schedule_widget_background.xml` — remove (replaced by glow background).
- `android/app/src/main/res/layout/schedule_widget.xml` — refresh to match iOS visual style.
- `android/app/src/main/AndroidManifest.xml` — register new `ScheduleSummaryWidgetProvider`.
- `ios/App/ScheduleWidget/ScheduleWidget.swift` — replace `WidgetChrome` background (remove Circle overlays, add glow rect), keep data payload decoding; **remove** `ScheduleCountdownWidget` struct and `ScheduleCountdownProvider`.
- `ios/App/ScheduleWidget/ScheduleWidgetBundle.swift` — replace `ScheduleCountdownWidget()` with `ScheduleSummaryWidget()`.

### Deleted/replaced concepts

- Old `ScheduleCountdownWidget` (iOS small) — replaced by `ScheduleSummaryWidget`.
- Old `schedule_widget_background.xml` (Android) — replaced by `schedule_widget_glow_background.xml`.

---

## Visual Language Specification (applies to ALL widgets)

**Colors (exact hex):**
- Base gradient top: `#15171D`
- Base gradient bottom: `#1C1418`
- Glow red accent: `#d50416` @ 22% alpha (`#38D50416` in AARRGGBB)
- Rim border: `#FFFFFF` @ 8% alpha (`#14FFFFFF`)
- Text primary: `#FFFFFF`
- Text secondary: `#FFFFFF` @ 64% alpha (`#A3FFFFFF`)
- Text faint: `#FFFFFF` @ 44% alpha (`#70FFFFFF`)
- Next lesson card bg: `#FFFFFF` @ 10% alpha (`#1AFFFFFF`)
- Highlight accent (current/next mark): `#d50416`

**Sizes:**
- Widget corner radius: 26pt (iOS) / 24dp (Android)
- Inner card corner radius: 16pt / 16dp
- Padding: 16pt / 16dp
- Rim border: 1pt / 1dp

**Typography:**
- Widget title: caption, 12pt, semibold, color=text secondary
- Countdown big: 32pt, black, rounded design (iOS `.rounded`), white
- Next subject: headline, 16pt, bold, white
- Meta line (room/time): caption, 11pt, color=text secondary
- Debug footer: 10pt, semibold, rounded, color=text faint

**Layout pattern (Summary / Small):**
```
┌────────────────┐
│ СЕГОДНЯ    3/5 │  ← header: title left, progress badge right
│                │
│ 11:00          │  ← start time, big
│ Математика     │  ← subject, bold
│ ауд. 303       │  ← room, faint
│                │
│ ⏱ 25 мин       │  ← live countdown
└────────────────┘
```

**Layout pattern (Medium / List):**
```
┌──────────────────────────┐
│ РАСПИСАНИЕ      Сегодня  │
├──────────────────────────┤
│ 🔴 09:00  Математика     │  ← next lesson highlighted
│           ауд. 101       │
├──────────────────────────┤
│    11:00  Физика         │
│    13:00  История        │
└──────────────────────────┘
```

---

## Task 1: Extend payload with tomorrow's first lesson

**Files:**
- Modify: `src/features/scheduleWidgets/lib/payload.ts`
- Test: `src/features/scheduleWidgets/lib/__tests__/payload.test.ts`

- [ ] **Step 1: Write failing test for tomorrowFirstLesson**

Add to `src/features/scheduleWidgets/lib/__tests__/payload.test.ts`:

```typescript
it('includes tomorrow first lesson when provided', () => {
	const tomorrow: LessonItem[] = [
		{
			date: '2026-04-24',
			lesson: 1,
			started_at: '08:30',
			finished_at: '10:00',
			teacher: 'Сидоров С.С.',
			subject: 'Биология',
			room: '303',
		},
	]
	const payload = buildScheduleWidgetPayload(
		LESSONS,
		new Date('2026-04-23T20:00:00'),
		tomorrow,
	)

	expect(payload.tomorrowFirstLesson?.subject).toBe('Биология')
	expect(payload.tomorrowFirstLesson?.startedAt).toBe('08:30')
})

it('has null tomorrowFirstLesson when not provided', () => {
	const payload = buildScheduleWidgetPayload(
		LESSONS,
		new Date('2026-04-23T08:00:00'),
	)
	expect(payload.tomorrowFirstLesson).toBeNull()
})
```

- [ ] **Step 2: Run tests to confirm failure**

Run: `bun run test src/features/scheduleWidgets`
Expected: 2 new tests FAIL (signature mismatch or `tomorrowFirstLesson` undefined).

- [ ] **Step 3: Update payload interface and function**

Replace content of `src/features/scheduleWidgets/lib/payload.ts`:

```typescript
import type { LessonItem } from '@/entities/schedule'
import { getScheduleTimeInfo } from '@/entities/schedule'
import { toMinutes } from '@/shared/hooks'
import { getTodayString } from '@/shared/utils'

export interface ScheduleWidgetLesson {
	lesson: number
	subject: string
	room: string
	teacher: string
	startedAt: string
	finishedAt: string
	date: string
}

export interface ScheduleWidgetPayload {
	date: string
	savedAt: number
	summary: string
	isEmpty: boolean
	nextLesson: ScheduleWidgetLesson | null
	lessons: ScheduleWidgetLesson[]
	tomorrowFirstLesson: ScheduleWidgetLesson | null
	completedCount: number
	totalCount: number
}

function toWidgetLesson(lesson: LessonItem): ScheduleWidgetLesson {
	return {
		lesson: lesson.lesson,
		subject: lesson.subject,
		room: lesson.room,
		teacher: lesson.teacher,
		startedAt: lesson.started_at,
		finishedAt: lesson.finished_at,
		date: lesson.date,
	}
}

function countCompleted(lessons: LessonItem[], nowMinutes: number): number {
	return lessons.filter(l => toMinutes(l.finished_at) <= nowMinutes).length
}

export function buildScheduleWidgetPayload(
	lessons: LessonItem[],
	now = new Date(),
	tomorrowLessons: LessonItem[] = [],
): ScheduleWidgetPayload {
	const sorted = [...lessons].sort((a, b) => a.lesson - b.lesson)
	const nowMinutes = toMinutes(now.toTimeString().slice(0, 5))
	const timeInfo = getScheduleTimeInfo(sorted, nowMinutes)
	const date = sorted[0]?.date ?? getTodayString()

	const tomorrowSorted = [...tomorrowLessons].sort((a, b) => a.lesson - b.lesson)
	const tomorrowFirst = tomorrowSorted[0]
		? toWidgetLesson(tomorrowSorted[0])
		: null

	return {
		date,
		savedAt: now.getTime(),
		summary: timeInfo.label,
		isEmpty: sorted.length === 0,
		nextLesson: timeInfo.nextLesson
			? toWidgetLesson(timeInfo.nextLesson)
			: timeInfo.currentLesson
				? toWidgetLesson(timeInfo.currentLesson)
				: null,
		lessons: sorted.slice(0, 6).map(toWidgetLesson),
		tomorrowFirstLesson: tomorrowFirst,
		completedCount: countCompleted(sorted, nowMinutes),
		totalCount: sorted.length,
	}
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `bun run test src/features/scheduleWidgets`
Expected: all payload tests PASS (existing + 2 new).

- [ ] **Step 5: Commit**

```bash
git add src/features/scheduleWidgets/lib/payload.ts src/features/scheduleWidgets/lib/__tests__/payload.test.ts
git commit -m "feat(widgets): add tomorrowFirstLesson and progress fields to widget payload"
```

---

## Task 2: Wire tomorrowLessons from store into widget sync

**Files:**
- Modify: `src/features/scheduleWidgets/lib/widgetBridge.ts`
- Modify: `src/features/scheduleReminders/hooks/useInitScheduleReminders.ts`

- [ ] **Step 1: Update `getScheduleWidgetPayload` signature in widgetBridge.ts**

Replace the export in `src/features/scheduleWidgets/lib/widgetBridge.ts`:

```typescript
export function getScheduleWidgetPayload(
	lessons: LessonItem[],
	tomorrowLessons: LessonItem[] = [],
): string {
	return JSON.stringify({
		...buildScheduleWidgetPayload(lessons, new Date(), tomorrowLessons),
		meta: {
			deepLinkUrl: widgetConfig.deepLinkScheduleUrl,
		},
	})
}
```

- [ ] **Step 2: Update `syncScheduleWidgets` signature**

In the same file, replace `syncScheduleWidgets`:

```typescript
export async function syncScheduleWidgets(
	lessons: LessonItem[],
	tomorrowLessons: LessonItem[] = [],
) {
	const store = useWidgetDebugStore.getState()
	reportEnvironment()

	store.setStage('building payload')
	const payload = getScheduleWidgetPayload(lessons, tomorrowLessons)

	store.setStage('writing file via Filesystem')
	await syncWidgetPayloadFile(payload)

	if (!WidgetBridge) {
		store.setStage('bridge unavailable')
		store.setResult(payload, null, 'web platform or plugin not registered')
		return
	}

	store.setStage('calling saveSchedule')
	try {
		const result = await withTimeout(
			WidgetBridge.saveSchedule({ payload }),
			5000,
			'saveSchedule',
		)
		store.setStage('saveSchedule resolved')
		store.setResult(payload, result as Record<string, unknown>, null)
	} catch (error) {
		store.setStage('saveSchedule failed')
		const msg = error instanceof Error ? error.message : JSON.stringify(error)
		store.setResult(payload, null, msg)
	}
}
```

- [ ] **Step 3: Update hook to pass tomorrow lessons**

In `src/features/scheduleReminders/hooks/useInitScheduleReminders.ts`, find the useEffect calling `syncScheduleWidgets(today)` (around line 48-57) and update:

```typescript
const days = useScheduleStore(s => s.days)

// ... inside the useEffect:
useEffect(() => {
	if (!hasHydrated || !isAuthenticated) return
	syncScheduleSnapshot(today)

	const todayStr = getTodayString()
	const tomorrowStr = (() => {
		const d = new Date(todayStr)
		d.setDate(d.getDate() + 1)
		return d.toISOString().slice(0, 10)
	})()
	const tomorrowLessons = days[tomorrowStr] ?? []

	syncScheduleWidgets(today, tomorrowLessons)
	if (!remindersEnabled) {
		cancelScheduledReminders()
		return
	}
	syncScheduleReminders(today)
}, [hasHydrated, isAuthenticated, remindersEnabled, today, days])
```

- [ ] **Step 4: Run full test suite and build**

Run: `bun run build`
Expected: successful build, no TS errors.

Run: `bun run test`
Expected: 108 tests PASS (no regressions).

- [ ] **Step 5: Commit**

```bash
git add src/features/scheduleWidgets/lib/widgetBridge.ts src/features/scheduleReminders/hooks/useInitScheduleReminders.ts
git commit -m "feat(widgets): pass tomorrow lessons to widget payload"
```

---

## Task 3: Android — new glow background drawables

**Files:**
- Create: `android/app/src/main/res/drawable/schedule_widget_glow_background.xml`
- Create: `android/app/src/main/res/drawable/schedule_widget_glow_overlay.xml`
- Create: `android/app/src/main/res/drawable/schedule_widget_card_bg.xml`
- Delete: `android/app/src/main/res/drawable/schedule_widget_background.xml` (after step 3)

- [ ] **Step 1: Create glow background (base gradient)**

Write `android/app/src/main/res/drawable/schedule_widget_glow_background.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <shape>
            <corners android:radius="24dp" />
            <gradient
                android:angle="270"
                android:startColor="#15171D"
                android:endColor="#1C1418"
                android:type="linear" />
        </shape>
    </item>
    <item android:bottom="-40dp" android:left="-40dp">
        <shape android:shape="oval">
            <gradient
                android:type="radial"
                android:gradientRadius="200dp"
                android:startColor="#38D50416"
                android:endColor="#00D50416" />
        </shape>
    </item>
    <item>
        <shape>
            <corners android:radius="24dp" />
            <stroke android:width="1dp" android:color="#14FFFFFF" />
            <solid android:color="#00000000" />
        </shape>
    </item>
</layer-list>
```

- [ ] **Step 2: Create inner card background**

Write `android/app/src/main/res/drawable/schedule_widget_card_bg.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <corners android:radius="16dp" />
    <solid android:color="#1AFFFFFF" />
</shape>
```

- [ ] **Step 3: Delete old background**

```bash
git rm android/app/src/main/res/drawable/schedule_widget_background.xml
```

- [ ] **Step 4: Commit**

```bash
git add android/app/src/main/res/drawable/
git commit -m "feat(android-widget): add glow background drawables"
```

---

## Task 4: Android — refresh existing medium widget layout

**Files:**
- Modify: `android/app/src/main/res/layout/schedule_widget.xml`

- [ ] **Step 1: Replace layout file content**

Replace `android/app/src/main/res/layout/schedule_widget.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@drawable/schedule_widget_glow_background"
    android:orientation="vertical"
    android:padding="16dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal">

        <TextView
            android:id="@+id/widget_title"
            android:layout_width="0dp"
            android:layout_weight="1"
            android:layout_height="wrap_content"
            android:text="РАСПИСАНИЕ"
            android:textColor="#A3FFFFFF"
            android:textSize="11sp"
            android:textStyle="bold"
            android:letterSpacing="0.05" />

        <TextView
            android:id="@+id/widget_badge"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Сегодня"
            android:textColor="#FFFFFF"
            android:textSize="10sp"
            android:textStyle="bold"
            android:paddingHorizontal="8dp"
            android:paddingVertical="3dp"
            android:background="@drawable/schedule_widget_card_bg" />
    </LinearLayout>

    <LinearLayout
        android:id="@+id/widget_next_card"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="10dp"
        android:orientation="vertical"
        android:padding="12dp"
        android:background="@drawable/schedule_widget_card_bg">

        <TextView
            android:id="@+id/widget_next_subject"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Математика"
            android:textColor="#FFFFFF"
            android:textSize="15sp"
            android:textStyle="bold"
            android:maxLines="1"
            android:ellipsize="end" />

        <TextView
            android:id="@+id/widget_next_time"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="2dp"
            android:text="09:00 - 10:30 · ауд. 101"
            android:textColor="#A3FFFFFF"
            android:textSize="11sp"
            android:maxLines="1"
            android:ellipsize="end" />
    </LinearLayout>

    <TextView
        android:id="@+id/widget_summary"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="10dp"
        android:text="До первой пары: 15 мин"
        android:textColor="#70FFFFFF"
        android:textSize="11sp" />

    <TextView
        android:id="@+id/widget_lesson_one"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="10dp"
        android:text=""
        android:textColor="#A3FFFFFF"
        android:textSize="11sp"
        android:maxLines="1"
        android:ellipsize="end" />

    <TextView
        android:id="@+id/widget_lesson_two"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:text=""
        android:textColor="#A3FFFFFF"
        android:textSize="11sp"
        android:maxLines="1"
        android:ellipsize="end" />

    <TextView
        android:id="@+id/widget_lesson_three"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:text=""
        android:textColor="#A3FFFFFF"
        android:textSize="11sp"
        android:maxLines="1"
        android:ellipsize="end" />

</LinearLayout>
```

- [ ] **Step 2: Commit**

```bash
git add android/app/src/main/res/layout/schedule_widget.xml
git commit -m "feat(android-widget): redesign medium widget layout with glow + card style"
```

---

## Task 5: Android — summary (small 2×2) widget provider + resources

**Files:**
- Create: `android/app/src/main/res/xml/schedule_summary_widget_info.xml`
- Create: `android/app/src/main/res/layout/schedule_summary_widget.xml`
- Create: `android/app/src/main/java/com/Dikroll/Journal/widgets/ScheduleSummaryWidgetProvider.java`
- Modify: `android/app/src/main/AndroidManifest.xml`

- [ ] **Step 1: Create provider info XML (2×2)**

Write `android/app/src/main/res/xml/schedule_summary_widget_info.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/schedule_summary_widget_description"
    android:initialLayout="@layout/schedule_summary_widget"
    android:minWidth="110dp"
    android:minHeight="110dp"
    android:previewLayout="@layout/schedule_summary_widget"
    android:resizeMode="none"
    android:targetCellWidth="2"
    android:targetCellHeight="2"
    android:updatePeriodMillis="0"
    android:widgetCategory="home_screen" />
```

- [ ] **Step 2: Add string resource**

Run to check strings file location:

```bash
grep -rn "schedule_widget_description" android/app/src/main/res/values/ 2>/dev/null
```

In `android/app/src/main/res/values/strings.xml`, add (near the existing `schedule_widget_description` entry):

```xml
<string name="schedule_summary_widget_description">Ближайшая пара и обратный отсчёт</string>
```

- [ ] **Step 3: Create summary layout**

Write `android/app/src/main/res/layout/schedule_summary_widget.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/summary_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@drawable/schedule_widget_glow_background"
    android:orientation="vertical"
    android:padding="14dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical">

        <TextView
            android:layout_width="0dp"
            android:layout_weight="1"
            android:layout_height="wrap_content"
            android:text="СЕГОДНЯ"
            android:textColor="#A3FFFFFF"
            android:textSize="10sp"
            android:textStyle="bold"
            android:letterSpacing="0.05" />

        <TextView
            android:id="@+id/summary_progress"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="0/0"
            android:textColor="#FFFFFF"
            android:textSize="10sp"
            android:textStyle="bold"
            android:paddingHorizontal="6dp"
            android:paddingVertical="2dp"
            android:background="@drawable/schedule_widget_card_bg" />
    </LinearLayout>

    <TextView
        android:id="@+id/summary_time"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="10dp"
        android:text="--:--"
        android:textColor="#FFFFFF"
        android:textSize="22sp"
        android:textStyle="bold" />

    <TextView
        android:id="@+id/summary_subject"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="2dp"
        android:text="Нет данных"
        android:textColor="#FFFFFF"
        android:textSize="13sp"
        android:textStyle="bold"
        android:maxLines="1"
        android:ellipsize="end" />

    <TextView
        android:id="@+id/summary_room"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text=""
        android:textColor="#A3FFFFFF"
        android:textSize="11sp"
        android:maxLines="1"
        android:ellipsize="end" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:orientation="vertical"
        android:gravity="bottom">

        <Chronometer
            android:id="@+id/summary_chrono"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:format="⏱ %s"
            android:textColor="#FFFFFF"
            android:textSize="12sp"
            android:textStyle="bold" />

        <TextView
            android:id="@+id/summary_fallback"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text=""
            android:textColor="#A3FFFFFF"
            android:textSize="11sp"
            android:maxLines="2"
            android:ellipsize="end"
            android:visibility="gone" />
    </LinearLayout>

</LinearLayout>
```

- [ ] **Step 4: Create summary provider Java class**

Write `android/app/src/main/java/com/Dikroll/Journal/widgets/ScheduleSummaryWidgetProvider.java`:

```java
package com.Dikroll.Journal.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.SystemClock;
import android.widget.RemoteViews;
import com.Dikroll.Journal.MainActivity;
import com.Dikroll.Journal.R;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import org.json.JSONObject;

public class ScheduleSummaryWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int id : appWidgetIds) {
            updateWidget(context.getApplicationContext(), appWidgetManager, id);
        }
    }

    public static void requestWidgetUpdate(Context context) {
        Context appContext = context.getApplicationContext();
        AppWidgetManager manager = AppWidgetManager.getInstance(appContext);
        ComponentName provider = new ComponentName(appContext, ScheduleSummaryWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(provider);
        if (ids == null || ids.length == 0) return;
        for (int id : ids) {
            updateWidget(appContext, manager, id);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.schedule_summary_widget);
        bindClick(context, views);

        String payload = readPayload(context);
        if (payload == null || payload.isEmpty()) {
            views.setTextViewText(R.id.summary_time, "--:--");
            views.setTextViewText(R.id.summary_subject, "Откройте приложение");
            views.setTextViewText(R.id.summary_room, "");
            views.setTextViewText(R.id.summary_progress, "0/0");
            views.setViewVisibility(R.id.summary_chrono, android.view.View.GONE);
            views.setViewVisibility(R.id.summary_fallback, android.view.View.VISIBLE);
            views.setTextViewText(R.id.summary_fallback, "Нет данных");
            manager.updateAppWidget(widgetId, views);
            return;
        }

        try {
            JSONObject root = new JSONObject(payload);
            int completed = root.optInt("completedCount", 0);
            int total = root.optInt("totalCount", 0);
            views.setTextViewText(R.id.summary_progress, completed + "/" + total);

            JSONObject next = root.optJSONObject("nextLesson");
            boolean isEmpty = root.optBoolean("isEmpty", false);

            if (next != null) {
                String startedAt = next.optString("startedAt", "--:--");
                String subject = next.optString("subject", "");
                String room = next.optString("room", "");

                views.setTextViewText(R.id.summary_time, startedAt);
                views.setTextViewText(R.id.summary_subject, subject);
                views.setTextViewText(R.id.summary_room,
                    room.isEmpty() ? "" : "ауд. " + room);

                long targetMs = parseLessonEpochMs(
                    next.optString("date", ""),
                    startedAt
                );
                if (targetMs > System.currentTimeMillis()) {
                    long base = SystemClock.elapsedRealtime() + (targetMs - System.currentTimeMillis());
                    views.setChronometer(R.id.summary_chrono, base, "⏱ %s", true);
                    views.setViewVisibility(R.id.summary_chrono, android.view.View.VISIBLE);
                    views.setViewVisibility(R.id.summary_fallback, android.view.View.GONE);
                } else {
                    views.setViewVisibility(R.id.summary_chrono, android.view.View.GONE);
                    views.setViewVisibility(R.id.summary_fallback, android.view.View.VISIBLE);
                    views.setTextViewText(R.id.summary_fallback, "Сейчас");
                }
            } else if (isEmpty) {
                views.setTextViewText(R.id.summary_time, "—");
                views.setTextViewText(R.id.summary_subject, "Выходной");
                views.setTextViewText(R.id.summary_room, "Можно выдохнуть");
                views.setViewVisibility(R.id.summary_chrono, android.view.View.GONE);
                views.setViewVisibility(R.id.summary_fallback, android.view.View.GONE);
            } else {
                JSONObject tomorrow = root.optJSONObject("tomorrowFirstLesson");
                if (tomorrow != null) {
                    views.setTextViewText(R.id.summary_time,
                        tomorrow.optString("startedAt", "--:--"));
                    views.setTextViewText(R.id.summary_subject,
                        "Завтра: " + tomorrow.optString("subject", ""));
                    String room = tomorrow.optString("room", "");
                    views.setTextViewText(R.id.summary_room,
                        room.isEmpty() ? "" : "ауд. " + room);
                    views.setViewVisibility(R.id.summary_chrono, android.view.View.GONE);
                    views.setViewVisibility(R.id.summary_fallback, android.view.View.VISIBLE);
                    views.setTextViewText(R.id.summary_fallback, "Готово на сегодня");
                } else {
                    views.setTextViewText(R.id.summary_time, "—");
                    views.setTextViewText(R.id.summary_subject, "Пары закончились");
                    views.setTextViewText(R.id.summary_room, "");
                    views.setViewVisibility(R.id.summary_chrono, android.view.View.GONE);
                    views.setViewVisibility(R.id.summary_fallback, android.view.View.GONE);
                }
            }
        } catch (Exception error) {
            views.setTextViewText(R.id.summary_time, "--:--");
            views.setTextViewText(R.id.summary_subject, "Ошибка");
            views.setTextViewText(R.id.summary_room, "");
            views.setViewVisibility(R.id.summary_chrono, android.view.View.GONE);
            views.setViewVisibility(R.id.summary_fallback, android.view.View.GONE);
        }

        manager.updateAppWidget(widgetId, views);
    }

    private static long parseLessonEpochMs(String date, String time) {
        try {
            String[] dateParts = date.split("-");
            String[] timeParts = time.split(":");
            if (dateParts.length != 3 || timeParts.length < 2) return 0;
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.set(
                Integer.parseInt(dateParts[0]),
                Integer.parseInt(dateParts[1]) - 1,
                Integer.parseInt(dateParts[2]),
                Integer.parseInt(timeParts[0]),
                Integer.parseInt(timeParts[1]),
                0
            );
            cal.set(java.util.Calendar.MILLISECOND, 0);
            return cal.getTimeInMillis();
        } catch (Exception e) {
            return 0;
        }
    }

    private static String readPayload(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(
            ScheduleWidgetProvider.PREFERENCES_NAME, Context.MODE_PRIVATE);
        String payload = prefs.getString(ScheduleWidgetProvider.PAYLOAD_KEY, null);
        if (payload != null && !payload.isEmpty()) return payload;

        File file = new File(context.getFilesDir(), "widgets/schedule-payload.json");
        if (!file.exists()) return null;
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            return sb.toString();
        } catch (Exception ignored) {
            return null;
        }
    }

    private static void bindClick(Context context, RemoteViews views) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setData(Uri.parse("journal-v://schedule"));
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
            | Intent.FLAG_ACTIVITY_CLEAR_TOP
            | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pending = PendingIntent.getActivity(
            context, 1002, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.summary_root, pending);
    }
}
```

- [ ] **Step 5: Register provider in manifest**

Add inside the `<application>` tag of `android/app/src/main/AndroidManifest.xml`, right after the existing `ScheduleWidgetProvider` receiver:

```xml
<receiver
    android:name=".widgets.ScheduleSummaryWidgetProvider"
    android:exported="true"
    android:permission="android.permission.BIND_APPWIDGET">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/schedule_summary_widget_info" />
</receiver>
```

- [ ] **Step 6: Update `WidgetBridgePlugin.java` to also refresh summary provider**

Modify `android/app/src/main/java/com/Dikroll/Journal/WidgetBridgePlugin.java` — inside `saveSchedule`, after the existing `ScheduleWidgetProvider.requestWidgetUpdate(...)` call add:

```java
com.Dikroll.Journal.widgets.ScheduleSummaryWidgetProvider.requestWidgetUpdate(
    getContext().getApplicationContext()
);
```

Same addition inside `clearSchedule`.

- [ ] **Step 7: Build Android to verify compilation**

Run: `cd android && ./gradlew assembleDebug 2>&1 | tail -20 && cd ..`
Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 8: Commit**

```bash
git add android/
git commit -m "feat(android-widget): add 2x2 summary widget with live chronometer"
```

---

## Task 6: iOS — remove old countdown widget & refresh chrome

**Files:**
- Modify: `ios/App/ScheduleWidget/ScheduleWidget.swift`
- Modify: `ios/App/ScheduleWidget/ScheduleWidgetBundle.swift`

- [ ] **Step 1: Remove countdown widget from bundle**

Replace `ios/App/ScheduleWidget/ScheduleWidgetBundle.swift`:

```swift
import WidgetKit
import SwiftUI

@main
struct ScheduleWidgetBundle: WidgetBundle {
    var body: some Widget {
        ScheduleWidget()
        ScheduleSummaryWidget()
    }
}
```

- [ ] **Step 2: Replace WidgetChrome and delete old countdown widget**

In `ios/App/ScheduleWidget/ScheduleWidget.swift`, replace the entire `WidgetChrome` struct with:

```swift
struct WidgetChrome<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        Group {
            if #available(iOSApplicationExtension 17.0, *) {
                ZStack {
                    glowOverlay
                    content.padding(16)
                }
                .containerBackground(baseGradient, for: .widget)
            } else {
                ZStack {
                    baseGradient
                    glowOverlay
                    content.padding(16)
                }
            }
        }
    }

    private var baseGradient: LinearGradient {
        LinearGradient(
            gradient: Gradient(colors: [
                Color(red: 0.082, green: 0.090, blue: 0.110),
                Color(red: 0.110, green: 0.078, blue: 0.094)
            ]),
            startPoint: .top,
            endPoint: .bottom
        )
    }

    private var glowOverlay: some View {
        ZStack {
            RadialGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.836, green: 0.016, blue: 0.086).opacity(0.22),
                    .clear
                ]),
                center: UnitPoint(x: 0.15, y: 1.05),
                startRadius: 0,
                endRadius: 220
            )
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .stroke(Color.white.opacity(0.08), lineWidth: 1)
        }
    }
}
```

- [ ] **Step 3: Delete the `ScheduleCountdownEntry`, `ScheduleCountdownProvider`, `ScheduleCountdownWidgetView`, `ScheduleCountdownWidget` types**

In `ios/App/ScheduleWidget/ScheduleWidget.swift`, find and remove:
- `struct ScheduleCountdownEntry: TimelineEntry { ... }`
- `struct ScheduleCountdownProvider: TimelineProvider { ... }`
- `struct ScheduleCountdownWidgetView: View { ... }`
- `struct ScheduleCountdownWidget: Widget { ... }`

Leave `ScheduleWidget`, `ScheduleListProvider`, `ScheduleListWidgetView`, `ScheduleListEntry` intact.

- [ ] **Step 4: Update `SchedulePayload` struct for new fields**

In `ios/App/ScheduleWidget/ScheduleWidget.swift`, replace the `SchedulePayload` struct:

```swift
struct SchedulePayload: Decodable {
    struct Lesson: Decodable, Identifiable {
        let lesson: Int
        let subject: String
        let room: String
        let teacher: String
        let startedAt: String
        let finishedAt: String
        let date: String

        var id: String { "\(date)-\(lesson)" }
    }

    let date: String
    let savedAt: Int
    let summary: String
    let isEmpty: Bool
    let nextLesson: Lesson?
    let lessons: [Lesson]
    let tomorrowFirstLesson: Lesson?
    let completedCount: Int
    let totalCount: Int
}
```

- [ ] **Step 5: Commit**

```bash
git add ios/App/ScheduleWidget/ScheduleWidget.swift ios/App/ScheduleWidget/ScheduleWidgetBundle.swift
git commit -m "feat(ios-widget): remove countdown widget, refresh chrome with glow"
```

---

## Task 7: iOS — create ScheduleSummaryWidget (small, live timer)

**Files:**
- Create: `ios/App/ScheduleWidget/ScheduleSummaryWidget.swift`

- [ ] **Step 1: Create the summary widget file**

Write `ios/App/ScheduleWidget/ScheduleSummaryWidget.swift`:

```swift
import WidgetKit
import SwiftUI

struct ScheduleSummaryEntry: TimelineEntry {
    let date: Date
    let state: ScheduleLoadState
    let nextLessonDate: Date?
}

struct ScheduleSummaryProvider: TimelineProvider {
    func placeholder(in context: Context) -> ScheduleSummaryEntry {
        ScheduleSummaryEntry(
            date: Date(),
            state: ScheduleLoadState(payload: nil, source: .none, debugMessage: nil),
            nextLessonDate: nil
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (ScheduleSummaryEntry) -> Void) {
        let state = ScheduleWidgetStore.loadState()
        completion(
            ScheduleSummaryEntry(
                date: Date(),
                state: state,
                nextLessonDate: ScheduleWidgetStore.lessonDate(for: state.payload?.nextLesson)
            )
        )
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ScheduleSummaryEntry>) -> Void) {
        let state = ScheduleWidgetStore.loadState()
        let now = Date()
        let nextDate = ScheduleWidgetStore.lessonDate(for: state.payload?.nextLesson)
        let entry = ScheduleSummaryEntry(date: now, state: state, nextLessonDate: nextDate)

        // Refresh 1 min after next lesson start (so UI flips from "countdown" to "now" / next),
        // or in 30 minutes otherwise.
        let refresh: Date = {
            if let nextDate = nextDate, nextDate > now {
                return nextDate.addingTimeInterval(60)
            }
            return now.addingTimeInterval(30 * 60)
        }()

        completion(Timeline(entries: [entry], policy: .after(refresh)))
    }
}

struct SummaryProgressBadge: View {
    let completed: Int
    let total: Int

    var body: some View {
        Text("\(completed)/\(total)")
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(.white)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.white.opacity(0.10))
            )
    }
}

struct ScheduleSummaryWidgetView: View {
    let entry: ScheduleSummaryEntry

    private var payload: SchedulePayload? { entry.state.payload }

    var body: some View {
        WidgetChrome {
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .center) {
                    Text("СЕГОДНЯ")
                        .font(.system(size: 10, weight: .bold))
                        .tracking(0.5)
                        .foregroundColor(Color.white.opacity(0.64))
                    Spacer()
                    SummaryProgressBadge(
                        completed: payload?.completedCount ?? 0,
                        total: payload?.totalCount ?? 0
                    )
                }

                Spacer(minLength: 8)

                if let next = payload?.nextLesson {
                    mainBlock(time: next.startedAt, subject: next.subject, room: next.room)

                    Spacer(minLength: 6)

                    if let nextLessonDate = entry.nextLessonDate, nextLessonDate > Date() {
                        HStack(spacing: 4) {
                            Text("⏱")
                            Text(nextLessonDate, style: .timer)
                        }
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    } else {
                        Text("Сейчас")
                            .font(.system(size: 12, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                    }
                } else if payload?.isEmpty == true {
                    mainBlock(time: "—", subject: "Выходной", room: "Можно выдохнуть")
                    Spacer(minLength: 6)
                    Text("")
                } else if let tomorrow = payload?.tomorrowFirstLesson {
                    mainBlock(
                        time: tomorrow.startedAt,
                        subject: "Завтра: \(tomorrow.subject)",
                        room: tomorrow.room
                    )
                    Spacer(minLength: 6)
                    Text("Готово на сегодня")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(Color.white.opacity(0.68))
                } else {
                    mainBlock(time: "—", subject: "Пары закончились", room: "")
                    Spacer(minLength: 6)
                    Text("")
                }
            }
        }
        .widgetURL(URL(string: "journal-v://schedule"))
    }

    private func mainBlock(time: String, subject: String, room: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(time)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(.white)
            Text(subject)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(1)
            if !room.isEmpty {
                Text("ауд. \(room)")
                    .font(.system(size: 11))
                    .foregroundColor(Color.white.opacity(0.64))
                    .lineLimit(1)
            }
        }
    }
}

struct ScheduleSummaryWidget: Widget {
    let kind: String = "ScheduleSummaryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ScheduleSummaryProvider()) { entry in
            ScheduleSummaryWidgetView(entry: entry)
        }
        .configurationDisplayName("Сводка дня")
        .description("Следующая пара, прогресс дня и live-таймер.")
        .supportedFamilies([.systemSmall])
    }
}
```

- [ ] **Step 2: Add Swift file to Xcode project**

The widget folder uses `PBXFileSystemSynchronizedRootGroup` (confirmed in `project.pbxproj` line 83), so new Swift files added under `ios/App/ScheduleWidget/` are auto-included. No pbxproj edit needed.

Verify by checking `ios/App/ScheduleWidget/` contents:

```bash
ls ios/App/ScheduleWidget/
```

Expected: file `ScheduleSummaryWidget.swift` appears among the listing.

- [ ] **Step 3: Update iOS plugin to reload new summary widget**

Modify `ios/App/App/WidgetBridgePlugin.swift` — replace the `reloadWidgets` function body:

```swift
private func reloadWidgets() {
    WidgetCenter.shared.reloadTimelines(ofKind: "ScheduleWidget")
    WidgetCenter.shared.reloadTimelines(ofKind: "ScheduleSummaryWidget")
    WidgetCenter.shared.reloadAllTimelines()
}
```

- [ ] **Step 4: Update `ScheduleWidget` configuration display info (polish)**

In `ios/App/ScheduleWidget/ScheduleWidget.swift`, update the `ScheduleWidget` struct:

```swift
struct ScheduleWidget: Widget {
    let kind: String = "ScheduleWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ScheduleListProvider()) { entry in
            ScheduleListWidgetView(entry: entry)
        }
        .configurationDisplayName("Расписание")
        .description("Все пары на сегодня в стиле Journal-v.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add ios/App/ScheduleWidget/ScheduleSummaryWidget.swift ios/App/ScheduleWidget/ScheduleWidget.swift ios/App/App/WidgetBridgePlugin.swift
git commit -m "feat(ios-widget): add systemSmall summary widget with live timer"
```

---

## Task 8: iOS — polish medium/large list widget view to match new visual language

**Files:**
- Modify: `ios/App/ScheduleWidget/ScheduleWidget.swift`

- [ ] **Step 1: Update `LessonRow` to align with new visual style**

In `ios/App/ScheduleWidget/ScheduleWidget.swift`, replace `LessonRow`:

```swift
struct LessonRow: View {
    let lesson: SchedulePayload.Lesson
    let highlight: Bool

    var body: some View {
        HStack(alignment: .center, spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                Text(lesson.startedAt)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                Text(lesson.finishedAt)
                    .font(.system(size: 10))
                    .foregroundColor(Color.white.opacity(0.44))
            }
            .frame(width: 44, alignment: .leading)

            Rectangle()
                .fill(highlight ? Color(red: 0.836, green: 0.016, blue: 0.086) : Color.white.opacity(0.18))
                .frame(width: 3, height: 30)
                .clipShape(Capsule())

            VStack(alignment: .leading, spacing: 2) {
                Text(lesson.subject)
                    .font(.system(size: 13, weight: highlight ? .bold : .semibold))
                    .foregroundColor(.white)
                    .lineLimit(1)

                Text(lesson.room.isEmpty ? lesson.teacher : "ауд. \(lesson.room)")
                    .font(.system(size: 11))
                    .foregroundColor(Color.white.opacity(0.64))
                    .lineLimit(1)
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(highlight ? Color.white.opacity(0.14) : Color.white.opacity(0.06))
        )
    }
}
```

- [ ] **Step 2: Update `WidgetHeader` to match new look**

In `ios/App/ScheduleWidget/ScheduleWidget.swift`, replace `WidgetHeader`:

```swift
struct WidgetHeader: View {
    let title: String
    let badge: String

    var body: some View {
        HStack(alignment: .center) {
            Text(title)
                .font(.system(size: 11, weight: .bold))
                .tracking(0.5)
                .foregroundColor(Color.white.opacity(0.64))

            Spacer(minLength: 8)

            Text(badge)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(.white)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(Color.white.opacity(0.10))
                )
        }
    }
}
```

- [ ] **Step 3: Update `ScheduleListWidgetView` title string to uppercase-styled**

In `ios/App/ScheduleWidget/ScheduleWidget.swift`, inside `ScheduleListWidgetView.body`, change the `WidgetHeader(title:...)` call:

```swift
WidgetHeader(
    title: "РАСПИСАНИЕ",
    badge: entry.state.payload?.isEmpty == true ? "Выходной" : "Сегодня"
)
```

- [ ] **Step 4: Commit**

```bash
git add ios/App/ScheduleWidget/ScheduleWidget.swift
git commit -m "style(ios-widget): align list widget typography with new visual language"
```

---

## Task 9: Full build verification

**Files:** none (verification only)

- [ ] **Step 1: JS build + tests**

Run: `bun run build && bun run test`
Expected: 
- build: `✓ built in ...`
- tests: all PASS.

- [ ] **Step 2: Android compilation**

Run: `cd android && ./gradlew assembleDebug 2>&1 | tail -5 && cd ..`
Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 3: Capacitor sync**

Run: `npx cap sync ios android 2>&1 | tail -10`
Expected: `✔ Sync finished`.

- [ ] **Step 4: Manual iOS smoke (user)**

Instructions for user:
1. Run `npx cap open ios` → build and run on iPhone.
2. Add "Сводка дня" widget (systemSmall) to home screen.
3. Add "Расписание" widget (systemMedium) to home screen.
4. Verify:
   - Both widgets show glow background (no Circle artifacts).
   - Summary widget shows time, subject, room, progress badge, and live ticking timer.
   - Timer counts down every second without reload.
   - List widget shows all lessons with highlight on next.

- [ ] **Step 5: Manual Android smoke (user)**

Instructions for user:
1. Run `npx cap open android` → install debug APK.
2. Add both widgets from launcher widget picker:
   - "Ближайшая пара и обратный отсчёт" (2×2 summary).
   - Existing schedule widget (medium).
3. Verify:
   - Glow background renders on both.
   - Summary shows Chronometer ticking down every second.
   - Taps open the app and land on schedule page.

- [ ] **Step 6: Final commit (if any fixes needed during smoke)**

```bash
git add -A
git commit -m "chore(widgets): polish after manual smoke testing"
```

---

## Out of scope for this plan (explicitly deferred)

- **Grades widget** (average grade, grade count) — separate plan once schedule widgets are polished.
- **Live Activities / Dynamic Island** — separate plan.
- **Widget configuration** (intent-based, user picks what's shown) — not requested.

## Self-Review Notes

- Spec coverage check: glow background ✓ (Task 3, 6); identical design cross-platform ✓ (Task 4, 5 Android — Task 6, 7, 8 iOS using same hex/radius/typography); small widget with summary ✓ (Task 5, 7); "done for today → tomorrow first" (option A) ✓ (Task 1 payload + Task 5 Android + Task 7 iOS); countdown only "before next lesson start" ✓ (Task 5, 7); compromise on gradient-only Android glow ✓ (Task 3).
- Live countdown: Android `Chronometer` ticks without updates (Task 5); iOS `Text(date, style: .timer)` ticks without reload (Task 7). No reload-budget concerns.
- No placeholders; all code shown inline.
