package com.Dikroll.Journal.widgets;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import org.json.JSONObject;

/**
 * Schedules the next widget wake-up via AlarmManager. We prefer the nearest
 * schedule transition (lesson start/end) and fall back to midnight rollover.
 */
public class WidgetMidnightScheduler extends BroadcastReceiver {
    private static final String ACTION_REFRESH = "com.Dikroll.Journal.widgets.MIDNIGHT_REFRESH";
    private static final int REQUEST_CODE = 4242;

    private static final long ONE_MINUTE_MS = 60_000L;
    private static final long FIVE_MINUTES_MS = 5 * ONE_MINUTE_MS;

    public static void schedule(Context context) {
        Context appContext = context.getApplicationContext();
        AlarmManager alarmManager = (AlarmManager) appContext.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(appContext, WidgetMidnightScheduler.class);
        intent.setAction(ACTION_REFRESH);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pending = PendingIntent.getBroadcast(
            appContext, REQUEST_CODE, intent, flags
        );

        long triggerAt = computeNextTriggerAt(appContext);
        scheduleExactOrFallback(alarmManager, triggerAt, pending);
    }

    private static void scheduleExactOrFallback(
        AlarmManager alarmManager, long triggerAt, PendingIntent pending
    ) {
        boolean canExact = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            canExact = alarmManager.canScheduleExactAlarms();
        }
        try {
            if (canExact && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP, triggerAt, pending);
                return;
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP, triggerAt, pending);
                return;
            }
            alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, pending);
        } catch (SecurityException ignored) {
            alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, pending);
        }
    }

    private static long computeNextTriggerAt(Context context) {
        long now = System.currentTimeMillis();
        String payload = ScheduleWidgetProvider.readPayload(context);
        long midnight = WidgetSnapshotHelper.nextMidnightMs(now);
        if (payload == null || payload.isEmpty()) {
            return Math.min(midnight, now + 30 * ONE_MINUTE_MS);
        }

        try {
            JSONObject root = new JSONObject(payload);
            long boundary = WidgetSnapshotHelper.nextRefreshMs(root, now);
            long candidate = boundary > now ? boundary : midnight;

            // While inside an active school window, keep a minute-level
            // backstop so the widget never drifts past a lesson boundary
            // even when AlarmManager is throttled.
            WidgetSnapshotHelper.TodaySnapshot snap =
                WidgetSnapshotHelper.build(root, now);
            if (snap.currentLesson != null) {
                candidate = Math.min(candidate, now + ONE_MINUTE_MS);
            } else if (snap.nextLesson != null) {
                long startMs = WidgetSnapshotHelper.lessonEpochMs(
                    snap.nextLesson, "startedAt");
                long delta = startMs - now;
                if (delta <= FIVE_MINUTES_MS) {
                    candidate = Math.min(candidate, now + ONE_MINUTE_MS);
                } else if (delta <= 30 * ONE_MINUTE_MS) {
                    candidate = Math.min(candidate, now + 5 * ONE_MINUTE_MS);
                }
            }
            return candidate;
        } catch (Exception ignored) {
            return midnight;
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!ACTION_REFRESH.equals(intent.getAction())) return;
        Context appContext = context.getApplicationContext();

        ScheduleWidgetProvider.requestWidgetUpdate(appContext);
        ScheduleSummaryWidgetProvider.requestWidgetUpdate(appContext);
        GoalsSummaryWidgetProvider.requestWidgetUpdate(appContext);

        schedule(appContext);
    }
}
